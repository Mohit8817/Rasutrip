// 🎯 MAIN ISSUE FIX: Enhanced Agent Login Component
// src/components/auth/AgentLogin.js
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
import { saveToken, getToken, debugTokenStorage } from './utils/tokenUtils';

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

  // 🔧 ENHANCED AGENT LOGIN WITH PROPER TOKEN HANDLING
  const handleLogin = async () => {
    setError('');
    setSuccess('');

    if (!mobile || !password) {
      return setError('Please enter both mobile and password');
    }

    try {
      console.log('🔄 Starting agent login process...');
      console.log('📱 Mobile:', mobile);

      const cleanMobile = mobile.replace(/\D/g, '');

      // Call agent login API
      const response = await agentLogin({
        mobile: cleanMobile,
        password
      });

      console.log('✅ Agent Login API Response:', response?.data);

      const { data } = response;
      const agentToken = data?.token;
      const agentData = data?.agent || data?.user || {};

      if (agentToken) {
        console.log('🔑 Agent token received:', agentToken.substring(0, 20) + '...');

        // 🎯 CRITICAL FIX: Ensure comprehensive agent data
        const completeAgentData = {
          // Basic info
          mobile: cleanMobile,
          name: agentData.name || agentData.fullName || agentData.firstName || 'Agent',
          firstName: agentData.firstName || agentData.name?.split(' ')[0] || 'Agent',
          lastName: agentData.lastName || agentData.name?.split(' ').slice(1).join(' ') || '',
          fullName: agentData.fullName || agentData.name || 'Agent',
          displayName: agentData.displayName || agentData.name || 'Agent',
          email: agentData.email || '',

          // Agent specific fields
          agentId: agentData.agentId || agentData.id || cleanMobile,
          agentCode: agentData.agentCode || agentData.code,
          agentType: agentData.agentType || 'agent',
          isAgent: true,
          userType: 'agent',

          // Permissions and status
          status: agentData.status || 'active',
          isActive: agentData.isActive !== false,
          permissions: agentData.permissions || ['booking', 'search', 'cancel'],

          // Timestamps
          loginTime: new Date().toISOString(),
          lastLoginTime: new Date().toISOString(),

          // All original data
          ...agentData
        };

        console.log('💾 Saving agent data:', completeAgentData);

        // 🎯 CRITICAL FIX: Save token with proper agent type
        const tokenSaved = saveToken(agentToken, 'agent', completeAgentData);

        if (tokenSaved) {
          console.log('✅ Agent token saved successfully');

          // Debug: Verify token was saved correctly
          const verifyToken = getToken('agent');
          console.log('🔍 Token verification:', {
            hasToken: verifyToken.hasToken,
            userType: verifyToken.userType,
            tokenPreview: verifyToken.token ? verifyToken.token.substring(0, 15) + '...' : 'null'
          });

          // Set user data in context with enhanced data
          contextAgentLogin(completeAgentData);

          setSuccess('Agent login successful!');

          // 🔧 DEBUG: Show token storage state
          if (process.env.NODE_ENV === 'development') {
            console.log('🔧 Debug: Token storage after agent login:');
            debugTokenStorage();
          }

          // Navigate to home page after delay
          setTimeout(() => {
            navigate('/');
          }, 1000);
        } else {
          console.error('❌ Agent token saving failed');
          setError('Failed to save agent session. Please try again.');
        }
      } else {
        console.error('❌ No token received from agent login');
        setError('No authentication token received. Please contact support.');
      }

    } catch (err) {
      console.error('❌ Agent Login Error:', err);
      console.error('❌ Error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data
      });

      setError(err.response?.data?.message || 'Agent login failed. Please try again.');
    }
  };

  // 🔧 ENHANCED PASSWORD RESET WITH PROPER TOKEN HANDLING
  const handleResetPassword = async () => {
    setError('');
    setSuccess('');

    if (!resetOtp || !newPassword) {
      return setError('Please enter both OTP and new password');
    }

    try {
      console.log('🔄 Resetting agent password...');

      const { data } = await resetAgentPassword({
        otp: resetOtp,
        newPassword,
        mobile: mobile.replace(/\D/g, '')
      });

      console.log('✅ Password reset response:', data);

      setSuccess(data.message || 'Password reset successful!');

      // Check if token is received after reset
      const resetToken = data?.token;
      if (resetToken) {
        console.log('🔑 Reset token received, logging in automatically...');

        const agentData = data.agent || data.user || {};
        const cleanMobile = mobile.replace(/\D/g, '');

        const completeAgentData = {
          mobile: cleanMobile,
          name: agentData.name || agentData.fullName || 'Agent',
          firstName: agentData.firstName || agentData.name?.split(' ')[0] || 'Agent',
          lastName: agentData.lastName || '',
          fullName: agentData.fullName || agentData.name || 'Agent',
          displayName: agentData.name || 'Agent',
          email: agentData.email || '',
          agentId: agentData.agentId || agentData.id || cleanMobile,
          isAgent: true,
          userType: 'agent',
          loginTime: new Date().toISOString(),
          resetTime: new Date().toISOString(),
          ...agentData
        };

        const tokenSaved = saveToken(resetToken, 'agent', completeAgentData);

        if (tokenSaved) {
          console.log('✅ Reset token saved successfully');
          contextAgentLogin(completeAgentData);

          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          console.warn('⚠️ Token saving failed after reset');
          setError('Password reset successful but failed to auto-login. Please login manually.');
        }
      } else {
        console.log('ℹ️ No token received after reset, manual login required');
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

  const handleSendOtp = async () => {
    setError('');
    setSuccess('');

    if (!mobile) {
      return setError('Please enter mobile number');
    }

    const cleanMobile = mobile.replace(/\D/g, '');

    try {
      console.log('📤 Sending OTP to:', cleanMobile);
      const { data } = await sendForgotPasswordOtp({ mobile: cleanMobile });
      setSuccess(data.message || 'OTP sent successfully');
      setOtpSent(true);
    } catch (err) {
      console.error('❌ OTP Send Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to send OTP');
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

                    {/* DEBUG BUTTON for development */}
                    {process.env.NODE_ENV === 'development' && (
                      <Button
                        variant="link"
                        className="p-0 text-light mb-3"
                        onClick={() => {
                          console.log('🔧 Current token status:');
                          debugTokenStorage();
                          const currentToken = getToken();
                          console.log('🔍 Current detection:', currentToken);
                        }}
                      >
                        Debug Token
                      </Button>
                    )}
                  </div>

                  <Button className="w-100 login-btn mb-2" onClick={handleLogin}>
                    Login as Agent
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