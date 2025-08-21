// src/components/Hotel/HotelConfirmation.js - SIMPLIFIED VERSION

import React, { useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';

const HotelConfirmation = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    // Extract data from navigation state
    const {
        booking = {},
        bookingResult = {},
        confirmationDetails = {},
        isBooked = false
    } = state || {};

    const actualBooking = booking || bookingResult || {};

    // Show success toast on mount
    useEffect(() => {
        if ((isBooked && actualBooking) || confirmationDetails?.message) {
            toast.success('🎉 Hotel booking confirmed successfully!', {
                position: "top-right",
                autoClose: 5000
            });
        }
    }, [isBooked, actualBooking, confirmationDetails]);

    // Redirect if no booking data
    if (!state || (!isBooked && !confirmationDetails?.bookingId) || (!actualBooking && !confirmationDetails)) {
        return (
            <Container className="py-4 mt-5">
                <Card className="shadow-sm border-danger">
                    <Card.Body className="text-center">
                        <h5 className="text-danger">No Booking Information Found</h5>
                        <p>Please start the booking process again.</p>
                        <Button variant="primary" onClick={() => navigate('/')}>
                            Back to Home
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // Handle invoice download
    const handleDownloadInvoice = () => {
        // Add your invoice download logic here
        toast.success('Invoice download started!', {
            position: "top-right",
            autoClose: 3000
        });

        // Example: You can implement actual download logic here
        // window.open('/api/download-invoice/' + bookingId, '_blank');
    };

    return (
        <Container className="py-4 innerpagecontainer mt-5 pt-5">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Card className="shadow-lg text-center" style={{ maxWidth: '400px', width: '100%' }}>
                    <Card.Body className="p-5">
                        <h3 className="mb-4 text-success fw-bold">Booking Confirmed!</h3>
                        <p className="mb-4 text-muted">Your hotel reservation has been successfully completed.</p>

                        <Button
                            variant="danger"
                            size="lg"
                            className="px-4 py-3 fw-bold"
                            onClick={handleDownloadInvoice}
                            style={{
                                minWidth: '200px',
                                fontSize: '1.1rem'
                            }}
                        >
                            <FaDownload className="me-2" />
                            Download Invoice
                        </Button>
                    </Card.Body>
                </Card>
            </div>
        </Container>
    );
};

export default HotelConfirmation;