// src/components/Hotel/HotelConfirmation.js - FIXED VERSION FOR BOOKING ID MISMATCH

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Row, Col, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaDownload, FaHotel, FaReceipt, FaRupeeSign, FaCalendarAlt, FaUser, FaRedo, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { downloadHotelInvoice } from '../../../APIS/HotelApi/HotelAPi';

const HotelConfirmation = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [autoRetryTimer, setAutoRetryTimer] = useState(null);
    const [bookingIdMismatch, setBookingIdMismatch] = useState(false);

    // Extract data from navigation state
    const {
        booking = {},
        amount = 0,
        reviewData = {},
        hotelDetails = {},
        paymentDetails = {},
        confirmationDetails = {},
        bookingDetails = {},
        bookingResult = {},
        isBooked = false,
        invoiceData = null
    } = state || {};

    const actualBooking = booking || bookingResult || {};
    const actualAmount = amount || 0;
    const actualHotelDetails = hotelDetails || reviewData || {};

    const contactData = bookingDetails?.contactData ||
        actualBooking?.HotelRoomsDetails?.[0]?.HotelPassenger?.find(p => p.LeadPassenger === "true") ||
        actualBooking?.HotelRoomsDetails?.[0]?.HotelPassenger?.[0] ||
        {};

    const searchTokenId = confirmationDetails?.searchTokenId ||
        bookingDetails?.searchTokenId ||
        actualBooking?.SearchTokenId ||
        '';

    const userIp = confirmationDetails?.userIp ||
        actualBooking?.UserIp ||
        "122.161.64.143";

    // ✅ CRITICAL FIX: Extract BOTH MongoDB ObjectId AND Numeric BookingId
    const extractBookingIds = (result) => {
        const response = {
            mongoId: null,
            numericId: null,
            displayId: null
        };

        // All possible booking ID fields
        const possiblePaths = [
            result?.BookingID,
            result?.bookingId,
            result?.BookingId,
            result?.id,
            result?._id,
            result?.userId,
            result?.data?.BookingID,
            result?.data?.BookingId,
            result?.data?.bookingId,
            result?.data?.id,
            result?.data?._id,
            result?.response?.BookingID,
            result?.response?.BookingId,
            result?.result?.BookingID,
            result?.booking?.BookingID,
            confirmationDetails?.bookingId
        ];

        // Look for numeric booking IDs (for invoice API)
        const numericPaths = [
            result?.numericBookingId,
            result?.bookingNumber,
            result?.hotelBookingId,
            result?.reservationId,
            result?.confirmationNumber,
            result?.data?.numericBookingId,
            result?.data?.bookingNumber,
            result?.data?.hotelBookingId
        ];

        // Check numeric fields first
        for (let candidateId of numericPaths) {
            if (candidateId !== null && candidateId !== undefined) {
                const numericValue = parseInt(candidateId);
                if (!isNaN(numericValue)) {
                    response.numericId = numericValue;
                    response.displayId = numericValue;
                    console.log(`✅ Found NUMERIC booking ID: ${numericValue}`);
                    break;
                }
            }
        }

        // Check all possible paths
        for (let candidateId of possiblePaths) {
            if (candidateId !== null && candidateId !== undefined && String(candidateId).trim() !== '') {
                const candidateStr = String(candidateId).trim();

                // Check if it's numeric
                if (/^\d+$/.test(candidateStr)) {
                    const numericId = parseInt(candidateStr, 10);
                    if (!isNaN(numericId) && !response.numericId) {
                        response.numericId = numericId;
                        response.displayId = numericId;
                        console.log(`✅ Found numeric BookingId: ${numericId}`);
                    }
                } else if (candidateStr.length === 24 && /^[a-fA-F0-9]+$/.test(candidateStr)) {
                    // Looks like MongoDB ObjectId
                    response.mongoId = candidateStr;
                    if (!response.displayId) {
                        response.displayId = candidateStr;
                    }
                    console.log(`⚠️ Found MongoDB ObjectId: ${candidateStr}`);
                } else {
                    // Other string format
                    if (!response.displayId) {
                        response.displayId = candidateStr;
                    }
                    console.log(`📝 Found string booking ID: ${candidateStr}`);
                }
            }
        }

        return response;
    };

    const bookingIds = extractBookingIds(actualBooking);

    // Set mismatch warning if we only have MongoDB ObjectId but no numeric ID
    useEffect(() => {
        if (bookingIds.mongoId && !bookingIds.numericId) {
            setBookingIdMismatch(true);
            console.warn('⚠️ BookingId Mismatch: Only MongoDB ObjectId found, no numeric ID for invoice API');
        }
    }, [bookingIds.mongoId, bookingIds.numericId]);

    // ✅ ENHANCED: Get invoice payload with smart BookingId selection
    const getInvoicePayload = () => {
        // First priority: use provided invoiceData
        if (invoiceData && invoiceData.BookingId && invoiceData.SearchTokenId) {
            console.log('📄 Using provided invoice data:', invoiceData);
            return invoiceData;
        }

        // Second priority: construct from confirmation details
        if (searchTokenId) {
            // ✅ CRITICAL: Use numeric ID for invoice API if available
            let bookingIdForInvoice = null;

            if (bookingIds.numericId) {
                bookingIdForInvoice = bookingIds.numericId;
                console.log(`✅ Using NUMERIC booking ID for invoice: ${bookingIdForInvoice}`);
            } else if (bookingIds.mongoId) {
                // This will likely fail, but we'll try anyway and show a warning
                bookingIdForInvoice = bookingIds.mongoId;
                console.warn(`⚠️ Using MongoDB ObjectId for invoice (may fail): ${bookingIdForInvoice}`);
            } else {
                console.error('❌ No valid booking ID found for invoice');
                return null;
            }

            return {
                UserIp: userIp,
                SearchTokenId: searchTokenId,
                BookingId: bookingIdForInvoice,
                receiverEmail: contactData?.Email ||
                    contactData?.email ||
                    confirmationDetails?.email ||
                    "mohitverma8817@gmail.com"
            };
        }

        console.error('❌ Cannot create invoice payload - missing required data');
        return null;
    };

    // Show success toast on mount
    useEffect(() => {
        if ((isBooked && actualBooking) || confirmationDetails?.message) {
            toast.success('🎉 Hotel booking confirmed successfully!', {
                position: "top-right",
                autoClose: 5000
            });
        }
    }, [isBooked, actualBooking, confirmationDetails]);

    // Cleanup auto-retry timer on unmount
    useEffect(() => {
        return () => {
            if (autoRetryTimer) {
                clearTimeout(autoRetryTimer);
            }
        };
    }, [autoRetryTimer]);

    // Enhanced invoice download handler
    const handleDownloadInvoice = async (isRetryAttempt = false) => {
        const payload = getInvoicePayload();

        if (!payload) {
            toast.error('❌ Cannot download invoice - missing booking information');
            return;
        }

        // ✅ Check for BookingId type mismatch
        if (typeof payload.BookingId === 'string' && payload.BookingId.length === 24) {
            console.error('❌ BookingId appears to be MongoDB ObjectId, invoice API expects numeric ID');
            toast.error('❌ Booking ID format incompatible with invoice system. Please contact support for manual invoice generation.', {
                position: "top-right",
                autoClose: 10000
            });
            return;
        }

        console.log('📤 Sending hotel invoice request with payload:', payload);
        console.log(`🔄 Attempt ${retryCount + 1}/5`);

        setLoading(true);

        try {
            const result = await downloadHotelInvoice(payload);

            console.log('🏨 Raw API response:', result);

            // Handle successful responses (same as before)
            if (result instanceof Blob) {
                const url = window.URL.createObjectURL(result);
                const link = document.createElement('a');
                link.href = url;
                link.download = `hotel-invoice-${payload.BookingId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast.success('✅ Hotel invoice downloaded successfully!', {
                    position: "top-right",
                    autoClose: 5000
                });

                setRetryCount(0);
                return;
            }

            if (result && typeof result === 'object') {
                if (result.success === true || result.status === 'success') {
                    if (result.alreadyExists) {
                        toast.success('✅ Hotel invoice already generated and sent to your email!', {
                            position: "top-right",
                            autoClose: 6000
                        });
                    } else if (result.downloaded) {
                        toast.success(`✅ Hotel invoice downloaded successfully! (${result.filename})`, {
                            position: "top-right",
                            autoClose: 5000
                        });
                    } else {
                        toast.success(result.message || '✅ Hotel invoice processed successfully!', {
                            position: "top-right",
                            autoClose: 5000
                        });
                    }

                    setRetryCount(0);
                    return;
                } else if (result.notFound && result.retryAfter) {
                    const waitTime = Math.floor((result.retryAfter || 60000) / 1000);
                    toast.warning(`⏳ Invoice is being generated. Auto-retry in ${waitTime} seconds...`, {
                        position: "top-right",
                        autoClose: 8000
                    });

                    const timer = setTimeout(() => {
                        console.log('🔄 Auto-retrying invoice download...');
                        setRetryCount(prev => prev + 1);
                        handleDownloadInvoice(true);
                    }, result.retryAfter || 60000);

                    setAutoRetryTimer(timer);
                    return;
                } else {
                    const errorMessage = result.message || result.error || result.errorMessage || 'Unknown error occurred';
                    console.error('❌ Hotel API Error Response:', result);

                    if (!isRetryAttempt) {
                        toast.error(`❌ ${errorMessage}`, {
                            position: "top-right",
                            autoClose: 6000
                        });
                    }
                }
            } else {
                console.error('❌ Unexpected response format:', result);
                if (!isRetryAttempt) {
                    toast.error('❌ Unexpected response format from server', {
                        position: "top-right",
                        autoClose: 6000
                    });
                }
            }

        } catch (error) {
            console.error('❌ Hotel invoice download error:', error);

            // ✅ Specific handling for casting error
            if (error.message && error.message.includes('Cast to Number failed')) {
                const castError = `❌ BOOKING ID INCOMPATIBILITY

Your booking ID "${payload.BookingId}" cannot be processed by the invoice system.

This is a system compatibility issue:
• Invoice API expects: Numeric ID (e.g., 1252)
• Your booking generated: "${payload.BookingId}"

SOLUTION: Please contact customer support with this booking reference for manual invoice generation.

Technical Error: ${error.message}`;

                toast.error(castError, {
                    position: "top-right",
                    autoClose: 12000,
                    style: { whiteSpace: 'pre-line' }
                });

                setLoading(false);
                return;
            }

            let errorMessage = 'Failed to download hotel invoice. Please try again.';
            let shouldRetry = false;

            if (error.response) {
                console.error('❌ HTTP Error Response:', error.response);

                if (error.response.status === 404) {
                    errorMessage = 'Invoice not yet available. The booking might be too recent.';
                    shouldRetry = true;
                } else {
                    errorMessage = error.response.data?.message ||
                        error.response.data?.error ||
                        `HTTP ${error.response.status}: ${error.response.statusText}`;
                }
            } else if (error.message) {
                errorMessage = error.message;

                if (error.message.includes('not found') || error.message.includes('404')) {
                    shouldRetry = true;
                }
            }

            if (!isRetryAttempt || retryCount >= 4) {
                toast.error(`❌ ${errorMessage}`, {
                    position: "top-right",
                    autoClose: shouldRetry ? 8000 : 6000
                });
            }

            // Auto-retry logic for recoverable errors
            if (shouldRetry && retryCount < 4 && !error.message.includes('Cast to Number')) {
                const waitTime = 60;

                if (!isRetryAttempt) {
                    toast.info(`🔄 Auto-retry ${retryCount + 2}/5 in ${waitTime} seconds...`, {
                        position: "top-right",
                        autoClose: 10000
                    });
                }

                const timer = setTimeout(() => {
                    console.log(`🔄 Auto-retrying invoice download (attempt ${retryCount + 2}/5)...`);
                    setRetryCount(prev => prev + 1);
                    handleDownloadInvoice(true);
                }, waitTime * 1000);

                setAutoRetryTimer(timer);
            } else if (retryCount >= 4) {
                toast.error('❌ Maximum retry attempts reached. Please contact support.', {
                    position: "top-right",
                    autoClose: 10000
                });
                setRetryCount(0);
            }
        } finally {
            setLoading(false);
        }
    };


    // Redirect if no booking data
    if (!state || (!isBooked && !confirmationDetails?.bookingId) || (!actualBooking && !confirmationDetails)) {
        navigate('/');
        return null;
    }

    const invoicePayload = getInvoicePayload();

    return (
        <Container className="py-4 innerpagecontainer mt-5 pt-5">


            {/* Retry Status Alert */}
            {(loading || autoRetryTimer) && retryCount > 0 && (
                <Alert variant="info" className="mb-4">
                    <div className="d-flex align-items-center">
                        <Spinner animation="border" size="sm" className="me-2" />
                        <div>
                            <strong>Invoice Processing:</strong> Attempt {retryCount + 1}/5 -
                            {loading ? ' Processing...' : ' Waiting for next retry...'}
                        </div>
                    </div>
                </Alert>
            )}

            {/* Enhanced Invoice Download Section */}
            <Card className="shadow-sm mx-auto mb-4 w-50">
                <Card.Header className="bg-danger text-white">
                    <h6 className="fw-bold mb-0">📄 Download Your Hotel Invoice</h6>
                </Card.Header>
                <Card.Body>
                    <div className="text-center">
                        <div className="mb-3">
                            <Button
                                variant={bookingIdMismatch ? "warning" : "danger"}
                                size="lg"
                                className="fw-bold px-5 me-3"
                                onClick={() => handleDownloadInvoice(false)}
                                disabled={loading || !invoicePayload}
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Processing{retryCount > 0 ? ` (${retryCount + 1}/5)` : ''}...
                                    </>
                                ) : (
                                    <>
                                        <FaDownload className="me-2" />
                                        {bookingIdMismatch ? 'Try Download' : 'Download Invoice'}
                                    </>
                                )}
                            </Button>


                        </div>

                        {!invoicePayload && (
                            <div className="mt-3">
                                <small className="text-danger">
                                    ⚠️ Invoice download unavailable - missing booking information
                                </small>
                            </div>
                        )}





                    </div>
                </Card.Body>
            </Card>


        </Container>
    );
};

export default HotelConfirmation;