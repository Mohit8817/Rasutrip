// components/AgentDashboard.js - Agent Dashboard with Only Booking History Cards
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../Context/AuthContext';
import { Row, Col, Card, Alert } from 'react-bootstrap';
import { Plane, Building2, Bus, IndianRupee, TrendingUp, Calendar, Clock, Users, Wallet, BarChart3, Star, RefreshCw } from 'lucide-react';
import useAgentBookingStats from './useAgentBookingStats';

const AgentDashboard = () => {
    const { user } = useContext(AuthContext);
    const { bookingStats, error: statsError, refreshStats, lastUpdated } = useAgentBookingStats();

    const [error, setError] = useState(null);

    // Update payment history when booking stats change
    const getTotalEarnings = () => {
        return bookingStats.flightBookings.revenue + bookingStats.busBookings.revenue + bookingStats.hotelBookings.revenue;
    };

    const BookingCard = ({ icon: Icon, title, total, thisMonth, revenue, color, bgColor, isReal = false }) => (
        <Card className="border-0 shadow-sm h-100" style={{ borderLeft: `4px solid ${color}` }}>
            <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className={`p-3 rounded-circle`} style={{ backgroundColor: bgColor }}>
                        <Icon className="w-6 h-6" style={{ color: color }} />
                    </div>
                    <div className="text-end">
                        <small className="text-muted">This Month</small>
                        <div className="fw-bold d-flex align-items-center" style={{ color: color }}>
                            +{thisMonth}
                           
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="text-dark fw-bold mb-0">{title}</h6>
                    
                </div>
                <div className="d-flex justify-content-between align-items-end">
                    <div>
                        <div className="text-muted small">Total Bookings</div>
                        <h4 className="fw-bold mb-0" style={{ color: color }}>
                            {total}
                        </h4>
                    </div>
                    <div className="text-end">
                        <div className="text-muted small">Total Amount</div>
                        <div className="fw-bold text-success">
                            ₹{revenue.toLocaleString()}
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );

    const StatCard = ({ icon: Icon, title, value, subtitle, color, bgColor }) => (
        <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
                <div className="d-flex align-items-center">
                    <div className={`p-3 rounded-circle me-3`} style={{ backgroundColor: bgColor }}>
                        <Icon className="w-5 h-5" style={{ color: color }} />
                    </div>
                    <div>
                        <div className="text-muted small">{title}</div>
                        <h4 className="fw-bold mb-0" style={{ color: color }}>
                            {value}
                        </h4>
                        {subtitle && <small className="text-muted">{subtitle}</small>}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );

    if (!user) {
        return (
            <Alert variant="warning">
                Please login to access the dashboard.
            </Alert>
        );
    }

    const isAgent = user.role === 'agent' || user.userType === 'agent' || user.type === 'agent';

    if (!isAgent) {
        return (
            <Alert variant="info">
                Dashboard access is limited to agents only.
            </Alert>
        );
    }

    if (error || statsError) {
        return (
            <Alert variant="danger">
                {error || statsError}
                <button
                    className="btn btn-sm btn-outline-danger ms-2"
                    onClick={() => {
                        setError(null);
                        refreshStats();
                    }}
                >
                    Try Again
                </button>
            </Alert>
        );
    }

    return (
        <div className="dashboard-container" style={{ backgroundColor: '#f8f9fa' }}>
            {/* Header */}
            <div className="mb-4">
                <Row className="align-items-center">
                    <Col>
                        <h3 className="fw-bold mb-1">
                            Agent Dashboard
                        </h3>
                        <p className="text-muted mb-0">
                            Welcome back, {user?.name || 'Agent'}! Here's your booking overview.
                        </p>
                    </Col>
                </Row>
            </div>

            {/* Booking History Cards */}
            <div className="mb-4">
                <h5 className="fw-bold mb-3">
                    Booking History
                </h5>
                <Row className="g-4">
                    <Col lg={4} md={6}>
                        <BookingCard
                            icon={Plane}
                            title="Flight Bookings"
                            total={bookingStats.flightBookings.total}
                            thisMonth={bookingStats.flightBookings.thisMonth}
                            revenue={bookingStats.flightBookings.revenue}
                            color="#dc2626"
                            bgColor="#fef2f2"
                            isReal={true}
                        />
                    </Col>
                    <Col lg={4} md={6}>
                        <BookingCard
                            icon={Building2}
                            title="Hotel Bookings"
                            total={bookingStats.hotelBookings.total}
                            thisMonth={bookingStats.hotelBookings.thisMonth}
                            revenue={bookingStats.hotelBookings.revenue}
                            color="#dc2626"
                            bgColor="#fef2f2"
                            isReal={true}
                        />
                    </Col>
                    <Col lg={4} md={6}>
                        <BookingCard
                            icon={Bus}
                            title="Bus Bookings"
                            total={bookingStats.busBookings.total}
                            thisMonth={bookingStats.busBookings.thisMonth}
                            revenue={bookingStats.busBookings.revenue}
                            color="#dc2626"
                            bgColor="#fef2f2"
                            isReal={true}
                        />
                    </Col>
                </Row>
            </div>

            {/* Agent Performance Stats */}
            <div className="mb-4">
                <h5 className="fw-bold mb-3">
                    Performance Overview
                </h5>
                <Row className="g-4">
                    <Col lg={3} md={6}>
                        <StatCard
                            icon={IndianRupee}
                            title="Total Commission"
                            value={`₹${Math.round(getTotalEarnings() * 0.05).toLocaleString()}`}
                            subtitle="5% of total revenue"
                            color="#dc2626"
                            bgColor="#fef2f2"
                        />
                    </Col>
                    <Col lg={3} md={6}>
                        <StatCard
                            icon={TrendingUp}
                            title="Overall Success Rate"
                            value={`${bookingStats.flightBookings.total + bookingStats.busBookings.total + bookingStats.hotelBookings.total > 0
                                ? Math.round(((bookingStats.flightBookings.completed + bookingStats.busBookings.completed + bookingStats.hotelBookings.completed) /
                                    (bookingStats.flightBookings.total + bookingStats.busBookings.total + bookingStats.hotelBookings.total)) * 100)
                                : 0}%`}
                            subtitle="all services"
                            color="#dc2626"
                            bgColor="#fef2f2"
                        />
                    </Col>
                    <Col lg={3} md={6}>
                        <StatCard
                            icon={Star}
                            title="Customer Rating"
                            value="4.8/5"
                            subtitle="average rating"
                            color="#dc2626"
                            bgColor="#fef2f2"
                        />
                    </Col>
                    <Col lg={3} md={6}>
                        <StatCard
                            icon={Users}
                            title="Total Bookings"
                            value={bookingStats.flightBookings.total + bookingStats.busBookings.total + bookingStats.hotelBookings.total}
                            subtitle="all services"
                            color="#dc2626"
                            bgColor="#fef2f2"
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default AgentDashboard;