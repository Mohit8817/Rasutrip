import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // <-- import this
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import '../../Style/header.css';
import logo from '../../assest/rasutrip.png';
import Userlogin from './Userlogin';

const Header = () => {
    const location = useLocation(); // <-- get current route
    const isHomePage = location.pathname === '/';

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (isHomePage) {
                setScrolled(window.scrollY > 40);
            } else {
                setScrolled(true); // Always white for other pages
            }
        };

        handleScroll(); // Run on mount
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHomePage]);

    return (
        <Navbar expand="lg" className={`mb-3 header_navbar ${scrolled ? 'scrolled' : ''}`}>
            <Container fluid>
                <Navbar.Brand href="/">
                    <img src={logo} alt="Logo" className="Header_logo" />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="offcanvasNavbar" />
                <Navbar.Offcanvas
                    id="offcanvasNavbar"
                    aria-labelledby="offcanvasNavbarLabel"
                    placement="start"
                >
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title id="offcanvasNavbarLabel">LOGO</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <Nav className="justify-content-center flex-grow-1 pe-3 header-nav">
                            <Nav.Link href="#flight" className="nav-item-link">Flight</Nav.Link>
                            <Nav.Link href="#hotel" className="nav-item-link">Hotel</Nav.Link>
                            <Nav.Link href="#bus" className="nav-item-link">Bus</Nav.Link>
                            <Nav.Link href="#blog" className="nav-item-link">Blog</Nav.Link>
                            <Nav.Link href="#login" className="nav-item-link d-lg-none">Login</Nav.Link>
                        </Nav>
                    </Offcanvas.Body>
                </Navbar.Offcanvas>

                <div className="d-none d-lg-block ms-auto">
                    <Userlogin />
                </div>
            </Container>
        </Navbar>
    );
};

export default Header;
