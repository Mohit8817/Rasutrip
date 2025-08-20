import React, { useState } from 'react';
import { Card, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { createHotelOrder, validateHotelPayment, bookHotel, sendHotelInvoiceEmail } from '../../../APIS/HotelApi/HotelAPi';

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

  // ✅ FIXED: Use the actual API function for sending invoice email
  const sendInvoiceEmail = async (bookingResponse, formattedBookingData) => {
    try {
      console.log('📧 Sending invoice email...');

      // Get lead passenger email for invoice
      const leadPassengerEmail = getLeadPassengerEmail(formattedBookingData);

      const invoicePayload = {
        UserIp: bookingResponse.UserIp || "49.36.217.215",
        BookingId: bookingResponse.BookingID || bookingResponse.userId,
        SearchTokenId: bookingResponse.SearchTokenId,
        receiverEmail: leadPassengerEmail // Add recipient email
      };

      console.log('📤 Invoice payload:', invoicePayload);

      // ✅ Use the actual API function instead of direct axios call
      const response = await sendHotelInvoiceEmail(invoicePayload);

      console.log('✅ Invoice email sent successfully:', response);
      return { success: true, data: response };

    } catch (error) {
      console.error('❌ Invoice email failed:', error.message);
      // Don't throw error - this is non-critical
      return { success: false, error: error.message };
    }
  };

  // Utility functions for lead passenger
  const getLeadPassenger = (formattedBookingData) => {
    return formattedBookingData?.HotelRoomsDetails?.[0]?.HotelPassenger?.find(p => p.LeadPassenger === "true") ||
      formattedBookingData?.HotelRoomsDetails?.[0]?.HotelPassenger?.[0] ||
      {};
  };

  const getLeadPassengerEmail = (formattedBookingData) => {
    const leadPassenger = getLeadPassenger(formattedBookingData);
    return leadPassenger?.Email || "mohitverma8817@gmail.com";
  };

  // ✅ CORRECTED: Lead passenger logic - Only ONE lead passenger across ALL rooms
  const formatBookingData = (bookingDetails) => {
    console.log('🔄 Input booking details:', JSON.stringify(bookingDetails, null, 2));

    // Step 1: Validate input data structure
    let hotelRoomsData = [];

    if (bookingDetails?.HotelRoomsDetails && Array.isArray(bookingDetails.HotelRoomsDetails)) {
      hotelRoomsData = bookingDetails.HotelRoomsDetails;
    } else if (bookingDetails?.roomTravellerInfo && Array.isArray(bookingDetails.roomTravellerInfo)) {
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

    // ✅ CRITICAL FIX: Global lead passenger control
    let leadPassengerAssigned = false;
    let leadPassengerName = '';

    // First pass: Find the first adult passenger to be the lead passenger
    let leadPassengerFound = false;
    for (let roomIndex = 0; roomIndex < hotelRoomsData.length && !leadPassengerFound; roomIndex++) {
      const room = hotelRoomsData[roomIndex];
      if (room.HotelPassenger && Array.isArray(room.HotelPassenger)) {
        for (let passengerIndex = 0; passengerIndex < room.HotelPassenger.length; passengerIndex++) {
          const passenger = room.HotelPassenger[passengerIndex];
          const isAdult = parseInt(passenger.PaxType) === 1 || passenger.Age >= 18;
          if (isAdult) {
            leadPassengerName = `${passenger.FirstName || ''} ${passenger.LastName || ''}`.trim();
            leadPassengerFound = true;
            console.log(`✅ Selected ${leadPassengerName} as the SINGLE Lead Passenger (Room ${roomIndex + 1})`);
            break;
          }
        }
      }
    }

    if (!leadPassengerFound) {
      throw new Error('❌ No adult passenger found to assign as lead passenger');
    }

    const processedRooms = hotelRoomsData.map((room, roomIndex) => {
      if (!room.HotelPassenger || !Array.isArray(room.HotelPassenger) || room.HotelPassenger.length === 0) {
        throw new Error(`Room ${roomIndex + 1} has no passengers`);
      }

      const processedPassengers = room.HotelPassenger.map((passenger, passengerIndex) => {
        const isAdult = parseInt(passenger.PaxType) === 1 || passenger.Age >= 18;
        const passengerName = `${passenger.FirstName || ''} ${passenger.LastName || ''}`.trim();

        // ✅ CRITICAL: Only the FIRST adult passenger becomes lead passenger
        const shouldBeLeadPassenger = !leadPassengerAssigned && isAdult && passengerName === leadPassengerName;

        if (shouldBeLeadPassenger) {
          leadPassengerAssigned = true;
          console.log(`✅ Assigning ${passengerName} as Lead Passenger (Room ${roomIndex + 1})`);
        }

        if (isAdult) {
          // PAN validation for adults
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

          // PAN format validation
          if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPAN) && cleanPAN.length < 5) {
            throw new Error(`❌ Invalid PAN format for "${passengerName}": "${cleanPAN}". Required format: ABCDE1234F`);
          }

          // ✅ EXACT format - only ONE lead passenger
          return {
            Title: String(passenger.Title || "Mr").trim(),
            FirstName: String(passenger.FirstName || "").trim(),
            MiddleName: String(passenger.MiddleName || "").trim(),
            LastName: String(passenger.LastName || "").trim(),
            Phoneno: String(passenger.Phoneno || "").replace(/\D/g, ''),
            Email: String(passenger.Email || "").trim().toLowerCase(),
            PaxType: 1, // Adult
            LeadPassenger: shouldBeLeadPassenger ? "true" : "false", // ✅ Only ONE true
            Age: passenger.Age && !isNaN(passenger.Age) ? parseInt(passenger.Age) : 0,
            PassportNo: null,
            PassportIssueDate: null,
            PassportExpDate: null,
            PAN: cleanPAN,
            // GST fields - only for lead passenger if provided
            GSTCompanyAddress: shouldBeLeadPassenger && passenger.GSTCompanyAddress ? String(passenger.GSTCompanyAddress).trim() : null,
            GSTCompanyContactNumber: shouldBeLeadPassenger && passenger.GSTCompanyContactNumber ? String(passenger.GSTCompanyContactNumber).trim() : null,
            GSTCompanyEmail: shouldBeLeadPassenger && passenger.GSTCompanyEmail ? String(passenger.GSTCompanyEmail).trim() : null,
            GSTCompanyName: shouldBeLeadPassenger && passenger.GSTCompanyName ? String(passenger.GSTCompanyName).trim() : null,
            GSTNumber: shouldBeLeadPassenger && passenger.GSTNumber ? String(passenger.GSTNumber).trim() : null,
          };
        } else {
          // Child passenger - never lead passenger
          return {
            Title: String(passenger.Title || "Master").trim(),
            FirstName: String(passenger.FirstName || "").trim(),
            MiddleName: String(passenger.MiddleName || "").trim(),
            LastName: String(passenger.LastName || "").trim(),
            Phoneno: String(passenger.Phoneno || "").replace(/\D/g, ''),
            Email: String(passenger.Email || "").trim().toLowerCase(),
            PaxType: 2, // Child
            LeadPassenger: "false", // ✅ Children are NEVER lead passengers
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
        RoomIndex: roomIndex + 1,
        HotelPassenger: processedPassengers
      };
    });

    // ✅ Final validation: Ensure exactly ONE lead passenger
    const leadCount = processedRooms
      .flatMap(room => room.HotelPassenger)
      .filter(passenger => passenger.LeadPassenger === "true")
      .length;

    if (leadCount === 0) {
      throw new Error('❌ No lead passenger found. At least one adult passenger is required.');
    }

    if (leadCount > 1) {
      throw new Error(`❌ Multiple lead passengers found (${leadCount}). Only ONE lead passenger is allowed.`);
    }

    console.log(`✅ SUCCESS: Exactly ONE lead passenger set: ${leadPassengerName}`);

    // Check for duplicate PANs
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

    // Build final payload
    const finalPayload = {
      ResultIndex: String(bookingDetails.ResultIndex || `CRS_${bookingDetails.HotelCode || 67}`),
      HotelCode: String(bookingDetails.HotelCode || 67),
      HotelName: String(bookingDetails.HotelName || "ALILA DIWA"),
      GuestNationality: "IN",
      NoOfRooms: String(processedRooms.length),
      ClientReferenceNo: bookingDetails.ClientReferenceNo || 0,
      vendorCommission: bookingDetails.vendorCommission || 10,
      CouponDiscount: bookingDetails.CouponDiscount || 5,
      IsVoucherBooking: "true",
      HotelRoomsDetails: processedRooms,
      UserIp: String(bookingDetails.UserIp || "49.36.217.215"),
      SearchTokenId: String(bookingDetails.SearchTokenId || "5e423a789321f6edcf0de63bc80b3342b5c318ed")
    };

    console.log('✅ Final booking payload (SINGLE lead passenger):', JSON.stringify(finalPayload, null, 2));

    return finalPayload;
  };

  // API error handler
  const handleApiError = (error, context = 'API') => {
    let errorMessage = `${context} failed. Please try again.`;

    if (error?.response) {
      const status = error.response.status;
      const data = error.response.data;

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
        return { message: errorMessage, isPANError: true };
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
    } else {
      errorMessage = error?.message || `${context} failed due to an unexpected error.`;
    }
    return { message: errorMessage };
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

  // ✅ FIXED: Payment success handler with proper invoice email integration
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

        // ✅ SEND INVOICE EMAIL WITH PROPER ERROR HANDLING
        try {
          console.log('📧 Attempting to send invoice email...');
          const invoiceResult = await sendInvoiceEmail(bookingResponse, formattedBookingData);

          if (invoiceResult.success) {
            showSuccessToast('📧 Invoice has been sent to your email!');
            console.log('✅ Invoice email sent successfully');
          } else {
            console.warn('⚠️ Invoice email failed but booking succeeded:', invoiceResult.error);
            showErrorToast('⚠️ Invoice Email Warning', 'Booking confirmed but invoice email failed. You can download invoice from booking details.');
          }
        } catch (invoiceError) {
          console.error('⚠️ Invoice email error (non-critical):', invoiceError.message);
          showErrorToast('⚠️ Invoice Email Warning', 'Booking confirmed but invoice email failed. You can download invoice from booking details.');
        }

        // Navigate to confirmation page
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
            isBooked: true,
            bookingDetails: {
              contactData: getLeadPassenger(formattedBookingData),
              searchTokenId: bookingResponse.SearchTokenId,
            },
            bookingResult: bookingResponse
          },
        });

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

            
            </Card.Body>

            <Card.Footer className="bg-white">
              <div className="text-end">
                <Button
                  variant="danger"
                  size="lg"
                  className="px-5"
                  onClick={handlePayment}
                  disabled={roundedTotal <= 0}
                >
                  Pay ₹ {roundedTotal}
                </Button>
              </div>

            </Card.Footer>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
              <FaExclamationTriangle className="me-2" />
              <strong>Error:</strong>
              <div style={{ whiteSpace: 'pre-line', marginTop: 8 }}>{error}</div>
            </Alert>
          )}

        </div>
      </div>
    </div>
  );
};

export default HotelPaymentInfo;  