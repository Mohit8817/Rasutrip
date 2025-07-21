// import React, { useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom'; // <-- import this

// import Container from 'react-bootstrap/Container';
// import Nav from 'react-bootstrap/Nav';
// import Navbar from 'react-bootstrap/Navbar';
// import Offcanvas from 'react-bootstrap/Offcanvas';
// import '../../Style/header.css';
// import logo from '../../assest/rasutrip.png';
// import Login from '../Login/Login';


// ///commment///

// const Header = () => {
//     const location = useLocation(); // <-- get current route
//     const isHomePage = location.pathname === '/';

//     const [scrolled, setScrolled] = useState(false);

//     useEffect(() => {
//         const handleScroll = () => {
//             if (isHomePage) {
//                 setScrolled(window.scrollY > 40);
//             } else {
//                 setScrolled(true); // Always white for other pages
//             }
//         };

//         handleScroll(); // Run on mount
//         window.addEventListener('scroll', handleScroll);
//         return () => window.removeEventListener('scroll', handleScroll);
//     }, [isHomePage]);

//     return (
//         <Navbar expand="lg" className={`mb-3 header_navbar ${scrolled ? 'scrolled' : ''}`}>
//             <Container fluid>
//                 <Navbar.Brand href="/">
//                     <img src={logo} alt="Logo" className="Header_logo" />
//                 </Navbar.Brand>
//                 <Navbar.Toggle aria-controls="offcanvasNavbar" />
//                 <Navbar.Offcanvas
//                     id="offcanvasNavbar"
//                     aria-labelledby="offcanvasNavbarLabel"
//                     placement="start"
//                 >
//                     <Offcanvas.Header closeButton>
//                         <Offcanvas.Title id="offcanvasNavbarLabel">LOGO</Offcanvas.Title>
//                     </Offcanvas.Header>
//                     <Offcanvas.Body>
//                         <Nav className="justify-content-center flex-grow-1 pe-3 header-nav">
//                             <Nav.Link href="#flight" className="nav-item-link">Flight</Nav.Link>
//                             <Nav.Link href="#hotel" className="nav-item-link">Hotel</Nav.Link>
//                             <Nav.Link href="#bus" className="nav-item-link">Bus</Nav.Link>
//                             <Nav.Link href="#blog" className="nav-item-link">Blog</Nav.Link>
//                             <Nav.Link href="#login" className="nav-item-link d-lg-none">Login</Nav.Link>
//                         </Nav>
//                     </Offcanvas.Body>
//                 </Navbar.Offcanvas>

//                 <div className="">                

//                     <Login/>
//                 </div>
//             </Container>
//         </Navbar>
//     );
// };

// export default Header;
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import '../../Style/header.css';
import logo from '../../assest/rasutrip.png';
import Login from '../Login/Login';

