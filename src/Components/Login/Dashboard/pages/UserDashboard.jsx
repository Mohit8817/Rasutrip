import React, { useState } from 'react';
import { Container, Row, Col, Offcanvas } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Profile from '../components/Profile';
import BookingTabs from '../components/BookingtTabs';
import FlightBookingComponent from '../components/FlightBookingComponent';
import BusBookingHistory from '../components/BusBookingHistory';
import HotelBookingComponent from '../components/HotelBookingComponent';
import PaymentHistory from '../components/PaymentHistory';
import BankDetails from '../components/BankDetails';

const UserDashboard = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [activeBookingTab, setActiveBookingTab] = useState('Flight');
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    const user = {
        name: ' ',
        mobile: ' ',
        email: '',
        createdAt: ' ',
        role: 'agent' // Set this based on actual user data
    };

    const userType = 'agent'; // This should come from your auth context

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
            case 'bank-details':
                // Only render if user is an agent
                const isAgent = user.role === 'agent' || user.userType === 'agent' || user.type === 'agent' || userType === 'agent';
                if (isAgent) {
                    return <BankDetails />;
                } else {
                    return <div className="alert alert-warning">Access Denied: Bank Details are only available for agents.</div>;
                }
            default:
                return <Profile user={user} userType={userType} />;
        }
    };

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="d-block d-lg-none bg-white shadow-sm border-bottom sticky-top">
                <div className="p-3 d-flex align-items-center">
                    {/* Menu Toggle Button */}
                    <button
                        className="btn btn-outline-primary me-3 d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}
                        onClick={() => setShowMobileSidebar(true)}
                    >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                        </svg>
                    </button>
                    
                    {/* Mobile Header Title */}
                    <div className="flex-grow-1">
                        <h5 className="mb-0 fw-bold text-dark">
                            {activeTab === 'profile' && 'Profile'}
                            {activeTab === 'bookings' && 'My Bookings'}
                            {activeTab === 'payment-history' && 'Payment History'}
                            {activeTab === 'bank-details' && 'Bank Details'}
                        </h5>
                        <small className="text-muted">Dashboard</small>
                    </div>
                    
                    {/* User Avatar */}
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{
                            width: '40px',
                            height: '40px',
                            background: userType === 'agent' 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                        }}
                    >
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                </div>
            </div>

            {/* Mobile Offcanvas Sidebar */}
            <Offcanvas
                show={showMobileSidebar}
                onHide={() => setShowMobileSidebar(false)}
                placement="start"
                className="d-block d-lg-none"
                style={{ width: '280px' }}
            >
                <Offcanvas.Body className="p-0">
                    <Sidebar
                        user={user}
                        userType={userType}
                        activeTab={activeTab}
                        setActiveTab={(tab) => {
                            setActiveTab(tab);
                            setShowMobileSidebar(false); // Close sidebar on mobile after selection
                        }}
                        onLogout={handleLogout}
                        isMobile={true}
                    />
                </Offcanvas.Body>
            </Offcanvas>

            {/* Main Layout */}
            <div className="pt-0 pt-lg-4">
                <Container fluid className="px-3 px-lg-4">
                    <Row className="g-0 g-lg-4">
                        {/* Desktop Sidebar - Hidden on mobile */}
                        <Col lg={3} className="d-none d-lg-block">
                            <div className="sticky-top" style={{ top: '20px' }}>
                                <Sidebar
                                    user={user}
                                    userType={userType}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    onLogout={handleLogout}
                                    isMobile={false}
                                />
                            </div>
                        </Col>

                        {/* Main Content */}
                        <Col lg={9} className="px-0 px-lg-3">
                            <div 
                                className="main-content"
                                style={{ 
                                    minHeight: '100vh',
                                    paddingTop: '0',
                                    paddingBottom: '80px' // Extra bottom padding for mobile
                                }}
                            >
                                {renderContent()}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Mobile Bottom Navigation - Alternative approach */}
            <div className="d-block d-lg-none fixed-bottom bg-white border-top shadow-lg">
                <div className="container-fluid">
                    <div className="row g-0">
                        <div className="col-3">
                            <button
                                className={`btn w-100 border-0 py-3 px-2 text-center ${
                                    activeTab === 'profile' ? 'text-primary' : 'text-muted'
                                }`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <div className="mb-1">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47z"/>
                                    </svg>
                                </div>
                                <small className="fw-medium">Profile</small>
                            </button>
                        </div>
                        
                        <div className="col-3">
                            <button
                                className={`btn w-100 border-0 py-3 px-2 text-center ${
                                    activeTab === 'bookings' ? 'text-primary' : 'text-muted'
                                }`}
                                onClick={() => setActiveTab('bookings')}
                            >
                                <div className="mb-1">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M14 2H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2z"/>
                                        <path d="M3 4.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 1.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
                                    </svg>
                                </div>
                                <small className="fw-medium">Bookings</small>
                            </button>
                        </div>
                        
                        <div className="col-3">
                            <button
                                className={`btn w-100 border-0 py-3 px-2 text-center ${
                                    activeTab === 'payment-history' ? 'text-primary' : 'text-muted'
                                }`}
                                onClick={() => setActiveTab('payment-history')}
                            >
                                <div className="mb-1">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zM7 5v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V5h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5z"/>
                                    </svg>
                                </div>
                                <small className="fw-medium">Payments</small>
                            </button>
                        </div>
                        
                        {userType === 'agent' && (
                            <div className="col-3">
                                <button
                                    className={`btn w-100 border-0 py-3 px-2 text-center ${
                                        activeTab === 'bank-details' ? 'text-primary' : 'text-muted'
                                    }`}
                                    onClick={() => setActiveTab('bank-details')}
                                >
                                    <div className="mb-1">
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 10a5 5 0 0 0-5-5V2.5a.5.5 0 0 1 1 0V3a4 4 0 0 1 4 4 .5.5 0 0 0 1 0 4 4 0 0 1 4-4v-.5a.5.5 0 0 1 1 0V5a5 5 0 0 0-5 5zM7 4a4 4 0 0 0-4 4H2.5a.5.5 0 0 1 0-1H3a5 5 0 0 1 5-5V1.5a.5.5 0 0 1 1 0V2a4 4 0 0 1 4 4v.5a.5.5 0 0 1-1 0V6a3 3 0 0 0-3-3V2.5a.5.5 0 0 1-1 0V3z"/>
                                            <path d="M9.5 7.5a.5.5 0 0 1 0 1 3 3 0 0 1-3 3 .5.5 0 0 1 0-1 2 2 0 0 0 2-2 .5.5 0 0 1 .5-.5z"/>
                                            <path d="M8.5 8.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
                                        </svg>
                                    </div>
                                    <small className="fw-medium">Bank</small>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom CSS for enhanced responsiveness */}
            <style jsx>{`
                /* Mobile Responsive Adjustments */
                @media (max-width: 576px) {
                    .container-fluid {
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                    }
                    
                    .main-content {
                        padding-left: 0;
                        padding-right: 0;
                    }
                    
                    .card {
                        border-radius: 0;
                        border-left: none;
                        border-right: none;
                    }
                }
                
                /* Tablet Responsive */
                @media (min-width: 768px) and (max-width: 991.98px) {
                    .main-content {
                        padding-left: 15px;
                        padding-right: 15px;
                    }
                }
                
                /* Desktop adjustments */
                @media (min-width: 1200px) {
                    .main-content {
                        max-width: 1140px;
                    }
                }
                
                /* Smooth transitions */
                .btn {
                    transition: all 0.2s ease-in-out;
                }
                
                .card {
                    transition: box-shadow 0.2s ease-in-out;
                }
                
                .card:hover {
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
                }
                
                /* Fixed bottom navigation styling */
                .fixed-bottom {
                    z-index: 1030;
                }
                
                /* Ensure mobile content doesn't get hidden behind bottom nav */
                @media (max-width: 991.98px) {
                    .main-content {
                        margin-bottom: 80px;
                    }
                }
                
                /* Offcanvas improvements */
                .offcanvas {
                    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
                }
                
                /* Smooth scrolling */
                html {
                    scroll-behavior: smooth;
                }
                
                /* Custom scrollbar for webkit browsers */
                ::-webkit-scrollbar {
                    width: 6px;
                }
                
                ::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 3px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
            `}</style>
        </>
    );
};

export default UserDashboard;