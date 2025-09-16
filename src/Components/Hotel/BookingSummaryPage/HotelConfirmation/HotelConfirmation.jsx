// src/components/Hotel/HotelConfirmation.js - UPDATED VERSION WITH FLIGHT-STYLE HTML INVOICE

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

    // Generate HTML Invoice following flight template structure
    const generateHTMLInvoice = () => {
        const bookingId = confirmationDetails?.bookingId || actualBooking?.BookingID || actualBooking?.bookingId || 'N/A';
        const hotelName = hotelDetails?.name || actualBooking?.HotelName || 'Hotel Booking';
        const bookingTime = confirmationDetails?.bookingTime ? new Date(confirmationDetails.bookingTime).toLocaleDateString() : new Date().toLocaleDateString();
        const guestName = `${leadPassenger.Title || ''} ${leadPassenger.FirstName || ''} ${leadPassenger.LastName || ''}`.trim() || 'Guest';

        // Guest rows for the table
        let guestRows = '';
        if (leadPassenger && Object.keys(leadPassenger).length > 0) {
            guestRows = `
                <tr>
                    <td>1</td>
                    <td>${guestName}</td>
                    <td>${leadPassenger.Phoneno || 'N/A'}</td>
                    <td>${leadPassenger.Email || 'N/A'}</td>
                    <td>${leadPassenger.Age || 'N/A'}</td>
                </tr>
            `;
        } else {
            guestRows = `
                <tr>
                    <td>1</td>
                    <td>${guestName}</td>
                    <td>N/A</td>
                    <td>N/A</td>
                    <td>N/A</td>
                </tr>
            `;
        }

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ccc; padding: 20px;">
                <h2 style="text-align: center;">Tax Invoice (Hotel Booking)</h2>
                
                <table style="width: 100%; margin-bottom: 20px; font-size: 14px;">
                    <tr>
                        <td>
                            <strong>From :</strong> RasuTrip Travel Services<br />
                            <strong>Mobile :</strong> +91-9876543210<br />
                            <strong>Email :</strong> support@rasutrip.com<br />
                            <strong>PAN Number :</strong> ABCDE1234F<br />
                            <strong>State :</strong> Delhi, India<br />
                            <strong>Company Registered No. :</strong> 123456789
                        </td>
                        <td style="text-align: right;">
                            <strong>Guest Name :</strong> ${guestName}<br />
                            <strong>Phone :</strong> ${leadPassenger.Phoneno || 'N/A'}<br />
                            <strong>Email :</strong> ${leadPassenger.Email || 'N/A'}
                        </td>
                    </tr>
                </table>

                <table style="width: 100%; font-size: 14px; margin-bottom: 20px;" border="1" cellpadding="8" cellspacing="0">
                    <tr>
                        <td><strong>Invoice Number :</strong> INV-${bookingId}</td>
                        <td><strong>Invoice Date :</strong> ${new Date().toLocaleDateString()}</td>
                    </tr>
                    <tr>
                        <td><strong>Booking Reference number :</strong> ${bookingId}</td>
                        <td><strong>Booking Date :</strong> ${bookingTime}</td>
                    </tr>
                    <tr>
                        <td><strong>Hotel Name :</strong> ${hotelName}</td>
                        <td><strong>Destination :</strong> India</td>
                    </tr>
                </table>

                <h3>GUEST DETAILS</h3>
                <table style="width: 100%; font-size: 14px; border-collapse: collapse;" border="1" cellpadding="8" cellspacing="0">
                    <tr>
                        <th>#</th>
                        <th>Guest Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Age</th>
                    </tr>
                    ${guestRows}
                </table>

                <h3 style="margin-top: 30px;">PAYMENT DETAILS</h3>
                <p style="font-size: 14px; margin-bottom: 10px;"><strong>Please carry this invoice for hotel check-in.</strong><br>Present valid ID proof during check-in.</p>
                <table style="width: 100%; font-size: 14px; border-collapse: collapse;" cellpadding="8" cellspacing="0">
                    <tr>
                        <td><strong>Hotel Booking Charges:</strong></td><td>₹ ${amount?.toLocaleString() || '0'}</td>
                    </tr>
                    <tr>
                        <td><strong>Service Charges:</strong></td><td>₹ 0</td>
                    </tr>
                    <tr>
                        <td><strong>Platform Fee:</strong></td><td>₹ 0</td>
                    </tr>
                    <tr>
                        <td><strong>Coupon Discount (-):</strong></td><td>₹ 0</td>
                    </tr>
                    <tr>
                        <td><strong>GST (+):</strong></td><td>₹ 0</td>
                    </tr>
                    <tr>
                        <td><strong>Total Amount:</strong></td><td><strong>₹ ${amount?.toLocaleString() || '0'}</strong></td>
                    </tr>
                </table>

                <h3 style="margin-top: 30px;">TERMS & CONDITIONS</h3>
                <ul style="font-size: 14px; padding-left: 20px;">
                    <li>IMP : This is computer generated invoice signature not required</li>
                    <li>IMP : All Cases & Disputes are subject to New Delhi Jurisdiction</li>
                    <li>IMP : Guests must present valid ID proof (Passport/Voter ID/Aadhar)</li>
                    <li>IMP : Hotel rules and cancellation policies apply</li>
                    <li>IMP : Please carry this invoice for hotel check-in</li>
                    <li>IMP : For queries, contact our support team with your booking ID</li>
                </ul>

                <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
                    <p>Thank you for choosing RasuTrip! Have a pleasant stay.</p>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                </div>
            </div>
        `;

        return htmlContent;
    };

    // Convert HTML to PDF using jsPDF
    const generatePDFFromHTML = (htmlContent) => {
        const doc = new jsPDF();
        
        // Create a temporary div to render HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        tempDiv.style.width = '700px';
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        document.body.appendChild(tempDiv);

        // Use html2canvas approach or manual PDF creation
        // For now, let's use the existing manual approach but with flight structure
        
        const bookingId = confirmationDetails?.bookingId || actualBooking?.BookingID || actualBooking?.bookingId || 'N/A';
        const hotelName = hotelDetails?.name || actualBooking?.HotelName || 'Hotel Booking';
        const bookingTime = confirmationDetails?.bookingTime ? new Date(confirmationDetails.bookingTime).toLocaleDateString() : new Date().toLocaleDateString();
        const guestName = `${leadPassenger.Title || ''} ${leadPassenger.FirstName || ''} ${leadPassenger.LastName || ''}`.trim() || 'Guest';

        // Set font
        doc.setFont("helvetica");

        // Header - Tax Invoice
        doc.setFontSize(20);
        doc.setTextColor(40, 44, 52);
        doc.text('TAX INVOICE (HOTEL BOOKING)', 105, 20, { align: 'center' });

        // Add line under header
        doc.setDrawColor(0, 0, 0);
        doc.line(20, 25, 190, 25);

        // Company Details (Left) and Customer Details (Right) - Following flight format
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text('From :', 20, 35);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text('RasuTrip Travel Services', 20, 42);
        doc.text('Mobile: +91-9876543210', 20, 48);
        doc.text('Email: support@rasutrip.com', 20, 54);
        doc.text('PAN Number: ABCDE1234F', 20, 60);
        doc.text('State: Delhi, India', 20, 66);
        doc.text('Company Registered No.: 123456789', 20, 72);

        // Customer details (Right side) - Following flight format
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('Guest Name :', 120, 35);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`${guestName}`, 120, 42);
        if (leadPassenger.Phoneno) {
            doc.text(`Phone: ${leadPassenger.Phoneno}`, 120, 48);
        }
        if (leadPassenger.Email) {
            doc.text(`Email: ${leadPassenger.Email}`, 120, 54);
        }

        // Invoice Details Table - Following flight format
        const startY = 85;
        doc.setDrawColor(0, 0, 0);
        doc.rect(20, startY, 170, 30);

        // Table rows
        doc.line(20, startY + 10, 190, startY + 10);
        doc.line(20, startY + 20, 190, startY + 20);
        doc.line(105, startY, 105, startY + 30);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);

        doc.text('Invoice Number:', 25, startY + 7);
        doc.text(`INV-${bookingId}`, 110, startY + 7);
        doc.text('Invoice Date:', 25, startY + 17);
        doc.text(new Date().toLocaleDateString(), 110, startY + 17);
        doc.text('Booking Reference number:', 25, startY + 27);
        doc.text(bookingId.toString(), 110, startY + 27);

        // Hotel Details Section
        const hotelDetailsY = startY + 45;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('HOTEL DETAILS', 20, hotelDetailsY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Hotel Name: ${hotelName}`, 20, hotelDetailsY + 10);
        doc.text('Destination: India', 20, hotelDetailsY + 17);
        doc.text(`Booking Date: ${bookingTime}`, 20, hotelDetailsY + 24);

        // Guest Details Section - Following flight passenger format
        const guestDetailsY = hotelDetailsY + 40;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('GUEST DETAILS', 20, guestDetailsY);

        const guestTableY = guestDetailsY + 10;
        doc.setDrawColor(0, 0, 0);
        doc.rect(20, guestTableY, 170, 20);

        // Table header
        doc.setFillColor(240, 240, 240);
        doc.rect(20, guestTableY, 170, 8, 'F');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text('#', 25, guestTableY + 5);
        doc.text('Guest Name', 35, guestTableY + 5);
        doc.text('Phone', 85, guestTableY + 5);
        doc.text('Email', 125, guestTableY + 5);
        doc.text('Age', 165, guestTableY + 5);

        // Table content
        doc.line(20, guestTableY + 8, 190, guestTableY + 8);
        doc.line(30, guestTableY, 30, guestTableY + 20);
        doc.line(80, guestTableY, 80, guestTableY + 20);
        doc.line(120, guestTableY, 120, guestTableY + 20);
        doc.line(160, guestTableY, 160, guestTableY + 20);

        doc.setFont("helvetica", "normal");
        doc.text('1', 25, guestTableY + 15);
        doc.text(guestName.length > 15 ? guestName.substring(0, 15) + '...' : guestName, 35, guestTableY + 15);
        doc.text(leadPassenger.Phoneno || 'N/A', 85, guestTableY + 15);
        doc.text(leadPassenger.Email ? (leadPassenger.Email.length > 12 ? leadPassenger.Email.substring(0, 12) + '...' : leadPassenger.Email) : 'N/A', 125, guestTableY + 15);
        doc.text((leadPassenger.Age || 'N/A').toString(), 165, guestTableY + 15);

        // Payment Details Section - Following flight format
        const paymentY = guestTableY + 35;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('PAYMENT DETAILS', 20, paymentY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text('Please carry this invoice for hotel check-in.', 20, paymentY + 10);
        doc.text('Present valid ID proof during check-in.', 20, paymentY + 16);

        const paymentTableY = paymentY + 25;
        const paymentItems = [
            ['Hotel Booking Charges:', `₹ ${amount?.toLocaleString() || '0'}`],
            ['Service Charges:', '₹ 0'],
            ['Platform Fee:', '₹ 0'],
            ['Coupon Discount (-):', '₹ 0'],
            ['GST (+):', '₹ 0'],
            ['Total Amount:', `₹ ${amount?.toLocaleString() || '0'}`]
        ];

        paymentItems.forEach((item, index) => {
            const y = paymentTableY + (index * 8);
            doc.setFont("helvetica", index === paymentItems.length - 1 ? "bold" : "normal");
            doc.text(item[0], 20, y);
            doc.text(item[1], 150, y);
        });

        // Terms and Conditions - Following flight format
        const termsY = paymentTableY + 55;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text('TERMS & CONDITIONS', 20, termsY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const terms = [
            'IMP : This is computer generated invoice signature not required',
            'IMP : All Cases & Disputes are subject to New Delhi Jurisdiction',
            'IMP : Guests must present valid ID proof (Passport/Voter ID/Aadhar)',
            'IMP : Hotel rules and cancellation policies apply',
            'IMP : Please carry this invoice for hotel check-in',
            'IMP : For queries, contact our support team with your booking ID'
        ];

        terms.forEach((term, index) => {
            doc.text(`• ${term}`, 20, termsY + 10 + (index * 6));
        });

        // Footer
        const footerY = termsY + 50;
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Thank you for choosing RasuTrip! Have a pleasant stay.', 105, footerY, { align: 'center' });
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, footerY + 6, { align: 'center' });

        // Clean up
        document.body.removeChild(tempDiv);
        
        return doc;
    };

    // Enhanced invoice download with HTML structure
    const handleDownloadInvoice = async () => {
        setDownloadingInvoice(true);

        try {
            const bookingId = confirmationDetails?.bookingId || actualBooking?.BookingID || actualBooking?.bookingId;

            if (!bookingId) {
                throw new Error('Booking ID not found');
            }

            // Generate HTML content
            const htmlContent = generateHTMLInvoice();
            
            // Convert to PDF
            const doc = generatePDFFromHTML(htmlContent);

            // Save the PDF with a meaningful filename
            const fileName = `Hotel-Invoice-${bookingId}-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            toast.success('📄 Invoice downloaded successfully!', {
                position: "top-right",
                autoClose: 5000
            });

            // Optional: Also send to email
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