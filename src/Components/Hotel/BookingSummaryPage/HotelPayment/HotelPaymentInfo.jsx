import React, { useState, useRef } from 'react';
import { Card, Button, Alert, Modal } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { createHotelOrder, validateHotelPayment, bookHotel, sendHotelInvoice } from '../../../APIS/HotelApi/HotelAPi';

const HotelPaymentInfo = () => {
  const [loading, setLoading] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingStage, setBookingStage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ CRITICAL: Prevent duplicate bookings
  const bookingAttemptRef = useRef(null);
  const [bookingProcessed, setBookingProcessed] = useState(false);

  const {
    payload = {},
    hotelBookingDetails = {},
    priceDetails = {},
    reviewData = {},
    isPANMandatory = false,
    blockedRoomData = {},
    // ✅ NEW: Get coupon data from location state
    couponData = null,
    appliedCouponDiscount = 0,
  } = location.state || {};

  // ✅ UPDATED: Use the same pricing logic as FareSummaryCard WITH coupon discount
  const calculateFinalPrice = () => {
    // Get data from blocked room response if available
    const roomData = blockedRoomData?.HotelRoomsDetails?.[0] || {};
    const priceData = roomData?.Price || {};

    // Use blocked room data first, then fallback to priceDetails
    const {
      baseFare = priceData.RoomPrice || priceDetails?.baseFare || 0,
      publishedPrice = priceData.PublishedPrice || priceDetails?.publishedPrice || 0,
      tax = priceData.Tax || priceDetails?.tax || 0,
      discount = priceData.Discount || priceDetails?.discount || 0,
      serviceCharges = priceData.ServiceCharges || priceDetails?.serviceCharges || 0,
      otherCharges = priceData.OtherCharges || priceDetails?.otherCharges || 0,
      agentCommission = priceData.AgentCommission || priceDetails?.agentCommission || 0,
      tds = priceData.TDS || priceDetails?.tds || 0,
      vendorCommissionPercentage = priceDetails?.vendorCommissionPercentage || 12,
    } = priceDetails || {};

    // GST data from blocked room response
    const gstData = priceData.GST || {};
    const cgstAmount = gstData.CGSTAmount || 0;
    const sgstAmount = gstData.SGSTAmount || 0;
    const igstAmount = gstData.IGSTAmount || 0;
    const cgstRate = gstData.CGSTRate || 0;
    const sgstRate = gstData.SGSTRate || 0;
    const igstRate = gstData.IGSTRate || 0;

    // Use PublishedPrice as main price (this includes room price + tax)
    const actualBaseFare = publishedPrice;

    // Calculate vendor commission on published price
    const vendorCommissionAmount = (actualBaseFare * vendorCommissionPercentage) / 100;

    // Calculate GST
    let totalGST = 0;
    if (cgstAmount > 0 || sgstAmount > 0 || igstAmount > 0) {
      totalGST = cgstAmount + sgstAmount + igstAmount;
    } else if (cgstRate > 0 || sgstRate > 0 || igstRate > 0) {
      // Calculate GST on (published price + commission) if not provided
      const gstBase = actualBaseFare + vendorCommissionAmount;
      totalGST = (gstBase * (cgstRate + sgstRate + igstRate)) / 100;
    }

    // ✅ NEW: Calculate coupon discount
    let couponDiscount = 0;
    if (couponData) {
      if (couponData.discountType === 'percentage' || couponData.type === 'PERCENTAGE') {
        const discountPercent = couponData.discount || couponData.value || 0;
        couponDiscount = (actualBaseFare * discountPercent) / 100;
      } else if (couponData.discountType === 'flat' || couponData.type === 'FLAT') {
        couponDiscount = couponData.discount || couponData.value || 0;
      }
    }

    // If appliedCouponDiscount is passed, use that instead
    if (appliedCouponDiscount > 0) {
      couponDiscount = appliedCouponDiscount;
    }

    // Final amount customer pays WITH coupon discount
    const subtotal = actualBaseFare + vendorCommissionAmount + totalGST - discount;
    const customerTotal = subtotal - couponDiscount;

    return {
      actualBaseFare,
      vendorCommissionAmount,
      vendorCommissionPercentage,
      totalGST,
      cgstAmount,
      sgstAmount,
      igstAmount,
      cgstRate,
      sgstRate,
      igstRate,
      discount,
      serviceCharges,
      otherCharges,
      couponDiscount, // ✅ NEW: Include coupon discount
      subtotal, // ✅ NEW: Price before coupon
      roundedTotal: parseFloat(customerTotal.toFixed(2))
    };
  };

  const priceCalculation = calculateFinalPrice();
  const {
    roundedTotal,
    actualBaseFare,
    vendorCommissionAmount,
    vendorCommissionPercentage,
    totalGST,
    cgstAmount,
    sgstAmount,
    igstAmount,
    cgstRate,
    sgstRate,
    igstRate,
    discount,
    serviceCharges,
    otherCharges,
    couponDiscount, // ✅ NEW
    subtotal // ✅ NEW
  } = priceCalculation;

  // Custom Loading Popup Component
  const BookingLoadingModal = () => (
    <Modal
      show={bookingInProgress}
      backdrop="static"
      keyboard={false}
      centered
      size="md"
    >
      <Modal.Body className="text-center py-5">
        <div className="mb-4">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>

        <h4 className="text-danger mb-3">Processing Your Booking...</h4>

        <div className="mb-3">
          <p className="text-muted mb-2">Current Status:</p>
          <p className="fw-bold text-dark">{bookingStage}</p>
        </div>

        <div className="alert alert-danger border-0 mb-0">
          <p className="mb-2">
            <strong>Please wait while we confirm your hotel reservation</strong>
          </p>
          <p className="mb-2">
            <strong>Do not refresh or close this page</strong>
          </p>
          <p className="mb-0 small text-muted">
            This process may take 30-60 seconds
          </p>
        </div>

        <div className="mt-4">
          <div className="d-flex justify-content-center align-items-center">
            <div className="progress w-75" style={{ height: '6px' }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                role="progressbar"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
          <small className="text-muted mt-2 d-block">
            Securing your booking with the hotel...
          </small>
        </div>
      </Modal.Body>
    </Modal>
  );

  // Load Razorpay checkout script
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

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

  // ✅ ENHANCED: Generate unique ClientReferenceNo to prevent duplicates
  const generateUniqueClientReference = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `CLT_${timestamp}_${random}`;
  };

  // ✅ UPDATED: Include coupon discount in booking data
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
      throw new Error('No adult passenger found to assign as lead passenger');
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
            throw new Error(`Adult passenger "${passengerName}" is missing PAN number`);
          }

          const cleanPAN = panValue.trim().toUpperCase();

          // Check for empty or invalid placeholder values
          if (!cleanPAN ||
            ['NULL', 'UNDEFINED', 'N/A', 'NA', 'NONE', ''].includes(cleanPAN) ||
            cleanPAN.replace(/\s/g, '') === '') {
            throw new Error(`Adult passenger "${passengerName}" has invalid PAN: "${panValue}"`);
          }

          // PAN format validation
          if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPAN) && cleanPAN.length < 5) {
            throw new Error(`Invalid PAN format for "${passengerName}": "${cleanPAN}". Required format: ABCDE1234F`);
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
      throw new Error('No lead passenger found. At least one adult passenger is required.');
    }

    if (leadCount > 1) {
      throw new Error(`Multiple lead passengers found (${leadCount}). Only ONE lead passenger is allowed.`);
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
      throw new Error(`Duplicate PAN numbers found: ${duplicatePANs.join(', ')}. Each passenger must have a unique PAN number.`);
    }

    // ✅ CRITICAL: Generate unique ClientReferenceNo to prevent duplicate bookings
    const uniqueClientRef = generateUniqueClientReference();

    // ✅ NEW: Include coupon discount in payload
    const finalPayload = {
      ResultIndex: String(bookingDetails.ResultIndex || `CRS_${bookingDetails.HotelCode || 67}`),
      HotelCode: String(bookingDetails.HotelCode || 67),
      HotelName: String(bookingDetails.HotelName || "ALILA DIWA"),
      GuestNationality: "IN",
      NoOfRooms: String(processedRooms.length),
      ClientReferenceNo: uniqueClientRef, // ✅ CRITICAL: Unique reference
      CouponDiscount: couponDiscount > 0 ? couponDiscount : (bookingDetails.CouponDiscount || 0), // ✅ NEW: Use actual coupon discount
      IsVoucherBooking: "true",
      HotelRoomsDetails: processedRooms,
      UserIp: String(bookingDetails.UserIp || "49.36.217.215"),
      SearchTokenId: String(bookingDetails.SearchTokenId || "5e423a789321f6edcf0de63bc80b3342b5c318ed")
    };

    console.log('✅ Final booking payload:', JSON.stringify(finalPayload, null, 2));
    console.log(`💰 Customer Pays: ₹${roundedTotal} (Original: ₹${subtotal}, Coupon Discount: ₹${couponDiscount})`);

    return finalPayload;
  };

  // ✅ UPDATED: Extract API response error directly
  const getApiErrorMessage = (error) => {
    console.error('API Error:', error);

    if (error?.response?.data) {
      const data = error.response.data;

      // Try different error message paths from API response
      if (data.error?.ErrorMessage) return data.error.ErrorMessage;
      if (data.Error?.ErrorMessage) return data.Error.ErrorMessage;
      if (data.message) return data.message;
      if (data.error?.message) return data.error.message;
      if (data.Error?.message) return data.Error.message;
      if (typeof data === 'string') return data;
    }

    if (error?.message) return error.message;

    return 'An unexpected error occurred';
  };

  // Toast helpers
  const showErrorToast = (title, message) => {
    toast.error(`${title}: ${message}`, {
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

  // Payment success handler
  const handlePaymentSuccess = async (response, formattedBookingData, validation) => {
    // ✅ CRITICAL: Prevent multiple booking calls
    if (bookingProcessed) {
      console.log('⚠️ Booking already processed, skipping duplicate call');
      return;
    }

    try {
      setBookingProcessed(true);
      setBookingStage('Confirming your hotel reservation...');
      console.log('🚀 Sending booking request with payload:', JSON.stringify(formattedBookingData, null, 2));

      const bookingResponse = await bookHotel(formattedBookingData);
      console.log('📨 Booking API response:', JSON.stringify(bookingResponse, null, 2));

      // ✅ UPDATED: Check for API errors first
      if (!bookingResponse) {
        const errorMessage = 'No response received from booking API';
        setError(errorMessage);
        showErrorToast('Booking Failed', errorMessage);
        setBookingInProgress(false);
        setLoading(false);
        return;
      }

      // Check for error responses from API
      if (bookingResponse.error || bookingResponse.Error) {
        const apiError = bookingResponse.error || bookingResponse.Error;
        const errorMessage = apiError.ErrorMessage || apiError.message || 'Booking failed due to API error';

        setError(errorMessage);
        showErrorToast('Booking API Error', errorMessage);
        setBookingInProgress(false);
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

      const hasBookingId = bookingResponse?.BookingID || bookingResponse?.bookingId || bookingResponse?.id;

      if (isBookingSuccessful && hasRequiredBookingData) {
        setBookingStage('Booking confirmed! Preparing confirmation details...');
        showSuccessToast('Hotel booking confirmed successfully!');

        // Send invoice email after successful booking
        if (hasBookingId) {
          try {
            setBookingStage('Sending invoice to your email...');
            const leadPassengerEmail = getLeadPassengerEmail(formattedBookingData);
            console.log('📧 Sending invoice to email:', leadPassengerEmail);

            const invoicePayload = {
              UserIp: bookingResponse.UserIp || formattedBookingData.UserIp || "49.36.217.215",
              BookingId: hasBookingId,
              SearchTokenId: bookingResponse.SearchTokenId || formattedBookingData.SearchTokenId,
              receiverEmail: leadPassengerEmail
            };

            const invoiceResult = await sendHotelInvoice(invoicePayload);

            if (invoiceResult.success) {
              console.log('✅ Invoice sent successfully');
              showSuccessToast('Invoice sent to your email successfully!');
            } else {
              console.warn('⚠️ Invoice sending failed:', invoiceResult.message);
              showErrorToast('Invoice Email Warning',
                `Booking confirmed but invoice email failed: ${invoiceResult.message || 'Unknown error'}`);
            }
          } catch (invoiceError) {
            console.error('❌ Invoice sending error:', invoiceError);
            const invoiceErrorMessage = getApiErrorMessage(invoiceError);
            showErrorToast('Invoice Email Warning',
              `Booking confirmed but invoice email failed: ${invoiceErrorMessage}`);
          }
        }

        // Navigate to confirmation page
        setBookingStage('Redirecting to confirmation page...');

        setTimeout(() => {
          setBookingInProgress(false);
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
                bookingId: hasBookingId,
                userIp: bookingResponse.UserIp,
                message: bookingResponse.message,
                bookingTime: new Date().toISOString(),
              },
              isBooked: true,
              bookingDetails: {
                contactData: getLeadPassenger(formattedBookingData),
                searchTokenId: bookingResponse.SearchTokenId,
              },
              bookingResult: bookingResponse,
              couponData: couponData,
              couponDiscount: couponDiscount
            },
          });
        }, 1500);

      } else {
        // ✅ UPDATED: Show API response message directly
        const errorMessage = bookingResponse?.message || 'Booking failed without specific error message';
        setError(errorMessage);
        showErrorToast('Booking Failed', errorMessage);
        setBookingInProgress(false);
      }
    } catch (bookingError) {
      console.error('❌ Booking API Error:', bookingError);

      // ✅ UPDATED: Use API response error directly
      const apiErrorMessage = getApiErrorMessage(bookingError);
      setError(apiErrorMessage);
      showErrorToast('Booking API Error', apiErrorMessage);
      setBookingInProgress(false);
    }
  };

  // ✅ UPDATED: Main payment handler with API response errors
  const handlePayment = async () => {
    if (loading || bookingInProgress || bookingProcessed) {
      console.log('⚠️ Payment already in progress or completed');
      return;
    }

    const currentAttemptId = Date.now();
    if (bookingAttemptRef.current && (currentAttemptId - bookingAttemptRef.current) < 30000) {
      showErrorToast('Payment In Progress', 'Please wait for the current payment to complete');
      return;
    }

    bookingAttemptRef.current = currentAttemptId;
    setLoading(true);
    setError('');
    setBookingProcessed(false);

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
        showErrorToast('Booking Data Error', formatError.message);
        setLoading(false);
        bookingAttemptRef.current = null;
        return;
      }

      // Load Razorpay
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        const errorMessage = 'Payment system failed to load. Please refresh and try again.';
        setError(errorMessage);
        showErrorToast('Payment System Error', errorMessage);
        setLoading(false);
        bookingAttemptRef.current = null;
        return;
      }

      // ✅ UPDATED: Create order with API error handling
      try {
        const orderResponse = await createHotelOrder(roundedTotal);
        const order = orderResponse?.order;

        if (!order?.id) {
          const errorMessage = orderResponse?.message || 'Failed to create payment order';
          setError(errorMessage);
          showErrorToast('Order Creation Failed', errorMessage);
          setLoading(false);
          bookingAttemptRef.current = null;
          return;
        }

        // Razorpay options
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_glwdvx2PlFDStN',
          amount: order.amount,
          currency: order.currency,
          name: 'Rasutrip',
          description: 'Hotel Booking Payment',
          order_id: order.id,
          handler: async (response) => {
            try {
              setBookingInProgress(true);
              setBookingStage('Validating payment...');

              const validatePayload = {
                amount: roundedTotal,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingType: 'HOTEL',
                Hotel: formattedBookingData,
              };

              // ✅ UPDATED: Validate payment with API error handling
              const validation = await validateHotelPayment(validatePayload);

              if (validation?.message === 'Payment verified successfully' && validation?.payment?.status === 'success') {
                setBookingStage('Payment successful! Processing hotel booking...');
                await handlePaymentSuccess(response, formattedBookingData, validation);
              } else {
                // ✅ UPDATED: Show API validation error directly
                const validationError = validation?.message || validation?.error?.message || 'Payment validation failed';
                setError(validationError);
                showErrorToast('Payment Validation Failed', validationError);
                setBookingInProgress(false);
              }
            } catch (validationError) {
              console.error('❌ Payment validation error:', validationError);

              // ✅ UPDATED: Use API response error directly
              const apiErrorMessage = getApiErrorMessage(validationError);
              setError(apiErrorMessage);
              showErrorToast('Payment Processing Error', apiErrorMessage);
              setBookingInProgress(false);
            } finally {
              setLoading(false);
              bookingAttemptRef.current = null;
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
              setBookingInProgress(false);
              bookingAttemptRef.current = null;
              showErrorToast('Payment Cancelled', 'Payment was cancelled by user');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          // ✅ UPDATED: Show Razorpay error directly
          const failureMessage = response.error.description || response.error.reason || 'Payment failed due to unknown error';
          setError(failureMessage);
          showErrorToast('Payment Failed', failureMessage);
          setLoading(false);
          setBookingInProgress(false);
          bookingAttemptRef.current = null;
        });
        rzp.open();

      } catch (orderError) {
        console.error('❌ Order creation error:', orderError);

        // ✅ UPDATED: Use API response error directly
        const apiErrorMessage = getApiErrorMessage(orderError);
        setError(apiErrorMessage);
        showErrorToast('Order Creation Failed', apiErrorMessage);
        setLoading(false);
        bookingAttemptRef.current = null;
      }

    } catch (err) {
      console.error('❌ Payment initialization error:', err);

      // ✅ UPDATED: Use API response error directly
      const apiErrorMessage = getApiErrorMessage(err);
      setError(apiErrorMessage);
      showErrorToast('Payment Initialization Failed', apiErrorMessage);
      setLoading(false);
      setBookingInProgress(false);
      bookingAttemptRef.current = null;
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
    <>
      {/* Booking Progress Modal */}
      <BookingLoadingModal />

      <div className="container my-4">
        <div className="row justify-content-center">
          <div className="col">
            {/* Payment Summary */}
            <Card className="shadow-sm rounded mb-4">
              <Card.Header className="">
                <div className="d-flex align-items-center">
                  <h5 className="mb-0 fw-bold">Secure Payment</h5>
                  {/* Show processing status */}
                  {(loading || bookingInProgress) && (
                    <div className="ms-auto">
                      <div className="spinner-border spinner-border-sm text-danger" role="status">
                        <span className="visually-hidden">Processing...</span>
                      </div>
                    </div>
                  )}
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
                    </div>
                    <div className="col-md-4 text-end">
                      <div className="fs-4 fw-bold text-danger">₹ {roundedTotal}</div>
                      {/* Show coupon savings */}
                      {couponDiscount > 0 && (
                        <div className="text-success small">
                          Coupon Savings: ₹{couponDiscount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown with Coupon Discount */}
                <div className="mb-4 p-3 border rounded">
                  <h6 className="fw-bold mb-3">Price Breakdown</h6>

                  {/* Hotel Total */}
                  <div className="row mb-2">
                    <div className="col">
                      Hotel Total
                      <small className="text-muted d-block">Published price (Room + Hotel taxes)</small>
                    </div>
                    <div className="col text-end fw-bold">₹ {actualBaseFare.toLocaleString()}</div>
                  </div>

                  {/* Service Charges */}
                  {serviceCharges > 0 && (
                    <div className="row mb-2">
                      <div className="col">
                        Service Charges
                        <small className="text-muted d-block">Hotel service charges</small>
                      </div>
                      <div className="col text-end">₹ {serviceCharges.toFixed(2)}</div>
                    </div>
                  )}

                  {/* Other Charges */}
                  {otherCharges > 0 && (
                    <div className="row mb-2">
                      <div className="col">
                        Other Charges
                        <small className="text-muted d-block">Additional charges</small>
                      </div>
                      <div className="col text-end">₹ {otherCharges.toFixed(2)}</div>
                    </div>
                  )}

                  {/* Booking Fee */}
                  <div className="row mb-2">
                    <div className="col">
                      Booking Fee
                      <small className="text-muted d-block">Service charge ({vendorCommissionPercentage}%)</small>
                    </div>
                    <div className="col text-end text-success fw-bold">₹ {vendorCommissionAmount.toFixed(2)}</div>
                  </div>

                  {/* GST Breakdown */}
                  {totalGST > 0 && (
                    <>
                      {cgstAmount > 0 && (
                        <div className="row mb-2">
                          <div className="col">
                            CGST ({cgstRate}%)
                            <small className="text-muted d-block">Central GST</small>
                          </div>
                          <div className="col text-end">₹ {cgstAmount.toFixed(2)}</div>
                        </div>
                      )}

                      {sgstAmount > 0 && (
                        <div className="row mb-2">
                          <div className="col">
                            SGST ({sgstRate}%)
                            <small className="text-muted d-block">State GST</small>
                          </div>
                          <div className="col text-end">₹ {sgstAmount.toFixed(2)}</div>
                        </div>
                      )}

                      {igstAmount > 0 && (
                        <div className="row mb-2">
                          <div className="col">
                            IGST ({igstRate}%)
                            <small className="text-muted d-block">Integrated GST</small>
                          </div>
                          <div className="col text-end">₹ {igstAmount.toFixed(2)}</div>
                        </div>
                      )}

                      {/* Show calculated GST if not provided in response */}
                      {(cgstAmount === 0 && sgstAmount === 0 && igstAmount === 0) && totalGST > 0 && (
                        <div className="row mb-2">
                          <div className="col">
                            GST ({cgstRate + sgstRate + igstRate}%)
                            <small className="text-muted d-block">On booking amount</small>
                          </div>
                          <div className="col text-end">₹ {totalGST.toFixed(2)}</div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Regular Discount */}
                  {discount > 0 && (
                    <div className="row mb-2 text-success">
                      <div className="col">Discount Applied</div>
                      <div className="col text-end">- ₹ {discount.toFixed(2)}</div>
                    </div>
                  )}

                  {/* Subtotal before coupon */}
                  {couponDiscount > 0 && (
                    <div className="row mb-2 border-top pt-2">
                      <div className="col fw-bold">Subtotal</div>
                      <div className="col text-end fw-bold">₹ {subtotal.toFixed(2)}</div>
                    </div>
                  )}

                  {/* Coupon Discount */}
                  {couponDiscount > 0 && (
                    <div className="row mb-2 text-success">
                      <div className="col">
                        Coupon Discount
                        {couponData && (
                          <small className="text-muted d-block">
                            Code: {couponData.code || couponData.couponCode}
                            {couponData.discountType === 'percentage' || couponData.type === 'PERCENTAGE'
                              ? ` (${couponData.discount || couponData.value}%)`
                              : ' (Flat Discount)'}
                          </small>
                        )}
                      </div>
                      <div className="col text-end text-success fw-bold">- ₹ {couponDiscount.toFixed(2)}</div>
                    </div>
                  )}

                  <hr />
                  <div className="row fw-bold">
                    <div className="col">Total Amount</div>
                    <div className="col text-end text-danger fs-5">₹ {roundedTotal}</div>
                  </div>

                  {/* Show savings if coupon applied */}
                  {couponDiscount > 0 && (
                    <div className="text-center mt-2">
                      <small className="text-success fw-bold">
                        You saved ₹{couponDiscount.toFixed(2)} with this coupon!
                      </small>
                    </div>
                  )}
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

              <Card.Footer className="">
                <div className="text-end">
                  <Button
                    variant="danger"
                    className="px-5"
                    onClick={handlePayment}
                    disabled={roundedTotal <= 0 || loading || bookingInProgress || bookingProcessed}
                  >
                    {loading || bookingInProgress ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {bookingInProgress ? 'Processing Booking...' : 'Loading Payment...'}
                      </>
                    ) : bookingProcessed ? (
                      'Booking Processed'
                    ) : (
                      `Pay ₹{roundedTotal}`
                    )}
                  </Button>
                </div>
              </Card.Footer>
            </Card>

            {/* Error Alert */}
            {error && (
              <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
                <FaExclamationTriangle className="me-2" />
                <strong>API Error:</strong>
                <div style={{ whiteSpace: 'pre-line', marginTop: 8 }}>{error}</div>
              </Alert>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default HotelPaymentInfo;