// import React, { useContext, useState } from "react";
// import { Container, Row, Col, Button, Modal } from "react-bootstrap";
// import { LocationContext } from "../Context/LocationContext";
// import "../../Style/Pagescss/FlightResultsPage.css";
// import Slider from "../hero/Slider";
// import { Link, useNavigate } from "react-router-dom";
// const FlightSearchBar = () => {
//   const { locationData } = useContext(LocationContext);
//   const navigate = useNavigate();
//   const [showLoginModal, setShowLoginModal] = useState(false);

//   const {
//     fromCity = "",
//     toCity = "",
//     fromAirport = "",
//     toAirport = "",
//     departDate,
//     passengers = { adults: 1, children: 0, infants: 0 },
//     cabinClass = "",
//   } = locationData || {};

//   const totalPassengers =
//     passengers.adults + passengers.children + passengers.infants;

//   // Format departure date
//   let formattedDate = "Not selected";
//   if (departDate?.PreferredTime) {
//     const jsDate = new Date(departDate.PreferredTime);
//     if (!isNaN(jsDate.getTime())) {
//       formattedDate =
//         jsDate.toLocaleDateString("en-GB", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         }) +
//         ", " +
//         jsDate.toLocaleDateString("en-GB", {
//           weekday: "long",
//         });
//     }
//   }

//   // Cabin class map for showing name instead of number
//   const cabinClassMap = {
//     1: "Economy",
//     2: "Premium Economy",
//     4: "Business",
//     5: "First",
//   };

//   const Show = () => {
//     // alert('fdfdf')
//     setShowLoginModal(true);
//   };

//   return (
//     <Container className="p-3 bg-white shadow-sm rounded border ">
//       <Row className="align-items-center text-center text-md-start">
//         {/* <Col md={8}> */}

//         {/* </Col> */}
//       </Row>
//       <Row className="align-items-center text-center text-md-start">
//         {/* <div className="d-flex justify-content-center justify-content-md-start align-items-center mb-2 mb-md-0 w-100"> */}
//         <Col md={2} xs={6}>
//           <strong>{fromAirport}</strong>
//           <div className="text-muted small">{fromCity}</div>
//         </Col>

//         <Col md={1}>
//           <div style={{ fontSize: "20px" }}>→</div>
//         </Col>

//         <Col md={2} xs={6}>
//           <strong>{toAirport}</strong>
//           <div className="text-muted small">{toCity}</div>
//         </Col>
//         {/* </div> */}

//         <Col md={2} xs={6}>
//           <div>
//             <strong>Departure Date</strong>
//           </div>
//           <div className="text-muted small">{formattedDate}</div>
//         </Col>

//         <Col md={2} xs={6}>
//           <div>
//             <strong>Travellers</strong>
//           </div>
//           <div className="text-muted small">{totalPassengers}</div>
//         </Col>

//         <Col md={2} xs={6}>
//           <div>
//             <strong>Travel Class</strong>
//           </div>
//           <div className="text-muted small">
//             {cabinClassMap[cabinClass] || "Not selected"}
//           </div>
//         </Col>

//         <Col md={1} xs={12} className="text-end">
//           <a
//             onClick={Show}
//             variant="primary"
//             className="btn btn-primary ModifyButton"
//           >
//             Modify
//           </a>
//         </Col>
//       </Row>

//       <Modal
//         size="xl"
//         dialogClassName="modal-200w"
//         show={showLoginModal}
//         onHide={() => setShowLoginModal(false)}
//         centered
//       >
//         <Modal.Header></Modal.Header>
//         <Modal.Body className="text-center">
//           <Slider type="resultPage" />
//         </Modal.Body>
//       </Modal>
//     </Container>
//   );
// };

// export default FlightSearchBar;

// import React, { useContext, useState } from "react";
// import { Container, Row, Col, Button, Modal } from "react-bootstrap";
// import { LocationContext } from "../Context/LocationContext";
// import "../../Style/Pagescss/FlightResultsPage.css";
// import Slider from "../hero/Slider";
// import { useNavigate } from "react-router-dom";

