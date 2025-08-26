import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { blockSeats } from '../../APIS/BusApi/BusApis'; // Import your blockSeats API function

const BusTravellerinfo = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const selectedSeats = state?.selectedSeats || [];

    // Initialize states
    const [showGstinForm, setShowGstinForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [seatsBlocked, setSeatsBlocked] = useState(false);

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

    // Only API errors now - removed custom validation errors
    const [apiError, setApiError] = useState(null);

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
                Title: passenger.title || "Mr",
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
            requiredFields.BoardingPointId = requiredFields.BoardingPointId || 1;
            requiredFields.DroppingPointId = requiredFields.DroppingPointId || 1;
            requiredFields.OriginId = requiredFields.OriginId || "8463";
            requiredFields.DestinationId = requiredFields.DestinationId || "9573";

            // Prepare passenger data with enhanced seat name handling
            const passengers = preparePassengerDataForAPI();

            if (!passengers || passengers.length === 0) {
                throw new Error("No passenger data prepared");
            }

            // Ensure lead passenger is set
            const hasLeadPassenger = passengers.some(p => p.LeadPassenger === true);
            if (!hasLeadPassenger) {
                passengers[0].LeadPassenger = true;
                console.warn("⚠️ No lead passenger set, making first passenger lead");
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

            console.log("🔒 FINAL Block Seat Payload:");
            console.log(JSON.stringify(blockSeatPayload, null, 2));

            // Log seat names being sent
            console.log("🎫 Seat names being sent to API:",
                blockSeatPayload.Passenger.map(p => p.SeatName)
            );

            const blockResponse = await blockSeats(blockSeatPayload);

            console.log("📡 Block Seats API Response:", blockResponse);

            if (blockResponse && blockResponse.ResponseStatus === 1) {
                console.log("✅ Seats blocked successfully");
                setSeatsBlocked(true);
                return blockResponse;
            } else {
                // Extract the exact error message from API response
                const errorMessage = blockResponse?.Error?.ErrorMessage ||
                    blockResponse?.Error?.Message ||
                    blockResponse?.message ||
                    blockResponse?.error ||
                    "API call failed - no specific error message returned";

                console.error("❌ API returned error:", blockResponse);
                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error("❌ Block Seats API Call Failed:", error);

            // Show the exact error message from API or network error
            let apiErrorMessage = error.message;
            if (error.response?.data?.Error?.ErrorMessage) {
                apiErrorMessage = error.response.data.Error.ErrorMessage;
            } else if (error.response?.data?.message) {
                apiErrorMessage = error.response.data.message;
            }

            setApiError(apiErrorMessage);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Basic validation - only check if fields have values, no format validation
    const hasRequiredData = () => {
        // Check if all passengers have basic required fields
        const passengersValid = passengerData.every(passenger =>
            passenger.firstName?.trim() &&
            passenger.lastName?.trim() &&
            passenger.age &&
            passenger.gender
        );

        // Check if contact info is provided
        const contactValid = contactData.mobile?.trim() && contactData.email?.trim();

        return passengersValid && contactValid;
    };

    // Modified handleContinue function - Navigate immediately after basic validation
    const handleContinue = async () => {
        // Clear any previous API errors
        setApiError(null);

        // Only basic validation - check if required fields have values
        if (!hasRequiredData()) {
            setApiError("Please fill in all required fields before continuing.");
            return;
        }

        setIsSubmitting(true);

        // Prepare the data to pass to review component
        const dataToPass = {
            ...state, // All existing state data
            passengerData: passengerData, // Passenger details
            contactData: contactData, // Contact information
            gstData: showGstinForm ? gstData : null, // GST data only if form was shown
            showGstinForm: showGstinForm, // Whether GST form was shown
            blockSeatResponse: null, // Will be updated when API completes
            seatsBlocked: false, // Will be updated when API completes
            isBlockingSeats: true // Indicate that blocking is in progress
        };

        console.log("🚀 Passing data to review component:", dataToPass);

        // Navigate to review page immediately after basic validation passes
        navigate("/bus-review", {
            state: dataToPass
        });

        // Call block seats API in background
        try {
            const blockResponse = await callBlockSeatsAPI();
            console.log("✅ Seats blocked successfully in background:", blockResponse);

        } catch (error) {
            console.error("❌ Error blocking seats in background:", error);
            // Error is already set in callBlockSeatsAPI function
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
                                            onChange={(e) => handlePassengerChange(index, 'title', e.target.value)}
                                        >
                                            <option value="">Title</option>
                                            <option value="Mr">Mr</option>
                                            <option value="Ms">Ms</option>
                                            <option value="Mrs">Mrs</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={5}>
                                    <Form.Group>
                                        <Form.Control
                                            type="text"
                                            placeholder="First Name *"
                                            value={passengerData[index]?.firstName || ''}
                                            onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={5}>
                                    <Form.Group>
                                        <Form.Control
                                            type="text"
                                            placeholder="Last Name *"
                                            value={passengerData[index]?.lastName || ''}
                                            onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className='g-3 mt-1'>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Control
                                            type="number"
                                            placeholder="Age *"
                                            min="1"
                                            max="120"
                                            value={passengerData[index]?.age || ''}
                                            onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={2}>
                                    <Form.Select
                                        value={passengerData[index].gender}
                                        onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                    >
                                        <option value="">Gender *</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </Form.Select>
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
                                            placeholder="ID Number"
                                            value={passengerData[index]?.idNumber || ''}
                                            onChange={(e) => handlePassengerChange(index, 'idNumber', e.target.value)}
                                        />
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
                                <option value="+91">🇮🇳 India (+91)</option>
                                <option value="+1">🇺🇸 USA (+1)</option>
                                <option value="+44">🇬🇧 UK (+44)</option>
                                <option value="+971">🇦🇪 UAE (+971)</option>
                            </Form.Select>
                        </Col>

                        <Col md={4}>
                            <Form.Control
                                type="tel"
                                placeholder="Enter mobile number *"
                                value={contactData.mobile}
                                onChange={(e) => handleContactChange('mobile', e.target.value)}
                            />
                        </Col>

                        <Col md={5}>
                            <Form.Control
                                type="email"
                                placeholder="Enter email address *"
                                value={contactData.email}
                                onChange={(e) => handleContactChange('email', e.target.value)}
                            />

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
                                    placeholder="GST Number"
                                    value={gstData.gstNumber}
                                    onChange={(e) => handleGstChange('gstNumber', e.target.value.toUpperCase())}
                                    maxLength={15}
                                />
                            </Col>

                            <Col md={4}>
                                <Form.Control
                                    type="text"
                                    placeholder="Registered Company Name"
                                    value={gstData.companyName}
                                    onChange={(e) => handleGstChange('companyName', e.target.value)}
                                />
                            </Col>

                            <Col md={4}>
                                <Form.Control
                                    type="tel"
                                    placeholder="Registered Contact No"
                                    value={gstData.contactNo}
                                    onChange={(e) => handleGstChange('contactNo', e.target.value)}
                                />
                            </Col>

                            <Col md={6}>
                                <Form.Control
                                    type="email"
                                    placeholder="Registered Email"
                                    value={gstData.email}
                                    onChange={(e) => handleGstChange('email', e.target.value)}
                                />
                            </Col>

                            <Col md={6}>
                                <Form.Control
                                    as="textarea"
                                    rows={1}
                                    placeholder="Registered Address"
                                    value={gstData.address}
                                    onChange={(e) => handleGstChange('address', e.target.value)}
                                />
                            </Col>
                        </Row>
                    </Card.Body>
                )}
            </Card>


            {/* Action Buttons */}
            <div className="text-end mb-4 mt-4">
                <Button
                    onClick={handleContinue}
                    disabled={isSubmitting}
                    className="btn-red px-5 py-2"
                    style={{ fontSize: '1.1rem' }}
                    type="button"
                >
                    Continue to Review
                </Button>
            </div>



            {/* API Error Display - Only shows API response errors */}
            {apiError && (
                <Alert variant="danger" className="mb-4" dismissible onClose={() => setApiError(null)}>
                    <strong>Error:</strong> {apiError}
                </Alert>
            )}

        </div>
    );
};

export default BusTravellerinfo;