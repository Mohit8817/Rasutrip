import React, { useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FaEnvelope } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const GuestDetailsInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { hotel, room, roomDetails, payload, priceDetails } = location.state || {};

  // Handle missing critical data
  if (!hotel || !room || !roomDetails) {
    return (
      <div className="p-4 text-danger text-center">
        ❌ Missing booking data. Please go back to Hotel Details page.
      </div>
    );
  }
  // States
  const [guestInputs, setGuestInputs] = useState(
    roomDetails.map(room => ({
      adults: Array.from({ length: room.adults }, () => ({ title: 'Mr', firstName: '', lastName: '' })),
      children: Array.from({ length: room.children }, () => ({ title: 'Master', firstName: '', lastName: '' }))
    }))
  );

  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState({});

  // Validators
  const isAlpha = str => /^[A-Za-z\s]+$/.test(str);
  const isEmail = str => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  const isMobile = str => /^[0-9]{10,}$/.test(str);

  // Input handler
  const handleInputChange = (roomIndex, type, personIndex, field, value) => {
    const updated = [...guestInputs];
    updated[roomIndex][type][personIndex][field] = value;
    setGuestInputs(updated);
  };

  // Validation
  const validateFields = () => {
    const newErrors = {};

    guestInputs.forEach((room, rIdx) => {
      room.adults.forEach((guest, aIdx) => {
        if (!isAlpha(guest.firstName)) {
          newErrors[`adult-${rIdx}-${aIdx}-first`] = 'Only letters allowed';
        }
        if (!isAlpha(guest.lastName)) {
          newErrors[`adult-${rIdx}-${aIdx}-last`] = 'Only letters allowed';
        }
      });

      room.children.forEach((guest, cIdx) => {
        if (!isAlpha(guest.firstName)) {
          newErrors[`child-${rIdx}-${cIdx}-first`] = 'Only letters allowed';
        }
        if (!isAlpha(guest.lastName)) {
          newErrors[`child-${rIdx}-${cIdx}-last`] = 'Only letters allowed';
        }
      });
    });

    if (!isMobile(mobile)) newErrors.mobile = 'Enter a valid 10-digit number';
    if (!isEmail(email)) newErrors.email = 'Enter a valid email address';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handler
  const handleContinue = () => {
    if (!validateFields()) return;

    navigate('/Hotelreview', {
      state: {
        hotel,
        room,
        roomDetails,
        priceDetails,
        guestInputs,
        email,
        mobile,
        payload
      }
    });
  };

  return (
    <div className="container my-4">
      {/* Guest Info */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <h5 className="fw-bold">Guest Details</h5>
          <p className="text-muted small">Enter names as per Government ID.</p>

          {guestInputs.map((room, rIdx) => (
            <div key={rIdx} className="border rounded p-3 mb-4">
              <div className="mb-3 fw-bold">Room {rIdx + 1}</div>

              {/* Adults */}
              {room.adults.map((guest, aIdx) => (
                <Row key={`adult-${rIdx}-${aIdx}`} className="mb-3">
                  <Col lg={2} className="fw-bold">Adult {aIdx + 1}</Col>
                  <Col lg={2}>
                    <Form.Select
                      value={guest.title}
                      onChange={e => handleInputChange(rIdx, 'adults', aIdx, 'title', e.target.value)}
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
                      onChange={e => handleInputChange(rIdx, 'adults', aIdx, 'firstName', e.target.value)}
                      isInvalid={!!errors[`adult-${rIdx}-${aIdx}-first`]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`adult-${rIdx}-${aIdx}-first`]}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={4}>
                    <Form.Control
                      type="text"
                      placeholder="Last Name"
                      value={guest.lastName}
                      onChange={e => handleInputChange(rIdx, 'adults', aIdx, 'lastName', e.target.value)}
                      isInvalid={!!errors[`adult-${rIdx}-${aIdx}-last`]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`adult-${rIdx}-${aIdx}-last`]}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
              ))}

              {/* Children */}
              {room.children.map((guest, cIdx) => (
                <Row key={`child-${rIdx}-${cIdx}`} className="mb-3">
                  <Col lg={2} className="fw-bold">Child {cIdx + 1}</Col>
                  <Col lg={2}>
                    <Form.Select
                      value={guest.title}
                      onChange={e => handleInputChange(rIdx, 'children', cIdx, 'title', e.target.value)}
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
                      onChange={e => handleInputChange(rIdx, 'children', cIdx, 'firstName', e.target.value)}
                      isInvalid={!!errors[`child-${rIdx}-${cIdx}-first`]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`child-${rIdx}-${cIdx}-first`]}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={4}>
                    <Form.Control
                      type="text"
                      placeholder="Last Name"
                      value={guest.lastName}
                      onChange={e => handleInputChange(rIdx, 'children', cIdx, 'lastName', e.target.value)}
                      isInvalid={!!errors[`child-${rIdx}-${cIdx}-last`]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`child-${rIdx}-${cIdx}-last`]}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
              ))}
            </div>
          ))}
        </Card.Body>
      </Card>

      {/* Contact Info */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <h6 className="fw-bold mb-3 d-flex align-items-center">
            <FaEnvelope className="me-2 text-danger" />
            Ticket and hotel details will be sent to:
          </h6>
          <Row>
            <Col lg={3}><Form.Select><option>India (+91)</option></Form.Select></Col>
            <Col lg={4}>
              <Form.Control
                type="text"
                placeholder="Mobile Number"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                isInvalid={!!errors.mobile}
              />
              <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
            </Col>
            <Col lg={5}>
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Continue Button */}
      <div className="text-start">
        <Button variant="primary" className="btn-red" onClick={handleContinue}>
          Continue Booking
        </Button>
      </div>
    </div>
  );
};

export default GuestDetailsInfo;
