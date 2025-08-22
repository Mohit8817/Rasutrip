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
    const [showOffcanvas, setShowOffcanvas] = useState(false); // ✅ offcanvas state control

    // ✅ Function to close offcanvas
    const closeOffcanvas = () => {
        setShowOffcanvas(false);
    };

    // ✅ Function to handle enquiry click
    const handleEnquiryClick = () => {
        setShowEnquiry(true);
        closeOffcanvas(); // Close sidebar when enquiry modal opens
    };

    return (
        <>
            {/* Main Header */}
            <Navbar expand="lg" className="header_navbar">
                <Container fluid>
                    {/* Logo */}
                    <Navbar.Brand href="/" className="brand-container">
                        <img src={logo} alt="RasuTrip Logo" className="Header_logo" />
                    </Navbar.Brand>

                    {/* Mobile Toggle */}
                    <div className="d-flex align-items-center d-lg-none">
                        <Navbar.Toggle
                            aria-controls="offcanvasNavbar"
                            onClick={() => setShowOffcanvas(true)} // ✅ open offcanvas
                        />
                    </div>

                    {/* Offcanvas Menu for Mobile */}
                    <Navbar.Offcanvas
                        id="offcanvasNavbar"
                        aria-labelledby="offcanvasNavbarLabel"
                        placement="start"
                        show={showOffcanvas} // ✅ controlled by state
                        onHide={closeOffcanvas} // ✅ close handler
                    >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title id="offcanvasNavbarLabel">
                                <img src={logo} alt="Logo" style={{ width: "120px" }} />
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="header-nav mx-auto">
                                <Nav.Link
                                    href="/"
                                    className="nav-item-link"
                                    onClick={closeOffcanvas} // ✅ close on click
                                >
                                    Home
                                </Nav.Link>

                                {/* Flights Dropdown */}
                                <Dropdown as={Nav.Item} className="nav-dropdown">
                                    <Dropdown.Toggle as={Nav.Link} className="nav-item-link">
                                        Flights
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item
                                            href="/flights/domestic"
                                            onClick={closeOffcanvas} // ✅ close on click
                                        >
                                            Domestic Flights
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            href="/flights/international"
                                            onClick={closeOffcanvas} // ✅ close on click
                                        >
                                            International Flights
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            href="/flights/multi-city"
                                            onClick={closeOffcanvas} // ✅ close on click
                                        >
                                            Multi-City
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                {/* Hotels Dropdown */}
                                <Dropdown as={Nav.Item} className="nav-dropdown">
                                    <Dropdown.Toggle as={Nav.Link} className="nav-item-link">
                                        Hotels
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item
                                            href="/hotels"
                                            onClick={closeOffcanvas} // ✅ close on click
                                        >
                                            Search Hotels
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            href="/hotels/deals"
                                            onClick={closeOffcanvas} // ✅ close on click
                                        >
                                            Hotel Deals
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            href="/hotels/luxury"
                                            onClick={closeOffcanvas} // ✅ close on click
                                        >
                                            Luxury Hotels
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Nav.Link
                                    href="/bus"
                                    className="nav-item-link"
                                    onClick={closeOffcanvas} // ✅ close on click
                                >
                                    Bus
                                </Nav.Link>

                                {/* Rider / Driver / Service Areas */}
                                <Nav.Link
                                    href="https://test.rasutrip.com/"
                                    className="nav-item-link"
                                    onClick={closeOffcanvas} // ✅ close on click
                                >
                                    Rider
                                </Nav.Link>

                                {/* Driver Dropdown */}
                                <Dropdown as={Nav.Item} className="nav-dropdown">
                                    <Dropdown.Toggle as={Nav.Link} className="nav-item-link">
                                        Driver
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item
                                            href="https://test.rasutrip.com/driverpage"
                                            onClick={closeOffcanvas} // ✅ close on click
                                        >
                                            Apply Drive
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            href="https://test.rasutrip.com/howdriving"
                                            onClick={closeOffcanvas} // ✅ close on click
                                        >
                                            How it Works
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            href="https://test.rasutrip.com/driverrequirements"
                                            onClick={closeOffcanvas} // ✅ close on click
                                        >
                                            Driver Requirement
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            href="https://test.rasutrip.com/safety"
                                            onClick={closeOffcanvas} // ✅ close on click
                                        >
                                            Safety
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Nav.Link
                                    href="https://test.rasutrip.com/serviceareas"
                                    className="nav-item-link"
                                    onClick={closeOffcanvas} // ✅ close on click
                                >
                                    Service Areas
                                </Nav.Link>

                                {/* Blog */}
                                <Nav.Link
                                    href="/Blogs"
                                    className="nav-item-link"
                                    onClick={closeOffcanvas} // ✅ close on click
                                >
                                    Blog
                                </Nav.Link>

                                <Nav.Link
                                    as="span"
                                    onClick={handleEnquiryClick} // ✅ close sidebar and open enquiry
                                    className="nav-item-link"
                                    style={{ cursor: "pointer" }}>
                                    Enquiry
                                </Nav.Link>

                                {/* ✅ Mobile/Tablet Login Button */}
                                <div className="d-lg-none mt-3 pt-3">
                                    <div className="text-start float-left">
                                        <Login />

                                        {/* Mobile App Download Link */}
                                        <a
                                            href="https://play.google.com/store/apps/details?id=com.om.rasutrip&pcampaignid=web_share"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="d-block text-center mt-2"
                                            onClick={closeOffcanvas} // ✅ close on click
                                        >
                                            <img
                                                src={icon1}
                                                alt="Get it on Google Play"
                                                style={{ maxWidth: "120px" }}
                                            />
                                        </a>
                                    </div>
                                </div>
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>

                    {/* Desktop Right Side */}
                    <div className="header-right gap-3 d-none d-lg-flex align-items-center">
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
