// components/AgentDashboard.js - Agent Dashboard with Only Booking History Cards
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../Context/AuthContext";
import { Row, Col, Card, Alert } from "react-bootstrap";
import {
  Plane,
  Building2,
  Bus,
  IndianRupee,
  TrendingUp,
  Calendar,
  Clock,
  Users,
  Wallet,
  BarChart3,
  Star,
  RefreshCw,
} from "lucide-react";
import useAgentBookingStats from "./useAgentBookingStats";

const AgentDashboard = () => {
  const { user } = useContext(AuthContext);
  const {
    bookingStats,
    error: statsError,
    refreshStats,
    lastUpdated,
  } = useAgentBookingStats();

  const [error, setError] = useState(null);

  // Update payment history when booking stats change
  const getTotalEarnings = () => {
    return (
      bookingStats.flightBookings.revenue +
      bookingStats.busBookings.revenue +
      bookingStats.hotelBookings.revenue
    );
  };

  const BookingCard = ({
    icon: Icon,
    title,
    total,
    // thisMonth,
    revenue,
    color,
    bgColor,
    isReal = false,
  }) => (
    <Card className="shadow-md rounded-lg border-0">
      <Card.Body className="flex items-center justify-between p-4">
        {/* Left side: Number + Title */}
        <div>
          <h4 className="font-bold mb-1" style={{ color: color }}>
            {total}
          </h4>
          <p className="text-sm font-medium text-black">{title}</p>
        </div>

        {/* Right side: Icon */}
        <div>
          <Icon className="w-10 h-10" style={{ color: color }} />
        </div>
      </Card.Body>
    </Card>
  );

  const StatCard = ({ icon: Icon, title, value, subtitle, color, bgColor }) => (
    <div className="shadow-md rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between">
      {/* Left side: Text (Value + Title) */}
      <div className="flex flex-col">
        <h4 className="text-xl font-bold" style={{ color: color }}>
          {value}
        </h4>
        <p className="text-sm font-medium text-black">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      {/* Right side: Icon */}
      <div
        className="p-3 rounded-full flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <Icon className="w-6 h-6" style={{ color: color }} />
      </div>
    </div>
  );

  if (!user) {
    return (
      <Alert variant="warning">Please login to access the dashboard.</Alert>
    );
  }

  const isAgent =
    user.role === "agent" || user.userType === "agent" || user.type === "agent";

  if (!isAgent) {
    return (
      <Alert variant="info">Dashboard access is limited to agents only.</Alert>
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
    <div className="dashboard-container">
      {/* Header */}

      <div className="">
        <Row className="align-items-center">
          <Col>
            <div className="bg-white shadow-xl text-black p-3 rounded  d-flex justify-content-between align-items-center mt-1">
              {/* <h3 className="fw-bold mb-0 italic">Welcome to Dashboard</h3> */}
              <h3 className="text-2xl md:text-3xl font-bold italic tracking-wide text-gray-800 drop-shadow-sm ">
                Welcome to <span className="text-indigo-600">Dashboard</span>
              </h3>
            </div>
          </Col>
        </Row>
      </div>

      {/* Booking History Cards */}
      <div>
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
        <Row className="g-4 ">
          <Col lg={3} md={6}>
            <StatCard
              icon={IndianRupee}
              title="Total Income"
              value={`₹${Math.round(
                getTotalEarnings() * 0.05
              ).toLocaleString()}`}
              color="#dc2626"
              bgColor="#fef2f2"
            />
          </Col>
          <Col lg={3} md={6}>
            <StatCard
              icon={Star}
              title="Rating"
              value="4.8/5"
              //   subtitle="average rating"
              color="#dc2626"
              bgColor="#fef2f2"
            />
          </Col>
          <Col lg={3} md={6}>
            <StatCard
              icon={Users}
              title="Total Bookings"
              value={
                bookingStats.flightBookings.total +
                bookingStats.busBookings.total +
                bookingStats.hotelBookings.total
              }
              //   subtitle="all services"
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
