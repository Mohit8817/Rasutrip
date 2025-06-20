import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { BsPersonCircle, BsPersonBadge } from 'react-icons/bs';


import '../../Style/user.css'; // Assuming you have a CSS file for styling

const Login = () => {
    const navigate = useNavigate();

    const handleSelect = (type) => {
        if (type === 'customer') navigate('/login/customer');
        else if (type === 'agent') navigate('/login/agent');
    };
    return (
        <div>

            <div className="login-dropdown-wrapper">
                <Dropdown
                    onMouseEnter={(e) => e.currentTarget.classList.add('show')}
                    onMouseLeave={(e) => e.currentTarget.classList.remove('show')}
                >
                    {/* ✅ Use your custom login button as the toggle */}
                    <Dropdown.Toggle as="div" className="user-profile" id="login-dropdown" role="button" tabIndex="0">
                        <div className="user-profile-inner">
                            <svg
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                            >
                                <g data-name="Layer 2" id="Layer_2">
                                    <path
                                        d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"
                                    ></path>
                                </g>
                            </svg>
                            <p>Login or Signup </p>
                        </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="login-dropdown-menu">
                        <Dropdown.Item onClick={() => handleSelect('customer')} className="dropdown-custom-item">
                            <BsPersonCircle size={20} className="me-2" />
                            <div>
                                <strong>Customer Login</strong><br />
                                <small>Login & check bookings</small>
                            </div>
                        </Dropdown.Item>

                        <hr className="m-0" />

                        <Dropdown.Item onClick={() => handleSelect('agent')} className="dropdown-custom-item">
                            <BsPersonBadge size={20} className="me-2" />
                            <div>
                                <strong>Agent Login</strong><br />
                                <small>Login your agent account</small>
                            </div>
                        </Dropdown.Item>
                    </Dropdown.Menu>


                </Dropdown>
            </div>

        </div>
    )
}

export default Login