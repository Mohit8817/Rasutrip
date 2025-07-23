// src/components/HotelPaymentInfo.jsx

import React, { useState } from 'react';
import { Card, Button, Row, Col, Spinner } from 'react-bootstrap';
import {
  createHotelOrder,
  validateHotelPayment,
} from '../../../APIS/HotelApi/HotelAPi';

const HotelPaymentInfo = ({ priceDetails, hotelBookingDetails }) => {
  const [loading, setLoading] = useState(false);

  const baseFare = priceDetails?.baseFare || 0;
  const cgst = priceDetails?.cgst || 0;
  const sgst = priceDetails?.sgst || 0;
  const discount = priceDetails?.discount || 0;
  const totalPayable = baseFare + cgst + sgst - discount;

  const handlePayment = async () => {
    setLoading(true);
    try {
      const order = await createHotelOrder(totalPayable.toFixed(2));

      const options = {
        key: 'rzp_test_glwdvx2PlFDStN', // 🔁 Replace with LIVE key in production
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'TTS Travels',
        description: 'Hotel Booking Payment',
        handler: async function (response) {
          try {
            const validatePayload = {
              amount: totalPayable,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingType: 'HOTEL',
              Hotel: hotelBookingDetails,
            };

            const validation = await validateHotelPayment(validatePayload);
            console.log('✅ Validation Success:', validation);
            alert('🎉 Booking Confirmed!');
          } catch (err) {
            console.error('❌ Payment validation failed:', err);
            alert('Payment succeeded but booking confirmation failed.');
          }
        },
        prefill: {
          name: 'User Name',
          email: 'email@example.com',
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
      console.error('❌ createHotelOrder Error:', err.response?.data || err.message);
      alert('Payment initiation failed.');
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
          <Col className="text-end">₹ {baseFare.toFixed(2)}</Col>
        </Row>
        <Row className="mb-2">
          <Col>CGST</Col>
          <Col className="text-end">₹ {cgst.toFixed(2)}</Col>
        </Row>
        <Row className="mb-2">
          <Col>SGST</Col>
          <Col className="text-end">₹ {sgst.toFixed(2)}</Col>
        </Row>
        <Row className="mb-2">
          <Col>Discount</Col>
          <Col className="text-end text-danger">- ₹ {discount.toFixed(2)}</Col>
        </Row>
        <hr />
        <Row className="fw-bold">
          <Col>Total Payable</Col>
          <Col className="text-end text-success">₹ {totalPayable.toFixed(2)}</Col>
        </Row>
      </Card.Body>
      <Card.Footer className="bg-white border-top-0 text-end">
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
