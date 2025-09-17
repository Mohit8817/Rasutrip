import React, { useEffect } from 'react';
import { Container, Card, Button, Row, Col, Badge, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';

const HotelConfirmation = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    // Extract data from navigation state
    const {
        booking = {},
        bookingResult = {},
        confirmationDetails = {},
        hotelDetails = {},
        paymentDetails = {},
        amount = 0,
        isBooked = false,
        bookingDetails = {}
    } = state || {};

    const actualBooking = booking || bookingResult || {};
    const leadPassenger = bookingDetails?.contactData || {};

    // Show success toast on mount
    useEffect(() => {
        if ((isBooked && actualBooking) || confirmationDetails?.message) {
            toast.success('🎉 Hotel booking confirmed successfully!', {
                position: "top-right",
                autoClose: 5000
            });
        }
    }, [isBooked, actualBooking, confirmationDetails]);

    // FIXED: Better date extraction and number of nights calculation
    const getBookingDates = () => {
        // Try to get dates from multiple sources
        const checkInSources = [
            bookingDetails?.checkInDate,
            bookingDetails?.CheckInDate,
            actualBooking?.CheckInDate,
            actualBooking?.checkInDate,
            state?.checkInDate,
            state?.searchParams?.checkInDate
        ];

        const checkOutSources = [
            bookingDetails?.checkOutDate,
            bookingDetails?.CheckOutDate,
            actualBooking?.CheckOutDate,
            actualBooking?.checkOutDate,
            state?.checkOutDate,
            state?.searchParams?.checkOutDate
        ];

        // Find the first valid date from sources
        const getValidDate = (sources) => {
            for (const dateSource of sources) {
                if (dateSource) {
                    // Try different date formats
                    let date;
                    
                    // If it's already a Date object
                    if (dateSource instanceof Date && !isNaN(dateSource)) {
                        return dateSource;
                    }
                    
                    // If it's a string, try to parse it
                    if (typeof dateSource === 'string') {
                        // Try ISO format first
                        date = new Date(dateSource);
                        if (!isNaN(date.getTime())) {
                            return date;
                        }
                        
                        // Try DD/MM/YYYY format (common in Indian locale)
                        const ddmmyyyy = dateSource.split('/');
                        if (ddmmyyyy.length === 3) {
                            date = new Date(ddmmyyyy[2], ddmmyyyy[1] - 1, ddmmyyyy[0]);
                            if (!isNaN(date.getTime())) {
                                return date;
                            }
                        }
                        
                        // Try DD-MM-YYYY format
                        const ddmmyyyy2 = dateSource.split('-');
                        if (ddmmyyyy2.length === 3) {
                            date = new Date(ddmmyyyy2[2], ddmmyyyy2[1] - 1, ddmmyyyy2[0]);
                            if (!isNaN(date.getTime())) {
                                return date;
                            }
                        }
                    }
                    
                    // If it's a number (timestamp)
                    if (typeof dateSource === 'number') {
                        date = new Date(dateSource);
                        if (!isNaN(date.getTime())) {
                            return date;
                        }
                    }
                }
            }
            return null;
        };

        const checkInDate = getValidDate(checkInSources);
        const checkOutDate = getValidDate(checkOutSources);

        // If dates not found, use reasonable defaults
        const finalCheckIn = checkInDate || new Date();
        const finalCheckOut = checkOutDate || new Date(Date.now() + 86400000); // +1 day

        return {
            checkInDate: finalCheckIn,
            checkOutDate: finalCheckOut,
            checkInDateString: finalCheckIn.toLocaleDateString('en-IN'),
            checkOutDateString: finalCheckOut.toLocaleDateString('en-IN')
        };
    };

    // FIXED: Calculate number of nights properly
    const calculateNumberOfNights = (checkIn, checkOut) => {
        try {
            // Ensure we have valid Date objects
            const checkInDate = checkIn instanceof Date ? checkIn : new Date(checkIn);
            const checkOutDate = checkOut instanceof Date ? checkOut : new Date(checkOut);

            // Validate dates
            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                console.warn('Invalid dates provided, using default 1 night');
                return 1;
            }

            // Calculate difference in days
            const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

            // Ensure minimum 1 night and maximum reasonable nights
            const nights = Math.max(1, Math.min(daysDiff, 365));
            
            console.log('Date calculation:', {
                checkIn: checkInDate.toDateString(),
                checkOut: checkOutDate.toDateString(),
                timeDiff,
                nights
            });

            return nights;
        } catch (error) {
            console.error('Error calculating nights:', error);
            return 1; // Default fallback
        }
    };

    // Generate Invoice Data
    const generateInvoiceData = () => {
        const now = new Date();
        const bookingId = confirmationDetails?.bookingId || actualBooking?.BookingID || actualBooking?.bookingId || `HTL${Date.now()}`;
        const invoiceNumber = `INV-HTL-${bookingId}`;
        
        // Use the improved date extraction
        const { checkInDate, checkOutDate, checkInDateString, checkOutDateString } = getBookingDates();
        const noOfNights = calculateNumberOfNights(checkInDate, checkOutDate);
        
        const hotelName = hotelDetails?.name || actualBooking?.HotelName || 'Hotel Name';
        const guestName = leadPassenger?.FirstName ? 
            `${leadPassenger.Title || ''} ${leadPassenger.FirstName} ${leadPassenger.LastName || ''}`.trim() : 
            'Guest Name';
        
        const baseFare = Math.round(amount * 0.82) || 0;
        const taxes = Math.round(amount * 0.15) || 0;
        const platformFee = Math.round(amount * 0.03) || 0;
        
        return {
            // Basic Invoice Info
            invoiceId: invoiceNumber,
            invoiceNumber: invoiceNumber,
            invoiceDate: now.toLocaleDateString('en-IN'),
            bookingId: bookingId,
            
            // Company Details (Supplier)
            supplierDetails: {
                name: 'RasuTrip Pvt. Ltd.',
                mobile: '+91-9876543210',
                email: 'support@rasutrip.com',
                pan: 'ABCDE1234F',
                state: 'Delhi',
                companyRegisteredNumber: 'U63040DL2020PTC367456'
            },
            
            // Customer Details
            receiverDetails: {
                name: guestName,
                phone: leadPassenger?.Phoneno || 'N/A',
                email: leadPassenger?.Email || 'N/A'
            },
            
            // Hotel Details
            hotelName: hotelName,
            destination: bookingDetails?.destination || hotelDetails?.city || actualBooking?.destination || 'N/A',
            address: hotelDetails?.address || actualBooking?.address || 'Hotel Address',
            starRating: hotelDetails?.starRating || actualBooking?.starRating || 3,
            
            // Booking Details
            checkInDate: checkInDateString,
            checkOutDate: checkOutDateString,
            checkInTime: checkInDate.toISOString(),
            checkOutTime: checkOutDate.toISOString(),
            noOfNights: noOfNights,
            noOfRooms: bookingDetails?.rooms || actualBooking?.NoOfRooms || 1,
            
            // Guest Details
            guest: {
                name: guestName,
                phone: leadPassenger?.Phoneno || 'N/A',
                email: leadPassenger?.Email || 'N/A',
                age: leadPassenger?.Age || 'N/A'
            },
            
            // Fare Details
            fareDetails: {
                baseFare: baseFare,
                taxes: taxes,
                platformFee: platformFee,
                couponDiscount: 0,
                IGSTRate: 18
            },
            
            // Payment
            totalPayable: amount,
            invoiceTotal: amount
        };
    };

    // Generate HTML Invoice
    const generateInvoiceHTML = (invoiceData) => {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ccc; padding: 20px;">
              <h2 style="text-align: center; color: #2c3e50;">Tax Invoice (Hotel Booking)</h2>

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
                    <strong>Guest Name :</strong> ${invoiceData.receiverDetails.name}<br />
                    <strong>Phone :</strong> ${invoiceData.receiverDetails.phone}<br />
                    <strong>Email :</strong> ${invoiceData.receiverDetails.email}
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
                  <td><strong>Booking Status :</strong> Confirmed</td>
                </tr>
                <tr>
                  <td><strong>Check-In :</strong> ${invoiceData.checkInDate}</td>
                  <td><strong>Check-Out :</strong> ${invoiceData.checkOutDate}</td>
                </tr>
                <tr>
                  <td><strong>No. of Nights :</strong> ${invoiceData.noOfNights}</td>
                  <td><strong>No. of Rooms :</strong> ${invoiceData.noOfRooms}</td>
                </tr>
              </table>

              <h3">HOTEL DETAILS</h3>
              <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;" border="1" cellpadding="8" cellspacing="0">
                <tr>
                  <td><strong>Hotel Name</strong></td>
                  <td>${invoiceData.hotelName}</td>
                </tr>
                <tr>
                  <td><strong>Destination</strong></td>
                  <td>${invoiceData.destination}</td>
                </tr>
                <tr>
                  <td><strong>Address</strong></td>
                  <td>${invoiceData.address}</td>
                </tr>
                <tr>
                  <td><strong>Star Rating</strong></td>
                  <td>${invoiceData.starRating}</td>
                </tr>
              </table>

              <h3">GUEST DETAILS</h3>
              <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;" border="1" cellpadding="8" cellspacing="0">
                <tr">
                  <th>#</th>
                  <th>Guest Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Age</th>
                </tr>
                <tr>
                  <td>1</td>
                  <td>${invoiceData.guest.name}</td>
                  <td>${invoiceData.guest.phone}</td>
                  <td>${invoiceData.guest.email}</td>
                  <td>${invoiceData.guest.age}</td>
                </tr>
              </table>

              <h3">PAYMENT DETAILS</h3>
              <table style="width: 100%; font-size: 14px; margin-bottom: 20px;" cellpadding="8" cellspacing="0">
                <tr><td><strong>Room Fare (${invoiceData.noOfNights} nights):</strong></td><td>₹ ${invoiceData.fareDetails.baseFare.toLocaleString()}</td></tr>
                <tr><td><strong>Taxes & Fees:</strong></td><td>₹ ${invoiceData.fareDetails.taxes.toLocaleString()}</td></tr>
                <tr><td><strong>Platform Fee:</strong></td><td>₹ ${invoiceData.fareDetails.platformFee.toLocaleString()}</td></tr>
                <tr><td><strong>Coupon Discount (-):</strong></td><td>₹ ${invoiceData.fareDetails.couponDiscount}</td></tr>
                <tr><td><strong>IGST Rate:</strong></td><td>${invoiceData.fareDetails.IGSTRate}%</td></tr>
                <tr>
                  <td><strong>Total Payable:</strong></td>
                  <td><strong>₹ ${invoiceData.totalPayable.toLocaleString()}</strong></td>
                </tr>
              </table>

              <h3 >CHECK-IN & CHECK-OUT DETAILS</h3>
              <table style="width: 100%; font-size: 14px; margin-bottom: 20px;" cellpadding="8" cellspacing="0">
                <tr>
                  <td style="vertical-align: top; width: 50%;">
                    <strong>Check-In:</strong><br>
                    Date: ${invoiceData.checkInDate}<br>
                    Time: 2:00 PM onwards<br>
                    Hotel: ${invoiceData.hotelName}<br>
                    Address: ${invoiceData.address}
                  </td>
                  <td style="vertical-align: top; width: 50%;">
                    <strong>Check-Out:</strong><br>
                    Date: ${invoiceData.checkOutDate}<br>
                    Time: 11:00 AM<br>
                    Total Stay: ${invoiceData.noOfNights} night(s)
                  </td>
                </tr>
              </table>

              <h3 style="margin-top: 30px; color: #2c3e50;">CANCELLATION POLICY</h3>
              <ul style="font-size: 14px; padding-left: 20px; margin-bottom: 20px;">
                <li>Free cancellation up to 24 hours before check-in</li>
                <li>50% charges for cancellation within 24 hours</li>
                <li>100% charges for no-show</li>
                <li>Refunds will be processed within 7-10 working days</li>
              </ul>

              <h3 style="margin-top: 30px; color: #2c3e50;">TERMS & CONDITIONS</h3>
              <ul style="font-size: 14px; padding-left: 20px;">
                <li>This is a computer-generated invoice; no signature required.</li>
                <li>All disputes are subject to jurisdiction of New Delhi.</li>
                <li>Guests must present valid ID proof (Passport/Voter ID/Aadhar Card).</li>
                <li>Hotel rules and policies apply as per hotel management.</li>
                <li>Check-in time is 2:00 PM and check-out time is 11:00 AM.</li>
                <li>Number of nights: ${invoiceData.noOfNights} (${invoiceData.checkInDate} to ${invoiceData.checkOutDate})</li>
                <li>For any queries, contact our support team at ${invoiceData.supplierDetails.email}</li>
              </ul>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
                <small style="color: #7f8c8d;">Thank you for choosing RasuTrip! Have a pleasant stay!</small>
              </div>
            </div>
        `;
    };

    // Download Invoice Function (HTML Version like Bus)
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
                    <title>Hotel Invoice - ${invoiceData.invoiceNumber}</title>
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

    // Redirect if no booking data
    if (!state || (!isBooked && !confirmationDetails?.bookingId) || (!actualBooking && !confirmationDetails)) {
        return (
            <Container className="py-5 mt-5">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <Card className="shadow border-0" style={{ borderRadius: '15px', maxWidth: '500px' }}>
                        <Card.Body className="text-center p-5">
                            <h4 className="text-danger mb-3">No Booking Information Found</h4>
                            <p className="text-muted mb-4">It seems like there's no booking data available. Please start the booking process again.</p>
                            <Button
                                variant="primary"
                                size="lg"
                                className="px-4 py-2"
                                onClick={() => navigate('/')}
                                style={{ borderRadius: '10px' }}
                            >
                                Back to Home
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        );
    }

    const bookingId = confirmationDetails?.bookingId || actualBooking?.BookingID || actualBooking?.bookingId || 'N/A';
    const hotelName = hotelDetails?.name || actualBooking?.HotelName || 'Hotel';
    const bookingTime = confirmationDetails?.bookingTime ? new Date(confirmationDetails.bookingTime).toLocaleString() : new Date().toLocaleString();

    return (
        <div className="bg-light min-vh-100" >
            <Container className="py-4">
                <div className="d-flex justify-content-center">
                    <div style={{ maxWidth: '1200px', width: '100%' }}>

                        {/* Success Header Card */}
                        <Card className="text-center mb-5 border-0 shadow" style={{
                            backgroundColor: '#28a745',
                            borderRadius: '15px'
                        }}>
                            <Card.Body className="py-5 px-4">
                                <h3 className="mb-3 fw-bold display-6 text-white">Booking Confirmed!</h3>
                                <p className="mb-0 fs-5 text-white">Your hotel reservation has been successfully completed</p>
                                <div className="mt-4">
                                    <Badge bg="light" text="success" className="fs-6 px-4 py-2 fw-semibold">
                                        Booking ID: {bookingId}
                                    </Badge>
                                </div>
                            </Card.Body>
                        </Card>

                        <Row className="g-4 mb-5">
                            {/* Booking Details */}
                            <Col lg={6}>
                                <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                    <Card.Header className="bg-primary text-white border-0 py-4" style={{ borderRadius: '15px 15px 0 0' }}>
                                        <h4 className="mb-0 fw-bold">Booking Details</h4>
                                    </Card.Header>
                                    <Card.Body className="p-4">
                                        <div className="mb-4">
                                            <div className="bg-success text-white p-4 rounded mb-4">
                                                <small className="d-block mb-1">Total Amount Paid</small>
                                                <h5 className="mb-0 fw-bold">₹{amount?.toLocaleString()}</h5>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="p-3 bg-light rounded">
                                                <small className="text-muted d-block mb-1">Hotel Name</small>
                                                <h5 className="mb-0 text-dark">{hotelName}</h5>
                                            </div>
                                        </div>

                                        <Row className="g-3">
                                            <Col sm={6}>
                                                <div className="p-3 bg-light rounded">
                                                    <small className="text-muted d-block mb-1">Booking Time</small>
                                                    <span className="fw-semibold text-dark">{bookingTime}</span>
                                                </div>
                                            </Col>
                                            {paymentDetails?.paymentId && (
                                                <Col sm={6}>
                                                    <div className="p-3 bg-light rounded">
                                                        <small className="text-muted d-block mb-1">Payment ID</small>
                                                        <span className="fw-semibold text-dark text-truncate d-block">
                                                            {paymentDetails.paymentId}
                                                        </span>
                                                    </div>
                                                </Col>
                                            )}
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Guest Information */}
                            <Col lg={6}>
                                <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                    <Card.Header className="bg-info text-white border-0 py-4" style={{ borderRadius: '15px 15px 0 0' }}>
                                        <h4 className="mb-0 fw-bold">Guest Information</h4>
                                    </Card.Header>
                                    <Card.Body className="p-4">
                                        {leadPassenger && Object.keys(leadPassenger).length > 0 ? (
                                            <div>
                                                <div className="bg-warning text-white p-4 rounded mb-4">
                                                    <small className="d-block mb-1">Primary Guest</small>
                                                    <h5 className="mb-0 fw-bold">
                                                        {`${leadPassenger.Title || ''} ${leadPassenger.FirstName || ''} ${leadPassenger.LastName || ''}`.trim() || 'N/A'}
                                                    </h5>
                                                </div>

                                                <Row className="g-3">
                                                    {leadPassenger.Email && (
                                                        <Col sm={12}>
                                                            <div className="p-3 bg-light rounded">
                                                                <small className="text-muted d-block mb-1">Email Address</small>
                                                                <span className="fw-semibold text-dark">{leadPassenger.Email}</span>
                                                            </div>
                                                        </Col>
                                                    )}

                                                    {leadPassenger.Phoneno && (
                                                        <Col sm={6}>
                                                            <div className="p-3 bg-light rounded">
                                                                <small className="text-muted d-block mb-1">Phone Number</small>
                                                                <span className="fw-semibold text-dark">{leadPassenger.Phoneno}</span>
                                                            </div>
                                                        </Col>
                                                    )}

                                                    {leadPassenger.Age && (
                                                        <Col sm={6}>
                                                            <div className="p-3 bg-light rounded">
                                                                <small className="text-muted d-block mb-1">Age</small>
                                                                <span className="fw-semibold text-dark">{leadPassenger.Age} years</span>
                                                            </div>
                                                        </Col>
                                                    )}
                                                </Row>
                                            </div>
                                        ) : (
                                            <div className="text-center py-5">
                                                <p className="text-muted mb-0">Guest information not available</p>
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

                                    <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
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
                                            onClick={() => navigate('/')}
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
                                                    Your hotel booking has been confirmed successfully. You can download your invoice using the button above.
                                                    Please keep your booking ID for future reference.
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

export default HotelConfirmation;