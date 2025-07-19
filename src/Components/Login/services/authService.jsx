// src/services/authService.js
import API from '../utils/axiosInstance';

// Login or Signup with mobile/email
export const signupOrLogin = (data) => API.post('/user/signup-login', data);

// OTP Verification
export const verifyOtp = (data) => API.post('/user/verify-otp', data);

// Set MPIN 
export const createMPIN = (data) => API.post('/user/create-mpin', data);

// Complete Signup 
// export const completeSignup = (data) => API.post('/user/complete-signup', data);

export const completeSignup = (data, token) =>
  API.post('/user/complete-signup', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

