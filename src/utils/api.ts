const getBaseUrl = () => {
  // If running in a browser
  if (typeof window !== 'undefined') {
    // If we're in production mode (the domain isn't localhost:someport)
    // or if we want to support relative paths when served from the same server
    if (window.location.hostname !== 'localhost' || window.location.port !== '5173') {
      return ''; // Use relative URL
    }
    return 'http://localhost:3000'; // Development API
  }

  // Default Android Emulator bridge to host localhost
  return 'http://10.0.2.2:3000';
};

export const API_BASE_URL = getBaseUrl();

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'API request failed');
  }

  return response.json();
};
