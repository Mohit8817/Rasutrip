// import React from "react";
// import { Container, Row, Col, Card } from "react-bootstrap";
// import { FaHotel, FaBus } from "react-icons/fa";
// import "../../Style/FlightRoutes.css";

// import flightsbook from "../../assest/flightsbook.svg";
// import Hotels from "../../assest/Hotels.svg";
// import buss from "../../assest/buss.svg";
// // import taxi from "../../assest/taxi.svg";
// // import driver from "../../assest/driver.png";
// import "../../Style/FlightBooking.css"; // Adjust path to your CSS

// const TravelTabs = ({ activeTab, setActiveTab }) => {
//   const handleTabClick = (tabName) => {
//     setActiveTab(tabName);
//   };

//   return (
//     <Container>
//       <Row className="justify-content-start justify-content-md-center">
//         <Col xs={4} md={2}>
//           <Card
//             className={`text-center tab-box ${
//               activeTab === "bus" ? "active-tab" : ""
//             }`}
//             onClick={() => handleTabClick("bus")}
//           >
//             <Card.Body className="d-flex flex-column align-items-center justify-content-center">
//               <img
//                 src={buss}
//                 alt="Flight"
//                 style={{ width: "40px", height: "40px" }}
//               />
//               <Card.Text className="mt-2 mb-0">Bus</Card.Text>
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col xs={4} md={2}>
//           <Card
//             className={`text-center tab-box ${
//               activeTab === "flight" ? "active-tab" : ""
//             }`}
//             onClick={() => handleTabClick("flight")}
//           >
//             <Card.Body className="d-flex flex-column align-items-center justify-content-center">
//               {/* <FaPlane size={30} /> */}
//               <img
//                 src={flightsbook}
//                 alt="Flight"
//                 style={{ width: "40px", height: "40px" }}
//               />

//               <Card.Text className="mt-2 mb-0">Flight</Card.Text>
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col xs={4} md={2}>
//           <Card
//             className={`text-center tab-box ${
//               activeTab === "hotel" ? "active-tab" : ""
//             }`}
//             onClick={() => handleTabClick("hotel")}
//           >
//             <Card.Body className="d-flex flex-column align-items-center justify-content-center">
//               {/* <FaHotel size={30} /> */}
//               <img
//                 src={Hotels}
//                 alt="Flight"
//                 style={{ width: "40px", height: "40px" }}
//               />
//               <Card.Text className="mt-2 mb-0">Hotel</Card.Text>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default TravelTabs;
import React, { useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import "../../Style/FlightRoutes.css";

import flightsbook from "../../assest/flightsbook.svg";
import Hotels from "../../assest/Hotels.svg";
import buss from "../../assest/buss.svg";
import "../../Style/FlightBooking.css";

const TravelTabs = ({ activeTab, setActiveTab }) => {
  const location = useLocation();

  // ✅ URL से tab ऑटो सेट करने के लिए
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromURL = params.get("tab");

    if (tabFromURL) {
      setActiveTab(tabFromURL);
    }
  }, [location.search, setActiveTab]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <Container>
      <Row className="justify-content-start justify-content-md-center">
        <Col xs={4} md={2}>
          <Card
            className={`text-center tab-box ${
              activeTab === "bus" ? "active-tab" : ""
            }`}
            onClick={() => handleTabClick("bus")}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <img
                src={buss}
                alt="Bus"
                style={{ width: "40px", height: "40px" }}
              />
              <Card.Text className="mt-2 mb-0">Bus</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={4} md={2}>
          <Card
            className={`text-center tab-box ${
              activeTab === "flight" ? "active-tab" : ""
            }`}
            onClick={() => handleTabClick("flight")}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <img
                src={flightsbook}
                alt="Flight"
                style={{ width: "40px", height: "40px" }}
              />
              <Card.Text className="mt-2 mb-0">Flight</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={4} md={2}>
          <Card
            className={`text-center tab-box ${
              activeTab === "hotel" ? "active-tab" : ""
            }`}
            onClick={() => handleTabClick("hotel")}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <img
                src={Hotels}
                alt="Hotel"
                style={{ width: "40px", height: "40px" }}
              />
              <Card.Text className="mt-2 mb-0">Hotel</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TravelTabs;
