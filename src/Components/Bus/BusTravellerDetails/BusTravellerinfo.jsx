import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';

const BusTravellerinfo = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const selectedSeats = state?.selectedSeats || [];

    const [showGstinForm, setShowGstinForm] = useState(false);

    const [passengerData, setPassengerData] = useState(
        selectedSeats.map(() => ({
            title: '',
            firstName: '',
            lastName: '',
            age: '',
            idType: '',
            idNumber: '',
        }))
    );

    const [contactData, setContactData] = useState({
        countryCode: 'India (91)',
        mobile: '',
        email: '',
    });

    const [gstData, setGstData] = useState({
        gstNumber: '',
        companyName: '',
        contactNo: '',
        email: '',
        address: '',
    });

    const [errors, setErrors] = useState({
        passenger: [],
        contact: {},
        gst: {},
    });

    // Validation Functions
    const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isMobileValid = (number) => /^[6-9]\d{9}$/.test(number);
    const isNameValid = (name) => /^[a-zA-Z]+$/.test(name);
    const isGstValid = (gst) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(gst);

    const handleContinue = () => {
        let hasError = false;
        const newPassengerErrors = [];
        const newContactErrors = {};
        const newGstErrors = {};

        passengerData.forEach((p, idx) => {
            const errs = {};
            if (!p.title) errs.title = "Title is required.";
            if (!isNameValid(p.firstName)) errs.firstName = "Valid first name required.";
            if (!isNameValid(p.lastName)) errs.lastName = "Valid last name required.";
            if (!p.age || p.age < 1 || p.age > 120) errs.age = "Enter valid age.";
            if (!p.idType) errs.idType = "ID type is required.";
            if (!p.idNumber) errs.idNumber = "ID number is required.";
            if (Object.keys(errs).length) hasError = true;
            newPassengerErrors.push(errs);
        });

        if (!isMobileValid(contactData.mobile)) {
            newContactErrors.mobile = "Enter valid 10-digit mobile number.";
            hasError = true;
        }
        if (!isEmailValid(contactData.email)) {
            newContactErrors.email = "Enter valid email.";
            hasError = true;
        }

        if (showGstinForm) {
            if (gstData.gstNumber && !isGstValid(gstData.gstNumber)) {
                newGstErrors.gstNumber = "Invalid GST number.";
                hasError = true;
            }
            if (gstData.email && !isEmailValid(gstData.email)) {
                newGstErrors.email = "Invalid GST email.";
                hasError = true;
            }
        }

        setErrors({ passenger: newPassengerErrors, contact: newContactErrors, gst: newGstErrors });

        if (hasError) return;

        navigate("/bus-review", {
            state: {
                ...state,
                passengerData,
                contactData,
                gstData,
            },
        });
    };

    return (
        <div className="container my-4">
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body>
                    <h5 className="fw-bold">Traveller Details</h5>
                    {selectedSeats.map((seat, index) => (
                        <Card className="border mt-3" key={index}>
                            <Card.Body>
                                <div className="d-flex justify-content-between mb-3 fw-semibold">
                                    <div>Passenger {index + 1}</div>
                                    <div>Seat {seat.SeatName}</div>
                                </div>
                                <Row className="g-2">
                                    <Col md={2}>
                                        <Form.Select
                                            value={passengerData[index].title}
                                            onChange={(e) => {
                                                const updated = [...passengerData];
                                                updated[index].title = e.target.value;
                                                setPassengerData(updated);
                                            }}
                                            isInvalid={!!errors.passenger?.[index]?.title}
                                        >
                                            <option value="">Title</option>
                                            <option>Mr</option>
                                            <option>Ms</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.passenger?.[index]?.title}
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={2}>
                                        <Form.Control
                                            type="text"
                                            placeholder="First Name"
                                            value={passengerData[index].firstName}
                                            onChange={(e) => {
                                                const updated = [...passengerData];
                                                updated[index].firstName = e.target.value;
                                                setPassengerData(updated);
                                            }}
                                            isInvalid={!!errors.passenger?.[index]?.firstName}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.passenger?.[index]?.firstName}
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={2}>
                                        <Form.Control
                                            type="text"
                                            placeholder="Last Name"
                                            value={passengerData[index].lastName}
                                            onChange={(e) => {
                                                const updated = [...passengerData];
                                                updated[index].lastName = e.target.value;
                                                setPassengerData(updated);
                                            }}
                                            isInvalid={!!errors.passenger?.[index]?.lastName}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.passenger?.[index]?.lastName}
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={2}>
                                        <Form.Control
                                            type="number"
                                            placeholder="Age"
                                            value={passengerData[index].age}
                                            onChange={(e) => {
                                                const updated = [...passengerData];
                                                updated[index].age = e.target.value;
                                                setPassengerData(updated);
                                            }}
                                            isInvalid={!!errors.passenger?.[index]?.age}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.passenger?.[index]?.age}
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={2}>
                                        <Form.Select
                                            value={passengerData[index].idType}
                                            onChange={(e) => {
                                                const updated = [...passengerData];
                                                updated[index].idType = e.target.value;
                                                setPassengerData(updated);
                                            }}
                                            isInvalid={!!errors.passenger?.[index]?.idType}
                                        >
                                            <option value="">ID Type</option>
                                            <option>Aadhaar Card</option>
                                            <option>PAN Card</option>
                                            <option>Voter ID Card</option>
                                            <option>Driving Licence</option>
                                            <option>Passport</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.passenger?.[index]?.idType}
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={2}>
                                        <Form.Control
                                            type="text"
                                            placeholder="ID Number"
                                            value={passengerData[index].idNumber}
                                            onChange={(e) => {
                                                const updated = [...passengerData];
                                                updated[index].idNumber = e.target.value;
                                                setPassengerData(updated);
                                            }}
                                            isInvalid={!!errors.passenger?.[index]?.idNumber}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.passenger?.[index]?.idNumber}
                                        </Form.Control.Feedback>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))}
                </Card.Body>
            </Card>

            {/* Contact Details */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body>
                    <h5 className="fw-bold">Contact Details</h5>
                    <Row className="g-2">
                        <Col md={3}>
                            <Form.Select
                                value={contactData.countryCode}
                                onChange={(e) => setContactData({ ...contactData, countryCode: e.target.value })}
                            >
                                <option>India (91)</option>
                                <option>US (+1)</option>
                            </Form.Select>
                        </Col>

                        <Col md={4}>
                            <Form.Control
                                type="text"
                                placeholder="Mobile Number"
                                value={contactData.mobile}
                                onChange={(e) => setContactData({ ...contactData, mobile: e.target.value })}
                                isInvalid={!!errors.contact?.mobile}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.contact?.mobile}
                            </Form.Control.Feedback>
                        </Col>

                        <Col md={5}>
                            <Form.Control
                                type="email"
                                placeholder="Email"
                                value={contactData.email}
                                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                                isInvalid={!!errors.contact?.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.contact?.email}
                            </Form.Control.Feedback>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* GST Form */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={9}>
                            <h6 className="fw-bold mb-1">Use GSTIN for this booking (Optional)</h6>
                        </Col>
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
                                        isInvalid={!!errors.gst?.gstNumber}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.gst?.gstNumber}
                                    </Form.Control.Feedback>
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
                                        isInvalid={!!errors.gst?.email}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.gst?.email}
                                    </Form.Control.Feedback>
                                </Col>

                                <Col md={6}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Address"
                                        value={gstData.address}
                                        onChange={(e) => setGstData({ ...gstData, address: e.target.value })}
                                    />
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Card.Body>
            </Card>

            <div className="text-start mt-3">
                <Button onClick={handleContinue} className='btn-red'>
                    Continue Booking
                </Button>
            </div>
        </div>
    );
};

export default BusTravellerinfo;
