import React, { useState } from 'react';
import { Card, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  createHotelOrder,
  validateHotelPayment,
} from '../../../APIS/HotelApi/HotelAPi';

const HotelPaymentInfo = ({ priceDetails, hotelBookingDetails }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const baseFare = priceDetails?.baseFare || 0;
  const cgst = priceDetails?.cgst || 0;
  const sgst = priceDetails?.sgst || 0;
  const discount = priceDetails?.discount || 0;

  const totalPayable = baseFare + cgst + sgst - discount;
  const roundedTotal = parseFloat(totalPayable.toFixed(2)); // razorpay may require 2 decimals

  const handlePayment = async () => {
    setLoading(true);
    try {
      // ✅ 1. Create Razorpay order
      const orderResponse = await createHotelOrder(roundedTotal);
      const order = orderResponse?.order;

      if (!order?.id) {
        throw new Error('Invalid Razorpay order');
      }

      // ✅ 2. Razorpay options
      const options = {
        key: 'rzp_test_glwdvx2PlFDStN',
        amount: order.amount, // in paise
        currency: order.currency,
        name: 'TTS Travels',
        description: 'Hotel Booking Payment',
        order_id: order.id, // very important
        handler: async function (response) {
          try {
            const validatePayload = {
              amount: roundedTotal, // should match your backend exactly
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingType: 'HOTEL',
              Hotel: hotelBookingDetails, // capital H as per your API
            };

            // ✅ 3. Validate payment
            const validation = await validateHotelPayment(validatePayload);

            if (validation?.payment?.status === 'success') {
              alert('✅ Payment validated successfully');
              navigate('/hotel/confirmation', {
                state: {
                  booking: validation.booking || {},
                  amount: roundedTotal,
                },
              });
            } else {
              alert('❌ Payment validated but booking failed.');
              navigate('/hotel/payment-failed');
            }
          } catch (err) {
            console.error('❌ Payment validation error:', err);
            alert('❌ Payment was made, but validation failed.');
            navigate('/hotel/payment-failed');
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

      // ✅ 4. Open Razorpay window
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('❌ Order creation failed:', err.response?.data || err.message);
      alert('❌ Failed to initiate payment. Please try again.');
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
