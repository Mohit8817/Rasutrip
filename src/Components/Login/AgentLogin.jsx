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
import { saveToken } from './utils/tokenUtils';

const AgentLogin = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();
  const { agentLogin: contextAgentLogin } = useContext(AuthContext);

  const handleLogin = async () => {
    setError('');
    setSuccess('');
    
    if (!mobile || !password) {
      return setError('Please enter both mobile and password');
    }
    
    try {
      const { data } = await agentLogin({ mobile, password });
      
      // Save token using tokenUtils
      const agentToken = data?.token;
      if (agentToken) {
        const agentData = data.agent || data.user || { mobile };
        const tokenSaved = saveToken(agentToken, 'agent', agentData);
        
        if (tokenSaved) {
          console.log('✅ Agent token saved successfully');
          
          // Set user data in context - token is already saved
          contextAgentLogin(agentData);

          setSuccess('Login successful!');
          
          // Navigate to home page
          setTimeout(() => {
            navigate('/');
          }, 1000);
        } else {
          console.warn('⚠️ Agent token saving failed');
          setError('Failed to save session. Please try again.');
        }
      } else {
        console.warn('⚠️ No token received from agent login');
        setError('No authentication token received. Please try again.');
      }

    } catch (err) {
      console.error('❌ Agent Login Error:', err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleSendOtp = async () => {
    setError('');
    setSuccess('');

    if (!mobile) {
      return setError('Please enter mobile number');
    }

    const cleanMobile = mobile.replace(/\D/g, '');

    try {
      const { data } = await sendForgotPasswordOtp({ mobile: cleanMobile });
      setSuccess(data.message || 'OTP sent successfully');
      setOtpSent(true);
    } catch (err) {
      console.error('OTP Send Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');
    
    if (!resetOtp || !newPassword) {
      return setError('Please enter both OTP and new password');
    }
    
    try {
      const { data } = await resetAgentPassword({ 
        otp: resetOtp, 
        newPassword, 
        mobile: mobile.replace(/\D/g, '') 
      });
      
      setSuccess(data.message || 'Password reset successful!');

      // Save token if received after reset
      const resetToken = data?.token;
      if (resetToken) {
        const agentData = data.agent || data.user || { mobile };
        const tokenSaved = saveToken(resetToken, 'agent', agentData);
        
        if (tokenSaved) {
          console.log('✅ Reset token saved successfully');
          
          // Auto login after successful reset
          contextAgentLogin(agentData);
          
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setError('Password reset successful but failed to auto-login. Please login manually.');
        }
      }

      // Reset form
      setShowResetForm(false);
      setResetOtp('');
      setNewPassword('');
      setOtpSent(false);
      
    } catch (err) {
      console.error('❌ Password Reset Error:', err);
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
                      setError('');
                      setSuccess('');
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