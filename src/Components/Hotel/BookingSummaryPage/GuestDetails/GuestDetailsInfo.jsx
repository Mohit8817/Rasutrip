import React, { useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FaEnvelope } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const GuestDetailsInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { hotel, room, roomDetails, payload, priceDetails } = location.state || {};

  const [guestInputs, setGuestInputs] = useState(
    roomDetails?.map(room => ({
      adults: Array.from({ length: room.adults }, () => ({ title: 'Mr', firstName: '', lastName: '' })),
      children: Array.from({ length: room.children }, () => ({ title: 'Master', firstName: '', lastName: '' }))
    }))
  );

  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState({});

  const [showGstinForm, setShowGstinForm] = useState(false);
  const [gstData, setGstData] = useState({
    gstNumber: '',
    companyName: '',
    contactNo: '',
    email: '',
    address: '',
    panNumber: ''
  });

  const isAlpha = str => /^[A-Za-z\s]+$/.test(str);
  const isEmail = str => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  const isMobile = str => /^[0-9]{10,}$/.test(str);
  const isValidPAN = pan => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);

  const handleInputChange = (roomIndex, type, personIndex, field, value) => {
    const updatedInputs = [...guestInputs];
    updatedInputs[roomIndex][type][personIndex][field] = value;
    setGuestInputs(updatedInputs);
  };

  const validateFields = () => {
    const newErrors = {};

    guestInputs.forEach((room, roomIdx) => {
      room.adults.forEach((guest, i) => {
        if (!isAlpha(guest.firstName)) newErrors[`adult-${roomIdx}-${i}-first`] = 'Only letters allowed';
        if (!isAlpha(guest.lastName)) newErrors[`adult-${roomIdx}-${i}-last`] = 'Only letters allowed';
      });

      room.children.forEach((guest, i) => {
        if (!isAlpha(guest.firstName)) newErrors[`child-${roomIdx}-${i}-first`] = 'Only letters allowed';
        if (!isAlpha(guest.lastName)) newErrors[`child-${roomIdx}-${i}-last`] = 'Only letters allowed';
      });
    });

    if (!isMobile(mobile)) newErrors.mobile = 'Enter a valid 10-digit number';
    if (!isEmail(email)) newErrors.email = 'Enter a valid email';

    // Optional PAN validation
    if (showGstinForm && gstData.panNumber && !isValidPAN(gstData.panNumber)) {
      newErrors.pan = 'Enter valid PAN (e.g. ABCDE1234F)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateFields()) return;

    const updatedGuestInputs = guestInputs.map((room) => ({
      ...room,
      adults: room.adults.map((guest) => ({
        ...guest,
        PAN: gstData.panNumber || ''
      })),
      children: room.children
    }));

    const bookingState = {
      hotel,
      room,
      roomDetails,
      priceDetails,
      guestInputs: updatedGuestInputs,
      email,
      mobile,
      payload,
      ...(showGstinForm ? { gstData } : {})
    };

    navigate('/Hotelreview', { state: bookingState });
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

      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <h6 className="fw-bold mb-3 d-flex align-items-center">
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

      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={9}><h6 className="fw-bold mb-1">Use GSTIN for this booking (Optional)</h6></Col>
            <Col md={3} className="text-end">
              <Button onClick={() => setShowGstinForm(!showGstinForm)} className='btn-red'>
                {showGstinForm ? 'Close' : 'Add'}
              </Button>
            </Col>
          </Row>

          {showGstinForm && (
            <Form className="mt-3">
              <Row className="g-2">
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="GST Number"
                    value={gstData.gstNumber}
                    onChange={(e) => setGstData({ ...gstData, gstNumber: e.target.value })}
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Company Name"
                    value={gstData.companyName}
                    onChange={(e) => setGstData({ ...gstData, companyName: e.target.value })}
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Contact Number"
                    value={gstData.contactNo}
                    onChange={(e) => setGstData({ ...gstData, contactNo: e.target.value })}
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    value={gstData.email}
                    onChange={(e) => setGstData({ ...gstData, email: e.target.value })}
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Address"
                    value={gstData.address}
                    onChange={(e) => setGstData({ ...gstData, address: e.target.value })}
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Enter PAN Number"
                    value={gstData.panNumber}
                    onChange={(e) => setGstData({ ...gstData, panNumber: e.target.value })}
                    isInvalid={!!errors.pan}
                  />
                  <Form.Control.Feedback type="invalid">{errors.pan}</Form.Control.Feedback>
                </Col>
              </Row>
            </Form>
          )}
        </Card.Body>
      </Card>

      <div className="text-start">
        <Button variant="primary" className="btn-red" onClick={handleContinue}>
          Continue Booking
        </Button>
      </div>
    </div>
  );
};

export default GuestDetailsInfo;
