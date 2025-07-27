// RazorpayPayment.jsx
import axios from 'axios';
import { post } from '../APIS/FlightApi/FlightApi';
import { Card, Button, Row, Col, Badge, Spinner } from "react-bootstrap";
import { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

// import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import MyVerticallyCenteredModal from './paymentLoader';


const RazorpayPayment = () => {
    const navigate = useNavigate();
  
    const rasocommision=localStorage.getItem('rasocommision')
  const location = useLocation();
  const { passengerSelections = [], SSR, SelectedFare } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [fare, setfare] = useState(SelectedFare);
  const [modalShow, setModalShow] = useState(false);
  // const [passengerData, setpassengerData] = useState(false);


  console.log('indexresult', SelectedFare)
  const baseFare = fare?.PublishedPrice || 0;
  const tax = baseFare * 0.18;
  const serviceCharge = baseFare * rasocommision/100;
  const totalMeal = passengerSelections.reduce((acc, p) => acc + (p?.meal?.Price || 0), 0);
  const totalBaggage = passengerSelections.reduce((acc, p) => acc + (p?.baggage?.Price || 0), 0);
  const totalSeat = passengerSelections.reduce((acc, p) => acc + (p?.seat?.Price || 0), 0);
  const finalAmount = (baseFare + totalMeal + totalBaggage + totalSeat + serviceCharge).toFixed(2);
  const storedPassengers = localStorage.getItem('passengersData');
  let passengersData = storedPassengers ? JSON.parse(storedPassengers) : []

  const BookingConfermation = async () => {
    try {
      const storedPassengers = localStorage.getItem('passengersData');
      let passengersData = storedPassengers ? JSON.parse(storedPassengers) : [];  // ✅ Use let
      const SearchTokenId = localStorage.getItem('searchToken');
      const mergedPassengers = passengersData.map((passenger, index) => {
        const selection = passengerSelections[index] || {};
        return {
          ...passenger,
          Baggage: selection.baggage ? [selection.baggage] : [],
          Meal: selection.meal ? [selection.meal] : [],
          Seat: selection.seat ? [selection.seat] : [],
        };
      });
      const IP = localStorage.getItem('UserIp');
      function formatDateToISOString(dateStr) {
        if (!dateStr) return null;
        return new Date(dateStr).toISOString().split('.')[0]; // Removes milliseconds
      }

      passengersData = mergedPassengers.map(passenger => ({
        ...passenger,
        DateOfBirth: formatDateToISOString(passenger.DateOfBirth),
        PassportExpiry: formatDateToISOString(passenger.PassportExpiry),
        PassportIssue: formatDateToISOString(passenger.PassportIssue),
      }));

      const payload = {
        UserIp: IP,
        ResultIndex: SelectedFare?.FareId || '',
        SearchTokenId: SearchTokenId || '',
        CouponDiscount: SelectedFare?.CouponDiscount || 0,
        Passengers: passengersData
      };
      const response = await post(payload, '/airservice/book');

      if (response?.Error?.ErrorCode === 0) {
        setModalShow(false);
        toast.success("Flight booked successfully ");
        navigate('/booking/success', { state: { bookingId: response.bookingId, result: response } });
      } else {
        console.error("❌ Booking Failed:", response?.Error?.ErrorMessage || "Unknown error");
        toast.error(response?.Error?.ErrorMessage || "Booking failed");
      }
      console.log('airserviceResponse', response);
      setModalShow(false)
    } catch (error) {
      setModalShow(false)

      toast.error(error?.response?.data?.error?.Error?.ErrorMessage || "Something went wrong");
    }
  };



  const getBookingConfermation = async ({ paymentData, SelectedFare, order }) => {
    try {
      const storedPassengers = localStorage.getItem('passengersData');
      const passengersData = storedPassengers ? JSON.parse(storedPassengers) : [];
      const SearchTokenId = localStorage.getItem('searchToken');

      const payload = {
        amount: order.amount / 100,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        bookingType: "FLIGHT",
        Flight: {
          ResultIndex: SelectedFare?.FareId || '',
          SearchTokenId: SearchTokenId || '',
          CouponDiscount: SelectedFare?.CouponDiscount || 0,
          Passengers: passengersData // No need to attach SSR data again
        }
      };
      const response = await post(payload, '/airservice/validate');
      await BookingConfermation()
      console.log('dataResponse', response)
    } catch (error) {
      setModalShow(false)
      console.error("Booking Validation Failed:", error.response?.data || error.message);
      // throw error;
    }
  };


  const handlePayment = async () => {
    console.log('passenger data', passengersData)
    setLoading(true);
    const data = {
      amount: finalAmount,
    };

    try {
      const response = await post(data, "/airservice/create-order");
      console.log('responseapi', response)
      const order = response.order;
      const options = {
        key: "rzp_test_glwdvx2PlFDStN",
        amount: order.amount * 100,
        currency: "INR",
        order_id: order.id,
        handler: function (response) {
          toast.success('Payment Successful! ')
          const paymentData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };
          if (!paymentData.razorpay_payment_id || !paymentData.razorpay_signature) {
            toast.error("❌ Payment response is incomplete.");
            return;
          }
          setModalShow(true)
          getBookingConfermation({ paymentData, SSR, SelectedFare, passengerSelections, order })
          console.log('response', paymentData);
        },
        prefill: {
          name: passengersData.FirstName + ' ' + passengersData.LastName,
          email: passengersData.Email,
          contact: passengersData.ContactNo,
        },
        notes: {
          address: passengersData.AddressLine1,
        },

        theme: {
          color: "#0d6efd",
        },


      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error("Payment initiation failed", err);
      toast.error(err?.response?.data?.error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">

      <MyVerticallyCenteredModal
        show={modalShow}

        onHide={() => setModalShow(false)}
      />

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
