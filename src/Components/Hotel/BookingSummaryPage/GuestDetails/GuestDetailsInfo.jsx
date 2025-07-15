import React, { useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FaEnvelope } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const GuestDetailsInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { hotel, room, roomDetails } = location.state || {};

  // Input states
  const [guestInputs, setGuestInputs] = useState(
    roomDetails?.map(room => ({
      adults: Array.from({ length: room.adults }, () => ({ title: 'Mr', firstName: '', lastName: '' })),
      children: Array.from({ length: room.children }, () => ({ title: 'Master', firstName: '', lastName: '' }))
    }))
  );

  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState({});

  // Validation functions
  const isAlpha = str => /^[A-Za-z\s]+$/.test(str);
  const isEmail = str => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  const isMobile = str => /^[0-9]{10,}$/.test(str);

  const handleInputChange = (roomIndex, type, personIndex, field, value) => {
    const updatedInputs = [...guestInputs];
    updatedInputs[roomIndex][type][personIndex][field] = value;
    setGuestInputs(updatedInputs);
  };

  const validateFields = () => {
    const newErrors = {};

    guestInputs.forEach((room, roomIdx) => {
      room.adults.forEach((guest, i) => {
        if (!isAlpha(guest.firstName)) {
          newErrors[`adult-${roomIdx}-${i}-first`] = 'First name should only contain letters';
        }
        if (!isAlpha(guest.lastName)) {
          newErrors[`adult-${roomIdx}-${i}-last`] = 'Last name should only contain letters';
        }
      });

      room.children.forEach((guest, i) => {
        if (!isAlpha(guest.firstName)) {
          newErrors[`child-${roomIdx}-${i}-first`] = 'First name should only contain letters';
        }
        if (!isAlpha(guest.lastName)) {
          newErrors[`child-${roomIdx}-${i}-last`] = 'Last name should only contain letters';
        }
      });
    });

    if (!isMobile(mobile)) newErrors.mobile = 'Enter a valid 10-digit mobile number';
    if (!isEmail(email)) newErrors.email = 'Enter a valid email address';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateFields()) return;

    navigate('/Hotelreview', {
      state: { hotel, room, roomDetails, guestInputs, email, mobile }
    });
  };

  if (!hotel || !room || !roomDetails) {
    return (
      <div className="p-4 text-danger text-center">
        ❌ Missing booking data. Please go back to Hotel Details page.
      </div>
    );
  }

  return (
    <div className="container my-4">
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <h5 className="fw-bold">Guest Details</h5>
          <p className="text-muted small">Please enter names as per Government ID.</p>

          {roomDetails.map((room, roomIndex) => (
            <div key={roomIndex} className="border rounded p-3 mb-4">
              <div className="mb-3 fw-bold">Room {roomIndex + 1}</div>

              {/* Adults */}
              {guestInputs[roomIndex]?.adults.map((guest, i) => (
                <Row className="align-items-center mb-3" key={`adult-${roomIndex}-${i}`}>
                  <Col lg={2} className="fw-bold">Adult {i + 1}</Col>
                  <Col lg={2}>
                    <Form.Select
                      value={guest.title}
                      onChange={(e) => handleInputChange(roomIndex, 'adults', i, 'title', e.target.value)}
                    >
                      <option>Mr</option>
                      <option>Ms</option>
                    </Form.Select>
                  </Col>
                  <Col lg={4}>
                    <Form.Control
                      type="text"
                      placeholder="First Name"
                      value={guest.firstName}
                      onChange={(e) => handleInputChange(roomIndex, 'adults', i, 'firstName', e.target.value)}
                      isInvalid={errors[`adult-${roomIndex}-${i}-first`]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`adult-${roomIndex}-${i}-first`]}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={4}>
                    <Form.Control
                      type="text"
                      placeholder="Last Name"
                      value={guest.lastName}
                      onChange={(e) => handleInputChange(roomIndex, 'adults', i, 'lastName', e.target.value)}
                      isInvalid={errors[`adult-${roomIndex}-${i}-last`]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`adult-${roomIndex}-${i}-last`]}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
              ))}

              {/* Children */}
              {guestInputs[roomIndex]?.children.map((guest, i) => (
                <Row className="align-items-center mb-3" key={`child-${roomIndex}-${i}`}>
                  <Col lg={2} className="fw-bold">Child {i + 1}</Col>
                  <Col lg={2}>
                    <Form.Select
                      value={guest.title}
                      onChange={(e) => handleInputChange(roomIndex, 'children', i, 'title', e.target.value)}
                    >
                      <option>Master</option>
                      <option>Miss</option>
                    </Form.Select>
                  </Col>
                  <Col lg={4}>
                    <Form.Control
                      type="text"
                      placeholder="First Name"
                      value={guest.firstName}
                      onChange={(e) => handleInputChange(roomIndex, 'children', i, 'firstName', e.target.value)}
                      isInvalid={errors[`child-${roomIndex}-${i}-first`]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`child-${roomIndex}-${i}-first`]}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={4}>
                    <Form.Control
                      type="text"
                      placeholder="Last Name"
                      value={guest.lastName}
                      onChange={(e) => handleInputChange(roomIndex, 'children', i, 'lastName', e.target.value)}
                      isInvalid={errors[`child-${roomIndex}-${i}-last`]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`child-${roomIndex}-${i}-last`]}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
              ))}
            </div>
          ))}
        </Card.Body>
      </Card>

      {/* Contact Details */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <h6 className="fw-bold mb-3">
            <FaEnvelope className="me-2 text-danger" />
            Your ticket and hotel details will be shared here
          </h6>
          <Row>
            <Col lg={3}><Form.Select><option>India (+91)</option></Form.Select></Col>
            <Col lg={4}>
              <Form.Control
                type="text"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                isInvalid={!!errors.mobile}
              />
              <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
            </Col>
            <Col lg={5}>
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Continue */}
      <div className="text-start">
        <Button variant="primary" className="btn-red" onClick={handleContinue}>
          Continue Booking
        </Button>
      </div>
    </div>
  );
};

export default GuestDetailsInfo;
