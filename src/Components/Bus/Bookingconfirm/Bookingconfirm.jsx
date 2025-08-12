// src/components/Bus/BusConfirmation.js - FIXED VERSION

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { downloadBusInvoice } from '../../APIS/BusApi/BusApis';

const Bookingconfirm = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Extract data from navigation state
    const {
        bookingDetails = {},
        bookingResult = {},
        isBooked = false,
        invoiceData = null
    } = state || {};

    const {
        contactData = {},
        passengerData = [],
        searchTokenId = ''
    } = bookingDetails || {};

    // Extract BookingId from result
    const extractBookingIdFromResult = (result) => {
        const possiblePaths = [
            result?.BookingId,
            result?.bookingId,
            result?.data?.BookingId,
            result?.data?.bookingId,
            result?.response?.BookingId,
            result?.result?.BookingId
        ];

        for (let candidateId of possiblePaths) {
            if (candidateId && String(candidateId).trim() !== '') {
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

    // Show success toast on mount
    useEffect(() => {
        if (isBooked && bookingResult) {
            toast.success('🎉 Bus booking confirmed successfully!', {
                position: "top-right",
                autoClose: 5000
            });
        }
    }, [isBooked, bookingResult]);

    // Enhanced invoice download handler with better error handling
    const handleDownloadInvoice = async () => {
        const payload = getInvoicePayload();

        if (!payload) {
            toast.error('❌ Cannot download invoice - missing booking information');
            return;
        }

        console.log('📤 Sending invoice request with payload:', payload);
        setLoading(true);

        try {
            const result = await downloadBusInvoice(payload);

            console.log('📄 Raw API response:', result);
            console.log('📄 Response type:', typeof result);

            // Check if the result is a Blob (PDF file)
            if (result instanceof Blob) {
                // Handle PDF blob response
                const url = window.URL.createObjectURL(result);
                const link = document.createElement('a');
                link.href = url;
                link.download = `bus-invoice-${bookingId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast.success('✅ Invoice downloaded successfully!', {
                    position: "top-right",
                    autoClose: 5000
                });
                return;
            }

            // Handle JSON response
            if (result && typeof result === 'object') {
                console.log('📄 JSON response received:', result);

                // Check for success in various response formats
                if (result.success === true || result.status === 'success') {
                    if (result.alreadyExists) {
                        toast.success('✅ Invoice already generated and sent to your email!', {
                            position: "top-right",
                            autoClose: 6000
                        });
                    } else if (result.downloaded) {
                        toast.success(`✅ Invoice downloaded successfully! (${result.filename})`, {
                            position: "top-right",
                            autoClose: 5000
                        });
                    } else {
                        toast.success(result.message || '✅ Invoice processed successfully!', {
                            position: "top-right",
                            autoClose: 5000
                        });
                    }
                } else {
                    // Handle API error responses
                    const errorMessage = result.message || 
                                       result.error || 
                                       result.errorMessage || 
                                       'Unknown error occurred';
                    
                    console.error('❌ API Error Response:', result);
                    toast.error(`❌ ${errorMessage}`, {
                        position: "top-right",
                        autoClose: 6000
                    });
                }
            } else {
                // Handle unexpected response format
                console.error('❌ Unexpected response format:', result);
                toast.error('❌ Unexpected response format from server', {
                    position: "top-right",
                    autoClose: 6000
                });
            }

        } catch (error) {
            console.error('❌ Invoice download error:', error);
            
            // Handle different types of errors
            let errorMessage = 'Failed to download invoice. Please try again.';
            
            if (error.response) {
                // HTTP error response
                console.error('❌ HTTP Error Response:', error.response);
                errorMessage = error.response.data?.message || 
                              error.response.data?.error || 
                              `HTTP ${error.response.status}: ${error.response.statusText}`;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(`❌ ${errorMessage}`, {
                position: "top-right",
                autoClose: 6000
            });
        } finally {
            setLoading(false);
        }
    };

    // Redirect if no booking data
    if (!state || !isBooked || !bookingResult) {
        navigate('/');
        return null;
    }

    const invoicePayload = getInvoicePayload();

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

          

            {/* Invoice Download Section */}
            <Card className="shadow-sm">
                <Card.Header className="bg-danger text-white">
                    <h6 className="fw-bold mb-0">📄 Download Your Invoice</h6>
                </Card.Header>
                <Card.Body>
                    <div className="text-center">
                        <Button
                            variant="danger"
                            size="lg"
                            className="fw-bold px-5"
                            onClick={handleDownloadInvoice}
                            disabled={loading || !invoicePayload}
                        >
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FaDownload className="me-2" />
                                    Download Invoice
                                </>
                            )}
                        </Button>

                        {!invoicePayload && (
                            <div className="mt-3">
                                <small className="text-danger">
                                    ⚠️ Invoice download unavailable - missing booking information
                                </small>
                            </div>
                        )}

                        <div className="mt-3">
                            <small className="text-muted">
                                📄 Click above to download your booking invoice as a PDF file.
                            </small>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Bookingconfirm;