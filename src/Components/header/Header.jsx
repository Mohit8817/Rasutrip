import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import Dropdown from "react-bootstrap/Dropdown";
import Modal from "react-bootstrap/Modal";
import { useNavigate, useLocation } from "react-router-dom";
import "../../Style/header.css";
import logo from "../../assest/rasutrip.png";
import Login from "../Login/Login";
import EnquiryForm from "../EnquiryForm/EnquiryForm";
import icon1 from "../../assest/footericon2.svg";
// import homeoffer from "../../assest/homeoffer.png";
import promoBanner from "../../assest/promoimg.png"; 

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to close offcanvas
  const closeOffcanvas = () => {
    setShowOffcanvas(false);
  };

  const handleBookingClick = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login/customer");
    } else {
      navigate("/dashboard?tab=bookings");
    }
  };

  // Function to handle enquiry click
  const handleEnquiryClick = () => {
    setShowEnquiry(true);
    closeOffcanvas();
  };

  // Function to handle tab navigation
  const handleTabNavigation = (tabType) => {
    // If already on home page, just scroll to slider and set tab
    if (location.pathname === "/") {
      // Scroll to slider section
      const sliderElement = document.querySelector(".slider-container");
      if (sliderElement) {
        sliderElement.scrollIntoView({ behavior: "smooth" });
      }

      // Set active tab using custom event
      const event = new CustomEvent("setActiveTab", {
        detail: { tabType },
      });
      window.dispatchEvent(event);
    } else {
      // Navigate to home page with tab parameter
      navigate(`/?tab=${tabType}`);
    }
    closeOffcanvas();
  };

  return (
    <>
      {/* <img  
  src={homeoffer} 
  alt="offer" 
  className="w-100" 
  style={{ height: "100px", objectFit: "cover" }} 
/> */}

      <div className="promo-banner-container">
        <img
          src={promoBanner}
          alt="Grand Travel Fest: Up to 15% Off on Flights & Hotels"
          className="promo-banner-image"
          style={{
            width: "100%",
            height: "auto",
            minHeight: "80px",
            maxHeight: "120px",
            objectFit: "cover",
            display: "block"
          }}
        />
      </div>


      {/* Desktop Header - Hidden on mobile */}
      <Navbar expand="lg" className="header_navbar d-none d-lg-block">
        <Container fluid>
          {/* Logo */}
          <Navbar.Brand href="/" className="brand-container">
            <img src={logo} alt="RasuTrip Logo" className="Header_logo" />
          </Navbar.Brand>

          {/* Desktop Navigation */}
          <Nav className="header-nav mx-auto t">
            <Nav.Link href="/" className="nav-item-link">
              Home
            </Nav.Link>

            <Nav.Link
              as="span"
              onClick={() => handleTabNavigation("flight")}
              className="nav-item-link"
              style={{ cursor: "pointer" }}
            >
              Flight
            </Nav.Link>

            <Nav.Link
              as="span"
              onClick={() => handleTabNavigation("hotel")}
              className="nav-item-link"
              style={{ cursor: "pointer" }}
            >
              Hotel
            </Nav.Link>

            <Nav.Link
              as="span"
              onClick={() => handleTabNavigation("bus")}
              className="nav-item-link"
              style={{ cursor: "pointer" }}
            >
              Bus
            </Nav.Link>
            {/* vcxd
            cxc
            cx */}
            <Nav.Link
              as="span"
              onClick={() => navigate("/offers")}
              className="nav-item-link"
              style={{ cursor: "pointer" }}
            >
              Offers
            </Nav.Link>

            <Nav.Link
              href="https://test.rasutrip.com/"
              className="nav-item-link"
            >
              Rider
            </Nav.Link>

            {/* Driver Dropdown */}
            <Dropdown as={Nav.Item} className="nav-dropdown">
              <Dropdown.Toggle as={Nav.Link} className="nav-item-link">
                Driver
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="https://test.rasutrip.com/driverpage">
                  Apply Drive
                </Dropdown.Item>
                <Dropdown.Item href="https://test.rasutrip.com/howdriving">
                  How it Works
                </Dropdown.Item>
                <Dropdown.Item href="https://test.rasutrip.com/driverrequirements">
                  Driver Requirement
                </Dropdown.Item>
                <Dropdown.Item href="https://test.rasutrip.com/safety">
                  Safety
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Nav.Link
              href="https://test.rasutrip.com/serviceareas"
              className="nav-item-link"
            >
              Service Areas
            </Nav.Link>

            <Nav.Link href="/Blogs" className="nav-item-link">
              Blogs
            </Nav.Link>

            <Nav.Link
              as="span"
              onClick={() => setShowEnquiry(true)}
              className="nav-item-link"
              style={{ cursor: "pointer" }}
            >
              Enquiry
            </Nav.Link>

            <Nav.Link
              href="https://www.rasutechnologies.com/"
              className="nav-item-link"
            >
              RasuTech
            </Nav.Link>
          </Nav>

          {/* Desktop Right Side */}
          <div className="header-right gap-3 d-flex align-items-center">
            <a
              href="https://play.google.com/store/apps/details?id=com.om.rasutrip&pcampaignid=web_share"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={icon1}
                alt="Get it on Google Play"
                className="w-30 float-right"
              />
            </a>
            <Login />
          </div>
        </Container>
      </Navbar>

      {/* Mobile Header - Only logo and menu button */}
      <Navbar className="mobile-header d-lg-none ">
        {/* {/* <Navbar className="mobile-header d-lg-none sticky-top"> */}
        <Container fluid>
          <Navbar.Brand href="/" className="brand-container ">
            <img src={logo} alt="RasuTrip Logo" className="Header_logo" />
          </Navbar.Brand>

          <div className="d-flex align-items-center gap-3">
            <Login />
            <Navbar.Toggle
              aria-controls="offcanvasNavbar"
              onClick={() => setShowOffcanvas(true)}
              className="mobile-menu-btn"
            />
          </div>
        </Container>
      </Navbar>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav d-lg-none">
        <div className="bottom-nav-container">
          <div className="bottom-nav-item">
            <a href="/" className="bottom-nav-link">
              <i className="fas fa-home"></i>
              <span>Home</span>
            </a>
          </div>

          <div className="bottom-nav-item">
            <span
              className="bottom-nav-link"
              // onClick={() => handleTabNavigation("flight")}
              onClick={handleBookingClick}
              style={{ cursor: "pointer" }}
            >
              {/* <i className="fas fa-plane"></i> */}
              <i class="fa-solid fa-book"></i>
              <span>Booking</span>
            </span>
          </div>

          <div className="bottom-nav-item">
            <span
              className="bottom-nav-link"
              onClick={() => handleTabNavigation("hotel")}
              style={{ cursor: "pointer" }}
            >
              <i className="fas fa-bed"></i>
              <span>Hotels</span>
            </span>
          </div>

          <div className="bottom-nav-item">
            <span
              className="bottom-nav-link"
              onClick={() => handleTabNavigation("bus")}
              style={{ cursor: "pointer" }}
            >
              <i className="fas fa-bus"></i>
              <span>Bus</span>
            </span>
          </div>

          <div className="bottom-nav-item">
            <span
              className="bottom-nav-link"
              onClick={() => setShowOffcanvas(true)}
              style={{ cursor: "pointer" }}
            >
              <i className="fas fa-bars"></i>
              <span>More</span>
            </span>
          </div>
        </div>
      </div>

      {/* Offcanvas Menu for Mobile */}
      <Navbar.Offcanvas
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
        placement="end"
        show={showOffcanvas}
        onHide={closeOffcanvas}
        className="mobile-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="offcanvasNavbarLabel">
            <img src={logo} alt="Logo" style={{ width: "70px" }} />
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="mobile-nav">
            {/* Travel Services */}
            <div className="mobile-nav-section">
              <h6 className="mobile-nav-title">Travel Services</h6>
              <Nav.Link
                as="span"
                onClick={() => handleTabNavigation("flight")}
                className="mobile-nav-link"
                style={{ cursor: "pointer" }}
              >
                {/* <i className="fas fa-plane"></i> */}
                Flight
              </Nav.Link>
              <Nav.Link
                as="span"
                onClick={() => handleTabNavigation("hotel")}
                className="mobile-nav-link"
                style={{ cursor: "pointer" }}
              >
                {/* <i className="fas fa-bed"></i> */}
                Hotel
              </Nav.Link>
              <Nav.Link
                as="span"
                onClick={() => handleTabNavigation("bus")}
                className="mobile-nav-link"
                style={{ cursor: "pointer" }}
              >
                {/* <i className="fas fa-bus"></i> */}
                Bus
              </Nav.Link>
              <Nav.Link
                href="https://test.rasutrip.com/"
                className="mobile-nav-link"
                onClick={closeOffcanvas}
              >
                {/* <i className="fas fa-car"></i> */}
                Rider
              </Nav.Link>
            </div>

            {/* Driver Services */}
            <div className="mobile-nav-section">
              <h6 className="mobile-nav-title">Driver Services</h6>
              <Nav.Link
                href="https://test.rasutrip.com/driverpage"
                className="mobile-nav-link"
                onClick={closeOffcanvas}
              >
                {/* <i className="fas fa-id-card"></i> */}
                Apply to Drive
              </Nav.Link>
              <Nav.Link
                href="https://test.rasutrip.com/howdriving"
                className="mobile-nav-link"
                onClick={closeOffcanvas}
              >
                {/* <i className="fas fa-info-circle"></i> */}
                How it Works
              </Nav.Link>
              <Nav.Link
                href="https://test.rasutrip.com/driverrequirements"
                className="mobile-nav-link"
                onClick={closeOffcanvas}
              >
                {/* <i className="fas fa-clipboard-check"></i> */}
                Requirements
              </Nav.Link>
              <Nav.Link
                href="https://test.rasutrip.com/safety"
                className="mobile-nav-link"
                onClick={closeOffcanvas}
              >
                {/* <i className="fas fa-shield-alt"></i> */}
                Safety
              </Nav.Link>
            </div>

            {/* Other Services */}
            <div className="mobile-nav-section">
              <h6 className="mobile-nav-title">Other Services</h6>
              <Nav.Link
                href="https://test.rasutrip.com/serviceareas"
                className="mobile-nav-link"
                onClick={closeOffcanvas}
              >
                {/* <i className="fas fa-map-marker-alt"></i> */}
                Service Areas
              </Nav.Link>
              <Nav.Link
                href="/Blogs"
                className="mobile-nav-link"
                onClick={closeOffcanvas}
              >
                {/* <i className="fas fa-blog"></i> */}
                Blog
              </Nav.Link>
              <Nav.Link
                as="span"
                onClick={handleEnquiryClick}
                className="mobile-nav-link"
                style={{ cursor: "pointer" }}
              >
                {/* <i className="fas fa-envelope"></i> */}
                Enquiry
              </Nav.Link>
            </div>

            {/* App Download */}
            <div className="mobile-nav-section">
              <h6 className="mobile-nav-title">Get Our App</h6>
              <a
                href="https://play.google.com/store/apps/details?id=com.om.rasutrip&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-app-download"
                onClick={closeOffcanvas}
              >
                <img
                  src={icon1}
                  alt="Get it on Google Play"
                  style={{ maxWidth: "150px" }}
                />
              </a>
            </div>
          </Nav>
        </Offcanvas.Body>
      </Navbar.Offcanvas>

      {/* Enquiry Modal */}
      <Modal
        show={showEnquiry}
        onHide={() => setShowEnquiry(false)}
        size="lg"
        centered
      >
        <Modal.Body closeButton>
          <EnquiryForm />
        </Modal.Body>
      </Modal>

      {/* Login Modal */}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </>
  );
};

export default Header;
