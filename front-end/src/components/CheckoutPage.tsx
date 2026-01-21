import { useEffect, useState, useRef } from 'react';
import type { PaymentStatus, PaymentStatusMessage } from '../types/payment';
import './CheckoutPage.css';

const WS_URL = 'ws://localhost:8080';
const DEFAULT_ORDER_ID_PREFIX = 'ORDER-';
const INITIAL_ORDER_NUMBER = 123;
const DEFAULT_AMOUNT = 250;
const DEFAULT_CURRENCY = 'ETB';

const CheckoutPage = () => {
  const [orderNumber, setOrderNumber] = useState<number>(INITIAL_ORDER_NUMBER);
  const [amount, setAmount] = useState<string>(DEFAULT_AMOUNT.toString());
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [status, setStatus] = useState<PaymentStatus>('IDLE');
  const [reference, setReference] = useState<string | null>(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pendingPaymentRef = useRef(false);

  const orderId = `${DEFAULT_ORDER_ID_PREFIX}${orderNumber}`;

  useEffect(() => {
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const sendPaymentInit = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const amountValue = parseFloat(amount) || 0;
      const message = {
        type: 'INIT_PAYMENT' as const,
        orderId: orderId,
        amount: amountValue,
        currency: currency,
      };
      
      wsRef.current.send(JSON.stringify(message));
      setStatus('PENDING');
      setErrorReason(null);
      setReference(null);
      pendingPaymentRef.current = false;
    }
  };

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      sendPaymentInit();
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      
      pendingPaymentRef.current = true;
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);
      pendingPaymentRef.current = true;

      ws.onopen = () => {
        console.log('WebSocket connected');
        if (pendingPaymentRef.current) {
          sendPaymentInit();
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: PaymentStatusMessage = JSON.parse(event.data);
          
          if (message.type === 'PAYMENT_STATUS') {
            setStatus(message.status);
            
            if (message.status === 'SUCCESS' && message.reference) {
              setReference(message.reference);
              setErrorReason(null);
              // incrementing order id after successful payment
              setOrderNumber((prev) => prev + 1);
            } else if (message.status === 'FAILED' && message.reason) {
              setErrorReason(message.reason);
              setReference(null);
            } else if (message.status === 'PENDING') {
              setErrorReason(null);
              setReference(null);
            }
          }
        } catch (error) {
          console.error('error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('wbSocket error:', error);
        pendingPaymentRef.current = false;
      };

      ws.onclose = () => {
        console.log('webSocket closed');
        pendingPaymentRef.current = false;
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      pendingPaymentRef.current = false;
    }
  };

  const handlePayNow = () => {
    connectWebSocket();
  };

  const handleReset = () => {
    setStatus('IDLE');
    setReference(null);
    setErrorReason(null);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h1 className="checkout-title">Checkout</h1>
        
        <div className="order-details">
          <div className="detail-row">
            <span className="detail-label">Order ID:</span>
            <span className="detail-value">{orderId}</span>
          </div>
          <div className="detail-row">
            <label className="detail-label" htmlFor="amount">Amount:</label>
            <input
              id="amount"
              type="text"
              className="detail-input"
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
          <div className="detail-row">
            <label className="detail-label" htmlFor="currency">Currency:</label>
            <input
              id="currency"
              type="text"
              className="detail-input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={status !== 'IDLE'}
            />
          </div>
        </div>

        <div className="payment-status-section">
          {status === 'IDLE' && (
            <button 
              className="pay-button"
              onClick={handlePayNow}
            >
              Pay Now
            </button>
          )}

          {status === 'PENDING' && (
            <div className="status-message status-pending">
              <div className="spinner"></div>
              <p>Processing payment...</p>
            </div>
          )}

          {status === 'SUCCESS' && reference && (
            <div className="status-message status-success">
              <div className="success-icon">✓</div>
              <p className="status-title">Payment Successful!</p>
              <p className="status-detail">Reference: {reference}</p>
              <button className="reset-button" onClick={handleReset}>
                Try Another Payment
              </button>
            </div>
          )}

          {status === 'FAILED' && errorReason && (
            <div className="status-message status-failed">
              <div className="error-icon">X</div>
              <p className="status-title">Payment Failed</p>
              <p className="status-detail">Reason: {errorReason}</p>
              <button className="reset-button" onClick={handleReset}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

