import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import loginImage from '../../assest/loginimg.jpg';
import {
  signupOrLogin,
  verifyOtp,
  completeSignup
} from './services/authService';
import { AuthContext } from '../Context/AuthContext';

const CustomerLogin = () => {
  const { login } = useContext(AuthContext);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [mpin, setMPIN] = useState('');
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!mobile) return setError('Please enter your mobile number.');
    try {
      await signupOrLogin({ mobile });
      setMessage('OTP sent to your mobile.');
      setError('');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyAndSetMPIN = async () => {
    if (!otp || !mpin || !name) {
      return setError('Please enter OTP, Name, and MPIN.');
    }
    if (!/^\d{4}$/.test(mpin)) {
      return setError('MPIN must be exactly 4 digits.');
    }

    try {
      // 1. Verify OTP and get token
      const response = await verifyOtp({ mobile, otp });
      const receivedToken = response.data.token;

      if (!receivedToken) {
        return setError('Failed to get token. Please try again.');
      }

      setToken(receivedToken);

      // 2. Call completeSignup with token
      await completeSignup(
        {
          mobile,
          otp,
          newMPIN: mpin,
          name,
        },
        receivedToken
      );

      // 3. Save user data to context
      login({ mobile });

      setMessage('Signup completed successfully.');
      setError('');
      setMobile('');
      setOtp('');
      setMPIN('');
      setName('');
      setStep(1);
      navigate('/');
    } catch (err) {
      console.error('Error:', err);
      if (err.response?.status === 409) {
        setError('MPIN already exists for this number.');
      } else {
        setError(err.response?.data?.message || 'Failed to complete signup');
      }
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
            {step === 1 ? 'Login / Signup' : 'Verify OTP & Set MPIN'}
          </h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form>
            {step === 1 && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </Form.Group>
                <Button onClick={handleSendOtp} className="w-100">
                  Send OTP
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>OTP</Form.Label>
                  <Form.Control
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Set 4-digit MPIN</Form.Label>
                  <Form.Control
                    type="password"
                    maxLength={4}
                    value={mpin}
                    onChange={(e) => setMPIN(e.target.value)}
                  />
                </Form.Group>

                <Button onClick={handleVerifyAndSetMPIN} className="w-100">
                  Continue
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
