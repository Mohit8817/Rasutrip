import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { sendHotelInvoice } from '../../../APIS/HotelApi/HotelAPi'; // Import the API function

const HotelConfirmation = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [invoiceData, setInvoiceData] = useState(null);
    const [loadingInvoice, setLoadingInvoice] = useState(false);
    const [invoiceError, setInvoiceError] = useState('');

    // Extract data from navigation state
    const {
        booking = {},
        bookingResult = {},
        confirmationDetails = {},
        hotelDetails = {},
        paymentDetails = {},
        amount = 0,
        isBooked = false,
        bookingDetails = {},
        couponData = null,
        couponDiscount = 0
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

    // Fetch invoice data from API
    const fetchInvoiceData = async () => {
        if (loadingInvoice || invoiceData) return; // Prevent multiple calls

        setLoadingInvoice(true);
        setInvoiceError('');

        try {
            const bookingId = confirmationDetails?.bookingId || actualBooking?.BookingID || actualBooking?.bookingId;
            
            if (!bookingId) {
                throw new Error('Booking ID not found');
            }

            const invoicePayload = {
                UserIp: confirmationDetails?.userIp || actualBooking?.UserIp || "49.36.217.215",
                BookingId: bookingId,
                SearchTokenId: confirmationDetails?.searchTokenId || bookingDetails?.searchTokenId || actualBooking?.SearchTokenId,
                receiverEmail: leadPassenger?.Email || 'guest@example.com'
            };

            console.log('Fetching invoice with payload:', invoicePayload);

            const response = await sendHotelInvoice(invoicePayload);
            
            if (response.success && response.data) {
                setInvoiceData(response.data);
                console.log('Invoice data fetched successfully:', response.data);
            } else {
                throw new Error(response.message || 'Failed to fetch invoice data');
            }
        } catch (error) {
            console.error('Error fetching invoice:', error);
            setInvoiceError(error.message || 'Failed to fetch invoice data');
            
            // Create fallback invoice data
            const fallbackInvoiceData = generateFallbackInvoiceData();
            setInvoiceData(fallbackInvoiceData);
        } finally {
            setLoadingInvoice(false);
        }
    };

    // Generate fallback invoice data if API fails
    const generateFallbackInvoiceData = () => {
        const now = new Date();
        const bookingId = confirmationDetails?.bookingId || actualBooking?.BookingID || actualBooking?.bookingId || `HTL${Date.now()}`;
        const invoiceNumber = `INV-HTL-${bookingId}`;

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
            invoiceDate: now.toISOString(),
            bookingId: bookingId,
            totalPayable: amount,
            invoiceTotal: amount,

            // Company Details (Supplier)
            supplierDetails: {
                name: 'RASUTRIP WEBSOFT TECHNOLOGIES LLP',
                mobile: '+91 9266424809',
                email: 'booking@rasutrip.com',
                pan: 'ABLFR7635L',
                state: 'Uttar Pradesh'
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
            checkInDate: bookingDetails?.checkInDate || new Date().toISOString(),
            checkOutDate: bookingDetails?.checkOutDate || new Date(Date.now() + 86400000).toISOString(),
            noOfNights: 1,
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
                serviceCharges: platformFee,
                couponDiscount: couponDiscount || 0,
                IGSTRate: 18,
                CGSTAmount: 0,
                SGSTAmount: 0,
                IGSTAmount: 0
            },

            // Additional fields
            UserIp: confirmationDetails?.userIp || "49.36.217.215",
            SearchTokenId: confirmationDetails?.searchTokenId || bookingDetails?.searchTokenId,
            isFallback: true
        };
    };

    // Generate HTML Invoice using API data
    const generateInvoiceHTMLFromAPI = (apiInvoiceData) => {
        // Format dates
        const formatDate = (dateStr) => {
            try {
                return new Date(dateStr).toLocaleDateString('en-IN');
            } catch {
                return dateStr || 'N/A';
            }
        };

        // Calculate number of nights
        const calculateNights = () => {
            try {
                if (apiInvoiceData.checkInDate && apiInvoiceData.checkOutDate) {
                    const checkIn = new Date(apiInvoiceData.checkInDate);
                    const checkOut = new Date(apiInvoiceData.checkOutDate);
                    const nights = Math.ceil((checkOut - checkIn) / (1000 * 3600 * 24));
                    return Math.max(1, nights);
                }
                return apiInvoiceData.noOfNights || 1;
            } catch {
                return 1;
            }
        };

        const nights = calculateNights();
        
        return `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ccc; padding: 20px;">
            <h2 style="text-align: center; color: #2c3e50;">Tax Invoice (Hotel Booking)</h2>

            <table style="width: 100%; margin-bottom: 20px; font-size: 14px;">
                <tr>
                <td>
                    <strong>From:</strong> ${apiInvoiceData.supplierDetails?.name || 'RASUTRIP WEBSOFT TECHNOLOGIES LLP'}<br />
                    <strong>Mobile:</strong> ${apiInvoiceData.supplierDetails?.mobile || '+91 9266424809'}<br />
                    <strong>Email:</strong> ${apiInvoiceData.supplierDetails?.email || 'booking@rasutrip.com'}<br />
                    <strong>PAN Number:</strong> ${apiInvoiceData.supplierDetails?.pan || 'ABLFR7635L'}<br />
                    <strong>State:</strong> ${apiInvoiceData.supplierDetails?.state || 'Uttar Pradesh'}
                </td>
                <td style="text-align: right;">
                    <strong>Guest Name:</strong> ${apiInvoiceData.receiverDetails?.name || 'Guest'}<br />
                    <strong>Phone:</strong> ${apiInvoiceData.receiverDetails?.phone || 'N/A'}<br />
                    <strong>Email:</strong> ${apiInvoiceData.receiverDetails?.email || leadPassenger?.Email || 'N/A'}
                </td>
                </tr>
            </table>

            <table style="width: 100%; font-size: 14px; margin-bottom: 20px;" border="1" cellpadding="8" cellspacing="0">
                <tr>
                <td><strong>Invoice Number:</strong> ${apiInvoiceData.invoiceNumber || apiInvoiceData.invoiceId || 'N/A'}</td>
                <td><strong>Invoice Date:</strong> ${formatDate(apiInvoiceData.invoiceDate)}</td>
                </tr>
                <tr>
                <td><strong>Booking ID:</strong> ${apiInvoiceData.bookingId || 'N/A'}</td>
                <td><strong>Booking Status:</strong> Confirmed</td>
                </tr>
                <tr>
                <td><strong>Check-In:</strong> ${formatDate(apiInvoiceData.checkInDate)}</td>
                <td><strong>Check-Out:</strong> ${formatDate(apiInvoiceData.checkOutDate)}</td>
                </tr>
                <tr>
                <td><strong>No. of Nights:</strong> ${nights}</td>
                <td><strong>No. of Rooms:</strong> ${apiInvoiceData.noOfRooms || 1}</td>
                </tr>
            </table>

            <h3>HOTEL DETAILS</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;" border="1" cellpadding="8" cellspacing="0">
                <tr>
                <td><strong>Hotel Name</strong></td>
                <td>${apiInvoiceData.hotelName || hotelDetails?.name || 'Hotel Name'}</td>
                </tr>
                <tr>
                <td><strong>Destination</strong></td>
                <td>${apiInvoiceData.destination || 'N/A'}</td>
                </tr>
                <tr>
                <td><strong>Address</strong></td>
                <td>${apiInvoiceData.address || 'Hotel Address'}</td>
                </tr>
                <tr>
                <td><strong>Star Rating</strong></td>
                <td>${apiInvoiceData.starRating || 3} Star</td>
                </tr>
            </table>

            <h3>GUEST DETAILS</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;" border="1" cellpadding="8" cellspacing="0">
                <tr>
                <th>#</th>
                <th>Guest Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Age</th>
                </tr>
                <tr>
                <td>1</td>
                <td>${apiInvoiceData.guest?.name || apiInvoiceData.receiverDetails?.name || 'Guest'}</td>
                <td>${apiInvoiceData.guest?.phone || apiInvoiceData.receiverDetails?.phone || 'N/A'}</td>
                <td>${apiInvoiceData.guest?.email || leadPassenger?.Email || 'N/A'}</td>
                <td>${apiInvoiceData.guest?.age || 'N/A'}</td>
                </tr>
            </table>

            <h3>PAYMENT DETAILS</h3>
            <table style="width: 100%; font-size: 14px; margin-bottom: 20px;" cellpadding="8" cellspacing="0">
                <tr><td><strong>Base Fare (${nights} night${nights > 1 ? 's' : ''}):</strong></td><td>₹ ${(apiInvoiceData.fareDetails?.baseFare || 0).toLocaleString()}</td></tr>
                <tr><td><strong>Taxes & Fees:</strong></td><td>₹ ${(apiInvoiceData.fareDetails?.taxes || 0).toLocaleString()}</td></tr>
                <tr><td><strong>Service Charges:</strong></td><td>₹ ${(apiInvoiceData.fareDetails?.serviceCharges || 0).toLocaleString()}</td></tr>
                ${(apiInvoiceData.fareDetails?.CGSTAmount || 0) > 0 ? `<tr><td><strong>CGST:</strong></td><td>₹ ${apiInvoiceData.fareDetails.CGSTAmount.toLocaleString()}</td></tr>` : ''}
                ${(apiInvoiceData.fareDetails?.SGSTAmount || 0) > 0 ? `<tr><td><strong>SGST:</strong></td><td>₹ ${apiInvoiceData.fareDetails.SGSTAmount.toLocaleString()}</td></tr>` : ''}
                ${(apiInvoiceData.fareDetails?.IGSTAmount || 0) > 0 ? `<tr><td><strong>IGST (${apiInvoiceData.fareDetails?.IGSTRate || 18}%):</strong></td><td>₹ ${apiInvoiceData.fareDetails.IGSTAmount.toLocaleString()}</td></tr>` : ''}
                ${(apiInvoiceData.fareDetails?.couponDiscount || 0) > 0 ? `<tr><td><strong>Coupon Discount (-):</strong></td><td>₹ ${apiInvoiceData.fareDetails.couponDiscount.toLocaleString()}</td></tr>` : ''}
                <tr>
                <td><strong>Total Payable:</strong></td>
                <td><strong>₹ ${(apiInvoiceData.totalPayable || apiInvoiceData.invoiceTotal || amount || 0).toLocaleString()}</strong></td>
                </tr>
            </table>

            <h3>CHECK-IN & CHECK-OUT DETAILS</h3>
            <table style="width: 100%; font-size: 14px; margin-bottom: 20px;" cellpadding="8" cellspacing="0">
                <tr>
                <td style="vertical-align: top; width: 50%;">
                    <strong>Check-In:</strong><br>
                    Date: ${formatDate(apiInvoiceData.checkInDate)}<br>
                    Time: 2:00 PM onwards<br>
                    Hotel: ${apiInvoiceData.hotelName || 'Hotel'}<br>
                    Address: ${apiInvoiceData.address || 'Hotel Address'}
                </td>
                <td style="vertical-align: top; width: 50%;">
                    <strong>Check-Out:</strong><br>
                    Date: ${formatDate(apiInvoiceData.checkOutDate)}<br>
                    Time: 11:00 AM<br>
                    Total Stay: ${nights} night${nights > 1 ? 's' : ''}
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
                <li>Number of nights: ${nights} (${formatDate(apiInvoiceData.checkInDate)} to ${formatDate(apiInvoiceData.checkOutDate)})</li>
                <li>For any queries, contact our support team at ${apiInvoiceData.supplierDetails?.email || 'booking@rasutrip.com'}</li>
            </ul>
            
            ${apiInvoiceData.isFallback ? `
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin-top: 20px; border-radius: 5px;">
                <small style="color: #856404;">
                    <strong>Note:</strong> This invoice was generated with available booking data. 
                    For detailed invoice, please contact support with Booking ID: ${apiInvoiceData.bookingId}
                </small>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
                <small style="color: #7f8c8d;">Thank you for choosing RasuTrip! Have a pleasant stay!</small>
            </div>
            </div>
        `;
    };

    // Download Invoice Function
    const handleDownloadInvoice = async () => {
        try {
            // Fetch invoice data if not already available
            if (!invoiceData && !loadingInvoice) {
                await fetchInvoiceData();
                return; // The data will be set, function will be called again by user
            }

            if (!invoiceData) {
                toast.error('Invoice data not available. Please try again.', {
                    position: "top-right",
                    autoClose: 3000
                });
                return;
            }

            const htmlContent = generateInvoiceHTMLFromAPI(invoiceData);
            const bookingId = confirmationDetails?.bookingId || actualBooking?.BookingID || actualBooking?.bookingId || 'HTL';

            // Create a new window/tab for printing
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Hotel Invoice - ${invoiceData.invoiceNumber || invoiceData.invoiceId || bookingId}</title>
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

    // Auto-fetch invoice data on component mount
    useEffect(() => {
        if (isBooked && confirmationDetails?.bookingId && !invoiceData && !loadingInvoice) {
            fetchInvoiceData();
        }
    }, [isBooked, confirmationDetails?.bookingId]);

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
        <div className="bg-light min-vh-100">
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

                                        {/* Show coupon savings if applicable */}
                                        {couponDiscount > 0 && (
                                            <div className="mb-4">
                                                <div className="p-3 bg-success-subtle rounded border border-success">
                                                    <small className="text-success d-block mb-1">Coupon Savings</small>
                                                    <h6 className="mb-0 text-success fw-bold">₹{couponDiscount?.toLocaleString()} Saved!</h6>
                                                    {couponData && (
                                                        <small className="text-muted">Code: {couponData.code || couponData.couponCode}</small>
                                                    )}
                                                </div>
                                            </div>
                                        )}

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

                        {/* Invoice Status */}
                        {loadingInvoice && (
                            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
                                <Card.Body className="p-4 text-center">
                                    <Spinner animation="border" variant="primary" className="me-2" />
                                    <span>Loading invoice data...</span>
                                </Card.Body>
                            </Card>
                        )}

                        {invoiceError && !invoiceData && (
                            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
                                <Card.Body className="p-4">
                                    <Alert variant="warning" className="mb-0">
                                        <strong>Invoice Note:</strong> {invoiceError}. 
                                        A basic invoice will be generated with available booking data.
                                    </Alert>
                                </Card.Body>
                            </Card>
                        )}

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
                                            disabled={loadingInvoice}
                                            style={{
                                                fontSize: '1.1rem',
                                                borderRadius: '10px',
                                                minWidth: '200px'
                                            }}
                                        >
                                            {loadingInvoice ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Loading Invoice...
                                                </>
                                            ) : (
                                                <>
                                                    <FaDownload className="me-2" />
                                                    Download Invoice
                                                </>
                                            )}
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

                                    {/* Show invoice data status */}
                                    {invoiceData && (
                                        <div className="mt-4">
                                            <Alert variant="success" className="border-0" style={{
                                                backgroundColor: '#d4edda',
                                                borderRadius: '10px'
                                            }}>
                                                <div className="d-flex align-items-center justify-content-center">
                                                    <FaCheckCircle className="me-2 text-success" />
                                                    <span className="text-success fw-semibold">
                                                        Invoice data loaded successfully
                                                        {invoiceData.invoiceNumber && ` (${invoiceData.invoiceNumber})`}
                                                    </span>
                                                </div>
                                            </Alert>
                                        </div>
                                    )}
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
                                                    Your hotel booking has been confirmed successfully. 
                                                    {invoiceData ? 
                                                        " Your detailed invoice is ready for download." : 
                                                        " An invoice will be generated with your booking details."
                                                    }
                                                    Please keep your booking ID for future reference.
                                                </p>
                                                <small className="text-muted">
                                                    For any assistance, please contact our support team with this booking ID.
                                                </small>
                                                
                                                {/* Show API data source info */}
                                                {invoiceData && !invoiceData.isFallback && (
                                                    <div className="mt-3 p-2 bg-info-subtle rounded">
                                                        <small className="text-info fw-bold">
                                                            Invoice Details: Invoice #{invoiceData.invoiceNumber || invoiceData.invoiceId} 
                                                            generated on {new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN')}
                                                        </small>
                                                    </div>
                                                )}

                                                {/* Debug info in development */}
                                                {process.env.NODE_ENV === 'development' && invoiceData && (
                                                    <div className="mt-3 p-2 bg-light rounded">
                                                        <small className="text-dark">
                                                            <strong>Debug Invoice Info:</strong><br />
                                                            Source: {invoiceData.isFallback ? 'Fallback Data' : 'API Response'}<br />
                                                            BookingID: {invoiceData.bookingId}<br />
                                                            InvoiceID: {invoiceData.invoiceId || invoiceData.invoiceNumber}<br />
                                                            Total: ₹{invoiceData.totalPayable || invoiceData.invoiceTotal}
                                                        </small>
                                                    </div>
                                                )}
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