// components/AgentDashboard.js - Agent Dashboard with Real Bus, Hotel & Flight Booking Statistics
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
                            {isReal && (
                                <small className="text-success ms-1" title="Real-time data">●</small>
                            )}
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="text-dark fw-bold mb-0">{title}</h6>
                    {isReal && (
                        <small className="text-muted">Live Data</small>
                    )}
                </div>
                <div className="d-flex justify-content-between align-items-end">
                    <div>
                        <div className="text-muted small">Total Bookings</div>
                        <h4 className="fw-bold mb-0" style={{ color: color }}>
                            {total}
                        </h4>
                    </div>
                    <div className="text-end">
                        <div className="text-muted small">Revenue</div>
                        <div className="fw-bold text-success">
                            ₹{revenue.toLocaleString()}
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );

    const PaymentCard = ({ icon: Icon, title, amount, count, color, isReal = false }) => (
        <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4 text-center">
                <div className="d-flex justify-content-center align-items-center mb-3">
                    <Icon className="w-8 h-8" style={{ color: color }} />
                    {isReal && (
                        <small className="text-success ms-2" title="Real-time data">●</small>
                    )}
                </div>
                <h6 className="text-dark fw-bold mb-2">{title}</h6>
                <h4 className="fw-bold mb-1" style={{ color: color }}>
                    ₹{amount.toLocaleString()}
                </h4>
                <small className="text-muted">
                    {count} transactions
                </small>
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

            {/* Additional Flight Statistics Row */}
            <div className="mb-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center">
                    <Plane className="w-5 h-5 me-2" style={{ color: '#dc2626' }} />
                    Flight Booking Details
                </h6>
                <Row className="g-4">
                    <Col lg={3} md={6}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4 text-center">
                                <h6 className="text-dark fw-bold mb-2">Upcoming Flights</h6>
                                <h4 className="fw-bold mb-1" style={{ color: '#dc2626' }}>
                                    {bookingStats.flightBookings.upcoming}
                                </h4>
                                <small className="text-muted">scheduled</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4 text-center">
                                <h6 className="text-dark fw-bold mb-2">Completed Flights</h6>
                                <h4 className="fw-bold mb-1" style={{ color: '#dc2626' }}>
                                    {bookingStats.flightBookings.completed}
                                </h4>
                                <small className="text-muted">finished</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4 text-center">
                                <h6 className="text-dark fw-bold mb-2">This Month Revenue</h6>
                                <h4 className="fw-bold mb-1" style={{ color: '#dc2626' }}>
                                    ₹{bookingStats.flightBookings.thisMonthRevenue?.toLocaleString() || 0}
                                </h4>
                                <small className="text-muted">current month</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4 text-center">
                                <h6 className="text-dark fw-bold mb-2">Success Rate</h6>
                                <h4 className="fw-bold mb-1" style={{ color: '#dc2626' }}>
                                    {bookingStats.flightBookings.total > 0
                                        ? `${Math.round((bookingStats.flightBookings.completed / bookingStats.flightBookings.total) * 100)}%`
                                        : '0%'
                                    }
                                </h4>
                                <small className="text-muted">completion rate</small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>



            {/* Additional Hotel Statistics Row */}
            <div className="mb-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center">
                    <Building2 className="w-5 h-5 me-2" style={{ color: '#dc2626' }} />
                    Hotel Booking Details
                </h6>
                <Row className="g-4">
                    <Col lg={3} md={6}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4 text-center">
                                <h6 className="text-dark fw-bold mb-2">Upcoming Stays</h6>
                                <h4 className="fw-bold mb-1" style={{ color: '#dc2626' }}>
                                    {bookingStats.hotelBookings.upcoming}
                                </h4>
                                <small className="text-muted">scheduled</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4 text-center">
                                <h6 className="text-dark fw-bold mb-2">Completed Stays</h6>
                                <h4 className="fw-bold mb-1" style={{ color: '#dc2626' }}>
                                    {bookingStats.hotelBookings.completed}
                                </h4>
                                <small className="text-muted">finished</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4 text-center">
                                <h6 className="text-dark fw-bold mb-2">This Month Revenue</h6>
                                <h4 className="fw-bold mb-1" style={{ color: '#dc2626' }}>
                                    ₹{bookingStats.hotelBookings.thisMonthRevenue?.toLocaleString() || 0}
                                </h4>
                                <small className="text-muted">current month</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4 text-center">
                                <h6 className="text-dark fw-bold mb-2">Success Rate</h6>
                                <h4 className="fw-bold mb-1" style={{ color: '#dc2626' }}>
                                    {bookingStats.hotelBookings.total > 0
                                        ? `${Math.round((bookingStats.hotelBookings.completed / bookingStats.hotelBookings.total) * 100)}%`
                                        : '0%'
                                    }
                                </h4>
                                <small className="text-muted">completion rate</small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Additional Bus Statistics Row */}
            <div className="mb-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center">
                    <Bus className="w-5 h-5 me-2" style={{ color: '#dc2626' }} />
                    Bus Booking Details
                </h6>
                <Row className="g-4">
                    <Col lg={3} md={6}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4 text-center">
                                <h6 className="text-dark fw-bold mb-2">Upcoming Trips</h6>
                                <h4 className="fw-bold mb-1" style={{ color: '#dc2626' }}>
                                    {bookingStats.busBookings.upcoming}
                                </h4>
                                <small className="text-muted">scheduled</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4 text-center">
                                <h6 className="text-dark fw-bold mb-2">Completed Trips</h6>
                                <h4 className="fw-bold mb-1" style={{ color: '#dc2626' }}>
                                    {bookingStats.busBookings.completed}
                                </h4>
                                <small className="text-muted">finished</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4 text-center">
                                <h6 className="text-dark fw-bold mb-2">This Month Revenue</h6>
                                <h4 className="fw-bold mb-1" style={{ color: '#dc2626' }}>
                                    ₹{bookingStats.busBookings.thisMonthRevenue?.toLocaleString() || 0}
                                </h4>
                                <small className="text-muted">current month</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4 text-center">
                                <h6 className="text-dark fw-bold mb-2">Success Rate</h6>
                                <h4 className="fw-bold mb-1" style={{ color: '#dc2626' }}>
                                    {bookingStats.busBookings.total > 0
                                        ? `${Math.round((bookingStats.busBookings.completed / bookingStats.busBookings.total) * 100)}%`
                                        : '0%'
                                    }
                                </h4>
                                <small className="text-muted">completion rate</small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Payment History */}
            <div className="mb-4">
                <h5 className="fw-bold mb-3">
                    Payment History
                </h5>
                <Row className="g-4">
                    <Col lg={3} md={6}>
                        <PaymentCard
                            icon={Plane}
                            title="Flight Payments"
                            amount={bookingStats.flightBookings.revenue}
                            count={bookingStats.flightBookings.total}
                            color="#dc2626"
                            isReal={true}
                        />
                    </Col>
                    <Col lg={3} md={6}>
                        <PaymentCard
                            icon={Building2}
                            title="Hotel Payments"
                            amount={bookingStats.hotelBookings.revenue}
                            count={bookingStats.hotelBookings.total}
                            color="#dc2626"
                            isReal={true}
                        />
                    </Col>
                    <Col lg={3} md={6}>
                        <PaymentCard
                            icon={Bus}
                            title="Bus Payments"
                            amount={bookingStats.busBookings.revenue}
                            count={bookingStats.busBookings.total}
                            color="#dc2626"
                            isReal={true}
                        />
                    </Col>
                    <Col lg={3} md={6}>
                        <Card className="border-0 shadow-sm h-100" style={{ backgroundColor: '#ca0d28' }}>
                            <Card.Body className="p-4 text-center text-white">
                                <IndianRupee className="w-8 h-8 mx-auto mb-3" />
                                <h6 className="fw-bold mb-2">Total Earnings</h6>
                                <h4 className="fw-bold mb-1">
                                    ₹{getTotalEarnings().toLocaleString()}
                                </h4>
                                <small className="opacity-75">All time</small>
                            </Card.Body>
                        </Card>
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

            {/* Summary Cards */}
            <div className="mb-4">
                <h5 className="fw-bold mb-3">
                    Monthly Summary
                </h5>
                <Row className="g-4">
                    <Col lg={4} md={6}>
                        <Card className="border-0 shadow-sm h-100" style={{ backgroundColor: '#f0f9ff' }}>
                            <Card.Body className="p-4 text-center">
                                <Calendar className="w-8 h-8 mx-auto mb-3" style={{ color: '#0369a1' }} />
                                <h6 className="text-dark fw-bold mb-2">This Month Bookings</h6>
                                <h4 className="fw-bold mb-1" style={{ color: '#0369a1' }}>
                                    {bookingStats.flightBookings.thisMonth + bookingStats.busBookings.thisMonth + bookingStats.hotelBookings.thisMonth}
                                </h4>
                                <div className="small text-muted">
                                    <div>Flights: {bookingStats.flightBookings.thisMonth}</div>
                                    <div>Hotels: {bookingStats.hotelBookings.thisMonth}</div>
                                    <div>Bus: {bookingStats.busBookings.thisMonth}</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4} md={6}>
                        <Card className="border-0 shadow-sm h-100" style={{ backgroundColor: '#f0fdf4' }}>
                            <Card.Body className="p-4 text-center">
                                <IndianRupee className="w-8 h-8 mx-auto mb-3" style={{ color: '#15803d' }} />
                                <h6 className="text-dark fw-bold mb-2">This Month Revenue</h6>
                                <h4 className="fw-bold mb-1" style={{ color: '#15803d' }}>
                                    ₹{(bookingStats.flightBookings.thisMonthRevenue + bookingStats.busBookings.thisMonthRevenue + bookingStats.hotelBookings.thisMonthRevenue).toLocaleString()}
                                </h4>
                                <div className="small text-muted">
                                    <div>Flights: ₹{bookingStats.flightBookings.thisMonthRevenue?.toLocaleString() || 0}</div>
                                    <div>Hotels: ₹{bookingStats.hotelBookings.thisMonthRevenue?.toLocaleString() || 0}</div>
                                    <div>Bus: ₹{bookingStats.busBookings.thisMonthRevenue?.toLocaleString() || 0}</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4} md={6}>
                        <Card className="border-0 shadow-sm h-100" style={{ backgroundColor: '#fefce8' }}>
                            <Card.Body className="p-4 text-center">
                                <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: '#ca8a04' }} />
                                <h6 className="text-dark fw-bold mb-2">Upcoming Services</h6>
                                <h4 className="fw-bold mb-1" style={{ color: '#ca8a04' }}>
                                    {bookingStats.flightBookings.upcoming + bookingStats.busBookings.upcoming + bookingStats.hotelBookings.upcoming}
                                </h4>
                                <div className="small text-muted">
                                    <div>Flights: {bookingStats.flightBookings.upcoming}</div>
                                    <div>Hotels: {bookingStats.hotelBookings.upcoming}</div>
                                    <div>Bus: {bookingStats.busBookings.upcoming}</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default AgentDashboard;