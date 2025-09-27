// // import React from 'react';
// // import { Container, Row, Col } from 'react-bootstrap';
// // import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
// // import 'bootstrap/dist/css/bootstrap.min.css';
// // import '../../Style/Footer.css'; // You can add styles here
// // import footerlogo from '../../assest/rasutrip.png'
// // import { Link } from 'react-router-dom';

// // const Footer = () => {
// //     return (
// //         <footer className="footer py-5 bg-white">
// //             <Container>
// //                 <Row>
// //                     {/* Column 1 - Logo & Contact */}
// //                     <Col md={4} className="mb-4 mb-md-0">
// //                         <img
// //                             className='footerlogo'
// //                             src={footerlogo}
// //                             alt="rasutrip"
// //                         />
// //                         <div className="d-flex text-start mb-3">
// //                             <FaPhoneAlt className="footer-icon me-3 mt-1" size={20} />
// //                             <div>
// //                                 <div className="fw-semibold">Customer Support</div>
// //                                 <div>+91 9266424809</div>
// //                             </div>
// //                         </div>
// //                         <div className="d-flex text-start mb-3">
// //                             <FaEnvelope className="footer-icon me-3 mt-1" size={20} />
// //                             <div style={{ cursor: 'pointer' }}>
// //                                 <div className="fw-semibold">Drop Us an Email</div>
// //                                 <div>
// //                                     <a href="mailto:support@rasutrip.com" style={{ color: '#000', textDecoration: 'none' }}>
// //                                         support@rasutrip.com
// //                                     </a>
// //                                 </div>
// //                             </div>

// //                         </div>
// //                         <div className="d-flex text-start mb-3">
// //                             <FaMapMarkerAlt className="footer-icon me-3 mt-1" size={20} />
// //                             <div>
// //                                 <div className="fw-semibold">Company Address</div>
// //                                 <div>
// //                                   SARFABAD,NOIDA, Sarfabad, SARFABAD, Dadri, Gautam Buddha Nagar- 201307, Uttar Pradesh, India
// //                                 </div>
// //                             </div>
// //                         </div>
// //                     </Col>

// //                     {/* Column 2 - Company */}
// //                     <Col md={2} className="mb-4 mb-md-0 text-start">
// //                         <h5 className="footer-heading">Company</h5>
// //                         <ul className="list-unstyled">
// //                             <li className="mb-2">
// //                                 <Link to="/Aboutus" className="text-decoration-none text-dark">
// //                                     About Us
// //                                 </Link>
// //                             </li>
// //                             <li>
// //                                 <Link to="/faq" className="text-decoration-none text-dark">
// //                                     Frequently Asked Questions
// //                                 </Link>
// //                             </li>
// //                         </ul>
// //                     </Col>

// //                     {/* Column 3 - Services */}
// //                     <Col md={2} className="mb-4 mb-md-0 text-start">
// //                         <h5 className="footer-heading">Services</h5>
// //                         <ul className="list-unstyled">
// //                             <li className="mb-2">Flight</li>
// //                             <li className="mb-2">Hotel</li>
// //                             <li>Bus</li>
// //                         </ul>
// //                     </Col>

// //                     {/* Column 4 - Legal */}
// //                     <Col md={2} className="mb-4 mb-md-0 text-start">
// //                         <h5 className="footer-heading">Legal</h5>
// //                         <ul className="list-unstyled">
// //                             <li className="mb-2">
// //                                 <Link to="/terms-and-conditions" className="text-decoration-none text-dark">
// //                                     Terms & Conditions
// //                                 </Link>
// //                             </li>
// //                             <li className="mb-2">
// //                                 <Link to="/privacy-policy" className="text-decoration-none text-dark">
// //                                     Privacy Policy
// //                                 </Link>
// //                             </li>
// //                             <li className="mb-2">
// //                                 <Link to="/disclaimer" className="text-decoration-none text-dark">
// //                                     Declaration
// //                                 </Link>
// //                             </li>
// //                             <li className="mb-2">
// //                                 <Link to="/UserAgreement" className="text-decoration-none text-dark">
// //                                     User Agreement
// //                                 </Link>
// //                             </li>
// //                             <li className="mb-2">
// //                                 <Link to="/CancellationRefundpolicy" className="text-decoration-none text-dark">
// //                                     Cancellation & Refund policy
// //                                 </Link>
// //                             </li>
// //                         </ul>

// //                     </Col>
// //                 </Row>

// //             </Container>

// //             <Container className='bootomstrip'>
// //                 <Row>
// //                     <Col>
// //                         <div className='Copyright'>
// //                             Copyright © 2025 RASUTRIP WEBSOFT TECHNOLOGIES LLP. All Rights Reserved
// //                         </div>
// //                     </Col>

// //                 </Row>
// //             </Container>
// //         </footer>
// //     );
// // };

// // export default Footer;
// import React from 'react';
// import { Container, Row, Col } from 'react-bootstrap';
// import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import '../../Style/Footer.css';
// import footerlogo from '../../assest/rasutrip.png'
// import { Link } from 'react-router-dom';

// const Footer = () => {
//     return (
//         <footer className="footer">
//             {/* Main Footer Content */}
//             <div className="footer-main py-5 bg-light">
//                 <Container>
//                     <Row>
//                         {/* Column 1 - Logo & Contact */}
//                         <Col lg={4} md={6} className="mb-4">
//                             <div className="footer-brand mb-4">
//                                 <img
//                                     className='footerlogo'
//                                     src={footerlogo}
//                                     alt="rasutrip"
//                                 />
//                                 <p className="brand-tagline mt-3 text-muted">
//                                     Your trusted travel companion for flights, hotels, and bus bookings across India.
//                                 </p>
//                             </div>

//                             <div className="contact-info">
//                                 <div className="contact-item d-flex mb-3">
//                                     <div className="contact-icon-wrapper me-3">
//                                         <FaPhoneAlt className="footer-icon" size={16} />
//                                     </div>
//                                     <div>
//                                         <div className="contact-title">24/7 Customer Support</div>
//                                         <div className="contact-detail">+91 9266424809</div>
//                                     </div>
//                                 </div>

//                                 <div className="contact-item d-flex mb-3">
//                                     <div className="contact-icon-wrapper me-3">
//                                         <FaEnvelope className="footer-icon" size={16} />
//                                     </div>
//                                     <div>
//                                         <div className="contact-title">Email Support</div>
//                                         <div className="contact-detail">
//                                             <a href="mailto:support@rasutrip.com" className="email-link">
//                                                 support@rasutrip.com
//                                             </a>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="contact-item d-flex mb-3">
//                                     <div className="contact-icon-wrapper me-3">
//                                         <FaMapMarkerAlt className="footer-icon" size={16} />
//                                     </div>
//                                     <div>
//                                         <div className="contact-title">Head Office</div>
//                                         <div className="contact-detail">
//                                             SARFABAD, NOIDA, Gautam Buddha Nagar<br />
//                                             Uttar Pradesh - 201307, India
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </Col>

//                         {/* Column 2 - Quick Links */}
//                         <Col lg={2} md={6} className="mb-4">
//                             <h5 className="footer-heading">Quick Links</h5>
//                             <ul className="footer-links">
//                                 <li>
//                                     <Link to="/Aboutus" className="footer-link">
//                                         About Us
//                                     </Link>
//                                 </li>
//                                 <li>
//                                     <Link to="/faq" className="footer-link">
//                                         FAQ
//                                     </Link>
//                                 </li>
//                                 <li>
//                                     <Link to="/contact" className="footer-link">
//                                         Contact Us
//                                     </Link>
//                                 </li>
//                                 <li>
//                                     <Link to="/careers" className="footer-link">
//                                         Careers
//                                     </Link>
//                                 </li>
//                                 <li>
//                                     <Link to="/blog" className="footer-link">
//                                         Travel Blog
//                                     </Link>
//                                 </li>
//                             </ul>
//                         </Col>

//                         {/* Column 3 - Our Services */}
//                         <Col lg={2} md={6} className="mb-4">
//                             <h5 className="footer-heading">Our Services</h5>
//                             <ul className="footer-links">
//                                 <li>
//                                     <Link to="/flights" className="footer-link">
//                                         Flight Booking
//                                     </Link>
//                                 </li>
//                                 <li>
//                                     <Link to="/hotels" className="footer-link">
//                                         Hotel Booking
//                                     </Link>
//                                 </li>
//                                 <li>
//                                     <Link to="/bus" className="footer-link">
//                                         Bus Booking
//                                     </Link>
//                                 </li>
//                                 <li>
//                                     <Link to="/packages" className="footer-link">
//                                         Holiday Packages
//                                     </Link>
//                                 </li>
//                                 <li>
//                                     <Link to="/offers" className="footer-link">
//                                         Special Offers
//                                     </Link>
//                                 </li>
//                             </ul>
//                         </Col>

//                         {/* Column 4 - Legal */}
//                         <Col lg={2} md={6} className="mb-4">
//                             <h5 className="footer-heading">Legal</h5>
//                             <ul className="footer-links">
//                                 <li>
//                                     <Link to="/terms-and-conditions" className="footer-link">
//                                         Terms & Conditions
//                                     </Link>
//                                 </li>
//                                 <li>
//                                     <Link to="/privacy-policy" className="footer-link">
//                                         Privacy Policy
//                                     </Link>
//                                 </li>
//                                 <li>
//                                     <Link to="/disclaimer" className="footer-link">
//                                         Disclaimer
//                                     </Link>
//                                 </li>
//                                 <li>
//                                     <Link to="/UserAgreement" className="footer-link">
//                                         User Agreement
//                                     </Link>
//                                 </li>
//                                 <li>
//                                     <Link to="/CancellationRefundpolicy" className="footer-link">
//                                         Refund Policy
//                                     </Link>
//                                 </li>
//                             </ul>
//                         </Col>

//                         {/* Column 5 - Follow Us */}
//                         <Col lg={2} md={6} className="mb-4">
//                             <h5 className="footer-heading">Follow Us</h5>
//                             <div className="social-links mb-4">
//                                 <a href="#" className="social-link me-2">
//                                     <FaFacebookF />
//                                 </a>
//                                 <a href="#" className="social-link me-2">
//                                     <FaTwitter />
//                                 </a>
//                                 <a href="#" className="social-link me-2">
//                                     <FaInstagram />
//                                 </a>
//                                 <a href="#" className="social-link me-2">
//                                     <FaLinkedinIn />
//                                 </a>
//                                 <a href="#" className="social-link">
//                                     <FaYoutube />
//                                 </a>
//                             </div>

//                             <div className="app-download">
//                                 <h6 className="download-title">Download App</h6>
//                                 <div className="app-buttons">
//                                     <a href="#" className="app-button mb-2 d-block">
//                                         <img src="https://static.vecteezy.com/system/resources/previews/012/871/364/non_2x/google-play-store-download-button-in-white-colors-download-on-the-google-play-store-free-png.png"
//                                              alt="Get it on Google Play" className="img-fluid" />
//                                     </a>
//                                     <a href="#" className="app-button d-block">
//                                         <img src="https://www.logo.wine/a/logo/App_Store_(iOS)/App_Store_(iOS)-Badge-Logo.wine.svg"
//                                              alt="Download on App Store" className="img-fluid" />
//                                     </a>
//                                 </div>
//                             </div>
//                         </Col>
//                     </Row>
//                 </Container>
//             </div>

//             {/* Bottom Strip */}
//             <div className="footer-bottom">
//                 <Container>
//                     <Row className="align-items-center">
//                         <Col md={8}>
//                             <div className="copyright-text">
//                                 Copyright © 2025 RASUTRIP WEBSOFT TECHNOLOGIES LLP. All Rights Reserved
//                             </div>
//                         </Col>
//                         <Col md={4}>
//                             <div className="payment-methods text-md-end">
//                                 <span className="payment-text me-2">We Accept:</span>
//                                 <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOK-ExH64w4vaz6r2HY7kpEc0SEZKmpq7CKg&s" alt="Visa" className="payment-icon me-1" />
//                                 <img src="https://pngimg.com/d/mastercard_PNG23.png" alt="Mastercard" className="payment-icon me-1" />
//                                 <img src="https://t3.ftcdn.net/jpg/05/60/50/16/360_F_560501607_x7crxqBWbmbgK2k8zOL0gICbIbK9hP6y.jpg" alt="UPI" className="payment-icon" />
//                             </div>
//                         </Col>
//                     </Row>
//                 </Container>
//             </div>
//         </footer>
//     );
// };

// export default Footer;
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import icon1 from "../../assest/footericon.svg";
import icon2 from "../../assest/footericon2.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Style/Footer.css";
import footerlogo from "../../assest/rasutrip.png";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleTabNavigation = (tabType) => {
    if (location.pathname === "/") {
      const sliderElement = document.querySelector(".slider-container");
      if (sliderElement) {
        sliderElement.scrollIntoView({ behavior: "smooth" });
      }

      const event = new CustomEvent("setActiveTab", {
        detail: { tabType },
      });
      window.dispatchEvent(event);
    } else {
      navigate(`/?tab=${tabType}`);
    }
  };
  return (
    <footer className="footer">
      {/* Main Footer Content */}
      <div className="footer-main py-5 bg-light">
        <Container>
          <Row>
            {/* Column 1 - Logo & Contact */}
            <Col lg={3} md={6} className="">
              <div className="footer-brand">
                <img className="footerlogo" src={footerlogo} alt="rasutrip" />
                <p className="text-muted">
                  Your trusted travel companion for flights, hotels, and bus
                  bookings across India.
                </p>
              </div>

              <div className="app-download">
                <h6 className="download-title mb-2">Taxi App</h6>
                {/* Buttons Side by Side */}
                <div className="flex items-center gap-3">
                  <a
                    href="https://apps.apple.com/in/app/tagxi/id1608868419"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={icon1}
                      alt="Download on App Store"
                      className="w-32" // size adjust yaha se
                    />
                  </a>

                  <a
                    href="https://play.google.com/store/apps/details?id=com.rasutaxi.customer&pli=1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={icon2}
                      alt="Get it on Google Play"
                      className="w-32"
                    />
                  </a>
                </div>

                <div>
                  <h6 className="download-title mt-2">Driver App</h6>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.rasutaxi.driver&pli=1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={icon2}
                      alt="Get it on Google Play"
                      className="w-32"
                    />
                  </a>
                </div>
              </div>
            </Col>

            {/* Column 2 - Quick Links */}
            <Col lg={2} md={6} className="mb-4">
              <h5 className="footer-heading">Quick Links</h5>
              <ul className="footer-links">
                <li>
                  <Link to="/Aboutus" className="footer-link">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="footer-link">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="footer-link">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="footer-link">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/blogs" className="footer-link">
                    Blog
                  </Link>
                </li>
              </ul>
            </Col>

            {/* Column 3 - Our Services */}
            <Col lg={2} md={6} className="mb-4">
              <h5 className="footer-heading">Our Services</h5>
              <ul className="footer-links">
                {/* <li>
                  <Link to="/?tab=flight" className="footer-link">
                    Flight Booking
                  </Link>
                </li>
                <li>
                  <Link to="/?tab=hotel" className="footer-link">
                    Hotel Booking
                  </Link>
                </li>
                <li>
                  <Link to="/?tab=bus" className="footer-link">
                    Bus Booking
                  </Link>
                </li> */}

                <li>
                  <span
                    className="footer-link"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleTabNavigation("flight")}
                  >
                    Flight Booking
                  </span>
                </li>
                <li>
                  <span
                    className="footer-link"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleTabNavigation("hotel")}
                  >
                    Hotel Booking
                  </span>
                </li>
                <li>
                  <span
                    className="footer-link"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleTabNavigation("bus")}
                  >
                    Bus Booking
                  </span>
                </li>

                <li>
                  <Link to="/packages" className="footer-link">
                    Rider
                  </Link>
                </li>
                <li>
                  <Link to="/offers" className="footer-link">
                    Driver
                  </Link>
                </li>
              </ul>
            </Col>

            {/* Column 4 - Legal */}
            <Col lg={2} md={6} className="mb-4">
              <h5 className="footer-heading">Legal</h5>
              <ul className="footer-links">
                <li>
                  <Link to="/terms-and-conditions" className="footer-link">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="footer-link">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="footer-link">
                    Disclaimer
                  </Link>
                </li>
                <li>
                  <Link to="/UserAgreement" className="footer-link">
                    User Agreement
                  </Link>
                </li>
                <li>
                  <Link to="/CancellationRefundpolicy" className="footer-link">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </Col>

            {/* Column 5 - Follow Us */}
            <Col lg={3} md={6} className="mb-4">
              <h5 className="footer-heading">Contact Us</h5>

              <div className="contact-info">
                <div className="contact-item d-flex mb-3">
                  <div className="contact-icon-wrapper me-3">
                    <FaPhoneAlt className="footer-icon" size={16} />
                  </div>
                  <div>
                    <div className="contact-title">24/7 Customer Support</div>
                    <div className="contact-detail">
                      <a href="tel:+919266424809" className="phone-link">
                        +91 9266424809
                      </a>
                    </div>
                  </div>
                </div>

                <div className="contact-item d-flex mb-3">
                  <div className="contact-icon-wrapper me-3">
                    <FaEnvelope className="footer-icon" size={16} />
                  </div>
                  <div>
                    <div className="contact-title">Email Support</div>
                    <div className="contact-detail">
                      <a
                        href="mailto:support@rasutrip.com"
                        className="email-link"
                      >
                        support@rasutrip.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="contact-item d-flex mb-3">
                  <div className="contact-icon-wrapper me-3">
                    <FaMapMarkerAlt className="footer-icon" size={16} />
                  </div>
                  <div>
                    <div className="contact-title">Head Office</div>
                    <div className="contact-detail">
                      SARFABAD, NOIDA, Gautam Buddha Nagar
                      <br />
                      Uttar Pradesh - 201307, India
                    </div>
                  </div>
                </div>
              </div>

              <div className="social-links mb-4 mx-1">
                <a
                  href="https://www.facebook.com/people/RasuTrip-Flight-Bus-Hotel-Booking-Platform/61579934815097/#"
                  className="social-link me-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="https://www.instagram.com/rasutrip/"
                  className="social-link me-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://www.linkedin.com/company/rasutrip-websoft-technologies-llp/?viewAsMember=true"
                  className="social-link me-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on LinkedIn"
                >
                  <FaLinkedinIn />
                </a>
                <a
                  href="https://youtube.com/@rasutrip"
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Subscribe to our YouTube channel"
                >
                  <FaYoutube />
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Bottom Strip */}
      <div className="footer-bottom">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <div className="copyright-text">
                Copyright © 2025 RASUTRIP WEBSOFT TECHNOLOGIES LLP. All Rights
                Reserved
              </div>
            </Col>
            <Col md={4}>
              <div className="payment-methods text-md-end">
                <span className="payment-text me-2">We Accept:</span>
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOK-ExH64w4vaz6r2HY7kpEc0SEZKmpq7CKg&s"
                  alt="Visa"
                  className="payment-icon me-1"
                  style={{ height: "24px" }}
                />
                <img
                  src="https://pngimg.com/d/mastercard_PNG23.png"
                  alt="Mastercard"
                  className="payment-icon me-1"
                  style={{ height: "24px" }}
                />
                <img
                  src="https://t3.ftcdn.net/jpg/05/60/50/16/360_F_560501607_x7crxqBWbmbgK2k8zOL0gICbIbK9hP6y.jpg"
                  alt="UPI"
                  className="payment-icon"
                  style={{ height: "24px" }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
