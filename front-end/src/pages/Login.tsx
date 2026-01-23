import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/user/user.slice';
import type { AppDispatch } from '../types/redux';
import Button from '../components/Button';
import Input from '../components/Input';
import Layout from '../components/Layout';
import { API_ENDPOINTS } from '../config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      dispatch(setToken(data.token));
      navigate('/checkout');
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-white rounded-xl p-10 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          {error && (
            <div className="bg-red-50 text-red-700 px-3 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            loading={loading}
            loadingText="Logging in..."
            className="mt-2.5"
          >
            Login
          </Button>
        </form>
        <p className="text-center mt-5 text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-500 no-underline font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default Login;
