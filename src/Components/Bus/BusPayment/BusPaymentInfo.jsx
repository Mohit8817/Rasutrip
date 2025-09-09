import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { createBusPaymentOrder, validateBusPayment, bookBus, downloadBusInvoice } from '../../APIS/BusApi/BusApis';

const BusPaymentInfo = ({ couponDiscount = 0, appliedCouponData = null }) => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [error, setError] = useState(null);

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

    // FIXED: Function to extract API-compatible seat names (returns numbers, not strings)
    const extractSeatNameForAPI = (seat, index) => {
        console.log(`🔍 Extracting API-compatible seat name for passenger ${index + 1}:`);
        console.log('Raw seat data:', JSON.stringify(seat, null, 2));

        if (!seat) {
            console.warn(`No seat data for index ${index}, using fallback number`);
            return index + 1; // Return number, not string
        }

        // Helper function to get numeric value from seat data
        const getNumericSeatValue = (value) => {
            if (value === null || value === undefined) return null;
            
            // If it's already a number, return it
            if (typeof value === 'number' && !isNaN(value) && value > 0) {
                return Math.floor(value); // Ensure integer
            }
            
            // If it's a string, try to parse it
            if (typeof value === 'string') {
                const trimmed = value.trim();
                
                // Try direct numeric conversion
                const numericValue = parseInt(trimmed, 10);
                if (!isNaN(numericValue) && numericValue > 0) {
                    return numericValue;
                }
                
                // Extract numbers from string (e.g., "A1" -> 1, "Seat2" -> 2)
                const numberMatch = trimmed.match(/\d+/);
                if (numberMatch) {
                    const extractedNumber = parseInt(numberMatch[0], 10);
                    if (extractedNumber > 0) {
                        return extractedNumber;
                    }
                }
            }
            
            return null;
        };

        // Strategy 1: Direct seat name fields (API priority order)
        const apiFields = [
            'SeatName', 'SeatNo', 'Name', 'seatName', 'seatNo', 
            'SeatNumber', 'Position', 'Code', 'SeatCode', 'id'
        ];

        for (const field of apiFields) {
            const value = seat[field];
            const numericValue = getNumericSeatValue(value);
            if (numericValue !== null) {
                console.log(`✅ Found API seat name using '${field}': ${numericValue} (number)`);
                return numericValue;
            }
        }

        // Strategy 2: Check nested Price object
        if (seat.Price && typeof seat.Price === 'object') {
            for (const field of apiFields) {
                const value = seat.Price[field];
                const numericValue = getNumericSeatValue(value);
                if (numericValue !== null) {
                    console.log(`✅ Found API seat name in Price.${field}: ${numericValue} (number)`);
                    return numericValue;
                }
            }
        }

        // Strategy 3: If seat is direct value
        const directValue = getNumericSeatValue(seat);
        if (directValue !== null) {
            console.log(`✅ Seat is valid numeric value: ${directValue}`);
            return directValue;
        }

        // Final fallback: Use index-based numbering
        const fallback = index + 1;
        console.warn(`⚠️ Using numeric fallback: ${fallback} for seat:`, seat);
        return fallback;
    };

    // Enhanced passenger formatter with proper dynamic data mapping
    const formatPassengerWithValidSeatName = (passenger, correspondingSeat, index, contactData, fromCity, toCity) => {
        const seatName = extractSeatNameForAPI(correspondingSeat, index);

        if (seatName === null || seatName === undefined) {
            throw new Error(`Unable to extract valid seat name for passenger ${index + 1}`);
        }

        // Get dynamic address with proper fallback
        const validAddress = getValidAddress(passenger, contactData, fromCity, toCity);
        
        // Get dynamic email and phone with proper fallback
        const emailAddress = contactData?.email || passenger.email || '';
        const phoneNumber = contactData?.mobile || contactData?.phone || passenger.phone || '';

        // Validate required fields
        if (!passenger.firstName || !passenger.firstName.trim()) {
            throw new Error(`First name is required for passenger ${index + 1}`);
        }

        if (!passenger.lastName || !passenger.lastName.trim()) {
            throw new Error(`Last name is required for passenger ${index + 1}`);
        }

        if (!emailAddress || !emailAddress.includes('@')) {
            throw new Error(`Valid email is required for booking`);
        }

        if (!phoneNumber || phoneNumber.trim() === '') {
            throw new Error(`Phone number is required for booking`);
        }

        return {
            LeadPassenger: index === 0, // First passenger is lead passenger
            Title: passenger.title || (passenger.gender === 'Male' ? 'Mr' : passenger.gender === 'Female' ? 'Ms' : 'Mr'),
            FirstName: passenger.firstName.trim(),
            LastName: passenger.lastName.trim(),
            Email: emailAddress.trim(),
            Phoneno: phoneNumber.replace(/\D/g, ''), // Remove non-digits
            Gender: passenger.gender === 'Male' ? '1' : passenger.gender === 'Female' ? '2' : '1',
            IdType: passenger.idType || null,
            IdNumber: passenger.idNumber || null,
            Address: validAddress,
            Age: passenger.age?.toString() || '25', // Convert to string as API expects
            SeatName: seatName // THIS IS NOW A NUMBER, NOT A STRING
        };
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

    // Enhanced API error handler
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
                    errorMessage = 'Bus booking service not found. Please try again later.';
                    break;
                case 409:
                    errorMessage = 'Booking conflict. The seats may no longer be available.';
                    break;
                case 422:
                    errorMessage = data?.Error?.ErrorMessage || 'Invalid booking data. Please check all required fields.';
                    break;
                case 429:
                    errorMessage = 'Too many requests. Please wait a moment and try again.';
                    break;
                case 500:
                    errorMessage = 'Bus booking service is temporarily unavailable. Please try again in a few minutes.';
                    if (data?.Error?.ErrorMessage) {
                        errorMessage += ` (${data.Error.ErrorMessage})`;
                    }
                    break;
                case 502:
                case 503:
                case 504:
                    errorMessage = 'Bus booking service is temporarily down. Please try again later.';
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

    // FIXED: Format booking data with numeric seat names and proper vendor commission
    const formatBookingData = (bookingState) => {
        console.log('Formatting booking data with coupon...');
        console.log('Available seats:', bookingState.selectedSeats);
        console.log('Passenger count:', bookingState.passengerData?.length);

        const passengers = bookingState.passengerData?.map((passenger, index) => {
            const seatName = extractSeatNameForAPI(bookingState.selectedSeats?.[index], index);

            console.log(`Final seat assignment for passenger ${index + 1}: ${seatName} (type: ${typeof seatName})`);

            const validAddress = getValidAddress(passenger, bookingState.contactData, bookingState.fromCity, bookingState.toCity);

            const emailAddress = bookingState.contactData?.email || passenger.email || '';
            const phoneNumber = bookingState.contactData?.mobile || passenger.phone || '';

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

        // Calculate vendor commission dynamically
        const dynamicVendorCommission = calculateDynamicVendorCommission(bookingState);

        const bookingData = {
            UserIp: "122.161.64.143",
            SearchTokenId: bookingState.searchTokenId || bookingState.bus?.SearchTokenId || "",
            ResultIndex: bookingState.busBookingData?.ResultIndex || bookingState.bus?.ResultIndex || "TB-1",
            BoardingPointId: bookingState.selectedBoardingPoint?.BoardingPointId || bookingState.boardingPoint?.BoardingPointId || bookingState.boardingPoint?.id || 1,
            DroppingPointId: bookingState.selectedDroppingPoint?.DroppingPointId || bookingState.droppingPoint?.DroppingPointId || bookingState.droppingPoint?.id || 1,
            vendorCommission: dynamicVendorCommission || 0,
            CouponDiscount: fareBreakdown.couponDiscount || 0,
            Passenger: passengers
        };

        console.log('Final booking data:', JSON.stringify(bookingData, null, 2));
        console.log('Seat names in booking:', passengers.map(p => ({ name: `${p.FirstName} ${p.LastName}`, seat: p.SeatName, type: typeof p.SeatName })));

        return bookingData;
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
                showErrorToast('Payment Cancelled', 'Payment was cancelled by user');
            }
        },
    });

    // ENHANCED: Payment handler with invoice email integration
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
                showErrorToast('Payment System Error', errorMsg);
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

            // ENHANCED: Success handler with invoice email integration
            const handleSuccess = async (response) => {
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
                        const validationError = validationResult?.message ||
                            validationResult?.error?.message ||
                            'Payment validation failed';

                        setError(`Payment completed but validation failed: ${validationError}`);
                        showErrorToast('Payment Validation Failed', validationError);
                    }

                } catch (err) {
                    console.error('Payment validation/booking error:', err);

                    if (err.message && err.message.includes('bookBus')) {
                        setError(`Payment validated but booking failed: ${err.message}`);
                        showErrorToast('Booking Failed', 'Payment was successful but booking could not be completed');
                    } else {
                        const { message: errorMessage } = handleApiError(err, 'Payment Validation/Booking');
                        setError(`Payment completed but processing failed: ${errorMessage}`);
                        showErrorToast('Booking Process Failed', errorMessage);
                    }
                } finally {
                    setLoading(false);
                    setLoadingStep('');
                }
            };

            // Create Razorpay instance with enhanced error handling
            const options = getRazorpayOptions(orderId, orderAmount);
            options.handler = handleSuccess;

            const rzp = new window.Razorpay(options);

            // Enhanced payment failure handler
            rzp.on('payment.failed', function (response) {
                console.error('Payment failed:', response);
                const failureMessage = response?.error?.description || 'Payment failed due to unknown error';
                setError(`Payment failed: ${failureMessage}`);
                showErrorToast('Payment Failed', failureMessage);
                setLoading(false);
                setLoadingStep('');
            });

            // Open Razorpay modal
            setLoadingStep('');
            rzp.open();

        } catch (err) {
            console.error('Payment initialization error:', err);
            const { message: errorMessage } = handleApiError(err, 'Payment Initialization');
            setError(errorMessage);
            showErrorToast('Payment Initialization Failed', errorMessage);
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

            {/* Enhanced Error Alert */}
            {error && (
                <Alert variant="danger" className="mb-4 mt-3" dismissible onClose={() => setError(null)}>
                    <FaExclamationTriangle className="me-2" />
                    <span style={{ whiteSpace: 'pre-line', marginTop: '8px' }}>
                        <strong>Error: </strong>
                        {error}
                    </span>
                </Alert>
            )}
        </Container>
    );
};

export default BusPaymentInfo;