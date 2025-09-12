// src/components/Bus/BusConfirmation.js - AUTO CLEAR VERSION

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert, Row, Col, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaDownload, FaRedo, FaBus, FaCalendarAlt, FaClock, FaUser, FaMapMarkerAlt, FaTicketAlt, FaEnvelope, FaHome } from 'react-icons/fa';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import { downloadBusInvoice } from '../../APIS/BusApi/BusApis';

const Bookingconfirm = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);
    const [invoiceStatus, setInvoiceStatus] = useState('pending');
    const [retryCount, setRetryCount] = useState(0);
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
            sessionStorage.setItem(BOOKING_DATA_KEY, JSON.stringify(dataWithTimestamp));
            sessionStorage.setItem(BOOKING_TIMESTAMP_KEY, Date.now().toString());
        } catch (error) {
            console.error('Error saving booking data:', error);
        }
    };

    // Get booking data from session storage
    const getBookingData = () => {
        try {
            const savedData = sessionStorage.getItem(BOOKING_DATA_KEY);
            const savedTimestamp = sessionStorage.getItem(BOOKING_TIMESTAMP_KEY);
            
            if (savedData && savedTimestamp) {
                const timestamp = parseInt(savedTimestamp);
                const now = Date.now();
                
                // Check if data is not expired (24 hours)
                if (now - timestamp < DATA_EXPIRY_TIME) {
                    return JSON.parse(savedData);
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

    // Clear booking data from session storage
    const clearBookingData = () => {
        try {
            sessionStorage.removeItem(BOOKING_DATA_KEY);
            sessionStorage.removeItem(BOOKING_TIMESTAMP_KEY);
        } catch (error) {
            console.error('Error clearing booking data:', error);
        }
    };

    // Initialize booking data on component mount
    useEffect(() => {
        // First check if we have fresh data from navigation state
        if (state && state.isBooked && state.bookingResult) {
            setBookingData(state);
            // Save to session storage for future access
            saveBookingData(state);
            
            // Show success toast
            toast.success('Bus booking confirmed successfully!', {
                position: "top-right",
                autoClose: 5000
            });
        } else {
            // Try to load from session storage
            const savedData = getBookingData();
            if (savedData) {
                setBookingData(savedData);
            }
        }
    }, [state]);

    // Get current booking data (either from state or session storage)
    const getCurrentBookingData = () => {
        return bookingData || {};
    };

    // Extract data from current booking data
    const currentData = getCurrentBookingData();
    const {
        bookingDetails = {},
        bookingResult = {},
        isBooked = false,
        invoiceData = null,
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

    // Get invoice payload
    const getInvoicePayload = () => {
        if (invoiceData && invoiceData.BookingId && invoiceData.SearchTokenId) {
            return invoiceData;
        }

        if (bookingId && searchTokenId) {
            return {
                UserIp: "122.161.64.143",
                SearchTokenId: searchTokenId,
                BookingId: String(bookingId),
                receiverEmail: contactData?.email ||
                    passengerData[0]?.email ||
                    "mohitverma8817@gmail.com"
            };
        }
        return null;
    };

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

    // Enhanced PDF Invoice generation matching the exact format from your sample
    const generateBusPDFInvoice = () => {
        const currentBookingId = bookingId || 'N/A';
        const operatorName = bus?.operator || bus?.travels || 'Bus Service';
        const passengerName = passengerData.length > 0 ? 
            `${passengerData[0].firstName || ''} ${passengerData[0].lastName || ''}`.trim() : 
            'Passenger';
        
        const seatNumbers = selectedSeats.map((seat, index) => extractSeatName(seat, index)).join(', ');
        const baseFare = totalPrice || finalAmount;
        const taxes = 0;
        const igstRate = '36%';
        const platformFee = 0;
        const serviceCharges = 0;
        const couponDiscount = 500;
        const totalPayable = baseFare - couponDiscount;

        // Create new PDF document
        const doc = new jsPDF();
        
        // Set font
        doc.setFont("helvetica");
        
        // Header Section - Title
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text('Tax Invoice (Bus Booking)', 105, 25, { align: 'center' });
        
        // Company Details - Left Column
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text('From : RASUTRIP WEBSOFT TECHNOLOGIES LLP', 20, 45);
        doc.text('Mobile : +91 9266424809', 20, 52);
        doc.text('Email : booking@rasutrip.com', 20, 59);
        doc.text('PAN Number : ABLFR7635L', 20, 66);
        doc.text('State : Uttar Pradesh', 20, 73);
        doc.text('Company Registered No. : ACP-7218', 20, 80);
        
        // Passenger Information - Right Column
        doc.text(`Passenger Name : ${passengerName}`, 110, 45);
        doc.text(`Phone : ${contactData?.mobile || 'N/A'}`, 110, 52);
        
        // Create table structure for invoice details
        const tableStartY = 95;
        
        // Draw table borders and fill
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        
        // Invoice details table
        const invoiceRows = [
            ['Invoice Number : ' + Math.floor(Math.random() * 99999).toString().padStart(5, '0'), 'Invoice Date : ' + new Date().toLocaleDateString('en-GB')],
            ['Booking ID : ' + currentBookingId, 'Ticket No : RASUTRIP' + Math.random().toString(36).substr(2, 4).toUpperCase()],
            ['From : ' + fromCity, 'To : ' + toCity],
            ['Departure : ' + (departDate ? new Date(departDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')) + ', ' + (selectedBoardingPoint?.Time || '5:00:00 PM'), 
             'Arrival : ' + (departDate ? new Date(new Date(departDate).getTime() + 8 * 60 * 60 * 1000).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')) + ', ' + (selectedDroppingPoint?.Time || '8:00:00 AM')],
            ['Bus Type : ' + (bus?.busType || 'Volvo Multiaxle A/C Sleeper/Semi Sleeper (2+1)'), '']
        ];
        
        let currentY = tableStartY;
        
        // Draw invoice details table
        invoiceRows.forEach((row, index) => {
            // Draw cell borders
            doc.rect(20, currentY, 85, 12);
            doc.rect(105, currentY, 85, 12);
            
            // Add text
            doc.setFontSize(9);
            doc.text(row[0], 22, currentY + 8);
            if (row[1]) {
                doc.text(row[1], 107, currentY + 8);
            }
            
            currentY += 12;
        });
        
        // Passenger Details Section
        currentY += 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('PASSENGER DETAILS', 20, currentY);
        
        currentY += 10;
        
        // Passenger details table header
        doc.setFillColor(240, 240, 240);
        doc.rect(20, currentY, 170, 12, 'F');
        doc.rect(20, currentY, 170, 12);
        
        // Header subdivisions
        const headerWidths = [25, 40, 40, 15, 20, 30];
        let headerX = 20;
        headerWidths.forEach((width, index) => {
            doc.line(headerX + width, currentY, headerX + width, currentY + 12);
            headerX += width;
        });
        
        // Header text
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text('Ticket No', 22, currentY + 8);
        doc.text('Route', 47, currentY + 8);
        doc.text('Passenger Name', 87, currentY + 8);
        doc.text('Age', 127, currentY + 8);
        doc.text('Seat No', 147, currentY + 8);
        doc.text('Fare (₹)', 167, currentY + 8);
        
        currentY += 12;
        
        // Passenger details rows
        doc.setFont("helvetica", "normal");
        passengerData.forEach((passenger, index) => {
            const seatName = extractSeatName(selectedSeats[index], index);
            const passengerFare = Math.floor(baseFare / passengerData.length);
            const ticketNo = 'RASUTRIP' + Math.random().toString(36).substr(2, 4).toUpperCase();
            
            // Draw row border
            doc.rect(20, currentY, 170, 12);
            
            // Draw column separators
            let cellX = 20;
            headerWidths.forEach((width, cellIndex) => {
                if (cellIndex < headerWidths.length - 1) {
                    doc.line(cellX + width, currentY, cellX + width, currentY + 12);
                }
                cellX += width;
            });
            
            // Add passenger data
            doc.text(ticketNo, 22, currentY + 8);
            doc.text(`${fromCity} - ${toCity}`, 27, currentY + 8);
            doc.text(`${passenger.firstName} ${passenger.lastName}`, 67, currentY + 8);
            doc.text(passenger.age.toString(), 127, currentY + 8);
            doc.text(seatName, 147, currentY + 8);
            doc.text(`₹ ${passengerFare}`, 167, currentY + 8);
            
            currentY += 12;
        });
        
        // Payment Details Section
        currentY += 15;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('PAYMENT DETAILS', 20, currentY);
        
        currentY += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        const paymentDetails = [
            ['No. of Seats:', selectedSeats.length.toString()],
            ['Base Fare:', `₹ ${baseFare}`],
            ['Taxes:', `₹ ${taxes}`],
            ['Platform Fee:', `₹ ${platformFee}`],
            ['Service Charges:', `₹ ${serviceCharges}`],
            ['Coupon Discount (-):', `₹ ${couponDiscount}`],
            ['IGST Rate:', igstRate],
            ['Total Payable:', `₹ ${totalPayable}`]
        ];
        
        paymentDetails.forEach((detail, index) => {
            if (index === paymentDetails.length - 1) {
                doc.setFont("helvetica", "bold");
            }
            doc.text(detail[0], 35, currentY);
            doc.text(detail[1], 120, currentY);
            currentY += 8;
        });
        
        // Boarding & Dropping Details Section
        currentY += 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('BOARDING & DROPPING DETAILS', 20, currentY);
        
        currentY += 15;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        // Boarding details
        doc.setFont("helvetica", "bold");
        doc.text('Boarding:', 35, currentY);
        currentY += 8;
        doc.setFont("helvetica", "normal");
        doc.text(selectedBoardingPoint?.BoardingPointName || 'Domlur, Domlur', 35, currentY);
        currentY += 6;
        doc.text(`Landmark: ${selectedBoardingPoint?.Address || 'Domlur'}`, 35, currentY);
        currentY += 6;
        doc.text(`Time: ${departDate ? new Date(departDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}, ${selectedBoardingPoint?.Time || '4:00:00 PM'}`, 35, currentY);
        currentY += 6;
        doc.text(`Contact: ${contactData?.mobile || '9090909090'}`, 35, currentY);
        
        // Dropping details - Right side
        const droppingY = currentY - 24;
        doc.setFont("helvetica", "bold");
        doc.text('Dropping:', 120, droppingY);
        doc.setFont("helvetica", "normal");
        doc.text(selectedDroppingPoint?.DroppingPointName || 'A S Rajnagar, A S Rajnagar', 120, droppingY + 8);
        doc.text(`Time: ${departDate ? new Date(new Date(departDate).getTime() + 8 * 60 * 60 * 1000).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}, ${selectedDroppingPoint?.Time || '8:00:00 AM'}`, 120, droppingY + 14);
        
        currentY += 20;
        
        // Terms & Conditions Section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('TERMS & CONDITIONS', 20, currentY);
        
        currentY += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        
        const terms = [
            '• This is a computer-generated invoice; no signature required.',
            '• All disputes are subject to jurisdiction of New Delhi.',
            '• Please report at the boarding point at least 30 minutes before departure.',
            '• Ensure correct contact number for updates on schedule or cancellation.'
        ];
        
        terms.forEach(term => {
            doc.text(term, 25, currentY);
            currentY += 7;
        });
        
        return doc;
    };

    // Enhanced PDF download handler
    const handleDownloadPDFInvoice = async () => {
        setDownloadingInvoice(true);

        try {
            const currentBookingId = bookingId || 'booking';
            
            // Generate PDF using jsPDF with the enhanced format
            const doc = generateBusPDFInvoice();
            
            // Save the PDF with a meaningful filename
            const fileName = `Bus-Invoice-${currentBookingId}-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            toast.success('Bus invoice downloaded successfully!', {
                position: "top-right",
                autoClose: 5000
            });

            // Optional: Also send to email (keep the original API call)
            try {
                const payload = getInvoicePayload();
                if (payload) {
                    await downloadBusInvoice(payload);
                    toast.info('Invoice also sent to your email!', {
                        position: "top-right",
                        autoClose: 3000
                    });
                }
            } catch (emailError) {
                console.log('Email sending failed, but PDF downloaded successfully:', emailError);
            }

        } catch (error) {
            console.error('Invoice generation error:', error);
            toast.error(`Failed to generate invoice: ${error.message}`, {
                position: "top-right",
                autoClose: 7000
            });
        } finally {
            setDownloadingInvoice(false);
        }
    };

    // Navigate back to home and clear booking data automatically
    const handleBackToHome = () => {
        // Clear booking data from session storage
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
            // Try to load from session storage
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

                                    <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
                                        <Button
                                            variant="danger"
                                            size="lg"
                                            className="px-5 py-3 fw-bold"
                                            onClick={handleDownloadPDFInvoice}
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
                                                    Your booking has been confirmed successfully. Download your invoice now as the booking data 
                                                    will be automatically cleared when you return to the home page for security purposes.
                                                </p>
                                                <small className="text-muted">
                                                    For future reference, save your booking ID and download the PDF invoice before leaving this page.
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
                                                    PDF Invoice Download
                                                </Alert.Heading>
                                                <p className="mb-2 text-dark">
                                                    Click "Download PDF Invoice" to generate and save a professional PDF invoice matching your booking format. 
                                                    Your booking ID{' '}
                                                    <Badge bg="info" className="mx-1 px-3 py-1">
                                                        {bookingId}
                                                    </Badge>
                                                    {' '}will be included in the invoice.
                                                </p>
                                                <small className="text-muted">
                                                    The invoice will also be sent to your email address automatically.
                                                    For any assistance, please contact our support team.
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