// const FlightSearchBar = () => {
//   const { locationData } = useContext(LocationContext);
//   const navigate = useNavigate();
//   const [showLoginModal, setShowLoginModal] = useState(false);

//   const {
//     fromCity = "",
//     toCity = "",
//     fromAirport = "",
//     toAirport = "",
//     departDate,
//     passengers = { adults: 1, children: 0, infants: 0 },
//     cabinClass = "",
//   } = locationData || {};

//   const totalPassengers =
//     passengers.adults + passengers.children + passengers.infants;

//   // Format departure date
//   let formattedDate = "Not selected";
//   if (departDate?.PreferredTime) {
//     const jsDate = new Date(departDate.PreferredTime);
//     if (!isNaN(jsDate.getTime())) {
//       formattedDate =
//         jsDate.toLocaleDateString("en-GB", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         }) +
//         ", " +
//         jsDate.toLocaleDateString("en-GB", {
//           weekday: "long",
//         });
//     }
//   }

//   const cabinClassMap = {
//     1: "Economy",
//     2: "Premium Economy",
//     4: "Business",
//     5: "First",
//   };

//   const Show = () => setShowLoginModal(true);

//   return (
//     <Container className="p-3 bg-white shadow-sm rounded border flight-search-bar">
//       <Row className="align-items-center text-center text-md-start g-3">
//         {/* From Airport */}
//         <Col xs={12} sm={6} md={2}>
//           <strong>{fromAirport}</strong>
//           <div className="text-muted small">{fromCity}</div>
//         </Col>

//         {/* Arrow */}
//         <Col xs={12} sm={12} md={1} className="d-none d-md-block text-center">
//           <div style={{ fontSize: "20px" }}>→</div>
//         </Col>

//         {/* To Airport */}
//         <Col xs={12} sm={6} md={2}>
//           <strong>{toAirport}</strong>
//           <div className="text-muted small">{toCity}</div>
//         </Col>

//         {/* Departure Date */}
//         <Col xs={12} sm={6} md={2}>
//           <div>
//             <strong>Departure Date</strong>
//           </div>
//           <div className="text-muted small">{formattedDate}</div>
//         </Col>

//         {/* Travellers */}
//         <Col xs={12} sm={6} md={2}>
//           <div>
//             <strong>Travellers</strong>
//           </div>
//           <div className="text-muted small">{totalPassengers}</div>
//         </Col>

//         {/* Travel Class */}
//         <Col xs={12} sm={6} md={2}>
//           <div>
//             <strong>Travel Class</strong>
//           </div>
//           <div className="text-muted small">
//             {cabinClassMap[cabinClass] || "Not selected"}
//           </div>
//         </Col>

//         {/* Modify Button */}
//         <Col xs={12} sm={12} md={1} className="text-center text-md-end">
//           <Button
//             onClick={Show}
//             className="btn btn-primary ModifyButton w-100 w-md-auto"
//           >
//             Modify
//           </Button>
//         </Col>
//       </Row>

//       {/* Modal */}
//       <Modal
//         size="xl"
//         dialogClassName="modal-200w"
//         show={showLoginModal}
//         onHide={() => setShowLoginModal(false)}
//         centered
//       >
//         <Modal.Header closeButton></Modal.Header>
//         <Modal.Body className="text-center">
//           <Slider type="resultPage" />
//         </Modal.Body>
//       </Modal>
//     </Container>
//   );
// };

// export default FlightSearchBar;
// bhsdgbsdk
import React, { useContext, useState } from "react";
import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import { LocationContext } from "../Context/LocationContext";
import "../../Style/Pagescss/FlightResultsPage.css";
import Slider from "../hero/Slider";
import { Link, useNavigate } from "react-router-dom";

