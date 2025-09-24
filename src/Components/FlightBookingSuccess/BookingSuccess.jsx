// 'use client'
// import React, { useState, useEffect } from "react";
// import { useLocation } from 'react-router-dom';
// import { post } from "../APIS/FlightApi/FlightApi";
// import { useNavigate } from "react-router-dom";


// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Badge,
//   Alert,
//   Table,
//   ListGroup,
//   ProgressBar
// } from 'react-bootstrap';

// const BookingSuccess = () => {

//   const location = useLocation();
//   const navigate = useNavigate();
//   const { bookingId, result } = location.state || {};
//   const [showAlert, setShowAlert] = useState(true);
//   const [invoice, setInvoice] = useState(null);
//   const [progress, setProgress] = useState(0);
//   const bookingData = result.onward


//   useEffect(() => {
//     // Animate progress bar
//     const timer = setInterval(() => {
//       setProgress(prev => {
//         if (prev >= 100) {
//           clearInterval(timer);
//           return 100;
//         }
//         return prev + 10;
//       });
//     }, 100);

//     return () => clearInterval(timer);
//   }, []);


//   const sendInvoiceRequest = async () => {
//     let RetrunResponse = null;
//     try {
//       const data = {
//         UserIp: result.onward.UserIp,
//         SearchTokenId: result?.onward?.SearchTokenId,
//         BookingId: result?.onward?.bookingId,
//         receiverEmail: result?.onward?.result?.Passenger[0]?.Email,
//       }
//       const response = await post(data, "/airservice/invoice");

//       if (result?.return) {
//         const data = {
//           UserIp: result.return.UserIp,
//           SearchTokenId: result?.return?.SearchTokenId,
//           BookingId: result?.return?.bookingId,
//           receiverEmail: result?.onward?.result?.Passenger[0]?.Email,
//         }
//         RetrunResponse = await post(data, "/airservice/invoice");

//       }
//       setInvoice({response,RetrunResponse});
//     } catch (error) {
//       console.error("Invoice API error:", error);
//     }
//   };



//  // Invoice request dono ke liye already ho raha hai (response + RetrunResponse)

// // Send Invoice (onward ya return choose)
// const sendInvoice = async (type = "onward") => {
//   try {
//     let finalInvoice = invoice;
//     if (!invoice) {
//       await sendInvoiceRequest();
//       finalInvoice = invoice;
//     }

//     // agar onward select hai
//     let selectedInvoice =
//       type === "onward" ? finalInvoice.response : finalInvoice.RetrunResponse;

//     navigate("/booking/invoice", {
//       state: { Jtype: "flight", invoice: selectedInvoice },
//     });
//   } catch (error) {
//     console.error("Invoice API error:", error);
//   }
// };

// // Send E-Ticket (onward ya return choose)
// const sendInETicket = async (type = "onward") => {
//   try {
//     let finalInvoice = invoice;
//     if (!invoice) {
//       await sendInvoiceRequest();
//       finalInvoice = invoice;
//     }

//     let selectedInvoice =
//       type === "onward" ? finalInvoice.response : finalInvoice.RetrunResponse;

//     navigate("/booking/e-ticket", {
//       state: { Jtype: "flight", invoice: selectedInvoice },
//     });
//   } catch (error) {
//     console.error("E-Ticket API error:", error);
//   }
// };



//   // Call invoice API on load
//   useEffect(() => {
//     if (result && !invoice) {
//       sendInvoiceRequest();
//     }
//   }, [result, invoice]);

//   if (result.lenght < 0) {
//     return <div className="text-center text-red-500 mt-10">Invalid booking data</div>;
//   }
//   const handleDownload = (type) => {
//     const url = `https://yourdomain.com/api/${type}-download/${bookingData.bookingId}`;
//     window.open(url, "_blank");
//   };

//   const formatTime = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleTimeString('en-IN', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const segment = bookingData.result?.Segments[0][0];
//   const passenger = bookingData.result?.Passenger[0];


//   return (
//     <div style={{
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       minHeight: '100vh',
//       paddingTop: '2rem',
//       paddingBottom: '2rem',
//       marginTop: '100px'
//     }}>
//       <Container>
//         {/* Success Header */}
//         <Row className="justify-content-center mt-10 mb-4">
//           <Col md={8} className="text-center">
//             {showAlert && (
//               <Alert
//                 variant="success"
//                 dismissible
//                 onClose={() => setShowAlert(false)}
//                 className="shadow-lg border-0"
//               >
//                 <Alert.Heading>
//                   <span style={{ fontSize: '2rem' }}>🎉</span> Booking Confirmed!
//                 </Alert.Heading>
//                 <p className="mb-2">Your flight has been successfully booked</p>
//                 <Badge bg="success" className="p-2">
//                   Booking ID: {bookingData.bookingId}
//                 </Badge>
//               </Alert>
//             )}

//             <Card className="border-0 shadow-lg bg-white">
//               <Card.Body className="p-4">
//                 <h2 className="text-success mb-3">
//                   <i className="fas fa-check-circle me-2"></i>
//                   Payment Successful
//                 </h2>
//                 <ProgressBar
//                   now={progress}
//                   variant="success"
//                   striped
//                   animated
//                   className="mb-3"
//                 />
//                 <p className="text-muted">Processing complete</p>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>

//         {/* Flight Information */}
//         <Row className="mb-4">
//           <Col>
//             <Card className="border-0 shadow-lg">
//               <Card.Header className="bg-primary text-white">
//                 <h4 className="mb-0">
//                   <i className="fas fa-plane me-2"></i>
//                   Flight Information
//                 </h4>
//               </Card.Header>
//               <Card.Body className="p-4">
//                 <Row className="text-center mb-4">
//                   <Col md={4}>
//                     <div className="border-end">
//                       <h3 className="text-primary">{segment?.Origin?.CityName}</h3>
//                       <p className="mb-1 fw-bold">{formatTime(segment?.Origin?.DepartTime)}</p>
//                       <small className="text-muted">{segment?.Origin?.AirportName}</small><br />
//                       <Badge bg="info">Terminal {segment?.Origin?.Terminal}</Badge>
//                     </div>
//                   </Col>
//                   <Col md={4}>
//                     <div className="border-end">
//                       <div className="mb-2">
//                         <i className="fas fa-plane text-primary" style={{ fontSize: '2rem' }}></i>
//                       </div>
//                       <p className="mb-1 fw-bold">{Math.floor(segment?.Duration / 60)}h {segment?.Duration % 60}m</p>
//                       <small className="text-success">Direct Flight</small>
//                     </div>
//                   </Col>
//                   <Col md={4}>
//                     <h3 className="text-primary">{segment?.Destination?.CityName}</h3>
//                     <p className="mb-1 fw-bold">{formatTime(segment?.Destination?.ArrivalTime)}</p>
//                     <small className="text-muted">{segment?.Destination?.AirportName}</small><br />
//                     <Badge bg="info">Terminal {segment?.Destination?.Terminal}</Badge>
//                   </Col>
//                 </Row>

//                 <Row>
//                   <Col md={4}>
//                     <Card className="bg-light border-0 h-100">
//                       <Card.Body className="text-center">
//                         <h6 className="text-muted">Airline</h6>
//                         <p className="fw-bold mb-1">{segment?.Airline?.AirlineName}</p>
//                         <small>{segment?.Airline?.AirlineCode} {segment?.Airline?.FlightNumber}</small>
//                       </Card.Body>
//                     </Card>
//                   </Col>
//                   <Col md={4}>
//                     <Card className="bg-light border-0 h-100">
//                       <Card.Body className="text-center">
//                         <h6 className="text-muted">Date</h6>
//                         <p className="fw-bold">{formatDate(segment?.Origin?.DepartTime)}</p>
//                       </Card.Body>
//                     </Card>
//                   </Col>
//                   <Col md={4}>
//                     <Card className="bg-light border-0 h-100">
//                       <Card.Body className="text-center">
//                         <h6 className="text-muted">PNR</h6>
//                         <p className="fw-bold fs-5 text-primary">{bookingData?.result?.PNR}</p>
//                       </Card.Body>
//                     </Card>
//                   </Col>

//                 </Row>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>

//         {/* Passenger and Price Details */}
//         <Row className="mb-4">
//           <Col md={12}>
//             <Card className="border-0 shadow-lg h-100">
//               <Card.Header className="bg-info text-white">
//                 <h5 className="mb-0">
//                   <i className="fas fa-user me-2"></i>
//                   Passenger Details
//                 </h5>
//               </Card.Header>
//               <Card.Body>
//                 <Table striped bordered hover responsive>
//                   <thead>
//                     <tr>
//                       <th>#</th>
//                       <th>Name</th>
//                       <th>Email</th>
//                       <th>Phone</th>
//                       <th>PNR</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {bookingData.result?.Passenger?.map((passenger1, index) => (
//                       <tr key={index}>
//                         <td>{index + 1}</td>
//                         <td>{passenger1?.Title} {passenger1?.FirstName} {passenger1?.LastName}</td>
//                         <td className="text-break">{passenger1?.Email}</td>
//                         <td>{passenger1?.ContactNo}</td>
//                         {index == 0 ? (
//                           <>
//                             <td> {bookingData.result?.PNR}</td>
//                           </>
//                         ) : (
//                           <>
//                             <td>--</td>
//                           </>
//                         )}


//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>

//         {/* Important Information */}
//         <Row className="mb-4">
//           <Col>
//             <Card className="border-0 shadow-lg bg-warning text-dark">
//               <Card.Body>
//                 <h5 className="mb-3">
//                   <i className="fas fa-info-circle me-2"></i>
//                   Important Information
//                 </h5>
//                 <Row>
//                   <Col md={6}>
//                     <p className="mb-2">
//                       <strong>Check-in:</strong> Online check-in opens 24 hours before departure
//                     </p>
//                     <p className="mb-2">
//                       <strong>Baggage:</strong> {segment?.CabinBaggage} cabin baggage included
//                     </p>
//                   </Col>
//                   <Col md={6}>
//                     <p className="mb-2">
//                       <strong>Arrival:</strong> Please arrive 2 hours before domestic flights
//                     </p>
//                     <p className="mb-2">
//                       <strong>Documents:</strong> Valid government ID required for travel
//                     </p>
//                   </Col>
//                 </Row>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>

//         {/* Download Section */}
//         <Row className="mb-4">
//           <Col>
//             <Card className="border-0 shadow-lg">
//               <Card.Body className="text-center p-4">
//                 <h4 className="mb-4">Download Your Documents</h4>
//                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
//   {/* Onward Invoice */}
//   <Button
//     variant="primary"
//     size="lg"
//     onClick={() => sendInvoice("onward")}
//     className="me-md-2 mb-2 mb-md-0"
//   >
//     <i className="fas fa-download me-2"></i>
//     Onward Invoice
//   </Button>

//   {/* Return Invoice */}
//   {result?.return && (
//     <Button
//       variant="primary"
//       size="lg"
//       onClick={() => sendInvoice("return")}
//       className="me-md-2 mb-2 mb-md-0"
//     >
//       <i className="fas fa-download me-2"></i>
//       Return Invoice
//     </Button>
//   )}

//   {/* Onward E-Ticket */}
//   <Button
//     variant="success"
//     size="lg"
//     onClick={() => sendInETicket("onward")}
//     className="me-md-2 mb-2 mb-md-0"
//   >
//     <i className="fas fa-download me-2"></i>
//     Onward E-Ticket
//   </Button>

//   {/* Return E-Ticket */}
//   {result?.return && (
//     <Button
//       variant="success"
//       size="lg"
//       onClick={() => sendInETicket("return")}
//       className="me-md-2 mb-2 mb-md-0"
//     >
//       <i className="fas fa-download me-2"></i>
//       Return E-Ticket
//     </Button>
//   )}
// </div>

//                 {/* <p className="text-muted mt-3 mb-0">
//                   <small>
//                     Invoice No: <strong>{bookingData?.result?.InvoiceNo}</strong> • Keep these documents for your records
//                   </small>
//                 </p> */}
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>

//         {/* Footer */}
//         <Row>
//           <Col className="text-center">
//             <Card className="border-0 bg-transparent text-white">
//               <Card.Body>
//                 <h5>Have a wonderful journey! ✈️</h5>
//                 <p className="mb-0">
//                   For any queries, please contact customer support with your PNR:
//                   <Badge bg="light" text="dark" className="ms-2">{bookingData?.result?.PNR}</Badge>
//                 </p>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       </Container>

//       {/* Custom CSS for additional styling */}
//       <style jsx>{`
//         .card {
//           transition: transform 0.2s ease-in-out;
//         }
//         .card:hover {
//           transform: translateY(-2px);
//         }
//         .btn {
//           transition: all 0.2s ease-in-out;
//         }
//         .btn:hover {
//           transform: translateY(-1px);
//           box-shadow: 0 4px 8px rgba(0,0,0,0.2);
//         }
//         .alert {
//           animation: slideDown 0.5s ease-out;
//         }
//         @keyframes slideDown {
//           from {
//             opacity: 0;
//             transform: translateY(-30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default BookingSuccess;

'use client'
import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Table,
  ProgressBar
} from 'react-bootstrap';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, result } = location.state || {};
  const [showAlert, setShowAlert] = useState(true);
  const [progress, setProgress] = useState(0);
  const bookingData = result.onward;

  // Base URL for API
  const baseURL = 'https://api.rasutrip.com/api/v1';

  useEffect(() => {
    // Animate progress bar
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Download Invoice function
  const downloadInvoice = (type = "onward") => {
    const bookingIdToUse = type === "onward" ? 
      result?.onward?.bookingId : 
      result?.return?.bookingId;
    
    if (bookingIdToUse) {
      const url = `${baseURL}/airservice/download/invoice/flight/${bookingIdToUse}`;
      window.open(url, "_blank");
    }
  };

  // Download E-Ticket function
  const downloadETicket = (type = "onward") => {
    const bookingIdToUse = type === "onward" ? 
      result?.onward?.bookingId : 
      result?.return?.bookingId;
    
    if (bookingIdToUse) {
      const url = `${baseURL}/airservice/download/e-ticket/flight/${bookingIdToUse}`;
      window.open(url, "_blank");
    }
  };

  if (result.length < 0) {
    return <div className="text-center text-red-500 mt-10">Invalid booking data</div>;
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const segment = bookingData.result?.Segments[0][0];
  const passenger = bookingData.result?.Passenger[0];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      paddingTop: '2rem',
      paddingBottom: '2rem',
      marginTop: '100px'
    }}>
      <Container>
        {/* Success Header */}
        <Row className="justify-content-center mt-10 mb-4">
          <Col md={8} className="text-center">
            {showAlert && (
              <Alert
                variant="success"
                dismissible
                onClose={() => setShowAlert(false)}
                className="shadow-lg border-0"
              >
                <Alert.Heading>
                  <span style={{ fontSize: '2rem' }}>🎉</span> Booking Confirmed!
                </Alert.Heading>
                <p className="mb-2">Your flight has been successfully booked</p>
                <Badge bg="success" className="p-2">
                  Booking ID: {bookingData.bookingId}
                </Badge>
              </Alert>
            )}

            <Card className="border-0 shadow-lg bg-white">
              <Card.Body className="p-4">
                <h2 className="text-success mb-3">
                  <i className="fas fa-check-circle me-2"></i>
                  Payment Successful
                </h2>
                <ProgressBar
                  now={progress}
                  variant="success"
                  striped
                  animated
                  className="mb-3"
                />
                <p className="text-muted">Processing complete</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Flight Information */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-lg">
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">
                  <i className="fas fa-plane me-2"></i>
                  Flight Information
                </h4>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="text-center mb-4">
                  <Col md={4}>
                    <div className="border-end">
                      <h3 className="text-primary">{segment?.Origin?.CityName}</h3>
                      <p className="mb-1 fw-bold">{formatTime(segment?.Origin?.DepartTime)}</p>
                      <small className="text-muted">{segment?.Origin?.AirportName}</small><br />
                      <Badge bg="info">Terminal {segment?.Origin?.Terminal}</Badge>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="border-end">
                      <div className="mb-2">
                        <i className="fas fa-plane text-primary" style={{ fontSize: '2rem' }}></i>
                      </div>
                      <p className="mb-1 fw-bold">{Math.floor(segment?.Duration / 60)}h {segment?.Duration % 60}m</p>
                      <small className="text-success">Direct Flight</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <h3 className="text-primary">{segment?.Destination?.CityName}</h3>
                    <p className="mb-1 fw-bold">{formatTime(segment?.Destination?.ArrivalTime)}</p>
                    <small className="text-muted">{segment?.Destination?.AirportName}</small><br />
                    <Badge bg="info">Terminal {segment?.Destination?.Terminal}</Badge>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Card className="bg-light border-0 h-100">
                      <Card.Body className="text-center">
                        <h6 className="text-muted">Airline</h6>
                        <p className="fw-bold mb-1">{segment?.Airline?.AirlineName}</p>
                        <small>{segment?.Airline?.AirlineCode} {segment?.Airline?.FlightNumber}</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="bg-light border-0 h-100">
                      <Card.Body className="text-center">
                        <h6 className="text-muted">Date</h6>
                        <p className="fw-bold">{formatDate(segment?.Origin?.DepartTime)}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="bg-light border-0 h-100">
                      <Card.Body className="text-center">
                        <h6 className="text-muted">PNR</h6>
                        <p className="fw-bold fs-5 text-primary">{bookingData?.result?.PNR}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Passenger and Price Details */}
        <Row className="mb-4">
          <Col md={12}>
            <Card className="border-0 shadow-lg h-100">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">
                  <i className="fas fa-user me-2"></i>
                  Passenger Details
                </h5>
              </Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>PNR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingData.result?.Passenger?.map((passenger1, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{passenger1?.Title} {passenger1?.FirstName} {passenger1?.LastName}</td>
                        <td className="text-break">{passenger1?.Email}</td>
                        <td>{passenger1?.ContactNo}</td>
                        {index == 0 ? (
                          <>
                            <td> {bookingData.result?.PNR}</td>
                          </>
                        ) : (
                          <>
                            <td>--</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Important Information */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-lg bg-warning text-dark">
              <Card.Body>
                <h5 className="mb-3">
                  <i className="fas fa-info-circle me-2"></i>
                  Important Information
                </h5>
                <Row>
                  <Col md={6}>
                    <p className="mb-2">
                      <strong>Check-in:</strong> Online check-in opens 24 hours before departure
                    </p>
                    <p className="mb-2">
                      <strong>Baggage:</strong> {segment?.CabinBaggage} cabin baggage included
                    </p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-2">
                      <strong>Arrival:</strong> Please arrive 2 hours before domestic flights
                    </p>
                    <p className="mb-2">
                      <strong>Documents:</strong> Valid government ID required for travel
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Download Section */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-lg">
              <Card.Body className="text-center p-4">
                <h4 className="mb-4">Download Your Documents</h4>
                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  {/* Onward Invoice */}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => downloadInvoice("onward")}
                    className="me-md-2 mb-2 mb-md-0"
                  >
                    <i className="fas fa-download me-2"></i>
                    Onward Invoice
                  </Button>

                  {/* Return Invoice */}
                  {result?.return && (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => downloadInvoice("return")}
                      className="me-md-2 mb-2 mb-md-0"
                    >
                      <i className="fas fa-download me-2"></i>
                      Return Invoice
                    </Button>
                  )}

                  {/* Onward E-Ticket */}
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => downloadETicket("onward")}
                    className="me-md-2 mb-2 mb-md-0"
                  >
                    <i className="fas fa-download me-2"></i>
                    Onward E-Ticket
                  </Button>

                  {/* Return E-Ticket */}
                  {result?.return && (
                    <Button
                      variant="success"
                      size="lg"
                      onClick={() => downloadETicket("return")}
                      className="me-md-2 mb-2 mb-md-0"
                    >
                      <i className="fas fa-download me-2"></i>
                      Return E-Ticket
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Footer */}
        <Row>
          <Col className="text-center">
            <Card className="border-0 bg-transparent text-white">
              <Card.Body>
                <h5>Have a wonderful journey! ✈️</h5>
                <p className="mb-0">
                  For any queries, please contact customer support with your PNR:
                  <Badge bg="light" text="dark" className="ms-2">{bookingData?.result?.PNR}</Badge>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Custom CSS for additional styling */}
      <style jsx>{`
        .card {
          transition: transform 0.2s ease-in-out;
        }
        .card:hover {
          transform: translateY(-2px);
        }
        .btn {
          transition: all 0.2s ease-in-out;
        }
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .alert {
          animation: slideDown 0.5s ease-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default BookingSuccess;