import React, { useState, useEffect } from "react";
import { Container, Row, Col, Offcanvas } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Profile from "../components/Profile";
import BookingTabs from "../components/BookingtTabs";
import FlightBookingComponent from "../components/FlightBookingComponent";
import BusBookingHistory from "../components/BusBookingHistory";
import HotelBookingComponent from "../components/HotelBookingComponent";
import PaymentHistory from "../components/PaymentHistory";
import BankDetails from "../components/BankDetails";
import AgentDashboard from "../components/AgentDashboard";
import AgentWalletHistory from "../components/Agentwallethistory";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = {
    name: " ",
    mobile: " ",
    email: "",
    createdAt: " ",
    role: "agent", // Set this based on actual user data
  };

  const userType = "agent"; // This should come from your auth context

  // Check if user is agent
  const isAgent =
    user.role === "agent" ||
    user.userType === "agent" ||
    user.type === "agent" ||
    userType === "agent";

  // Function to determine initial tab based on user type and URL params
  const getInitialTab = () => {
    // Check if there's a specific tab requested in URL params
    const urlParams = new URLSearchParams(location.search);
    const requestedTab = urlParams.get("tab");

    if (requestedTab) {
      // Validate that the requested tab is allowed for this user type
      if (requestedTab === "dashboard" && !isAgent) {
        return "profile"; // Redirect non-agents away from dashboard
      }
      if (
        ["wallet-history", "bank-details"].includes(requestedTab) &&
        !isAgent
      ) {
        return "profile"; // Redirect non-agents away from agent-only tabs
      }
      return requestedTab;
    }

    // Default tab selection based on user type
    return isAgent ? "dashboard" : "profile";
  };

  // Set initial tab based on user type
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [activeBookingTab, setActiveBookingTab] = useState("Flight");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Update URL when tab changes (optional - for better UX)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const currentTab = urlParams.get("tab");

    if (currentTab !== activeTab) {
      // Update URL without causing a page reload
      const newUrl = `${location.pathname}?tab=${activeTab}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [activeTab, location.pathname, location.search]);

  // Enhanced tab change handler with validation
  const handleTabChange = (newTab) => {
    // Validate tab access based on user type
    if (
      !isAgent &&
      ["dashboard", "wallet-history", "bank-details"].includes(newTab)
    ) {
      console.warn(`Access denied: ${newTab} is only available for agents`);
      return;
    }

    setActiveTab(newTab);
    setShowMobileSidebar(false); // Close mobile sidebar after selection
  };

  const handleLogout = () => {
    console.log("Logging out...");
    // Add your actual logout logic here
    alert("Logout functionality would be implemented here");
    navigate("/"); // Redirect to home after logout
  };

  const renderBookingContent = () => {
    switch (activeBookingTab) {
      case "Flight":
        return <FlightBookingComponent />;
      case "Bus":
        return <BusBookingHistory />;
      case "Hotel":
        return <HotelBookingComponent />;
      default:
        return <FlightBookingComponent />;
    }
  };
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        // Only render dashboard for agents
        if (isAgent) {
          return <AgentDashboard />;
        } else {
          return (
            <div className="alert alert-warning">
              <h5>Access Denied</h5>
              <p>
                Dashboard is only available for agents. Redirecting to
                profile...
              </p>
            </div>
          );
        }
      case "profile":
        return <Profile user={user} userType={userType} />;
      case "bookings":
        return (
          <div>
            <BookingTabs
              activeBookingTab={activeBookingTab}
              setActiveBookingTab={setActiveBookingTab}
            />
            <div className="mt-4">{renderBookingContent()}</div>
          </div>
        );
      case "payment-history":
        return <PaymentHistory />;
      case "wallet-history":
        // Only render wallet history for agents
        if (isAgent) {
          return <AgentWalletHistory />;
        } else {
          return (
            <div className="alert alert-warning">
              <h5>Access Denied</h5>
              <p>Wallet History is only available for agents.</p>
            </div>
          );
        }
      case "bank-details":
        // Only render if user is an agent
        if (isAgent) {
          return <BankDetails />;
        } else {
          return (
            <div className="alert alert-warning">
              <h5>Access Denied</h5>
              <p>Bank Details are only available for agents.</p>
            </div>
          );
        }
      default:
        return <Profile user={user} userType={userType} />;
    }
  };

  // Get page title for mobile header
  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard";
      case "profile":
        return "Profile";
      case "bookings":
        return "My Bookings";
      case "payment-history":
        return "Payment History";
      case "wallet-history":
        return "Wallet History";
      case "bank-details":
        return "Bank Details";
      default:
        return isAgent ? "Dashboard" : "Profile";
    }
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="d-block d-lg-none bg-white shadow-sm border-bottom ">
        <div className="p-3 d-flex align-items-center">
          {/* Menu Toggle Button */}
          <button
            className="btn me-3 d-flex align-items-center justify-content-center border-2 border-black text-black"
            style={{ width: "40px", height: "40px" }}
            onClick={() => setShowMobileSidebar(true)}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path
                fillRule="evenodd"
                d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
              />
            </svg>
          </button>

          {/* Mobile Header Title */}
          <div className="flex-grow-1">
            <h5 className="mb-0 fw-bold text-dark">{getPageTitle()}</h5>
          </div>

          {/* User Avatar */}
        </div>
      </div>

      {/* Mobile Offcanvas Sidebar */}
      <Offcanvas
        show={showMobileSidebar}
        onHide={() => setShowMobileSidebar(false)}
        placement="start"
        className="d-block d-lg-none"
        style={{ width: "280px" }}
      >
        <Offcanvas.Body className="p-0">
          <Sidebar
            user={user}
            userType={userType}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
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
              <div className="sticky-top" style={{ top: "20px" }}>
                <Sidebar
                  user={user}
                  userType={userType}
                  activeTab={activeTab}
                  setActiveTab={handleTabChange}
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
                  //   minHeight: "100vh",
                  paddingTop: "0",
                  //   paddingBottom: "10px", // Extra bottom padding for mobile
                }}
              >
                {renderContent()}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Mobile Bottom Navigation - Enhanced for agent dashboard */}
      {/* <div className="d-block d-lg-none fixed-bottom bg-white border-top shadow-lg">
        <div className="container-fluid">
          <div className="row g-0">
            {isAgent && (
              <div className="col-2">
                <button
                  className={`btn w-100 border-0 py-2 px-1 text-center ${
                    activeTab === "dashboard" ? "text-primary" : "text-muted"
                  }`}
                  onClick={() => handleTabChange("dashboard")}
                >
                  <div className="mb-1">
                    <svg
                      width="18"
                      height="18"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M6 1v3a2 2 0 0 1 2 2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3V3a2 2 0 0 0-2-2H6z" />
                    </svg>
                  </div>
                  <small className="fw-medium" style={{ fontSize: "10px" }}>
                    Dashboard
                  </small>
                </button>
              </div>
            )}

            <div className={`col-${isAgent ? "2" : "3"}`}>
              <button
                className={`btn w-100 border-0 py-2 px-1 text-center ${
                  activeTab === "profile" ? "text-primary" : "text-muted"
                }`}
                onClick={() => handleTabChange("profile")}
              >
                <div className="mb-1">
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47z" />
                  </svg>
                </div>
                <small className="fw-medium" style={{ fontSize: "10px" }}>
                  Profile
                </small>
              </button>
            </div>

            <div className={`col-${isAgent ? "2" : "3"}`}>
              <button
                className={`btn w-100 border-0 py-2 px-1 text-center ${
                  activeTab === "bookings" ? "text-primary" : "text-muted"
                }`}
                onClick={() => handleTabChange("bookings")}
              >
                <div className="mb-1">
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M14 2H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
                  </svg>
                </div>
                <small className="fw-medium" style={{ fontSize: "10px" }}>
                  Bookings
                </small>
              </button>
            </div>

            <div className={`col-${isAgent ? "2" : "3"}`}>
              <button
                className={`btn w-100 border-0 py-2 px-1 text-center ${
                  activeTab === "payment-history"
                    ? "text-primary"
                    : "text-muted"
                }`}
                onClick={() => handleTabChange("payment-history")}
              >
                <div className="mb-1">
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1z" />
                  </svg>
                </div>
                <small className="fw-medium" style={{ fontSize: "10px" }}>
                  Payments
                </small>
              </button>
            </div>

            {isAgent && (
              <div className="col-2">
                <button
                  className={`btn w-100 border-0 py-2 px-1 text-center ${
                    activeTab === "wallet-history"
                      ? "text-primary"
                      : "text-muted"
                  }`}
                  onClick={() => handleTabChange("wallet-history")}
                >
                  <div className="mb-1">
                    <svg
                      width="18"
                      height="18"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M1 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3z" />
                      <path d="M13 7.5a.5.5 0 0 0 .5-.5V5.5a.5.5 0 0 0-.5-.5h-1.5V7.5H13z" />
                    </svg>
                  </div>
                  <small className="fw-medium" style={{ fontSize: "10px" }}>
                    Wallet
                  </small>
                </button>
              </div>
            )}

            {isAgent && (
              <div className="col-2">
                <button
                  className={`btn w-100 border-0 py-2 px-1 text-center ${
                    activeTab === "bank-details" ? "text-primary" : "text-muted"
                  }`}
                  onClick={() => handleTabChange("bank-details")}
                >
                  <div className="mb-1">
                    <svg
                      width="18"
                      height="18"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 10a5 5 0 0 0-5-5V2.5a.5.5 0 0 1 1 0V3a4 4 0 0 1 4 4z" />
                    </svg>
                  </div>
                  <small className="fw-medium" style={{ fontSize: "10px" }}>
                    Bank
                  </small>
                </button>
              </div>
            )}
          </div>
        </div>
      </div> */}

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

        /* Mobile bottom nav improvements */
        @media (max-width: 991.98px) {
          .fixed-bottom .btn {
            font-size: 10px;
            padding: 8px 4px;
          }

          .main-content {
            margin-bottom: 80px;
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
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </>
  );
};

export default Dashboard;
