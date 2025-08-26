// 🎯 CRITICAL FIX: Enhanced Agent Login Component with Proper Token Saving
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

  // 🔧 CRITICAL FIX: Enhanced Agent Login with Comprehensive Token Handling
  const handleLogin = async () => {
    setError('');
    setSuccess('');

    if (!mobile || !password) {
      return setError('Please enter both mobile and password');
    }

    try {
      console.log('🔄 Starting AGENT login process...');
      console.log('📱 Agent Mobile:', mobile);

      const cleanMobile = mobile.replace(/\D/g, '');

      // 🎯 STEP 1: Call agent login API
      const response = await agentLogin({
        mobile: cleanMobile,
        password
      });

      console.log('✅ Agent Login API Response:', response?.data);

      const { data } = response;
      const agentToken = data?.token || data?.access_token || data?.authToken;
      const agentData = data?.agent || data?.user || data?.data || {};

      // 🎯 STEP 2: Validate token received
      if (!agentToken) {
        console.error('❌ No agent token received from API');
        console.error('📊 Response data:', data);
        setError('No authentication token received. Please contact support.');
        return;
      }

      console.log('🔑 Agent token received:', agentToken.substring(0, 30) + '...');

      // 🎯 STEP 3: Create comprehensive agent data
      const completeAgentData = {
        // Basic agent info
        mobile: cleanMobile,
        name: agentData.name || agentData.fullName || agentData.firstName || `Agent ${cleanMobile}`,
        firstName: agentData.firstName || agentData.name?.split(' ')[0] || 'Agent',
        lastName: agentData.lastName || agentData.name?.split(' ').slice(1).join(' ') || '',
        fullName: agentData.fullName || agentData.name || `Agent ${cleanMobile}`,
        displayName: agentData.displayName || agentData.name || `Agent ${cleanMobile}`,
        email: agentData.email || '',

        // Agent specific identifiers
        agentId: agentData.agentId || agentData.id || agentData.agent_id || cleanMobile,
        agentCode: agentData.agentCode || agentData.code || agentData.agent_code,
        agentType: agentData.agentType || agentData.type || 'agent',
        
        // User type flags - CRITICAL for API requests
        isAgent: true,
        userType: 'agent',
        role: 'agent',
        accountType: 'agent',

        // Permissions and status
        status: agentData.status || 'active',
        isActive: agentData.isActive !== false,
        isVerified: agentData.isVerified !== false,
        permissions: agentData.permissions || ['booking', 'search', 'cancel', 'view'],
        
        // Additional agent data
        commission: agentData.commission || 0,
        balance: agentData.balance || 0,
        creditLimit: agentData.creditLimit || 0,
        agentCategory: agentData.agentCategory || 'standard',

        // Timestamps
        loginTime: new Date().toISOString(),
        lastLoginTime: new Date().toISOString(),
        tokenIssuedAt: new Date().toISOString(),

        // All original data (preserve everything)
        ...agentData,

        // 🔧 CRITICAL: Override with our enhanced data
        isAgent: true,
        userType: 'agent'
      };

      console.log('💾 Comprehensive agent data prepared:', {
        mobile: completeAgentData.mobile,
        name: completeAgentData.name,
        agentId: completeAgentData.agentId,
        userType: completeAgentData.userType,
        isAgent: completeAgentData.isAgent
      });

      // 🎯 STEP 4: Save token with enhanced storage strategy
      console.log('🔐 Saving agent token with enhanced strategy...');
      
      // Clear any existing tokens first
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('customer_token');
      localStorage.removeItem('userType');
      localStorage.removeItem('user_type');
      localStorage.removeItem('user');
      localStorage.removeItem('customer');

      // Save agent token using your tokenUtils
      const tokenSaved = saveToken(agentToken, 'agent', completeAgentData);

      if (!tokenSaved) {
        console.error('❌ Agent token saving failed via tokenUtils');
        setError('Failed to save agent session via tokenUtils. Please try again.');
        return;
      }

      // 🎯 STEP 5: Additional token storage for redundancy
      // Store in multiple locations for maximum compatibility
      localStorage.setItem('agent_token', agentToken);
      localStorage.setItem('agentToken', agentToken);
      localStorage.setItem('token', agentToken); // Some APIs might expect this
      localStorage.setItem('authToken', agentToken); // Fallback
      
      // Store user type explicitly
      localStorage.setItem('userType', 'agent');
      localStorage.setItem('user_type', 'agent');
      localStorage.setItem('accountType', 'agent');
      localStorage.setItem('loginType', 'agent');
      
      // Store agent data
      localStorage.setItem('agent', JSON.stringify(completeAgentData));
      localStorage.setItem('user', JSON.stringify(completeAgentData)); // Some components expect 'user'
      localStorage.setItem('currentUser', JSON.stringify(completeAgentData));
      
      // Store agent-specific data
      localStorage.setItem('isAgent', 'true');
      localStorage.setItem('agentId', completeAgentData.agentId);
      localStorage.setItem('agentMobile', cleanMobile);

      console.log('✅ Agent token and data saved successfully');

      // 🎯 STEP 6: Verify token was saved correctly
      const verifyToken = getToken('agent');
      console.log('🔍 Token verification after save:', {
        hasToken: verifyToken.hasToken,
        userType: verifyToken.userType,
        tokenLength: verifyToken.token ? verifyToken.token.length : 0,
        tokenPreview: verifyToken.token ? verifyToken.token.substring(0, 20) + '...' : 'null'
      });

      if (!verifyToken.hasToken) {
        console.error('❌ Token verification failed after saving');
        setError('Token verification failed after saving. Please try again.');
        return;
      }

      // 🎯 STEP 7: Set user data in AuthContext
      console.log('📱 Setting agent data in AuthContext...');
      const contextResult = contextAgentLogin(completeAgentData);
      
      if (contextResult === false) {
        console.error('❌ AuthContext agent login failed');
        setError('Failed to set agent session in context. Please try again.');
        return;
      }

      // 🎯 STEP 8: Additional localStorage entries for API compatibility
      localStorage.setItem('userName', completeAgentData.name);
      localStorage.setItem('userMobile', cleanMobile);
      localStorage.setItem('userEmail', completeAgentData.email || '');
      
      // Store agent name in userNames for consistency
      const userNames = JSON.parse(localStorage.getItem('userNames') || '{}');
      userNames[cleanMobile] = completeAgentData.name;
      userNames[`+91${cleanMobile}`] = completeAgentData.name;
      localStorage.setItem('userNames', JSON.stringify(userNames));

      setSuccess('Agent login successful! Redirecting...');

      // 🔧 DEBUG: Show complete token storage state in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 DEBUG: Complete token storage after agent login:');
        debugTokenStorage();
        
        // Show all localStorage keys related to auth
        console.log('📋 All Auth-related localStorage keys:');
        Object.keys(localStorage).forEach(key => {
          if (key.includes('token') || key.includes('user') || key.includes('agent') || key.includes('Type')) {
            const value = localStorage.getItem(key);
            console.log(`  ${key}:`, value?.substring(0, 50) + (value?.length > 50 ? '...' : ''));
          }
        });
      }

      // 🎯 STEP 9: Navigate to home page after delay
      setTimeout(() => {
        console.log('🔄 Navigating to home page as agent...');
        navigate('/');
      }, 1500);

    } catch (err) {
      console.error('❌ Agent Login Error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);

      let errorMessage = 'Agent login failed. Please try again.';

      if (err.response?.status === 401) {
        errorMessage = 'Invalid mobile number or password.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Your agent account is not active. Please contact support.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Agent account not found. Please check your mobile number.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
    }
  };

  // 🔧 Enhanced Password Reset with Proper Token Handling
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
      const resetToken = data?.token || data?.access_token;
      if (resetToken) {
        console.log('🔑 Reset token received, logging in automatically...');

        const agentData = data.agent || data.user || {};
        const cleanMobile = mobile.replace(/\D/g, '');

        const completeAgentData = {
          mobile: cleanMobile,
          name: agentData.name || agentData.fullName || `Agent ${cleanMobile}`,
          firstName: agentData.firstName || agentData.name?.split(' ')[0] || 'Agent',
          lastName: agentData.lastName || '',
          fullName: agentData.fullName || agentData.name || `Agent ${cleanMobile}`,
          displayName: agentData.name || `Agent ${cleanMobile}`,
          email: agentData.email || '',
          agentId: agentData.agentId || agentData.id || cleanMobile,
          isAgent: true,
          userType: 'agent',
          loginTime: new Date().toISOString(),
          resetTime: new Date().toISOString(),
          ...agentData
        };

        // Save token with same comprehensive approach
        const tokenSaved = saveToken(resetToken, 'agent', completeAgentData);

        if (tokenSaved) {
          // Additional storage
          localStorage.setItem('agent_token', resetToken);
          localStorage.setItem('userType', 'agent');
          localStorage.setItem('agent', JSON.stringify(completeAgentData));
          
          console.log('✅ Reset token saved successfully');
          contextAgentLogin(completeAgentData);

          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          console.warn('⚠️ Token saving failed after reset');
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

  const handleSendOtp = async () => {
    setError('');
    setSuccess('');

    if (!mobile) {
      return setError('Please enter mobile number');
    }

    const cleanMobile = mobile.replace(/\D/g, '');

    try {
      console.log('📤 Sending OTP to agent:', cleanMobile);
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
                {showResetForm ? 'Reset Agent Password' : 'Agent Login'}
              </h2>
              <p className="text-light">
                {showResetForm
                  ? 'Reset your agent password using OTP'
                  : 'Sign in to continue as an agent'}
              </p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="text-light">Agent Mobile Number</Form.Label>
                <PhoneInput
                  country={'in'}
                  value={mobile}
                  onChange={setMobile}
                  inputClass="custom-phone-input w-100"
                  placeholder="Enter agent mobile number"
                />
              </Form.Group>

              {!showResetForm ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-light">Agent Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter agent password"
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
                    Login as Agent
                  </Button>
                  
                  <div className="text-center mt-2">
                    <small className="text-light">
                      Logging in as Business Agent
                    </small>
                  </div>
                </>
              ) : (
                <>
                  {!otpSent ? (
                    <Button className="w-100 mb-3 login-btn" onClick={handleSendOtp}>
                      Send OTP to Agent Mobile
                    </Button>
                  ) : (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-light">OTP</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter OTP received on mobile"
                          value={resetOtp}
                          onChange={(e) => setResetOtp(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="text-light">New Agent Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </Form.Group>

                      <Button className="w-100 login-btn mb-2" onClick={handleResetPassword}>
                        Reset Agent Password
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
                    Back to Agent Login
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