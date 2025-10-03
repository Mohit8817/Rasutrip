import React, { useState, useRef } from 'react';
import { Card, Button, Alert, Modal } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaExclamationTriangle, FaPhone, FaWhatsapp, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { createHotelOrder, validateHotelPayment, bookHotel, sendHotelInvoice } from '../../../APIS/HotelApi/HotelAPi';

const HotelPaymentInfo = ({ appliedCoupon, couponDiscount }) => {
  const [loading, setLoading] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingStage, setBookingStage] = useState('');
  const [error, setError] = useState('');

  // ENHANCED: Refund popup states with more tracking
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // CRITICAL: Prevent duplicate bookings
  const bookingAttemptRef = useRef(null);
  const [bookingProcessed, setBookingProcessed] = useState(false);

  const {
    payload = {},
    hotelBookingDetails = {},
    priceDetails = {},
    reviewData = {},
    isPANMandatory = false,
    blockedRoomData = {},
    couponData: locationCouponData = null,
    appliedCouponDiscount: locationCouponDiscount = 0,
  } = location.state || {};

  // ENHANCED: Comprehensive Refund Popup Component
  const RefundPopup = () => (
    <Modal
      show={showRefundModal}
      onHide={() => setShowRefundModal(false)}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
    >
      <Modal.Header className="bg-danger text-white position-relative border-0">
        <Modal.Title className="w-100 text-center">
          Payment Successful - Booking Failed
        </Modal.Title>
        <Button
          variant="link"
          className="position-absolute top-0 end-0 mt-2 me-2 text-white p-1"
          onClick={() => setShowRefundModal(false)}
          style={{ fontSize: '1.2rem', textDecoration: 'none' }}
        >
          <FaTimes />
        </Button>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Alert Message */}
        <div className="alert alert-warning border-0 mb-4 p-4">
          <div className="row align-items-center">

            <div className="col">
              <h5 className="alert-heading text-warning mb-2">Immediate Refund Required</h5>
              <p className="mb-0">
                Your payment was processed successfully, but we couldn't confirm your hotel booking.
                Please contact our support team immediately for a full refund.
              </p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="row mb-4">
          <div className="col-6">
            <div className="text-center p-3 bg-success bg-opacity-10 border border-success rounded">
              <div className="text-success fw-bold fs-5">Payment: SUCCESS ✓</div>
              <small className="text-success">Money deducted from account</small>
            </div>
          </div>
          <div className="col-6">
            <div className="text-center p-3 bg-danger bg-opacity-10 border border-danger rounded">
              <div className="text-danger fw-bold fs-5">Booking: FAILED ✗</div>
              <small className="text-danger">Hotel not confirmed</small>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        {paymentSuccessData && (
          <div className="mb-4 p-3 bg-light rounded border">
            <h6 className="fw-bold mb-3 text-dark">Payment Transaction Details</h6>

            <div className="row mb-3">
              <div className="col-8">
                <strong>Payment ID:</strong>
                <div className="font-monospace small text-muted mt-1 p-2 bg-white rounded border">
                  {paymentSuccessData.paymentId || 'N/A'}
                </div>
              </div>
              <div className="col-4 text-end">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    if (paymentSuccessData.paymentId) {
                      navigator.clipboard.writeText(paymentSuccessData.paymentId);
                      toast.success('Payment ID copied!', { autoClose: 2000 });
                    }
                  }}
                  className="px-3"
                >
                  Copy ID
                </Button>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-6">
                <strong>Amount Deducted:</strong>
                <div className="text-danger fw-bold fs-5">₹{paymentSuccessData.amount}</div>
              </div>
              <div className="col-6">
                <strong>Transaction Time:</strong>
                <div className="text-muted small">{new Date().toLocaleString()}</div>
              </div>
            </div>

            {paymentSuccessData.orderId && (
              <div className="row mb-3">
                <div className="col">
                  <strong>Order ID:</strong>
                  <div className="font-monospace small text-muted">{paymentSuccessData.orderId}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Details */}
        {(refundReason || paymentSuccessData?.errorMessage || paymentSuccessData?.errorCode) && (
          <div className="mb-4 p-3 bg-warning bg-opacity-10 border border-warning rounded">
            <h6 className="text-warning fw-bold mb-2">
              Booking Failure Details
            </h6>

            {paymentSuccessData?.errorCode && (
              <div className="mb-2">
                <span className="badge bg-danger me-2">Error Code: {paymentSuccessData.errorCode}</span>
              </div>
            )}

            <div className="text-dark">
              <strong>Reason:</strong> {refundReason || paymentSuccessData?.errorMessage || 'Hotel booking could not be confirmed'}
            </div>
          </div>
        )}

        {/* Refund Contact Section */}
        <div className="p-4 bg-primary bg-opacity-10 border border-primary rounded">
          <h5 className="text-center fw-bold text-primary mb-3">
            Get Your Refund Now
          </h5>

          <div className="text-center mb-3">
            <p className="mb-1 fw-bold text-dark">24/7 Refund Support Available</p>
            <small className="text-muted">Average refund processing time: 3-5 business days</small>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <Button
                variant="success"
                className="w-100 d-flex flex-column align-items-center"
                onClick={() => window.open('tel:+919266424809', '_self')}
              >
                <FaPhone className="mb-2" size={24} />
                <div>
                  <div className="fw-bold fs-6">Call Now</div>
                  <div className="small">+91 92664 24809</div>
                </div>
              </Button>
            </div>
            <div className="col-md-6">
              <Button
                className="w-100  d-flex flex-column align-items-center"
                onClick={() => {
                  const refundMessage = `🚨 URGENT REFUND REQUEST 🚨

Hi, I need an immediate refund for a failed hotel booking.

📋 TRANSACTION DETAILS:
• Payment ID: ${paymentSuccessData?.paymentId || 'N/A'}
• Amount Charged: ₹${paymentSuccessData?.amount || 'N/A'}
• Order ID: ${paymentSuccessData?.orderId || 'N/A'}
• Date/Time: ${new Date().toLocaleString()}

❌ ISSUE: 
Payment successful but hotel booking failed.
${refundReason ? `Error: ${refundReason}` : ''}

Please process my refund immediately. Thank you!`;

                  const whatsappUrl = `https://wa.me/919266424809?text=${encodeURIComponent(refundMessage)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: 'white' }}
              >
                <FaWhatsapp className="mb-2" size={24} />
                <div>
                  <div className="fw-bold fs-6">WhatsApp</div>
                  <div className="small">Instant Support</div>
                </div>
              </Button>
            </div>
          </div>

          <div className="text-center mt-4">
            <div className="small text-muted mb-2">
              <strong>Important:</strong> Keep this payment ID safe for refund processing
            </div>
            <div className="p-2 bg-white rounded border">
              <code className="text-dark fw-bold">{paymentSuccessData?.paymentId || 'N/A'}</code>
            </div>
          </div>
        </div>

        {/* Additional Support Info */}
        <div className="mt-4 p-3 bg-light rounded">
          <h6 className="fw-bold mb-2">What happens next?</h6>
          <ul className="mb-0 small">
            <li>Contact us using the buttons above with your Payment ID</li>
            <li>Our team will verify your transaction within 2 hours</li>
            <li>Refund will be initiated within 24 hours</li>
            <li>Amount will be credited back to your original payment method in 3-5 business days</li>
          </ul>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 bg-light">
        <div className="w-100 d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={() => setShowRefundModal(false)}
            className="flex-fill"
          >
            Close
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => {
              if (paymentSuccessData?.paymentId) {
                navigator.clipboard.writeText(paymentSuccessData.paymentId);
                toast.success('Payment ID copied for your records!', { autoClose: 3000 });
              }
            }}
            className="flex-fill"
          >
            Copy Payment ID
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/')}
            className="flex-fill"
          >
            Back to Home
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );

  // ENHANCED: Function to show refund modal with comprehensive data
  const displayRefundModal = (paymentData, reason = '') => {
    console.log('🚨 SHOWING REFUND MODAL - Payment succeeded but booking failed');
    console.log('Payment Data:', paymentData);
    console.log('Failure Reason:', reason);

    setPaymentSuccessData({
      paymentId: paymentData?.paymentId || paymentData?.razorpay_payment_id || 'N/A',
      orderId: paymentData?.orderId || paymentData?.razorpay_order_id || 'N/A',
      amount: paymentData?.amount || roundedTotal || 0,
      errorMessage: paymentData?.errorMessage || reason || '',
      errorCode: paymentData?.errorCode || '',
      timestamp: new Date().toISOString()
    });

    setRefundReason(reason || paymentData?.errorMessage || 'Hotel booking confirmation failed');
    setShowRefundModal(true);
  };

  // ENHANCED: Unified coupon data extraction with priority
  const getCouponData = () => {
    let finalCouponData = null;
    let finalCouponDiscount = 0;

    if (appliedCoupon) {
      finalCouponData = appliedCoupon;
      finalCouponDiscount = couponDiscount || 0;
    } else if (locationCouponData) {
      finalCouponData = locationCouponData;
      finalCouponDiscount = locationCouponDiscount || 0;
    } else if (location.state?.appliedCoupon) {
      finalCouponData = location.state.appliedCoupon;
    } else if (priceDetails?.couponData) {
      finalCouponData = priceDetails.couponData;
    }

    if (finalCouponData && finalCouponDiscount <= 0) {
      const baseFare = getBaseFareForCoupon();

      if (finalCouponData.discountType === 'percentage' || finalCouponData.type === 'PERCENTAGE') {
        const discountPercent = finalCouponData.discount || finalCouponData.value || 0;
        finalCouponDiscount = (baseFare * discountPercent) / 100;
      } else if (finalCouponData.discountType === 'flat' || finalCouponData.type === 'FLAT') {
        finalCouponDiscount = finalCouponData.discount || finalCouponData.value || 0;
      }

      if (finalCouponData.maxDiscount && finalCouponDiscount > finalCouponData.maxDiscount) {
        finalCouponDiscount = finalCouponData.maxDiscount;
      }

      if (finalCouponData.minOrderAmount && baseFare < finalCouponData.minOrderAmount) {
        console.warn('Order amount is below minimum required for coupon');
        finalCouponDiscount = 0;
      }
    }

    return {
      couponData: finalCouponData,
      couponDiscount: Math.max(0, finalCouponDiscount)
    };
  };

  const getBaseFareForCoupon = () => {
    const roomData = blockedRoomData?.HotelRoomsDetails?.[0] || {};
    const priceData = roomData?.Price || {};

    return priceData.PublishedPrice ||
      priceData.RoomPrice ||
      priceDetails?.publishedPrice ||
      priceDetails?.baseFare || 0;
  };

  const calculateFinalPrice = () => {
    const { couponData: activeCoupon, couponDiscount: activeCouponDiscount } = getCouponData();
    const roomData = blockedRoomData?.HotelRoomsDetails?.[0] || {};
    const priceData = roomData?.Price || {};

    const roomPrice = priceData.RoomPrice || 0;
    const publishedPrice = priceData.PublishedPrice || priceDetails?.baseFare || 0;
    const tax = priceData.Tax || priceDetails?.tax || 0;
    const discount = priceData.Discount || priceDetails?.discount || 0;
    const serviceCharges = priceData.ServiceCharges || priceDetails?.serviceCharges || 0;
    const otherCharges = priceData.OtherCharges || priceDetails?.otherCharges || 0;
    const agentCommission = priceData.AgentCommission || 0;
    const tds = priceData.TDS || 0;

    const gstData = priceData.GST || {};
    const cgstAmount = gstData.CGSTAmount || 0;
    const sgstAmount = gstData.SGSTAmount || 0;
    const igstAmount = gstData.IGSTAmount || 0;
    const cgstRate = gstData.CGSTRate || 0;
    const sgstRate = gstData.SGSTRate || 0;
    const igstRate = gstData.IGSTRate || 0;

    const actualBaseFare = publishedPrice;
    const vendorCommissionPercentage = priceDetails?.vendorCommissionPercentage || '';
    const vendorCommissionAmount = agentCommission || (actualBaseFare * vendorCommissionPercentage) / 100;

    let totalGST = cgstAmount + sgstAmount + igstAmount;
    if (totalGST === 0 && (cgstRate > 0 || sgstRate > 0 || igstRate > 0)) {
      const gstBase = actualBaseFare + vendorCommissionAmount;
      totalGST = (gstBase * (cgstRate + sgstRate + igstRate)) / 100;
    }

    // const subtotalBeforeDiscounts = actualBaseFare  + serviceCharges + otherCharges + totalGST + tds;
    const subtotalBeforeDiscounts = actualBaseFare;
    const subtotalAfterHotelDiscount = subtotalBeforeDiscounts - discount;
    const couponDiscountAmount = activeCouponDiscount || 0;
    const finalAmountAfterCoupon = Math.max(0, subtotalAfterHotelDiscount - couponDiscountAmount);
    const customerTotal = finalAmountAfterCoupon;

    return {
      roomPrice,
      actualBaseFare,
      tax,
      serviceCharges,
      otherCharges,
      vendorCommissionAmount,
      vendorCommissionPercentage,
      agentCommission,
      tds,
      totalGST,
      cgstAmount,
      sgstAmount,
      igstAmount,
      cgstRate,
      sgstRate,
      igstRate,
      discount,
      couponDiscount: couponDiscountAmount,
      couponData: activeCoupon,
      subtotalBeforeDiscounts,
      subtotalAfterHotelDiscount,
      roundedTotal: parseFloat(customerTotal.toFixed(2))
    };
  };

  const priceCalculation = calculateFinalPrice();
  const {
    roundedTotal,
    couponDiscount: finalCouponDiscount,
    couponData: activeCoupon,
    subtotalAfterHotelDiscount,
    vendorCommissionAmount,
    vendorCommissionPercentage
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
      </Modal.Body>
    </Modal>
  );

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const getLeadPassenger = (formattedBookingData) => {
    return formattedBookingData?.HotelRoomsDetails?.[0]?.HotelPassenger?.find(p => p.LeadPassenger === "true") ||
      formattedBookingData?.HotelRoomsDetails?.[0]?.HotelPassenger?.[0] ||
      {};
  };

  const getLeadPassengerEmail = (formattedBookingData) => {
    const leadPassenger = getLeadPassenger(formattedBookingData);
    return leadPassenger?.Email || '';
  };

  const generateUniqueClientReference = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `CLT_${timestamp}_${random}`;
  };

  const formatBookingData = (bookingDetails) => {
    console.log('Input booking details:', JSON.stringify(bookingDetails, null, 2));

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

    let leadPassengerAssigned = false;
    let leadPassengerName = '';

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
            console.log(`Selected ${leadPassengerName} as the SINGLE Lead Passenger (Room ${roomIndex + 1})`);
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
        const shouldBeLeadPassenger = !leadPassengerAssigned && isAdult && passengerName === leadPassengerName;

        if (shouldBeLeadPassenger) {
          leadPassengerAssigned = true;
          console.log(`Assigning ${passengerName} as Lead Passenger (Room ${roomIndex + 1})`);
        }

        if (isAdult) {
          const panValue = passenger.PAN;
          if (!panValue || typeof panValue !== 'string') {
            throw new Error(`Adult passenger "${passengerName}" is missing PAN number`);
          }

          const cleanPAN = panValue.trim().toUpperCase();

          if (!cleanPAN ||
            ['NULL', 'UNDEFINED', 'N/A', 'NA', 'NONE', ''].includes(cleanPAN) ||
            cleanPAN.replace(/\s/g, '') === '') {
            throw new Error(`Adult passenger "${passengerName}" has invalid PAN: "${panValue}"`);
          }

          if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPAN) && cleanPAN.length < 5) {
            throw new Error(`Invalid PAN format for "${passengerName}": "${cleanPAN}". Required format: ABCDE1234F`);
          }

          return {
            Title: String(passenger.Title || "Mr").trim(),
            FirstName: String(passenger.FirstName || "").trim(),
            MiddleName: String(passenger.MiddleName || "").trim(),
            LastName: String(passenger.LastName || "").trim(),
            Phoneno: String(passenger.Phoneno || "").replace(/\D/g, ''),
            Email: String(passenger.Email || "").trim().toLowerCase(),
            PaxType: 1,
            LeadPassenger: shouldBeLeadPassenger ? "true" : "false",
            Age: passenger.Age && !isNaN(passenger.Age) ? parseInt(passenger.Age) : 0,
            PassportNo: null,
            PassportIssueDate: null,
            PassportExpDate: null,
            PAN: cleanPAN,
            GSTCompanyAddress: shouldBeLeadPassenger && passenger.GSTCompanyAddress ? String(passenger.GSTCompanyAddress).trim() : null,
            GSTCompanyContactNumber: shouldBeLeadPassenger && passenger.GSTCompanyContactNumber ? String(passenger.GSTCompanyContactNumber).trim() : null,
            GSTCompanyEmail: shouldBeLeadPassenger && passenger.GSTCompanyEmail ? String(passenger.GSTCompanyEmail).trim() : null,
            GSTCompanyName: shouldBeLeadPassenger && passenger.GSTCompanyName ? String(passenger.GSTCompanyName).trim() : null,
            GSTNumber: shouldBeLeadPassenger && passenger.GSTNumber ? String(passenger.GSTNumber).trim() : null,
          };
        } else {
          return {
            Title: String(passenger.Title || "Master").trim(),
            FirstName: String(passenger.FirstName || "").trim(),
            MiddleName: String(passenger.MiddleName || "").trim(),
            LastName: String(passenger.LastName || "").trim(),
            Phoneno: String(passenger.Phoneno || "").replace(/\D/g, ''),
            Email: String(passenger.Email || "").trim().toLowerCase(),
            PaxType: 2,
            LeadPassenger: "false",
            Age: passenger.Age && !isNaN(passenger.Age) ? parseInt(passenger.Age) : 5,
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
      });

      return {
        RoomIndex: roomIndex + 1,
        HotelPassenger: processedPassengers
      };
    });

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

    console.log(`SUCCESS: Exactly ONE lead passenger set: ${leadPassengerName}`);

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

    const uniqueClientRef = generateUniqueClientReference();

    const finalPayload = {
      ResultIndex: String(bookingDetails.ResultIndex || `CRS_${bookingDetails.HotelCode || 67}`),
      HotelCode: String(bookingDetails.HotelCode || 67),
      HotelName: String(bookingDetails.HotelName || "ALILA DIWA"),
      GuestNationality: "IN",
      NoOfRooms: String(processedRooms.length),
      ClientReferenceNo: uniqueClientRef,
      CouponDiscount: finalCouponDiscount,
      vendorCommission: vendorCommissionAmount,
      agentCommissionPercent: 0,
      vendorCommissionPercentage: vendorCommissionPercentage,
      IsVoucherBooking: "true",
      HotelRoomsDetails: processedRooms,
      UserIp: String(bookingDetails.UserIp || "49.36.217.215"),
      SearchTokenId: String(bookingDetails.SearchTokenId || "5e423a789321f6edcf0de63bc80b3342b5c318ed"),
      appliedCoupon: activeCoupon ? {
        code: activeCoupon.code || activeCoupon.couponCode,
        discount: finalCouponDiscount,
        originalDiscount: activeCoupon.discount || activeCoupon.value,
        type: activeCoupon.discountType || activeCoupon.type
      } : null
    };

    return finalPayload;
  };

  // ENHANCED: Extract API response error with more detail
  const getApiErrorMessage = (error) => {
    console.error('API Error:', error);

    if (error?.response?.data) {
      const data = error.response.data;
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

  // ENHANCED: Payment success handler with comprehensive refund popup triggers
  const handlePaymentSuccess = async (response, formattedBookingData, validation) => {
    if (bookingProcessed) {
      console.log('Booking already processed, skipping duplicate call');
      return;
    }

    try {
      setBookingProcessed(true);
      setBookingStage('Confirming your hotel reservation...');
      console.log('Sending booking request with payload:', JSON.stringify(formattedBookingData, null, 2));

      // Validate token before making the booking call
      const token = localStorage.getItem('token');
      if (!token) {
        const errorMessage = 'Authentication token not found. Please login and try again.';
        setError(errorMessage);
        showErrorToast('Authentication Error', errorMessage);

        // ENHANCED: Show refund popup for authentication error
        displayRefundModal({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          amount: roundedTotal,
          errorMessage: errorMessage
        }, 'Authentication token missing - unable to complete booking');

        setBookingInProgress(false);
        setLoading(false);
        return;
      }

      console.log('Token present:', token ? 'Yes' : 'No');

      const bookingResponse = await bookHotel(formattedBookingData);
      console.log('Booking API response:', JSON.stringify(bookingResponse, null, 2));

      // ENHANCED: Handle no response scenario
      if (!bookingResponse) {
        const errorMessage = 'No response received from booking API';
        setError(errorMessage);
        showErrorToast('Booking Failed', errorMessage);

        displayRefundModal({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          amount: roundedTotal,
          errorMessage: errorMessage
        }, 'Booking API returned no response');

        setBookingInProgress(false);
        setLoading(false);
        return;
      }

      // ENHANCED: More comprehensive error detection
      const hasActualError = (
        (bookingResponse.error?.Error?.ErrorCode && bookingResponse.error.Error.ErrorCode > 0) ||
        (bookingResponse.error?.Error?.ErrorMessage && bookingResponse.error.Error.ErrorMessage.trim() !== "") ||
        (bookingResponse.Error?.ErrorCode && bookingResponse.Error.ErrorCode > 0) ||
        (bookingResponse.Error?.ErrorMessage && bookingResponse.Error.Error.ErrorMessage.trim() !== "") ||
        (bookingResponse.success === false) ||
        (bookingResponse.status && bookingResponse.status.toLowerCase() === 'error') ||
        (bookingResponse.Status && bookingResponse.Status.toLowerCase() === 'failed') ||
        // Additional error patterns
        (bookingResponse.BookingStatus && bookingResponse.BookingStatus.toLowerCase() === 'failed') ||
        (bookingResponse.result && bookingResponse.result.status === 'error') ||
        // Check for specific error messages that indicate failure
        (bookingResponse.message && /failed|error|unable|cannot/i.test(bookingResponse.message))
      );

      if (hasActualError) {
        const apiError = bookingResponse.error?.Error || bookingResponse.Error || bookingResponse;
        const errorMessage = apiError?.ErrorMessage || apiError?.message || bookingResponse.message || 'Booking failed due to API error';
        const errorCode = apiError?.ErrorCode || bookingResponse.errorCode || 'Unknown';

        console.error('Booking API Error:', { errorCode, errorMessage, fullResponse: bookingResponse });

        displayRefundModal({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          amount: roundedTotal,
          errorMessage: errorMessage,
          errorCode: errorCode
        }, `Booking API Error: ${errorMessage}`);

        // Handle authentication errors specifically
        if (errorCode === 401 || errorMessage.includes('Authenticate') || errorMessage.includes('authentication')) {
          const authErrorMessage = 'Authentication failed. Please login again and retry booking.';
          setError(authErrorMessage);
          showErrorToast('Authentication Error', authErrorMessage);

          setTimeout(() => {
            localStorage.removeItem('token');
            navigate('/login', { state: { returnTo: location.pathname } });
          }, 5000);
        } else {
          setError(errorMessage);
          showErrorToast('Booking API Error', `Error ${errorCode}: ${errorMessage}`);
        }

        setBookingInProgress(false);
        setLoading(false);
        return;
      }

      // ENHANCED: More comprehensive success validation
      const isBookingSuccessful = (
        (bookingResponse?.message && /successfully|confirmed|processed/i.test(bookingResponse.message)) ||
        bookingResponse?.BookingStatus?.toLowerCase() === 'confirmed' ||
        bookingResponse?.result?.BookingStatus?.toLowerCase() === 'confirmed' ||
        bookingResponse?.result?.BookingStatus === 'Processing' ||
        bookingResponse?.Status?.toLowerCase() === 'success' ||
        bookingResponse?.success === true ||
        // Success if ErrorCode is 0 and no error message
        (bookingResponse?.Error?.ErrorCode === 0 &&
          (!bookingResponse?.Error?.ErrorMessage || bookingResponse?.Error?.ErrorMessage.trim() === ""))
      );

      const hasRequiredBookingData = (
        bookingResponse?.userId &&
        bookingResponse?.SearchTokenId &&
        bookingResponse?.UserIp
      );

      const hasBookingId = (
        bookingResponse?.BookingID ||
        bookingResponse?.bookingId ||
        bookingResponse?.id ||
        bookingResponse?.result?.BookingId
      );

      // ENHANCED: Show refund popup if booking validation fails
      if (!isBookingSuccessful || !hasRequiredBookingData) {
        const validationError = !isBookingSuccessful
          ? 'Booking status indicates failure or incomplete processing'
          : `Missing required booking data: ${!hasRequiredBookingData ? 'user/search data missing' : 'booking ID missing'}`;

        console.error('Booking validation failed:', {
          isBookingSuccessful,
          hasRequiredBookingData,
          hasBookingId,
          response: bookingResponse
        });

        displayRefundModal({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          amount: roundedTotal,
          errorMessage: bookingResponse?.message || 'Booking validation failed'
        }, validationError);

        setError(validationError);
        showErrorToast('Booking Failed', validationError);
        setBookingInProgress(false);
        return;
      }

      // SUCCESS: Booking confirmed
      setBookingStage('Booking confirmed! Preparing confirmation details...');
      showSuccessToast('Hotel booking confirmed successfully!');

      // Send invoice email after successful booking
      if (hasBookingId) {
        try {
          setBookingStage('Sending invoice to your email...');
          const leadPassengerEmail = getLeadPassengerEmail(formattedBookingData);
          console.log('Sending invoice to email:', leadPassengerEmail);

          const invoicePayload = {
            UserIp: bookingResponse.UserIp || formattedBookingData.UserIp || "49.36.217.215",
            BookingId: hasBookingId,
            SearchTokenId: bookingResponse.SearchTokenId || formattedBookingData.SearchTokenId,
            receiverEmail: leadPassengerEmail
          };

          const invoiceResult = await sendHotelInvoice(invoicePayload);

          if (invoiceResult.success) {
            console.log('Invoice sent successfully');
            showSuccessToast('Invoice sent to your email successfully!');
          } else {
            console.warn('Invoice sending failed:', invoiceResult.message);
            showErrorToast('Invoice Email Warning',
              `Booking confirmed but invoice email failed: ${invoiceResult.message || 'Unknown error'}`);
          }
        } catch (invoiceError) {
          console.error('Invoice sending error:', invoiceError);
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
            couponData: activeCoupon,
            couponDiscount: finalCouponDiscount
          },
        });
      }, 1500);

    } catch (bookingError) {
      console.error('Booking API Exception:', bookingError);

      // ENHANCED: Always show refund popup for any booking exception
      displayRefundModal({
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        amount: roundedTotal,
        errorMessage: getApiErrorMessage(bookingError)
      }, `Exception during booking process: ${getApiErrorMessage(bookingError)}`);

      // Handle different types of errors
      if (bookingError.response?.status === 401) {
        const authErrorMessage = 'Authentication failed. Please login again and retry booking.';
        setError(authErrorMessage);
        showErrorToast('Authentication Error', authErrorMessage);

        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login', { state: { returnTo: location.pathname } });
        }, 5000);
      } else if (bookingError.response?.status === 500) {
        const serverErrorMessage = 'Server error occurred. Please try again in a few minutes.';
        setError(serverErrorMessage);
        showErrorToast('Server Error', serverErrorMessage);
      } else if (bookingError.response?.status === 404) {
        const notFoundMessage = 'Booking service not found. Please contact support.';
        setError(notFoundMessage);
        showErrorToast('Service Error', notFoundMessage);
      } else if (bookingError.code === 'NETWORK_ERROR') {
        const networkErrorMessage = 'Network connection failed. Please check your internet and try again.';
        setError(networkErrorMessage);
        showErrorToast('Network Error', networkErrorMessage);
      } else {
        const apiErrorMessage = getApiErrorMessage(bookingError);
        setError(apiErrorMessage);
        showErrorToast('Booking API Error', apiErrorMessage);
      }

      setBookingInProgress(false);
    }
  };

  // ENHANCED: Main payment handler with comprehensive refund popup triggers
  const handlePayment = async () => {
    if (loading || bookingInProgress || bookingProcessed) {
      console.log('Payment already in progress or completed');
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
      console.log('Starting payment process...');
      console.log('Raw booking details:', hotelBookingDetails);

      let formattedBookingData;
      try {
        formattedBookingData = formatBookingData(hotelBookingDetails);
        console.log('Booking data formatted successfully');
      } catch (formatError) {
        console.error('Format error:', formatError);
        setError(formatError.message);
        showErrorToast('Booking Data Error', formatError.message);
        setLoading(false);
        bookingAttemptRef.current = null;
        return;
      }

      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        const errorMessage = 'Payment system failed to load. Please refresh and try again.';
        setError(errorMessage);
        showErrorToast('Payment System Error', errorMessage);
        setLoading(false);
        bookingAttemptRef.current = null;
        return;
      }

      // ENHANCED: Create order with comprehensive error handling
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

        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_RMb7SMI7mR2cCA',
          amount: order.amount,
          currency: order.currency,
          // name: 'Rasutrip',
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

              // ENHANCED: Validate payment with error handling and refund popup
              try {
                const validation = await validateHotelPayment(validatePayload);

                if (validation?.message === 'Payment verified successfully' && validation?.payment?.status === 'success') {
                  setBookingStage('Payment successful! Processing hotel booking...');
                  await handlePaymentSuccess(response, formattedBookingData, validation);
                } else {
                  // ENHANCED: Show refund popup for payment validation failure
                  displayRefundModal({
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                    amount: roundedTotal,
                    errorMessage: validation?.message || validation?.error?.message || 'Payment validation failed'
                  }, 'Payment validation failed by server');

                  const validationError = validation?.message || validation?.error?.message || 'Payment validation failed';
                  setError(validationError);
                  showErrorToast('Payment Validation Failed', validationError);
                  setBookingInProgress(false);
                }
              } catch (validationError) {
                console.error('Payment validation error:', validationError);

                // ENHANCED: Show refund popup for validation API errors
                displayRefundModal({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  amount: roundedTotal,
                  errorMessage: getApiErrorMessage(validationError)
                }, `Payment validation API error: ${getApiErrorMessage(validationError)}`);

                const apiErrorMessage = getApiErrorMessage(validationError);
                setError(apiErrorMessage);
                showErrorToast('Payment Processing Error', apiErrorMessage);
                setBookingInProgress(false);
              }
            } catch (handlerError) {
              console.error('Payment handler error:', handlerError);

              // ENHANCED: Show refund popup for any payment handler error
              displayRefundModal({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: roundedTotal,
                errorMessage: getApiErrorMessage(handlerError)
              }, `Payment handler error: ${getApiErrorMessage(handlerError)}`);

              setError(getApiErrorMessage(handlerError));
              showErrorToast('Payment Handler Error', getApiErrorMessage(handlerError));
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
          // ENHANCED: Enhanced Razorpay failure handling with refund consideration
          const failureMessage = response.error.description || response.error.reason || 'Payment failed due to unknown error';

          // Note: For Razorpay failures, money is typically not deducted, but we log it for safety
          console.warn('Razorpay Payment Failed:', response.error);

          setError(failureMessage);
          showErrorToast('Payment Failed', `Payment failed: ${failureMessage}`);
          setLoading(false);
          setBookingInProgress(false);
          bookingAttemptRef.current = null;
        });

        rzp.open();

      } catch (orderError) {
        console.error('Order creation error:', orderError);
        const apiErrorMessage = getApiErrorMessage(orderError);
        setError(apiErrorMessage);
        showErrorToast('Order Creation Failed', apiErrorMessage);
        setLoading(false);
        bookingAttemptRef.current = null;
      }

    } catch (err) {
      console.error('Payment initialization error:', err);
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

  return (
    <>
      {/* ENHANCED: Refund Popup - shows in ALL failure scenarios */}
      <RefundPopup />

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
                  {(loading || bookingInProgress) && (
                    <div className="ms-auto">
                      <div className="spinner-border spinner-border-sm" role="status">
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
                      <div className="fs-5 fw-bold">₹ {roundedTotal.toLocaleString()}</div>
                      {finalCouponDiscount > 0 && (
                        <div className="small text-success fw-bold">
                          Coupon Savings: ₹{finalCouponDiscount.toFixed(2)}
                        </div>
                      )}
                      {finalCouponDiscount > 0 && (
                        <div className="text-muted small text-decoration-line-through">
                          Original: ₹{subtotalAfterHotelDiscount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lead Guest Information */}
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

              <Card.Footer className="bg-light">
                <div className="text-end">
                  <Button
                    className="px-5 py-2 btn-red"
                    onClick={handlePayment}
                    disabled={roundedTotal <= 0 || loading || bookingInProgress || bookingProcessed}
                  >
                    {loading || bookingInProgress ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {bookingInProgress ? 'Processing Booking...' : 'Loading Payment...'}
                      </>
                    ) : bookingProcessed ? (
                      <>Booking Processed</>
                    ) : (
                      <>Pay ₹{roundedTotal.toLocaleString()}</>
                    )}
                  </Button>
                </div>
              </Card.Footer>
            </Card>

            {/* Error Alert */}
            {error && (
              <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
                <FaExclamationTriangle className="me-2" />
                <strong>Booking Error:</strong>
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