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

// ✅ FIXED: Enhanced PAN cleaning and validation function
const cleanAndValidatePAN = (pan, isAdult, passengerName = 'Unknown', roomIsPANMandatory = false) => {
  console.log(`🔍 PAN Validation for ${passengerName}:`);
  console.log(`   Original PAN: "${pan}" (type: ${typeof pan})`);
  console.log(`   Is Adult: ${isAdult}`);
  console.log(`   Room PAN Mandatory: ${roomIsPANMandatory}`);

  // Children don't need PAN
  if (!isAdult) {
    console.log(`   ✅ Child passenger - PAN not required`);
    return null;
  }

  // For adults, check if we have PAN data
  if (!pan || typeof pan !== 'string') {
    // ✅ CRITICAL FIX: Always require PAN for adults, regardless of room type
    console.error(`   ❌ CRITICAL: Adult passenger "${passengerName}" missing PAN`);
    throw new Error(`❌ CRITICAL ERROR: Adult passenger "${passengerName}" requires a valid PAN number. Please go back and add PAN number.`);
  }

  const cleanPAN = pan.trim().toUpperCase();
  console.log(`   Clean PAN: "${cleanPAN}"`);

  // Check for invalid values including empty spaces
  const invalidValues = ['', 'NULL', 'UNDEFINED', 'N/A', 'NA', 'NONE'];
  const isEmptyOrInvalid = invalidValues.includes(cleanPAN) ||
    cleanPAN.replace(/\s/g, '') === '' ||
    cleanPAN.length === 0;

  if (isEmptyOrInvalid) {
    // ✅ CRITICAL FIX: Always require valid PAN for adults
    console.error(`   ❌ CRITICAL: Invalid PAN "${cleanPAN}" for adult passenger`);
    throw new Error(`❌ CRITICAL ERROR: Adult passenger "${passengerName}" has invalid PAN "${pan}". Please go back and enter a valid PAN number.`);
  }

  // Validate PAN format: 5 letters + 4 digits + 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(cleanPAN)) {
    const errorMsg = `Invalid PAN format for "${passengerName}": "${cleanPAN}". Expected format: ABCDE1234F (5 letters + 4 digits + 1 letter)`;
    console.error(`   ❌ CRITICAL: ${errorMsg}`);
    throw new Error(`❌ CRITICAL ERROR: ${errorMsg}. Please go back and correct the PAN number.`);
  }

  console.log(`   ✅ Valid PAN: "${cleanPAN}"`);
  return cleanPAN;
};

