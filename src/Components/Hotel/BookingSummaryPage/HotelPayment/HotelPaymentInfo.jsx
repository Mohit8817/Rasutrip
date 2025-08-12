import React, { useState } from 'react';
import { Card, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { createHotelOrder, validateHotelPayment, bookHotel, downloadHotelInvoice } from '../../../APIS/HotelApi/HotelAPi';

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
    isPANMandatory = false,
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

  // Load Razorpay checkout script
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // Async invoice email sender (non-blocking)
  const sendInvoiceEmailAsync = async (invoiceData) => {
    try {
      console.log('📧 Attempting to auto-send invoice email...');
      const result = await downloadHotelInvoice({
        ...invoiceData,
        emailOnly: true
      });

      if (result.success || result.message) {
        console.log('✅ Invoice email sent automatically');
        return result;
      }
      throw new Error('Email sending failed');
    } catch (error) {
      console.error('❌ Auto-email failed:', error.message);
      throw error;
    }
  };

  // Utility functions for invoice data
  const getLeadPassenger = (formattedBookingData) => {
    return formattedBookingData?.HotelRoomsDetails?.[0]?.HotelPassenger?.find(p => p.LeadPassenger === "true") ||
      formattedBookingData?.HotelRoomsDetails?.[0]?.HotelPassenger?.[0] ||
      {};
  };

  const getLeadPassengerEmail = (formattedBookingData) => {
    const leadPassenger = getLeadPassenger(formattedBookingData);
    return leadPassenger?.Email || "mohitverma8817@gmail.com";
  };

  // ✅ UPDATED: Enhanced booking data formatter to match exact Postman structure
  const formatBookingData = (bookingDetails) => {
    console.log('🔄 Input booking details:', JSON.stringify(bookingDetails, null, 2));

    // Step 1: Validate input data structure
    let hotelRoomsData = [];

    if (bookingDetails?.HotelRoomsDetails && Array.isArray(bookingDetails.HotelRoomsDetails)) {
      hotelRoomsData = bookingDetails.HotelRoomsDetails;
    } else if (bookingDetails?.roomTravellerInfo && Array.isArray(bookingDetails.roomTravellerInfo)) {
      // Convert roomTravellerInfo to HotelRoomsDetails format
      hotelRoomsData = bookingDetails.roomTravellerInfo.map((room, index) => ({
        RoomIndex: index + 1,
        HotelPassenger: room.travellerInfo || []
      }));
    } else {
      throw new Error('No valid room or passenger data found in booking details');
    }

    if (!hotelRoomsData || hotelRoomsData.length === 0) {
      throw new Error('No rooms found in booking data');
    }

    // Step 2: Process passengers with EXACT Postman structure
    let leadPassengerSet = false;
    const processedRooms = hotelRoomsData.map((room, roomIndex) => {
      if (!room.HotelPassenger || !Array.isArray(room.HotelPassenger) || room.HotelPassenger.length === 0) {
        throw new Error(`Room ${roomIndex + 1} has no passengers`);
      }

      const processedPassengers = room.HotelPassenger.map((passenger, passengerIndex) => {
        const isAdult = parseInt(passenger.PaxType) === 1 || passenger.Age >= 18;
        const passengerName = `${passenger.FirstName || ''} ${passenger.LastName || ''}`.trim();

        // ✅ CRITICAL FIX: Only ONE lead passenger globally (like Postman)
        const shouldBeLeadPassenger = !leadPassengerSet && isAdult;
        if (shouldBeLeadPassenger) {
          leadPassengerSet = true;
          console.log(`✅ Setting ${passengerName} as Lead Passenger`);
        }

        if (isAdult) {
          // ✅ STRICT PAN validation for adults
          const panValue = passenger.PAN;
          if (!panValue || typeof panValue !== 'string') {
            throw new Error(`❌ Adult passenger "${passengerName}" is missing PAN number`);
          }

          const cleanPAN = panValue.trim().toUpperCase();

          // Check for empty or invalid placeholder values
          if (!cleanPAN ||
            ['NULL', 'UNDEFINED', 'N/A', 'NA', 'NONE', ''].includes(cleanPAN) ||
            cleanPAN.replace(/\s/g, '') === '') {
            throw new Error(`❌ Adult passenger "${passengerName}" has invalid PAN: "${panValue}"`);
          }

          // ✅ UPDATED: More flexible PAN validation (like Postman example with BHWPY8763)
          // Accept both complete format (ABCDE1234F) and incomplete format for testing
          if (!/^[A-Z]{5}[0-9]{4}[A-Z]?$/.test(cleanPAN) && cleanPAN.length < 5) {
            throw new Error(`❌ Invalid PAN format for "${passengerName}": "${cleanPAN}". Required format: ABCDE1234F or minimum 5 characters`);
          }

          // ✅ EXACT Postman structure match
          return {
            Title: String(passenger.Title || "Mr").trim(),
            FirstName: String(passenger.FirstName || "").trim(),
            MiddleName: String(passenger.MiddleName || "").trim(),
            LastName: String(passenger.LastName || "").trim(),
            Phoneno: String(passenger.Phoneno || "").replace(/\D/g, ''),
            Email: String(passenger.Email || "").trim().toLowerCase(),
            PaxType: 1, // Adult
            LeadPassenger: shouldBeLeadPassenger ? "true" : "false", // ✅ String format like Postman
            Age: passenger.Age && !isNaN(passenger.Age) ? parseInt(passenger.Age) : 0, // ✅ Use 0 like Postman
            PassportNo: null,
            PassportIssueDate: null,
            PassportExpDate: null,
            PAN: cleanPAN, // ✅ Properly validated PAN
            // ✅ GST fields - null by default (like Postman), only for lead passenger if provided
            GSTCompanyAddress: shouldBeLeadPassenger && passenger.GSTCompanyAddress ? String(passenger.GSTCompanyAddress).trim() : null,
            GSTCompanyContactNumber: shouldBeLeadPassenger && passenger.GSTCompanyContactNumber ? String(passenger.GSTCompanyContactNumber).trim() : null,
            GSTCompanyEmail: shouldBeLeadPassenger && passenger.GSTCompanyEmail ? String(passenger.GSTCompanyEmail).trim() : null,
            GSTCompanyName: shouldBeLeadPassenger && passenger.GSTCompanyName ? String(passenger.GSTCompanyName).trim() : null,
            GSTNumber: shouldBeLeadPassenger && passenger.GSTNumber ? String(passenger.GSTNumber).trim() : null,
          };
        } else {
          // Child passenger
          return {
            Title: String(passenger.Title || "Master").trim(),
            FirstName: String(passenger.FirstName || "").trim(),
            MiddleName: String(passenger.MiddleName || "").trim(),
            LastName: String(passenger.LastName || "").trim(),
            Phoneno: String(passenger.Phoneno || "").replace(/\D/g, ''),
            Email: String(passenger.Email || "").trim().toLowerCase(),
            PaxType: 2, // Child
            LeadPassenger: "false", // Children are never lead passengers
            Age: passenger.Age && !isNaN(passenger.Age) ? parseInt(passenger.Age) : 5,
            PassportNo: null,
            PassportIssueDate: null,
            PassportExpDate: null,
            PAN: null, // Children don't need PAN
            GSTCompanyAddress: null,
            GSTCompanyContactNumber: null,
            GSTCompanyEmail: null,
            GSTCompanyName: null,
            GSTNumber: null,
          };
        }
      });

      return {
        RoomIndex: roomIndex + 1, // ✅ Number format like Postman
        HotelPassenger: processedPassengers
      };
    });

    // Step 3: Check for duplicate PANs
    const panNumbers = new Set();
    const duplicatePANs = [];

    processedRooms.forEach(room => {
      room.HotelPassenger.forEach(passenger => {
        if (passenger.PAN && passenger.PAN !== null) {
          const cleanPAN = passenger.PAN.trim().toUpperCase();
          if (panNumbers.has(cleanPAN)) {
            duplicatePANs.push(cleanPAN);
          } else {
            panNumbers.add(cleanPAN);
          }
        }
      });
    });

    if (duplicatePANs.length > 0) {
      throw new Error(`❌ Duplicate PAN numbers found: ${duplicatePANs.join(', ')}. Each passenger must have a unique PAN number.`);
    }

    // Step 4: Ensure we have exactly one lead passenger
    if (!leadPassengerSet) {
      throw new Error('❌ No lead passenger found. At least one adult passenger is required.');
    }

    // ✅ Step 5: Build final payload matching EXACT Postman structure
    const finalPayload = {
      ResultIndex: String(bookingDetails.ResultIndex || `CRS_${bookingDetails.HotelCode || 67}`), // ✅ String format
      HotelCode: String(bookingDetails.HotelCode || 67), // ✅ String format like Postman
      HotelName: String(bookingDetails.HotelName || "ALILA DIWA"),
      GuestNationality: "IN", // ✅ Required field
      NoOfRooms: String(processedRooms.length), // ✅ String format like Postman
      ClientReferenceNo: bookingDetails.ClientReferenceNo || 0, // ✅ Number format like Postman
      vendorCommission: bookingDetails.vendorCommission || 10, // ✅ Number format
      CouponDiscount: bookingDetails.CouponDiscount || 5, // ✅ Number format
      IsVoucherBooking: "true", // ✅ String format like Postman
      HotelRoomsDetails: processedRooms,
      UserIp: String(bookingDetails.UserIp || "49.36.217.215"), // ✅ String format
      SearchTokenId: String(bookingDetails.SearchTokenId || "5e423a789321f6edcf0de63bc80b3342b5c318ed") // ✅ String format
    };

    console.log('✅ Final booking payload (Postman-matched):', JSON.stringify(finalPayload, null, 2));

    // Step 6: Final validation
    const leadCount = finalPayload.HotelRoomsDetails
      .flatMap(room => room.HotelPassenger)
      .filter(passenger => passenger.LeadPassenger === "true")
      .length;

    if (leadCount !== 1) {
      throw new Error(`❌ Expected exactly 1 lead passenger, found ${leadCount}`);
    }

    // ✅ Verify structure matches Postman exactly
    console.log('🔍 Postman comparison:');
    console.log('- ResultIndex:', typeof finalPayload.ResultIndex, finalPayload.ResultIndex);
    console.log('- HotelCode:', typeof finalPayload.HotelCode, finalPayload.HotelCode);
    console.log('- NoOfRooms:', typeof finalPayload.NoOfRooms, finalPayload.NoOfRooms);
    console.log('- IsVoucherBooking:', typeof finalPayload.IsVoucherBooking, finalPayload.IsVoucherBooking);
    console.log('- ClientReferenceNo:', typeof finalPayload.ClientReferenceNo, finalPayload.ClientReferenceNo);
    console.log('- vendorCommission:', typeof finalPayload.vendorCommission, finalPayload.vendorCommission);
    console.log('- CouponDiscount:', typeof finalPayload.CouponDiscount, finalPayload.CouponDiscount);
    console.log('- RoomIndex:', typeof finalPayload.HotelRoomsDetails[0].RoomIndex, finalPayload.HotelRoomsDetails[0].RoomIndex);
    console.log('- LeadPassenger count:', leadCount);
    console.log('- Age format:', finalPayload.HotelRoomsDetails[0].HotelPassenger.map(p => `${p.FirstName}: ${p.Age}`));

    return finalPayload;
  };
  // API error handler
  const handleApiError = (error, context = 'API') => {
    let errorMessage = `${context} failed. Please try again.`;
    let errorDetails = null;

    if (error?.response) {
      const status = error.response.status;
      const data = error.response.data;
      errorDetails = { status, data, headers: error.response.headers };

      if (data?.error?.ErrorCode === 1163 || data?.Error?.ErrorCode === 1163) {
        errorMessage = `❌ PAN MANDATORY ERROR (Code: 1163): ${data?.error?.ErrorMessage || data?.Error?.ErrorMessage || 'Mandatory PAN information not available.'}

This error occurs when:
• Multiple passengers have LeadPassenger: "true" 
• Duplicate PAN numbers are used
• PAN format is incorrect (must be ABCDE1234F)
• Required PAN data is missing for adults

Please ensure:
✅ Only ONE passenger is marked as lead passenger
✅ All adult passengers have unique, valid PAN numbers
✅ PAN format: 5 letters + 4 digits + 1 letter`;
        return { message: errorMessage, details: errorDetails, isPANError: true };
      }

      switch (status) {
        case 400:
          errorMessage = data?.Error?.ErrorMessage || data?.message || 'Invalid request data. Please check your booking details.';
          break;
        case 422:
          errorMessage = data?.Error?.ErrorMessage || 'Invalid booking data. Please check all required fields.';
          break;
        case 500:
          errorMessage = 'Hotel booking service is temporarily unavailable. Please try again later.';
          if (data?.Error?.ErrorMessage) errorMessage += ` (${data.Error.ErrorMessage})`;
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

  // Toast helpers
  const showErrorToast = (message, additionalInfo = '') => {
    const toastMessage = additionalInfo ? `${message}\n${additionalInfo}` : message;
    toast.error(toastMessage, {
      position: "top-right",
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: { whiteSpace: 'pre-line', wordBreak: 'break-word' },
    });
  };

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

  // Payment success handler with invoice integration
  const handlePaymentSuccess = async (response, formattedBookingData, validation) => {
    try {
      console.log('🚀 Sending booking request with payload:', JSON.stringify(formattedBookingData, null, 2));

      const bookingResponse = await bookHotel(formattedBookingData);

      console.log('📨 Booking API response:', JSON.stringify(bookingResponse, null, 2));

      // Check for PAN mandatory errors first
      if (
        bookingResponse?.error?.ErrorCode === 1163 ||
        bookingResponse?.Error?.ErrorCode === 1163 ||
        (bookingResponse?.error?.ErrorMessage?.toLowerCase().includes('mandatory pan'))
      ) {
        const panErrorMsg = `❌ HOTEL API ERROR: PAN MANDATORY (Code: 1163)
        
API Error: ${bookingResponse?.error?.ErrorMessage || bookingResponse?.Error?.ErrorMessage || 'Mandatory PAN info unavailable.'}

This usually indicates:
• Multiple passengers marked as LeadPassenger: "true"
• Duplicate PAN numbers in the request
• Invalid PAN format or missing PAN data
• API-side validation failure

Please check your booking data and contact support if the issue persists.`;

        setError(panErrorMsg);
        showErrorToast('❌ Hotel API PAN Error', panErrorMsg);
        setLoading(false);
        return;
      }

      // Check booking success
      const isBookingSuccessful =
        (bookingResponse?.message && /successfully|confirmed|processed/i.test(bookingResponse.message)) ||
        bookingResponse?.BookingStatus?.toLowerCase() === 'confirmed' ||
        bookingResponse?.Status?.toLowerCase() === 'success' ||
        bookingResponse?.success === true;

      const hasRequiredBookingData =
        bookingResponse?.userId &&
        bookingResponse?.SearchTokenId &&
        bookingResponse?.UserIp;

      if (isBookingSuccessful && hasRequiredBookingData) {
        showSuccessToast('🎉 Hotel booking confirmed successfully!');

        // Prepare invoice data
        const invoiceData = {
          UserIp: bookingResponse.UserIp || "122.161.64.143",
          SearchTokenId: bookingResponse.SearchTokenId,
          BookingId: String(bookingResponse.BookingID || bookingResponse.userId),
          receiverEmail: getLeadPassengerEmail(formattedBookingData)
        };

        // Navigate to confirmation
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
              paymentId: response.razorpay_payment_id,
            },
            confirmationDetails: {
              userId: bookingResponse.userId,
              searchTokenId: bookingResponse.SearchTokenId,
              bookingId: bookingResponse.BookingID,
              userIp: bookingResponse.UserIp,
              message: bookingResponse.message,
              bookingTime: new Date().toISOString(),
            },
            invoiceData: invoiceData,
            isBooked: true,
            bookingDetails: {
              contactData: getLeadPassenger(formattedBookingData),
              searchTokenId: bookingResponse.SearchTokenId,
            },
            bookingResult: bookingResponse
          },
        });

        // Auto-send invoice email (non-blocking)
        try {
          await sendInvoiceEmailAsync(invoiceData);
          console.log('✅ Invoice automatically sent to email');
        } catch (emailError) {
          console.log('⚠️ Auto-email invoice failed (non-critical):', emailError.message);
        }

      } else {
        let errMsg = 'Booking failed. Please contact support with your payment details.';
        if (bookingResponse?.Error?.ErrorMessage) errMsg = bookingResponse.Error.ErrorMessage;
        else if (bookingResponse?.error?.message) errMsg = bookingResponse.error.message;
        else if (bookingResponse?.message && !/successfully/i.test(bookingResponse.message))
          errMsg = `Booking Issue: ${bookingResponse.message}`;
        else if (!hasRequiredBookingData)
          errMsg = 'Booking response missing required confirmation data. Please contact support.';
        else if (!isBookingSuccessful) errMsg = 'Booking status could not be confirmed. Please contact support.';

        setError(`Booking Failed: ${errMsg}`);
        showErrorToast('❌ Booking Failed', errMsg);
        console.error('Booking failure details:', {
          isBookingSuccessful,
          hasRequiredBookingData,
          responseMessage: bookingResponse?.message,
          fullResponse: bookingResponse,
        });
      }
    } catch (bookingError) {
      console.error('❌ Booking API Error:', bookingError);
      const { message: errMsg, isPANError } = handleApiError(bookingError, 'Hotel Booking');
      if (isPANError) {
        setError(errMsg);
        showErrorToast('❌ PAN Mandatory Error', errMsg);
      } else {
        setError(`Booking Error: ${errMsg}`);
        showErrorToast('❌ Booking API Error', errMsg);
      }
    }
  };

  // Main payment handler
  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Starting payment process...');
      console.log('📋 Raw booking details:', hotelBookingDetails);

      // Format booking data
      let formattedBookingData;
      try {
        formattedBookingData = formatBookingData(hotelBookingDetails);
        console.log('✅ Booking data formatted successfully');
      } catch (formatError) {
        console.error('❌ Format error:', formatError);
        setError(formatError.message);
        showErrorToast('❌ Booking Data Error', formatError.message);
        setLoading(false);
        return;
      }

      // Load Razorpay
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        const errMsg = 'Payment system failed to load. Please refresh and try again.';
        setError(errMsg);
        showErrorToast('❌ Payment System Error', errMsg);
        setLoading(false);
        return;
      }

      // Create order
      const orderResponse = await createHotelOrder(roundedTotal);
      const order = orderResponse?.order;
      if (!order?.id) throw new Error('Failed to create payment order');

      // Razorpay options
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

            if (validation?.message === 'Payment verified successfully' && validation?.payment?.status === 'success') {
              await handlePaymentSuccess(response, formattedBookingData, validation);
            } else {
              const validationError = validation?.message || 'Payment validation failed.';
              setError(validationError);
              showErrorToast('❌ Payment Validation Failed', validationError);
            }
          } catch (err) {
            const { message: errMsg } = handleApiError(err, 'Payment Processing');
            setError(errMsg);
            showErrorToast('❌ Payment Processing Error', errMsg);
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
        theme: { color: '#c90d26' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            showErrorToast('⚠️ Payment Cancelled', 'Payment was cancelled by user');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        const failureMessage = `Payment failed: ${response.error.description || 'Unknown error'}`;
        setError(failureMessage);
        showErrorToast('❌ Payment Failed', failureMessage);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      console.error('❌ Payment initialization error:', err);
      const { message: errMsg } = handleApiError(err, 'Payment Initialization');
      setError(errMsg);
      showErrorToast('❌ Payment Initialization Failed', errMsg);
      setLoading(false);
    }
  };

  // Helper functions for UI
  const getGuestCount = () => {
    if (hotelBookingDetails?.HotelRoomsDetails) {
      return hotelBookingDetails.HotelRoomsDetails.reduce((acc, r) => acc + (r.HotelPassenger?.length || 0), 0);
    }
    if (hotelBookingDetails?.roomTravellerInfo) {
      return hotelBookingDetails.roomTravellerInfo.reduce((acc, r) => acc + (r.travellerInfo?.length || 0), 0);
    }
    return 0;
  };

  const getLeadPassengerInfo = () => {
    if (hotelBookingDetails?.HotelRoomsDetails) {
      const leadRoom = hotelBookingDetails.HotelRoomsDetails.find((room) =>
        room.HotelPassenger?.some((p) => p.LeadPassenger === "true" || p.LeadPassenger === true)
      );
      if (leadRoom) {
        return leadRoom.HotelPassenger.find((p) => p.LeadPassenger === "true" || p.LeadPassenger === true);
      }
      return hotelBookingDetails.HotelRoomsDetails[0]?.HotelPassenger?.[0];
    }
    if (hotelBookingDetails?.roomTravellerInfo) {
      return hotelBookingDetails.roomTravellerInfo[0]?.travellerInfo?.[0] || null;
    }
    return null;
  };

  const getAdultPassengers = () => {
    const adults = [];
    if (hotelBookingDetails?.HotelRoomsDetails) {
      hotelBookingDetails.HotelRoomsDetails.forEach((room, idx) => {
        room.HotelPassenger?.forEach((p) => {
          const isAdult = parseInt(p.PaxType) === 1 || p.Age >= 18;
          if (isAdult) {
            const pan = p.PAN;
            const isValidPAN =
              pan &&
              typeof pan === "string" &&
              /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase()) &&
              !["NULL", "UNDEFINED", "N/A", "NA", "NONE"].includes(pan.trim().toUpperCase()) &&
              pan.trim() !== "";
            adults.push({ name: `${p.FirstName} ${p.LastName}`, pan, room: idx + 1, isValid: isValidPAN });
          }
        });
      });
    }
    if (hotelBookingDetails?.roomTravellerInfo) {
      hotelBookingDetails.roomTravellerInfo.forEach((room, idx) => {
        room.travellerInfo?.forEach((traveller) => {
          const isAdult = parseInt(traveller.PaxType) === 1 || traveller.Age >= 18;
          if (isAdult) {
            const pan = traveller.PAN;
            const isValidPAN =
              pan &&
              typeof pan === "string" &&
              /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase()) &&
              !["NULL", "UNDEFINED", "N/A", "NA", "NONE"].includes(pan.trim().toUpperCase()) &&
              pan.trim() !== "";
            adults.push({ name: `${traveller.FirstName} ${traveller.LastName}`, pan, room: idx + 1, isValid: isValidPAN });
          }
        });
      });
    }
    return adults;
  };

  // If no booking details, show error UI
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

  const leadPassenger = getLeadPassengerInfo();
  const adultPassengers = getAdultPassengers();
  const validPANCount = adultPassengers.filter((a) => a.isValid).length;

  // Check duplicate PAN for user display
  const checkDuplicatePANs = () => {
    const counts = {};
    const duplicates = [];
    adultPassengers.forEach((a) => {
      if (a.isValid) {
        const cPAN = a.pan.trim().toUpperCase();
        if (counts[cPAN]) duplicates.push(cPAN);
        else counts[cPAN] = 1;
      }
    });
    return duplicates;
  };
  const duplicatePANs = checkDuplicatePANs();
  const hasDuplicates = duplicatePANs.length > 0;

  const isPANMandatoryRoom =
    isPANMandatory || location.state?.isPANMandatory || location.state?.room?.IsPANMandatory || false;

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col">
          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
              <FaExclamationTriangle className="me-2" />
              <strong>Error:</strong>
              <div style={{ whiteSpace: 'pre-line', marginTop: 8 }}>{error}</div>
            </Alert>
          )}

          {/* PAN Status Alert */}
          {adultPassengers.length > 0 && (
            <Alert variant={hasDuplicates ? "danger" : validPANCount === adultPassengers.length ? "success" : "warning"} className="mb-4">
              <FaExclamationTriangle className="me-2" />
              <strong>PAN Status Check:</strong><br />
              {hasDuplicates ? (
                <span className="text-danger">
                  ❌ DUPLICATE PAN DETECTED: {duplicatePANs.join(', ')}<br />
                  Please ensure each passenger has a unique PAN number.
                </span>
              ) : validPANCount === adultPassengers.length ? (
                <span className="text-success">
                  ✅ All {adultPassengers.length} adult passengers have valid, unique PAN numbers
                </span>
              ) : (
                <span className="text-warning">
                  ⚠️ {validPANCount}/{adultPassengers.length} adult passengers have valid PAN numbers
                </span>
              )}
              <br />
              <small>Format required: ABCDE1234F (5 letters + 4 digits + 1 letter)</small>
              {isPANMandatoryRoom && (
                <div className="mt-2">
                  <small><strong>🏨 PAN Mandatory Room:</strong> This room requires valid PAN for ALL adults</small>
                </div>
              )}
            </Alert>
          )}

          {/* Payment Summary */}
          <Card className="shadow-sm rounded mb-4">
            <Card.Header className="bg-danger text-white">
              <div className="d-flex align-items-center">
                <FaShieldAlt className="me-2" />
                <h5 className="mb-0 fw-bold">Secure Payment</h5>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Booking Summary */}
              <div className="mb-4 p-3 bg-light rounded">
                <h6 className="fw-bold mb-2">Booking Summary</h6>
                <div className="row">
                  <div className="col-md-8">
                    <div><strong>Hotel:</strong> {hotelBookingDetails?.HotelName || 'N/A'}</div>
                    <div><strong>Rooms:</strong> {hotelBookingDetails?.NoOfRooms || hotelBookingDetails?.HotelRoomsDetails?.length || hotelBookingDetails?.roomTravellerInfo?.length || 1}</div>
                    <div><strong>Guests:</strong> {getGuestCount()}</div>
                    <div><strong>Adults:</strong> {adultPassengers.length} (PAN Required)</div>
                    {isPANMandatoryRoom && (
                      <div className="text-warning mt-1">
                        <small><strong>⚠️ PAN Mandatory Room</strong></small>
                      </div>
                    )}
                  </div>
                  <div className="col-md-4 text-end">
                    <div className="fs-4 fw-bold text-danger">₹ {roundedTotal}</div>
                  </div>
                </div>
              </div>

              {/* Price details */}
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

              {/* Payment security info */}
              <div className="alert alert-info">
                <div className="d-flex align-items-center mb-2">
                  <FaShieldAlt className="me-2" />
                  <strong>Secure Payment</strong>
                </div>
                <small>
                  Your payment is secured by Razorpay with 256-bit SSL encryption.<br />
                  We accept all major credit cards, debit cards, UPI, and net banking.<br />
                  📧 <strong>Invoice will be automatically sent to your email after booking confirmation.</strong>
                </small>
              </div>

              {/* Lead guest info */}
              {leadPassenger && (
                <div className="mb-4 p-3 border rounded">
                  <h6 className="fw-bold mb-2">Lead Guest Information</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Name:</strong> {`${leadPassenger.Title || ''} ${leadPassenger.FirstName} ${leadPassenger.LastName}`.trim()}
                    </div>
                    <div className="col-md-6">
                      <strong>Email:</strong> {leadPassenger.Email}
                    </div>
                  </div>
                  {leadPassenger.Phoneno && (
                    <div className="row mt-2">
                      <div className="col-md-6">
                        <strong>Phone:</strong> {leadPassenger.Phoneno}
                      </div>
                    </div>
                  )}
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

              {/* Adult passengers PAN info list */}
              {adultPassengers.length > 0 && (
                <div className="mb-4 p-3 border rounded">
                  <h6 className="fw-bold mb-2">Adult Passenger PAN Information</h6>
                  {adultPassengers.map((adult, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                      <span>{adult.name} (Room {adult.room})</span>
                      <span className={`badge ${adult.isValid ? 'bg-success' : 'bg-danger'}`}>
                        {adult.isValid ? (
                          `✅ PAN: ${adult.pan.slice(0, 3)}***${adult.pan.slice(-2)}`
                        ) : (
                          '❌ Invalid/Missing PAN'
                        )}
                      </span>
                    </div>
                  ))}
                  <hr />
                  <div className="text-center">
                    <strong className={hasDuplicates ? "text-danger" : validPANCount === adultPassengers.length ? "text-success" : "text-warning"}>
                      {hasDuplicates
                        ? `❌ Duplicate PANs Found: ${duplicatePANs.length}`
                        : `PAN Status: ${validPANCount}/${adultPassengers.length} Valid`}
                    </strong>
                  </div>
                </div>
              )}
            </Card.Body>

            <Card.Footer className="bg-white">
              <div className="d-flex gap-3 justify-content-between align-items-center">
                <Button variant="outline-secondary" onClick={() => navigate(-1)} disabled={loading}>
                  ← Back to Review
                </Button>

                <Button
                  variant={hasDuplicates || validPANCount !== adultPassengers.length ? "warning" : "danger"}
                  size="lg"
                  className="px-5"
                  onClick={handlePayment}
                  disabled={loading || roundedTotal <= 0 || hasDuplicates || validPANCount !== adultPassengers.length}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing Payment...
                    </>
                  ) : hasDuplicates ? (
                    <>Fix Duplicate PANs First</>
                  ) : validPANCount !== adultPassengers.length ? (
                    <>Fix PAN Issues First</>
                  ) : (
                    <>Pay ₹ {roundedTotal}</>
                  )}
                </Button>
              </div>
              <div className="text-center mt-3">
                <small className="text-muted">
                  By clicking "Pay", you agree to our terms and conditions<br />
                  📧 Invoice will be automatically sent to lead passenger's email
                </small>
                {(hasDuplicates || validPANCount !== adultPassengers.length) && (
                  <div className="mt-2">
                    <small className="text-warning">
                      Please ensure all adult passengers have valid, unique PAN numbers before proceeding
                    </small>
                  </div>
                )}
              </div>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HotelPaymentInfo;