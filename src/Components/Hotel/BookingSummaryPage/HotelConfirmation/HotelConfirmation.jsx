import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { FaCheckCircle, FaReceipt, FaRupeeSign } from 'react-icons/fa';
import { fetchHotelInvoice } from '../../../APIS/HotelApi/HotelAPi';

const HotelConfirmation = () => {
  const location = useLocation();
  const booking = location.state?.booking || {};
  const amount = location.state?.amount || 0;

  const handleInvoiceDownload = async () => {
    if (!booking.bookingId || !booking.searchTokenId) {
      alert("Missing booking information.");
      return;
    }

    try {
      const res = await fetchHotelInvoice({
        BookingId: booking.bookingId,
        SearchTokenId: booking.searchTokenId,
        UserIp: "49.36.217.215",
      });

      // If using Axios, extract data from response
      const data = res?.data || res;

      console.log("✅ Invoice API Raw Response:", data);

      // Extract details if available
      const invoiceNumber = data?.InvoiceNumber || 'N/A';
      const bookingDate = data?.BookingDate || new Date().toLocaleDateString();

      // Build invoice content
      const invoiceData = `
        Hotel Invoice

        Booking ID: ${booking.bookingId}
        Customer Name: ${booking.customerName || 'N/A'}
        Amount Paid: ₹${amount}
        Status: Confirmed

        Invoice Number: ${invoiceNumber}
        Booking Date: ${bookingDate}
      `;

      // Trigger download
      const blob = new Blob([invoiceData], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Hotel_Invoice_${booking.bookingId}.txt`;
      link.click();

    } catch (err) {
      console.error("❌ Failed to fetch invoice:", err);
      alert("Failed to download invoice. Please try again.");
    }
  };

  return (
    <Container className="py-5 innerpagecontainer mt-5 pt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="text-center shadow-lg border-0 rounded-4 p-4">
            <FaCheckCircle size={50} className="text-success mb-3" />
            <h3 className="mb-4 text-danger fw-bold">Booking Confirmed</h3>

            <Card.Body className="text-start">
              <p><FaReceipt className="me-2 text-primary" /> <strong>Booking ID:</strong> {booking?.bookingId || 'Not available'}</p>
              {/* <p><FaUser className="me-2 text-primary" /> <strong>Customer Name:</strong> {booking?.customerName || 'N/A'}</p> */}
              <p><FaRupeeSign className="me-2 text-primary" /> <strong>Total Paid:</strong> ₹{amount}</p>
            </Card.Body>

            <div className="d-grid gap-2 mt-3">
              <Button variant="outline-primary" className='btn-red' onClick={handleInvoiceDownload}>
                Download Invoice
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HotelConfirmation;
