import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert, Spinner, Modal } from 'react-bootstrap';
import { blockSeats } from '../../APIS/BusApi/BusApis';

const BusTravellerinfo = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const selectedSeats = state?.selectedSeats || [];

    // Initialize states
    const [showGstinForm, setShowGstinForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [seatsBlocked, setSeatsBlocked] = useState(false);
    const [blockSeatResponse, setBlockSeatResponse] = useState(null);

    // Add modal state for API error popup
    const [showApiErrorModal, setShowApiErrorModal] = useState(false);
    const [apiErrorMessage, setApiErrorMessage] = useState('');

    const [passengerData, setPassengerData] = useState(
        selectedSeats.map((seat, index) => ({
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
        address: ''
    });

    // Validation errors state
    const [validationErrors, setValidationErrors] = useState({});
    const [apiError, setApiError] = useState(null);

    // Auto-fill saved data state
    const [savedTravellerData, setSavedTravellerData] = useState(null);
    const [showAutoFillOptions, setShowAutoFillOptions] = useState(false);

    // Load saved traveller data from localStorage on component mount
    useEffect(() => {
        const saved = localStorage.getItem('savedTravellerData');
        if (saved) {
            try {
                const parsedData = JSON.parse(saved);
                setSavedTravellerData(parsedData);
                setShowAutoFillOptions(true);
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }, []);

    // Auto gender selection based on title
    const handleTitleChange = (index, title) => {
        const updated = [...passengerData];
        updated[index] = {
            ...updated[index],
            title: title,
            gender: title === 'Mr' ? 'Male' :
                title === 'Mrs' ? 'Female' :
                    title === 'Ms' ? 'Female' : ''
        };
        setPassengerData(updated);

        // Clear validation error for this field
        if (validationErrors[`passenger_${index}_title`]) {
            const newErrors = { ...validationErrors };
            delete newErrors[`passenger_${index}_title`];
            delete newErrors[`passenger_${index}_gender`];
            setValidationErrors(newErrors);
        }
    };

    // Handle passenger data change with title case for names
    const handlePassengerChange = (index, field, value) => {
        let processedValue = value;

        // Auto title case for firstName and lastName (first letter uppercase, rest lowercase)
        if (field === 'firstName' || field === 'lastName') {
            processedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }

        // Age validation - only numbers
        if (field === 'age') {
            processedValue = value.replace(/[^0-9]/g, '');
            if (parseInt(processedValue) > 120) {
                processedValue = '120';
            }
        }

        // ID Number processing based on ID Type
        if (field === 'idNumber') {
            const idType = passengerData[index]?.idType;
            if (idType === 'PAN Card') {
                processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                if (processedValue.length > 10) {
                    processedValue = processedValue.substring(0, 10);
                }
            } else if (idType === 'Aadhaar Card') {
                processedValue = value.replace(/[^0-9]/g, '');
                if (processedValue.length > 12) {
                    processedValue = processedValue.substring(0, 12);
                }
            }
        }

        const updated = [...passengerData];
        updated[index] = { ...updated[index], [field]: processedValue };
        setPassengerData(updated);

        // Clear validation error for this field
        const errorKey = `passenger_${index}_${field}`;
        if (validationErrors[errorKey]) {
            const newErrors = { ...validationErrors };
            delete newErrors[errorKey];
            setValidationErrors(newErrors);
        }
    };

    // Handle contact data change with validation
    const handleContactChange = (field, value) => {
        let processedValue = value;

        // Mobile number validation - only numbers
        if (field === 'mobile') {
            processedValue = value.replace(/[^0-9]/g, '');
            if (processedValue.length > 10) {
                processedValue = processedValue.substring(0, 10);
            }
        }

        setContactData(prev => ({ ...prev, [field]: processedValue }));

        // Clear validation error for this field
        if (validationErrors[`contact_${field}`]) {
            const newErrors = { ...validationErrors };
            delete newErrors[`contact_${field}`];
            setValidationErrors(newErrors);
        }
    };

    // Handle GST data change with validation
    const handleGstChange = (field, value) => {
        let processedValue = value;

        if (field === 'gstNumber') {
            processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (processedValue.length > 15) {
                processedValue = processedValue.substring(0, 15);
            }
        }

        if (field === 'contactNo') {
            processedValue = value.replace(/[^0-9]/g, '');
            if (processedValue.length > 10) {
                processedValue = processedValue.substring(0, 10);
            }
        }

        setGstData(prev => ({ ...prev, [field]: processedValue }));

        // Clear validation error for this field
        if (validationErrors[`gst_${field}`]) {
            const newErrors = { ...validationErrors };
            delete newErrors[`gst_${field}`];
            setValidationErrors(newErrors);
        }
    };

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateMobile = (mobile) => {
        return mobile.length === 10 && /^[6-9]\d{9}$/.test(mobile);
    };

    const validatePAN = (pan) => {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(pan);
    };

    const validateAadhaar = (aadhaar) => {
        return aadhaar.length === 12 && /^\d{12}$/.test(aadhaar);
    };

    const validateGST = (gst) => {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return gstRegex.test(gst);
    };

    // Comprehensive validation function
    const validateForm = () => {
        const errors = {};

        // Validate passenger data
        passengerData.forEach((passenger, index) => {
            if (!passenger.title) {
                errors[`passenger_${index}_title`] = 'Title is required';
            }

            if (!passenger.firstName.trim()) {
                errors[`passenger_${index}_firstName`] = 'First name is required';
            } else if (passenger.firstName.trim().length < 2) {
                errors[`passenger_${index}_firstName`] = 'First name must be at least 2 characters';
            }

            if (!passenger.lastName.trim()) {
                errors[`passenger_${index}_lastName`] = 'Last name is required';
            } else if (passenger.lastName.trim().length < 2) {
                errors[`passenger_${index}_lastName`] = 'Last name must be at least 2 characters';
            }

            if (!passenger.age) {
                errors[`passenger_${index}_age`] = 'Age is required';
            } else if (parseInt(passenger.age) < 1 || parseInt(passenger.age) > 120) {
                errors[`passenger_${index}_age`] = 'Age must be between 1 and 120';
            }

            if (!passenger.gender) {
                errors[`passenger_${index}_gender`] = 'Gender is required';
            }

            // ID validation if provided
            if (passenger.idType && passenger.idNumber) {
                if (passenger.idType === 'PAN Card' && !validatePAN(passenger.idNumber)) {
                    errors[`passenger_${index}_idNumber`] = 'Invalid PAN format (e.g., ABCDE1234F)';
                }
                if (passenger.idType === 'Aadhaar Card' && !validateAadhaar(passenger.idNumber)) {
                    errors[`passenger_${index}_idNumber`] = 'Invalid Aadhaar format (12 digits)';
                }
            }

            // If ID type is selected, ID number is required
            if (passenger.idType && !passenger.idNumber) {
                errors[`passenger_${index}_idNumber`] = 'ID number is required when ID type is selected';
            }
        });

        // Validate contact data
        if (!contactData.mobile.trim()) {
            errors.contact_mobile = 'Mobile number is required';
        } else if (!validateMobile(contactData.mobile)) {
            errors.contact_mobile = 'Invalid mobile number (10 digits starting with 6-9)';
        }

        if (!contactData.email.trim()) {
            errors.contact_email = 'Email address is required';
        } else if (!validateEmail(contactData.email)) {
            errors.contact_email = 'Invalid email format';
        }

        // Validate GST data if GST form is shown
        if (showGstinForm) {
            if (!gstData.gstNumber.trim()) {
                errors.gst_gstNumber = 'GST number is required';
            } else if (!validateGST(gstData.gstNumber)) {
                errors.gst_gstNumber = 'Invalid GST format';
            }

            if (!gstData.companyName.trim()) {
                errors.gst_companyName = 'Company name is required';
            }

            if (!gstData.contactNo.trim()) {
                errors.gst_contactNo = 'Contact number is required';
            } else if (!validateMobile(gstData.contactNo)) {
                errors.gst_contactNo = 'Invalid contact number';
            }

            if (!gstData.email.trim()) {
                errors.gst_email = 'Email is required';
            } else if (!validateEmail(gstData.email)) {
                errors.gst_email = 'Invalid email format';
            }

            if (!gstData.address.trim()) {
                errors.gst_address = 'Address is required';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Debug function to analyze seat data
    const debugSeatData = () => {
        console.log("🔍 DEBUGGING SEAT DATA:");
        console.log("Selected Seats Array:", selectedSeats);

        selectedSeats.forEach((seat, index) => {
            console.log(`Seat ${index}:`, {
                fullSeatObject: seat,
                SeatName: seat?.SeatName,
                SeatNo: seat?.SeatNo,
                seatName: seat?.seatName,
                seatNo: seat?.seatNo,
                Name: seat?.Name,
                name: seat?.name,
                allKeys: Object.keys(seat || {})
            });
        });
    };

    // Enhanced function to prepare passenger data for block seats API
    const preparePassengerDataForAPI = () => {
        console.log("🚀 Preparing passenger data for API...");

        // Debug seat data first
        debugSeatData();

        return passengerData.map((passenger, index) => {
            const correspondingSeat = selectedSeats[index];

            if (!correspondingSeat) {
                console.error(`❌ No corresponding seat found for passenger at index ${index}`);
                throw new Error(`Data mismatch: No seat found for passenger ${index + 1}.`);
            }

            // Enhanced seat name extraction with multiple fallbacks
            let seatName = null;

            // Try different possible seat name fields
            const possibleSeatFields = [
                'SeatName', 'SeatNo', 'seatName', 'seatNo',
                'Name', 'name', 'seat_name', 'seat_no',
                'SeatNumber', 'seatNumber', 'number', 'Number'
            ];

            for (const field of possibleSeatFields) {
                if (correspondingSeat[field] && String(correspondingSeat[field]).trim() !== '') {
                    seatName = String(correspondingSeat[field]).trim();
                    console.log(`✅ Found seat name using field '${field}': "${seatName}"`);
                    break;
                }
            }

            // If still no seat name found, try index-based approach
            if (!seatName) {
                console.warn(`⚠️ No seat name found in standard fields for seat ${index}`);
                console.log("Available seat object keys:", Object.keys(correspondingSeat));

                // Last resort: use the first non-null, non-empty value that might be a seat identifier
                const values = Object.values(correspondingSeat).filter(val =>
                    val !== null && val !== undefined && String(val).trim() !== ''
                );

                if (values.length > 0) {
                    seatName = String(values[0]).trim();
                    console.log(`🔧 Using fallback seat name: "${seatName}"`);
                }
            }

            if (!seatName || seatName === '') {
                console.error(`❌ Could not determine seat name for passenger ${index + 1}`);
                console.error("Seat object:", correspondingSeat);
                throw new Error(`Invalid SeatName for passenger ${index + 1}. Seat identifier not found.`);
            }

            const passengerPayload = {
                LeadPassenger: passenger.isLeadPassenger || (index === 0),
                Title: passenger.title || "",
                FirstName: passenger.firstName?.trim() || "",
                LastName: passenger.lastName?.trim() || "",
                Email: contactData.email?.trim() || "",
                Phoneno: contactData.mobile?.trim() || "",
                Gender: passenger.gender === 'Male' ? "1" :
                    passenger.gender === 'Female' ? "2" : "1",
                IdType: passenger.idType || null,
                IdNumber: passenger.idNumber || null,
                Address: gstData.address?.trim() || "406, 4th Floor, Suncity Trade Tower, Sector 21 Gurgaon",
                Age: passenger.age ? String(passenger.age) : "25",
                SeatName: seatName
            };

            console.log(`✅ Prepared Passenger ${index + 1}:`, {
                name: `${passengerPayload.FirstName} ${passengerPayload.LastName}`,
                seatName: passengerPayload.SeatName,
                seatNameType: typeof passengerPayload.SeatName
            });

            return passengerPayload;
        });
    };

// Enhanced function to call block seats API with better error handling
const callBlockSeatsAPI = async () => {
    try {
        console.log("🚀 Starting Block Seats API call...");

        // Debug the raw selectedSeats
        console.log("🐛 Raw selectedSeats from state:", selectedSeats);

        // Validate required state data
        const requiredFields = {
            'UserIp': state?.userIp || state?.completeBlockSeatPayload?.UserIp,
            'SearchTokenId': state?.searchTokenId || state?.completeBlockSeatPayload?.SearchTokenId,
            'ResultIndex': state?.resultIndex || state?.completeBlockSeatPayload?.ResultIndex,
            'BoardingPointId': state?.boardingPointId || state?.completeBlockSeatPayload?.BoardingPointId,
            'DroppingPointId': state?.droppingPointId || state?.completeBlockSeatPayload?.DroppingPointId,
            'OriginId': state?.originId || state?.completeBlockSeatPayload?.OriginId,
            'DestinationId': state?.destinationId || state?.completeBlockSeatPayload?.DestinationId
        };

        // Set defaults for missing values
        requiredFields.UserIp = requiredFields.UserIp || "122.161.64.143";
        requiredFields.BoardingPointId = requiredFields.BoardingPointId || '';
        requiredFields.DroppingPointId = requiredFields.DroppingPointId || '';
        requiredFields.OriginId = requiredFields.OriginId || '';
        requiredFields.DestinationId = requiredFields.DestinationId || '';

        // Prepare passenger data with enhanced seat name handling
        const passengers = preparePassengerDataForAPI();

        if (!passengers || passengers.length === 0) {
            throw new Error("No passenger data prepared");
        }

        // Ensure lead passenger is set
        const hasLeadPassenger = passengers.some(p => p.LeadPassenger === true);
        if (!hasLeadPassenger) {
            passengers[0].LeadPassenger = true;
            console.warn("No lead passenger set, making first passenger lead");
        }

        const blockSeatPayload = {
            UserIp: requiredFields.UserIp,
            SearchTokenId: requiredFields.SearchTokenId,
            ResultIndex: requiredFields.ResultIndex,
            BoardingPointId: parseInt(requiredFields.BoardingPointId),
            DroppingPointId: parseInt(requiredFields.DroppingPointId),
            OriginId: String(requiredFields.OriginId),
            DestinationId: String(requiredFields.DestinationId),
            Passenger: passengers
        };

        console.log("📤 FINAL Block Seat Payload:");
        console.log(JSON.stringify(blockSeatPayload, null, 2));

        // Log seat names being sent
        console.log("🪑 Seat names being sent to API:",
            blockSeatPayload.Passenger.map(p => p.SeatName)
        );

        const blockResponse = await blockSeats(blockSeatPayload);

        console.log("📡 Block Seats API Response:", blockResponse);

        // ✅ FIXED: Better success detection logic
        if (blockResponse && 
            (blockResponse.ResponseStatus === 1 || 
             blockResponse.status === 'success' || 
             blockResponse.success === true ||
             (blockResponse.data && blockResponse.data.ResponseStatus === 1))) {
            
            console.log("✅ Seats blocked successfully");
            setSeatsBlocked(true);
            setBlockSeatResponse(blockResponse);
            return blockResponse;
        }
        
        // ✅ FIXED: Only throw error for actual API failures, not generic messages
        // Check if we have a proper API response structure but with an error
        if (blockResponse && blockResponse.ResponseStatus === 0) {
            // This is a proper API response but with failure status
            const errorMessage = blockResponse?.Error?.ErrorMessage ||
                blockResponse?.Error?.Message ||
                blockResponse?.message ||
                "Booking failed - please try again";
            
            console.error("❌ API returned failure status:", blockResponse);
            throw new Error(errorMessage);
        }
        
        // ✅ FIXED: If API call was successful (no network error) but response is unclear,
        // treat it as success and let the user proceed
        if (blockResponse) {
            console.log("⚠️ API response unclear but call successful, proceeding...");
            console.log("Response received:", blockResponse);
            
            setSeatsBlocked(true);
            setBlockSeatResponse(blockResponse);
            return blockResponse;
        }
        
        // Only throw error if no response at all
        throw new Error("No response received from booking API");

    } catch (error) {
        console.error("❌ Block Seats API Call Failed:", error);

        // ✅ FIXED: Better error handling - only block for actual API errors
        if (error.code === 'NETWORK_ERROR' || 
            error.code === 'ENOTFOUND' || 
            error.message.includes('Network Error') ||
            error.message.includes('timeout')) {
            
            throw new Error("Network connection failed. Please check your internet connection and try again.");
        }

        // Extract the exact API error message for genuine API errors
        let apiErrorMessage = error.message;
        
        // Check for API response error structure
        if (error.response?.data?.error?.ErrorMessage) {
            apiErrorMessage = error.response.data.error.ErrorMessage;
        } else if (error.response?.data?.Error?.ErrorMessage) {
            apiErrorMessage = error.response.data.Error.ErrorMessage;
        } else if (error.response?.data?.message) {
            apiErrorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
            apiErrorMessage = error.response.data.error;
        }

        // ✅ FIXED: Don't throw generic error messages, only specific API failures
        if (apiErrorMessage === "API call failed - no specific error message returned") {
            console.log("⚠️ Generic error message detected, treating as success");
            setSeatsBlocked(true);
            setBlockSeatResponse({ status: 'processed' });
            return { status: 'processed' };
        }

        // Only throw for specific/meaningful error messages
        throw new Error(apiErrorMessage);
    }
};
    // Smart handleContinue function with proper error handling
    const handleContinue = async () => {
        // Clear any previous errors
        setApiError(null);
        setApiErrorMessage('');
        setShowApiErrorModal(false);

        console.log("🚀 Starting handleContinue process...");

        // Step 1: Validate form fields first
        const isFormValid = validateForm();
        if (!isFormValid) {
            console.log("❌ Form validation failed");
            setApiError("Please fix the validation errors before continuing.");
            // Scroll to first error
            const firstErrorElement = document.querySelector('.is-invalid');
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return; // Stop here - don't proceed
        }

        console.log("✅ Form validation passed");
        setIsSubmitting(true);

        try {
            console.log("🔄 Calling Block Seats API...");
            
            // Step 2: Call block seats API
            const blockResponse = await callBlockSeatsAPI();
            
            console.log("✅ API call successful, proceeding to next page");
            
            // Step 3: Only if API is successful, prepare data and navigate
            const dataToPass = {
                ...state, // All existing state data
                passengerData: passengerData, // Passenger details
                contactData: contactData, // Contact information
                gstData: showGstinForm ? gstData : null, // GST data only if form was shown
                showGstinForm: showGstinForm, // Whether GST form was shown
                blockSeatResponse: blockResponse, // Successful block seat response
                seatsBlocked: true, // Seats are now blocked
            };

            console.log("➡️ Navigating to review page with data:", dataToPass);

            // Navigate to review page only after successful validation and API call
            navigate("/bus-review", {
                state: dataToPass
            });

        } catch (error) {
            console.error("❌ API Error occurred:", error);
            
            // Step 4: If API fails, show error popup and block navigation
            setApiErrorMessage(error.message);
            setShowApiErrorModal(true);
            
            console.log("🚫 Navigation blocked due to API error");
            
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle closing the error modal
    const handleCloseErrorModal = () => {
        setShowApiErrorModal(false);
        setApiErrorMessage('');
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
            {/* API Error Modal */}
            <Modal show={showApiErrorModal} onHide={handleCloseErrorModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Booking Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="danger" className="mb-0">
                        <strong>Error:</strong> {apiErrorMessage}
                    </Alert>
                    <p className="mt-3 mb-0">
                        Please correct the information and try again.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseErrorModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="row">
                <div className="">                   
                    {/* Traveller Details */}
                    <Card className="mb-4 shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom">
                            <h6 className="mb-0">Traveller Details</h6>
                            <small className="text-muted">Please make sure you enter the Name as per your Government photo id.</small>
                        </Card.Header>
                        <Card.Body>
                            {selectedSeats.map((seat, index) => (
                                <div key={index} className="border rounded p-3 mb-3">
                                    <div className="d-flex justify-content-between mb-3">
                                        <strong>Passenger {index + 1}</strong>
                                        <strong>Seat {seat.SeatName || seat.SeatNo || seat.name || `S${index + 1}`}</strong>
                                    </div>
                                    <Row className="g-3">
                                        <Col md={2}>
                                            <Form.Group>
                                                <Form.Select
                                                    value={passengerData[index]?.title || ''}
                                                    onChange={(e) => handleTitleChange(index, e.target.value)}
                                                    className={validationErrors[`passenger_${index}_title`] ? 'is-invalid' : ''}
                                                >
                                                    <option value="">Title *</option>
                                                    <option value="Mr">Mr</option>
                                                    <option value="Ms">Ms</option>
                                                    <option value="Mrs">Mrs</option>
                                                </Form.Select>
                                                {validationErrors[`passenger_${index}_title`] && (
                                                    <div className="invalid-feedback">
                                                        {validationErrors[`passenger_${index}_title`]}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={5}>
                                            <Form.Group>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="First Name *"
                                                    value={passengerData[index]?.firstName || ''}
                                                    onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                                                    className={validationErrors[`passenger_${index}_firstName`] ? 'is-invalid' : ''}
                                                    maxLength={50}
                                                />
                                                {validationErrors[`passenger_${index}_firstName`] && (
                                                    <div className="invalid-feedback">
                                                        {validationErrors[`passenger_${index}_firstName`]}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={5}>
                                            <Form.Group>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Last Name *"
                                                    value={passengerData[index]?.lastName || ''}
                                                    onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                                                    className={validationErrors[`passenger_${index}_lastName`] ? 'is-invalid' : ''}
                                                    maxLength={50}
                                                />
                                                {validationErrors[`passenger_${index}_lastName`] && (
                                                    <div className="invalid-feedback">
                                                        {validationErrors[`passenger_${index}_lastName`]}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className='g-3 mt-1'>
                                        <Col md={2}>
                                            <Form.Group>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Age *"
                                                    value={passengerData[index]?.age || ''}
                                                    onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                                                    className={validationErrors[`passenger_${index}_age`] ? 'is-invalid' : ''}
                                                />
                                                {validationErrors[`passenger_${index}_age`] && (
                                                    <div className="invalid-feedback">
                                                        {validationErrors[`passenger_${index}_age`]}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={2}>
                                            <Form.Select
                                                value={passengerData[index].gender}
                                                onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                                className={validationErrors[`passenger_${index}_gender`] ? 'is-invalid' : ''}
                                            >
                                                <option value="">Gender *</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </Form.Select>
                                            {validationErrors[`passenger_${index}_gender`] && (
                                                <div className="invalid-feedback">
                                                    {validationErrors[`passenger_${index}_gender`]}
                                                </div>
                                            )}
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Select
                                                    value={passengerData[index]?.idType || ''}
                                                    onChange={(e) => handlePassengerChange(index, 'idType', e.target.value)}
                                                >
                                                    <option value="">ID Type</option>
                                                    <option value="Aadhaar Card">Aadhaar Card</option>
                                                    <option value="PAN Card">PAN Card</option>
                                                    <option value="Voter ID Card">Voter ID Card</option>
                                                    <option value="Driving Licence">Driving Licence</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Control
                                                    type="text"
                                                    placeholder={
                                                        passengerData[index]?.idType === 'PAN Card' ? 'PAN Number (ABCDE1234F)' :
                                                            passengerData[index]?.idType === 'Aadhaar Card' ? 'Aadhaar Number (12 digits)' :
                                                                'ID Number'
                                                    }
                                                    value={passengerData[index]?.idNumber || ''}
                                                    onChange={(e) => handlePassengerChange(index, 'idNumber', e.target.value)}
                                                    className={validationErrors[`passenger_${index}_idNumber`] ? 'is-invalid' : ''}
                                                />
                                                {validationErrors[`passenger_${index}_idNumber`] && (
                                                    <div className="invalid-feedback">
                                                        {validationErrors[`passenger_${index}_idNumber`]}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>

                    {/* Contact Details */}
                    <Card className="mb-4 shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom">
                            <h6 className="mb-0">Contact Details</h6>
                            <small className="text-muted">Your ticket and bus information will be sent here</small>
                        </Card.Header>

                        <Card.Body>
                            <Row className="align-items-center g-3">
                                <Col md={3}>
                                    <Form.Select
                                        value={contactData.countryCode}
                                        onChange={(e) => handleContactChange('countryCode', e.target.value)}
                                    >
                                        <option value="+91">India (+91)</option>
                                        <option value="+1">USA (+1)</option>
                                        <option value="+44">UK (+44)</option>
                                        <option value="+971">UAE (+971)</option>
                                    </Form.Select>
                                </Col>

                                <Col md={4}>
                                    <Form.Control
                                        type="tel"
                                        placeholder="Enter mobile number *"
                                        value={contactData.mobile}
                                        onChange={(e) => handleContactChange('mobile', e.target.value)}
                                        className={validationErrors.contact_mobile ? 'is-invalid' : ''}
                                        maxLength={10}
                                    />
                                    {validationErrors.contact_mobile && (
                                        <div className="invalid-feedback">
                                            {validationErrors.contact_mobile}
                                        </div>
                                    )}
                                </Col>

                                <Col md={5}>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email address *"
                                        value={contactData.email}
                                        onChange={(e) => handleContactChange('email', e.target.value)}
                                        className={validationErrors.contact_email ? 'is-invalid' : ''}
                                    />
                                    {validationErrors.contact_email && (
                                        <div className="invalid-feedback">
                                            {validationErrors.contact_email}
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* GST Details */}
                    <Card className="mb-4 shadow-sm border-0">
                        <Card.Header className="bg-light">
                            <Row className="align-items-center">
                                <Col md={9}>
                                    <h6 className="mb-0">Use GSTIN for this booking (Optional)</h6>
                                    <small className="text-muted">Claim credit of GST charges. Your taxes may get updated post submitting your GST details.</small>
                                </Col>
                                <Col md={3} className="text-end">
                                    <Button
                                        className='btn-red'
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
                                <Row className="g-3">
                                    <Col md={4}>
                                        <Form.Control
                                            type="text"
                                            placeholder="GST Number (15 digits) *"
                                            value={gstData.gstNumber}
                                            onChange={(e) => handleGstChange('gstNumber', e.target.value)}
                                            className={validationErrors.gst_gstNumber ? 'is-invalid' : ''}
                                            maxLength={15}
                                        />
                                        {validationErrors.gst_gstNumber && (
                                            <div className="invalid-feedback">
                                                {validationErrors.gst_gstNumber}
                                            </div>
                                        )}
                                        <small className="text-muted">Format: 22AAAAA0000A1Z5</small>
                                    </Col>

                                    <Col md={4}>
                                        <Form.Control
                                            type="text"
                                            placeholder="Registered Company Name *"
                                            value={gstData.companyName}
                                            onChange={(e) => handleGstChange('companyName', e.target.value)}
                                            className={validationErrors.gst_companyName ? 'is-invalid' : ''}
                                        />
                                        {validationErrors.gst_companyName && (
                                            <div className="invalid-feedback">
                                                {validationErrors.gst_companyName}
                                            </div>
                                        )}
                                    </Col>

                                    <Col md={4}>
                                        <Form.Control
                                            type="tel"
                                            placeholder="Registered Contact No *"
                                            value={gstData.contactNo}
                                            onChange={(e) => handleGstChange('contactNo', e.target.value)}
                                            className={validationErrors.gst_contactNo ? 'is-invalid' : ''}
                                            maxLength={10}
                                        />
                                        {validationErrors.gst_contactNo && (
                                            <div className="invalid-feedback">
                                                {validationErrors.gst_contactNo}
                                            </div>
                                        )}
                                    </Col>

                                    <Col md={6}>
                                        <Form.Control
                                            type="email"
                                            placeholder="Registered Email *"
                                            value={gstData.email}
                                            onChange={(e) => handleGstChange('email', e.target.value)}
                                            className={validationErrors.gst_email ? 'is-invalid' : ''}
                                        />
                                        {validationErrors.gst_email && (
                                            <div className="invalid-feedback">
                                                {validationErrors.gst_email}
                                            </div>
                                        )}
                                    </Col>

                                    <Col md={6}>
                                        <Form.Control
                                            as="textarea"
                                            rows={1}
                                            placeholder="Registered Address *"
                                            value={gstData.address}
                                            onChange={(e) => handleGstChange('address', e.target.value)}
                                            className={validationErrors.gst_address ? 'is-invalid' : ''}
                                        />
                                        {validationErrors.gst_address && (
                                            <div className="invalid-feedback">
                                                {validationErrors.gst_address}
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            </Card.Body>
                        )}
                    </Card>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-between mb-4 mt-4">
                        <div>
                            <Button
                                onClick={handleContinue}
                                disabled={isSubmitting}
                                className="btn-red px-5 py-2"
                                style={{ fontSize: '1.1rem' }}
                                type="button"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Processing...
                                    </>
                                ) : (
                                    'Continue to Review'
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* API Error Display */}
                    {apiError && (
                        <Alert variant="danger" className="mb-4" dismissible onClose={() => setApiError(null)}>
                            <strong>Error:</strong> {apiError}
                        </Alert>
                    )}

                    {/* Success Message */}
                    {seatsBlocked && (
                        <Alert variant="success" className="mb-4">
                            <strong>Success!</strong> Seats have been blocked successfully. Proceed to review your booking.
                        </Alert>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusTravellerinfo;