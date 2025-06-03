import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import '../../Style/header.css';
import logo from '../../assest/rasutrip.png'; // Adjust the path if needed
import Userlogin from './Userlogin';

const Header = () => {
    return (
        <Navbar expand="lg" variant="light" className="mb-3 header_navbar">
            <Container fluid>
                <Navbar.Brand href="#">
                    <img
                        src={logo}
                        alt="Logo"
                        className="Header_logo"
                    />
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

                {/* Desktop user login component aligned right */}
                <div className="d-none d-lg-block ms-auto">
                    <Userlogin />

                </div>
            </Container>
        </Navbar>
    );
};

export default Header;
