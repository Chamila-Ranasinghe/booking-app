import axios from "axios";

const api = axios.create({
});

// Attach token automatically
api.interceptors.request.use((config) => {
  config.withCredentials = true;
  const token = localStorage.getItem("token");
  if (token) {
    
    config.headers.Authorization = `Bearer ${token}`;
  }
  

  return config;
});

export default api;