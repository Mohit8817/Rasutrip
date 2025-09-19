// src/components/common/Login.js - Improved with single-click logout
import React, { useContext, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { BsPersonCircle, BsPersonBadge } from "react-icons/bs";
import { AuthContext } from "../Context/AuthContext";
import "../../Style/user.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    userType,
    isLoggedIn,
    logout,
    getUserDisplayName,
    getUserMobile,
    isAgent,
    isCustomer,
  } = useContext(AuthContext);

  const handleSelect = (type) => {
    if (type === "customer") navigate("/login/customer");
    else if (type === "agent") navigate("/login/agent");
  };

  // Improved logout handler with proper cleanup
  const handleLogout = useCallback(async () => {
    try {
      // Call logout function from context
      await logout();

      // Force navigation to home page
      navigate("/", { replace: true });

      // Optional: Force page reload if needed (uncomment if required)
      // window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, navigate to home
      navigate("/", { replace: true });
    }
  }, [logout, navigate]);

  const formatMobileForDisplay = (mobile) => {
    if (!mobile) return "User";
    const cleaned = mobile.replace(/\D/g, "");
    if (cleaned.length >= 10) {
      return `+91 ${cleaned.slice(-10, -5)}***${cleaned.slice(-2)}`;
    }
    return mobile;
  };

  // Get display name with fallback
  const getDisplayName = () => {
    if (!isLoggedIn || !user) return "Login or Signup";

    const displayName = getUserDisplayName();

    // If we have a proper name, use it
    if (displayName && displayName !== "User" && displayName !== "Agent") {
      return displayName;
    }

    // Fallback to formatted mobile
    return formatMobileForDisplay(user.mobile);
  };

  // Get user type display
  const getUserTypeDisplay = () => {
    if (!isLoggedIn || !userType) return "";

    if (isAgent()) return "Agent";
    if (isCustomer()) return "Customer";
    return userType;
  };

  // Enhanced dashboard navigation based on user type
  const handleDashboardNavigation = () => {
    const currentUserIsAgent =
      user &&
      (user.role === "agent" ||
        user.userType === "agent" ||
        user.type === "agent" ||
        userType === "agent");

    if (currentUserIsAgent) {
      // Agent: Navigate to dashboard tab
      navigate("/dashboard?tab=dashboard");
    } else {
      // Regular user: Navigate to profile tab
      navigate("/dashboard?tab=profile");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center login-container">
      <div className="login-dropdown-box">
        <Dropdown>
          <Dropdown.Toggle
            as="div"
            className="user-profile"
            role="button"
            tabIndex="0"
          >
            <div className="user-profile-inner">
              {isLoggedIn && isAgent() ? (
                <BsPersonBadge size={24} />
              ) : (
                <BsPersonCircle size={24} />
              )}
              <p>{getDisplayName()}</p>
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {isLoggedIn ? (
              <>
                <Dropdown.Item onClick={handleDashboardNavigation}>
                  <i className="fas fa-tachometer-alt me-2"></i>
                  Dashboard
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  onClick={handleLogout}
                  className="text-danger"
                  style={{ cursor: "pointer" }}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </Dropdown.Item>
              </>
            ) : (
              <>
                <Dropdown.Item onClick={() => handleSelect("customer")}>
                  Customer Login
                </Dropdown.Item>

                <Dropdown.Divider />

                {/* Agent Login - Hidden on mobile, visible on desktop */}
                <Dropdown.Item
                  onClick={() => handleSelect("agent")}
                  // className="d-none d-md-block"
                >
                  Agent Login
                </Dropdown.Item>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default Login;
