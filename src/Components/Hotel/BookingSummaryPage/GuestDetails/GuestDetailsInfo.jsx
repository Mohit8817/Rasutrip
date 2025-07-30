import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FaEnvelope } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const GuestDetailsInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { hotel, room, roomDetails, payload, priceDetails, existingGuestData } = location.state || {};

  // ✅ Initialize with existing data if coming back from review page
  const initializeGuestInputs = () => {
    if (existingGuestData?.guestInputs) {
      console.log('🔄 Restoring existing guest data:', existingGuestData.guestInputs);
      return existingGuestData.guestInputs;
    }

    return roomDetails?.map((room, roomIndex) => ({
      adults: Array.from({ length: room.adults }, (_, index) => ({
        title: 'Mr',
        firstName: '',
        lastName: '',
        panNumber: '',
        age: '',
        LeadPassenger: roomIndex === 0 && index === 0 ? "true" : "false"
      })),
      children: Array.from({ length: room.children }, () => ({
        title: 'Master',
        firstName: '',
        lastName: '',
        age: ''
      }))
    }));
  };

  const [guestInputs, setGuestInputs] = useState(initializeGuestInputs());

  // ✅ Initialize with existing contact data if available
  const [email, setEmail] = useState(existingGuestData?.email || '');
  const [mobile, setMobile] = useState(existingGuestData?.mobile || '');
  const [errors, setErrors] = useState({});

  // ✅ Initialize GST form state based on existing data
  const [showGstinForm, setShowGstinForm] = useState(
    existingGuestData?.gstData?.gstNumber ? true : false
  );
  const [gstData, setGstData] = useState(existingGuestData?.gstData || {
    gstNumber: '',
    companyName: '',
    contactNo: '',
    email: '',
    address: ''
  });

  // ✅ Debug: Log when component mounts with existing data
  useEffect(() => {
    if (existingGuestData) {
      console.log('📝 Guest Details Form loaded with existing data:', {
        email: existingGuestData.email,
        mobile: existingGuestData.mobile,
        guestInputs: existingGuestData.guestInputs,
        gstData: existingGuestData.gstData
      });
    }
  }, [existingGuestData]);

  // ✅ Enhanced validation functions
  const isAlpha = str => /^[A-Za-z\s]+$/.test(str?.trim());
  const isEmail = str => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str?.trim());
  const isMobile = str => /^[0-9]{10}$/.test(str?.trim());
  const isValidPAN = pan => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan?.trim());
  const isValidGST = gst => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst?.trim());

  // ✅ FIXED: Enhanced PAN input handler
  const handleInputChange = (roomIndex, type, personIndex, field, value) => {
    const updatedInputs = [...guestInputs];
    
    // ✅ Special handling for PAN field
    if (field === 'panNumber') {
      // Remove spaces and convert to uppercase
      const cleanValue = value.replace(/\s/g, '').toUpperCase();
      updatedInputs[roomIndex][type][personIndex][field] = cleanValue;
      
      // Real-time PAN validation feedback
      const errorKey = `${type === 'adults' ? 'adult' : 'child'}-${roomIndex}-${personIndex}-pan`;
      if (cleanValue && cleanValue.length === 10 && isValidPAN(cleanValue)) {
        // Valid PAN - clear any existing error
        if (errors[errorKey]) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[errorKey];
            return newErrors;
          });
        }
      }
    } else {
      updatedInputs[roomIndex][type][personIndex][field] = value;
    }
    
    setGuestInputs(updatedInputs);

    // ✅ Clear specific field error when user starts typing
    const errorKey = `${type === 'adults' ? 'adult' : 'child'}-${roomIndex}-${personIndex}-${field === 'firstName' ? 'first' : field === 'lastName' ? 'last' : field === 'panNumber' ? 'pan' : 'age'}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // ✅ CRITICAL FIX: Enhanced PAN validation in Guest Details form
  const validateFields = () => {
    const newErrors = {};

    // ✅ Validate guest inputs
    if (!guestInputs || guestInputs.length === 0) {
      newErrors.general = 'No guest information found';
      setErrors(newErrors);
      return false;
    }

    guestInputs.forEach((room, roomIdx) => {
      // Validate adults
      if (room.adults && room.adults.length > 0) {
        room.adults.forEach((guest, i) => {
          // First Name validation
          if (!guest.firstName?.trim() || !isAlpha(guest.firstName)) {
            newErrors[`adult-${roomIdx}-${i}-first`] = 'Only letters allowed';
          }
          
          // Last Name validation
          if (!guest.lastName?.trim() || !isAlpha(guest.lastName)) {
            newErrors[`adult-${roomIdx}-${i}-last`] = 'Only letters allowed';
          }
          
          // ✅ ENHANCED PAN validation - specifically handles empty spaces
          const panValue = guest.panNumber?.trim() || '';
          
          // Check if PAN is empty or contains only spaces
          if (!panValue || panValue.replace(/\s/g, '') === '') {
            newErrors[`adult-${roomIdx}-${i}-pan`] = 'PAN number is required for all adults';
          } else if (!isValidPAN(panValue)) {
            newErrors[`adult-${roomIdx}-${i}-pan`] = 'Enter valid PAN (e.g. ABCDE1234F)';
          }
          
          // Age validation
          if (!guest.age || isNaN(guest.age) || parseInt(guest.age) < 18) {
            newErrors[`adult-${roomIdx}-${i}-age`] = 'Enter valid age (18+)';
          }
        });
      }

      // Validate children (existing code remains same)
      if (room.children && room.children.length > 0) {
        room.children.forEach((guest, i) => {
          if (!guest.firstName?.trim() || !isAlpha(guest.firstName)) {
            newErrors[`child-${roomIdx}-${i}-first`] = 'Only letters allowed';
          }
          if (!guest.lastName?.trim() || !isAlpha(guest.lastName)) {
            newErrors[`child-${roomIdx}-${i}-last`] = 'Only letters allowed';
          }
          if (!guest.age || isNaN(guest.age) || parseInt(guest.age) >= 18 || parseInt(guest.age) < 1) {
            newErrors[`child-${roomIdx}-${i}-age`] = 'Enter valid child age (1-17)';
          }
        });
      }
    });

    // ✅ Contact information validation
    if (!isMobile(mobile)) {
      newErrors.mobile = 'Enter a valid 10-digit number';
    }
    if (!isEmail(email)) {
      newErrors.email = 'Enter a valid email';
    }

    // ✅ GST validation
    if (showGstinForm && gstData.gstNumber?.trim()) {
      if (!isValidGST(gstData.gstNumber)) {
        newErrors.gstGstNumber = 'Enter valid GST number';
      }
      if (!gstData.companyName?.trim()) {
        newErrors.gstCompanyName = 'Company name is required';
      }
      if (!gstData.contactNo?.trim()) {
        newErrors.gstContactNo = 'Contact number is required';
      }
      if (!gstData.email?.trim() || !isEmail(gstData.email)) {
        newErrors.gstEmail = 'Valid email is required';
      }
      if (!gstData.address?.trim()) {
        newErrors.gstAddress = 'Address is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ FIXED: Function to create booking payload with proper PAN for all adults
  const createBookingPayload = (updatedGuestInputs, emailValue, mobileValue, gstInfo) => {
    console.log('🏗️ Creating booking payload with proper PAN handling...');

    // Create HotelRoomsDetails structure
    const HotelRoomsDetails = updatedGuestInputs.map((room, roomIndex) => {
      const roomData = {
        RoomIndex: roomIndex + 1,
        HotelPassenger: []
      };

      // Process adults
      room.adults.forEach((adult, adultIndex) => {
        const isLeadPassenger = roomIndex === 0 && adultIndex === 0;

        const passengerData = {
          Title: adult.title,
          FirstName: adult.firstName?.trim(),
          MiddleName: "",
          LastName: adult.lastName?.trim(),
          Phoneno: mobileValue.trim(),
          Email: emailValue.trim(),
          PaxType: 1, // Adult
          LeadPassenger: isLeadPassenger ? "true" : "false",
          Age: parseInt(adult.age),
          PassportNo: null,
          PassportIssueDate: null,
          PassportExpDate: null,
          // ✅ CRITICAL FIX: PAN is required for ALL adults, not just lead passenger
          PAN: adult.panNumber?.trim().toUpperCase(),

          // ✅ GST fields - ONLY for lead passenger
          GSTCompanyAddress: (isLeadPassenger && gstInfo?.gstNumber) ? gstInfo.address.trim() : null,
          GSTCompanyContactNumber: (isLeadPassenger && gstInfo?.gstNumber) ? gstInfo.contactNo.trim() : null,
          GSTCompanyEmail: (isLeadPassenger && gstInfo?.gstNumber) ? gstInfo.email.trim() : null,
          GSTCompanyName: (isLeadPassenger && gstInfo?.gstNumber) ? gstInfo.companyName.trim() : null,
          GSTNumber: (isLeadPassenger && gstInfo?.gstNumber) ? gstInfo.gstNumber.trim().toUpperCase() : null
        };

        console.log(`${isLeadPassenger ? '👑' : '👤'} ${isLeadPassenger ? 'Lead ' : ''}Adult: ${passengerData.FirstName} ${passengerData.LastName}`);
        console.log(`   PAN: ${passengerData.PAN || 'MISSING!'}`);
        console.log(`   GST Number: ${passengerData.GSTNumber || 'null'}`);

        // ✅ VALIDATION: Ensure PAN exists for adults
        if (!passengerData.PAN) {
          console.error(`❌ CRITICAL: Missing PAN for adult: ${passengerData.FirstName} ${passengerData.LastName}`);
        }

        roomData.HotelPassenger.push(passengerData);
      });

      // Process children
      room.children.forEach((child) => {
        const childData = {
          Title: child.title,
          FirstName: child.firstName?.trim(),
          MiddleName: "",
          LastName: child.lastName?.trim(),
          Phoneno: mobileValue.trim(),
          Email: emailValue.trim(),
          PaxType: 2, // Child
          LeadPassenger: "false",
          Age: parseInt(child.age),
          PassportNo: null,
          PassportIssueDate: null,
          PassportExpDate: null,
          // ✅ Children don't need PAN
          PAN: null,

          // ✅ GST fields - NULL for children
          GSTCompanyAddress: null,
          GSTCompanyContactNumber: null,
          GSTCompanyEmail: null,
          GSTCompanyName: null,
          GSTNumber: null
        };

        console.log(`👶 Child: ${childData.FirstName} ${childData.LastName} (Age: ${childData.Age})`);
        roomData.HotelPassenger.push(childData);
      });

      return roomData;
    });

    // Create complete booking payload
    const bookingPayload = {
      ResultIndex: payload?.ResultIndex || hotel?.ResultIndex,
      HotelCode: payload?.HotelCode || hotel?.HotelCode,
      HotelName: payload?.HotelName || hotel?.HotelName,
      SearchTokenId: payload?.SearchTokenId,
      GuestNationality: payload?.GuestNationality || "IN",
      NoOfRooms: String(roomDetails?.length || 1),
      ClientReferenceNo: 0,
      IsVoucherBooking: "true",
      vendorCommission: priceDetails?.vendorCommission || 0,
      CouponDiscount: 0,
      UserIp: "0.0.0.0",
      HotelRoomsDetails
    };

    // ✅ Verify PAN assignment for all adults
    console.log('\n=== PAN Assignment Verification ===');
    let adultsWithPAN = 0;
    let adultsWithoutPAN = 0;
    let leadWithGST = 0;

    HotelRoomsDetails.forEach((room, roomIndex) => {
      room.HotelPassenger.forEach((passenger, passengerIndex) => {
        if (passenger.PaxType === 1) { // Adult
          if (passenger.PAN) {
            adultsWithPAN++;
            console.log(`✅ Adult with PAN: ${passenger.FirstName} ${passenger.LastName} - ${passenger.PAN}`);
          } else {
            adultsWithoutPAN++;
            console.error(`❌ Adult WITHOUT PAN: ${passenger.FirstName} ${passenger.LastName}`);
          }

          if (passenger.LeadPassenger === "true" && passenger.GSTNumber) {
            leadWithGST++;
            console.log(`✅ Lead passenger has GST: ${passenger.FirstName} ${passenger.LastName}`);
          }
        }
      });
    });

    console.log(`\n📊 PAN Summary: ${adultsWithPAN} adults with PAN, ${adultsWithoutPAN} adults without PAN`);
    console.log(`📊 GST Summary: ${leadWithGST} lead with GST`);

    if (adultsWithoutPAN > 0) {
      console.error('🚨 CRITICAL ERROR: Some adults are missing PAN numbers!');
      throw new Error(`${adultsWithoutPAN} adult(s) are missing PAN numbers. All adults must have PAN numbers.`);
    } else {
      console.log('✅ PAN validation successful - all adults have PAN numbers');
    }

    return bookingPayload;
  };

  const handleContinue = () => {
    if (!validateFields()) {
      console.log('❌ Validation failed:', errors);
      // Scroll to first error
      const firstErrorElement = document.querySelector('.is-invalid');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // ✅ Ensure LeadPassenger is properly set as STRING
    const updatedGuestInputs = guestInputs.map((room, roomIndex) => ({
      ...room,
      adults: room.adults.map((adult, adultIndex) => ({
        ...adult,
        firstName: adult.firstName?.trim(),
        lastName: adult.lastName?.trim(),
        panNumber: adult.panNumber?.trim().toUpperCase(),
        age: parseInt(adult.age),
        LeadPassenger: roomIndex === 0 && adultIndex === 0 ? "true" : "false"
      })),
      children: room.children.map(child => ({
        ...child,
        firstName: child.firstName?.trim(),
        lastName: child.lastName?.trim(),
        age: parseInt(child.age)
      }))
    }));

    // ✅ Prepare GST data (only if GST form is shown and has data)
    const gstInfo = (showGstinForm && gstData.gstNumber?.trim()) ? {
      gstNumber: gstData.gstNumber.trim().toUpperCase(),
      companyName: gstData.companyName.trim(),
      contactNo: gstData.contactNo.trim(),
      email: gstData.email.trim(),
      address: gstData.address.trim()
    } : null;

    // ✅ Create booking payload with GST filtering
    const hotelBookingDetails = createBookingPayload(
      updatedGuestInputs,
      email.trim(),
      mobile.trim(),
      gstInfo
    );

    const bookingState = {
      hotel,
      room,
      roomDetails,
      priceDetails,
      guestInputs: updatedGuestInputs,
      email: email.trim(),
      mobile: mobile.trim(),
      payload,
      hotelBookingDetails, // ✅ This now has GST only for lead passenger
      ...(gstInfo ? { gstData: gstInfo } : {})
    };

    console.log('🚀 Navigating to review with state:', bookingState);
    console.log('📦 Hotel Booking Details (with GST filtering):', hotelBookingDetails);

    navigate('/Hotelreview', { state: bookingState });
  };

  // ✅ Handle email/mobile change with error clearing
  const handleEmailChange = (value) => {
    setEmail(value);
    if (errors.email) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  const handleMobileChange = (value) => {
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 10) {
      setMobile(numericValue);
      if (errors.mobile) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.mobile;
          return newErrors;
        });
      }
    }
  };

  // ✅ Handle GST data change with error clearing
  const handleGstDataChange = (field, value) => {
    setGstData(prev => ({ ...prev, [field]: value }));

    // Clear related GST errors
    const gstErrorKey = `gst${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[gstErrorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[gstErrorKey];
        return newErrors;
      });
    }
  };

  // ✅ Error boundary check
  if (!hotel || !room || !roomDetails) {
    return (
      <div className="container my-4">
        <Card className="shadow-sm border-0">
          <Card.Body className="text-center text-danger">
            <h5>❌ Missing Booking Data</h5>
            <p>Please go back to Hotel Details page and try again.</p>
            <Button variant="primary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="container my-4">
      {/* ✅ Error display */}
      {errors.general && (
        <Card className="mb-4 border-danger">
          <Card.Body className="text-danger">
            <strong>Error:</strong> {errors.general}
          </Card.Body>
        </Card>
      )}

      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Form autoComplete="on">
            <h5 className="fw-bold mb-2">Guest Details</h5>
            <p className="text-muted small mb-4">Please enter names as per Government ID. All fields are mandatory.</p>

            {roomDetails.map((room, roomIndex) => (
              <div key={roomIndex} className="border rounded p-3 mb-4">
                <div className="mb-3 fw-bold text-primary">
                  <FaEnvelope className="me-2" />
                  Room {roomIndex + 1} - {room.adults} Adult(s){room.children > 0 && `, ${room.children} Child(ren)`}
                </div>

                {/* Adults */}
                {guestInputs[roomIndex]?.adults?.map((guest, i) => (
                  <div key={`adult-${roomIndex}-${i}`} className="mb-4 p-3 bg-light rounded">
                    <Row className="align-items-center mb-3">
                      <Col lg={2} className="fw-bold">
                        Adult {i + 1}
                        {roomIndex === 0 && i === 0 && (
                          <span className="badge bg-primary ms-2 small">Lead Guest</span>
                        )}
                      </Col>
                      <Col lg={2}>
                        <Form.Select
                          value={guest.title}
                          onChange={(e) => handleInputChange(roomIndex, 'adults', i, 'title', e.target.value)}
                        >
                          <option value="Mr">Mr</option>
                          <option value="Ms">Ms</option>
                          <option value="Mrs">Mrs</option>
                        </Form.Select>
                      </Col>
                      <Col lg={4}>
                        <Form.Control
                          type="text"
                          placeholder="First Name *"
                          value={guest.firstName}
                          onChange={(e) => handleInputChange(roomIndex, 'adults', i, 'firstName', e.target.value)}
                          isInvalid={!!errors[`adult-${roomIndex}-${i}-first`]}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors[`adult-${roomIndex}-${i}-first`]}
                        </Form.Control.Feedback>
                      </Col>
                      <Col lg={4}>
                        <Form.Control
                          type="text"
                          placeholder="Last Name *"
                          value={guest.lastName}
                          onChange={(e) => handleInputChange(roomIndex, 'adults', i, 'lastName', e.target.value)}
                          isInvalid={!!errors[`adult-${roomIndex}-${i}-last`]}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors[`adult-${roomIndex}-${i}-last`]}
                        </Form.Control.Feedback>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Control
                          type="text"
                          placeholder="PAN Number (ABCDE1234F) *"
                          value={guest.panNumber}
                          onChange={(e) => handleInputChange(roomIndex, 'adults', i, 'panNumber', e.target.value.toUpperCase())}
                          isInvalid={!!errors[`adult-${roomIndex}-${i}-pan`]}
                          maxLength={10}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors[`adult-${roomIndex}-${i}-pan`]}
                        </Form.Control.Feedback>
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          type="number"
                          placeholder="Age (18+) *"
                          value={guest.age}
                          onChange={(e) => handleInputChange(roomIndex, 'adults', i, 'age', e.target.value)}
                          isInvalid={!!errors[`adult-${roomIndex}-${i}-age`]}
                          min="18"
                          max="99"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors[`adult-${roomIndex}-${i}-age`]}
                        </Form.Control.Feedback>
                      </Col>
                    </Row>
                  </div>
                ))}

                {/* Children */}
                {guestInputs[roomIndex]?.children?.map((guest, i) => (
                  <div key={`child-${roomIndex}-${i}`} className="mb-4 p-3 bg-warning bg-opacity-10 rounded">
                    <Row className="align-items-center mb-3">
                      <Col lg={2} className="fw-bold">
                        Child {i + 1}
                      </Col>
                      <Col lg={2}>
                        <Form.Select
                          value={guest.title}
                          onChange={(e) => handleInputChange(roomIndex, 'children', i, 'title', e.target.value)}
                        >
                          <option value="Master">Master</option>
                          <option value="Miss">Miss</option>
                        </Form.Select>
                      </Col>
                      <Col lg={4}>
                        <Form.Control
                          type="text"
                          placeholder="First Name *"
                          value={guest.firstName}
                          onChange={(e) => handleInputChange(roomIndex, 'children', i, 'firstName', e.target.value)}
                          isInvalid={!!errors[`child-${roomIndex}-${i}-first`]}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors[`child-${roomIndex}-${i}-first`]}
                        </Form.Control.Feedback>
                      </Col>
                      <Col lg={4}>
                        <Form.Control
                          type="text"
                          placeholder="Last Name *"
                          value={guest.lastName}
                          onChange={(e) => handleInputChange(roomIndex, 'children', i, 'lastName', e.target.value)}
                          isInvalid={!!errors[`child-${roomIndex}-${i}-last`]}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors[`child-${roomIndex}-${i}-last`]}
                        </Form.Control.Feedback>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Control
                          type="number"
                          placeholder="Child Age (1-17) *"
                          value={guest.age}
                          onChange={(e) => handleInputChange(roomIndex, 'children', i, 'age', e.target.value)}
                          isInvalid={!!errors[`child-${roomIndex}-${i}-age`]}
                          min="1"
                          max="17"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors[`child-${roomIndex}-${i}-age`]}
                        </Form.Control.Feedback>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            ))}

          </Form>
        </Card.Body>
      </Card>

      {/* Contact Information */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <h6 className="fw-bold mb-3 d-flex align-items-center">
            <FaEnvelope className="me-2 text-danger" />
            Contact Information - Booking confirmation will be sent here
          </h6>

          <Row>
            <Col lg={3}>
              <Form.Select disabled>
                <option>India (+91)</option>
              </Form.Select>
            </Col>
            <Col lg={4}>
              <Form.Control
                type="text"
                placeholder="Mobile Number (10 digits) *"
                value={mobile}
                onChange={(e) => handleMobileChange(e.target.value)}
                isInvalid={!!errors.mobile}
                maxLength={10}
              />
              <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
            </Col>
            <Col lg={5}>
              <Form.Control
                type="email"
                placeholder="Email Address *"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* GST Information */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={9}>
              <h6 className="fw-bold mb-1">GST Invoice (Optional)</h6>
              <small className="text-muted">Add GST details if you need a business invoice. GST will be applied to the lead passenger only.</small>
            </Col>
            <Col md={3} className="text-end">
              <Button
                onClick={() => setShowGstinForm(!showGstinForm)}
                variant={showGstinForm ? "outline-danger" : "outline-primary"}
                size="sm"
              >
                {showGstinForm ? 'Remove GST' : 'Add GST'}
              </Button>
            </Col>
          </Row>

          {showGstinForm && (
            <div className="mt-4 p-3 border rounded bg-light">
              <div className="alert alert-info small mb-3">
                <strong>Note:</strong> GST details will only be applied to the lead passenger (first adult in room 1) for billing purposes.
              </div>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Control
                    type="text"
                    placeholder="GST Number (22AAAAA0000A1Z5) *"
                    value={gstData.gstNumber}
                    onChange={(e) => handleGstDataChange('gstNumber', e.target.value.toUpperCase())}
                    isInvalid={!!errors.gstGstNumber}
                    maxLength={15}
                  />
                  <Form.Control.Feedback type="invalid">{errors.gstGstNumber}</Form.Control.Feedback>
                </Col>
                <Col md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Company Name *"
                    value={gstData.companyName}
                    onChange={(e) => handleGstDataChange('companyName', e.target.value)}
                    isInvalid={!!errors.gstCompanyName}
                  />
                  <Form.Control.Feedback type="invalid">{errors.gstCompanyName}</Form.Control.Feedback>
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Contact Number *"
                    value={gstData.contactNo}
                    onChange={(e) => handleGstDataChange('contactNo', e.target.value)}
                    isInvalid={!!errors.gstContactNo}
                  />
                  <Form.Control.Feedback type="invalid">{errors.gstContactNo}</Form.Control.Feedback>
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="email"
                    placeholder="Email *"
                    value={gstData.email}
                    onChange={(e) => handleGstDataChange('email', e.target.value)}
                    isInvalid={!!errors.gstEmail}
                  />
                  <Form.Control.Feedback type="invalid">{errors.gstEmail}</Form.Control.Feedback>
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Company Address *"
                    value={gstData.address}
                    onChange={(e) => handleGstDataChange('address', e.target.value)}
                    isInvalid={!!errors.gstAddress}
                  />
                  <Form.Control.Feedback type="invalid">{errors.gstAddress}</Form.Control.Feedback>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Continue Button */}
      <div className="text-center">
        <Button
          variant="primary"
          size="lg"
          className="btn-red px-5"
          onClick={handleContinue}
        >
          Continue to Review →
        </Button>
      </div>
    </div>
  );
};

export default GuestDetailsInfo;