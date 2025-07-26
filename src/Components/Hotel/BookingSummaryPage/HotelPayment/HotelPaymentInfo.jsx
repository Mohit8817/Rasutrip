import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  createHotelOrder,
  validateHotelPayment,
  bookHotel,
} from '../../../APIS/HotelApi/HotelAPi';

const HotelPaymentInfo = () => {
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    console.log('📦 Payload from location.state:', payload);
    console.log('🏨 Hotel Booking Details:', hotelBookingDetails);
    console.log('💵 Price Details:', priceDetails);
    console.log('🧾 Review Data:', reviewData);
  }, []);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    setLoading(true);
    const razorpayLoaded = await loadRazorpayScript();

    if (!razorpayLoaded) {
      alert('Razorpay SDK failed to load.');
      setLoading(false);
      return;
    }

    try {
      const orderResponse = await createHotelOrder(roundedTotal);
      const order = orderResponse?.order;

      if (!order?.id) throw new Error('Invalid Razorpay order response');

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
              Hotel: hotelBookingDetails,
            };

            const validation = await validateHotelPayment(validatePayload);

            if (
              validation?.message === 'Payment verified successfully' &&
              validation?.payment?.status === 'success'
            ) {
              let cleanedPayload = {
                ...payload,
                RazorpayOrderId: response.razorpay_order_id,
                RazorpayPaymentId: response.razorpay_payment_id,
                RazorpayOrderStatus: 'PAID',
                PaymentId: validation?.payment?._id || '',
              };

              let hotelData =
                cleanedPayload?.Hotel?.Hotel ||
                hotelBookingDetails?.Hotel ||
                hotelBookingDetails;

              const GuestNationality =
                payload?.GuestNationality ||
                reviewData?.GuestNationality ||
                'IN';

              if (hotelData?.HotelRoomsDetails) {
                hotelData.HotelRoomsDetails = hotelData.HotelRoomsDetails.map(
                  (room, roomIndex) => {
                    const transformedPassengers = room?.HotelPassenger?.map(
                      (pax, paxIndex) => ({
                        Title: pax?.Title || 'Mr',
                        FirstName: pax?.FirstName || 'Guest',
                        MiddleName: pax?.MiddleName || '',
                        LastName: pax?.LastName || '',
                        Phoneno: pax?.Phoneno || '9999999999',
                        Email: pax?.Email || 'user@example.com',
                        PaxType: pax?.PaxType ?? 1,
                        LeadPassenger:
                          pax?.LeadPassenger === true ||
                          pax?.LeadPassenger === 'true' ||
                          (paxIndex === 0 && roomIndex === 0),
                        Age: pax?.Age || 30,
                        PAN:
                          pax?.PAN && pax?.PAN.trim()
                            ? pax.PAN
                            : (paxIndex === 0 && roomIndex === 0 && reviewData?.panNumber)
                              ? reviewData.panNumber
                              : '',
                        PassportNo: pax?.PassportNo || '',
                        PassportIssueDate: pax?.PassportIssueDate || '',
                        PassportExpDate: pax?.PassportExpDate || '',
                        GSTCompanyAddress: pax?.GSTCompanyAddress || '',
                        GSTCompanyContactNumber: pax?.GSTCompanyContactNumber || '',
                        GSTCompanyEmail: pax?.GSTCompanyEmail || '',
                        GSTCompanyName: pax?.GSTCompanyName || '',
                        GSTNumber: pax?.GSTNumber || '',
                      })
                    );
                    return {
                      ...room,
                      HotelPassenger: transformedPassengers,
                    };
                  }
                );
              }

              const isValid = hotelData?.HotelRoomsDetails?.every((room) =>
                room?.HotelPassenger?.every((p) => p.PAN && p.PAN.trim())
              );

              if (!isValid) {
                alert('PAN missing for one or more passengers.');
                setLoading(false);
                return;
              }

              cleanedPayload = {
                ...cleanedPayload,
                ...hotelData,
                GuestNationality,
                vendorCommission,
                CouponDiscount: discount,
                UserIp: '49.36.217.215',
                reviewData,
              };

              delete cleanedPayload.Hotel;

              console.log('✅ Final Payload for Hotel Booking:', cleanedPayload);

              const bookingResponse = await bookHotel(cleanedPayload);

              if (bookingResponse?.BookingStatus?.toLowerCase() === 'confirmed') {
                navigate('/hotel/confirmation', {
                  state: {
                    booking: bookingResponse,
                    amount: roundedTotal,
                    reviewData,
                  },
                });
              } else {
                alert(bookingResponse?.Error?.ErrorMessage || 'Booking failed.');
                navigate('/hotel/payment-failed');
              }
            } else {
              alert(validation?.message || 'Payment validation failed.');
              navigate('/hotel/payment-failed');
            }
          } catch (err) {
            console.error('❌ Booking Error:', err);
            alert('Something went wrong during booking.');
            navigate('/hotel/payment-failed');
          }
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
          contact: '9999999999',
        },
        notes: {
          address: 'Hotel Booking',
        },
        theme: {
          color: '#c90d26',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('❌ Razorpay Init Error:', err);
      alert('Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm rounded mt-4">
      <Card.Header as="h5" className="fw-bold">Confirm Payment</Card.Header>
      <Card.Body>
        <Row className="mb-2">
          <Col>Base Fare</Col>
          <Col className="text-end">₹ {Math.round(baseFare)}</Col>
        </Row>
        <Row className="mb-2">
          <Col>CGST</Col>
          <Col className="text-end">₹ {Math.round(cgst)}</Col>
        </Row>
        <Row className="mb-2">
          <Col>SGST</Col>
          <Col className="text-end">₹ {Math.round(sgst)}</Col>
        </Row>
        <Row className="mb-2">
          <Col>Discount</Col>
          <Col className="text-end text-danger">- ₹ {Math.round(discount)}</Col>
        </Row>
        <hr />
        <Row className="fw-bold">
          <Col>Total Payable</Col>
          <Col className="text-end text-success">₹ {roundedTotal}</Col>
        </Row>
      </Card.Body>
      <Card.Footer className="bg-white text-end">
        <Button
          variant="danger"
          className="px-4"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            'Proceed to Pay'
          )}
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default HotelPaymentInfo;
