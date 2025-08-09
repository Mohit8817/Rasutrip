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

  // ✅ NEW: Async invoice email sender (non-blocking)
  const sendInvoiceEmailAsync = async (invoiceData) => {
    try {
      console.log('📧 Attempting to auto-send invoice email...');
      
      // Use the hotel invoice API to send email
      const result = await downloadHotelInvoice({
        ...invoiceData,
        emailOnly: true // Custom flag to indicate email-only mode
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

  // ✅ NEW: Utility functions for invoice data
  const getLeadPassenger = (formattedBookingData) => {
    return formattedBookingData?.HotelRoomsDetails?.[0]?.HotelPassenger?.find(p => p.LeadPassenger === "true") ||
           formattedBookingData?.HotelRoomsDetails?.[0]?.HotelPassenger?.[0] ||
           {};
  };

  const getLeadPassengerEmail = (formattedBookingData) => {
    const leadPassenger = getLeadPassenger(formattedBookingData);
    return leadPassenger?.Email || "mohitverma8817@gmail.com";
  };

  // GST Filtering: only lead passenger keeps GST fields, others are nulled
  const filterGSTForLeadPassengerOnly = (bookingData) => {
    const filteredData = JSON.parse(JSON.stringify(bookingData));

    if (filteredData.HotelRoomsDetails && Array.isArray(filteredData.HotelRoomsDetails)) {
      filteredData.HotelRoomsDetails.forEach((room) => {
        if (room.HotelPassenger && Array.isArray(room.HotelPassenger)) {
          room.HotelPassenger.forEach((passenger) => {
            if (passenger.LeadPassenger !== "true" && passenger.LeadPassenger !== true) {
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

    if (filteredData.roomTravellerInfo && Array.isArray(filteredData.roomTravellerInfo)) {
      filteredData.roomTravellerInfo.forEach((room) => {
        if (room.travellerInfo && Array.isArray(room.travellerInfo)) {
          room.travellerInfo.forEach((traveller) => {
            if (traveller.LeadPassenger !== true && traveller.LeadPassenger !== "true") {
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

  // Validate PAN for all adult passengers and check duplicates
  const validateAllPANs = (bookingData) => {
    const errors = [];
    const panNumbers = [];
    let totalAdults = 0;
    let adultsWithPAN = 0;

    const isValidPAN = (pan) => {
      if (!pan || typeof pan !== 'string') return false;
      const cleanPAN = pan.trim().toUpperCase();
      if (
        ['', 'NULL', 'UNDEFINED', 'N/A', 'NA', 'NONE'].includes(cleanPAN) ||
        cleanPAN.replace(/\s/g, '') === ''
      )
        return false;
      return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPAN);
    };

    if (bookingData.HotelRoomsDetails && Array.isArray(bookingData.HotelRoomsDetails)) {
      bookingData.HotelRoomsDetails.forEach((room, roomIndex) => {
        if (room.HotelPassenger && Array.isArray(room.HotelPassenger)) {
          room.HotelPassenger.forEach((passenger) => {
            const isAdult = parseInt(passenger.PaxType) === 1 || passenger.Age >= 18;
            if (isAdult) {
              const passengerName = `${passenger.FirstName} ${passenger.LastName}`;
              totalAdults++;
              const panValue = passenger.PAN;
              if (!isValidPAN(panValue)) {
                errors.push(`❌ ${passengerName} (Room ${roomIndex + 1}): Invalid or missing PAN "${panValue || 'Not provided'}"`);
              } else {
                const cleanPAN = panValue.trim().toUpperCase();
                const existing = panNumbers.find((p) => p.pan === cleanPAN);
                if (existing) {
                  errors.push(`❌ DUPLICATE PAN "${cleanPAN}": Used by both "${existing.name}" and "${passengerName}"`);
                } else {
                  panNumbers.push({ pan: cleanPAN, name: passengerName, room: roomIndex + 1 });
                  adultsWithPAN++;
                }
              }
            }
          });
        }
      });
    }

    if (bookingData.roomTravellerInfo && Array.isArray(bookingData.roomTravellerInfo)) {
      bookingData.roomTravellerInfo.forEach((room, roomIndex) => {
        if (room.travellerInfo && Array.isArray(room.travellerInfo)) {
          room.travellerInfo.forEach((traveller) => {
            const isAdult = parseInt(traveller.PaxType) === 1 || traveller.Age >= 18;
            if (isAdult) {
              const passengerName = `${traveller.FirstName} ${traveller.LastName}`;
              totalAdults++;
              const panValue = traveller.PAN;
              if (!isValidPAN(panValue)) {
                errors.push(`❌ ${passengerName} (Room ${roomIndex + 1}): Invalid or missing PAN "${panValue || 'Not provided'}"`);
              } else {
                const cleanPAN = panValue.trim().toUpperCase();
                const existing = panNumbers.find((p) => p.pan === cleanPAN);
                if (existing) {
                  errors.push(`❌ DUPLICATE PAN "${cleanPAN}": Used by both "${existing.name}" and "${passengerName}"`);
                } else {
                  panNumbers.push({ pan: cleanPAN, name: passengerName, room: roomIndex + 1 });
                  adultsWithPAN++;
                }
              }
            }
          });
        }
      });
    }

    return {
      isValid: errors.length === 0 && totalAdults > 0 && adultsWithPAN === totalAdults,
      errors,
      stats: {
        totalAdults,
        adultsWithPAN,
        uniquePANs: panNumbers.length,
      },
    };
  };

  // Format booking data with strict PAN + GST filtering
  const formatBookingData = (bookingDetails) => {
    const gstFilteredData = filterGSTForLeadPassengerOnly(bookingDetails);
    const cleanedData = { ...gstFilteredData };

    cleanedData.ResultIndex = cleanedData.ResultIndex || payload?.ResultIndex || '';
    cleanedData.HotelCode = cleanedData.HotelCode || payload?.HotelCode || '';
    cleanedData.HotelName = cleanedData.HotelName || payload?.HotelName || '';
    cleanedData.SearchTokenId = cleanedData.SearchTokenId || payload?.SearchTokenId || '';
    cleanedData.GuestNationality = cleanedData.GuestNationality || payload?.GuestNationality || reviewData?.GuestNationality || 'IN';
    cleanedData.NoOfRooms = cleanedData.NoOfRooms || "1";
    cleanedData.ClientReferenceNo = cleanedData.ClientReferenceNo || 0;
    cleanedData.IsVoucherBooking = cleanedData.IsVoucherBooking || "true";
    cleanedData.vendorCommission = cleanedData.vendorCommission || vendorCommission || 0;
    cleanedData.CouponDiscount = cleanedData.CouponDiscount || 0;
    cleanedData.UserIp = cleanedData.UserIp || "49.36.217.215";

    // Convert roomTravellerInfo to HotelRoomsDetails if needed
    if (cleanedData.roomTravellerInfo && !cleanedData.HotelRoomsDetails) {
      cleanedData.HotelRoomsDetails = cleanedData.roomTravellerInfo.map((room, index) => {
        if (!room.travellerInfo || !Array.isArray(room.travellerInfo)) {
          throw new Error(`Room ${index + 1} travellerInfo missing or invalid.`);
        }

        return {
          RoomIndex: index + 1,
          HotelPassenger: room.travellerInfo.map((traveller) => {
            const isAdult = parseInt(traveller.PaxType) === 1 || traveller.Age >= 18;
            const passengerName = `${traveller.FirstName} ${traveller.LastName}`;
            if (isAdult) {
              if (!traveller.PAN || typeof traveller.PAN !== 'string') {
                throw new Error(`❌ CRITICAL ERROR: Adult passenger "${passengerName}" missing PAN.`);
              }
              const cleanPAN = traveller.PAN.trim().toUpperCase();
              if (
                !cleanPAN ||
                ['NULL', 'UNDEFINED', 'N/A', 'NA', 'NONE'].includes(cleanPAN) ||
                cleanPAN.replace(/\s/g, '') === ''
              ) {
                throw new Error(`❌ CRITICAL ERROR: Adult passenger "${passengerName}" has invalid PAN "${traveller.PAN}".`);
              }
              if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPAN)) {
                throw new Error(
                  `❌ CRITICAL ERROR: Invalid PAN format "${cleanPAN}" for passenger "${passengerName}". Use format ABCDE1234F.`
                );
              }
              return {
                Title: String(traveller.Title || "Mr").trim(),
                FirstName: String(traveller.FirstName || "").trim(),
                MiddleName: String(traveller.MiddleName || "").trim(),
                LastName: String(traveller.LastName || "").trim(),
                Phoneno: String(traveller.Phoneno || "").replace(/\D/g, ''),
                Email: String(traveller.Email || "").trim().toLowerCase(),
                PaxType: parseInt(traveller.PaxType) || 1,
                LeadPassenger: traveller.LeadPassenger ? "true" : "false",
                Age: traveller.Age && !isNaN(traveller.Age) ? parseInt(traveller.Age) : 0,
                PassportNo: null,
                PassportIssueDate: null,
                PassportExpDate: null,
                PAN: cleanPAN,
                GSTCompanyAddress: traveller.GSTCompanyAddress ? String(traveller.GSTCompanyAddress).trim() : null,
                GSTCompanyContactNumber: traveller.GSTCompanyContactNumber ? String(traveller.GSTCompanyContactNumber).trim() : null,
                GSTCompanyEmail: traveller.GSTCompanyEmail ? String(traveller.GSTCompanyEmail).trim() : null,
                GSTCompanyName: traveller.GSTCompanyName ? String(traveller.GSTCompanyName).trim() : null,
                GSTNumber: traveller.GSTNumber ? String(traveller.GSTNumber).trim() : null,
              };
            } else {
              return {
                Title: String(traveller.Title || "Master").trim(),
                FirstName: String(traveller.FirstName || "").trim(),
                MiddleName: String(traveller.MiddleName || "").trim(),
                LastName: String(traveller.LastName || "").trim(),
                Phoneno: String(traveller.Phoneno || "").replace(/\D/g, ''),
                Email: String(traveller.Email || "").trim().toLowerCase(),
                PaxType: parseInt(traveller.PaxType) || 2,
                LeadPassenger: " ",
                Age: traveller.Age && !isNaN(traveller.Age) ? parseInt(traveller.Age) : 0,
                PassportNo: null,
                PassportIssueDate: null,
                PassportExpDate: null,
                PAN: null,
                GSTCompanyAddress: null,
                GSTCompanyContactNumber: null,
                GSTCompanyEmail: null,
                GSTCompanyName: null,
                GSTNumber: null,
              };
            }
          }),
        };
      });
      delete cleanedData.roomTravellerInfo;
    }

    if (!cleanedData.HotelRoomsDetails || !Array.isArray(cleanedData.HotelRoomsDetails)) {
      throw new Error('No rooms and passenger information found. Please complete booking details.');
    }

    cleanedData.HotelRoomsDetails = cleanedData.HotelRoomsDetails.map((room, index) => {
      if (!room.HotelPassenger || !Array.isArray(room.HotelPassenger) || room.HotelPassenger.length === 0) {
        throw new Error(`Room ${index + 1} has no passengers.`);
      }

      return {
        RoomIndex: room.RoomIndex || (index + 1),
        HotelPassenger: room.HotelPassenger.map((passenger) => {
          const isAdult = parseInt(passenger.PaxType) === 1 || passenger.Age >= 18;
          const passengerName = `${passenger.FirstName} ${passenger.LastName}`;

          if (isAdult) {
            if (!passenger.PAN || typeof passenger.PAN !== 'string') {
              throw new Error(`❌ CRITICAL ERROR: Adult passenger "${passengerName}" missing PAN.`);
            }
            const cleanPAN = passenger.PAN.trim().toUpperCase();
            if (
              !cleanPAN ||
              ['NULL', 'UNDEFINED', 'N/A', 'NA', 'NONE'].includes(cleanPAN) ||
              cleanPAN.replace(/\s/g, '') === ''
            ) {
              throw new Error(`❌ CRITICAL ERROR: Adult passenger "${passengerName}" has invalid PAN "${passenger.PAN}".`);
            }
            if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPAN)) {
              throw new Error(
                `❌ CRITICAL ERROR: Invalid PAN format "${cleanPAN}" for passenger "${passengerName}".`
              );
            }
            return {
              Title: String(passenger.Title || "Mr").trim(),
              FirstName: String(passenger.FirstName || "").trim(),
              MiddleName: String(passenger.MiddleName || "").trim(),
              LastName: String(passenger.LastName || "").trim(),
              Phoneno: String(passenger.Phoneno || "").replace(/\D/g, ''),
              Email: String(passenger.Email || "").trim().toLowerCase(),
              PaxType: parseInt(passenger.PaxType) || 1,
              LeadPassenger: passenger.LeadPassenger === true || passenger.LeadPassenger === "true" ? "true" : "false",
              Age: passenger.Age && !isNaN(passenger.Age) ? parseInt(passenger.Age) : 0,
              PassportNo: null,
              PassportIssueDate: null,
              PassportExpDate: null,
              PAN: cleanPAN,
              GSTCompanyAddress:
                passenger.LeadPassenger === "true" && passenger.GSTCompanyAddress ? String(passenger.GSTCompanyAddress).trim() : null,
              GSTCompanyContactNumber:
                passenger.LeadPassenger === "true" && passenger.GSTCompanyContactNumber
                  ? String(passenger.GSTCompanyContactNumber).trim()
                  : null,
              GSTCompanyEmail:
                passenger.LeadPassenger === "true" && passenger.GSTCompanyEmail ? String(passenger.GSTCompanyEmail).trim() : null,
              GSTCompanyName:
                passenger.LeadPassenger === "true" && passenger.GSTCompanyName ? String(passenger.GSTCompanyName).trim() : null,
              GSTNumber: passenger.LeadPassenger === "true" && passenger.GSTNumber ? String(passenger.GSTNumber).trim() : null,
            };
          } else {
            return {
              Title: String(passenger.Title || "Master").trim(),
              FirstName: String(passenger.FirstName || "").trim(),
              MiddleName: String(passenger.MiddleName || "").trim(),
              LastName: String(passenger.LastName || "").trim(),
              Phoneno: String(passenger.Phoneno || "").replace(/\D/g, ''),
              Email: String(passenger.Email || "").trim().toLowerCase(),
              PaxType: parseInt(passenger.PaxType) || 2,
              LeadPassenger: "false",
              Age: passenger.Age && !isNaN(passenger.Age) ? parseInt(passenger.Age) : 0,
              PassportNo: null,
              PassportIssueDate: null,
              PassportExpDate: null,
              PAN: null,
              GSTCompanyAddress: null,
              GSTCompanyContactNumber: null,
              GSTCompanyEmail: null,
              GSTCompanyName: null,
              GSTNumber: null,
            };
          }
        }),
      };
    });

    delete cleanedData.HotelPassenger;

    // Validate final data
    if (!cleanedData.HotelRoomsDetails || cleanedData.HotelRoomsDetails.length === 0) {
      throw new Error('No rooms found in booking data');
    }
    cleanedData.HotelRoomsDetails.forEach((room, idx) => {
      if (!room.HotelPassenger || room.HotelPassenger.length === 0) {
        throw new Error(`Room ${idx + 1} has no passengers`);
      }
    });

    // Final PAN validation
    const panValidation = validateAllPANs(cleanedData);
    if (!panValidation.isValid) {
      const errMsg = `❌ PAN VALIDATION FAILED:\n\n${panValidation.errors.join('\n')}\n\nBooking cannot proceed without valid, unique PAN numbers for ALL adult passengers.`;
      throw new Error(errMsg);
    }

    return cleanedData;
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
        errorMessage = `❌ PAN MANDATORY ERROR: ${data?.error?.ErrorMessage || data?.Error?.ErrorMessage || 'Mandatory PAN information not available.'}
This error occurs when:
• Duplicate PAN numbers are used
• PAN format is incorrect
• Required PAN data is missing

Please go back and ensure all adults have unique, valid PAN numbers.`;
        return { message: errorMessage, details: errorDetails, isPANError: true };
      }

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
          errorMessage = 'Hotel booking service is temporarily unavailable. Please try again later.';
          if (data?.Error?.ErrorMessage) errorMessage += ` (${data.Error.ErrorMessage})`;
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

  // Toast helpers
  const showErrorToast = (message, additionalInfo = '') => {
    const toastMessage = additionalInfo ? `${message}\n${additionalInfo}` : message;
    toast.error(toastMessage, {
      position: "top-right",
      autoClose: 8000,
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

  // ✅ UPDATED: Payment success handler with invoice integration
  const handlePaymentSuccess = async (response, formattedBookingData, validation) => {
    try {
      const bookingResponse = await bookHotel(formattedBookingData);

      // Check for PAN mandatory errors first
      if (
        bookingResponse?.error?.ErrorCode === 1163 ||
        bookingResponse?.Error?.ErrorCode === 1163 ||
        (bookingResponse?.error?.ErrorMessage?.toLowerCase().includes('mandatory pan'))
      ) {
        const panValidation = validateAllPANs(formattedBookingData);
        const panErrorMsg = `❌ HOTEL API ERROR: PAN MANDATORY
        
Error Code: 1163
Message: ${bookingResponse?.error?.ErrorMessage || bookingResponse?.Error?.ErrorMessage || 'Mandatory PAN info unavailable.'}

This usually occurs due to:
• Duplicate PAN numbers
• Invalid PAN format
• Missing PAN data for adults

PAN Status: ${panValidation.stats.adultsWithPAN}/${panValidation.stats.totalAdults} adults have valid PANs

Please contact support with this information.`;

        setError(panErrorMsg);
        showErrorToast('❌ Hotel API PAN Error', panErrorMsg);
        setLoading(false);
        return;
      }

      // Your existing booking success validation logic...
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

        // ✅ ENHANCED: Prepare invoice data for the confirmation page
        const invoiceData = {
          UserIp: bookingResponse.UserIp || "122.161.64.143",
          SearchTokenId: bookingResponse.SearchTokenId,
          BookingId: String(bookingResponse.BookingID || bookingResponse.userId), // Your API returns BookingID
          receiverEmail: getLeadPassengerEmail(formattedBookingData)
        };

        // ✅ ENHANCED: Navigate with comprehensive data for invoice functionality
        navigate('/hotel/confirmation', {
          state: {
            // Your existing data structure
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

            // ✅ NEW: Additional data for invoice system
            invoiceData: invoiceData,
            isBooked: true,
            bookingDetails: {
              contactData: getLeadPassenger(formattedBookingData),
              searchTokenId: bookingResponse.SearchTokenId,
            },
            bookingResult: bookingResponse
          },
        });

        // ✅ OPTIONAL: Auto-send invoice email (non-blocking)
        try {
          await sendInvoiceEmailAsync(invoiceData);
          console.log('✅ Invoice automatically sent to email');
        } catch (emailError) {
          console.log('⚠️ Auto-email invoice failed (non-critical):', emailError.message);
          // Don't show error to user as this is automatic
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

  // Payment handler
  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      let formattedBookingData;
      try {
        formattedBookingData = formatBookingData(hotelBookingDetails);
      } catch (formatError) {
        if (formatError.message.includes('CRITICAL ERROR') || formatError.message.includes('PAN VALIDATION FAILED')) {
          setError(formatError.message);
          showErrorToast('❌ Booking Data Error', formatError.message);
          setLoading(false);
          return;
        }
        throw formatError;
      }

      const panValidation = validateAllPANs(formattedBookingData);
      if (!panValidation.isValid) {
        const errMsg = `❌ PAN VALIDATION FAILED:\n\n${panValidation.errors.join('\n\n')}\n\nAll adult passengers must have unique, valid PAN numbers.`;
        setError(errMsg);
        showErrorToast('❌ PAN Validation Failed', panValidation.errors.join('\n'));
        setLoading(false);
        return;
      }

      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        const errMsg = 'Payment system failed to load. Please refresh and try again.';
        setError(errMsg);
        showErrorToast('❌ Payment System Error', errMsg);
        setLoading(false);
        return;
      }

      const orderResponse = await createHotelOrder(roundedTotal);
      const order = orderResponse?.order;
      if (!order?.id) throw new Error('Failed to create payment order');

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
              // ✅ UPDATED: Use the new handlePaymentSuccess function with invoice integration
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
      console.error('Payment initialization error:', err);
      const { message: errMsg } = handleApiError(err, 'Payment Initialization');
      setError(errMsg);
      showErrorToast('❌ Payment Initialization Failed', errMsg);
      setLoading(false);
    }
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

  // Helper: count guests
  const getGuestCount = () => {
    if (hotelBookingDetails?.HotelRoomsDetails) {
      return hotelBookingDetails.HotelRoomsDetails.reduce((acc, r) => acc + (r.HotelPassenger?.length || 0), 0);
    }
    if (hotelBookingDetails?.roomTravellerInfo) {
      return hotelBookingDetails.roomTravellerInfo.reduce((acc, r) => acc + (r.travellerInfo?.length || 0), 0);
    }
    return 0;
  };

  // Helper: get lead passenger
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

  // Helper: get adult passengers with PAN validation
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
              !["NULL", "UNDEFINED"].includes(pan.trim().toUpperCase()) &&
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
              !["NULL", "UNDEFINED"].includes(pan.trim().toUpperCase()) &&
              pan.trim() !== "";
            adults.push({ name: `${traveller.FirstName} ${traveller.LastName}`, pan, room: idx + 1, isValid: isValidPAN });
          }
        });
      });
    }
    return adults;
  };

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

  // PAN Mandatory indicator for room / general
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