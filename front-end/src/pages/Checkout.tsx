import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/user/user.slice';
import type { PaymentStatus } from '../types/payment';
import type { RootState, AppDispatch } from '../types/redux';
import Button from '../components/Button';
import Layout from '../components/Layout';
import { API_ENDPOINTS } from '../config/api';
const DEFAULT_ORDER_ID_PREFIX = 'ORDER-';
const INITIAL_ORDER_NUMBER = 123;
const DEFAULT_AMOUNT = 250;
const DEFAULT_CURRENCY = 'ETB';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
  const [orderNumber, setOrderNumber] = useState<number>(INITIAL_ORDER_NUMBER);
  const [amount, setAmount] = useState<string>(DEFAULT_AMOUNT.toString());
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [status, setStatus] = useState<PaymentStatus>('IDLE');
  const [reference, setReference] = useState<string | null>(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const pendingPaymentRef = useRef(false);

  const orderId = `${DEFAULT_ORDER_ID_PREFIX}${orderNumber}`;

  useEffect(() => {
    const token = accessToken;
    if (!token) {
      return;
    }

    const socket = io(API_ENDPOINTS.SOCKET, {
      auth: {
        token: `Bearer ${token}`,
      },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected');
      setIsConnected(true);
      setErrorReason(null);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setIsConnected(false);
      if (error.message.includes('Authentication')) {
        setErrorReason('Authentication failed. Please login again.');
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else {
        setErrorReason('Connection failed. Please try again.');
      }
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [accessToken]);

  const sendPaymentInit = () => {
    if (socketRef.current && socketRef.current.connected) {
      const amountValue = parseFloat(amount) || 0;
      const paymentData = {
        orderId: orderId,
        amount: amountValue,
        currency: currency,
      };

      socketRef.current.emit('payment', paymentData);
      setStatus('PENDING');
      setErrorReason(null);
      setReference(null);
      pendingPaymentRef.current = false;

      const eventName = `payment.${orderId}`;
      
      const timeout = setTimeout(() => {
        setStatus('FAILED');
        setErrorReason('Payment timeout. No response from server.');
      }, 10000);

      socketRef.current.once(eventName, (response: any) => {
        clearTimeout(timeout);
        if (response.status === 'success') {
          setStatus('SUCCESS');
          setReference(response.transactionId);
          setErrorReason(null);
          setOrderNumber((prev) => prev + 1);
        } else if (response.status === 'error') {
          setStatus('FAILED');
          setErrorReason(response.message || 'Payment failed');
          setReference(null);
        }
      });
    }
  };

  const handlePayNow = () => {
    if (!socketRef.current) {
      setErrorReason('Socket not initialized. Please refresh the page.');
      return;
    }
    
    if (!socketRef.current.connected) {
      setErrorReason('Not connected to server. Please wait...');
      return;
    }
    
    sendPaymentInit();
  };

  const handleReset = () => {
    setStatus('IDLE');
    setReference(null);
    setErrorReason(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    navigate('/login');
  };

  return (
    <Layout>
      <div className="bg-white rounded-2xl p-10 shadow-2xl max-w-md w-full animate-fade-in">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-semibold text-gray-800">Checkout</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-600">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="danger"
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="mb-8 p-5 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
            <span className="font-semibold text-gray-600 text-sm min-w-[100px]">Order ID:</span>
            <span className="font-medium text-gray-800">{orderId}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
            <label className="font-semibold text-gray-600 text-sm min-w-[100px]" htmlFor="amount">
              Amount:
            </label>
            <input
              id="amount"
              type="text"
              className="px-3 py-2 border-2 border-gray-200 rounded-md text-base font-medium text-gray-800 bg-white focus:outline-none focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 min-w-[200px]"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setAmount(value);
                }
              }}
              placeholder="Enter amount"
              disabled={status !== 'IDLE'}
            />
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
            <label className="font-semibold text-gray-600 text-sm min-w-[100px]" htmlFor="currency">
              Currency:
            </label>
            <input
              id="currency"
              type="text"
              className="px-3 py-2 border-2 border-gray-200 rounded-md text-base font-medium text-gray-800 bg-white focus:outline-none focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 min-w-[200px]"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={status !== 'IDLE'}
            />
          </div>
        </div>

        <div className="mt-8">
          {status === 'IDLE' && (
            <Button
              onClick={handlePayNow}
              variant="primary"
              fullWidth
            >
              Pay Now
            </Button>
          )}

          {status === 'PENDING' && (
            <div className="flex flex-col items-center py-8 px-5 rounded-lg bg-yellow-50 text-yellow-800 text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-yellow-600 rounded-full animate-spin mb-4"></div>
              <p className="text-base">Processing payment...</p>
            </div>
          )}

          {status === 'SUCCESS' && reference && (
            <div className="flex flex-col items-center py-8 px-5 rounded-lg bg-green-50 text-green-800 text-center">
              <div className="w-15 h-15 rounded-full bg-green-500 text-white flex items-center justify-center text-3xl font-bold mb-4 w-16 h-16">
                ✓
              </div>
              <p className="text-xl font-semibold mb-2">Payment Successful!</p>
              <p className="text-sm opacity-90 mb-4">Reference: {reference}</p>
              <Button
                onClick={handleReset}
                variant="secondary"
                className="mt-3"
              >
                Try Another Payment
              </Button>
            </div>
          )}

          {status === 'FAILED' && errorReason && (
            <div className="flex flex-col items-center py-8 px-5 rounded-lg bg-red-50 text-red-800 text-center">
              <div className="w-15 h-15 rounded-full bg-red-500 text-white flex items-center justify-center text-3xl font-bold mb-4 w-16 h-16">
                X
              </div>
              <p className="text-xl font-semibold mb-2">Payment Failed</p>
              <p className="text-sm opacity-90 mb-4">Reason: {errorReason}</p>
              <Button
                onClick={handleReset}
                variant="secondary"
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
