import React, { useState } from 'react';
import { Card, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
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

  // ✅ GST Filtering Function - केवल Lead Passenger के लिए GST details रखता है
  const filterGSTForLeadPassengerOnly = (bookingData) => {
    // Clone the data to avoid mutation
    const filteredData = JSON.parse(JSON.stringify(bookingData));

    // Process HotelRoomsDetails structure
    if (filteredData.HotelRoomsDetails && Array.isArray(filteredData.HotelRoomsDetails)) {
      filteredData.HotelRoomsDetails.forEach((room, roomIndex) => {
        if (room.HotelPassenger && Array.isArray(room.HotelPassenger)) {
          room.HotelPassenger.forEach((passenger, passengerIndex) => {
            // Only keep GST details if this passenger is the lead passenger
            if (passenger.LeadPassenger !== "true" && passenger.LeadPassenger !== true) {
              // Remove GST fields for non-lead passengers
              passenger.GSTCompanyAddress = null;
              passenger.GSTCompanyContactNumber = null;
              passenger.GSTCompanyEmail = null;
              passenger.GSTCompanyName = null;
              passenger.GSTNumber = null;
            }
          });
        }
      });
    }

    // Process old roomTravellerInfo structure (fallback)
    if (filteredData.roomTravellerInfo && Array.isArray(filteredData.roomTravellerInfo)) {
      filteredData.roomTravellerInfo.forEach((room, roomIndex) => {
        if (room.travellerInfo && Array.isArray(room.travellerInfo)) {
          room.travellerInfo.forEach((traveller, travellerIndex) => {
            // Only keep GST details if this traveller is the lead passenger
            if (traveller.LeadPassenger !== true && traveller.LeadPassenger !== "true") {
              // Remove GST fields for non-lead passengers
              traveller.GSTCompanyAddress = null;
              traveller.GSTCompanyContactNumber = null;
              traveller.GSTCompanyEmail = null;
              traveller.GSTCompanyName = null;
              traveller.GSTNumber = null;
            }
          });
        }
      });
    }

    return filteredData;
  };

  // ✅ GST Filtering Verification Function
  const verifyGSTFiltering = (data) => {
    // Count lead passengers with GST
    let leadWithGST = 0;
    let nonLeadWithGST = 0;

    if (data.HotelRoomsDetails) {
      data.HotelRoomsDetails.forEach(room => {
        room.HotelPassenger?.forEach(passenger => {
          if (passenger.LeadPassenger === "true" && passenger.GSTNumber) {
            leadWithGST++;
          } else if (passenger.LeadPassenger !== "true" && passenger.GSTNumber) {
            nonLeadWithGST++;
          }
        });
      });
    }

    return { leadWithGST, nonLeadWithGST };
  };

  // ✅ Updated validation function for Postman structure
  const validateBookingPayload = (payload) => {
    const errors = [];

    // Basic payload structure validation
    if (!payload || typeof payload !== 'object') {
      errors.push('Invalid payload structure');
      return errors;
    }

    // Required top-level fields
    const requiredFields = {
      'ResultIndex': payload.ResultIndex,
      'HotelCode': payload.HotelCode,
      'HotelName': payload.HotelName,
      'SearchTokenId': payload.SearchTokenId,
      'HotelRoomsDetails': payload.HotelRoomsDetails
    };

    Object.entries(requiredFields).forEach(([field, value]) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`Missing or empty required field: ${field}`);
      }
    });

    // Validate HotelRoomsDetails structure
    if (!payload.HotelRoomsDetails || !Array.isArray(payload.HotelRoomsDetails)) {
      errors.push('HotelRoomsDetails must be an array');
      return errors;
    }

    if (payload.HotelRoomsDetails.length === 0) {
      errors.push('At least one room with passenger info is required');
      return errors;
    }

    let leadPassengerCount = 0;
    let totalPassengers = 0;

    payload.HotelRoomsDetails.forEach((room, roomIdx) => {
      // Validate RoomIndex
      if (!room.RoomIndex || typeof room.RoomIndex !== 'number') {
        errors.push(`Room ${roomIdx + 1}: RoomIndex must be a number`);
      }

      if (!room.HotelPassenger || !Array.isArray(room.HotelPassenger)) {
        errors.push(`Room ${roomIdx + 1}: HotelPassenger must be an array`);
        return;
      }

      if (room.HotelPassenger.length === 0) {
        errors.push(`Room ${roomIdx + 1}: At least one passenger is required`);
        return;
      }

      room.HotelPassenger.forEach((passenger, passengerIdx) => {
        totalPassengers++;

        // Check LeadPassenger (string in Postman structure)
        if (passenger.LeadPassenger === "true") {
          leadPassengerCount++;
        }

        // Required passenger fields
        const requiredPassengerFields = {
          'Title': passenger.Title,
          'FirstName': passenger.FirstName,
          'LastName': passenger.LastName,
          'Email': passenger.Email,
          'Phoneno': passenger.Phoneno,
          'PaxType': passenger.PaxType
        };

        Object.entries(requiredPassengerFields).forEach(([field, value]) => {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push(`Room ${roomIdx + 1}, Passenger ${passengerIdx + 1}: ${field} is required`);
          }
        });

        // PaxType validation (1=adult, 2=child, 3=infant)
        if (passenger.PaxType && ![1, 2, 3].includes(parseInt(passenger.PaxType))) {
          errors.push(`Room ${roomIdx + 1}, Passenger ${passengerIdx + 1}: Invalid PaxType (${passenger.PaxType}), must be 1, 2, or 3`);
        }

        // PAN validation for adults (PaxType = 1)
        if (passenger.PaxType === 1 && (!passenger.PAN || passenger.PAN.trim() === '' || passenger.PAN.trim() === 'null')) {
          errors.push(`Room ${roomIdx + 1}, Passenger ${passengerIdx + 1}: PAN is required for adults`);
        }

        // Email validation
        if (passenger.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.Email)) {
          errors.push(`Room ${roomIdx + 1}, Passenger ${passengerIdx + 1}: Invalid email format (${passenger.Email})`);
        }

        // Phone validation
        if (passenger.Phoneno && !/^[0-9]{10}$/.test(passenger.Phoneno.replace(/\D/g, ''))) {
          errors.push(`Room ${roomIdx + 1}, Passenger ${passengerIdx + 1}: Phone number must be 10 digits (${passenger.Phoneno})`);
        }
      });
    });

    // LeadPassenger validation
    if (leadPassengerCount !== 1) {
      errors.push(`Must have exactly 1 LeadPassenger, found ${leadPassengerCount}`);
    }

    if (totalPassengers === 0) {
      errors.push('No passengers found in booking');
    }

    return errors;
  };

  // ✅ Updated format function for Postman structure with GST filtering
  const formatBookingData = (bookingDetails) => {
    // First apply GST filtering
    const gstFilteredData = filterGSTForLeadPassengerOnly(bookingDetails);

    // Then continue with existing formatting logic
    const cleanedData = { ...gstFilteredData };

    // Ensure required top-level fields exist (following Postman structure)
    cleanedData.GuestNationality = cleanedData.GuestNationality || payload?.GuestNationality || reviewData?.GuestNationality || 'IN';
    cleanedData.NoOfRooms = cleanedData.NoOfRooms || "1";
    cleanedData.ClientReferenceNo = cleanedData.ClientReferenceNo || 0;
    cleanedData.IsVoucherBooking = cleanedData.IsVoucherBooking || "true";
    cleanedData.vendorCommission = cleanedData.vendorCommission || vendorCommission || 0;
    cleanedData.CouponDiscount = cleanedData.CouponDiscount || 0;
    cleanedData.UserIp = cleanedData.UserIp || "0.0.0.0";

    // ✅ Convert roomTravellerInfo to HotelRoomsDetails structure if needed
    if (cleanedData.roomTravellerInfo && !cleanedData.HotelRoomsDetails) {
      cleanedData.HotelRoomsDetails = cleanedData.roomTravellerInfo.map((room, index) => {
        const roomData = {
          RoomIndex: index + 1,
          HotelPassenger: []
        };

        if (room.travellerInfo && Array.isArray(room.travellerInfo)) {
          roomData.HotelPassenger = room.travellerInfo.map((traveller) => ({
            Title: String(traveller.Title || "Mr").trim(),
            FirstName: String(traveller.FirstName || "").trim(),
            MiddleName: String(traveller.MiddleName || "").trim(),
            LastName: String(traveller.LastName || "").trim(),
            Phoneno: String(traveller.Phoneno || "").replace(/\D/g, ''),
            Email: String(traveller.Email || "").trim().toLowerCase(),
            PaxType: parseInt(traveller.PaxType) || 1,
            LeadPassenger: traveller.LeadPassenger ? "true" : "false", // Convert to string
            Age: traveller.Age && !isNaN(traveller.Age) ? parseInt(traveller.Age) : 0,

            // Passport fields - always null for domestic bookings
            PassportNo: null,
            PassportIssueDate: null,
            PassportExpDate: null,

            // PAN - required for adults
            PAN: traveller.PAN ? String(traveller.PAN).trim().toUpperCase() : null,

            // ✅ GST fields - already filtered by filterGSTForLeadPassengerOnly
            GSTCompanyAddress: traveller.GSTCompanyAddress ? String(traveller.GSTCompanyAddress).trim() : null,
            GSTCompanyContactNumber: traveller.GSTCompanyContactNumber ? String(traveller.GSTCompanyContactNumber).trim() : null,
            GSTCompanyEmail: traveller.GSTCompanyEmail ? String(traveller.GSTCompanyEmail).trim() : null,
            GSTCompanyName: traveller.GSTCompanyName ? String(traveller.GSTCompanyName).trim() : null,
            GSTNumber: traveller.GSTNumber ? String(traveller.GSTNumber).trim() : null
          }));
        }

        return roomData;
      });

      // Remove old structure
      delete cleanedData.roomTravellerInfo;
    }

    // ✅ Process existing HotelRoomsDetails if present
    if (cleanedData.HotelRoomsDetails && Array.isArray(cleanedData.HotelRoomsDetails)) {
      cleanedData.HotelRoomsDetails = cleanedData.HotelRoomsDetails.map((room, index) => {
        const processedRoom = {
          RoomIndex: room.RoomIndex || (index + 1),
          HotelPassenger: []
        };

        if (room.HotelPassenger && Array.isArray(room.HotelPassenger)) {
          processedRoom.HotelPassenger = room.HotelPassenger.map((passenger) => {
            // Clean and format each passenger
            const processedPassenger = {
              Title: String(passenger.Title || "Mr").trim(),
              FirstName: String(passenger.FirstName || "").trim(),
              MiddleName: String(passenger.MiddleName || "").trim(),
              LastName: String(passenger.LastName || "").trim(),
              Phoneno: String(passenger.Phoneno || "").replace(/\D/g, ''),
              Email: String(passenger.Email || "").trim().toLowerCase(),
              PaxType: parseInt(passenger.PaxType) || 1,
              LeadPassenger: passenger.LeadPassenger === true || passenger.LeadPassenger === "true" ? "true" : "false",
              Age: passenger.Age && !isNaN(passenger.Age) ? parseInt(passenger.Age) : 0,

              // Passport fields - always null for domestic bookings
              PassportNo: null,
              PassportIssueDate: null,
              PassportExpDate: null,

              // PAN - required for adults, validate format
              PAN: passenger.PAN && passenger.PAN.trim() !== '' ? String(passenger.PAN).trim().toUpperCase() : null,

              // ✅ GST fields - already filtered by filterGSTForLeadPassengerOnly
              GSTCompanyAddress: passenger.GSTCompanyAddress ? String(passenger.GSTCompanyAddress).trim() : null,
              GSTCompanyContactNumber: passenger.GSTCompanyContactNumber ? String(passenger.GSTCompanyContactNumber).trim() : null,
              GSTCompanyEmail: passenger.GSTCompanyEmail ? String(passenger.GSTCompanyEmail).trim() : null,
              GSTCompanyName: passenger.GSTCompanyName ? String(passenger.GSTCompanyName).trim() : null,
              GSTNumber: passenger.GSTNumber ? String(passenger.GSTNumber).trim() : null
            };

            return processedPassenger;
          });
        }

        return processedRoom;
      });
    }

    return cleanedData;
  };

  // ✅ Enhanced API error handler
  const handleApiError = (error, context = 'API') => {
    let errorMessage = `${context} failed. Please try again.`;
    let errorDetails = null;

    if (error?.response) {
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
      errorMessage = 'Network error. Please check your internet connection and try again.';
      errorDetails = { request: 'No response received' };
    } else {
      errorMessage = error?.message || `${context} failed due to an unexpected error.`;
      errorDetails = { message: error?.message };
    }

    return { message: errorMessage, details: errorDetails };
  };

  // ✅ Show error toast function
  const showErrorToast = (message, additionalInfo = '') => {
    const toastMessage = additionalInfo ? `${message}\n${additionalInfo}` : message;

    toast.error(toastMessage, {
      position: "top-right",
      autoClose: 8000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        whiteSpace: 'pre-line',
        wordBreak: 'break-word'
      }
    });
  };

  // ✅ Show success toast function
  const showSuccessToast = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // ✅ Updated handlePayment function with React Toastify instead of page navigation
  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const gstFilteredData = filterGSTForLeadPassengerOnly(hotelBookingDetails);
      verifyGSTFiltering(gstFilteredData);

      const formattedBookingData = formatBookingData(gstFilteredData);
      const validationErrors = validateBookingPayload(formattedBookingData);

      if (validationErrors.length > 0) {
        const errorMessage = `Booking validation failed:\n• ${validationErrors.join('\n• ')}`;
        setError(errorMessage);
        showErrorToast('Booking Validation Failed', validationErrors.join('\n• '));
        setLoading(false);
        return;
      }

      // ✅ PAYLOAD CONSOLE - Final booking data with GST filtering
      console.log('📦 Final booking payload with GST filtering:', formattedBookingData);

      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        const errorMsg = 'Payment system failed to load. Please refresh and try again.';
        setError(errorMsg);
        showErrorToast('Payment System Error', errorMsg);
        setLoading(false);
        return;
      }

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
              const finalPayload = { ...formattedBookingData };

              // ✅ PAYLOAD CONSOLE - Final booking payload (sanitized for security)
              console.log('📦 Final booking payload (sanitized):', {
                ...finalPayload,
                HotelRoomsDetails: finalPayload.HotelRoomsDetails?.map(room => ({
                  ...room,
                  HotelPassenger: room.HotelPassenger?.map(passenger => ({
                    ...passenger,
                    PAN: passenger.PAN ? '***HIDDEN***' : null,
                    Email: passenger.Email ? passenger.Email.replace(/(.{2}).*(@.*)/, '$1***$2') : null,
                    GSTNumber: passenger.GSTNumber ? '***HIDDEN***' : null
                  }))
                }))
              });

              // ✅ FIXED: Hotel booking API call with proper status check
              try {
                const bookingResponse = await bookHotel(finalPayload);

                // ✅ PAYLOAD CONSOLE - Booking API response
                console.log('📦 Booking API response:', bookingResponse);

                // ✅ FIXED: Updated robust booking status check for your specific API response
                const isBookingSuccessful =
                  // Primary check for your API response structure
                  (bookingResponse?.message === "Hotel booking processed successfully") ||

                  // Additional success message patterns (case-insensitive)
                  (bookingResponse?.message &&
                    bookingResponse.message.toLowerCase().includes('successfully')) ||
                  (bookingResponse?.message &&
                    bookingResponse.message.toLowerCase().includes('processed successfully')) ||
                  (bookingResponse?.message &&
                    bookingResponse.message.toLowerCase().includes('confirmed')) ||

                  // Legacy checks (keeping for backward compatibility)
                  bookingResponse?.BookingStatus?.toLowerCase() === 'confirmed' ||
                  bookingResponse?.Status?.toLowerCase() === 'success' ||
                  bookingResponse?.success === true;

                // ✅ FIXED: Check for required booking data from your API
                const hasRequiredBookingData =
                  bookingResponse?.userId &&
                  bookingResponse?.SearchTokenId &&
                  bookingResponse?.UserIp;

                // ✅ ADDED: Additional validation for complete booking response
                const isCompleteBookingResponse =
                  bookingResponse?.message &&
                  hasRequiredBookingData;

                // ✅ FIXED: Final booking success validation
                if (isBookingSuccessful && isCompleteBookingResponse) {
                  // ✅ Show success toast and navigate to confirmation page
                  showSuccessToast('🎉 Hotel booking confirmed successfully!');

                  // ✅ Navigate to confirmation page with all necessary data
                  navigate('/hotel/confirmation', {
                    state: {
                      booking: bookingResponse,
                      amount: roundedTotal,
                      reviewData,
                      hotelDetails: { 
                        name: formattedBookingData?.HotelName,
                        code: formattedBookingData?.HotelCode,
                      },
                      paymentDetails: {
                        orderId: response.razorpay_order_id,
                        paymentId: response.razorpay_payment_id
                      },
                      // ✅ Your specific booking confirmation details
                      confirmationDetails: {
                        userId: bookingResponse.userId,
                        searchTokenId: bookingResponse.SearchTokenId,
                        bookingId: bookingResponse.BookingID,          // ✅ Added
                        userIp: bookingResponse.UserIp,
                        message: bookingResponse.message,
                        bookingTime: new Date().toISOString()
                      }
                    }
                  });


                } else {
                  // ❌ Handle booking failure with toast - NO PAGE NAVIGATION
                  let errorMessage = 'Booking failed. Please contact support with your payment details.';

                  // ✅ Better error message extraction for your API
                  if (bookingResponse?.Error?.ErrorMessage) {
                    errorMessage = bookingResponse.Error.ErrorMessage;
                  } else if (bookingResponse?.error?.message) {
                    errorMessage = bookingResponse.error.message;
                  } else if (bookingResponse?.message && !bookingResponse.message.toLowerCase().includes('successfully')) {
                    errorMessage = `Booking Issue: ${bookingResponse.message}`;
                  } else if (typeof bookingResponse?.error === 'string') {
                    errorMessage = bookingResponse.error;
                  } else if (!hasRequiredBookingData) {
                    errorMessage = 'Booking response is missing required confirmation data (userId, SearchTokenId, or UserIp). Please contact support.';
                  } else if (!isBookingSuccessful) {
                    errorMessage = 'Booking status could not be confirmed. Please contact support to verify your booking.';
                  }

                  // ✅ Show error toast instead of navigating
                  showErrorToast('❌ Booking Failed', errorMessage);
                  setError(`Booking Failed: ${errorMessage}`);

                  // ✅ Additional info for debugging (optional - can be removed in production)
                  console.error('Booking failure details:', {
                    isBookingSuccessful,
                    hasRequiredBookingData,
                    isCompleteBookingResponse,
                    responseMessage: bookingResponse?.message,
                    fullResponse: bookingResponse
                  });
                }
              } catch (bookingError) {
                // ✅ Handle booking API error with toast - NO PAGE NAVIGATION
                const { message: errorMessage, details } = handleApiError(bookingError, 'Hotel Booking');
                setError(`Booking Error: ${errorMessage}`);
                showErrorToast('❌ Booking API Error', errorMessage);

                console.error('Booking API Error:', { error: bookingError, details });
              }
            } else {
              // ✅ Handle payment validation failure with toast - NO PAGE NAVIGATION
              const validationError = validation?.message || 'Payment validation failed.';
              setError(validationError);
              showErrorToast('❌ Payment Validation Failed', validationError);
            }
          } catch (err) {
            // ✅ Handle payment processing error with toast
            const { message: errorMessage } = handleApiError(err, 'Payment Processing');
            setError(errorMessage);
            showErrorToast('❌ Payment Processing Error', errorMessage);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formattedBookingData?.HotelRoomsDetails?.[0]?.HotelPassenger?.[0]?.FirstName || 'Guest',
          email: formattedBookingData?.HotelRoomsDetails?.[0]?.HotelPassenger?.[0]?.Email || 'guest@example.com',
          contact: formattedBookingData?.HotelRoomsDetails?.[0]?.HotelPassenger?.[0]?.Phoneno || '9999999999',
        },
        notes: {
          address: 'Hotel Booking Payment',
          hotelName: formattedBookingData?.HotelName || 'Hotel Booking',
        },
        theme: {
          color: '#c90d26',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            showErrorToast('⚠️ Payment Cancelled', 'Payment was cancelled by user');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        const failureMessage = `Payment failed: ${response.error.description || 'Unknown error'}`;
        setError(failureMessage);
        showErrorToast('❌ Payment Failed', response.error.description || 'Unknown payment error occurred');
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      // ✅ Handle payment initialization error with toast
      const { message: errorMessage } = handleApiError(err, 'Payment Initialization');
      setError(errorMessage);
      showErrorToast('❌ Payment Initialization Failed', errorMessage);
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

  // ✅ Helper function to get guest count from new structure
  const getGuestCount = () => {
    if (hotelBookingDetails?.HotelRoomsDetails) {
      return hotelBookingDetails.HotelRoomsDetails.reduce((total, room) =>
        total + (room.HotelPassenger?.length || 0), 0
      );
    }
    // Fallback for old structure
    if (hotelBookingDetails?.roomTravellerInfo) {
      return hotelBookingDetails.roomTravellerInfo.reduce((total, room) =>
        total + (room.travellerInfo?.length || 0), 0
      );
    }
    return 0;
  };

  // ✅ Helper function to get lead passenger info
  const getLeadPassengerInfo = () => {
    if (hotelBookingDetails?.HotelRoomsDetails) {
      const leadRoom = hotelBookingDetails.HotelRoomsDetails.find(room =>
        room.HotelPassenger?.some(passenger => passenger.LeadPassenger === "true" || passenger.LeadPassenger === true)
      );
      if (leadRoom) {
        return leadRoom.HotelPassenger.find(passenger =>
          passenger.LeadPassenger === "true" || passenger.LeadPassenger === true
        );
      }
      // Fallback to first passenger
      return hotelBookingDetails.HotelRoomsDetails[0]?.HotelPassenger?.[0];
    }
    // Fallback for old structure
    if (hotelBookingDetails?.roomTravellerInfo) {
      return hotelBookingDetails.roomTravellerInfo[0]?.travellerInfo?.[0];
    }
    return null;
  };

  const leadPassenger = getLeadPassengerInfo();

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col">
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
                    <div><strong>Rooms:</strong> {hotelBookingDetails?.NoOfRooms || hotelBookingDetails?.HotelRoomsDetails?.length || 1}</div>
                    <div><strong>Guests:</strong> {getGuestCount()}</div>
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
              {leadPassenger && (
                <div className="mb-4 p-3 border rounded">
                  <h6 className="fw-bold mb-2">Lead Guest Information</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Name:</strong> {
                        `${leadPassenger.Title} ${leadPassenger.FirstName} ${leadPassenger.LastName}`
                      }
                    </div>
                    <div className="col-md-6">
                      <strong>Email:</strong> {leadPassenger.Email}
                    </div>
                  </div>
                  {/* ✅ Show GST info if available for lead passenger */}
                  {leadPassenger.GSTNumber && (
                    <div className="row mt-2">
                      <div className="col-md-6">
                        <strong>GST Number:</strong> {leadPassenger.GSTNumber}
                      </div>
                      <div className="col-md-6">
                        <strong>Company:</strong> {leadPassenger.GSTCompanyName}
                      </div>
                    </div>
                  )}
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
        </div>
      </div>
    </div>
  );
};

export default HotelPaymentInfo;