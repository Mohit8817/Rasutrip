// components/AgentDashboard.js - Dashboard component for agents
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../Context/AuthContext';
import { Row, Col, Card, Alert } from 'react-bootstrap';
import {
    Calendar,
    Users,
    IndianRupee,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

const AgentDashboard = () => {
    const { user, getUserFullName, getTimeBasedGreeting } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState({
        totalBookings: 0,
        completedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        totalEarnings: 0,
        monthlyEarnings: 0,
        todayBookings: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Replace with your actual API endpoints
                const [dashboardResponse, activitiesResponse] = await Promise.all([
                    fetch(`/api/agent/dashboard/${user.id}`),
                    fetch(`/api/agent/activities/${user.id}`)
                ]);

                if (!dashboardResponse.ok || !activitiesResponse.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }

                const dashboardResult = await dashboardResponse.json();
                const activitiesResult = await activitiesResponse.json();

                setDashboardData(dashboardResult);
                setRecentActivities(activitiesResult);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchDashboardData();
        }
    }, [user?.id]);

    const StatCard = ({ icon: Icon, title, value, color, bgColor, trend }) => (
        <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <p className="text-muted small mb-1 fw-medium">{title}</p>
                        <h3 className={`mb-0 fw-bold ${color}`}>
                            {loading ? (
                                <div className="placeholder-glow">
                                    <span className="placeholder col-6"></span>
                                </div>
                            ) : (
                                value
                            )}
                        </h3>
                        {trend && !loading && (
                            <small className="text-success">
                                <TrendingUp className="w-3 h-3 me-1" />
                                {trend}
                            </small>
                        )}
                    </div>
                    <div className={`p-3 rounded-circle ${bgColor}`}>
                        <Icon className={`w-6 h-6 ${color}`} />
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

    // Check if user is agent
    const isAgent = user.role === 'agent' || user.userType === 'agent' || user.type === 'agent';

    if (!isAgent) {
        return (
            <Alert variant="info">
                Dashboard access is limited to agents only.
            </Alert>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                {error}
            </Alert>
        );
    }

    // Calculate dynamic values
    const successRate = dashboardData.totalBookings > 0
        ? Math.round((dashboardData.completedBookings / dashboardData.totalBookings) * 100)
        : 0;

    const avgDailyEarning = dashboardData.monthlyEarnings > 0
        ? Math.round(dashboardData.monthlyEarnings / 30)
        : 0;

    return (
        <div className="dashboard-container">
            {/* Welcome Header */}
            <div className="mb-4">
                <Row className="align-items-center">
                    <Col>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                          Welcome To the Dashboard
                        </h2>
                    </Col>
                </Row>
            </div>

            {/* Stats Cards */}
            <Row className="g-4 mb-4">
                <Col lg={3} md={6}>
                    <StatCard
                        icon={Calendar}
                        title="Total Bookings"
                        value={dashboardData.totalBookings}
                        color="text-primary"
                        bgColor="bg-primary bg-opacity-10"
                        trend={dashboardData.bookingTrend}
                    />
                </Col>
                <Col lg={3} md={6}>
                    <StatCard
                        icon={CheckCircle}
                        title="Completed"
                        value={dashboardData.completedBookings}
                        color="text-success"
                        bgColor="bg-success bg-opacity-10"
                    />
                </Col>
                <Col lg={3} md={6}>
                    <StatCard
                        icon={AlertCircle}
                        title="Pending"
                        value={dashboardData.pendingBookings}
                        color="text-warning"
                        bgColor="bg-warning bg-opacity-10"
                    />
                </Col>
                <Col lg={3} md={6}>
                    <StatCard
                        icon={IndianRupee}
                        title="Monthly Earnings"
                        value={`₹${dashboardData.monthlyEarnings?.toLocaleString() || '0'}`}
                        color="text-success"
                        bgColor="bg-success bg-opacity-10"
                        trend={dashboardData.earningTrend}
                    />
                </Col>
            </Row>

            {/* Today's Overview */}
            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-transparent border-0 pb-0">
                            <h5 className="mb-0 fw-bold">Today's Overview</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-4">
                                <Col md={4}>
                                    <div className="text-center p-3 bg-light rounded">
                                        <h4 className="text-primary fw-bold mb-1">
                                            {loading ? '...' : dashboardData.todayBookings}
                                        </h4>
                                        <small className="text-muted">Today's Bookings</small>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="text-center p-3 bg-light rounded">
                                        <h4 className="text-success fw-bold mb-1">
                                            {loading ? '...' : `${successRate}%`}
                                        </h4>
                                        <small className="text-muted">Success Rate</small>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="text-center p-3 bg-light rounded">
                                        <h4 className="text-info fw-bold mb-1">
                                            ₹{loading ? '...' : avgDailyEarning.toLocaleString()}
                                        </h4>
                                        <small className="text-muted">Avg. Daily Earning</small>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-transparent border-0 pb-0">
                            <h5 className="mb-0 fw-bold">Quick Actions</h5>
                        </Card.Header>
                        <Card.Body className="p-2">
                            <div className="d-grid gap-2">
                                <button className="btn btn-outline-primary btn-sm text-start">
                                    <Calendar className="w-4 h-4 me-2" />
                                    View Today's Bookings
                                </button>
                                <button className="btn btn-outline-success btn-sm text-start">
                                    <IndianRupee className="w-4 h-4 me-2" />
                                    Check Payments
                                </button>
                                <button className="btn btn-outline-info btn-sm text-start">
                                    <Users className="w-4 h-4 me-2" />
                                    Manage Customers
                                </button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Recent Activity */}
            <Row>
                <Col>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-transparent border-0 pb-0">
                            <h5 className="mb-0 fw-bold">Recent Activity</h5>
                        </Card.Header>
                        <Card.Body>
                            {loading ? (
                                <div className="placeholder-glow">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="d-flex align-items-center mb-3">
                                            <div className="placeholder rounded-circle me-3" style={{ width: '40px', height: '40px' }}></div>
                                            <div className="flex-grow-1">
                                                <div className="placeholder col-6 mb-1"></div>
                                                <div className="placeholder col-4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : recentActivities.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {recentActivities.map((activity, index) => (
                                        <div key={index} className="list-group-item border-0 px-0">
                                            <div className="d-flex align-items-center">
                                                <div className={`w-2 h-2 rounded-circle me-3 ${activity.type === 'booking' ? 'bg-success' :
                                                        activity.type === 'payment' ? 'bg-primary' :
                                                            activity.type === 'reschedule' ? 'bg-warning' :
                                                                'bg-secondary'
                                                    }`}></div>
                                                <div className="flex-grow-1">
                                                    <div className="fw-medium">{activity.title}</div>
                                                    <small className="text-muted">
                                                        {activity.description} • {activity.timeAgo}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="mb-0">No recent activities found</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AgentDashboard;