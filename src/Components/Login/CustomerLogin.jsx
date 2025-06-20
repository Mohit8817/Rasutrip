import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { BsPerson, BsLock, BsArrowRight } from 'react-icons/bs';
import '../../Style/user.css'; // Assuming you have a CSS file for styling


import login from '../../assest/loginimg.jpg'; // Assuming you have a login image in assets
const CustomerLogin = () => {

    const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
//   const [captcha, setCaptcha] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // login logic
    console.log(email, password);
  };
    return (
        <Container fluid className="login-wrapper">
      <Row className="login-box shadow">
        {/* Left Panel */}
        <Col md={6} className="left-panel p-4">
          <h5 className="benefits-title">Registration Benefits:-</h5>
          <ul className="benefits-list mt-3">
            <li>✅ No Registration Fees</li>
            <li>✅ Easy Steps for registration</li>
            <li>✅ Manage Your Bookings</li>
            <li>✅ Print Ticket or Voucher</li>
            <li>✅ 24*7 Dedicated Support</li>
          </ul>
          <img
            src={login}
            alt="Login"
            className="image-fluid w-75 m-auto  "
          />
        </Col>

        {/* Right Panel */}
        <Col md={6} className="right-panel">
            <h2 className="login-title">Login</h2>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3 custom-input">
              <Form.Label>
                <BsPerson className="me-2" />
                Email Address Or Mobile Number
              </Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="Email Address Or Mobile Number"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3 custom-input">
              <Form.Label>
                <BsLock className="me-2" />
                Password
              </Form.Label>
              <Form.Control
                type="password"
                required
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
{/* 
            <div className="captcha-box mb-2">
              <img src="/captcha.png" alt="captcha" className="captcha-img" />
              <a href="#refresh" className="refresh-link">Can't read the image? 🔁</a>
            </div> */}

            {/* <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Please Enter Captcha Code"
                required
                onChange={(e) => setCaptcha(e.target.value)}
              />
            </Form.Group> */}

            <div className="d-flex justify-content-between mb-3    ">
              <a href="#forgot " className='label'>Forgot Password</a>
              <a href="#register" className='label'>Create An Account</a>
            </div>

            <Button type="submit" className="w-100 login-btn">
              Login <BsArrowRight className="ms-2" />
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
    );
};

export default CustomerLogin;
