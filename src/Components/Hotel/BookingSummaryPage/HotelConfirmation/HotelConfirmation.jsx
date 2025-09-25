import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import baseURL from '../../../../Services/Config';

const HotelConfirmation = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);
    const [downloadingTicket, setDownloadingTicket] = useState(false);

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

    // Helper function to get auth token
    const getAuthToken = () => {
        return localStorage.getItem('token') ||
            localStorage.getItem('authToken') ||
            sessionStorage.getItem('authToken') ||
            localStorage.getItem('userToken') ||
            sessionStorage.getItem('token');
    };

    // Create auth headers
    const createAuthHeaders = () => {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Authentication token is missing. Please login again.');
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf',
        };
    };

    // Show success toast on mount
    useEffect(() => {
        if ((isBooked && actualBooking) || confirmationDetails?.message) {
            toast.success('Hotel booking confirmed successfully!', {
                position: "top-right",
                autoClose: 5000
            });
        }
    }, [isBooked, actualBooking, confirmationDetails]);

    // Download Invoice from API with Authentication
    const downloadInvoicePDF = async () => {
        const bookingId = confirmationDetails?.bookingId || actualBooking?.BookingID || actualBooking?.bookingId;
        
        if (!bookingId) {
            toast.error('Booking ID not found. Cannot download invoice.', {
                position: "top-right",
                autoClose: 3000
            });
            return;
        }

        setDownloadingInvoice(true);
        
        try {
            // Create auth headers
            const headers = createAuthHeaders();
            
            // Construct the API URL
            const apiUrl = `${baseURL}/airservice/download/invoice/hotel/${bookingId}`;
            console.log('Invoice API URL:', apiUrl);
            console.log('Booking ID:', bookingId);
            console.log('Auth Headers:', { 'Authorization': headers.Authorization ? 'Bearer [TOKEN_PRESENT]' : 'Missing' });

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: headers,
            });

            console.log('Invoice API Response Status:', response.status);
            console.log('Invoice API Response Headers:', response.headers);

            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please login again.');
                }
                
                const errorText = await response.text();
                console.error('Invoice API Error Response:', errorText);
                throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`);
            }

            // Check if response is actually a PDF
            const contentType = response.headers.get('content-type');
            console.log('Invoice Response Content Type:', contentType);
            
            if (!contentType || !contentType.includes('application/pdf')) {
                throw new Error('Response is not a PDF file');
            }

            // Get the blob from response
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Hotel_Invoice_${bookingId}_${new Date().getTime()}.pdf`;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Invoice downloaded successfully!', {
                position: "top-right",
                autoClose: 3000
            });

        } catch (error) {
            console.error('Error downloading invoice:', error);
            
            if (error.message.includes('Authentication failed')) {
                toast.error('Please login again to download invoice.', {
                    position: "top-right",
                    autoClose: 5000
                });
            } else {
                toast.error(`Error downloading invoice: ${error.message}`, {
                    position: "top-right",
                    autoClose: 5000
                });
            }
        } finally {
            setDownloadingInvoice(false);
        }
    };

    // Download E-Ticket from API with Authentication
    const downloadETicketPDF = async () => {
        const bookingId = confirmationDetails?.bookingId || actualBooking?.BookingID || actualBooking?.bookingId;
        
        if (!bookingId) {
            toast.error('Booking ID not found. Cannot download e-ticket.', {
                position: "top-right",
                autoClose: 3000
            });
            return;
        }

        setDownloadingTicket(true);
        
        try {
            // Create auth headers
            const headers = createAuthHeaders();
            
            // Construct the API URL
            const apiUrl = `${baseURL}/airservice/download/e-ticket/hotel/${bookingId}`;
            console.log('E-Ticket API URL:', apiUrl);
            console.log('Booking ID:', bookingId);
            console.log('Auth Headers:', { 'Authorization': headers.Authorization ? 'Bearer [TOKEN_PRESENT]' : 'Missing' });

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: headers,
            });

            console.log('E-Ticket API Response Status:', response.status);
            console.log('E-Ticket API Response Headers:', response.headers);

            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please login again.');
                }
                
                const errorText = await response.text();
                console.error('E-Ticket API Error Response:', errorText);
                throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`);
            }

            // Check if response is actually a PDF
            const contentType = response.headers.get('content-type');
            console.log('E-Ticket Response Content Type:', contentType);
            
            if (!contentType || !contentType.includes('application/pdf')) {
                throw new Error('Response is not a PDF file');
            }

            // Get the blob from response
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Hotel_ETicket_${bookingId}_${new Date().getTime()}.pdf`;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('E-Ticket downloaded successfully!', {
                position: "top-right",
                autoClose: 3000
            });

        } catch (error) {
            console.error('Error downloading e-ticket:', error);
            
            if (error.message.includes('Authentication failed')) {
                toast.error('Please login again to download e-ticket.', {
                    position: "top-right",
                    autoClose: 5000
                });
            } else {
                toast.error(`Error downloading e-ticket: ${error.message}`, {
                    position: "top-right",
                    autoClose: 5000
                });
            }
        } finally {
            setDownloadingTicket(false);
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
                                            onClick={downloadInvoicePDF}
                                            disabled={downloadingInvoice}
                                            style={{
                                                fontSize: '1.1rem',
                                                borderRadius: '10px',
                                                minWidth: '200px'
                                            }}
                                        >
                                            {downloadingInvoice ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Downloading...
                                                </>
                                            ) : (
                                                <>
                                                    <FaDownload className="me-2" />
                                                    Download Invoice
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            variant="warning"
                                            size="lg"
                                            className="px-5 py-3 fw-semibold"
                                            onClick={downloadETicketPDF}
                                            disabled={downloadingTicket}
                                            style={{
                                                fontSize: '1.1rem',
                                                borderRadius: '10px',
                                                minWidth: '200px'
                                            }}
                                        >
                                            {downloadingTicket ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Downloading...
                                                </>
                                            ) : (
                                                <>
                                                    <FaDownload className="me-2" />
                                                    Download E-Ticket
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
                                </div>

                                <div className="border-top pt-4">
                                    <Alert variant="success" className="border-0 mb-3" style={{
                                        backgroundColor: '#d4edda',
                                        borderRadius: '10px'
                                    }}>
                                        <div className="d-flex align-items-start">
                                            <div className="flex-grow-1">
                                                <Alert.Heading as="h6" className="text-success mb-2 fw-bold">
                                                    <FaCheckCircle className="me-2" />
                                                    Booking Completed Successfully
                                                </Alert.Heading>
                                                <p className="mb-2 text-dark">
                                                    Your hotel booking has been confirmed successfully. 
                                                    You can download your invoice and e-ticket using the buttons above.
                                                    Please keep your booking ID for future reference.
                                                </p>
                                                <small className="text-muted">
                                                    For any assistance, please contact our support team with this booking ID: <strong>{bookingId}</strong>
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