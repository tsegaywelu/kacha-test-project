import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import type { RootState } from './types/redux';
import './App.css';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
  return accessToken ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/checkout" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
