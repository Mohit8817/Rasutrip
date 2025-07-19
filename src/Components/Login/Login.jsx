// src/components/common/Login.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { BsPersonCircle, BsPersonBadge } from 'react-icons/bs';
import { AuthContext } from '../Context/AuthContext';
import '../../Style/user.css';

const Login = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleSelect = (type) => {
    if (type === 'customer') navigate('/login/customer');
    else if (type === 'agent') navigate('/login/agent');
  };

  return (
    <div className="login-dropdown-wrapper">
      {user ? (
        <Dropdown>
          <Dropdown.Toggle as="div" className="user-profile" role="button" tabIndex="0">
            <div className="user-profile-inner">
              <BsPersonCircle size={24} />
              <p>{user.mobile}</p>
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => navigate('/my-profile')}>
              My Profile
            </Dropdown.Item>
            <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <Dropdown>
          <Dropdown.Toggle as="div" className="user-profile" role="button" tabIndex="0">
            <div className="user-profile-inner">
              <BsPersonCircle size={24} />
              <p>Login or Signup</p>
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleSelect('customer')}>
              <BsPersonCircle size={20} className="me-2" />
              Customer Login
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => handleSelect('agent')}>
              <BsPersonBadge size={20} className="me-2" />
              Agent Login
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  );
};

export default Login;