const FlightSearchBar = () => {
  const { locationData } = useContext(LocationContext);
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const {
    fromCity = "",
    toCity = "",
    fromAirport = "",
    toAirport = "",
    departDate,
    passengers = { adults: 1, children: 0, infants: 0 },
    cabinClass = "",
  } = locationData || {};

  const totalPassengers =
    passengers.adults + passengers.children + passengers.infants;

  // Format departure date
  let formattedDate = "Not selected";
  if (departDate?.PreferredTime) {
    const jsDate = new Date(departDate.PreferredTime);
    if (!isNaN(jsDate.getTime())) {
      formattedDate =
        jsDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        ", " +
        jsDate.toLocaleDateString("en-GB", {
          weekday: "long",
        });
    }
  }

  // Cabin class map for showing name instead of number
  const cabinClassMap = {
    1: "Economy",
    2: "Premium Economy",
    4: "Business",
    5: "First",
  };

  const Show = () => {
    setShowLoginModal(true);
  };

  return (
    <Container className="mt-8 mb-5 p-3 bg-white shadow-sm rounded border flight-search-container">
      {/* Mobile Layout */}
      <div className="d-block d-lg-none">
        {/* Route Section */}
        <Row className="mb-3 route-section">
          <Col xs={5} className="text-start route-col">
            <div className="flight-location">
              <strong className="airport-code">{fromAirport}</strong>
              <div className="city-name text-muted small">{fromCity}</div>
            </div>
          </Col>

          <Col xs={2} className="text-center arrow-col">
            <div className="flight-arrow">→</div>
          </Col>

          <Col xs={5} className="text-end route-col">
            <div className="flight-location">
              <strong className="airport-code">{toAirport}</strong>
              <div className="city-name text-muted small">{toCity}</div>
            </div>
          </Col>
        </Row>

        {/* Details Section - 2x2 Grid */}
        <Row className="mb-3">
          <Col xs={6} className="mb-2">
            <div className="flight-detail-mobile">
              <div className="detail-label">
                <strong>Departure</strong>
              </div>
              <div className="detail-value text-muted small">
                {formattedDate}
              </div>
            </div>
          </Col>

          <Col xs={6} className="mb-2">
            <div className="flight-detail-mobile">
              <div className="detail-label">
                <strong>Travellers</strong>
              </div>
              <div className="detail-value text-muted small">
                {totalPassengers}
              </div>
            </div>
          </Col>

          <Col xs={6}>
            <div className="flight-detail-mobile">
              <div className="detail-label">
                <strong>Class</strong>
              </div>
              <div className="detail-value text-muted small">
                {cabinClassMap[cabinClass] || "Not selected"}
              </div>
            </div>
          </Col>

          {/* <Col xs={6} className="d-flex align-items-end justify-content-end">
            <button
              onClick={Show}
              className="btn btn-primary btn-sm w-100 ModifyButton"
            >
              Modify
            </button>
          </Col> */}
        </Row>
      </div>

      {/* Desktop Layout */}
      <div className="d-none d-lg-block">
        <Row className="align-items-center">
          <Col lg={2}>
            <div className="flight-location">
              <strong className="airport-code">{fromAirport}</strong>
              <div className="city-name text-muted small">{fromCity}</div>
            </div>
          </Col>

          <Col lg={1} className="text-center">
            <div className="flight-arrow">→</div>
          </Col>

          <Col lg={2}>
            <div className="flight-location">
              <strong className="airport-code">{toAirport}</strong>
              <div className="city-name text-muted small">{toCity}</div>
            </div>
          </Col>

          <Col lg={2}>
            <div className="flight-detail">
              <div className="detail-label">
                <strong>Departure Date</strong>
              </div>
              <div className="detail-value text-muted small">
                {formattedDate}
              </div>
            </div>
          </Col>

          <Col lg={2}>
            <div className="flight-detail">
              <div className="detail-label">
                <strong>Travellers</strong>
              </div>
              <div className="detail-value text-muted small">
                {totalPassengers}
              </div>
            </div>
          </Col>

          <Col lg={2}>
            <div className="flight-detail">
              <div className="detail-label">
                <strong>Travel Class</strong>
              </div>
              <div className="detail-value text-muted small">
                {cabinClassMap[cabinClass] || "Not selected"}
              </div>
            </div>
          </Col>

          {/* <Col lg={1} className="text-end">
            <button onClick={Show} className="btn btn-primary ModifyButton">
              Modify
            </button>
          </Col> */}
        </Row>
      </div>

      <Modal
        size="xl"
        dialogClassName="modal-200w"
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        centered
      >
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body className="text-center">
          <Slider type="resultPage" />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default FlightSearchBar;
