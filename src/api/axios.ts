import axios from "axios";

const api = axios.create({
});

// Attach token automatically
api.interceptors.request.use((config) => {
  
  const token = localStorage.getItem("token");
  if (token) {
    config.withCredentials = true;
    config.headers.Authorization = `Bearer ${token}`;
  }
  

  return config;
});

export default api;