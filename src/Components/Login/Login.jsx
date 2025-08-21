// src/components/common/Login.js - Updated to work with cleaned AuthContext
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { BsPersonCircle, BsPersonBadge } from 'react-icons/bs';
import { AuthContext } from '../Context/AuthContext';
import '../../Style/user.css';

const Login = () => {
  const navigate = useNavigate();
  const {
    user,
    userType,
    isLoggedIn,
    logout,
    getUserDisplayName,
    getUserMobile,
    isAgent,
    isCustomer
  } = useContext(AuthContext);

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

  // Get display name with fallback
  const getDisplayName = () => {
    if (!isLoggedIn || !user) return 'Login or Signup';

    const displayName = getUserDisplayName();

    // If we have a proper name, use it
    if (displayName && displayName !== 'User' && displayName !== 'Agent') {
      return displayName;
    }

    // Fallback to formatted mobile
    return formatMobileForDisplay(user.mobile);
  };

  // Get user type display
  const getUserTypeDisplay = () => {
    if (!isLoggedIn || !userType) return '';

    if (isAgent()) return 'Agent';
    if (isCustomer()) return 'Customer';
    return userType;
  };

  return (
    <div className="d-flex justify-content-center align-items-center login-container">
      <div className="login-dropdown-box">
        <Dropdown>
          <Dropdown.Toggle as="div" className="user-profile" role="button" tabIndex="0">
            <div className="user-profile-inner">
              {isLoggedIn && isAgent() ? (
                <BsPersonBadge size={24} />
              ) : (
                <BsPersonCircle size={24} />
              )}
              <p>
                {getDisplayName()}
              </p>
              {/* {isLoggedIn && userType && (
                <span className={`small text-capitalize ${isAgent() ? 'text-primary' : 'text-success'}`}>
                  ({getUserTypeDisplay()})
                </span>
              )} */}
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {isLoggedIn ? (
              <>
                {/* <Dropdown.Header>
                  <div className="text-center">
                    <strong>{getUserDisplayName()}</strong>
                    <br />
                    <small className="text-muted">
                      {getUserMobile()}
                    </small>
                    <br />
                    <small className={`badge ${isAgent() ? 'bg-primary' : 'bg-success'}`}>
                      {getUserTypeDisplay()}
                    </small>
                  </div>
                </Dropdown.Header> */}
                <Dropdown.Divider />

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