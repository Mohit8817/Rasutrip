import React, { useState, useContext } from 'react';
import { Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';
import '../../Style/user.css';
import loginImage from '../../assest/login_agent.png';
import {
  agentLogin,
  sendForgotPasswordOtp,
  resetAgentPassword,
} from './services/authService';
import { AuthContext } from '../Context/AuthContext';

const AgentLogin = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate(); // ← INIT HOOK
  const { setUser, setUserType } = useContext(AuthContext); // Add setUserType
  const handleLogin = async () => {
    setError('');
    setSuccess('');
    try {
      const { data } = await agentLogin({ mobile, password });
      setSuccess('Login successful!');
      setUser(data.agent || { mobile });
      setUserType('agent');
      navigate('/'); // ← REDIRECT TO HOME
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleSendOtp = async () => {
    setError('');
    setSuccess('');

    const cleanMobile = mobile.replace(/\D/g, '');

    try {
      const { data } = await sendForgotPasswordOtp({ mobile: cleanMobile }); // ← wrap in object
      setSuccess(data.message);
      setOtpSent(true);
    } catch (err) {
      console.error('OTP Send Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };


  const handleResetPassword = async () => {
    setError('');
    setSuccess('');
    try {
      const { data } = await resetAgentPassword({ otp: resetOtp, newPassword, mobile });
      setSuccess(data.message || 'Password reset successful!');
      setShowResetForm(false);
      setResetOtp('');
      setNewPassword('');
      setOtpSent(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center agent-login-container">
      <Card className="agent-login-card w-100" style={{ maxWidth: '900px' }}>
        <Row>
          <Col md={6} className="p-3">
            <img src={loginImage} alt="Login" className="img-fluid w-100 rounded mt-4" />
          </Col>

          <Col md={6} className="d-flex flex-column justify-content-center agent-login-right-panel px-4">
            <div className="text-center mb-3">
              <h2 className="fw-bold text-light">
                {showResetForm ? 'Reset Password' : 'Agent Login'}
              </h2>
              <p className="text-light">
                {showResetForm
                  ? 'Reset your password using OTP'
                  : 'Sign in to continue as an agent'}
              </p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="text-light">Mobile Number</Form.Label>
                <PhoneInput
                  country={'in'}
                  value={mobile}
                  onChange={setMobile}
                  inputClass="custom-phone-input w-100"
                  placeholder="Enter mobile number"
                />
              </Form.Group>

              {!showResetForm ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-light">Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between">
                    <Button
                      variant="link"
                      className="p-0 text-light mb-3"
                      onClick={() => setShowResetForm(true)}
                    >
                      Forgot Password?
                    </Button>
                  </div>

                  <Button className="w-100 login-btn mb-2" onClick={handleLogin}>
                    Login
                  </Button>
                </>
              ) : (
                <>
                  {!otpSent ? (
                    <Button className="w-100 mb-3 login-btn" onClick={handleSendOtp}>
                      Send OTP
                    </Button>
                  ) : (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-light">OTP</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter OTP"
                          value={resetOtp}
                          onChange={(e) => setResetOtp(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="text-light">New Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </Form.Group>

                      <Button className="w-100 login-btn mb-2" onClick={handleResetPassword}>
                        Reset Password
                      </Button>
                    </>
                  )}
                  <Button
                    variant="link"
                    className="p-0 text-light mt-2"
                    onClick={() => {
                      setShowResetForm(false);
                      setOtpSent(false);
                      setResetOtp('');
                      setNewPassword('');
                    }}
                  >
                    Back to Login
                  </Button>
                </>
              )}
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AgentLogin;