// ✅ ENHANCED: Updated validation function with mandatory PAN for all adults
const validatePANForAllAdults = (bookingData) => {
  const errors = [];
  let totalAdults = 0;
  let adultsWithValidPAN = 0;
  let adultsWithoutPAN = [];

  const isValidPAN = (pan) => {
    if (!pan || typeof pan !== 'string') return false;
    const cleanPAN = pan.trim().toUpperCase();
    // ✅ CRITICAL: Check for empty spaces and invalid values
    if (cleanPAN === '' ||
      cleanPAN === 'NULL' ||
      cleanPAN === 'UNDEFINED' ||
      cleanPAN.replace(/\s/g, '') === '' ||
      cleanPAN.length === 0) return false;
    // PAN format: 5 letters + 4 digits + 1 letter
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPAN);
  };

  // Check HotelRoomsDetails structure
  if (bookingData.HotelRoomsDetails && Array.isArray(bookingData.HotelRoomsDetails)) {
    bookingData.HotelRoomsDetails.forEach((room, roomIndex) => {
      if (room.HotelPassenger && Array.isArray(room.HotelPassenger)) {
        room.HotelPassenger.forEach((passenger, passengerIndex) => {
          // Check if passenger is adult (PaxType = 1 OR Age >= 18)
          const isAdult = parseInt(passenger.PaxType) === 1 || passenger.Age >= 18;

          if (isAdult) {
            totalAdults++;
            console.log(`🔍 Adult Passenger: ${passenger.FirstName} ${passenger.LastName}`);
            console.log(`   Age: ${passenger.Age}, PaxType: ${passenger.PaxType}`);
            console.log(`   PAN: "${passenger.PAN}"`);

            if (isValidPAN(passenger.PAN)) {
              adultsWithValidPAN++;
              console.log(`   ✅ Valid PAN: ${passenger.PAN}`);
            } else {
              adultsWithoutPAN.push({
                name: `${passenger.FirstName} ${passenger.LastName}`,
                room: roomIndex + 1,
                passenger: passengerIndex + 1,
                pan: passenger.PAN
              });
              console.error(`   ❌ Invalid PAN: "${passenger.PAN}"`);
            }
          }
        });
      }
    });
  }

  console.log(`\n📊 PAN Validation Summary:`);
  console.log(`   Total Adults: ${totalAdults}`);
  console.log(`   Adults with Valid PAN: ${adultsWithValidPAN}`);
  console.log(`   Adults without Valid PAN: ${adultsWithoutPAN.length}`);

  // ✅ CRITICAL FIX: ALL adults must have valid PAN
  if (totalAdults > 0 && adultsWithValidPAN !== totalAdults) {
    errors.push(`❌ ALL adult passengers require valid PAN numbers. Found ${totalAdults} adults but only ${adultsWithValidPAN} have valid PAN.`);
    
    adultsWithoutPAN.forEach(adult => {
      errors.push(`${adult.name} (Room ${adult.room}) - Invalid/Missing PAN: "${adult.pan || 'Not provided'}"`);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    summary: {
      totalAdults,
      adultsWithValidPAN,
      adultsWithoutPAN: adultsWithoutPAN.length
    }
  };
};

// ✅ UPDATED: Enhanced format function with strict PAN requirements
const formatBookingData = (bookingDetails) => {
  console.log('🏗️ Starting booking data formatting...');
  console.log('📦 Input booking details:', bookingDetails);

  // First apply GST filtering
  const gstFilteredData = filterGSTForLeadPassengerOnly(bookingDetails);
  const cleanedData = { ...gstFilteredData };

  // Ensure required top-level fields exist with proper values
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

  // ✅ CRITICAL FIX: Convert roomTravellerInfo to HotelRoomsDetails if needed
  if (cleanedData.roomTravellerInfo && !cleanedData.HotelRoomsDetails) {
    console.log('🔄 Converting roomTravellerInfo to HotelRoomsDetails...');

    cleanedData.HotelRoomsDetails = cleanedData.roomTravellerInfo.map((room, index) => {
      const roomData = {
        RoomIndex: index + 1,
        HotelPassenger: []
      };

      if (room.travellerInfo && Array.isArray(room.travellerInfo)) {
        roomData.HotelPassenger = room.travellerInfo.map((traveller, travellerIndex) => {
          const isAdult = parseInt(traveller.PaxType) === 1 || traveller.Age >= 18;
          const passengerName = `${traveller.FirstName} ${traveller.LastName}`;
          
          // ✅ CRITICAL FIX: Always require PAN for adults
          const cleanPAN = cleanAndValidatePAN(traveller.PAN, isAdult, passengerName, true);

          const passengerData = {
            Title: String(traveller.Title || "Mr").trim(),
            FirstName: String(traveller.FirstName || "").trim(),
            MiddleName: String(traveller.MiddleName || "").trim(),
            LastName: String(traveller.LastName || "").trim(),
            Phoneno: String(traveller.Phoneno || "").replace(/\D/g, ''),
            Email: String(traveller.Email || "").trim().toLowerCase(),
            PaxType: parseInt(traveller.PaxType) || 1,
            LeadPassenger: traveller.LeadPassenger ? "true" : "false",
            Age: traveller.Age && !isNaN(traveller.Age) ? parseInt(traveller.Age) : 0,

            // Passport fields - always null for domestic bookings
            PassportNo: null,
            PassportIssueDate: null,
            PassportExpDate: null,

            // ✅ CRITICAL FIX: PAN is mandatory for all adults
            PAN: isAdult ? cleanPAN : null,

            // GST fields - already filtered by filterGSTForLeadPassengerOnly
            GSTCompanyAddress: traveller.GSTCompanyAddress ? String(traveller.GSTCompanyAddress).trim() : null,
            GSTCompanyContactNumber: traveller.GSTCompanyContactNumber ? String(traveller.GSTCompanyContactNumber).trim() : null,
            GSTCompanyEmail: traveller.GSTCompanyEmail ? String(traveller.GSTCompanyEmail).trim() : null,
            GSTCompanyName: traveller.GSTCompanyName ? String(traveller.GSTCompanyName).trim() : null,
            GSTNumber: traveller.GSTNumber ? String(traveller.GSTNumber).trim() : null
          };

          console.log(`🔍 Processed Passenger: ${passengerData.FirstName} ${passengerData.LastName}`);
          console.log(`   IsAdult: ${isAdult}, PAN: ${passengerData.PAN || 'NULL'}`);

          return passengerData;
        });
      }

      console.log(`🏠 Room ${index + 1} processed with ${roomData.HotelPassenger.length} passengers`);
      return roomData;
    });

    // Remove old structure
    delete cleanedData.roomTravellerInfo;
  }

  // ✅ CRITICAL FIX: Process existing HotelRoomsDetails if present
  if (cleanedData.HotelRoomsDetails && Array.isArray(cleanedData.HotelRoomsDetails)) {
    console.log('🔄 Processing existing HotelRoomsDetails...');

    cleanedData.HotelRoomsDetails = cleanedData.HotelRoomsDetails.map((room, index) => {
      const processedRoom = {
        RoomIndex: room.RoomIndex || (index + 1),
        HotelPassenger: []
      };

      if (room.HotelPassenger && Array.isArray(room.HotelPassenger)) {
        processedRoom.HotelPassenger = room.HotelPassenger.map((passenger, passengerIndex) => {
          const isAdult = parseInt(passenger.PaxType) === 1 || passenger.Age >= 18;
          const passengerName = `${passenger.FirstName} ${passenger.LastName}`;
          
          // ✅ CRITICAL FIX: Always require PAN for adults
          const cleanPAN = cleanAndValidatePAN(passenger.PAN, isAdult, passengerName, true);

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

            // ✅ CRITICAL FIX: PAN is mandatory for all adults
            PAN: isAdult ? cleanPAN : null,

            // GST fields - already filtered
            GSTCompanyAddress: passenger.GSTCompanyAddress ? String(passenger.GSTCompanyAddress).trim() : null,
            GSTCompanyContactNumber: passenger.GSTCompanyContactNumber ? String(passenger.GSTCompanyContactNumber).trim() : null,
            GSTCompanyEmail: passenger.GSTCompanyEmail ? String(passenger.GSTCompanyEmail).trim() : null,
            GSTCompanyName: passenger.GSTCompanyName ? String(passenger.GSTCompanyName).trim() : null,
            GSTNumber: passenger.GSTNumber ? String(passenger.GSTNumber).trim() : null
          };

          console.log(`🔍 Processed Passenger: ${processedPassenger.FirstName} ${processedPassenger.LastName}`);
          console.log(`   IsAdult: ${isAdult}, PAN: ${processedPassenger.PAN || 'NULL'}`);

          return processedPassenger;
        });
      } else {
        console.error(`❌ Room ${index + 1} is missing HotelPassenger array!`);
        throw new Error(`Room ${index + 1} is missing passenger information. Please go back and add passenger details.`);
      }

      console.log(`🏠 Room ${index + 1} processed with ${processedRoom.HotelPassenger.length} passengers`);
      return processedRoom;
    });
  } else {
    console.error('❌ No HotelRoomsDetails found in booking data!');
    throw new Error('No room and passenger information found. Please go back and complete the booking form.');
  }

  // ✅ CRITICAL: Remove any top-level HotelPassenger to avoid confusion
  delete cleanedData.HotelPassenger;

  // ✅ Final validation to ensure structure is correct
  if (!cleanedData.HotelRoomsDetails || cleanedData.HotelRoomsDetails.length === 0) {
    throw new Error('No rooms found in booking data');
  }

  cleanedData.HotelRoomsDetails.forEach((room, index) => {
    if (!room.HotelPassenger || room.HotelPassenger.length === 0) {
      throw new Error(`Room ${index + 1} has no passengers`);
    }
  });

  console.log('✅ Booking data formatting completed');
  return cleanedData;
};