const Header = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
    const [userName, setUserName] = useState('John Doe'); // User name
    const [showLogin, setShowLogin] = useState(false);
    const [currency, setCurrency] = useState('INR');
    const [language, setLanguage] = useState('EN');

    useEffect(() => {
        const handleScroll = () => {
            if (isHomePage) {
                setScrolled(window.scrollY > 40);
            } else {
                setScrolled(true);
            }
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHomePage]);

const handleLoginClick = () => {
    setShowLogin(true);
    Navigate('/login/customer'); // ✅ use lowercase 'navigate'
};
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserName('');
    };

    return (
        <>
            {/* Top Bar */}
            <div className="top-bar d-none d-md-block">
                <Container fluid>
                    <div className="d-flex justify-content-between align-items-center py-2">
                        <div className="company-info">
                            <span className="company-name">RASUTRIP WEBSOFT TECHNOLOGIES LLP</span>
                            <span className="separator">|</span>
                            <span className="tagline">Your Trusted Travel Partner</span>
                        </div>
                        <div className="top-bar-right d-flex align-items-center">
                            {/* Currency Selector */}
                            <Dropdown className="me-3">
                                <Dropdown.Toggle variant="link" className="currency-dropdown">
                                    {currency} ₹
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => setCurrency('INR')}>INR ₹</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setCurrency('USD')}>USD $</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setCurrency('EUR')}>EUR €</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                            {/* Language Selector */}
                            <Dropdown className="me-3">
                                <Dropdown.Toggle variant="link" className="language-dropdown">
                                    🌐 {language}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => setLanguage('EN')}>English</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setLanguage('HI')}>हिंदी</Dropdown.Item>
                                    <Dropdown.Item onClick={() => setLanguage('BN')}>বাংলা</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                            {/* Customer Support */}
                            <div className="customer-support me-3">
                                <i className="fas fa-phone"></i>
                                <span>24/7 Support: +91-9266424809</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Main Header */}
            <Navbar expand="lg" className={`header_navbar ${scrolled ? 'scrolled' : ''}`} fixed="top">
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
                        {/* Mobile User Account */}
                        {isLoggedIn ? (
                            <Dropdown className="me-2">
                                <Dropdown.Toggle variant="link" className="user-dropdown-mobile">
                                    <i className="fas fa-user-circle"></i>
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end">
                                    <Dropdown.Header>Hi, {userName}!</Dropdown.Header>
                                    <Dropdown.Item href="/profile">My Profile</Dropdown.Item>
                                    <Dropdown.Item href="/bookings">My Bookings</Dropdown.Item>
                                    <Dropdown.Item href="/wallet">Wallet</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <Button variant="outline-primary" size="sm" className="me-2" onClick={handleLoginClick}>
                                Login
                            </Button>
                        )}
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
                                <img src={logo} alt="Logo" style={{width: '120px'}} />
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="header-nav ">
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

                                <Nav.Link href="/offers" className="nav-item-link position-relative">
                                    <i className="fas fa-gift"></i> Offers
                                    <Badge bg="danger" className="offer-badge">New</Badge>
                                </Nav.Link>

                                <Nav.Link href="/blog" className="nav-item-link">
                                    <i className="fas fa-blog"></i> Travel Blog
                                </Nav.Link>

                                {/* Mobile Only Links */}
                                <div className="d-lg-none mobile-only-nav">
                                    <Nav.Link href="/support" className="nav-item-link">
                                        <i className="fas fa-headset"></i> Customer Support
                                    </Nav.Link>
                                    <Nav.Link href="/about" className="nav-item-link">
                                        <i className="fas fa-info-circle"></i> About Us
                                    </Nav.Link>
                                </div>
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>

                    {/* Desktop Right Side */}
                    <div className="header-right d-none d-lg-flex align-items-center">
                        {/* Support */}
                        <div className="support-info me-3">
                            <i className="fas fa-headset text-primary"></i>
                            <span className="ms-1">Support</span>
                        </div>

                        {/* Notifications */}
                        <Dropdown className="me-3">
                            <Dropdown.Toggle variant="link" className="notification-dropdown position-relative">
                                <i className="fas fa-bell"></i>
                                <Badge bg="danger" className="notification-count">3</Badge>
                            </Dropdown.Toggle>
                            <Dropdown.Menu align="end" className="notification-menu">
                                <Dropdown.Header>Notifications</Dropdown.Header>
                                <Dropdown.Item>
                                    <div className="notification-item">
                                        <strong>Flight Deal Alert!</strong>
                                        <small className="text-muted d-block">50% off on Delhi to Mumbai</small>
                                    </div>
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    <div className="notification-item">
                                        <strong>Booking Confirmed</strong>
                                        <small className="text-muted d-block">Your hotel booking is confirmed</small>
                                    </div>
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item href="/notifications" className="text-center">
                                    View All Notifications
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        {/* User Account */}
                        {isLoggedIn ? (
                            <Dropdown>
                                <Dropdown.Toggle variant="link" className="user-dropdown">
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            <i className="fas fa-user-circle"></i>
                                        </div>
                                        <div className="user-details">
                                            <div className="user-name">{userName}</div>
                                            <small className="user-status">Gold Member</small>
                                        </div>
                                    </div>
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end" className="user-menu">
                                    <Dropdown.Header>Account Dashboard</Dropdown.Header>
                                    <Dropdown.Item href="/profile">
                                        <i className="fas fa-user me-2"></i>My Profile
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/bookings">
                                        <i className="fas fa-ticket-alt me-2"></i>My Bookings
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/wallet">
                                        <i className="fas fa-wallet me-2"></i>Wallet & Payments
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/rewards">
                                        <i className="fas fa-star me-2"></i>Rewards & Offers
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/settings">
                                        <i className="fas fa-cog me-2"></i>Settings
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item href="/help">
                                        <i className="fas fa-question-circle me-2"></i>Help & Support
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={handleLogout}>
                                        <i className="fas fa-sign-out-alt me-2"></i>Logout
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                           <div>
                           <Login/>
                           </div>
                            
                    
                        )}
                    </div>
                </Container>
            </Navbar>

            {/* Login Modal */}
            {showLogin && <Login onClose={() => setShowLogin(false)} />}
        </>
    );
};

export default Header;

