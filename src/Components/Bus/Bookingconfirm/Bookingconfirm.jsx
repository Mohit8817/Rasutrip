import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaRedo, FaBus, FaCalendarAlt, FaUser, FaMapMarkerAlt, FaTicketAlt, FaEnvelope, FaHome, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Bookingconfirm = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [bookingData, setBookingData] = useState(null);

    // Session storage keys
    const BOOKING_DATA_KEY = 'bus_booking_confirmation_data';
    const BOOKING_TIMESTAMP_KEY = 'bus_booking_timestamp';

    // Data expiry time (24 hours)
    const DATA_EXPIRY_TIME = 24 * 60 * 60 * 1000;

    // Save booking data to session storage
    const saveBookingData = (data) => {
        try {
            const dataWithTimestamp = {
                ...data,
                timestamp: Date.now()
            };
            // Using a simple variable instead of sessionStorage
            window.bookingStorageData = dataWithTimestamp;
        } catch (error) {
            console.error('Error saving booking data:', error);
        }
    };

    // Get booking data from storage
    const getBookingData = () => {
        try {
            const savedData = window.bookingStorageData;

            if (savedData && savedData.timestamp) {
                const timestamp = savedData.timestamp;
                const now = Date.now();

                // Check if data is not expired (24 hours)
                if (now - timestamp < DATA_EXPIRY_TIME) {
                    return savedData;
                } else {
                    // Data expired, clear it
                    clearBookingData();
                }
            }
        } catch (error) {
            console.error('Error retrieving booking data:', error);
        }
        return null;
    };

    // Clear booking data from storage
    const clearBookingData = () => {
        try {
            delete window.bookingStorageData;
        } catch (error) {
            console.error('Error clearing booking data:', error);
        }
    };

    // Initialize booking data on component mount
    useEffect(() => {
        // First check if we have fresh data from navigation state
        if (state && state.isBooked && state.bookingResult) {
            setBookingData(state);
            // Save to storage for future access
            saveBookingData(state);

            // Show success toast
            toast.success('Bus booking confirmed successfully!', {
                position: "top-right",
                autoClose: 5000
            });
        } else {
            // Try to load from storage
            const savedData = getBookingData();
            if (savedData) {
                setBookingData(savedData);
            }
        }
    }, [state]);

    // Get current booking data (either from state or storage)
    const getCurrentBookingData = () => {
        return bookingData || {};
    };

    // Extract data from current booking data
    const currentData = getCurrentBookingData();
    const {
        bookingDetails = {},
        bookingResult = {},
        isBooked = false,
        finalAmount = 0,
        paymentId = '',
        orderId = '',
        extractedBookingId = null
    } = currentData;

    const {
        contactData = {},
        passengerData = [],
        searchTokenId = '',
        bus = {},
        fromCity = '',
        toCity = '',
        departDate = '',
        selectedSeats = [],
        totalPrice = 0,
        selectedBoardingPoint = {},
        selectedDroppingPoint = {}
    } = bookingDetails || {};

    // Extract BookingId from result with multiple fallback strategies
    const extractBookingIdFromResult = (result) => {
        const possiblePaths = [
            extractedBookingId,
            result?.BookingId,
            result?.bookingId,
            result?.data?.BookingId,
            result?.data?.bookingId,
            result?.response?.BookingId,
            result?.result?.BookingId,
            result?.booking?.id,
            result?.id
        ];

        for (let candidateId of possiblePaths) {
            if (candidateId && String(candidateId).trim() !== '' && candidateId !== 'undefined' && candidateId !== 'null') {
                return String(candidateId);
            }
        }
        return null;
    };

    const bookingId = extractBookingIdFromResult(bookingResult);

    // Extract seat names for display
    const extractSeatName = (seat, index) => {
        if (!seat) return `S${index + 1}`;

        let seatName = seat.SeatName || seat.seatName || seat.seatNumber || seat.name || seat.id || seat.number || seat;

        if (typeof seatName === 'string' && seatName.trim()) {
            return seatName.trim();
        }

        if (typeof seatName === 'number' && !isNaN(seatName)) {
            return seatName.toString();
        }

        return `S${index + 1}`;
    };

    // Generate Invoice Data
    const generateInvoiceData = () => {
        const now = new Date();
        const invoiceNumber = `INV-BUS-${bookingId || Date.now()}`;
        
        return {
            // Basic Invoice Info
            invoiceId: invoiceNumber,
            invoiceNumber: invoiceNumber,
            invoiceDate: now.toLocaleDateString('en-IN'),
            bookingId: bookingId || 'N/A',
            
            // Company Details (Supplier)
            supplierDetails: {
                name: 'RasuTrip Pvt. Ltd.',
                mobile: '+91-9876543210',
                email: 'support@rasutrip.com',
                pan: 'ABCDE1234F',
                state: 'Delhi',
                companyRegisteredNumber: 'U63040DL2020PTC123456'
            },
            
            // Customer Details
            receiverDetails: {
                name: passengerData.length > 0 ? `${passengerData[0].firstName} ${passengerData[0].lastName}` : 'N/A',
                phone: contactData.mobile || 'N/A',
                email: contactData.email || 'N/A'
            },
            
            // Journey Details
            source: fromCity,
            destination: toCity,
            departureTime: departDate ? new Date(departDate).toISOString() : now.toISOString(),
            arrivalTime: departDate ? new Date(new Date(departDate).getTime() + 8 * 60 * 60 * 1000).toISOString() : now.toISOString(), // +8 hours estimate
            busType: bus.operator || 'Standard Bus',
            TicketNo: bookingId || 'TKT001',
            
            // Passenger Details
            passenger: passengerData.map((p, index) => ({
                Title: p.title || 'Mr',
                FirstName: p.firstName || 'Passenger',
                LastName: p.lastName || `${index + 1}`,
                Age: p.age || 25,
                Gender: p.gender || 'Male',
                SeatName: extractSeatName(selectedSeats[index], index),
                Seat: {
                    SeatFare: Math.round((finalAmount || totalPrice) / passengerData.length)
                }
            })),
            
            // Fare Details
            fareDetails: {
                NoOfSeats: selectedSeats.length,
                baseFare: Math.round((finalAmount || totalPrice) * 0.85),
                taxes: Math.round((finalAmount || totalPrice) * 0.12),
                serviceCharges: Math.round((finalAmount || totalPrice) * 0.03),
                couponDiscount: 0,
                IGSTRate: 12
            },
            
            // Boarding/Dropping Points
            boardingPointdetails: {
                CityPointName: selectedBoardingPoint.name || '',
                CityPointLocation: selectedBoardingPoint.address || fromCity,
                CityPointLandmark: selectedBoardingPoint.landmark || '',
                CityPointTime: departDate ? new Date(departDate).toISOString() : now.toISOString(),
                CityPointContactNumber: selectedBoardingPoint.contactNumber || ''
            },
            
            droppingPointdetails: [{
                CityPointName: selectedDroppingPoint.name || '',
                CityPointLocation: selectedDroppingPoint.address || toCity,
                CityPointTime: departDate ? new Date(new Date(departDate).getTime() + 8 * 60 * 60 * 1000).toISOString() : now.toISOString()
            }],
            
            // Payment
            vendorCommission: Math.round((finalAmount || totalPrice) * 0.02),
            totalPayable: finalAmount || totalPrice,
            invoiceTotal: finalAmount || totalPrice
        };
    };

    // Generate HTML Invoice
    const generateInvoiceHTML = (invoiceData) => {
        let busPassengerRows = '';
        invoiceData.passenger.forEach((p, i) => {
            busPassengerRows += `
              <tr>
                <td>${invoiceData.TicketNo}</td>
                <td>${invoiceData.source} - ${invoiceData.destination}</td>
                <td>${p.Title} ${p.FirstName} ${p.LastName}</td>
                <td>${p.Age}</td>
                <td>${p.SeatName}</td>
                <td>₹ ${p.Seat.SeatFare}</td>
              </tr>
            `;
        });

        return `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ccc; padding: 20px;">
              <h2 style="text-align: center;">Tax Invoice (Bus Booking)</h2>

              <table style="width: 100%; margin-bottom: 20px; font-size: 14px;">
                <tr>
                  <td>
                    <strong>From :</strong> ${invoiceData.supplierDetails.name}<br />
                    <strong>Mobile :</strong> ${invoiceData.supplierDetails.mobile}<br />
                    <strong>Email :</strong> ${invoiceData.supplierDetails.email}<br />
                    <strong>PAN Number :</strong> ${invoiceData.supplierDetails.pan}<br />
                    <strong>State :</strong> ${invoiceData.supplierDetails.state}<br />
                    <strong>Company Registered No. :</strong> ${invoiceData.supplierDetails.companyRegisteredNumber}
                  </td>
                  <td style="text-align: right;">
                    <strong>Passenger Name :</strong> ${invoiceData.receiverDetails.name}<br />
                    <strong>Phone :</strong> ${invoiceData.receiverDetails.phone}
                  </td>
                </tr>
              </table>

              <table style="width: 100%; font-size: 14px; margin-bottom: 20px;" border="1" cellpadding="8" cellspacing="0">
                <tr>
                  <td><strong>Invoice Number :</strong> ${invoiceData.invoiceId}</td>
                  <td><strong>Invoice Date :</strong> ${invoiceData.invoiceDate}</td>
                </tr>
                <tr>
                  <td><strong>Booking ID :</strong> ${invoiceData.bookingId}</td>
                  <td><strong>Ticket No :</strong> ${invoiceData.TicketNo}</td>
                </tr>
                <tr>
                  <td><strong>From :</strong> ${invoiceData.source}</td>
                  <td><strong>To :</strong> ${invoiceData.destination}</td>
                </tr>
                <tr>
                  <td><strong>Departure :</strong> ${new Date(invoiceData.departureTime).toLocaleString()}</td>
                  <td><strong>Arrival :</strong> ${new Date(invoiceData.arrivalTime).toLocaleString()}</td>
                </tr>
                <tr>
                  <td colspan="2"><strong>Bus Type :</strong> ${invoiceData.busType}</td>
                </tr>
              </table>

              <h3>PASSENGER DETAILS</h3>
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;" border="1" cellpadding="8" cellspacing="0">
                <tr>
                  <th>Ticket No</th>
                  <th>Route</th>
                  <th>Passenger Name</th>
                  <th>Age</th>
                  <th>Seat No</th>
                  <th>Fare (₹)</th>
                </tr>
                ${busPassengerRows}
              </table>

              <h3 style="margin-top: 30px;">PAYMENT DETAILS</h3>
              <table style="width: 100%; font-size: 14px;" cellpadding="8" cellspacing="0">
                <tr><td><strong>No. of Seats:</strong></td><td>${invoiceData.fareDetails.NoOfSeats}</td></tr>
                <tr><td><strong>Base Fare:</strong></td><td>₹ ${invoiceData.fareDetails.baseFare}</td></tr>
                <tr><td><strong>Taxes:</strong></td><td>₹ ${invoiceData.fareDetails.taxes}</td></tr>
                <tr><td><strong>Service Charges:</strong></td><td>₹ ${invoiceData.fareDetails.serviceCharges}</td></tr>
                <tr><td><strong>Platform Fee:</strong></td><td>₹ ${invoiceData.vendorCommission}</td></tr>
                <tr><td><strong>Coupon Discount (-):</strong></td><td>₹ ${invoiceData.fareDetails.couponDiscount}</td></tr>
                <tr><td><strong>IGST Rate:</strong></td><td>${invoiceData.fareDetails.IGSTRate}%</td></tr>
                <tr><td><strong>Total Payable:</strong></td><td><strong>₹ ${invoiceData.totalPayable}</strong></td></tr>
              </table>

              <h3 style="margin-top: 30px;">BOARDING & DROPPING DETAILS</h3>
              <table style="width: 100%; font-size: 14px;" cellpadding="8" cellspacing="0">
                <tr>
                  <td><strong>Boarding:</strong><br>
                    ${invoiceData.boardingPointdetails.CityPointName}, ${invoiceData.boardingPointdetails.CityPointLocation}<br>
                    Landmark: ${invoiceData.boardingPointdetails.CityPointLandmark}<br>
                    Time: ${new Date(invoiceData.boardingPointdetails.CityPointTime).toLocaleString()}<br>
                    Contact: ${invoiceData.boardingPointdetails.CityPointContactNumber}
                  </td>
                  <td><strong>Dropping:</strong><br>
                    ${invoiceData.droppingPointdetails[0].CityPointName}, ${invoiceData.droppingPointdetails[0].CityPointLocation}<br>
                    Time: ${new Date(invoiceData.droppingPointdetails[0].CityPointTime).toLocaleString()}
                  </td>
                </tr>
              </table>

              <h3 style="margin-top: 30px;">TERMS & CONDITIONS</h3>
              <ul style="font-size: 14px; padding-left: 20px;">
                <li>This is a computer-generated invoice; no signature required.</li>
                <li>All disputes are subject to jurisdiction of New Delhi.</li>
                <li>Please report at the boarding point at least 30 minutes before departure.</li>
                <li>Ensure correct contact number for updates on schedule or cancellation.</li>
              </ul>
            </div>
        `;
    };

    // Download Invoice Function
    const handleDownloadInvoice = () => {
        try {
            const invoiceData = generateInvoiceData();
            const htmlContent = generateInvoiceHTML(invoiceData);
            
            // Create a new window/tab for printing
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invoice - ${invoiceData.invoiceNumber}</title>
                    <style>
                        @media print {
                            body { margin: 0; }
                            @page { margin: 0.5in; }
                        }
                    </style>
                </head>
                <body>
                    ${htmlContent}
                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();

            toast.success('Invoice opened for download/print!', {
                position: "top-right",
                autoClose: 3000
            });
        } catch (error) {
            console.error('Error generating invoice:', error);
            toast.error('Error generating invoice. Please try again.', {
                position: "top-right",
                autoClose: 3000
            });
        }
    };

    // Navigate back to home and clear booking data automatically
    const handleBackToHome = () => {
        // Clear booking data from storage
        clearBookingData();
        setBookingData(null);

        toast.success('Thank you! Booking data cleared for security.', {
            position: "top-right",
            autoClose: 3000
        });

        // Navigate to home
        navigate('/');
    };

    // Function to go back to booking confirmation (can be called from anywhere)
    const handleViewBookingDetails = () => {
        // If we have booking data, stay on current page, otherwise redirect to home
        if (bookingData && bookingData.isBooked) {
            // Already on confirmation page with data
            toast.info('You are already viewing your booking confirmation!', {
                position: "top-right",
                autoClose: 3000
            });
        } else {
            // Try to load from storage
            const savedData = getBookingData();
            if (savedData) {
                setBookingData(savedData);
                toast.success('Booking details loaded successfully!', {
                    position: "top-right",
                    autoClose: 3000
                });
            } else {
                toast.error('No recent booking found. Please make a new booking.', {
                    position: "top-right",
                    autoClose: 5000
                });
                navigate('/');
            }
        }
    };

    // Redirect if no booking data available
    if (!bookingData || !isBooked || !bookingResult) {
        return (
            <Container className="py-5 mt-5">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <Card className="shadow border-0" style={{ borderRadius: '15px', maxWidth: '500px' }}>
                        <Card.Body className="text-center p-5">
                            <h4 className="text-warning mb-3">No Recent Booking Found</h4>
                            <p className="text-muted mb-4">
                                It seems like there's no recent booking data available or it has expired.
                                Please start the booking process again or check if you have a recent booking.
                            </p>

                            <div className="d-flex flex-column gap-3">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="px-4 py-2"
                                    onClick={() => navigate('/')}
                                    style={{ borderRadius: '10px' }}
                                >
                                    <FaHome className="me-2" />
                                    Back to Home
                                </Button>

                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    className="px-3 py-2"
                                    onClick={handleViewBookingDetails}
                                    style={{ borderRadius: '10px' }}
                                >
                                    <FaRedo className="me-2" />
                                    Try Loading Recent Booking
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        );
    }

    const seatNumbers = selectedSeats.map((seat, index) => extractSeatName(seat, index)).join(', ');

    return (
        <div className="bg-light min-vh-100">
            <Container className="py-4">
                <div className="d-flex justify-content-center">
                    <div style={{ maxWidth: '1200px', width: '100%' }}>

                        {/* Success Header Card */}
                        <Card className="text-center mb-5 border-0 shadow" style={{
                            backgroundColor: '#28a745',
                            borderRadius: '15px'
                        }}>
                            <Card.Body className="">
                                <h3 className=" fw-bold display-6 text-white">Booking Confirmed!</h3>
                                <p className="mb-0 fs-5 text-white">Your bus ticket has been booked successfully</p>
                                {bookingId && (
                                    <div className="mt-4">
                                        <Badge bg="light" text="success" className="fs-6 px-4 py-2 fw-semibold">
                                            Booking ID: {bookingId}
                                        </Badge>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        <Row className="g-4 mb-5">
                            {/* Journey Details */}
                            <Col lg={6}>
                                <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                    <Card.Header className="bg-primary text-white border-0 py-4" style={{ borderRadius: '15px 15px 0 0' }}>
                                        <h4 className="mb-0 fw-bold"><FaBus className="me-2" />Journey Details</h4>
                                    </Card.Header>
                                    <Card.Body className="p-4">
                                        <div className="mb-4">
                                            <div className="bg-danger text-white p-4 rounded mb-4">
                                                <small className="d-block mb-1">Total Amount Paid</small>
                                                <h5 className="mb-0 fw-bold">₹{finalAmount || totalPrice}</h5>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="d-flex align-items-center mb-2">
                                                <FaMapMarkerAlt className="text-danger me-2" />
                                                <strong>Route:</strong>
                                            </div>
                                            <div className="p-3 bg-light rounded">
                                                <div className="fw-bold">{fromCity} → {toCity}</div>
                                                <small className="text-muted">{bus?.operator || 'N/A'}</small>
                                            </div>
                                        </div>

                                        <Row className="g-3">
                                            <Col sm={6}>
                                                <div className="p-3 bg-light rounded">
                                                    <small className="text-muted d-block mb-1"><FaCalendarAlt className="me-1" />Travel Date</small>
                                                    <span className="fw-semibold text-dark">
                                                        {departDate ? new Date(departDate).toDateString() : 'N/A'}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col sm={6}>
                                                <div className="p-3 bg-light rounded">
                                                    <small className="text-muted d-block mb-1"><FaTicketAlt className="me-1" />Seat Numbers</small>
                                                    <Badge bg="secondary" className="fw-semibold">{seatNumbers}</Badge>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Passenger Information */}
                            <Col lg={6}>
                                <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                    <Card.Header className="bg-info text-white border-0 py-4" style={{ borderRadius: '15px 15px 0 0' }}>
                                        <h4 className="mb-0 fw-bold"><FaUser className="me-2" />Passenger Information</h4>
                                    </Card.Header>
                                    <Card.Body className="p-4">
                                        {passengerData && passengerData.length > 0 ? (
                                            <div>
                                                <div className="bg-warning text-white p-4 rounded mb-4">
                                                    <small className="d-block mb-1">Lead Passenger</small>
                                                    <h5 className="mb-0 fw-bold">
                                                        {passengerData[0].firstName} {passengerData[0].lastName}
                                                    </h5>
                                                </div>

                                                <Row className="g-3">
                                                    {contactData?.email && (
                                                        <Col sm={12}>
                                                            <div className="p-3 bg-light rounded">
                                                                <small className="text-muted d-block mb-1"><FaEnvelope className="me-1" />Email</small>
                                                                <span className="fw-semibold text-dark">{contactData.email}</span>
                                                            </div>
                                                        </Col>
                                                    )}

                                                    {contactData?.mobile && (
                                                        <Col sm={6}>
                                                            <div className="p-3 bg-light rounded">
                                                                <small className="text-muted d-block mb-1">📱 Phone</small>
                                                                <span className="fw-semibold text-dark">{contactData.mobile}</span>
                                                            </div>
                                                        </Col>
                                                    )}

                                                    <Col sm={6}>
                                                        <div className="p-3 bg-light rounded">
                                                            <small className="text-muted d-block mb-1">👥 Total Passengers</small>
                                                            <span className="fw-semibold text-dark">{passengerData.length}</span>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                {passengerData.length > 1 && (
                                                    <div className="mt-3">
                                                        <small className="text-muted">All Passengers:</small>
                                                        <div className="mt-2">
                                                            {passengerData.map((passenger, index) => (
                                                                <div key={index} className="mb-1">
                                                                    <Badge bg="light" text="dark" className="me-2">
                                                                        {index + 1}. {passenger.firstName} {passenger.lastName}
                                                                        ({passenger.age}y, {passenger.gender})
                                                                    </Badge>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-5">
                                                <p className="text-muted mb-0">Passenger information not available</p>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Action Buttons */}
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                            <Card.Body className="p-5">
                                <div className="text-center mb-4">
                                    <h5 className="mb-4 text-dark fw-bold">What would you like to do next?</h5>

                                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                                        <Button
                                            variant="success"
                                            size="lg"
                                            className="px-5 py-3 fw-semibold"
                                            onClick={handleDownloadInvoice}
                                            style={{
                                                fontSize: '1.1rem',
                                                borderRadius: '10px',
                                                minWidth: '200px'
                                            }}
                                        >
                                            <FaDownload className="me-2" />
                                            Download Invoice
                                        </Button>
                                        
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="px-5 py-3 fw-semibold"
                                            onClick={handleBackToHome}
                                            style={{
                                                fontSize: '1.1rem',
                                                borderRadius: '10px',
                                                minWidth: '200px'
                                            }}
                                        >
                                            <FaHome className="me-2" />
                                            Back to Home
                                        </Button>
                                    </div>
                                </div>

                                <div className="border-top pt-4">
                                    <Alert variant="success" className="border-0 mb-3" style={{
                                        backgroundColor: '#d4edda',
                                        borderRadius: '10px'
                                    }}>
                                        <div className="d-flex align-items-start">
                                            <div className="flex-grow-1">
                                                <Alert.Heading as="h6" className="text-success mb-2 fw-bold">
                                                    Booking Completed Successfully
                                                </Alert.Heading>
                                                <p className="mb-2 text-dark">
                                                    Your booking has been confirmed successfully. You can download your invoice using the button above.
                                                    The booking data will be automatically cleared when you return to the home page for security purposes.
                                                </p>
                                                <small className="text-muted">
                                                    For future reference, save your booking ID and download the invoice before leaving this page.
                                                </small>
                                            </div>
                                        </div>
                                    </Alert>

                                    <Alert variant="info" className="border-0 mb-0" style={{
                                        backgroundColor: '#e8f4fd',
                                        borderRadius: '10px'
                                    }}>
                                        <div className="d-flex align-items-start">
                                            <div className="flex-grow-1">
                                                <Alert.Heading as="h6" className="text-info mb-2 fw-bold">
                                                    Booking Reference
                                                </Alert.Heading>
                                                <p className="mb-2 text-dark">
                                                    Your booking ID{' '}
                                                    <Badge bg="info" className="mx-1 px-3 py-1">
                                                        {bookingId}
                                                    </Badge>
                                                    {' '}has been generated for your reference.
                                                </p>
                                                <small className="text-muted">
                                                    For any assistance, please contact our support team with this booking ID.
                                                </small>
                                            </div>
                                        </div>
                                    </Alert>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Bookingconfirm;