// src/components/common/Login.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { BsPersonCircle, BsPersonBadge } from 'react-icons/bs';
import { AuthContext } from '../Context/AuthContext';
import '../../Style/user.css';

const Login = () => {
  const navigate = useNavigate();
  const { user, userType, logout, getUserDisplayName } = useContext(AuthContext);

  const handleSelect = (type) => {
    if (type === 'customer') navigate('/login/customer');
    else if (type === 'agent') navigate('/login/agent');
  };

  const handleLogout = () => {
    logout(); // This will automatically redirect to home page
  };

  const formatMobileForDisplay = (mobile) => {
    if (!mobile) return 'User';
    const cleaned = mobile.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `+91 ${cleaned.slice(-10, -5)}***${cleaned.slice(-2)}`;
    }
    return mobile;
  };

  return (
    <div className="d-flex justify-content-center align-items-center login-container">
      <div className="login-dropdown-box">
        <Dropdown>
          <Dropdown.Toggle as="div" className="user-profile" role="button" tabIndex="0">
            <div className="user-profile-inner">
              {user && userType === 'agent' ? (
                <BsPersonBadge size={24} />
              ) : (
                <BsPersonCircle size={24} />
              )}
              <p>
                {user 
                  ? (user.name || formatMobileForDisplay(user.mobile))
                  : 'Login or Signup'
                }
              </p>
              {user && userType && (
                <span className={`small text-capitalize ${userType === 'agent' ? 'text-primary' : 'text-success'}`}>
                  {/* ({userType}) */}
                </span>
              )}
            </div>
          </Dropdown.Toggle>
          
          <Dropdown.Menu>
            {user ? (
              <>
                {/* <Dropdown.Item onClick={() => navigate('/profile')}>
                  <BsPersonCircle size={16} className="me-2" />
                  View Profile
                </Dropdown.Item> */}
                <Dropdown.Item onClick={() => navigate('/dashboard')}>
                  <i className="fas fa-tachometer-alt me-2"></i>
                  Dashboard
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </Dropdown.Item>
              </>
            ) : (
              <>
                <Dropdown.Item onClick={() => handleSelect('customer')}>
                  <BsPersonCircle size={20} className="me-2" />
                  Customer Login
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => handleSelect('agent')}>
                  <BsPersonBadge size={20} className="me-2" />
                  Agent Login
                </Dropdown.Item>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default Login;