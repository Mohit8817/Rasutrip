import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Profile from '../components/Profile';
import BookingTabs from '../components/BookingtTabs';
import FlightBookingComponent from '../components/FlightBookingComponent';
import BusBookingHistory from '../components/BusBookingHistory';
import HotelBookingComponent from '../components/HotelBookingComponent';
import PaymentHistory from '../components/PaymentHistory';

const UserDashboard = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [activeBookingTab, setActiveBookingTab] = useState('Flight');

    const user = {
        name: ' ',
        mobile: ' ',
        email: '',
        createdAt: ' ',
    };

    const userType = 'customer';

    const handleLogout = () => {
        console.log('Logging out...');
        alert('Logout functionality would be implemented here');
    };

    const renderBookingContent = () => {
        switch (activeBookingTab) {
            case 'Flight':
                return <FlightBookingComponent />;
            case 'Bus':
                return <BusBookingHistory />;
            case 'Hotel':
                return <HotelBookingComponent />;
            default:
                return <FlightBookingComponent />;
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <Profile user={user} userType={userType} />;
            case 'bookings':
                return (
                    <div>
                        <BookingTabs
                            activeBookingTab={activeBookingTab}
                            setActiveBookingTab={setActiveBookingTab}
                        />
                        <div className="mt-4">
                            {renderBookingContent()}
                        </div>
                    </div>
                );
            case 'payment-history':
                return <PaymentHistory />;
            default:
                return <Profile user={user} userType={userType} />;
        }
    };

    return (
        <div className="mt-4">
            <Container fluid>
                <Row>
                    {/* Sidebar */}
                    <Col md={3} lg={3} className="mb-4">
                        <Sidebar
                            user={user}
                            userType={userType}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            onLogout={handleLogout}
                        />
                    </Col>

                    {/* Main Content */}
                    <Col md={9} lg={9}>
                        <div>
                            {renderContent()}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default UserDashboard;