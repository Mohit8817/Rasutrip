import React, { useState } from 'react';
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
    guestInputs = [],
    email = '',
    mobile = '',
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    const razorpayLoaded = await loadRazorpayScript();
    if (!razorpayLoaded) {
      alert('❌ Razorpay SDK failed to load.');
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

        handler: async function (response) {
          try {
            const firstAdult = guestInputs?.[0]?.adults?.[0] || {};

            const validatePayload = {
              amount: roundedTotal,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingType: 'HOTEL',
              Hotel: hotelBookingDetails,
              LeadPassenger: {
                Title: firstAdult?.title || 'Mr',
                FirstName: firstAdult?.firstName || '',
                MiddleName: firstAdult?.middleName || '',
                LastName: firstAdult?.lastName || '',
                Email: email || '',
                Phoneno: mobile || '',
              },
              SearchTokenId: hotelBookingDetails?.SearchTokenId || payload?.SearchTokenId,
            };

            const validation = await validateHotelPayment(validatePayload);

            if (
              validation?.message === 'Payment verified successfully' &&
              validation?.payment?.status === 'success'
            ) {
              const hotelData = hotelBookingDetails?.Hotel || hotelBookingDetails;
              const hotelRooms = hotelData?.HotelRoomsDetails || [];

              const allRooms = [];
              const allPassengers = [];

              hotelRooms.forEach((room, roomIndex) => {
                const adults = guestInputs?.[roomIndex]?.adults || [];
                const children = guestInputs?.[roomIndex]?.children || [];

                const passengers = [
                  ...adults.map((guest, i) => ({
                    Title: guest.title || 'Mr',
                    FirstName: guest.firstName || '',
                    MiddleName: guest.middleName || '',
                    LastName: guest.lastName || '',
                    Phoneno: mobile,
                    Email: email,
                    PaxType: 1,
                    LeadPassenger: roomIndex === 0 && i === 0 ? 'true' : 'false',
                    Age: 0,
                    PassportNo: null,
                    PassportIssueDate: null,
                    PassportExpDate: null,
                    PAN: guest.pan || null,
                    GSTCompanyAddress: null,
                    GSTCompanyContactNumber: null,
                    GSTCompanyEmail: null,
                    GSTCompanyName: null,
                    GSTNumber: null,
                  })),
                  ...children.map((guest) => ({
                    Title: guest.title || 'Master',
                    FirstName: guest.firstName || '',
                    MiddleName: guest.middleName || '',
                    LastName: guest.lastName || '',
                    Phoneno: mobile,
                    Email: email,
                    PaxType: 2,
                    LeadPassenger: 'false',
                    Age: guest.age || 10,
                    PassportNo: null,
                    PassportIssueDate: null,
                    PassportExpDate: null,
                    PAN: null,
                    GSTCompanyAddress: null,
                    GSTCompanyContactNumber: null,
                    GSTCompanyEmail: null,
                    GSTCompanyName: null,
                    GSTNumber: null,
                  })),
                ];

                allPassengers.push(...passengers);

                allRooms.push({
                  RoomIndex: room.RoomIndex,
                  RoomTypeCode: room.RoomTypeCode,
                  RoomTypeName: room.RoomTypeName,
                  HotelPassenger: passengers,
                });
              });

              const topLead = allPassengers.find((p) => p.LeadPassenger === 'true');

              const cleanedPayload = {
                ResultIndex: hotelBookingDetails?.ResultIndex || payload?.ResultIndex || '',
                HotelCode: hotelBookingDetails?.HotelCode || payload?.HotelCode || '',
                SearchTokenId: hotelBookingDetails?.SearchTokenId || payload?.SearchTokenId || '',
                HotelName:
                  hotelBookingDetails?.Hotel?.HotelName ||
                  hotelBookingDetails?.HotelName ||
                  payload?.HotelName ||
                  'Unknown Hotel',
                vendorCommission,
                CouponDiscount: discount,
                GuestNationality: hotelBookingDetails?.GuestNationality || 'IN',
                NoOfRooms: allRooms.length.toString(),
                ClientReferenceNo: 0,
                IsVoucherBooking: 'true',
                HotelRoomsDetails: allRooms,
                UserIp: '49.36.217.215',

                LeadPassenger: {
                  Title: topLead?.Title || 'Mr',
                  FirstName: topLead?.FirstName || '',
                  MiddleName: topLead?.MiddleName || '',
                  LastName: topLead?.LastName || '',
                  Email: topLead?.Email || '',
                  Phoneno: topLead?.Phoneno || '',
                },
              };


              const bookingResponse = await bookHotel(cleanedPayload);

              if (bookingResponse?.BookingStatus?.toLowerCase() === 'confirmed') {
                alert('✅ Booking Confirmed!');
                navigate('/hotel/confirmation', {
                  state: {
                    booking: bookingResponse,
                    amount: roundedTotal,
                  },
                });
              } else {
                const retry = window.confirm('Payment succeeded but booking failed. Do you want to retry?');
                if (retry) {
                  const retryResponse = await bookHotel(cleanedPayload);
                  if (retryResponse?.BookingStatus?.toLowerCase() === 'confirmed') {
                    alert('✅ Booking Confirmed on Retry!');
                    navigate('/hotel/confirmation', {
                      state: {
                        booking: retryResponse,
                        amount: roundedTotal,
                      },
                    });
                  } else {
                    alert('❌ Retry also failed.');
                    navigate('/hotel/payment-failed');
                  }
                } else {
                  navigate('/hotel/payment-failed');
                }
              }
            } else {
              alert('❌ Payment validation failed.');
              navigate('/hotel/payment-failed');
            }
          } catch (err) {
            console.error('❌ Booking Error:', err);
            alert('Booking failed. Please try again.');
            navigate('/hotel/payment-failed');
          }
        },

        prefill: {
          name: guestInputs?.[0]?.adults?.[0]?.firstName || 'Guest',
          email: email || 'guest@example.com',
          contact: mobile || '9999999999',
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
      console.error('❌ Payment Init Error:', err);
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
