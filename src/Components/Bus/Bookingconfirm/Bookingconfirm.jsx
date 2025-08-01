// src/components/Bus/BusConfirmation.js - Enhanced Version

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaDownload, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { downloadBusInvoice } from '../../APIS/BusApi/BusApis';

const Bookingconfirm = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [invoiceReady, setInvoiceReady] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    // Extract data from navigation state
    const {
        bookingDetails = {},
        bookingResult = {},
        isBooked = false
    } = state || {};

    const {
        contactData = {},
        passengerData = [],
        searchTokenId = ''
    } = bookingDetails || {};

    // Get booking ID from booking result
    const bookingId = bookingResult?.data?.BookingId ||
        bookingResult?.BookingId ||
        bookingResult?.booking_id;

    // Show success toast on component mount
    useEffect(() => {
        if (isBooked && bookingResult) {
            toast.success('🎉 Bus booking confirmed successfully!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    }, [isBooked, bookingResult]);

    // Check if booking data is available on component mount
    useEffect(() => {
        if (bookingId && searchTokenId) {
            // Invoice is ready if we have both required IDs
            setInvoiceReady(true);
            setCheckingStatus(false);
        } else {
            setInvoiceReady(false);
            setCheckingStatus(false);
        }
    }, [bookingId, searchTokenId]);

    // Enhanced invoice download handler
    const handleDownloadInvoice = async () => {
        // Validation checks
        if (!bookingId) {
            toast.error('❌ Booking ID is missing', {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        if (!searchTokenId) {
            toast.error('❌ Search Token ID is missing', {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        setLoading(true);

        try {
            console.log('🚀 Starting invoice download...');
            console.log('📋 Booking ID:', bookingId);
            console.log('🔑 Search Token ID:', searchTokenId);

            // Prepare invoice data
            const invoiceData = {
                UserIp: "122.161.64.143",
                SearchTokenId: searchTokenId,
                BookingId: String(bookingId), // Ensure string format
                receiverEmail: contactData?.email || 
                              passengerData[0]?.email || 
                              passengerData[0]?.Email || 
                              ''
            };

            console.log('📤 Invoice payload:', invoiceData);

            // Show loading toast
            const loadingToastId = toast.info('📄 Preparing your invoice...', {
                position: "top-right",
                autoClose: false,
                hideProgressBar: false,
            });

            const result = await downloadBusInvoice(invoiceData);

            // Dismiss loading toast
            toast.dismiss(loadingToastId);

            // Success message
            toast.success(`✅ Invoice downloaded successfully! (${result.filename})`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

        } catch (error) {
            console.error('❌ Invoice download error:', error);
            
            // Determine error message
            let errorMessage = 'Failed to download invoice. Please try again.';
            
            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (error.response?.data?.Error?.ErrorMessage) {
                errorMessage = error.response.data.Error.ErrorMessage;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            toast.error(`❌ ${errorMessage}`, {
                position: "top-right",
                autoClose: 8000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

        } finally {
            setLoading(false);
        }
    };

    // Debug: Log state data
    useEffect(() => {
        console.log('🐛 Debug - Component State:');
        console.log('📋 Booking ID:', bookingId);
        console.log('🔑 Search Token ID:', searchTokenId);
        console.log('👤 Contact Data:', contactData);
        console.log('🧳 Passenger Data:', passengerData);
        console.log('✅ Is Booked:', isBooked);
        console.log('📄 Booking Result:', bookingResult);
    }, [bookingId, searchTokenId, contactData, passengerData, isBooked, bookingResult]);

    // Redirect if no booking data
    if (!state || !isBooked || !bookingResult) {
        console.warn('⚠️ Missing booking data, redirecting to home');
        navigate('/');
        return null;
    }

    return (
        <Container className="py-4 innerpagecontainer mt-5 pt-5">
            {/* Success Header */}
            <Card className="mb-4 shadow-lg border-success">
                <Card.Body className="text-center bg-success text-white">
                    <FaCheckCircle className="mb-3" size={64} />
                    <h2 className="fw-bold mb-2">🎉 Booking Confirmed!</h2>
                    <p className="mb-0 fs-5">Your bus ticket has been successfully booked</p>
                    {bookingId && (
                        <p className="mb-0 mt-2">
                            <small>Booking ID: <strong>{bookingId}</strong></small>
                        </p>
                    )}
                </Card.Body>
            </Card>

            {/* Debug Information (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
                <Alert variant="info" className="mb-4">
                    <h6>🐛 Debug Info:</h6>
                    <small>
                        <strong>Booking ID:</strong> {bookingId || 'Not found'}<br/>
                        <strong>Search Token:</strong> {searchTokenId || 'Not found'}<br/>
                        <strong>Email:</strong> {contactData?.email || passengerData[0]?.email || 'Not found'}
                    </small>
                </Alert>
            )}

            {/* Missing Data Warning */}
            {(!bookingId || !searchTokenId) && (
                <Alert variant="warning" className="mb-4">
                    <FaExclamationTriangle className="me-2" />
                    <strong>Warning:</strong> Some booking information is missing. Invoice download may not work properly.
                    <ul className="mb-0 mt-2">
                        {!bookingId && <li>Booking ID is missing</li>}
                        {!searchTokenId && <li>Search Token ID is missing</li>}
                    </ul>
                </Alert>
            )}

            {/* Download Invoice Button */}
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <h6 className="fw-bold mb-0">📄 Invoice & Actions</h6>
                </Card.Header>
                <Card.Body className="text-center">
                    {checkingStatus ? (
                        <div className="mb-3">
                            <Spinner animation="border" size="sm" className="me-2" />
                            <span>Checking invoice status...</span>
                        </div>
                    ) : (
                        <Button
                            variant="success"
                            size="lg"
                            className="fw-bold px-5"
                            onClick={handleDownloadInvoice}
                            disabled={loading || !bookingId || !searchTokenId}
                        >
                            {loading ? (
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
                    )}

                    {(!bookingId || !searchTokenId) && (
                        <div className="mt-3">
                            <small className="text-muted">
                                Download will be enabled once all booking information is available
                            </small>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Additional Actions */}
            <Card className="shadow-sm mt-4">
                <Card.Body className="text-center">
                    <Button
                        variant="outline-primary"
                        onClick={() => navigate('/bus-bookings')}
                        className="me-3"
                    >
                        View My Bookings
                    </Button>
                    <Button
                        variant="outline-secondary"
                        onClick={() => navigate('/')}
                    >
                        Book Another Ticket
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Bookingconfirm;