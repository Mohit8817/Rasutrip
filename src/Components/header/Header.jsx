import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import Dropdown from "react-bootstrap/Dropdown";
import Modal from "react-bootstrap/Modal";
import "../../Style/header.css";
import logo from "../../assest/rasutrip.png";
import Login from "../Login/Login";
import EnquiryForm from "../EnquiryForm/EnquiryForm";
import icon1 from '../../assest/footericon2.svg';

const Header = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [showEnquiry, setShowEnquiry] = useState(false);
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    // Function to close offcanvas
    const closeOffcanvas = () => {
        setShowOffcanvas(false);
    };

    // Function to handle enquiry click
    const handleEnquiryClick = () => {
        setShowEnquiry(true);
        closeOffcanvas();
    };

    return (
        <>
            {/* Desktop Header - Hidden on mobile */}
            <Navbar expand="lg" className="header_navbar d-none d-lg-block">
                <Container fluid>
                    {/* Logo */}
                    <Navbar.Brand href="/" className="brand-container">
                        <img src={logo} alt="RasuTrip Logo" className="Header_logo" />
                    </Navbar.Brand>

                    {/* Desktop Navigation */}
                    <Nav className="header-nav mx-auto">
                        <Nav.Link href="/" className="nav-item-link">
                            Home
                        </Nav.Link>

                        {/* Flights Dropdown */}
                        {/* <Dropdown as={Nav.Item} className="nav-dropdown">
                            <Dropdown.Toggle as={Nav.Link} className="nav-item-link">
                                Flights
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item href="/flights/domestic">
                                    Domestic Flights
                                </Dropdown.Item>
                                <Dropdown.Item href="/flights/international">
                                    International Flights
                                </Dropdown.Item>
                                <Dropdown.Item href="/flights/multi-city">
                                    Multi-City
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown> */}

                        {/* Hotels Dropdown */}
                        {/* <Dropdown as={Nav.Item} className="nav-dropdown">
                            <Dropdown.Toggle as={Nav.Link} className="nav-item-link">
                                Hotels
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item href="/hotels">
                                    Search Hotels
                                </Dropdown.Item>
                                <Dropdown.Item href="/hotels/deals">
                                    Hotel Deals
                                </Dropdown.Item>
                                <Dropdown.Item href="/hotels/luxury">
                                    Luxury Hotels
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown> */}

                        <Nav.Link href="/bus" className="nav-item-link">
                            Flight
                        </Nav.Link>

                        <Nav.Link href="/bus" className="nav-item-link">
                            Hotel
                        </Nav.Link>

                        <Nav.Link href="/bus" className="nav-item-link">
                            Bus
                        </Nav.Link>

                        <Nav.Link href="https://test.rasutrip.com/" className="nav-item-link">
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

                        <Nav.Link href="https://test.rasutrip.com/serviceareas" className="nav-item-link">
                            Service Areas
                        </Nav.Link>

                        <Nav.Link href="/Blogs" className="nav-item-link">
                            Blogs
                        </Nav.Link>

                        <Nav.Link
                            as="span"
                            onClick={() => setShowEnquiry(true)}
                            className="nav-item-link"
                            style={{ cursor: "pointer" }}>
                            Enquiry
                        </Nav.Link>

                        <Nav.Link href="https://www.rasutechnologies.com/" className="nav-item-link">
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
            <Navbar className="mobile-header d-lg-none">
                <Container fluid>
                    <Navbar.Brand href="/" className="brand-container">
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
                        <a href="/flights/domestic" className="bottom-nav-link">
                            <i className="fas fa-plane"></i>
                            <span>Flights</span>
                        </a>
                    </div>

                    <div className="bottom-nav-item">
                        <a href="/hotels" className="bottom-nav-link">
                            <i className="fas fa-bed"></i>
                            <span>Hotels</span>
                        </a>
                    </div>

                    <div className="bottom-nav-item">
                        <a href="/bus" className="bottom-nav-link">
                            <i className="fas fa-bus"></i>
                            <span>Bus</span>
                        </a>
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
                        <img src={logo} alt="Logo" style={{ width: "120px" }} />
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="mobile-nav">
                        {/* Rider Section */}
                        <div className="mobile-nav-section">
                            <h6 className="mobile-nav-title">Travel Services</h6>
                            <Nav.Link
                                href="https://test.rasutrip.com/"
                                className="mobile-nav-link"
                                onClick={closeOffcanvas}
                            >
                                <i className="fas fa-car"></i>
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
                                <i className="fas fa-id-card"></i>
                                Apply to Drive
                            </Nav.Link>
                            <Nav.Link
                                href="https://test.rasutrip.com/howdriving"
                                className="mobile-nav-link"
                                onClick={closeOffcanvas}
                            >
                                <i className="fas fa-info-circle"></i>
                                How it Works
                            </Nav.Link>
                            <Nav.Link
                                href="https://test.rasutrip.com/driverrequirements"
                                className="mobile-nav-link"
                                onClick={closeOffcanvas}
                            >
                                <i className="fas fa-clipboard-check"></i>
                                Requirements
                            </Nav.Link>
                            <Nav.Link
                                href="https://test.rasutrip.com/safety"
                                className="mobile-nav-link"
                                onClick={closeOffcanvas}
                            >
                                <i className="fas fa-shield-alt"></i>
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
                                <i className="fas fa-map-marker-alt"></i>
                                Service Areas
                            </Nav.Link>
                            <Nav.Link
                                href="/Blogs"
                                className="mobile-nav-link"
                                onClick={closeOffcanvas}
                            >
                                <i className="fas fa-blog"></i>
                                Blog
                            </Nav.Link>
                            <Nav.Link
                                as="span"
                                onClick={handleEnquiryClick}
                                className="mobile-nav-link"
                                style={{ cursor: "pointer" }}
                            >
                                <i className="fas fa-envelope"></i>
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
            <Modal show={showEnquiry} onHide={() => setShowEnquiry(false)} size="lg" centered>
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