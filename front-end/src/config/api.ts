export const API_URL = import.meta.env.VITE_API_URL 

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/api/auth/login`,
    REGISTER: `${API_URL}/api/auth/register`,
  },
  SOCKET: 'ws://localhost:8080',
};

