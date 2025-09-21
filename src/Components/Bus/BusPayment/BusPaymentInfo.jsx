import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaExclamationTriangle, FaPhone, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { createBusPaymentOrder, validateBusPayment, bookBus, downloadBusInvoice } from '../../APIS/BusApi/BusApis';

const BusPaymentInfo = ({ couponDiscount = 0, appliedCouponData = null }) => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [error, setError] = useState(null);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [paymentSuccessData, setPaymentSuccessData] = useState(null);

    // Debug mode configuration
    const DEBUG_MODE = process.env.NODE_ENV === 'development';
    const debugLog = (message, data = null) => {
        if (DEBUG_MODE) {
            console.log(message, data);
        }
    };

    useEffect(() => {
        if (!state || !state.totalPrice || !state.selectedSeats || !state.passengerData) {
            setError('Missing required booking information. Please start over.');
        }
    }, [state]);

    const {
        bus = {},
        selectedSeats = [],
        totalPrice = 0,
        fromCity = '',
        toCity = '',
        departDate = '',
        passengerData = [],
        contactData = {},
        busBookingData = {},
        searchTokenId = '',
        selectedBoardingPoint = {},
        selectedDroppingPoint = {},
        boardingPoint = {},
        droppingPoint = {},
        vendorCommission = ''
    } = state || {};

    // Enhanced fare calculation function with coupon discount integration
    const calculateFareBreakdown = () => {
        console.log("Calculating fare breakdown from state:", state);
        console.log("Coupon discount from props:", couponDiscount);

        // Initialize fare calculation object
        const fareData = {
            basePrice: 0,
            publishedPrice: 0,
            offeredPrice: 0,
            tax: 0,
            otherCharges: 0,
            serviceCharges: 0,
            agentCommission: 0,
            tds: 0,
            discount: 0,
            gst: {
                cgstAmount: 0,
                sgstAmount: 0,
                igstAmount: 0,
                total: 0
            },
            commissionPercentage: 0,
            numberOfSeats: selectedSeats?.length || 0,
            couponDiscount: Number(couponDiscount || 0)
        };

        // Method 1: Calculate from selected seats (most accurate)
        if (selectedSeats && selectedSeats.length > 0) {
            console.log("Calculating from selected seats:", selectedSeats);

            let totals = {
                basePrice: 0,
                publishedPrice: 0,
                offeredPrice: 0,
                tax: 0,
                otherCharges: 0,
                serviceCharges: 0,
                agentCommission: 0,
                tds: 0,
                discount: 0,
                cgst: 0,
                sgst: 0,
                igst: 0
            };

            selectedSeats.forEach(seat => {
                const seatPriceObj = seat?.Price || seat;

                totals.basePrice += Number(seatPriceObj?.BasePrice || 0);
                totals.publishedPrice += Number(seatPriceObj?.PublishedPrice || 0);
                totals.offeredPrice += Number(seatPriceObj?.OfferedPrice || 0);
                totals.tax += Number(seatPriceObj?.Tax || 0);
                totals.otherCharges += Number(seatPriceObj?.OtherCharges || 0);
                totals.serviceCharges += Number(seatPriceObj?.ServiceCharges || 0);
                totals.agentCommission += Number(seatPriceObj?.AgentCommission || 0);
                totals.tds += Number(seatPriceObj?.TDS || 0);
                totals.discount += Number(seatPriceObj?.Discount || 0);

                // Handle GST object structure
                if (seatPriceObj?.GST && typeof seatPriceObj.GST === 'object') {
                    totals.cgst += Number(seatPriceObj.GST.CGSTAmount || 0);
                    totals.sgst += Number(seatPriceObj.GST.SGSTAmount || 0);
                    totals.igst += Number(seatPriceObj.GST.IGSTAmount || 0);
                } else {
                    totals.igst += Number(seatPriceObj?.GST || 0);
                }
            });

            // Set fare data from calculated totals
            fareData.basePrice = totals.basePrice;
            fareData.publishedPrice = totals.publishedPrice;
            fareData.offeredPrice = totals.offeredPrice;
            fareData.tax = totals.tax;
            fareData.otherCharges = totals.otherCharges;
            fareData.serviceCharges = totals.serviceCharges;
            fareData.agentCommission = totals.agentCommission;
            fareData.tds = totals.tds;
            fareData.discount = totals.discount;
            fareData.gst = {
                cgstAmount: totals.cgst,
                sgstAmount: totals.sgst,
                igstAmount: totals.igst,
                total: totals.cgst + totals.sgst + totals.igst
            };
        }

        // Method 2: Use bus data if seat data not available
        else if (bus?.originalBusPrice || bus?.BusPrice || bus?.Price) {
            console.log("Calculating from bus data:", bus);
            const busPriceObj = bus.originalBusPrice || bus.BusPrice || bus.Price;

            fareData.basePrice = Number(busPriceObj.BasePrice || 0);
            fareData.publishedPrice = Number(busPriceObj.PublishedPrice || 0);
            fareData.offeredPrice = Number(busPriceObj.OfferedPrice || 0);
            fareData.tax = Number(busPriceObj.Tax || 0);
            fareData.otherCharges = Number(busPriceObj.OtherCharges || 0);
            fareData.serviceCharges = Number(busPriceObj.ServiceCharges || 0);
            fareData.agentCommission = Number(busPriceObj.AgentCommission || 0);
            fareData.tds = Number(busPriceObj.TDS || 0);
            fareData.discount = Number(busPriceObj.Discount || 0);

            // Handle GST object structure
            if (busPriceObj.GST && typeof busPriceObj.GST === 'object') {
                fareData.gst = {
                    cgstAmount: Number(busPriceObj.GST.CGSTAmount || 0),
                    sgstAmount: Number(busPriceObj.GST.SGSTAmount || 0),
                    igstAmount: Number(busPriceObj.GST.IGSTAmount || 0),
                    total: Number(busPriceObj.GST.CGSTAmount || 0) +
                        Number(busPriceObj.GST.SGSTAmount || 0) +
                        Number(busPriceObj.GST.IGSTAmount || 0)
                };
            } else {
                fareData.gst = {
                    cgstAmount: 0,
                    sgstAmount: 0,
                    igstAmount: Number(busPriceObj.GST || 0),
                    total: Number(busPriceObj.GST || 0)
                };
            }
        }

        // Method 3: Use state total price as fallback
        else if (totalPrice && totalPrice > 0) {
            console.log("Using state total price:", totalPrice);
            fareData.publishedPrice = Number(totalPrice);
            fareData.basePrice = Number(totalPrice);
            fareData.offeredPrice = Number(totalPrice);

            // Calculate basic 18% GST on total price as fallback
            const calculatedGST = fareData.publishedPrice * 0.18;
            fareData.gst = {
                cgstAmount: 0,
                sgstAmount: 0,
                igstAmount: calculatedGST,
                total: calculatedGST
            };
        }

        // Get dynamic commission percentage
        fareData.commissionPercentage = Number(
            bus?.vendorCommissionPercentage ||
            bus?.originalBusPrice?.rasutripCommissionPercentage ||
            state?.vendorCommissionPercentage ||
            vendorCommission ||
            0
        );

        console.log("Final calculated fare data with coupon:", fareData);
        return fareData;
    };

    // Calculate fare breakdown
    const fareBreakdown = calculateFareBreakdown();

    // Calculate convenience fee (vendor commission)
    const convenienceFee = fareBreakdown.commissionPercentage > 0 ?
        (fareBreakdown.publishedPrice * fareBreakdown.commissionPercentage) / 100 : 0;

    // Calculate subtotal (before convenience fee and coupon discount)
    const subtotal = fareBreakdown.publishedPrice +
        fareBreakdown.serviceCharges +
        fareBreakdown.tax +
        fareBreakdown.otherCharges +
        fareBreakdown.gst.total +
        fareBreakdown.agentCommission -
        fareBreakdown.discount -
        fareBreakdown.tds;

    // Add convenience fee
    const totalBeforeCoupon = subtotal + convenienceFee;

    // Apply coupon discount to get final amount
    const finalAmount = Math.max(0, totalBeforeCoupon - fareBreakdown.couponDiscount).toFixed(2);

    // Helper function to calculate dynamic vendor commission
    const calculateDynamicVendorCommission = (bookingState) => {
        // Try to get commission from multiple sources
        const commissionSources = [
            bookingState.vendorCommission,
            bookingState.bus?.vendorCommission,
            bookingState.bus?.vendorCommissionPercentage,
            bookingState.bus?.originalBusPrice?.rasutripCommissionPercentage,
            bookingState.busBookingData?.vendorCommission,
            vendorCommission, // From component props/state
            fareBreakdown.commissionPercentage
        ];

        let commission = 0;

        for (const source of commissionSources) {
            if (source && !isNaN(parseFloat(source))) {
                commission = parseFloat(source);
                break;
            }
        }

        // If commission is percentage, calculate amount
        if (commission > 0 && commission <= 100) {
            // Assume it's percentage, calculate amount from total price
            const basePrice = bookingState.totalPrice || fareBreakdown.publishedPrice || 0;
            commission = (basePrice * commission) / 100;
        }

        console.log('Calculated dynamic vendor commission:', commission);
        return parseFloat(commission.toFixed(2));
    };

    // FIXED: Enhanced seat name extraction that preserves original seat identifiers
    const extractSeatNameForAPI = (seat, index) => {
        console.log(`🔍 Extracting API-compatible seat name for passenger ${index + 1}:`);
        console.log('Raw seat data:', JSON.stringify(seat, null, 2));

        if (!seat) {
            console.warn(`No seat data for index ${index}`);
            return null; // Return null instead of fallback to avoid invalid seat names
        }

        // Strategy 1: Direct seat identifier fields (PRESERVE ORIGINAL VALUES)
        const seatIdentifierFields = [
            'SeatName', 'SeatNo', 'Name', 'seatName', 'seatNo',
            'SeatNumber', 'Position', 'Code', 'SeatCode', 'id', 'SeatId'
        ];

        // Check direct properties first
        for (const field of seatIdentifierFields) {
            const value = seat[field];
            if (value !== null && value !== undefined && value !== '') {
                console.log(`✅ Found seat identifier using '${field}': ${value}`);
                // IMPORTANT: Return the original value, don't convert to number
                return String(value); // Convert to string but preserve original format
            }
        }

        // Strategy 2: Check nested objects (like seat.Price, seat.Seat, etc.)
        const nestedObjects = ['Price', 'Seat', 'Details', 'Info'];
        for (const objKey of nestedObjects) {
            if (seat[objKey] && typeof seat[objKey] === 'object') {
                for (const field of seatIdentifierFields) {
                    const value = seat[objKey][field];
                    if (value !== null && value !== undefined && value !== '') {
                        console.log(`✅ Found seat identifier in ${objKey}.${field}: ${value}`);
                        return String(value);
                    }
                }
            }
        }

        // Strategy 3: Look for any property containing seat information
        const searchForSeatInfo = (obj, path = '') => {
            if (!obj || typeof obj !== 'object') return null;

            for (const [key, value] of Object.entries(obj)) {
                const currentPath = path ? `${path}.${key}` : key;

                // If key suggests it's a seat identifier
                if (key.toLowerCase().includes('seat') &&
                    value !== null && value !== undefined && value !== '') {
                    console.log(`✅ Found potential seat info at ${currentPath}: ${value}`);
                    return String(value);
                }

                // Recursively search nested objects
                if (typeof value === 'object' && value !== null) {
                    const nestedResult = searchForSeatInfo(value, currentPath);
                    if (nestedResult) return nestedResult;
                }
            }
            return null;
        };

        const foundSeatInfo = searchForSeatInfo(seat);
        if (foundSeatInfo) {
            return foundSeatInfo;
        }

        // Strategy 4: If seat is a direct value that looks like a seat identifier
        if (typeof seat === 'string' || typeof seat === 'number') {
            const seatValue = String(seat);
            if (seatValue.trim() !== '' && seatValue !== '0') {
                console.log(`✅ Using seat as direct value: ${seatValue}`);
                return seatValue;
            }
        }

        console.error(`❌ No valid seat identifier found for index ${index}:`, seat);
        return null; // Return null to trigger error handling
    };

    // Enhanced passenger formatter with better error handling
    const formatPassengerWithValidSeatName = (passenger, correspondingSeat, index, contactData, fromCity, toCity) => {
        // Extract seat name - this is critical for the API
        const seatName = extractSeatNameForAPI(correspondingSeat, index);

        if (seatName === null || seatName === undefined || seatName === '') {
            throw new Error(`Unable to extract valid seat name for passenger ${index + 1}. Seat data: ${JSON.stringify(correspondingSeat)}`);
        }

        console.log(`✅ Final seat assignment for passenger ${index + 1}: "${seatName}" (type: ${typeof seatName})`);

        // Get address with proper fallback
        const validAddress = getValidAddress(passenger, contactData, fromCity, toCity);

        // Get contact details with validation
        const emailAddress = contactData?.email || passenger.email || '';
        const phoneNumber = contactData?.mobile || contactData?.phone || passenger.phone || '';

        // Validate required fields before API call
        if (!passenger.firstName?.trim()) {
            throw new Error(`First name is required for passenger ${index + 1}`);
        }

        if (!passenger.lastName?.trim()) {
            throw new Error(`Last name is required for passenger ${index + 1}`);
        }

        if (!emailAddress || !emailAddress.includes('@')) {
            throw new Error(`Valid email is required for booking`);
        }

        if (!phoneNumber?.trim()) {
            throw new Error(`Phone number is required for booking`);
        }

        return {
            LeadPassenger: index === 0,
            Title: passenger.title || (passenger.gender === 'Male' ? 'Mr' : 'Ms'),
            FirstName: passenger.firstName.trim(),
            LastName: passenger.lastName.trim(),
            Email: emailAddress.trim(),
            Phoneno: phoneNumber.replace(/\D/g, ''), // Remove non-digits
            Gender: passenger.gender === 'Male' ? '1' : '2',
            IdType: passenger.idType || null,
            IdNumber: passenger.idNumber || null,
            Address: validAddress,
            Age: passenger.age?.toString() || '',
            SeatName: seatName 
        };
    };

    // Debug function to validate seat data before booking
    const validateSeatDataBeforeBooking = (selectedSeats, passengerData) => {
        console.log('🔍 Validating seat data before booking...');
        console.log('Selected seats:', selectedSeats);
        console.log('Passengers:', passengerData?.length);

        if (!selectedSeats || !Array.isArray(selectedSeats)) {
            throw new Error('No seats selected');
        }

        if (!passengerData || !Array.isArray(passengerData)) {
            throw new Error('No passenger data provided');
        }

        if (selectedSeats.length !== passengerData.length) {
            throw new Error(`Seat count (${selectedSeats.length}) doesn't match passenger count (${passengerData.length})`);
        }

        // Validate each seat has a valid identifier
        const seatValidationResults = selectedSeats.map((seat, index) => {
            const seatName = extractSeatNameForAPI(seat, index);
            return {
                index,
                seat,
                extractedSeatName: seatName,
                isValid: seatName !== null && seatName !== undefined && seatName !== ''
            };
        });

        console.table(seatValidationResults);

        const invalidSeats = seatValidationResults.filter(result => !result.isValid);
        if (invalidSeats.length > 0) {
            console.error('Invalid seats found:', invalidSeats);
            throw new Error(`Invalid seat identifiers found for passengers: ${invalidSeats.map(s => s.index + 1).join(', ')}`);
        }

        console.log('✅ All seats validated successfully');
        return true;
    };

    // Updated formatBookingData function with validation
    const formatBookingData = (bookingState) => {
        console.log('Formatting booking data...');

        // Validate seat data first
        validateSeatDataBeforeBooking(bookingState.selectedSeats, bookingState.passengerData);

        const passengers = bookingState.passengerData?.map((passenger, index) => {
            const correspondingSeat = bookingState.selectedSeats?.[index];
            return formatPassengerWithValidSeatName(
                passenger,
                correspondingSeat,
                index,
                bookingState.contactData,
                bookingState.fromCity,
                bookingState.toCity
            );
        }) || [];

        // Calculate vendor commission
        const dynamicVendorCommission = calculateDynamicVendorCommission(bookingState);

        const bookingData = {
            UserIp: "122.161.64.143",
            SearchTokenId: bookingState.searchTokenId || bookingState.bus?.SearchTokenId || "",
            ResultIndex: bookingState.busBookingData?.ResultIndex || bookingState.bus?.ResultIndex || "TB-1",
            BoardingPointId: bookingState.selectedBoardingPoint?.BoardingPointId ||
                bookingState.boardingPoint?.BoardingPointId ||
                bookingState.boardingPoint?.id || 1,
            DroppingPointId: bookingState.selectedDroppingPoint?.DroppingPointId ||
                bookingState.droppingPoint?.DroppingPointId ||
                bookingState.droppingPoint?.id || 1,
            vendorCommission: dynamicVendorCommission || 0,
            CouponDiscount: fareBreakdown.couponDiscount || 0,
            Passenger: passengers
        };

        console.log('Final booking data with seat validation:', JSON.stringify(bookingData, null, 2));
        console.log('Seat assignments summary:', passengers.map(p => ({
            name: `${p.FirstName} ${p.LastName}`,
            seat: p.SeatName,
            type: typeof p.SeatName
        })));

        return bookingData;
    };

    // Debug function for seats before booking
    const debugSeatsBeforeBooking = (selectedSeats, passengerData) => {
        console.log('🔍 Debug: Seats before booking formatting');
        console.log('Selected seats count:', selectedSeats?.length);
        console.log('Passenger data count:', passengerData?.length);

        if (selectedSeats && passengerData) {
            selectedSeats.forEach((seat, index) => {
                const passenger = passengerData[index];
                console.log(`Seat ${index + 1}:`, {
                    passenger: passenger ? `${passenger.firstName} ${passenger.lastName}` : 'N/A',
                    seatData: seat,
                    seatName: extractSeatNameForAPI(seat, index),
                    seatNameType: typeof extractSeatNameForAPI(seat, index)
                });
            });
        }
    };

    // BookingId validation function
    const isValidBookingId = (id) => {
        if (id === null || id === undefined || id === 'undefined' || id === 'null') {
            return false;
        }

        const idString = String(id).trim();
        if (idString === '' || idString === 'undefined' || idString === 'null') {
            return false;
        }

        const numericValue = Number(idString);
        return !isNaN(numericValue) && numericValue > 0 && idString.length >= 1 && idString.length <= 20;
    };

    // ENHANCED: BookingId extraction with comprehensive search
    const extractBookingIdFromResponse = (response) => {
        console.log('Extracting BookingId from response:');
        console.log('Full Response:', JSON.stringify(response, null, 2));

        const possiblePaths = [
            response?.BookingId,
            response?.bookingId,
            response?.booking_id,
            response?.id,
            response?.data?.BookingId,
            response?.data?.bookingId,
            response?.data?.booking_id,
            response?.data?.id,
            response?.response?.BookingId,
            response?.response?.bookingId,
            response?.response?.booking_id,
            response?.response?.id,
            response?.result?.BookingId,
            response?.result?.bookingId,
            response?.result?.booking_id,
            response?.result?.id,
            response?.Bus?.BookingId,
            response?.bus?.BookingId,
            response?.booking?.BookingId,
            response?.booking?.id,
            response?.data?.response?.BookingId,
            response?.data?.result?.BookingId,
            response?.response?.data?.BookingId,
            Array.isArray(response) ? response[0]?.BookingId : null,
            Array.isArray(response?.data) ? response.data[0]?.BookingId : null,
        ];

        console.log('Checking possible BookingId locations:', possiblePaths);

        for (let i = 0; i < possiblePaths.length; i++) {
            const candidateId = possiblePaths[i];
            console.log(`Checking path ${i}: ${candidateId} (type: ${typeof candidateId})`);

            if (isValidBookingId(candidateId)) {
                console.log(`FOUND VALID BOOKING ID: ${candidateId}`);
                return String(candidateId);
            }
        }

        console.log('No direct BookingId found, searching for numeric values...');

        const searchForNumericIds = (obj, path = '') => {
            if (!obj || typeof obj !== 'object') return null;

            for (const [key, value] of Object.entries(obj)) {
                const currentPath = path ? `${path}.${key}` : key;

                if (typeof value === 'number' && value > 0 && value < 999999) {
                    console.log(`Found numeric value at ${currentPath}: ${value}`);
                    if (key.toLowerCase().includes('id') || key.toLowerCase().includes('booking')) {
                        console.log(`POTENTIAL BOOKING ID FOUND: ${value} at ${currentPath}`);
                        return String(value);
                    }
                }

                if (typeof value === 'object' && value !== null) {
                    const nestedResult = searchForNumericIds(value, currentPath);
                    if (nestedResult) return nestedResult;
                }
            }
            return null;
        };

        const numericId = searchForNumericIds(response);
        if (numericId) {
            console.log(`FOUND NUMERIC ID: ${numericId}`);
            return numericId;
        }

        console.error('NO VALID BOOKING ID FOUND IN RESPONSE');
        return null;
    };

    // NEW: Send Invoice Email Function
    const sendInvoiceEmail = async (bookingId, searchTokenId, userEmail) => {
        try {
            console.log('Sending invoice email...');
            setLoadingStep('Sending invoice to your email...');

            if (!bookingId || !isValidBookingId(bookingId)) {
                console.error('Invalid booking ID for invoice:', bookingId);
                console.warn('Skipping invoice email due to invalid booking ID');
                return false;
            }

            if (!userEmail || !userEmail.includes('@')) {
                console.error('Invalid email for invoice:', userEmail);
                console.warn('Skipping invoice email due to invalid email address');
                return false;
            }

            const invoiceData = {
                UserIp: "122.161.64.143",
                SearchTokenId: searchTokenId || "",
                BookingId: String(bookingId),
                receiverEmail: userEmail
            };

            console.log('Invoice email payload:', invoiceData);

            const invoiceResult = await downloadBusInvoice(invoiceData);
            console.log('Invoice email sent successfully:', invoiceResult);

            toast.success('Invoice sent to your email!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            return true;
        } catch (error) {
            console.error('Invoice email failed:', error);

            toast.warn('Invoice email failed. You can contact support for invoice.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            return false;
        }
    };

    // Load Razorpay script dynamically
    const loadRazorpayScript = () =>
        new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

  // Enhanced extractApiErrorMessage function to handle your specific error format
const extractApiErrorMessage = (error) => {
    console.log('Extracting API error message from:', error);

    // Check for API response error message
    if (error?.response?.data) {
        const errorData = error.response.data;
        
        // Priority order for error message paths - your specific format first
        const errorMessagePaths = [
            // Your specific error format: error.ErrorMessage
            errorData?.error?.ErrorMessage,
            errorData?.Error?.ErrorMessage,
            
            // Common nested error patterns
            errorData?.error?.message,
            errorData?.message,
            errorData?.errorMessage,
            errorData?.Error?.message,
            errorData?.error?.Error?.ErrorMessage,
            errorData?.errors?.[0]?.message,
            errorData?.detail,
            errorData?.details,
            errorData?.error_description,
            
            // Additional patterns for bus booking APIs
            errorData?.error?.description,
            errorData?.Error?.Description,
            errorData?.response?.error?.message,
            errorData?.response?.Error?.ErrorMessage,
            
            // Handle arrays of errors
            Array.isArray(errorData?.errors) ? errorData.errors[0]?.ErrorMessage : null,
            Array.isArray(errorData?.errors) ? errorData.errors[0]?.message : null,
        ];

        // Find the first valid error message
        for (const errorMsg of errorMessagePaths) {
            if (errorMsg && typeof errorMsg === 'string' && errorMsg.trim() !== '') {
                const cleanMessage = errorMsg.trim();
                console.log('Found API error message:', cleanMessage);
                return cleanMessage;
            }
        }

        // If error data is a string itself
        if (typeof errorData === 'string' && errorData.trim() !== '') {
            return errorData.trim();
        }

        // Handle case where entire response data is the error message
        if (typeof errorData === 'object' && errorData.toString !== Object.prototype.toString) {
            const stringified = String(errorData);
            if (stringified !== '[object Object]' && stringified.trim() !== '') {
                return stringified.trim();
            }
        }
    }

    // Check direct error message (for cases where error is not in response.data)
    if (error?.error?.ErrorMessage) {
        return error.error.ErrorMessage.trim();
    }

    if (error?.Error?.ErrorMessage) {
        return error.Error.ErrorMessage.trim();
    }

    // Check direct error message
    if (error?.message && typeof error.message === 'string') {
        return error.message.trim();
    }

    // Handle axios-specific error patterns
    if (error?.code === 'NETWORK_ERROR') {
        return 'Network connection failed. Please check your internet connection.';
    }

    if (error?.code === 'TIMEOUT') {
        return 'Request timed out. Please try again.';
    }

    // Default fallback with more context
    if (error?.response?.status) {
        return `Server error (${error.response.status}). Please try again or contact support.`;
    }

    // Final fallback
    return 'An unexpected error occurred. Please try again.';
};

  const handleApiError = (error, context = 'API') => {
    const apiErrorMessage = extractApiErrorMessage(error);
    
    console.log('API Error Details:', {
        context,
        status: error?.response?.status,
        data: error?.response?.data,
        extractedMessage: apiErrorMessage,
        fullError: error
    });

    // Return both the user-friendly message and technical details for debugging
    return {
        message: apiErrorMessage,
        details: {
            status: error?.response?.status || null,
            data: error?.response?.data || null,
            context: context
        }
    };
};
    // Show error toast function
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

    // Show success toast function
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

    // Helper function to get valid address
    const getValidAddress = (passenger, contactData, fromCity, toCity) => {
        if (passenger?.address && passenger.address.trim()) {
            return passenger.address.trim();
        }

        if (contactData?.address && contactData.address.trim()) {
            return contactData.address.trim();
        }

        return `${fromCity || 'Delhi'}, India`;
    };

    // FIXED: Seat name extraction function (returns numbers for display)
    const extractSeatName = (seat, index) => {
        debugLog(`Raw seat data for index ${index}:`, seat);

        if (!seat) {
            console.warn(`No seat data for index ${index}, using fallback`);
            return `${index + 1}`;
        }

        // Use the same logic as API function but return as string for display
        const numericSeat = extractSeatNameForAPI(seat, index);
        return String(numericSeat);
    };

    // Format bus order data
    const formatBusOrderData = (bookingState, amount) => ({
        amount: parseFloat(amount),
        currency: 'INR',
        booking_type: 'bus',
        booking_details: {
            route: `${bookingState.fromCity} to ${bookingState.toCity}`,
            travel_date: bookingState.departDate,
            bus_operator: bookingState.bus?.operator,
            bus_type: bookingState.bus?.busType,
            selected_seats: bookingState.selectedSeats?.map((seat, index) =>
                extractSeatName(seat, index)
            ),
            passenger_count: bookingState.passengerData?.length || 0,
            base_fare: bookingState.totalPrice,
            taxes: fareBreakdown.gst.total,
            total_amount: amount
        },
        customer_details: {
            name: `${bookingState.passengerData?.[0]?.firstName || ''} ${bookingState.passengerData?.[0]?.lastName || ''}`.trim(),
            email: bookingState.contactData?.email,
            phone: bookingState.contactData?.mobile
        }
    });

    // FIXED: Format validate payment data with numeric seat names
    const formatValidatePaymentData = (bookingState, paymentResponse, orderData) => {
        console.log('Formatting validate payment data with coupon...');
        console.log('Available seats:', bookingState.selectedSeats);
        console.log('Passenger count:', bookingState.passengerData?.length);

        const passengers = bookingState.passengerData?.map((passenger, index) => {
            const seatName = extractSeatNameForAPI(bookingState.selectedSeats?.[index], index);

            console.log(`Final seat assignment for passenger ${index + 1}: ${seatName} (type: ${typeof seatName})`);

            const validAddress = getValidAddress(passenger, bookingState.contactData, bookingState.fromCity, bookingState.toCity);

            const emailAddress = bookingState.contactData?.email || passenger.email || '';
            const phoneNumber = bookingState.contactData?.mobile || passenger.phone || '';

            debugLog(`Contact info for passenger ${index + 1}:`, {
                email: emailAddress,
                phone: phoneNumber,
                isLead: index === 0
            });

            return {
                LeadPassenger: index === 0,
                Title: passenger.title || (passenger.gender === 'Male' ? 'Mr' : 'Ms'),
                FirstName: passenger.firstName,
                LastName: passenger.lastName,
                Email: emailAddress.trim(),
                Phoneno: phoneNumber.replace(/\D/g, ''),
                Gender: passenger.gender === 'Male' ? '1' : '2',
                IdType: passenger.idType || null,
                IdNumber: passenger.idNumber || null,
                Address: validAddress,
                Age: passenger.age?.toString(),
                SeatName: seatName // THIS IS NOW A NUMBER, NOT A STRING
            };
        }) || [];

        const validationData = {
            amount: parseFloat(finalAmount),
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
            bookingType: "BUS",
            Bus: {
                ResultIndex: bookingState.busBookingData?.ResultIndex ||
                    bookingState.bus?.ResultIndex ||
                    "TB-1",
                BoardingPointId: bookingState.selectedBoardingPoint?.BoardingPointId ||
                    bookingState.boardingPoint?.BoardingPointId ||
                    bookingState.boardingPoint?.id ||
                    1,
                DroppingPointId: bookingState.selectedDroppingPoint?.DroppingPointId ||
                    bookingState.droppingPoint?.DroppingPointId ||
                    bookingState.droppingPoint?.id ||
                    1,
                SearchTokenId: bookingState.searchTokenId ||
                    bookingState.bus?.SearchTokenId ||
                    "",
                CouponDiscount: fareBreakdown.couponDiscount || 0,
                Passenger: passengers
            }
        };

        console.log('Final validation data:', JSON.stringify(validationData, null, 2));
        console.log('Seat names in validation:', passengers.map(p => ({ name: `${p.FirstName} ${p.LastName}`, seat: p.SeatName, type: typeof p.SeatName })));

        return validationData;
    };

    // Enhanced Razorpay options with better error handling
    const getRazorpayOptions = (orderId, orderAmount) => ({
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_glwdvx2PlFDStN',
        amount: orderAmount * 100,
        currency: 'INR',
        order_id: orderId,
        name: 'RASUTRIP',
        description: `${fromCity} to ${toCity} - ${bus?.operator || 'Bus Service'}`,
        prefill: {
            name: `${passengerData[0]?.firstName || ''} ${passengerData[0]?.lastName || ''}`.trim(),
            email: contactData?.email || '',
            contact: contactData?.mobile || '',
        },
        notes: {
            route: `${fromCity} to ${toCity}`,
            travel_date: departDate,
            seats: selectedSeats.map((seat, index) => extractSeatName(seat, index)).join(', '),
            passenger_count: passengerData.length,
            bus_operator: bus?.operator || 'N/A'
        },
        theme: {
            color: '#dc3545'
        },
        modal: {
            ondismiss: function () {
                setLoading(false);
                setLoadingStep('');
                showErrorToast('Payment was cancelled by user');
            }
        },
    });

    // NEW: Show refund modal for booking failures after payment
    const displayRefundModal = (paymentData) => {
        setPaymentSuccessData(paymentData);
        setShowRefundModal(true);
    };

    // ENHANCED: Payment handler with API error handling and refund modal
    const handlePayment = async () => {
        setError(null);
        setLoading(true);
        setLoadingStep('Initializing payment gateway...');

        try {
            console.log('Starting bus payment process...');
            debugLog('Selected seats debug:', selectedSeats);
            debugLog('Passenger data debug:', passengerData);

            // Debug seat names before booking
            debugSeatsBeforeBooking(selectedSeats, passengerData);

            // Load Razorpay script
            setLoadingStep('Loading payment system...');
            const razorpayLoaded = await loadRazorpayScript();
            if (!razorpayLoaded) {
                const errorMsg = 'Payment system failed to load. Please refresh and try again.';
                setError(errorMsg);
                showErrorToast(errorMsg);
                setLoading(false);
                setLoadingStep('');
                return;
            }

            // Create payment order
            setLoadingStep('Creating payment order...');
            const orderData = formatBusOrderData(state, finalAmount);
            console.log('Creating payment order with data:', orderData);

            const orderResponse = await createBusPaymentOrder(orderData);
            console.log('Order response received:', orderResponse);

            // Enhanced order ID extraction
            let orderId, orderAmount, orderObject;

            if (orderResponse?.data?.order?.id) {
                orderObject = orderResponse.data.order;
                orderId = orderObject.id;
                orderAmount = orderObject.amount;
            } else if (orderResponse?.order?.id) {
                orderObject = orderResponse.order;
                orderId = orderObject.id;
                orderAmount = orderObject.amount;
            } else if (orderResponse?.data?.id) {
                orderObject = orderResponse.data;
                orderId = orderObject.id;
                orderAmount = orderObject.amount;
            } else if (orderResponse?.id) {
                orderObject = orderResponse;
                orderId = orderResponse.id;
                orderAmount = orderResponse.amount;
            } else {
                console.error('Unexpected order response structure:', {
                    responseKeys: Object.keys(orderResponse || {}),
                    fullResponse: orderResponse
                });
                throw new Error(`Failed to create payment order - Invalid response structure`);
            }

            if (!orderId) {
                console.error('No order ID found in response:', orderResponse);
                throw new Error('Failed to create payment order - No order ID received');
            }

            if (!orderAmount) {
                console.warn('No amount in order response, using calculated amount:', finalAmount);
                orderAmount = parseFloat(finalAmount);
            }

            console.log('Payment order created:', { orderId, orderAmount });
            setLoadingStep('Opening payment gateway...');

            // ENHANCED: Success handler with API error handling and refund modal
            const handleSuccess = async (response) => {
                let paymentValidated = false;
                
                try {
                    console.log('Payment successful, validating...', response);
                    setLoadingStep('Validating payment...');

                    const validateData = formatValidatePaymentData(state, response, orderObject);
                    console.log('Validation data being sent:', validateData);

                    const validationResult = await validateBusPayment(validateData);
                    console.log('Payment validation result:', validationResult);

                    const isValidationSuccessful =
                        validationResult?.message === 'Payment verified successfully' ||
                        validationResult?.payment?.status === 'success' ||
                        validationResult?.status === 'success' ||
                        validationResult?.success === true;

                    if (isValidationSuccessful) {
                        paymentValidated = true;
                        
                        // Proceed to book bus after successful validation
                        console.log('Proceeding to book bus...');
                        setLoadingStep('Confirming your booking...');

                        const bookingData = formatBookingData(state);

                        // Final validation before booking API call
                        const invalidSeats = bookingData.Passenger.filter(p =>
                            p.SeatName === null ||
                            p.SeatName === undefined ||
                            (typeof p.SeatName === 'string' && p.SeatName.trim() === '') ||
                            (typeof p.SeatName === 'number' && (isNaN(p.SeatName) || p.SeatName <= 0))
                        );

                        if (invalidSeats.length > 0) {
                            console.error('Invalid seat names found:', invalidSeats);
                            throw new Error('Invalid seat assignment. Please try booking again.');
                        }

                        console.log('Booking data being sent:', JSON.stringify(bookingData, null, 2));
                        console.log('Seat names validation passed:', bookingData.Passenger.map(p => ({ name: `${p.FirstName} ${p.LastName}`, seat: p.SeatName, type: typeof p.SeatName })));

                        const bookingResult = await bookBus(bookingData);
                        console.log('Bus booking result:', bookingResult);

                        // ENHANCED: BookingId extraction with comprehensive fallback strategies
                        setLoadingStep('Generating booking confirmation...');
                        const extractedBookingId = extractBookingIdFromResponse(bookingResult);

                        console.log('EXTRACTED BOOKING ID:', extractedBookingId);

                        // NEW: Send invoice email after successful booking
                        const userEmail = contactData?.email;
                        const currentSearchTokenId = searchTokenId || bookingData.SearchTokenId;

                        if (extractedBookingId && userEmail && currentSearchTokenId) {
                            console.log('Attempting to send invoice email...');
                            await sendInvoiceEmail(extractedBookingId, currentSearchTokenId, userEmail);
                        } else {
                            console.warn('Missing data for invoice email:', {
                                bookingId: extractedBookingId,
                                email: userEmail,
                                searchTokenId: currentSearchTokenId
                            });
                        }

                        // Show success message
                        setLoadingStep('Booking confirmed successfully!');
                        showSuccessToast('Bus booking confirmed successfully!');

                        // Navigate to confirmation page with all necessary data including coupon information
                        navigate('/bus-confirm', {
                            state: {
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                signature: response.razorpay_signature,
                                bookingDetails: state,
                                finalAmount,
                                orderData: orderObject,
                                validationResult,
                                bookingResult,
                                isValidated: true,
                                isBooked: true,
                                bookingType: 'bus',
                                extractedBookingId: extractedBookingId,
                                appliedCouponData: appliedCouponData,
                                couponDiscount: fareBreakdown.couponDiscount
                            },
                        });

                    } else {
                        // Payment validation failed - show API error
                        const { message: apiErrorMessage } = handleApiError(validationResult, 'Payment Validation');
                        
                        setError(apiErrorMessage);
                        showErrorToast(apiErrorMessage);
                        
                        // Show refund modal since payment was successful but validation failed
                        displayRefundModal({
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            amount: finalAmount
                        });
                    }

                } catch (err) {
                    console.error('Payment validation/booking error:', err);
                    
                    // Extract API error message
                    const { message: apiErrorMessage } = handleApiError(err, paymentValidated ? 'Booking' : 'Payment Validation');
                    
                    setError(apiErrorMessage);
                    showErrorToast(apiErrorMessage);
                    
                    // Show refund modal since payment was successful but booking failed
                    displayRefundModal({
                        paymentId: response.razorpay_payment_id,
                        orderId: response.razorpay_order_id,
                        amount: finalAmount
                    });
                    
                } finally {
                    setLoading(false);
                    setLoadingStep('');
                }
            };

            // Create Razorpay instance with enhanced error handling
            const options = getRazorpayOptions(orderId, orderAmount);
            options.handler = handleSuccess;

            const rzp = new window.Razorpay(options);

            // Enhanced payment failure handler with API error extraction
            rzp.on('payment.failed', function (response) {
                console.error('Payment failed:', response);
                
                // Extract API error from payment failure response
                const apiErrorMessage = response?.error?.description || 
                                      response?.error?.reason || 
                                      response?.error?.source || 
                                      'Payment failed due to unknown error';
                
                setError(apiErrorMessage);
                showErrorToast(apiErrorMessage);
                setLoading(false);
                setLoadingStep('');
            });

            // Open Razorpay modal
            setLoadingStep('');
            rzp.open();

        } catch (err) {
            console.error('Payment initialization error:', err);
            
            // Extract API error message
            const { message: apiErrorMessage } = handleApiError(err, 'Payment Initialization');
            
            setError(apiErrorMessage);
            showErrorToast(apiErrorMessage);
            setLoading(false);
            setLoadingStep('');
        }
    };

    // Enhanced error boundary check
    if (!state || Object.keys(state).length === 0) {
        return (
            <Container className="py-4">
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
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {/* Loading Overlay Modal */}
            <Modal
                show={loading}
                backdrop="static"
                keyboard={false}
                centered
                size="md"
            >
                <Modal.Body className="text-center py-5">
                    <div className="mb-4">
                        <Spinner animation="border" variant="danger" size="lg" />
                    </div>
                    <h5 className="mb-3">Processing Your Booking</h5>
                    {loadingStep && (
                        <p className="text-muted mb-0">{loadingStep}</p>
                    )}
                    <div className="mt-4 p-3 bg-light rounded">
                        <small className="text-danger fw-bold">
                            Please don't close or refresh this page
                        </small>
                        <br />
                        <small className="text-muted">
                            Your payment is being processed securely
                        </small>
                    </div>
                </Modal.Body>
            </Modal>

            {/* NEW: Refund Modal */}
            <Modal
                show={showRefundModal}
                onHide={() => setShowRefundModal(false)}
                centered
                size="md"
            >
                <Modal.Header closeButton className="bg-danger text-white">
                    <Modal.Title>
                        Booking Failed - Refund Required
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    <div className="mb-4">
                        <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-danger mb-2">Payment Status: Success ✓</h6>
                            <h6 className="text-danger mb-2">Booking Status: Failed ✗</h6>
                            {paymentSuccessData && (
                                <div className="small text-muted">
                                    <div>Payment ID: {paymentSuccessData.paymentId}</div>
                                    <div>Amount: ₹{paymentSuccessData.amount}</div>
                                </div>
                            )}
                        </div>
                        <p className="mb-3">
                            Your payment was successful, but the booking could not be completed. 
                            Please contact us for a refund.
                        </p>
                        <div className="bg-warning bg-opacity-10 border border-warning rounded p-3 mb-3">
                            <h6 className="text-warning mb-2">
                                For Refund Contact:
                            </h6>
                            <div className="d-flex justify-content-center gap-3 mb-2">
                                <a 
                                    href="tel:9266424809" 
                                    className="btn btn-outline-success btn-sm"
                                >
                                    <FaPhone className="me-1" />
                                    Call: 92664 24809
                                </a>
                                <a 
                                    href="https://wa.me/919266424809?text=Hi%2C%20I%20need%20help%20with%20bus%20booking%20refund" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-success btn-sm"
                                >
                                    <FaWhatsapp className="me-1" />
                                    WhatsApp
                                </a>
                            </div>
                            <small className="text-muted">
                                Please mention your payment ID when contacting for refund
                            </small>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-center">
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowRefundModal(false)}
                    >
                        Close
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate('/')}
                    >
                        Back to Home
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Enhanced Travel Summary */}
            <Card className="mb-4 shadow-sm">
                <Card.Header className="">
                    <div className="d-flex align-items-center">
                        <h5 className="fw-bold mb-0"> Bus Booking Summary</h5>
                    </div>
                </Card.Header>
                <Card.Body>
                    <div className="mb-4 p-3">
                        <Row>
                            <Col md={3}>
                                <div><strong>Route:</strong></div>
                                <div className="fw-bold">{fromCity} → {toCity}</div>
                                <small className="text-muted">{bus?.operator || 'N/A'} - {bus?.busType || 'N/A'}</small>
                            </Col>
                            <Col md={3}>
                                <div><strong>Travel Date:</strong></div>
                                <div>{departDate ? new Date(departDate).toDateString() : 'N/A'}</div>
                            </Col>
                            <Col md={3}>
                                <div><strong>Passengers:</strong></div>
                                <div>{passengerData.length} Passenger(s)</div>
                            </Col>
                            <Col md={3}>
                                <div><strong>Seats No:</strong></div>
                                <div className="fw-bold">
                                    {selectedSeats.map((seat, index) =>
                                        extractSeatName(seat, index)
                                    ).join(', ')}
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Card.Body>
            </Card>

            {/* ENHANCED Payment Summary with Detailed Breakdown and Coupon Discount */}
            <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-white">
                    <h6 className="fw-bold mb-0">
                        Payment Summary
                        {fareBreakdown.numberOfSeats > 0 && (
                            <small className="ms-2 text-muted">
                                ({fareBreakdown.numberOfSeats} seat{fareBreakdown.numberOfSeats !== 1 ? 's' : ''})
                            </small>
                        )}
                    </h6>
                </Card.Header>
                <Card.Body>
                    {/* Base Price - Show only if different from Published Price and greater than 0 */}
                    {fareBreakdown.basePrice > 0 && fareBreakdown.basePrice !== fareBreakdown.publishedPrice && (
                        <Row className="mb-2">
                            <Col xs={8}>Base Price</Col>
                            <Col xs={4} className="text-end">₹{fareBreakdown.basePrice.toFixed(2)}</Col>
                        </Row>
                    )}

                    {/* Published Price - Main price from API */}
                    {fareBreakdown.publishedPrice > 0 && (
                        <Row className="mb-2">
                            <Col xs={8}>Base Price</Col>
                            <Col xs={4} className="text-end">₹{fareBreakdown.publishedPrice.toFixed(2)}</Col>
                        </Row>
                    )}

                    {/* Final Total */}
                    <Row className="fw-bold fs-5">
                        <Col xs={8}>Total Amount</Col>
                        <Col xs={4} className="text-end">₹{finalAmount}</Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Enhanced Payment Button Section */}
            <Card className="shadow-sm">
                <Card.Body>
                    <div className="mb-3">
                        <p className="text-muted small mb-0">
                            <strong>Please note:</strong> By placing this order, you agree to our{' '}
                            <a href="#" className='text-danger' onClick={(e) => e.preventDefault()}>Terms Of Use</a> and{' '}
                            <a href="#" className='text-danger' onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                        </p>
                    </div>

                    <div className="d-flex gap-3 justify-content-between align-items-center">
                        <Button
                            variant="danger"
                            className="btn-red"
                            disabled={!totalPrice || !!error || loading}
                            onClick={handlePayment}
                        >
                            {loading ? (
                                "Processing..."
                            ) : (
                                `Pay Now ₹${finalAmount}`
                            )}
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Enhanced Error Alert with API Error Display */}
            {error && (
                <Alert variant="danger" className="mb-4 mt-3" dismissible onClose={() => setError(null)}>
                    <FaExclamationTriangle className="me-2" />
                    <span style={{ whiteSpace: 'pre-line', marginTop: '8px' }}>
                        {error}
                    </span>
                </Alert>
            )}
        </Container>
    );
};

export default BusPaymentInfo;