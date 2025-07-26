// src/utils/axiosInstance.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://api.rasutrip.com/api/v1", // ✅ Correct way
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
