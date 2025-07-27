import React, { useState } from 'react';
import { Card, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import {
  createHotelOrder,
  validateHotelPayment,
  bookHotel,
} from '../../../APIS/HotelApi/HotelAPi';

const HotelPaymentInfo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const {
    payload = {},
    hotelBookingDetails = {},
    priceDetails = {},
    reviewData = {},
  } = location.state || {};

  const {
    baseFare = 0,
    cgst = 0,
    sgst = 0,
    discount = 0,
    vendorCommission = 0,
  } = priceDetails;

  const totalPayable = baseFare + cgst + sgst - discount;
  const roundedTotal = parseFloat(totalPayable.toFixed(2));

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // ✅ Enhanced validation function with better error messages
  const validateBookingPayload = (payload) => {
    const errors = [];

    // Basic payload structure validation
    if (!payload || typeof payload !== 'object') {
      errors.push('Invalid payload structure');
      return errors;
    }

    // Required top-level fields with more specific validation
    const requiredFields = {
      'ResultIndex': payload.ResultIndex,
      'HotelCode': payload.HotelCode,
      'HotelName': payload.HotelName,
      'SearchTokenId': payload.SearchTokenId,
      'roomTravellerInfo': payload.roomTravellerInfo
    };

    Object.entries(requiredFields).forEach(([field, value]) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`Missing or empty required field: ${field}`);
      }
    });

    // Validate roomTravellerInfo structure
    if (!payload.roomTravellerInfo || !Array.isArray(payload.roomTravellerInfo)) {
      errors.push('roomTravellerInfo must be an array');
      return errors;
    }

    if (payload.roomTravellerInfo.length === 0) {
      errors.push('At least one room with traveller info is required');
      return errors;
    }

    let leadPassengerCount = 0;
    let totalTravellers = 0;

    payload.roomTravellerInfo.forEach((room, roomIdx) => {
      if (!room.travellerInfo || !Array.isArray(room.travellerInfo)) {
        errors.push(`Room ${roomIdx + 1}: travellerInfo must be an array`);
        return;
      }

      if (room.travellerInfo.length === 0) {
        errors.push(`Room ${roomIdx + 1}: At least one traveller is required`);
        return;
      }

      room.travellerInfo.forEach((traveller, travellerIdx) => {
        totalTravellers++;
        
        // Check LeadPassenger
        if (traveller.LeadPassenger === true) {
          leadPassengerCount++;
        }

        // Required traveller fields with improved validation
        const requiredTravellerFields = {
          'Title': traveller.Title,
          'FirstName': traveller.FirstName,
          'LastName': traveller.LastName,
          'Email': traveller.Email,
          'Phoneno': traveller.Phoneno,
          'Age': traveller.Age
        };

        Object.entries(requiredTravellerFields).forEach(([field, value]) => {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push(`Room ${roomIdx + 1}, Traveller ${travellerIdx + 1}: ${field} is required`);
          }
        });

        // Age validation
        if (traveller.Age && (isNaN(traveller.Age) || traveller.Age < 1 || traveller.Age > 120)) {
          errors.push(`Room ${roomIdx + 1}, Traveller ${travellerIdx + 1}: Invalid age (${traveller.Age})`);
        }

        // PAN validation for adults (18+)
        if (traveller.Age >= 18 && (!traveller.PAN || traveller.PAN.trim() === '')) {
          errors.push(`Room ${roomIdx + 1}, Traveller ${travellerIdx + 1}: PAN is required for adults (Age: ${traveller.Age})`);
        }

        // Email validation
        if (traveller.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(traveller.Email)) {
          errors.push(`Room ${roomIdx + 1}, Traveller ${travellerIdx + 1}: Invalid email format (${traveller.Email})`);
        }

        // Phone validation - improved regex
        if (traveller.Phoneno && !/^[0-9]{10}$/.test(traveller.Phoneno.replace(/\D/g, ''))) {
          errors.push(`Room ${roomIdx + 1}, Traveller ${travellerIdx + 1}: Phone number must be 10 digits (${traveller.Phoneno})`);
        }
      });
    });

    // LeadPassenger validation
    if (leadPassengerCount !== 1) {
      errors.push(`Must have exactly 1 LeadPassenger, found ${leadPassengerCount}`);
    }

    if (totalTravellers === 0) {
      errors.push('No travellers found in booking');
    }

    return errors;
  };

  // ✅ Function to clean and format booking data with additional validation
  const formatBookingData = (bookingDetails) => {
    const cleanedData = { ...bookingDetails };

    // Ensure required top-level fields exist
    cleanedData.GuestNationality = cleanedData.GuestNationality || payload?.GuestNationality || reviewData?.GuestNationality || 'IN';
    cleanedData.NoOfRooms = cleanedData.NoOfRooms || "1";
    cleanedData.ClientReferenceNo = cleanedData.ClientReferenceNo || 0;
    cleanedData.IsVoucherBooking = cleanedData.IsVoucherBooking || "true";
    cleanedData.vendorCommission = cleanedData.vendorCommission || vendorCommission || 0;
    cleanedData.CouponDiscount = cleanedData.CouponDiscount || 0;

    // Get user IP (you might want to fetch this dynamically)
    cleanedData.UserIp = cleanedData.UserIp || "0.0.0.0"; // Default IP

    // ✅ Additional validation for SearchTokenId - check if it's expired or invalid
    if (cleanedData.SearchTokenId && typeof cleanedData.SearchTokenId === 'string') {
      // Check if SearchTokenId looks valid (not empty, has proper format)
      if (cleanedData.SearchTokenId.length < 10) {
        console.warn('⚠️ SearchTokenId seems too short:', cleanedData.SearchTokenId);
      }
    }

    // ✅ Validate ResultIndex format
    if (cleanedData.ResultIndex && typeof cleanedData.ResultIndex === 'string') {
      if (!cleanedData.ResultIndex.includes('-')) {
        console.warn('⚠️ ResultIndex format might be invalid:', cleanedData.ResultIndex);
      }
    }

    // Process roomTravellerInfo
    if (cleanedData.roomTravellerInfo && Array.isArray(cleanedData.roomTravellerInfo)) {
      cleanedData.roomTravellerInfo = cleanedData.roomTravellerInfo.map((room) => {
        if (!room.travellerInfo || !Array.isArray(room.travellerInfo)) {
          return { travellerInfo: [] };
        }

        const processedTravellers = room.travellerInfo.map((pax) => {
          // Clean and format each traveller
          const processedPax = {
            Title: String(pax.Title || "Mr").trim(),
            FirstName: String(pax.FirstName || "").trim(),
            MiddleName: "", // Always empty string as per API requirement
            LastName: String(pax.LastName || "").trim(),
            Phoneno: String(pax.Phoneno || "").replace(/\D/g, ''), // Remove non-digits
            Email: String(pax.Email || "").trim().toLowerCase(),
            PaxType: parseInt(pax.PaxType) || 1,
            Age: pax.Age && !isNaN(pax.Age) ? parseInt(pax.Age) : null,
            
            // Passport fields - always null for domestic bookings
            PassportNo: null,
            PassportIssueDate: null,
            PassportExpDate: null,
            
            // PAN - required for adults, validate format
            PAN: pax.PAN ? String(pax.PAN).trim().toUpperCase() : null,
            
            // GST fields - use null if empty
            GSTCompanyAddress: pax.GSTCompanyAddress ? String(pax.GSTCompanyAddress).trim() : null,
            GSTCompanyContactNumber: pax.GSTCompanyContactNumber ? String(pax.GSTCompanyContactNumber).trim() : null,
            GSTCompanyEmail: pax.GSTCompanyEmail ? String(pax.GSTCompanyEmail).trim() : null,
            GSTCompanyName: pax.GSTCompanyName ? String(pax.GSTCompanyName).trim() : null,
            GSTNumber: pax.GSTNumber ? String(pax.GSTNumber).trim() : null,
            
            // LeadPassenger must be boolean
            LeadPassenger: Boolean(pax.LeadPassenger)
          };

          // ✅ Additional PAN format validation
          if (processedPax.PAN && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(processedPax.PAN)) {
            console.warn(`⚠️ Invalid PAN format for ${processedPax.FirstName}:`, processedPax.PAN);
          }

          return processedPax;
        });

        return {
          travellerInfo: processedTravellers
        };
      });
    }

    return cleanedData;
  };

  // ✅ Enhanced API error handler
  const handleApiError = (error, context = 'API') => {
    console.error(`❌ ${context} Error:`, error);
    
    let errorMessage = `${context} failed. Please try again.`;
    let errorDetails = null;

    if (error?.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      errorDetails = {
        status,
        data,
        headers: error.response.headers
      };

      switch (status) {
        case 400:
          errorMessage = data?.Error?.ErrorMessage || data?.message || 'Invalid request data. Please check your booking details.';
          break;
        case 401:
          errorMessage = 'Authentication failed. Please refresh the page and try again.';
          break;
        case 403:
          errorMessage = 'Access denied. Please contact support.';
          break;
        case 404:
          errorMessage = 'Hotel booking service not found. Please try again later.';
          break;
        case 409:
          errorMessage = 'Booking conflict. The room may no longer be available.';
          break;
        case 422:
          errorMessage = data?.Error?.ErrorMessage || 'Invalid booking data. Please check all required fields.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          errorMessage = 'Hotel booking service is temporarily unavailable. Please try again in a few minutes.';
          if (data?.Error?.ErrorMessage) {
            errorMessage += ` (${data.Error.ErrorMessage})`;
          }
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'Hotel booking service is temporarily down. Please try again later.';
          break;
        default:
          errorMessage = data?.Error?.ErrorMessage || data?.message || `${context} failed with status ${status}`;
      }
    } else if (error?.request) {
      // Request was made but no response received
      errorMessage = 'Network error. Please check your internet connection and try again.';
      errorDetails = { request: 'No response received' };
    } else {
      // Something else happened
      errorMessage = error?.message || `${context} failed due to an unexpected error.`;
      errorDetails = { message: error?.message };
    }

    return { message: errorMessage, details: errorDetails };
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // ✅ Pre-validate and format booking details
      console.log('🔍 Formatting and validating booking payload...');
      
      const formattedBookingData = formatBookingData(hotelBookingDetails);
      const validationErrors = validateBookingPayload(formattedBookingData);
      
      if (validationErrors.length > 0) {
        console.error('❌ Payload validation failed:', validationErrors);
        setError(`Booking validation failed:\n• ${validationErrors.join('\n• ')}`);
        setLoading(false);
        return;
      }

      console.log('✅ Payload validation passed');

      // ✅ Additional checks before API call
      const currentTime = new Date().toISOString();
      console.log('🕒 Booking attempt at:', currentTime);
      console.log('🏨 Hotel Details:', {
        name: formattedBookingData.HotelName,
        code: formattedBookingData.HotelCode,
        resultIndex: formattedBookingData.ResultIndex,
        searchTokenId: formattedBookingData.SearchTokenId?.substring(0, 10) + '...' // Log partial token for security
      });

      // Load Razorpay script
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        setError('Payment system failed to load. Please refresh and try again.');
        setLoading(false);
        return;
      }

      // Create order
      const orderResponse = await createHotelOrder(roundedTotal);
      const order = orderResponse?.order;

      if (!order?.id) {
        throw new Error('Failed to create payment order');
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_glwdvx2PlFDStN',
        amount: order.amount,
        currency: order.currency,
        name: 'TTS Travels',
        description: 'Hotel Booking Payment',
        order_id: order.id,
        handler: async (response) => {
          try {
            console.log('💳 Payment completed, validating...');
            
            const validatePayload = {
              amount: roundedTotal,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingType: 'HOTEL',
              Hotel: formattedBookingData,
            };

            const validation = await validateHotelPayment(validatePayload);

            if (
              validation?.message === 'Payment verified successfully' &&
              validation?.payment?.status === 'success'
            ) {
              console.log('✅ Payment validated successfully');
              
              // ✅ Create final booking payload with payment information
              const finalPayload = {
                ...formattedBookingData,
                RazorpayOrderId: response.razorpay_order_id,
                RazorpayPaymentId: response.razorpay_payment_id,
                RazorpayOrderStatus: 'PAID',
                PaymentId: validation?.payment?._id || '',
              };

              console.log('📦 Final Booking Payload (sanitized):', {
                ...finalPayload,
                roomTravellerInfo: finalPayload.roomTravellerInfo?.map(room => ({
                  ...room,
                  travellerInfo: room.travellerInfo?.map(traveller => ({
                    ...traveller,
                    PAN: traveller.PAN ? '***HIDDEN***' : null,
                    Email: traveller.Email ? traveller.Email.replace(/(.{2}).*(@.*)/, '$1***$2') : null
                  }))
                }))
              });

              // ✅ Make booking API call with enhanced error handling
              try {
                console.log('🚀 Calling booking API...');
                const bookingStartTime = Date.now();
                
                const bookingResponse = await bookHotel(finalPayload);
                
                const bookingEndTime = Date.now();
                console.log(`⏱️ Booking API took ${bookingEndTime - bookingStartTime}ms`);
                console.log('📦 Booking API Response:', bookingResponse);

                // ✅ Enhanced response handling
                if (bookingResponse?.BookingStatus?.toLowerCase() === 'confirmed' || 
                    bookingResponse?.Status?.toLowerCase() === 'success' ||
                    bookingResponse?.success === true) {
                  console.log('✅ Booking confirmed successfully');
                  navigate('/hotel/confirmation', {
                    state: {
                      booking: bookingResponse,
                      amount: roundedTotal,
                      reviewData,
                      paymentDetails: {
                        orderId: response.razorpay_order_id,
                        paymentId: response.razorpay_payment_id
                      }
                    },
                  });
                } else {
                  // Handle booking failure
                  console.error('❌ Booking failed:', bookingResponse);
                  
                  let errorMessage = 'Booking failed. Please contact support.';
                  
                  // Extract error message from various possible response formats
                  if (bookingResponse?.Error?.ErrorMessage) {
                    errorMessage = bookingResponse.Error.ErrorMessage;
                  } else if (bookingResponse?.error?.message) {
                    errorMessage = bookingResponse.error.message;
                  } else if (bookingResponse?.message && bookingResponse.message !== 'success') {
                    errorMessage = bookingResponse.message;
                  } else if (typeof bookingResponse?.error === 'string') {
                    errorMessage = bookingResponse.error;
                  }

                  setError(`Booking Failed: ${errorMessage}`);
                  
                  navigate('/hotel/payment-failed', {
                    state: {
                      error: errorMessage,
                      bookingResponse,
                      amount: roundedTotal,
                      paymentDetails: {
                        orderId: response.razorpay_order_id,
                        paymentId: response.razorpay_payment_id
                      }
                    }
                  });
                }
              } catch (bookingError) {
                console.error('❌ Booking API Error:', bookingError);
                
                // ✅ Use enhanced error handler
                const { message: errorMessage, details } = handleApiError(bookingError, 'Hotel Booking');
                
                // Log additional details for debugging
                if (details) {
                  console.error('📋 Error Details:', details);
                }

                setError(`Booking Error: ${errorMessage}`);
                
                navigate('/hotel/payment-failed', {
                  state: {
                    error: errorMessage,
                    errorDetails: details,
                    amount: roundedTotal,
                    paymentDetails: {
                      orderId: response.razorpay_order_id,
                      paymentId: response.razorpay_payment_id
                    }
                  }
                });
              }
            } else {
              console.error('❌ Payment validation failed:', validation);
              setError(validation?.message || 'Payment validation failed.');
              navigate('/hotel/payment-failed', {
                state: {
                  error: 'Payment validation failed',
                  amount: roundedTotal
                }
              });
            }
          } catch (err) {
            console.error('❌ Payment Handler Error:', err);
            const { message: errorMessage } = handleApiError(err, 'Payment Processing');
            setError(errorMessage);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formattedBookingData?.roomTravellerInfo?.[0]?.travellerInfo?.[0]?.FirstName || 'Guest',
          email: formattedBookingData?.roomTravellerInfo?.[0]?.travellerInfo?.[0]?.Email || 'guest@example.com',
          contact: formattedBookingData?.roomTravellerInfo?.[0]?.travellerInfo?.[0]?.Phoneno || '9999999999',
        },
        notes: {
          address: 'Hotel Booking Payment',
          hotelName: formattedBookingData?.HotelName || 'Hotel Booking',
        },
        theme: {
          color: '#c90d26',
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('❌ Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setLoading(false);
      });
      
      rzp.open();
    } catch (err) {
      console.error('❌ Payment Initialization Error:', err);
      const { message: errorMessage } = handleApiError(err, 'Payment Initialization');
      setError(errorMessage);
      setLoading(false);
    }
  };

  // ✅ Enhanced error boundary check
  if (!hotelBookingDetails || Object.keys(hotelBookingDetails).length === 0) {
    return (
      <div className="container my-4">
        <Card className="shadow-sm border-danger">
          <Card.Body className="text-center">
            <FaExclamationTriangle className="text-danger mb-3" size={48} />
            <h5 className="text-danger">Missing Payment Data</h5>
            <p>Required booking information is missing. Please start the booking process again.</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }
  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
              <FaExclamationTriangle className="me-2" />
              <strong>Error:</strong> 
              <div style={{ whiteSpace: 'pre-line', marginTop: '8px' }}>
                {error}
              </div>
            </Alert>
          )}

          {/* Payment Summary Card */}
          <Card className="shadow-sm rounded mb-4">
            <Card.Header className="bg-danger text-white">
              <div className="d-flex align-items-center">
                <FaShieldAlt className="me-2" />
                <h5 className="mb-0 fw-bold">Secure Payment</h5>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Hotel Summary */}
              <div className="mb-4 p-3 bg-light rounded">
                <h6 className="fw-bold mb-2">Booking Summary</h6>
                <div className="row">
                  <div className="col-md-8">
                    <div><strong>Hotel:</strong> {hotelBookingDetails?.HotelName || 'N/A'}</div>
                    <div><strong>Rooms:</strong> {hotelBookingDetails?.NoOfRooms || 1}</div>
                    <div><strong>Guests:</strong> {
                      hotelBookingDetails?.roomTravellerInfo?.reduce((total, room) => 
                        total + (room.travellerInfo?.length || 0), 0
                      ) || 0
                    }</div>
                  </div>
                  <div className="col-md-4 text-end">
                    <div className="fs-4 fw-bold text-danger">₹ {roundedTotal}</div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Price Details</h6>
                
                <Row className="mb-2">
                  <Col>Base Fare</Col>
                  <Col className="text-end">₹ {Math.round(baseFare)}</Col>
                </Row>
                
                {cgst > 0 && (
                  <Row className="mb-2">
                    <Col>CGST</Col>
                    <Col className="text-end">₹ {Math.round(cgst)}</Col>
                  </Row>
                )}
                
                {sgst > 0 && (
                  <Row className="mb-2">
                    <Col>SGST</Col>
                    <Col className="text-end">₹ {Math.round(sgst)}</Col>
                  </Row>
                )}
                
                {discount > 0 && (
                  <Row className="mb-2">
                    <Col>Discount</Col>
                    <Col className="text-end text-success">- ₹ {Math.round(discount)}</Col>
                  </Row>
                )}
                
                <hr />
                
                <Row className="fw-bold fs-5">
                  <Col>Total Payable</Col>
                  <Col className="text-end text-danger">₹ {roundedTotal}</Col>
                </Row>
              </div>

              {/* Payment Security Info */}
              <div className="alert alert-info">
                <div className="d-flex align-items-center mb-2">
                  <FaShieldAlt className="me-2" />
                  <strong>Secure Payment</strong>
                </div>
                <small>
                  Your payment is secured by Razorpay with 256-bit SSL encryption. 
                  We accept all major credit cards, debit cards, UPI, and net banking.
                </small>
              </div>

              {/* Guest Information Preview */}
              {hotelBookingDetails?.roomTravellerInfo?.[0]?.travellerInfo?.[0] && (
                <div className="mb-4 p-3 border rounded">
                  <h6 className="fw-bold mb-2">Lead Guest Information</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Name:</strong> {
                        `${hotelBookingDetails.roomTravellerInfo[0].travellerInfo[0].Title} 
                         ${hotelBookingDetails.roomTravellerInfo[0].travellerInfo[0].FirstName} 
                         ${hotelBookingDetails.roomTravellerInfo[0].travellerInfo[0].LastName}`
                      }
                    </div>
                    <div className="col-md-6">
                      <strong>Email:</strong> {hotelBookingDetails.roomTravellerInfo[0].travellerInfo[0].Email}
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
            
            <Card.Footer className="bg-white">
              <div className="d-flex gap-3 justify-content-between align-items-center">
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  ← Back to Review
                </Button>
                
                <Button
                  variant="danger"
                  size="lg"
                  className="px-5"
                  onClick={handlePayment}
                  disabled={loading || roundedTotal <= 0}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      Pay ₹ {roundedTotal}
                    </>
                  )}
                </Button>
              </div>
              
              <div className="text-center mt-3">
                <small className="text-muted">
                  By clicking "Pay", you agree to our terms and conditions
                </small>
              </div>
            </Card.Footer>
          </Card>

          {/* Debug Information (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="shadow-sm border-warning">
              <Card.Header className="bg-warning">
                <strong>Debug Information (Development Only)</strong>
              </Card.Header>
              <Card.Body>
                <details>
                  <summary className="mb-3 fw-bold cursor-pointer">Formatted Hotel Booking Details</summary>
                  <pre className="small bg-light p-3 rounded" style={{ maxHeight: '300px', overflow: 'auto' }}>
                    {JSON.stringify(formatBookingData(hotelBookingDetails), null, 2)}
                  </pre>
                </details>
                <details>
                  <summary className="mb-3 fw-bold cursor-pointer">Original Hotel Booking Details</summary>
                  <pre className="small bg-light p-3 rounded" style={{ maxHeight: '300px', overflow: 'auto' }}>
                    {JSON.stringify(hotelBookingDetails, null, 2)}
                  </pre>
                </details>
                <details>
                  <summary className="mb-3 fw-bold cursor-pointer">Price Details</summary>
                  <pre className="small bg-light p-3 rounded">
                    {JSON.stringify(priceDetails, null, 2)}
                  </pre>
                </details>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelPaymentInfo;