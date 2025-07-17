// RazorpayPayment.jsx
import axios from 'axios';
import { post } from '../APIS/FlightApi/FlightApi';
import { Card, Button, Row, Col, Badge, Spinner } from "react-bootstrap";
import { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";


const RazorpayPayment = () => {


    const location = useLocation();

  const { passengerSelections = [], SSR, SelectedFare } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [fare, setfare] = useState(SelectedFare);

 const finalAmount = (((fare?.PublishedPrice || 0) + ((fare?.PublishedPrice || 0) * 0.18))+(passengerSelections[0]?.meal?.Price || 0)+ (passengerSelections[0]?.baggage?.Price || 0)+(passengerSelections[0]?.seat?.Price || 0)).toFixed(2)
  const handlePayment = async () => {
    setLoading(true);

    const data = {
      amount: finalAmount, // You can make this dynamic
    };

    try {
      const response = await post(data, "/airservice/create-order");
      const order = response;

      const options = {
        key: "rzp_test_glwdvx2PlFDStN",
        amount: order.amount * 100,
        currency: "INR",
        order_id: order.id,
        handler: function (response) {
          alert("✅ Payment Successful!");
          console.log(response);
        },
        prefill: {
          name: "Your Name",
          email: "email@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "Your address",
        },
        theme: {
          color: "#0d6efd",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error("Payment initiation failed", err);
      alert("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white">
          <h5 className="fw-bold mb-0">Confirm Payment</h5>
        </Card.Header>

        <Card.Body>
          <Row className="mb-3">
            <Col xs={6}><span className="text-muted">Booking Amount</span></Col>
            <Col xs={6} className="text-end fw-semibold">₹ {finalAmount}</Col>
          </Row>

          <hr />

          <Row className="mb-2">
            <Col xs={6}><span className="text-muted">Taxes & Charges</span></Col>
            <Col xs={6} className="text-end">Included</Col>
          </Row>

          <Row className="mt-3">
            <Col xs={6}>
              <span className="fw-bold">Total Payable</span>
            </Col>
            <Col xs={6} className="text-end">
              <h5 className="fw-bold text-success">₹{finalAmount}</h5>
            </Col>
          </Row>
        </Card.Body>

        <Card.Footer className="bg-white text-end">
          <Button
            onClick={handlePayment}
            variant="primary"
            className="btn-red"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              "Proceed to Pay"
            )}
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default RazorpayPayment;
