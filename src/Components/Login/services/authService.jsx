// src/services/authService.js
import API from '../utils/axiosInstance';

// Login or Signup with mobile/email
export const signupOrLogin = (data) => API.post('/user/signup-login', data);

// OTP Verification
export const verifyOtp = (data) => API.post('/user/verify-otp', data);

// Set MPIN
export const createMPIN = (data) => API.post('/user/create-mpin', data);

// Complete Signup (without token)
export const completeSignup = (data) => API.post('/user/complete-signup', data);

// ✅ Login using mobile and MPIN
export const loginWithMPIN = (data) => API.post('/user/login-with-mpin', data);

// ✅ Verify MPIN OTP (used during MPIN reset/forgot)
export const verifyForgotOtp = (data) => API.post('/user/verify-mpin-otp', data);


export const sendForgotMPINOtp  = (data) => API.post('/user/send-mpin-otp', data);

