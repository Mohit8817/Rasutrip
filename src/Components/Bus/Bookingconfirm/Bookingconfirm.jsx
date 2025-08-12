// src/components/Bus/BusConfirmation.js - IMPROVED VERSION

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaDownload, FaRedo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { downloadBusInvoice } from '../../APIS/BusApi/BusApis';

const Bookingconfirm = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [invoiceStatus, setInvoiceStatus] = useState('pending'); // 'pending', 'generating', 'ready', 'error'
    const [retryCount, setRetryCount] = useState(0);

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

    // Function to handle different response types
    const processApiResponse = async (result) => {
        console.log('📄 Processing API response:', result);
        console.log('📄 Response type:', typeof result);

        // Check if the result is a Blob (PDF file)
        if (result instanceof Blob) {
            console.log('📄 Blob response detected, downloading PDF...');
            const url = window.URL.createObjectURL(result);
            const link = document.createElement('a');
            link.href = url;
            link.download = `bus-invoice-${bookingId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setInvoiceStatus('ready');
            toast.success('✅ Invoice downloaded successfully!', {
                position: "top-right",
                autoClose: 5000
            });
            return true;
        }

        // Handle JSON response
        if (result && typeof result === 'object') {
            console.log('📄 JSON response received:', result);

            // Check for success in various response formats
            if (result.success === true || result.status === 'success') {
                if (result.alreadyExists) {
                    setInvoiceStatus('ready');
                    toast.success('✅ Invoice already generated and sent to your email!', {
                        position: "top-right",
                        autoClose: 6000
                    });
                    return true;
                } else if (result.downloaded) {
                    setInvoiceStatus('ready');
                    toast.success(`✅ Invoice downloaded successfully! (${result.filename})`, {
                        position: "top-right",
                        autoClose: 5000
                    });
                    return true;
                } else if (result.generating || result.processing) {
                    // Invoice is being generated, need to retry
                    setInvoiceStatus('generating');
                    toast.info('⏳ Invoice is being generated, retrying in 3 seconds...', {
                        position: "top-right",
                        autoClose: 3000
                    });
                    return 'retry';
                } else {
                    setInvoiceStatus('ready');
                    toast.success(result.message || '✅ Invoice processed successfully!', {
                        position: "top-right",
                        autoClose: 5000
                    });
                    return true;
                }
            } else {
                // Check if it's an error due to invoice generation in progress
                if (result.message && 
                    (result.message.toLowerCase().includes('generating') || 
                     result.message.toLowerCase().includes('processing') ||
                     result.message.toLowerCase().includes('not ready'))) {
                    setInvoiceStatus('generating');
                    return 'retry';
                }

                // Handle API error responses
                const errorMessage = result.message || 
                                   result.error || 
                                   result.errorMessage || 
                                   'Unknown error occurred';
                
                console.error('❌ API Error Response:', result);
                setInvoiceStatus('error');
                toast.error(`❌ ${errorMessage}`, {
                    position: "top-right",
                    autoClose: 6000
                });
                return false;
            }
        } else {
            // Handle unexpected response format
            console.error('❌ Unexpected response format:', result);
            setInvoiceStatus('error');
            toast.error('❌ Unexpected response format from server', {
                position: "top-right",
                autoClose: 6000
            });
            return false;
        }
    };

    // Enhanced invoice download handler with retry mechanism
    const handleDownloadInvoice = async (isRetry = false) => {
        const payload = getInvoicePayload();

        if (!payload) {
            toast.error('❌ Cannot download invoice - missing booking information');
            return;
        }

        if (!isRetry) {
            setRetryCount(0);
            setInvoiceStatus('pending');
        }

        console.log('📤 Sending invoice request with payload:', payload);
        setLoading(true);

        try {
            const result = await downloadBusInvoice(payload);
            const processResult = await processApiResponse(result);

            if (processResult === 'retry' && retryCount < 3) {
                // Retry after 3 seconds
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    handleDownloadInvoice(true);
                }, 3000);
            } else if (processResult === 'retry' && retryCount >= 3) {
                setInvoiceStatus('error');
                toast.error('❌ Invoice generation is taking too long. Please try again later.', {
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

            setInvoiceStatus('error');
            toast.error(`❌ ${errorMessage}`, {
                position: "top-right",
                autoClose: 6000
            });
        } finally {
            setLoading(false);
        }
    };

    // Manual retry function
    const handleRetry = () => {
        setRetryCount(0);
        handleDownloadInvoice();
    };

    // Redirect if no booking data
    if (!state || !isBooked || !bookingResult) {
        navigate('/');
        return null;
    }

    const invoicePayload = getInvoicePayload();

    return (
        <Container className="py-4 innerpagecontainer">
           

            {/* Invoice Download Section */}
            <Card className="shadow-sm w-50 mx-auto">
                <Card.Header className="bg-danger text-white">
                    <h6 className="fw-bold mb-0">📄 Download Your Invoice</h6>
                </Card.Header>
                <Card.Body>
                    {/* Status Alert */}
                    {invoiceStatus === 'generating' && (
                        <Alert variant="info" className="mb-3">
                            <div className="d-flex align-items-center">
                                <Spinner animation="border" size="sm" className="me-2" />
                                <span>Invoice is being generated... Retry attempt {retryCount + 1}/3</span>
                            </div>
                        </Alert>
                    )}

                    {invoiceStatus === 'error' && (
                        <Alert variant="warning" className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <span>⚠️ There was an issue downloading the invoice.</span>
                                <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={handleRetry}
                                    disabled={loading}
                                >
                                    <FaRedo className="me-1" />
                                    Retry
                                </Button>
                            </div>
                        </Alert>
                    )}

                    <div className="text-center">
                        <Button
                            variant="danger"
                            size="lg"
                            className="fw-bold px-5"
                            onClick={() => handleDownloadInvoice()}
                            disabled={loading || !invoicePayload}
                        >
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    {invoiceStatus === 'generating' ? 'Retrying...' : 'Processing...'}
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
                                {retryCount > 0 && <><br />ℹ️ If first attempt fails, the system will automatically retry.</>}
                            </small>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Bookingconfirm;