// src/components/auth/CustomerLogin.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';

import loginImage from '../../assest/loginimg.jpg';
import {
  signupOrLogin,
  verifyOtp,
  createMPIN,
  loginWithMPIN,
  sendForgotMPINOtp,
  verifyForgotOtp,
} from './services/authService';
import { AuthContext } from '../Context/AuthContext';
import { saveToken } from './utils/tokenUtils';

const CustomerLogin = () => {
  const { login } = useContext(AuthContext);
  const [step, setStep] = useState('login');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState(''); // Added name state
  const [otp, setOtp] = useState('');
  const [mpin, setMpin] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError('');
    setMessage('');
    
    if (!mobile) {
      return setError('Mobile number is required');
    }
    
    if (!name.trim()) {
      return setError('Name is required');
    }
    
    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      // Pass name in signup request
      await signupOrLogin({ mobile: cleanMobile, name: name.trim() });
      setStep('verifyAndMpin');
      setMessage('OTP sent to your mobile');
    } catch (err) {
      console.error('❌ Signup Error:', err);
      setError(err.response?.data?.message || 'Signup/Login failed');
    }
  };

  const handleVerifyAndSetMpin = async () => {
    setError('');
    setMessage('');
    
    if (!otp || !mpin) {
      return setError('Enter both OTP and MPIN');
    }
    
    if (!/^\d{4}$/.test(mpin)) {
      return setError('MPIN must be exactly 4 digits');
    }
    
    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      
      // Step 1: Verify OTP
      await verifyOtp({ mobile: cleanMobile, otp });
      
      // Step 2: Create MPIN (include name if needed by backend)
      await createMPIN({ mobile: cleanMobile, newMPIN: mpin, name: name.trim() });
      
      // Step 3: Login with MPIN
      const response = await loginWithMPIN({ mobile: cleanMobile, mPIN: mpin });
      
      // Save token using tokenUtils
      const token = response?.data?.token;
      if (token) {
        const userData = response?.data?.user || { mobile: cleanMobile, name: name.trim() };
        const tokenSaved = saveToken(token, 'customer', userData);
        
        if (tokenSaved) {
          console.log('✅ Customer signup token saved successfully');
          
          // Set user data in context - token is already saved
          login(userData);
          
          setMessage('Registration successful!');
          setTimeout(() => navigate('/'), 1500);
        } else {
          setError('Failed to save session. Please try again.');
        }
      } else {
        setError('No authentication token received. Please try again.');
      }
      
    } catch (err) {
      console.error('❌ Verify and MPIN Error:', err);
      setError(err.response?.data?.message || 'Verification or MPIN setup failed');
    }
  };

  const handleLoginWithMPIN = async () => {
    setError('');
    setMessage('');
    
    if (!mobile || !mpin) {
      return setError('Enter both mobile and MPIN');
    }
    
    if (!/^\d{4}$/.test(mpin)) {
      return setError('MPIN must be exactly 4 digits');
    }

    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      const response = await loginWithMPIN({ mobile: cleanMobile, mPIN: mpin });

      if (response.status === 200 || response.status === 201) {
        // Save token using tokenUtils
        const token = response?.data?.token;
        if (token) {
          const userData = response?.data?.user || { mobile: cleanMobile };
          const tokenSaved = saveToken(token, 'customer', userData);
          
          if (tokenSaved) {
            console.log('✅ Customer login token saved successfully');
            
            // Set user data in context - token is already saved
            login(userData);
            
            setMessage('Login successful!');
            setTimeout(() => navigate('/'), 1000);
          } else {
            console.warn('⚠️ Token saving failed');
            setError('Failed to save session. Please try again.');
          }
        } else {
          console.warn('⚠️ No token received from customer login');
          setError('No authentication token received. Please try again.');
        }
      }

    } catch (err) {
      console.error('❌ MPIN Login Error:', err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleSendForgotOtp = async () => {
    setError('');
    setMessage('');
    
    if (!mobile) {
      return setError('Enter your mobile');
    }
    
    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      await sendForgotMPINOtp({ mobile: cleanMobile });
      setStep('forgot');
      setMessage('OTP sent for MPIN reset');
    } catch (err) {
      console.error('❌ Forgot OTP Error:', err);
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleForgotVerify = async () => {
    setError('');
    setMessage('');
    
    if (!otp || !mpin) {
      return setError('Enter both OTP and new MPIN');
    }
    
    if (!/^\d{4}$/.test(mpin)) {
      return setError('MPIN must be exactly 4 digits');
    }
    
    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      
      // Step 1: Verify forgot OTP
      await verifyForgotOtp({ mobile: cleanMobile, otp });
      
      // Step 2: Create new MPIN
      await createMPIN({ mobile: cleanMobile, newMPIN: mpin });
      
      // Step 3: Login with new MPIN
      const response = await loginWithMPIN({ mobile: cleanMobile, mPIN: mpin });
      
      // Save token using tokenUtils
      const token = response?.data?.token;
      if (token) {
        const userData = response?.data?.user || { mobile: cleanMobile };
        const tokenSaved = saveToken(token, 'customer', userData);
        
        if (tokenSaved) {
          console.log('✅ Customer forgot password token saved successfully');
          
          // Set user data in context - token is already saved
          login(userData);
          
          setMessage('MPIN reset successful!');
          setTimeout(() => navigate('/'), 1500);
        } else {
          setError('Failed to save session. Please try again.');
        }
      } else {
        setError('No authentication token received. Please try again.');
      }
      
    } catch (err) {
      console.error('❌ Forgot Reset Error:', err);
      setError(err.response?.data?.message || 'Failed to reset or login');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box d-flex">
        {/* Left Panel */}
        <div className="col-md-6 left-panel p-4">
          <h4 className="fw-bold text-white bg-danger py-2 px-3 rounded-pill d-inline-block">
            Registration Benefits:
          </h4>
          <ul className="list-unstyled mt-3">
            <li>✅ No Registration Fees</li>
            <li>✅ Easy Steps for registration</li>
            <li>✅ Manage Your Bookings</li>
            <li>✅ Print Ticket or Voucher</li>
            <li>✅ 24*7 Dedicated Support</li>
          </ul>
          <img src={loginImage} alt="Login" className="img-fluid w-75 rounded mt-4" />
        </div>

        {/* Right Panel */}
        <div className="col-md-6 right-panel d-flex flex-column justify-content-center">
          <h2 className="login-title mb-3 text-center">
            {step === 'login' && 'Login with MPIN'}
            {step === 'signup' && 'Signup - Mobile & Name'}
            {step === 'verifyAndMpin' && 'Verify OTP & Set MPIN'}
            {step === 'forgot' && 'Reset MPIN'}
          </h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form>
            {/* Name field - only for signup */}
            {step === 'signup' && (
              <Form.Group className="mb-3">
                <Form.Label className="text-light">Full Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                />
              </Form.Group>
            )}

            {['login', 'signup', 'forgot'].includes(step) && (
              <Form.Group className="mb-3">
                <Form.Label className="text-light">Mobile Number</Form.Label>
                <PhoneInput
                  country={'in'}
                  value={mobile}
                  onChange={(phone) => setMobile(phone)}
                  placeholder="Enter mobile number"
                  inputClass="custom-phone-input w-100"
                />
              </Form.Group>
            )}

            {['login', 'verifyAndMpin', 'forgot'].includes(step) && (
              <Form.Group className="mb-3">
                <Form.Label className="text-light">
                  {step === 'forgot' ? 'Set New MPIN' : 'MPIN'}
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter 4-digit MPIN"
                  value={mpin}
                  onChange={(e) => setMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                />
              </Form.Group>
            )}

            {['verifyAndMpin', 'forgot'].includes(step) && (
              <Form.Group className="mb-3">
                <Form.Label className="text-light">OTP</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
              </Form.Group>
            )}

            {/* Step-wise Buttons */}
            {step === 'login' && (
              <>
                <div className="d-flex justify-content-between">
                  <Button
                    variant="link"
                    className="p-0 text-light mb-3"
                    onClick={() => {
                      setStep('signup');
                      setMessage('');
                      setError('');
                      setName(''); // Clear name when switching to signup
                    }}
                  >
                    Signup
                  </Button>
                  <Button
                    variant="link"
                    className="p-0 text-light mb-3"
                    onClick={handleSendForgotOtp}
                  >
                    Forgot MPIN?
                  </Button>
                </div>
                <Button onClick={handleLoginWithMPIN} className="w-100 login-btn mb-2">
                  Login
                </Button>
              </>
            )}

            {step === 'signup' && (
              <>
                <Button onClick={handleSignup} className="w-100 login-btn mb-2">
                  Send OTP
                </Button>
                <Button
                  variant="link"
                  className="w-100 text-light"
                  onClick={() => {
                    setStep('login');
                    setMessage('');
                    setError('');
                    setName(''); // Clear name when going back
                  }}
                >
                  Back to Login
                </Button>
              </>
            )}

            {step === 'verifyAndMpin' && (
              <>
                <Button onClick={handleVerifyAndSetMpin} className="w-100 login-btn mb-2">
                  Verify & Set MPIN
                </Button>
                <Button
                  variant="link"
                  className="w-100 text-light"
                  onClick={() => {
                    setStep('signup');
                    setMessage('');
                    setError('');
                  }}
                >
                  Back
                </Button>
              </>
            )}

            {step === 'forgot' && (
              <>
                <Button onClick={handleForgotVerify} className="w-100 login-btn mb-2">
                  Reset MPIN & Login
                </Button>
                <Button
                  variant="link"
                  className="w-100 text-light"
                  onClick={() => {
                    setStep('login');
                    setMessage('');
                    setError('');
                  }}
                >
                  Back to Login
                </Button>
              </>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;