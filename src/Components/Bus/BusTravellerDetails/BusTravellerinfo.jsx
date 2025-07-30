import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert, Badge, Spinner } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaReceipt, FaArrowLeft } from 'react-icons/fa';

const BusTravellerinfo = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const selectedSeats = state?.selectedSeats || [];

    // Initialize states
    const [showGstinForm, setShowGstinForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [passengerData, setPassengerData] = useState(
        selectedSeats.map((seat, index) => ({
            seatName: seat.SeatName,
            title: '',
            firstName: '',
            lastName: '',
            age: '',
            gender: '',
            idType: '',
            idNumber: '',
            isLeadPassenger: index === 0
        }))
    );

    const [contactData, setContactData] = useState({
        countryCode: '+91',
        mobile: '',
        email: '',
        alternatePhone: ''
    });

    const [gstData, setGstData] = useState({
        gstNumber: '',
        companyName: '',
        contactNo: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [errors, setErrors] = useState({
        passenger: [],
        contact: {},
        gst: {}
    });

    const [touchedFields, setTouchedFields] = useState({
        passenger: [],
        contact: {},
        gst: {}
    });

    // Validation Functions
    const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isMobileValid = (number) => /^[6-9]\d{9}$/.test(number);
    const isNameValid = (name) => /^[a-zA-Z\s]{2,30}$/.test(name);
    const isGstValid = (gst) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(gst);
    const isPincodeValid = (pincode) => /^[1-9][0-9]{5}$/.test(pincode);

    // Handle field blur for validation
    const handleFieldBlur = (section, field, index = null) => {
        setTouchedFields(prev => {
            if (section === 'passenger' && index !== null) {
                const newTouched = [...prev.passenger];
                if (!newTouched[index]) newTouched[index] = {};
                newTouched[index][field] = true;
                return { ...prev, passenger: newTouched };
            } else {
                return {
                    ...prev,
                    [section]: { ...prev[section], [field]: true }
                };
            }
        });
    };

    // Real-time validation
    const validatePassenger = (passenger, index) => {
        const errors = {};
        const touched = touchedFields.passenger[index] || {};

        if (touched.title && !passenger.title) errors.title = "Title is required";
        if (touched.firstName && !isNameValid(passenger.firstName)) errors.firstName = "Enter valid first name (2-30 characters)";
        if (touched.lastName && !isNameValid(passenger.lastName)) errors.lastName = "Enter valid last name (2-30 characters)";
        if (touched.age && (!passenger.age || passenger.age < 1 || passenger.age > 120)) errors.age = "Enter valid age (1-120)";
        if (touched.gender && !passenger.gender) errors.gender = "Gender is required";
        if (touched.idType && !passenger.idType) errors.idType = "ID type is required";
        if (touched.idNumber && !passenger.idNumber) errors.idNumber = "ID number is required";

        return errors;
    };

    const validateContact = () => {
        const errors = {};
        const touched = touchedFields.contact;

        if (touched.mobile && !isMobileValid(contactData.mobile)) {
            errors.mobile = "Enter valid 10-digit mobile number";
        }
        if (touched.email && !isEmailValid(contactData.email)) {
            errors.email = "Enter valid email address";
        }

        return errors;
    };

    const validateGst = () => {
        const errors = {};
        const touched = touchedFields.gst;

        if (showGstinForm) {
            if (touched.gstNumber && gstData.gstNumber && !isGstValid(gstData.gstNumber)) {
                errors.gstNumber = "Enter valid GST number (15 digits)";
            }
            if (touched.email && gstData.email && !isEmailValid(gstData.email)) {
                errors.email = "Enter valid email address";
            }
            if (touched.contactNo && gstData.contactNo && !isMobileValid(gstData.contactNo)) {
                errors.contactNo = "Enter valid contact number";
            }
            if (touched.pincode && gstData.pincode && !isPincodeValid(gstData.pincode)) {
                errors.pincode = "Enter valid pincode";
            }
        }

        return errors;
    };

    // Update errors in real-time
    useEffect(() => {
        const newPassengerErrors = passengerData.map((passenger, index) => validatePassenger(passenger, index));
        const newContactErrors = validateContact();
        const newGstErrors = validateGst();

        setErrors({
            passenger: newPassengerErrors,
            contact: newContactErrors,
            gst: newGstErrors
        });
    }, [passengerData, contactData, gstData, touchedFields, showGstinForm]);

    // Handle passenger data change
    const handlePassengerChange = (index, field, value) => {
        const updated = [...passengerData];
        updated[index] = { ...updated[index], [field]: value };
        setPassengerData(updated);
    };

    // Handle contact data change
    const handleContactChange = (field, value) => {
        setContactData(prev => ({ ...prev, [field]: value }));
    };

    // Handle GST data change
    const handleGstChange = (field, value) => {
        setGstData(prev => ({ ...prev, [field]: value }));
    };

    // Validate all fields before submission
    const validateAll = () => {
        let hasError = false;
        const newPassengerErrors = [];
        const newContactErrors = {};
        const newGstErrors = {};

        // Validate all passengers
        passengerData.forEach((passenger, index) => {
            const errors = {};
            if (!passenger.title) errors.title = "Title is required";
            if (!isNameValid(passenger.firstName)) errors.firstName = "Enter valid first name";
            if (!isNameValid(passenger.lastName)) errors.lastName = "Enter valid last name";
            if (!passenger.age || passenger.age < 1 || passenger.age > 120) errors.age = "Enter valid age";
            if (!passenger.gender) errors.gender = "Gender is required";
            if (!passenger.idType) errors.idType = "ID type is required";
            if (!passenger.idNumber) errors.idNumber = "ID number is required";

            if (Object.keys(errors).length) hasError = true;
            newPassengerErrors.push(errors);
        });

        // Validate contact
        if (!isMobileValid(contactData.mobile)) {
            newContactErrors.mobile = "Enter valid 10-digit mobile number";
            hasError = true;
        }
        if (!isEmailValid(contactData.email)) {
            newContactErrors.email = "Enter valid email address";
            hasError = true;
        }

        // Validate GST if form is shown
        if (showGstinForm) {
            if (gstData.gstNumber && !isGstValid(gstData.gstNumber)) {
                newGstErrors.gstNumber = "Enter valid GST number";
                hasError = true;
            }
            if (gstData.email && !isEmailValid(gstData.email)) {
                newGstErrors.email = "Enter valid email address";
                hasError = true;
            }
            if (gstData.contactNo && !isMobileValid(gstData.contactNo)) {
                newGstErrors.contactNo = "Enter valid contact number";
                hasError = true;
            }
            if (gstData.pincode && !isPincodeValid(gstData.pincode)) {
                newGstErrors.pincode = "Enter valid pincode";
                hasError = true;
            }
        }

        return { hasError, newPassengerErrors, newContactErrors, newGstErrors };
    };

    const handleContinue = async () => {
        const validation = validateAll();

        if (validation.hasError) {
            setErrors({
                passenger: validation.newPassengerErrors,
                contact: validation.newContactErrors,
                gst: validation.newGstErrors
            });

            // Scroll to first error
            const firstErrorElement = document.querySelector('.is-invalid');
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Navigate to next step with all data
            navigate("/bus-review", {
                state: {
                    ...state,
                    passengerData,
                    contactData,
                    gstData: showGstinForm ? gstData : null,
                },
            });
        } catch (error) {
            console.error("Error submitting passenger data:", error);
            // Handle error appropriately
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (!state) {
        return (
            <div className="container py-5 text-center">
                <Alert variant="warning">
                    <h5>No booking data found</h5>
                    <p>Please start your booking process from the beginning.</p>
                    <Button variant="primary" onClick={() => navigate("/")}>Go Home</Button>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container my-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">
                        <FaUser className="me-2 text-primary" />
                        Passenger Details
                    </h4>
                    <p className="text-muted mb-0">
                        Fill in the details for {selectedSeats.length} passenger{selectedSeats.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button variant="outline-secondary" onClick={handleGoBack}>
                    <FaArrowLeft className="me-2" />
                    Back
                </Button>
            </div>

            {/* Booking Summary Bar */}
            <Card className="mb-4 bg-primary bg-opacity-10 border-primary">
                <Card.Body className="py-3">
                    <Row className="align-items-center">
                        <Col md={6}>
                            <div className="d-flex align-items-center">
                                <Badge bg="primary" className="me-3">{selectedSeats.length}</Badge>
                                <div>
                                    <div className="fw-semibold">{state.fromCity} → {state.toCity}</div>
                                    <div className="text-muted small">{state.departDate} • {state.departTime}</div>
                                </div>
                            </div>
                        </Col>
                        <Col md={6} className="text-md-end">
                            <div className="fw-bold text-success">₹ {state.totalPrice?.toLocaleString()}</div>
                            <div className="text-muted small">Total Fare</div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Passenger Details */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="bg-light">
                    <h5 className="mb-0">
                        <FaIdCard className="me-2" />
                        Passenger Information
                    </h5>
                </Card.Header>
                <Card.Body>
                    {selectedSeats.map((seat, index) => (
                        <Card className="border mb-3" key={index}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center">
                                        <Badge bg={index === 0 ? "primary" : "secondary"} className="me-2">
                                            {index === 0 ? "Lead Passenger" : `Passenger ${index + 1}`}
                                        </Badge>
                                        <span className="fw-semibold">Seat {seat.SeatName}</span>
                                    </div>
                                    {index === 0 && (
                                        <small className="text-muted">* Primary contact person</small>
                                    )}
                                </div>

                                <Row className="g-3">
                                    <Col md={2}>
                                        <Form.Label>Title *</Form.Label>
                                        <Form.Select
                                            value={passengerData[index].title}
                                            onChange={(e) => handlePassengerChange(index, 'title', e.target.value)}
                                            onBlur={() => handleFieldBlur('passenger', 'title', index)}
                                            isInvalid={!!errors.passenger?.[index]?.title}
                                        >
                                            <option value="">Select</option>
                                            <option value="Mr">Mr</option>
                                            <option value="Ms">Ms</option>
                                            <option value="Mrs">Mrs</option>
                                            <option value="Dr">Dr</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.passenger?.[index]?.title}
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={3}>
                                        <Form.Label>First Name *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter first name"
                                            value={passengerData[index].firstName}
                                            onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                                            onBlur={() => handleFieldBlur('passenger', 'firstName', index)}
                                            isInvalid={!!errors.passenger?.[index]?.firstName}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.passenger?.[index]?.firstName}
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={3}>
                                        <Form.Label>Last Name *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter last name"
                                            value={passengerData[index].lastName}
                                            onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                                            onBlur={() => handleFieldBlur('passenger', 'lastName', index)}
                                            isInvalid={!!errors.passenger?.[index]?.lastName}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.passenger?.[index]?.lastName}
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={2}>
                                        <Form.Label>Age *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Age"
                                            min="1"
                                            max="120"
                                            value={passengerData[index].age}
                                            onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                                            onBlur={() => handleFieldBlur('passenger', 'age', index)}
                                            isInvalid={!!errors.passenger?.[index]?.age}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.passenger?.[index]?.age}
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={2}>
                                        <Form.Label>Gender *</Form.Label>
                                        <Form.Select
                                            value={passengerData[index].gender}
                                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                            onBlur={() => handleFieldBlur('passenger', 'gender', index)}
                                            isInvalid={!!errors.passenger?.[index]?.gender}
                                        >
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.passenger?.[index]?.gender}
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Label>ID Type *</Form.Label>
                                        <Form.Select
                                            value={passengerData[index].idType}
                                            onChange={(e) => handlePassengerChange(index, 'idType', e.target.value)}
                                            onBlur={() => handleFieldBlur('passenger', 'idType', index)}
                                            isInvalid={!!errors.passenger?.[index]?.idType}
                                        >
                                            <option value="">Select ID Type</option>
                                            <option value="Aadhaar Card">Aadhaar Card</option>
                                            <option value="PAN Card">PAN Card</option>
                                            <option value="Voter ID Card">Voter ID Card</option>
                                            <option value="Driving Licence">Driving Licence</option>
                                            <option value="Passport">Passport</option>
                                            <option value="College ID">College ID</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.passenger?.[index]?.idType}
                                        </Form.Control.Feedback>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Label>ID Number *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter ID number"
                                            value={passengerData[index].idNumber}
                                            onChange={(e) => handlePassengerChange(index, 'idNumber', e.target.value)}
                                            onBlur={() => handleFieldBlur('passenger', 'idNumber', index)}
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
                <Card.Header className="bg-light">
                    <h5 className="mb-0">
                        <FaPhone className="me-2" />
                        Contact Information
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        <Col md={3}>
                            <Form.Label>Country Code</Form.Label>
                            <Form.Select
                                value={contactData.countryCode}
                                onChange={(e) => handleContactChange('countryCode', e.target.value)}
                            >
                                <option value="+91">🇮🇳 India (+91)</option>
                                <option value="+1">🇺🇸 USA (+1)</option>
                                <option value="+44">🇬🇧 UK (+44)</option>
                                <option value="+971">🇦🇪 UAE (+971)</option>
                            </Form.Select>
                        </Col>

                        <Col md={4}>
                            <Form.Label>Mobile Number *</Form.Label>
                            <Form.Control
                                type="tel"
                                placeholder="Enter 10-digit mobile number"
                                value={contactData.mobile}
                                onChange={(e) => handleContactChange('mobile', e.target.value)}
                                onBlur={() => handleFieldBlur('contact', 'mobile')}
                                isInvalid={!!errors.contact?.mobile}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.contact?.mobile}
                            </Form.Control.Feedback>
                        </Col>

                        <Col md={5}>
                            <Form.Label>Email Address *</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email address"
                                value={contactData.email}
                                onChange={(e) => handleContactChange('email', e.target.value)}
                                onBlur={() => handleFieldBlur('contact', 'email')}
                                isInvalid={!!errors.contact?.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.contact?.email}
                            </Form.Control.Feedback>
                            <Form.Text className="text-muted">
                                Booking confirmation will be sent to this email
                            </Form.Text>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* GST Details */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="bg-light">
                    <Row className="align-items-center">
                        <Col md={9}>
                            <h5 className="mb-0">
                                <FaReceipt className="me-2" />
                                GST Invoice Details
                            </h5>
                            <small className="text-muted">Optional - Add GST details for business travel</small>
                        </Col>
                        <Col md={3} className="text-end">
                            <Button
                                variant={showGstinForm ? "outline-danger" : "outline-primary"}
                                onClick={() => setShowGstinForm(!showGstinForm)}
                                size="sm"
                            >
                                {showGstinForm ? 'Remove GST' : 'Add GST Details'}
                            </Button>
                        </Col>
                    </Row>
                </Card.Header>

                {showGstinForm && (
                    <Card.Body>
                        <Alert variant="info" className="mb-3">
                            <small>
                                📋 Fill in your company GST details to receive a GST invoice for this booking.
                            </small>
                        </Alert>

                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Label>GST Number *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter 15-digit GST number"
                                    value={gstData.gstNumber}
                                    onChange={(e) => handleGstChange('gstNumber', e.target.value.toUpperCase())}
                                    onBlur={() => handleFieldBlur('gst', 'gstNumber')}
                                    isInvalid={!!errors.gst?.gstNumber}
                                    maxLength={15}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.gst?.gstNumber}
                                </Form.Control.Feedback>
                            </Col>

                            <Col md={6}>
                                <Form.Label>Company Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter registered company name"
                                    value={gstData.companyName}
                                    onChange={(e) => handleGstChange('companyName', e.target.value)}
                                    onBlur={() => handleFieldBlur('gst', 'companyName')}
                                />
                            </Col>

                            <Col md={4}>
                                <Form.Label>Contact Number</Form.Label>
                                <Form.Control
                                    type="tel"
                                    placeholder="Company contact number"
                                    value={gstData.contactNo}
                                    onChange={(e) => handleGstChange('contactNo', e.target.value)}
                                    onBlur={() => handleFieldBlur('gst', 'contactNo')}
                                    isInvalid={!!errors.gst?.contactNo}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.gst?.contactNo}
                                </Form.Control.Feedback>
                            </Col>

                            <Col md={4}>
                                <Form.Label>Company Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Company email address"
                                    value={gstData.email}
                                    onChange={(e) => handleGstChange('email', e.target.value)}
                                    onBlur={() => handleFieldBlur('gst', 'email')}
                                    isInvalid={!!errors.gst?.email}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.gst?.email}
                                </Form.Control.Feedback>
                            </Col>

                            <Col md={4}>
                                <Form.Label>Pincode</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Area pincode"
                                    value={gstData.pincode}
                                    onChange={(e) => handleGstChange('pincode', e.target.value)}
                                    onBlur={() => handleFieldBlur('gst', 'pincode')}
                                    isInvalid={!!errors.gst?.pincode}
                                    maxLength={6}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.gst?.pincode}
                                </Form.Control.Feedback>
                            </Col>

                            <Col md={8}>
                                <Form.Label>Registered Address</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Enter complete registered address"
                                    value={gstData.address}
                                    onChange={(e) => handleGstChange('address', e.target.value)}
                                    onBlur={() => handleFieldBlur('gst', 'address')}
                                />
                            </Col>

                            <Col md={4}>
                                <Row>
                                    <Col md={12} className="mb-2">
                                        <Form.Label>City</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="City"
                                            value={gstData.city}
                                            onChange={(e) => handleGstChange('city', e.target.value)}
                                        />
                                    </Col>
                                    <Col md={12}>
                                        <Form.Label>State</Form.Label>
                                        <Form.Select
                                            value={gstData.state}
                                            onChange={(e) => handleGstChange('state', e.target.value)}
                                        >
                                            <option value="">Select State</option>
                                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                                            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                            <option value="Assam">Assam</option>
                                            <option value="Bihar">Bihar</option>
                                            <option value="Chhattisgarh">Chhattisgarh</option>
                                            <option value="Goa">Goa</option>
                                            <option value="Gujarat">Gujarat</option>
                                            <option value="Haryana">Haryana</option>
                                            <option value="Himachal Pradesh">Himachal Pradesh</option>
                                            <option value="Jharkhand">Jharkhand</option>
                                            <option value="Karnataka">Karnataka</option>
                                            <option value="Kerala">Kerala</option>
                                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                                            <option value="Maharashtra">Maharashtra</option>
                                            <option value="Manipur">Manipur</option>
                                            <option value="Meghalaya">Meghalaya</option>
                                            <option value="Mizoram">Mizoram</option>
                                            <option value="Nagaland">Nagaland</option>
                                            <option value="Odisha">Odisha</option>
                                            <option value="Punjab">Punjab</option>
                                            <option value="Rajasthan">Rajasthan</option>
                                            <option value="Sikkim">Sikkim</option>
                                            <option value="Tamil Nadu">Tamil Nadu</option>
                                            <option value="Telangana">Telangana</option>
                                            <option value="Tripura">Tripura</option>
                                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                                            <option value="Uttarakhand">Uttarakhand</option>
                                            <option value="West Bengal">West Bengal</option>
                                            <option value="Delhi">Delhi</option>
                                        </Form.Select>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card.Body>
                )}
            </Card>

            {/* Important Information */}
            <Card className="mb-4 border-warning bg-warning bg-opacity-10">
                <Card.Body className="py-3">
                    <h6 className="text-warning mb-2">
                        ⚠️ Important Information
                    </h6>
                    <Row>
                        <Col md={6}>
                            <ul className="text-muted small mb-0 ps-3">
                                <li>Ensure all passenger names match their ID proofs exactly</li>
                                <li>Children above 5 years need separate tickets</li>
                                <li>Senior citizen discounts may apply (ask operator)</li>
                            </ul>
                        </Col>
                        <Col md={6}>
                            <ul className="text-muted small mb-0 ps-3">
                                <li>ID proof is mandatory for all passengers during travel</li>
                                <li>Contact details will be used for booking updates</li>
                                <li>GST invoice will be sent to company email if provided</li>
                            </ul>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Action Buttons */}
            <div className="d-flex justify-content-between align-items-center mt-4">
                <Button
                    variant="outline-secondary"
                    onClick={handleGoBack}
                    disabled={isSubmitting}
                    className="px-4"
                >
                    <FaArrowLeft className="me-2" />
                    Back to Review
                </Button>

                <Button
                    onClick={handleContinue}
                    disabled={isSubmitting}
                    className="btn-red px-5 py-2"
                    style={{ fontSize: '1.1rem' }}
                >
                    {isSubmitting ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Processing...
                        </>
                    ) : (
                        <>
                            Continue to Payment →
                        </>
                    )}
                </Button>
            </div>

            {/* Progress Indicator */}
            <div className="mt-4">
                <div className="d-flex justify-content-center">
                    <div className="d-flex align-items-center text-muted small">
                        <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                                style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                                ✓
                            </div>
                            <span className="mx-2">Seat Selection</span>
                        </div>
                        <div className="mx-2">→</div>
                        <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                                style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                                ✓
                            </div>
                            <span className="mx-2">Review Details</span>
                        </div>
                        <div className="mx-2">→</div>
                        <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                                3
                            </div>
                            <span className="mx-2 fw-semibold">Passenger Details</span>
                        </div>
                        <div className="mx-2">→</div>
                        <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-light text-muted d-flex align-items-center justify-content-center"
                                style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                                4
                            </div>
                            <span className="mx-2">Payment</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusTravellerinfo;