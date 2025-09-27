// import React, { useState, useEffect, useContext } from "react";
// import { Form, Row, Col } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "../../Style/FlightBooking.css"; // Your custom styles
// import { LocationContext } from "../Context/LocationContext";

// const FareTypeSelector = ({ onDataChange }) => {
//   const [selectedFare, setSelectedFare] = useState("regular");
//   const [isNonStop, setIsNonStop] = useState(false);
//   const { locationData, setLocationData } = useContext(LocationContext);

//   useEffect(() => {
//     if (!locationData.directflight) {
//       setLocationData((prev) => ({
//         ...prev,
//         directflight: isNonStop,
//       }));
//     }
//   }, [selectedFare, isNonStop]);
//   return (
//     <div className="fare-type-container p-3 ">
//       <Row className="align-items-center flex-wrap ">
//         <Col xs="auto">
//           <strong>Select A Fare Type</strong>
//         </Col>

//         <Col xs="auto">
//           <Form.Check
//             type="checkbox"
//             label="Non-Stop"
//             checked={isNonStop}
//             onChange={() => setIsNonStop(!isNonStop)}
//           />
//         </Col>

//         {[
//           { value: "regular", label: "Regular Fare" },
//           { value: "student", label: "Student Fares" },
//           { value: "marine", label: "Marine Fares" },
//           { value: "senior", label: "Senior Citizen" },
//           { value: "armed", label: "Armed Forces" },
//         ].map(({ value, label }) => (
//           <Col xs="auto" key={value}>
//             <Form.Check
//               type="radio"
//               label={label}
//               name="fare"
//               id={value}
//               checked={selectedFare === value}
//               onChange={() => setSelectedFare(value)}
//             />
//           </Col>
//         ))}
//       </Row>
//     </div>
//   );
// };

// export default FareTypeSelector;

import React, { useState, useEffect, useContext } from "react";
import { Form, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Style/FlightBooking.css";
import { LocationContext } from "../Context/LocationContext";

const FareTypeSelector = ({ onDataChange }) => {
  const [selectedFare, setSelectedFare] = useState("regular");
  const [isNonStop, setIsNonStop] = useState(false);
  const { locationData, setLocationData } = useContext(LocationContext);

  useEffect(() => {
    if (!locationData.directflight) {
      setLocationData((prev) => ({
        ...prev,
        directflight: isNonStop,
      }));
    }
  }, [selectedFare, isNonStop]);

  return (
    // <div className="fare-type-container p-2">
    //   <div className="fare-flex d-flex align-items-center flex-nowrap gap-3">
    //     <span className="fw-bold small text-dark text-nowrap">
    //       Select A Fare Type:
    //     </span>

    //     <Form.Check
    //       type="checkbox"
    //       label="Non-Stop"
    //       checked={isNonStop}
    //       onChange={() => setIsNonStop(!isNonStop)}
    //     />

    //     {[
    //       { value: "regular", label: "Regular Fare" },
    //       { value: "student", label: "Student Fares" },
    //       { value: "marine", label: "Marine Fares" },
    //       { value: "senior", label: "Senior Citizen" },
    //       { value: "armed", label: "Armed Forces" },
    //     ].map(({ value, label }) => (
    //       <Form.Check
    //         key={value}
    //         type="radio"
    //         label={label}
    //         name="fare"
    //         id={value}
    //         checked={selectedFare === value}
    //         onChange={() => setSelectedFare(value)}
    //       />
    //     ))}
    //   </div>
    // </div>
    <div className="fare-type-container p-2">
      {/* Heading */}
      <div className="fw-bold small text-dark mb-2 text-start">
        Select A Fare Type:
      </div>

      {/* Scrollable fare options */}
      <div
        className="fare-scroll d-flex gap-3 overflow-auto pb-2"
        style={{
          whiteSpace: "nowrap",
          msOverflowStyle: "none", // IE aur Edge ke liye
          scrollbarWidth: "none", // Firefox ke liye
        }}
      >
        <style>
          {`
      .fare-scroll::-webkit-scrollbar {
        display: none; /* Chrome, Safari */
      }
    `}
        </style>
        <Form.Check
          type="checkbox"
          label="Non-Stop"
          checked={isNonStop}
          onChange={() => setIsNonStop(!isNonStop)}
        />

        {[
          { value: "regular", label: "Regular Fare" },
          { value: "student", label: "Student Fares" },
          { value: "marine", label: "Marine Fares" },
          { value: "senior", label: "Senior Citizen" },
          { value: "armed", label: "Armed Forces" },
        ].map(({ value, label }) => (
          <Form.Check
            key={value}
            type="radio"
            label={label}
            name="fare"
            id={value}
            checked={selectedFare === value}
            onChange={() => setSelectedFare(value)}
          />
        ))}
      </div>
    </div>
  );
};

export default FareTypeSelector;
