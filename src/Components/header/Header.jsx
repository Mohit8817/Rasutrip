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
import EnquiryForm from "../EnquiryForm/EnquiryForm"; // ✅ enquiry form import
import icon1 from '../../assest/footericon2.svg';

const Header = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [showEnquiry, setShowEnquiry] = useState(false); // ✅ enquiry modal state

    return (
        <>


            {/* Main Header */}
            <Navbar expand="lg" className="header_navbar">
                <Container fluid>
                    {/* Logo */}
                    <Navbar.Brand href="/" className="brand-container">
                        <img src={logo} alt="RasuTrip Logo" className="Header_logo" />
                        {/* <div className="brand-text d-none d-md-block">
                            <div className="brand-name">RasuTrip</div>
                            <div className="brand-tagline">Book with Confidence</div>
                        </div> */}
                    </Navbar.Brand>

                    {/* Mobile Toggle */}
                    <div className="d-flex align-items-center d-lg-none">
                        <Navbar.Toggle aria-controls="offcanvasNavbar" />
                    </div>

                    {/* Offcanvas Menu for Mobile */}
                    <Navbar.Offcanvas
                        id="offcanvasNavbar"
                        aria-labelledby="offcanvasNavbarLabel"
                        placement="start"
                    >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title id="offcanvasNavbarLabel">
                                <img src={logo} alt="Logo" style={{ width: "120px" }} />
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="header-nav mx-auto">
                                <Nav.Link href="/" className="nav-item-link">
                                    Home
                                </Nav.Link>

                                {/* Flights Dropdown */}
                                <Dropdown as={Nav.Item} className="nav-dropdown">
                                    <Dropdown.Toggle as={Nav.Link} className="nav-item-link">
                                        Flights
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item href="/flights/domestic">Domestic Flights</Dropdown.Item>
                                        <Dropdown.Item href="/flights/international">International Flights</Dropdown.Item>
                                        <Dropdown.Item href="/flights/multi-city">Multi-City</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                {/* Hotels Dropdown */}
                                <Dropdown as={Nav.Item} className="nav-dropdown">
                                    <Dropdown.Toggle as={Nav.Link} className="nav-item-link">
                                        Hotels
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item href="/hotels">Search Hotels</Dropdown.Item>
                                        <Dropdown.Item href="/hotels/deals">Hotel Deals</Dropdown.Item>
                                        <Dropdown.Item href="/hotels/luxury">Luxury Hotels</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Nav.Link href="/bus" className="nav-item-link">
                                    Bus
                                </Nav.Link>



                                {/* ✅ Rider / Driver / Service Areas */}
                                <Nav.Link href="/rider" className="nav-item-link">
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
                                {/* Blog */}
                                <Nav.Link href="/Blogs" className="nav-item-link">
                                    Blog
                                </Nav.Link>

                                <Nav.Link
                                    as="span"
                                    onClick={() => setShowEnquiry(true)} // ✅ open enquiry modal
                                    className="nav-item-link"
                                    style={{ cursor: "pointer" }}>
                                    Enquiry
                                </Nav.Link>

                            </Nav>

                        </Offcanvas.Body>
                    </Navbar.Offcanvas>

                    {/* Desktop Right Side */}
                    <div className="header-right gap-3 d-none d-lg-flex align-items-center">

                        <a
                            href="https://play.google.com/store/apps/details?id=com.rasutaxi.customer&pli=1"
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
