    // HotelConfirmation.js
    import React from 'react';
    import { useLocation } from 'react-router-dom';
    import { Button, Card } from 'react-bootstrap';

    const HotelConfirmation = () => {
    const location = useLocation();
    const { booking, amount } = location.state || {};

    const handleInvoiceDownload = () => {
        // Optional: use API to get PDF invoice or create it on frontend
        window.print(); // or trigger file download
    };

    return (
        <Card className="mt-4 p-3 shadow-sm innerpagecontainer ">
        <h4>🎉 Booking Confirmed!</h4>
        <p>Hotel: {booking?.HotelName || 'N/A'}</p>
        <p>Amount Paid: ₹ {amount}</p>
        <p>Booking ID: {booking?.BookingID || 'Will be emailed'}</p>

        <Button className="btn-red" variant="success" onClick={handleInvoiceDownload}>
            📄 Download Invoice
        </Button>

    
        </Card>
    );
    };

    export default HotelConfirmation;
