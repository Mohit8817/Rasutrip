// src/components/auth/CustomerLogin.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import loginImage from '../../assest/loginimg.jpg';
import { signupOrLogin, verifyOtp, createMPIN, loginWithMPIN } from './services/authService';
import { AuthContext } from '../Context/AuthContext';

const CustomerLogin = () => {
  const { login } = useContext(AuthContext);
  const [mobile, setMobile] = useState('');
  const [mpin, setMPIN] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('login'); // 'login', 'signup', 'verify'
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // LOGIN handler
  const handleLogin = async () => {
    if (!mobile || !mpin) return setError('Enter both mobile and MPIN');
    if (!/^\d{4}$/.test(mpin)) return setError('MPIN must be exactly 4 digits.');

    try {
      await loginWithMPIN({ mobile, mPIN: mpin }); // ✅ correct key
      login({ mobile }); // store in context
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  // SIGNUP: Send OTP
  const handleSendOtp = async () => {
    if (!mobile) return setError('Please enter your mobile number.');
    try {
      await signupOrLogin({ mobile });
      setMessage('OTP sent to your mobile.');
      setError('');
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  // SIGNUP: Verify OTP & Create MPIN
  const handleVerifyAndSetMPIN = async () => {
    if (!otp || !mpin) return setError('Enter both OTP and MPIN.');
    if (!/^\d{4}$/.test(mpin)) return setError('MPIN must be exactly 4 digits.');

    try {
      await verifyOtp({ mobile, otp });
      await createMPIN({ mobile, newMPIN: mpin });
      login({ mobile });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify or set MPIN');
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
          <ul className="list-unstyled">
            <li>✅ No Registration Fees</li>
            <li>✅ Easy Steps for registration</li>
            <li>✅ Manage Your Bookings</li>
            <li>✅ Print Ticket or Voucher</li>
            <li>✅ 24*7 Dedicated Support</li>
          </ul>
          <img src={loginImage} alt="Login" className="img-fluid w-75 rounded" />
        </div>

        {/* Right Panel */}
        <div className="col-md-6 right-panel d-flex flex-column justify-content-center">
          <h2 className="login-title">
            {step === 'login' ? 'Login / Signup' : step === 'signup' ? 'Signup' : 'Verify OTP & Set MPIN'}
          </h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form>
            {(step === 'login' || step === 'signup') && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </Form.Group>
              </>
            )}

            {step === 'login' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Enter your Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter Password"
                    value={mpin}
                    onChange={(e) => setMPIN(e.target.value)}
                    maxLength={4}
                  />
                </Form.Group>
                <div className="d-flex justify-content-between">
                  <Button variant="link" className="p-0 text-light fw-semibold" onClick={() => alert('Reset flow coming soon')}>
                    Forgot Password
                  </Button>
                  <Button variant="link" className="p-0 text-light fw-semibold" onClick={() => setStep('signup')}>
                    Signup
                  </Button>
                </div>
                <Button onClick={handleLogin} className="w-100 mb-3 mt-3 login-btn">Login</Button>
              </>
            )}

            {step === 'signup' && (
              <Button onClick={handleSendOtp} className="w-100 login-btn">Send OTP</Button>
            )}

            {step === 'verify' && (
              <>
                <Form.Group className="mb-2">
                  <Form.Label>OTP</Form.Label>
                  <Form.Control
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Set 4-digit MPIN</Form.Label>
                  <Form.Control
                    type="password"
                    value={mpin}
                    onChange={(e) => setMPIN(e.target.value)}
                    maxLength={4}
                  />
                </Form.Group>

                <Button onClick={handleVerifyAndSetMPIN} className="w-100 login-btn">Continue</Button>
              </>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
