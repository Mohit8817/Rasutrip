import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Card } from 'react-bootstrap';

const HotelConfirmation = () => {
  const location = useLocation();
  const booking = location.state?.booking || {};
  const amount = location.state?.amount || 0;

  const handleInvoiceDownload = () => {
    // You can replace this with real invoice generation logic
    const invoiceData = `
      Booking ID: ${booking.bookingId || 'N/A'}
      Amount Paid: ₹${amount}
      Status: Confirmed
    `;
    const blob = new Blob([invoiceData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Hotel_Invoice.txt';
    link.click();
  };

  return (
    <Card className="mt-5 shadow">
      <Card.Header as="h4" className="text-success">Booking Confirmed</Card.Header>
      <Card.Body>
        <p><strong>Booking ID:</strong> {booking?.bookingId || 'Not available'}</p>
        <p><strong>Customer Name:</strong> {booking?.customerName || 'N/A'}</p>
        <p><strong>Total Paid:</strong> ₹{amount}</p>
        <Button onClick={handleInvoiceDownload} variant="primary">
          Download Invoice
        </Button>
      </Card.Body>
    </Card>
  );
};

export default HotelConfirmation;
