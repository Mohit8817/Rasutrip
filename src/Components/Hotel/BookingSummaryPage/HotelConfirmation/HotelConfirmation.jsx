// src/components/Hotel/HotelConfirmation.js - ENHANCED VERSION WITH PDF GENERATION

import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaDownload, FaCheckCircle, FaHome, FaEnvelope, FaPhone, FaUser, FaCalendarAlt, FaHotel, FaCreditCard, FaFileInvoiceDollar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import { sendHotelInvoice } from '../../../APIS/HotelApi/HotelAPi';

const HotelConfirmation = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);

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

    // Generate PDF Invoice using jsPDF
    const generatePDFInvoice = () => {
        const bookingId = confirmationDetails?.bookingId || actualBooking?.BookingID || actualBooking?.bookingId || 'N/A';
        const hotelName = hotelDetails?.name || actualBooking?.HotelName || 'Hotel';
        const bookingTime = confirmationDetails?.bookingTime ? new Date(confirmationDetails.bookingTime).toLocaleDateString() : new Date().toLocaleDateString();
        const guestName = `${leadPassenger.Title || ''} ${leadPassenger.FirstName || ''} ${leadPassenger.LastName || ''}`.trim() || 'Guest';

        // Create new PDF document
        const doc = new jsPDF();
        
        // Set font
        doc.setFont("helvetica");
        
        // Header - Company Logo/Name (you can add logo later)
        doc.setFontSize(24);
        doc.setTextColor(40, 44, 52);
        doc.text('HOTEL BOOKING INVOICE', 105, 30, { align: 'center' });
        
        // Add a line under header
        doc.setDrawColor(0, 0, 0);
        doc.line(20, 35, 190, 35);
        
        // Invoice details section
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        // Left side - Invoice Info
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('INVOICE DETAILS', 20, 55);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 20, 65);
        doc.text(`Booking ID: ${bookingId}`, 20, 72);
        doc.text(`Booking Date: ${bookingTime}`, 20, 79);
        
        // Right side - Hotel Info
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('HOTEL INFORMATION', 120, 55);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Hotel Name: ${hotelName}`, 120, 65);
        doc.text('Location: India', 120, 72);
        
        // Guest Information Section
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('GUEST INFORMATION', 20, 100);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Guest Name: ${guestName}`, 20, 110);
        if (leadPassenger.Email) {
            doc.text(`Email: ${leadPassenger.Email}`, 20, 117);
        }
        if (leadPassenger.Phoneno) {
            doc.text(`Phone: ${leadPassenger.Phoneno}`, 20, 124);
        }
        if (leadPassenger.Age) {
            doc.text(`Age: ${leadPassenger.Age} years`, 20, 131);
        }
        
        // Payment Details Section
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('PAYMENT DETAILS', 20, 150);
        
        // Create a table-like structure for payment details
        doc.setDrawColor(200, 200, 200);
        doc.rect(20, 160, 170, 40); // Main rectangle
        
        // Table headers
        doc.setFillColor(240, 240, 240);
        doc.rect(20, 160, 170, 10, 'F');
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text('Description', 25, 167);
        doc.text('Amount', 150, 167);
        
        // Table content
        doc.setFont("helvetica", "normal");
        doc.text('Hotel Booking Charges', 25, 177);
        doc.text(`₹${amount?.toLocaleString() || '0'}`, 150, 177);
        
        if (paymentDetails?.paymentId) {
            doc.text(`Payment ID: ${paymentDetails.paymentId}`, 25, 187);
        }
        
        // Total amount - highlighted
        doc.setFillColor(52, 168, 83);
        doc.rect(20, 190, 170, 10, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text('TOTAL AMOUNT PAID:', 25, 197);
        doc.text(`₹${amount?.toLocaleString() || '0'}`, 150, 197);
        
        // Reset text color
        doc.setTextColor(0, 0, 0);
        
        // Terms and Conditions
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text('TERMS & CONDITIONS', 20, 220);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text('• This invoice is computer generated and does not require signature.', 20, 230);
        doc.text('• Please carry this invoice and a valid ID for hotel check-in.', 20, 237);
        doc.text('• For any queries, please contact our support team with your booking ID.', 20, 244);
        doc.text('• Cancellation and modification policies apply as per booking terms.', 20, 251);
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Thank you for choosing our service! Have a pleasant stay.', 105, 270, { align: 'center' });
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 280, { align: 'center' });
        
        return doc;
    };

    // Enhanced invoice download with PDF generation
    const handleDownloadInvoice = async () => {
        setDownloadingInvoice(true);

        try {
            const bookingId = confirmationDetails?.bookingId || actualBooking?.BookingID || actualBooking?.bookingId;
            
            if (!bookingId) {
                throw new Error('Booking ID not found');
            }

            // Generate PDF using jsPDF
            const doc = generatePDFInvoice();
            
            // Save the PDF with a meaningful filename
            const fileName = `Hotel-Invoice-${bookingId}-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            toast.success('📄 Invoice downloaded successfully!', {
                position: "top-right",
                autoClose: 5000
            });

            // Optional: Also send to email (keep the original API call)
            try {
                const searchTokenId = confirmationDetails?.searchTokenId || actualBooking?.SearchTokenId;
                const userIp = confirmationDetails?.userIp || actualBooking?.UserIp || "49.36.217.215";
                const receiverEmail = leadPassenger?.Email || "guest@example.com";

                const invoicePayload = {
                    UserIp: userIp,
                    BookingId: parseInt(bookingId),
                    SearchTokenId: searchTokenId,
                    receiverEmail: receiverEmail
                };

                await sendHotelInvoice(invoicePayload);
                
                toast.info('📧 Invoice also sent to your email!', {
                    position: "top-right",
                    autoClose: 3000
                });
            } catch (emailError) {
                console.log('Email sending failed, but PDF downloaded successfully:', emailError);
            }

        } catch (error) {
            console.error('❌ Invoice generation error:', error);
            toast.error(`❌ ${error.message || 'Failed to generate invoice. Please try again.'}`, {
                position: "top-right",
                autoClose: 7000
            });
        } finally {
            setDownloadingInvoice(false);
        }
    };

    const bookingId = confirmationDetails?.bookingId || actualBooking?.BookingID || actualBooking?.bookingId || 'N/A';
    const hotelName = hotelDetails?.name || actualBooking?.HotelName || 'Hotel';
    const bookingTime = confirmationDetails?.bookingTime ? new Date(confirmationDetails.bookingTime).toLocaleString() : new Date().toLocaleString();

    return (
        <div className="bg-light min-vh-100" >
            <Container className="py-4">
                <div className="d-flex justify-content-center">
                    <div style={{ maxWidth: '1200px', width: '100%' }}>

                        {/* Success Header Card - Simple Design */}
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
                            {/* Booking Details - Enhanced */}
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

                            {/* Guest Information - Enhanced */}
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

                        {/* Action Buttons - Enhanced */}
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                            <Card.Body className="p-5">
                                <div className="text-center mb-4">
                                    <h5 className="mb-4 text-dark fw-bold">What would you like to do next?</h5>

                                    <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
                                        <Button
                                            variant="danger"
                                            size="lg"
                                            className="px-5 py-3 fw-bold"
                                            onClick={handleDownloadInvoice}
                                            disabled={downloadingInvoice}
                                            style={{
                                                fontSize: '1.1rem',
                                                borderRadius: '10px',
                                                minWidth: '220px'
                                            }}
                                        >
                                            {downloadingInvoice ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="me-2"
                                                    />
                                                    Generating PDF...
                                                </>
                                            ) : (
                                                <>
                                                    <FaDownload className="me-2" />
                                                    Download PDF Invoice
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
                                    <Alert variant="info" className="border-0 mb-0" style={{
                                        backgroundColor: '#e8f4fd',
                                        borderRadius: '10px'
                                    }}>
                                        <div className="d-flex align-items-start">
                                            <div className="flex-grow-1">
                                                <Alert.Heading as="h6" className="text-info mb-2 fw-bold">
                                                    📄 PDF Invoice Generation
                                                </Alert.Heading>
                                                <p className="mb-2 text-dark">
                                                    Click "Download PDF Invoice" to generate and save a professional PDF invoice to your device. 
                                                    Your booking ID{' '}
                                                    <Badge bg="info" className="mx-1 px-3 py-1">
                                                        {bookingId}
                                                    </Badge>
                                                    {' '}will be included in the PDF.
                                                </p>
                                                <small className="text-muted">
                                                    📧 The invoice will also be sent to your email address automatically.
                                                    For any assistance, please contact our 24/7 support team.
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