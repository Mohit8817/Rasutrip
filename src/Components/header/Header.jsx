import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Dropdown from 'react-bootstrap/Dropdown';
import '../../Style/header.css';
import logo from '../../assest/rasutrip.png';
import Login from '../Login/Login';

const Header = () => {
    const [showLogin, setShowLogin] = useState(false);

    return (
        <>
            {/* Top Bar */}
            <div className="top-bar d-none d-md-block">
                <Container fluid>
                    <div className="d-flex justify-content-between align-items-center py-2">
                        <div className="company-info">
                            <span className="company-name">RASUTRIP WEBSOFT TECHNOLOGIES</span>
                            <span className="separator">|</span>
                            <span className="tagline">Your Trusted Travel Partner</span>
                        </div>
                        <div className="customer-support">
                            <i className="fas fa-phone"></i>
                            <span>24/7 Support: +91-9266424809</span>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Main Header */}
            <Navbar expand="lg" className="header_navbar">
                <Container fluid>
                    {/* Logo */}
                    <Navbar.Brand href="/" className="brand-container">
                        <img src={logo} alt="RasuTrip Logo" className="Header_logo" />
                        <div className="brand-text d-none d-md-block">
                            <div className="brand-name">RasuTrip</div>
                            <div className="brand-tagline">Book with Confidence</div>
                        </div>
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
                                <img src={logo} alt="Logo" style={{ width: '120px' }} />
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="header-nav mx-auto">
                                {/* Main Navigation */}
                                <Nav.Link href="/" className="nav-item-link">
                                    <i className="fas fa-home"></i> Home
                                </Nav.Link>

                                <Dropdown as={Nav.Item} className="nav-dropdown">
                                    <Dropdown.Toggle as={Nav.Link} className="nav-item-link">
                                        <i className="fas fa-plane"></i> Flights
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item href="/flights/domestic">Domestic Flights</Dropdown.Item>
                                        <Dropdown.Item href="/flights/international">International Flights</Dropdown.Item>
                                        <Dropdown.Item href="/flights/multi-city">Multi-City</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Dropdown as={Nav.Item} className="nav-dropdown">
                                    <Dropdown.Toggle as={Nav.Link} className="nav-item-link">
                                        <i className="fas fa-bed"></i> Hotels
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item href="/hotels">Search Hotels</Dropdown.Item>
                                        <Dropdown.Item href="/hotels/deals">Hotel Deals</Dropdown.Item>
                                        <Dropdown.Item href="/hotels/luxury">Luxury Hotels</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Nav.Link href="/bus" className="nav-item-link">
                                    <i className="fas fa-bus"></i> Bus
                                </Nav.Link>

                                <Dropdown as={Nav.Item} className="nav-dropdown">
                                    <Dropdown.Toggle as={Nav.Link} className="nav-item-link">
                                        <i className="fas fa-car"></i> More
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item href="/cabs">Cabs</Dropdown.Item>
                                        <Dropdown.Item href="/trains">Trains</Dropdown.Item>
                                        <Dropdown.Item href="/holidays">Holiday Packages</Dropdown.Item>
                                        <Dropdown.Item href="/activities">Activities</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Nav.Link href="/blog" className="nav-item-link">
                                    <i className="fas fa-blog"></i> Travel Blog
                                </Nav.Link>
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>

                    {/* Desktop Right Side */}
                    <div className="header-right d-none d-lg-flex align-items-center">
                        <Login />
                    </div>
                </Container>
            </Navbar>

            {/* Login Modal */}
            {showLogin && <Login onClose={() => setShowLogin(false)} />}
        </>
    );
};

export default Header;