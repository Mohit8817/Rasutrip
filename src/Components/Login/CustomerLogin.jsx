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

const CustomerLogin = () => {
  const { login } = useContext(AuthContext);
  const [step, setStep] = useState('login'); // login | signup | verifyAndMpin | forgot
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [mpin, setMpin] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError('');
    if (!mobile) return setError('Mobile number is required');
    try {
      await signupOrLogin({ mobile });
      setStep('verifyAndMpin');
      setMessage('OTP sent to your mobile');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup/Login failed');
    }
  };

  const handleVerifyAndSetMpin = async () => {
    setError('');
    if (!otp || !/^\d{4}$/.test(mpin)) {
      return setError('Enter valid OTP and 4-digit MPIN');
    }
    try {
      await verifyOtp({ mobile, otp });
      await createMPIN({ mobile, newMPIN: mpin });
      await loginWithMPIN({ mobile, mPIN: mpin });
      login({ mobile });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification or MPIN setup failed');
    }
  };

  const handleLoginWithMPIN = async () => {
    setError('');
    if (!mobile || !mpin) return setError('Enter both mobile and MPIN');
    try {
      await loginWithMPIN({ mobile, mPIN: mpin });
      login({ mobile });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleSendForgotOtp = async () => {
    setError('');
    if (!mobile) return setError('Enter your mobile');
    try {
      await sendForgotMPINOtp({ mobile });
      setStep('forgot');
      setMessage('OTP sent for MPIN reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleForgotVerify = async () => {
    setError('');
    if (!otp || !mpin) return setError('Enter both OTP and new MPIN');
    if (!/^\d{4}$/.test(mpin)) return setError('MPIN must be 4 digits');
    try {
      await verifyForgotOtp({ mobile, otp });
      await createMPIN({ mobile, newMPIN: mpin });
      await loginWithMPIN({ mobile, mPIN: mpin });
      login({ mobile });
      navigate('/');
    } catch (err) {
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
            {step === 'signup' && 'Signup - Mobile'}
            {step === 'verifyAndMpin' && 'Verify OTP & Set MPIN'}
            {step === 'forgot' && 'Reset MPIN'}
          </h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form>
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
                  onChange={(e) => setMpin(e.target.value)}
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
                  onChange={(e) => setOtp(e.target.value)}
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
              <Button onClick={handleSignup} className="w-100 login-btn mb-2">
                Send OTP
              </Button>
            )}

            {step === 'verifyAndMpin' && (
              <Button onClick={handleVerifyAndSetMpin} className="w-100 login-btn mb-2">
                Verify & Set MPIN
              </Button>
            )}

            {step === 'forgot' && (
              <>
                <Button onClick={handleForgotVerify} className="w-100 login-btn mb-2">
                  Continue
                </Button>
                <Button
                  variant="link"
                  className="w-100 text-light"
                  onClick={() => setStep('login')}
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
