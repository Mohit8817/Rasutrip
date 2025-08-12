import React from "react";
import { Card, Row, Col, Button, Form } from "react-bootstrap";
import {
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaBed,
    FaMoon,
    FaEdit,
    FaBuilding,
    FaExclamationTriangle,
} from "react-icons/fa";
import hotelImage from "../../../../assest/hotel1.jpg";
import { useNavigate, useLocation } from "react-router-dom";

const HotelReviewInfo = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        hotel,
        room,
        roomDetails,
        guestInputs,
        priceDetails,
        email,
        mobile,
        gstData,
        payload,
    } = location.state || {};

    const totalGuests =
        guestInputs?.reduce(
            (acc, room) => acc + room.adults.length + room.children.length,
            0
        ) || 0;

    // ✅ PAN validation function
    const validateAllAdultsPAN = (guestInputs) => {
        const panErrors = [];
        
        guestInputs?.forEach((room, roomIndex) => {
            room.adults?.forEach((adult, adultIndex) => {
                const panValue = adult.panNumber?.trim() || '';
                const adultName = `${adult.firstName} ${adult.lastName}`;
                
                // Check if PAN is empty or contains only spaces
                if (!panValue || panValue.replace(/\s/g, '') === '') {
                    panErrors.push(`❌ ${adultName} (Room ${roomIndex + 1}): PAN number is missing`);
                } else {
                    // Validate PAN format
                    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
                    if (!panRegex.test(panValue)) {
                        panErrors.push(`❌ ${adultName} (Room ${roomIndex + 1}): Invalid PAN format "${panValue}"`);
                    }
                }
            });
        });
        
        return panErrors;
    };

    // ✅ Updated handleContinue function with enhanced PAN validation
    const handleContinue = () => {
        // ✅ CRITICAL: Validate PAN numbers before proceeding
        const panValidationErrors = validateAllAdultsPAN(guestInputs);
        
        if (panValidationErrors.length > 0) {
            const errorMessage = `PAN Validation Failed:\n\n${panValidationErrors.join('\n')}`;
            alert(errorMessage);
            console.error('❌ PAN validation failed:', panValidationErrors);
            return; // Don't proceed if PAN validation fails
        }

        console.log('✅ All adults have valid PAN numbers');

        const totalPrice = roomDetails?.Amount || 0;
        const vendorCommission = priceDetails?.vendorCommission || 0;
        const couponDiscount = priceDetails?.discount || 0;
        const userIp = "49.36.217.215";

        try {
            // ✅ FIXED: Create proper traveller structure for API with PAN for all adults
            const roomTravellerInfo = guestInputs?.map((roomGuests, roomIdx) => {
                // Combine adults and children for this room
                const allPassengers = [...roomGuests.adults, ...roomGuests.children];
                
                const travellerInfo = allPassengers.map((guest, passengerIndex) => {
                    // ✅ Only first passenger of first room is LeadPassenger
                    const isLeadPassenger = roomIdx === 0 && passengerIndex === 0;
                    const isAdult = guest.age >= 18 || roomGuests.adults.includes(guest);
                    
                    // ✅ CRITICAL: Enhanced PAN handling with validation
                    let panNumber = null;
                    if (isAdult && guest.panNumber) {
                        const cleanPAN = guest.panNumber.trim().toUpperCase();
                        // Ensure PAN is not empty spaces
                        if (cleanPAN && cleanPAN.replace(/\s/g, '') !== '' && cleanPAN !== 'NULL') {
                            panNumber = cleanPAN;
                        }
                    }
                    
                    // ✅ Double-check: If adult doesn't have PAN, throw error
                    if (isAdult && !panNumber) {
                        throw new Error(`CRITICAL: Adult "${guest.firstName} ${guest.lastName}" in room ${roomIdx + 1} has no valid PAN number.`);
                    }
                    
                    return {
                        Title: guest.title || "Mr",
                        FirstName: guest.firstName?.trim() || "",
                        MiddleName: "",
                        LastName: guest.lastName?.trim() || "",
                        Phoneno: mobile?.trim() || "",
                        Email: email?.trim() || "",
                        PaxType: isAdult ? 1 : 2, // 1 for adults, 2 for children
                        LeadPassenger: isLeadPassenger,
                        Age: parseInt(guest.age) || 18,
                        PassportNo: null,
                        PassportIssueDate: null,
                        PassportExpDate: null,
                        // ✅ CRITICAL FIX: PAN for all adults, null for children
                        PAN: panNumber,
                        
                        // ✅ GST fields - only for lead passenger
                        GSTCompanyAddress: (isLeadPassenger && gstData?.address) ? gstData.address.trim() : null,
                        GSTCompanyContactNumber: (isLeadPassenger && gstData?.contactNo) ? gstData.contactNo.trim() : null,
                        GSTCompanyEmail: (isLeadPassenger && gstData?.email) ? gstData.email.trim() : null,
                        GSTCompanyName: (isLeadPassenger && gstData?.companyName) ? gstData.companyName.trim() : null,
                        GSTNumber: (isLeadPassenger && gstData?.gstNumber) ? gstData.gstNumber.trim().toUpperCase() : null,
                    };
                });

                return {
                    travellerInfo: travellerInfo,
                };
            });

            // ✅ Final validation: Check that all adults have PAN
            let adultsWithoutPAN = [];
            roomTravellerInfo.forEach((room, roomIdx) => {
                room.travellerInfo.forEach((pax, paxIdx) => {
                    if (pax.PaxType === 1 && !pax.PAN) { // Adult without PAN
                        adultsWithoutPAN.push(`Room ${roomIdx + 1}, Guest ${paxIdx + 1}: ${pax.FirstName} ${pax.LastName}`);
                    }
                });
            });

            if (adultsWithoutPAN.length > 0) {
                console.error("❌ Adults missing PAN:", adultsWithoutPAN);
                alert(`❌ PAN numbers required for all adults:\n${adultsWithoutPAN.join('\n')}`);
                return;
            }

            const hotelBookingDetails = {
                ResultIndex: hotel?.ResultIndex || "",
                HotelCode: hotel?.HotelCode || "",
                HotelName: hotel?.HotelName || hotel?.name || "",
                SearchTokenId: hotel?.SearchTokenId || "",
                vendorCommission: vendorCommission,
                CouponDiscount: couponDiscount,
                GuestNationality: "IN",
                NoOfRooms: hotel?.rooms?.toString() || "1",
                ClientReferenceNo: 0,
                IsVoucherBooking: "true",
                roomTravellerInfo: roomTravellerInfo || [],
                UserIp: userIp,
            };

            // ✅ Final validation - ensure exactly one LeadPassenger exists
            let leadPassengerCount = 0;
            hotelBookingDetails.roomTravellerInfo.forEach((room) => {
                room.travellerInfo.forEach((pax) => {
                    if (pax.LeadPassenger === true) {
                        leadPassengerCount++;
                    }
                });
            });

            if (leadPassengerCount !== 1) {
                console.error("❌ Invalid LeadPassenger count:", leadPassengerCount);
                alert("Error: Invalid lead passenger configuration. Please go back and check guest details.");
                return;
            }

            console.log("🚀 Final Payload with PAN validation:", JSON.stringify(hotelBookingDetails, null, 2));

            navigate("/HotelPayment", {
                state: {
                    hotel,
                    room,
                    roomDetails,
                    guestInputs,
                    email,
                    mobile,
                    gstData,
                    totalGuests,
                    priceDetails,
                    totalPrice,
                    hotelBookingDetails,
                    payload,
                    reviewData: {
                        panNumber: guestInputs?.[0]?.adults?.[0]?.panNumber || "",
                        GuestNationality: "IN"
                    },
                },
            });
        } catch (error) {
            console.error("❌ Error creating booking payload:", error);
            alert("Error preparing booking data: " + error.message);
        }
    };

    // ✅ IMPROVED: Handle edit button - pass existing data back to guest details with proper structure
    const handleEdit = () => {
        console.log('✏️ Editing guest details, sending back data:', {
            guestInputs,
            email,
            mobile,
            gstData
        });

        navigate("/guest-details", {
            state: { 
                hotel, 
                room, 
                roomDetails, 
                payload, 
                priceDetails,
                existingGuestData: {
                    guestInputs: guestInputs, // ✅ Send complete guest inputs
                    email: email,             // ✅ Send email
                    mobile: mobile,           // ✅ Send mobile
                    gstData: gstData          // ✅ Send GST data if exists
                }
            },
        });
    };

    // ✅ Enhanced error boundary check
    if (!hotel || !room || !guestInputs) {
        return (
            <div className="container my-4">
                <Card className="shadow-sm border-danger">
                    <Card.Body className="text-center">
                        <FaExclamationTriangle className="text-danger mb-3" size={48} />
                        <h5 className="text-danger">Missing Booking Data</h5>
                        <p>Required booking information is missing. Please start the booking process again.</p>
                        <Button variant="primary" onClick={() => navigate('/')}>
                            Back to Home
                        </Button>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    return (
        <div className="container my-4">
            {/* Hotel Details */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <Row className="align-items-center mb-3">
                        <Col>
                            <h5 className="fw-bold mb-2">{hotel?.HotelName || hotel?.name}</h5>
                            <p className="text-muted d-flex align-items-center mb-0">
                                <FaMapMarkerAlt className="me-2 text-danger" />
                                {hotel?.location || hotel?.Address || "Location not specified"}
                            </p>
                        </Col>
                        <Col xs="auto">
                            <div className="text-warning fs-5">
                                {"⭐".repeat(Math.max(1, Math.min(5, hotel?.rating || 3)))}
                            </div>
                        </Col>
                    </Row>

                    <hr />

                    <Row className="align-items-center mb-3">
                        <Col md={3}>
                            <img
                                src={hotel?.image || hotel?.HotelPicture || hotelImage}
                                alt="Hotel"
                                className="img-fluid rounded"
                                style={{ height: "180px", width: "100%", objectFit: "cover" }}
                                onError={(e) => {
                                    e.target.src = hotelImage;
                                }}
                            />
                        </Col>

                        <Col md={9}>
                            <Row>
                                <Col md={3} className="mb-3">
                                    <div className="d-flex align-items-center mb-1">
                                        <FaCalendarAlt className="me-2 text-primary" />
                                        <strong>Check-in</strong>
                                    </div>
                                    <div className="text-dark fw-semibold">
                                        {hotel?.checkInDate || "N/A"}
                                    </div>
                                </Col>

                                <Col md={3} className="mb-3">
                                    <div className="d-flex align-items-center mb-1">
                                        <FaMoon className="me-2 text-primary" />
                                        <strong>Nights</strong>
                                    </div>
                                    <div className="fw-semibold">{hotel?.nights || 1}</div>
                                </Col>

                                <Col md={3} className="mb-3">
                                    <div className="d-flex align-items-center mb-1">
                                        <FaCalendarAlt className="me-2 text-primary" />
                                        <strong>Check-out</strong>
                                    </div>
                                    <div className="text-dark fw-semibold">
                                        {hotel?.checkOutDate || "N/A"}
                                    </div>
                                </Col>

                                <Col md={3} className="mb-3">
                                    <div className="d-flex align-items-center mb-1">
                                        <FaBed className="me-2 text-primary" />
                                        <strong>Rooms & Guests</strong>
                                    </div>
                                    <div className="fw-semibold">
                                        {hotel?.rooms || roomDetails?.length || 1} Room(s), {totalGuests} Guest(s)
                                    </div>
                                </Col>
                            </Row>

                            <hr className="my-3" />

                            <Row>
                                <Col md={4}>
                                    <span className="text-muted">Room Type</span>
                                    <div className="fw-bold">
                                        {room?.RoomTypeName || room?.roomType || "Standard Room"}
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <span className="text-muted">No. of Guests</span>
                                    <div className="fw-bold">{totalGuests}</div>
                                </Col>
                                <Col md={4}>
                                    <span className="text-muted">Cancellation Policy</span>
                                    <div className="fw-bold text-success">
                                        {room?.CancellationPolicy || "Refundable"}
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Guest Details */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">Guest Details Summary</h6>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleEdit}
                            className="d-flex align-items-center"
                        >
                            <FaEdit className="me-1" />
                            Edit Details
                        </Button>
                    </div>

                    <div className="border rounded p-3 mb-3">
                        <Row className="fw-bold border-bottom pb-2 mb-3 text-muted small">
                            <Col md={4}>Contact Information</Col>
                            <Col md={8}>Guest Information</Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <div className="mb-2">
                                    <strong>Email:</strong><br />
                                    <span className="text-primary">{email}</span>
                                </div>
                                <div>
                                    <strong>Mobile:</strong><br />
                                    <span className="text-primary">+91 {mobile}</span>
                                </div>
                            </Col>
                            <Col md={8}>
                                {guestInputs?.map((room, roomIndex) => (
                                    <div key={roomIndex} className="mb-3">
                                        <div className="fw-bold text-primary mb-2 d-flex align-items-center">
                                            <FaBed className="me-2" />
                                            Room {roomIndex + 1}
                                        </div>
                                        
                                        {/* Adults */}
                                        {room.adults?.map((guest, i) => (
                                            <div key={`adult-${roomIndex}-${i}`} className="mb-2 p-2 bg-light rounded">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>{guest.title} {guest.firstName} {guest.lastName}</strong>
                                                        {roomIndex === 0 && i === 0 && (
                                                            <span className="badge bg-primary ms-2 small">Lead Guest</span>
                                                        )}
                                                        <div className="small text-muted">
                                                            Age: {guest.age} | PAN: {guest.panNumber || "Not provided"}
                                                        </div>
                                                    </div>
                                                    <span className="badge bg-success">Adult</span>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {/* Children */}
                                        {room.children?.map((guest, i) => (
                                            <div key={`child-${roomIndex}-${i}`} className="mb-2 p-2 bg-warning bg-opacity-10 rounded">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>{guest.title} {guest.firstName} {guest.lastName}</strong>
                                                        <div className="small text-muted">
                                                            Age: {guest.age}
                                                        </div>
                                                    </div>
                                                    <span className="badge bg-warning">Child</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </Col>
                        </Row>
                    </div>

                    {/* GST Details Display */}
                    {gstData && gstData.gstNumber && (
                        <div className="border rounded p-3 bg-info bg-opacity-10">
                            <h6 className="fw-bold mb-3 d-flex align-items-center">
                                <FaBuilding className="me-2 text-primary" />
                                GST Invoice Details
                            </h6>
                            <Row>
                                <Col md={6}>
                                    <div className="mb-2">
                                        <strong>GST Number:</strong><br />
                                        <span className="font-monospace">{gstData.gstNumber}</span>
                                    </div>
                                    <div className="mb-2">
                                        <strong>Company Name:</strong><br />
                                        {gstData.companyName}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-2">
                                        <strong>Contact:</strong><br />
                                        {gstData.contactNo}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Email:</strong><br />
                                        {gstData.email}
                                    </div>
                                </Col>
                                <Col md={12}>
                                    <div>
                                        <strong>Address:</strong><br />
                                        {gstData.address}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Price Summary */}
            {priceDetails && (
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Body>
                        <h6 className="fw-bold mb-3">Price Breakdown</h6>
                        <Row className="mb-2">
                            <Col>Base Fare</Col>
                            <Col className="text-end">₹ {Math.round(priceDetails.baseFare || 0)}</Col>
                        </Row>
                        {priceDetails.cgst > 0 && (
                            <Row className="mb-2">
                                <Col>CGST</Col>
                                <Col className="text-end">₹ {Math.round(priceDetails.cgst)}</Col>
                            </Row>
                        )}
                        {priceDetails.sgst > 0 && (
                            <Row className="mb-2">
                                <Col>SGST</Col>
                                <Col className="text-end">₹ {Math.round(priceDetails.sgst)}</Col>
                            </Row>
                        )}
                        {priceDetails.discount > 0 && (
                            <Row className="mb-2">
                                <Col>Discount</Col>
                                <Col className="text-end text-success">- ₹ {Math.round(priceDetails.discount)}</Col>
                            </Row>
                        )}
                        <hr />
                        <Row className="fw-bold fs-5">
                            <Col>Total Amount</Col>
                            <Col className="text-end text-primary">
                                ₹ {Math.round((priceDetails.baseFare || 0) + (priceDetails.cgst || 0) + (priceDetails.sgst || 0) - (priceDetails.discount || 0))}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            {/* Terms & Continue */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <Form.Check
                        type="checkbox"
                        id="terms-checkbox"
                        label={
                            <>
                                I have read and accept the{" "}
                                <a href="/terms-and-conditions" className="text-danger text-decoration-none" target="_blank">
                                    Terms & Conditions
                                </a>{" "}
                                and{" "}
                                <a href="/privacy-policy" className="text-danger text-decoration-none" target="_blank">
                                    Privacy Policy
                                </a>.
                            </>
                        }
                        defaultChecked
                        className="mb-3"
                    />
                    
                    <div className="alert alert-info small">
                        <FaExclamationTriangle className="me-2" />
                        Please review all details carefully before proceeding to payment. 
                        Guest names should match government-issued ID documents.
                    </div>
                </Card.Body>
            </Card>

            {/* Action Buttons */}
            <div className="d-flex gap-3 justify-content-center">
                <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate(-1)}
                    className="px-4"
                >
                    ← Back
                </Button>
                <Button 
                    variant="primary" 
                    size="lg"
                    className="btn-red px-5" 
                    onClick={handleContinue}
                >
                    Continue to Payment →
                </Button>
            </div>
        </div>
    );
};

export default HotelReviewInfo;