// ✅ UPDATED: Enhanced booking payload validation with mandatory PAN check
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
  let totalAdults = 0;
  let adultsWithPAN = 0;

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

      // Check LeadPassenger
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

      // PaxType validation
      if (passenger.PaxType && ![1, 2, 3].includes(parseInt(passenger.PaxType))) {
        errors.push(`Room ${roomIdx + 1}, Passenger ${passengerIdx + 1}: Invalid PaxType (${passenger.PaxType}), must be 1, 2, or 3`);
      }

      // ✅ CRITICAL FIX: Mandatory PAN validation for ALL adults
      const isAdult = parseInt(passenger.PaxType) === 1 || passenger.Age >= 18;

      if (isAdult) {
        totalAdults++;

        // Check if PAN exists and is valid
        const hasPAN = passenger.PAN &&
          typeof passenger.PAN === 'string' &&
          passenger.PAN.trim() !== '' &&
          passenger.PAN.trim().toUpperCase() !== 'NULL' &&
          passenger.PAN.trim().toUpperCase() !== 'UNDEFINED' &&
          passenger.PAN.replace(/\s/g, '') !== '';

        if (hasPAN) {
          adultsWithPAN++;
          // Validate PAN format
          const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
          if (!panRegex.test(passenger.PAN.trim().toUpperCase())) {
            errors.push(`Room ${roomIdx + 1}, Passenger ${passengerIdx + 1}: Invalid PAN format (${passenger.PAN}). Expected format: ABCDE1234F`);
          }
        } else {
          // ✅ CRITICAL: PAN is now mandatory for ALL adults
          errors.push(`Room ${roomIdx + 1}, Passenger ${passengerIdx + 1}: PAN is MANDATORY for all adults (Age: ${passenger.Age}, PaxType: ${passenger.PaxType})`);
        }
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

  // ✅ CRITICAL: Ensure ALL adults have PAN
  if (totalAdults > 0 && adultsWithPAN !== totalAdults) {
    errors.push(`❌ CRITICAL: ALL ${totalAdults} adult passengers must have valid PAN numbers. Currently only ${adultsWithPAN} have PAN.`);
  }

  console.log(`📊 Final Validation: ${adultsWithPAN}/${totalAdults} adults have valid PAN numbers`);

  return errors;
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

  // ✅ UPDATED: Enhanced handlePayment function with PAN-mandatory room support
  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🚀 Starting payment process...');
      console.log('📦 Original booking details:', hotelBookingDetails);

      const gstFilteredData = filterGSTForLeadPassengerOnly(hotelBookingDetails);
      verifyGSTFiltering(gstFilteredData);

      // ✅ Get room PAN requirement info
      const roomIsPANMandatory = location.state?.isPANMandatory ||
        location.state?.room?.IsPANMandatory ||
        false;

      console.log('🔍 Room PAN Mandatory:', roomIsPANMandatory);

      try {
        const formattedBookingData = formatBookingData(gstFilteredData);

        // ✅ Additional PAN validation for PAN-mandatory rooms
        if (roomIsPANMandatory) {
          console.log('🔍 Performing additional PAN validation for PAN-mandatory room...');

          let adultsCount = 0;
          let adultsWithValidPAN = 0;

          if (formattedBookingData.HotelRoomsDetails) {
            formattedBookingData.HotelRoomsDetails.forEach(room => {
              room.HotelPassenger?.forEach(passenger => {
                const isAdult = parseInt(passenger.PaxType) === 1 || passenger.Age >= 18;
                if (isAdult) {
                  adultsCount++;
                  if (passenger.PAN && passenger.PAN.length === 10) {
                    adultsWithValidPAN++;
                  }
                }
              });
            });
          }

          console.log(`📊 PAN Check: ${adultsWithValidPAN}/${adultsCount} adults have valid PAN`);

          if (adultsCount > 0 && adultsWithValidPAN !== adultsCount) {
            const errorMessage = `❌ PAN Validation Failed for PAN-Mandatory Room:\n\n${adultsCount - adultsWithValidPAN} adult passenger(s) are missing valid PAN numbers.\n\nThis room requires PAN numbers for ALL adult guests.\n\nPlease go back and ensure all adults have valid PAN numbers in format: ABCDE1234F`;
            setError(errorMessage);
            showErrorToast('PAN Required for Room', errorMessage);
            setLoading(false);
            return;
          }
        }

        // Continue with existing validation...
        const panValidation = validatePANForAllAdults(formattedBookingData);

        if (!panValidation.isValid) {
          const errorMessage = `❌ PAN Validation Failed:\n\n${panValidation.errors.join('\n\n')}`;
          setError(errorMessage);
          showErrorToast('PAN Validation Failed', panValidation.errors.join('\n'));
          setLoading(false);
          return;
        }

        console.log('✅ PAN validation passed:', panValidation.summary);

        // ✅ Additional payload validation
        const validationErrors = validateBookingPayload(formattedBookingData);

        if (validationErrors.length > 0) {
          const errorMessage = `Booking validation failed:\n• ${validationErrors.join('\n• ')}`;
          setError(errorMessage);
          showErrorToast('Booking Validation Failed', validationErrors.join('\n• '));
          setLoading(false);
          return;
        }

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

                // ✅ CRITICAL FIX: Keep the structure intact, just create logging version
                const loggingPayload = {
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
                };

                console.log('📦 Final booking payload (PAN hidden for logging):', loggingPayload);

                // ✅ CRITICAL: Use the original finalPayload for API call, not the logging version
                try {
                  const bookingResponse = await bookHotel(finalPayload);

                  console.log('📦 Booking API response:', bookingResponse);

                  // ✅ ENHANCED: Robust booking status check
                  const isBookingSuccessful =
                    // Primary check for API response structure
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

                  // ✅ Check for required booking data
                  const hasRequiredBookingData =
                    bookingResponse?.userId &&
                    bookingResponse?.SearchTokenId &&
                    bookingResponse?.UserIp;

                  // ✅ Additional validation for complete booking response
                  const isCompleteBookingResponse =
                    bookingResponse?.message &&
                    hasRequiredBookingData;

                  if (isBookingSuccessful && isCompleteBookingResponse) {
                    showSuccessToast('🎉 Hotel booking confirmed successfully!');

                    navigate('/hotel/confirmation', {
                      state: {
                        booking: bookingResponse,
                        amount: roundedTotal,
                        reviewData,
                        hotelDetails: {
                          name: finalPayload?.HotelName,
                          code: finalPayload?.HotelCode,
                        },
                        paymentDetails: {
                          orderId: response.razorpay_order_id,
                          paymentId: response.razorpay_payment_id
                        },
                        confirmationDetails: {
                          userId: bookingResponse.userId,
                          searchTokenId: bookingResponse.SearchTokenId,
                          bookingId: bookingResponse.BookingID,
                          userIp: bookingResponse.UserIp,
                          message: bookingResponse.message,
                          bookingTime: new Date().toISOString()
                        }
                      }
                    });

                  } else {
                    // ❌ Handle booking failure with detailed error messaging
                    let errorMessage = 'Booking failed. Please contact support with your payment details.';

                    if (bookingResponse?.Error?.ErrorMessage) {
                      errorMessage = bookingResponse.Error.ErrorMessage;
                    } else if (bookingResponse?.error?.message) {
                      errorMessage = bookingResponse.error.message;
                    } else if (bookingResponse?.message && !bookingResponse.message.toLowerCase().includes('successfully')) {
                      errorMessage = `Booking Issue: ${bookingResponse.message}`;
                    } else if (typeof bookingResponse?.error === 'string') {
                      errorMessage = bookingResponse.error;
                    } else if (!hasRequiredBookingData) {
                      errorMessage = 'Booking response is missing required confirmation data. Please contact support.';
                    } else if (!isBookingSuccessful) {
                      errorMessage = 'Booking status could not be confirmed. Please contact support.';
                    }

                    showErrorToast('❌ Booking Failed', errorMessage);
                    setError(`Booking Failed: ${errorMessage}`);

                    console.error('Booking failure details:', {
                      isBookingSuccessful,
                      hasRequiredBookingData,
                      isCompleteBookingResponse,
                      responseMessage: bookingResponse?.message,
                      fullResponse: bookingResponse
                    });
                  }
                } catch (bookingError) {
                  const { message: errorMessage, details } = handleApiError(bookingError, 'Hotel Booking');
                  setError(`Booking Error: ${errorMessage}`);
                  showErrorToast('❌ Booking API Error', errorMessage);

                  console.error('Booking API Error:', { error: bookingError, details });
                }
              } else {
                const validationError = validation?.message || 'Payment validation failed.';
                setError(validationError);
                showErrorToast('❌ Payment Validation Failed', validationError);
              }
            } catch (err) {
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

      } catch (formatError) {
        // ✅ Handle PAN validation errors specifically
        if (formatError.message.includes('CRITICAL ERROR')) {
          setError(formatError.message);
          showErrorToast('❌ PAN Validation Error', formatError.message);
          setLoading(false);
          return;
        }
        throw formatError; // Re-throw other errors
      }

    } catch (err) {
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