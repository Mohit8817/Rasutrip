// src/utils/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
    baseURL: "https://api.rasutrip.com/api/v1", // tumhara main API base URL
    timeout: 10000 // 10 seconds
});

// Error logging function
async function logErrorToServer(error) {
    try {
        await axios.post("https://api.rasutrip.com/api/v1/logs/error", {
            endpoint: error.config?.url || "",
            method: error.config?.method || "",
            status: error.response?.status || null,
            message: error.message || "Unknown error",
            requestData: error.config?.data || null,
            responseData: error.response?.data || null,
            time: new Date().toISOString()
        });
    } catch (logErr) {
        console.error("Failed to log error:", logErr.message);
    }
}

// Axios interceptor for errors
axiosClient.interceptors.response.use(
    response => response,
    async error => {
        await logErrorToServer(error);
        return Promise.reject(error);
    }
);

export default axiosClient;
