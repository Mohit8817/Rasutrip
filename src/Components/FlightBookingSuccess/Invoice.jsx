'use client'
import React, { useState,useEffect ,useRef} from 'react';
import { Container, Row, Col, Table, Card, Badge, Form, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

const InvoiceTemplate = ({ type = 'flight', invoiceData = {} }) => {
  // Sample data for demonstration
  const location = useLocation();
  const printRef = useRef();
  const { Jtype, invoice } = location.state || {};
  console.log('invoice', invoice)
  const sampleFlightData = invoice

  useEffect(() => {
    if (printRef.current) {
      setTimeout(() => {
        window.print();
      }, 500); // 500ms delay to ensure page renders
    }
  }, []);

  const sampleHotelData = {
    invoiceNumber: 'INV-HTL-001',
    invoiceDate: '2025-07-27',
    bookingId: 'BK-HTL-12345',
    hotelName: 'Grand Hotel',
    destination: 'Goa',
    invoiceTotal: 12000,
    lastCancellationDate: '2025-08-01T12:00:00',
    supplierDetails: {
      name: 'RasuTrip Pvt Ltd',
      mobile: '+91-9876543210',
      email: 'contact@rasutrip.com',
      pan: 'ABCDE1234F',
      state: 'Delhi'
    },
    receiverDetails: {
      name: 'Jane Smith',
      phone: '+91-9876543210'
    },
    Result: {
      BookingStatus: 'Confirmed',
      CheckInDate: '2025-08-05',
      CheckOutDate: '2025-08-07',
      NoOfNights: 2,
      NoOfRooms: 1,
      AddressLine1: '123 Beach Road, Goa',
      StarRating: 4,
      HotelPolicyDetail: 'Standard hotel policies apply',
      HotelRoomsDetails: [
        {
          RoomTypeName: 'Deluxe Room',
          RatePlanName: 'Breakfast Included',
          RoomDescription: 'Spacious room with sea view',
          SmokingPreference: 'Non-Smoking',
          Amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'],
          Price: {
            RoomPrice: 5000,
            Tax: 900,
            PublishedPrice: 5900
          },
          HotelPassenger: [
            {
              Title: 'Ms',
              FirstName: 'Jane',
              MiddleName: '',
              LastName: 'Smith',
              Phoneno: '+91-9876543210',
              Email: 'jane@email.com',
              PAN: 'FGHIJ5678K'
            }
          ],
          CancellationPolicies: [
            {
              Charge: 1000,
              FromDate: '2025-08-01T00:00:00',
              ToDate: '2025-08-04T23:59:59'
            }
          ]
        }
      ]
    },
    fareDetails: {
      baseFare: 10000,
      taxes: 1800,
      couponDiscount: 200,
      IGSTRate: 18
    }
  };

  const sampleBusData = {
    invoiceId: 'INV-BUS-001',
    invoiceDate: '2025-07-27',
    bookingId: 'BK-BUS-12345',
    TicketNo: 'BUS-TKT-001',
    source: 'Delhi',
    destination: 'Jaipur',
    departureTime: '2025-08-05T06:00:00',
    arrivalTime: '2025-08-05T12:00:00',
    busType: 'AC Sleeper',
    totalPayable: 1500,
    supplierDetails: {
      name: 'RasuTrip Pvt Ltd',
      mobile: '+91-9876543210',
      email: 'contact@rasutrip.com',
      pan: 'ABCDE1234F',
      state: 'Delhi'
    },
    receiverDetails: {
      name: 'Mike Johnson',
      phone: '+91-9876543210'
    },
    passenger: [
      {
        Title: 'Mr',
        FirstName: 'Mike',
        LastName: 'Johnson',
        Age: 30,
        SeatName: 'A1',
        Seat: {
          SeatFare: 1200
        }
      }
    ],
    fareDetails: {
      NoOfSeats: 1,
      baseFare: 1200,
      taxes: 216,
      serviceCharges: 84,
      couponDiscount: 0,
      IGSTRate: 18
    },
    boardingPointdetails: {
      CityPointName: 'ISBT Kashmere Gate',
      CityPointLocation: 'Near Gate No. 3',
      CityPointLandmark: 'ISBT Main Gate',
      CityPointTime: '2025-08-05T05:30:00',
      CityPointContactNumber: '+91-9876543210'
    },
    droppingPointdetails: [
      {
        CityPointName: 'Sindhi Camp Bus Stand',
        CityPointLocation: 'Platform 5',
        CityPointTime: '2025-08-05T12:00:00'
      }
    ]
  };

  const [selectedType, setSelectedType] = useState(type);

  // Use sample data if no invoice data provided
  const currentData = invoiceData && Object.keys(invoiceData).length > 0
    ? invoiceData
    : selectedType === 'flight'
      ? sampleFlightData
      : selectedType === 'hotel'
        ? sampleHotelData
        : sampleBusData;

  const getPassengerType = (type) => {
    switch (type) {
      case 1: return 'Adult';
      case 2: return 'Child';
      case 3: return 'Infant';
      default: return 'Unknown';
    }
  };

  const renderFlightInvoice = () => (
    <Container className="my-4">
      <Card>
        <Card.Body style={{ fontFamily: 'Arial, sans-serif' }}>
          <h2 className="text-center mb-4">Tax Invoice</h2>

          <Row className="mb-4">
            <Col md={6}>
              <div style={{ fontSize: '14px' }}>
                <strong>From:</strong> {currentData.supplierDetails.name}<br />
                <strong>Mobile:</strong> {currentData.supplierDetails.mobile}<br />
                <strong>Email:</strong> {currentData.supplierDetails.email}<br />
                <strong>PAN Number:</strong> {currentData.supplierDetails.pan}<br />
                <strong>State:</strong> {currentData.supplierDetails.state}
              </div>
            </Col>
            <Col md={6} className="text-end">
              <div style={{ fontSize: '14px' }}>
                <strong>Passenger Name:</strong> {currentData.receiverDetails.name}<br />
                <strong>Phone:</strong> {currentData.receiverDetails.phone}
              </div>
            </Col>
          </Row>

          <Table bordered size="sm" className="mb-4" style={{ fontSize: '14px' }}>
            <tbody>
              <tr>
                <td><strong>Invoice Number:</strong> {currentData.invoiceId}</td>
                <td><strong>Invoice Date:</strong> {currentData.invoiceDate}</td>
              </tr>
              <tr>
                <td><strong>Booking Reference number:</strong> {currentData.bookingId}</td>
                <td><strong>Booking Date:</strong> {currentData.invoiceDate}</td>
              </tr>
              <tr>
                <td>
                  <strong>Trip Type: </strong>{currentData.JourneyType == 1
                    ? 'One Way'
                    : currentData.JourneyType == 2
                      ? 'Round Trip'
                      : 'Multi City'}
                </td>
                <td><strong>GDS/Airline PNR:</strong> {currentData.PNR}</td>
              </tr>
            </tbody>
          </Table>

          <h3>PASSENGER DETAILS</h3>
          <div className=' overflow-x-auto '>
          <Table bordered  size="sm" className="mb-4 striped bordered hover" style={{ fontSize: '14px' }}>
            <thead>
              <tr>
                <th>Ticket No</th>
                <th>Sectors</th>
                <th>Passenger Name</th>
                <th>Type</th>
                <th>Fare</th>
                <th>Tax</th>
                <th>YQ Tax</th>
                <th>Service Charges</th>
                <th>Meal Charges</th>
                <th>Baggage Charges</th>
                <th>Seat Charges</th>
              </tr>
            </thead>
            <tbody>
              {currentData.passenger.map((p, index) => (
                <tr key={index}>
                  <td>{p.TicketNumber}</td>
                  <td>{currentData.source} - {currentData.destination}</td>
                  <td>{p.Title} {p.FirstName} {p.LastName}</td>
                  <td>{getPassengerType(p.PaxType)}</td>
                  <td>₹ {p.Fare.BaseFare}</td>
                  <td>₹ {p.Fare.Tax}</td>
                  <td>₹ {p.Fare.YQTax}</td>
                  <td>₹ {p.Fare.ServiceCharges}</td>
                  <td>₹ {p.Fare.MealCharges}</td>
                  <td>₹ {p.Fare.BaggageCharges}</td>
                  <td>₹ {p.Fare.SeatCharges}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          </div>

          <h3 className="mt-4">PAYMENT DETAILS</h3>
          <p style={{ fontSize: '14px', marginBottom: '10px' }}>
            <strong>This is an electronic ticket.</strong><br />
            Please carry a positive identification for check in.
          </p>
          <Table size="sm" style={{ fontSize: '14px', width: '50%' }}>
            <tbody>
              <tr><td><strong>Base Fare:</strong></td><td>₹ {currentData.fareDetails.baseFare}</td></tr>
              <tr><td><strong>Taxes:</strong></td><td>₹ {currentData.fareDetails.taxes}</td></tr>
              <tr><td><strong>Other & Service Charges:</strong></td><td>₹ {currentData.fareDetails.serviceCharges}</td></tr>
              <tr><td><strong>Meal Charges:</strong></td><td>₹ {currentData.fareDetails.mealCharges}</td></tr>
              <tr><td><strong>Baggage Charges:</strong></td><td>₹ {currentData.fareDetails.baggageCharges}</td></tr>
              <tr><td><strong>Seat Charges:</strong></td><td>₹ {currentData.fareDetails.seatCharges}</td></tr>
              <tr><td><strong>Discount (-):</strong></td><td>₹ {currentData.fareDetails.couponDiscount}</td></tr>
              <tr><td><strong>GST (+):</strong></td><td>₹ 0</td></tr>
              <tr><td><strong>Total Amount:</strong></td><td><strong>₹ {currentData.invoiceTotal}</strong></td></tr>
            </tbody>
          </Table>

          <h3 className="mt-4">TERMS & CONDITIONS</h3>
          <ul style={{ fontSize: '14px', paddingLeft: '20px' }}>
            <li>IMP : This is computer generated invoice signature not required</li>
            <li>IMP : All Cases & Disputes are subject to New Delhi Jurisdiction</li>
            <li>IMP : Refunds & Cancellations are subject to Airlines approval</li>
            <li>IMP : Service charges as included above are to be collected from the customers on our behalf</li>
            <li>IMP : Kindly check all details carefully to avoid un-necessary complications</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );

  const renderHotelInvoice = () => (
    <Container className="my-4">
      <Card>
        <Card.Body style={{ fontFamily: 'Arial, sans-serif' }}>
          <h2 className="text-center mb-4">Tax Invoice (Hotel Booking)</h2>

          <Row className="mb-4">
            <Col md={6}>
              <div style={{ fontSize: '14px' }}>
                <strong>From:</strong> {currentData.supplierDetails.name}<br />
                <strong>Mobile:</strong> {currentData.supplierDetails.mobile}<br />
                <strong>Email:</strong> {currentData.supplierDetails.email}<br />
                <strong>PAN:</strong> {currentData.supplierDetails.pan}<br />
                <strong>State:</strong> {currentData.supplierDetails.state}
              </div>
            </Col>
            <Col md={6} className="text-end">
              <div style={{ fontSize: '14px' }}>
                <strong>To:</strong> {currentData.receiverDetails.name}<br />
                <strong>Phone:</strong> {currentData.receiverDetails.phone}
              </div>
            </Col>
          </Row>

          <Table bordered size="sm" className="mb-4" style={{ fontSize: '14px' }}>
            <tbody>
              <tr>
                <td><strong>Invoice Number:</strong> {currentData.invoiceNumber}</td>
                <td><strong>Invoice Date:</strong> {new Date(currentData.invoiceDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td><strong>Booking ID:</strong> {currentData.bookingId}</td>
                <td><strong>Booking Status:</strong> <Badge bg="success">{currentData.Result.BookingStatus}</Badge></td>
              </tr>
              <tr>
                <td><strong>Check-In:</strong> {new Date(currentData.Result.CheckInDate).toLocaleDateString()}</td>
                <td><strong>Check-Out:</strong> {new Date(currentData.Result.CheckOutDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td><strong>No. of Nights:</strong> {currentData.Result.NoOfNights}</td>
                <td><strong>No. of Rooms:</strong> {currentData.Result.NoOfRooms}</td>
              </tr>
            </tbody>
          </Table>

          <h3>HOTEL DETAILS</h3>
          <Table size="sm" className="mb-4" style={{ fontSize: '14px' }}>
            <tbody>
              <tr><td><strong>Hotel Name:</strong></td><td>{currentData.hotelName}</td></tr>
              <tr><td><strong>Destination:</strong></td><td>{currentData.destination}</td></tr>
              <tr><td><strong>Address:</strong></td><td>{currentData.Result.AddressLine1}</td></tr>
              <tr><td><strong>Star Rating:</strong></td><td>{currentData.Result.StarRating} ⭐</td></tr>
              <tr><td><strong>Hotel Policy:</strong></td><td>{currentData.Result.HotelPolicyDetail}</td></tr>
            </tbody>
          </Table>

          {currentData.Result.HotelRoomsDetails.map((room, index) => (
            <div key={index}>
              <h4 className="mt-4">Room {index + 1} - {room.RoomTypeName}</h4>
              <Table size="sm" className="mb-3" style={{ fontSize: '14px' }}>
                <tbody>
                  <tr><td><strong>Rate Plan:</strong></td><td>{room.RatePlanName}</td></tr>
                  <tr><td><strong>Description:</strong></td><td>{room.RoomDescription}</td></tr>
                  <tr><td><strong>Smoking Preference:</strong></td><td>{room.SmokingPreference}</td></tr>
                  <tr><td><strong>Amenities:</strong></td><td>{room.Amenities?.join(', ') || 'N/A'}</td></tr>
                  <tr><td><strong>Room Fare:</strong></td><td>₹ {room.Price.RoomPrice}</td></tr>
                  <tr><td><strong>Taxes:</strong></td><td>₹ {room.Price.Tax}</td></tr>
                  <tr><td><strong>Published Price:</strong></td><td>₹ {room.Price.PublishedPrice}</td></tr>
                </tbody>
              </Table>

              <h5 className="mt-3">Guests in this Room:</h5>
              <Table bordered size="sm" className="mb-4" style={{ fontSize: '14px' }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>PAN</th>
                  </tr>
                </thead>
                <tbody>
                  {room.HotelPassenger.map((guest, gIndex) => (
                    <tr key={gIndex}>
                      <td>{gIndex + 1}</td>
                      <td>{guest.Title} {guest.FirstName} {guest.MiddleName || ''} {guest.LastName}</td>
                      <td>{guest.Phoneno}</td>
                      <td>{guest.Email}</td>
                      <td>{guest.PAN || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ))}

          <h3 className="mt-4">PAYMENT DETAILS</h3>
          <Table size="sm" style={{ fontSize: '14px', width: '50%' }}>
            <tbody>
              <tr><td><strong>Total Base Fare:</strong></td><td>₹ {currentData.fareDetails.baseFare}</td></tr>
              <tr><td><strong>Total Taxes:</strong></td><td>₹ {currentData.fareDetails.taxes}</td></tr>
              <tr><td><strong>Coupon Discount (-):</strong></td><td>₹ {currentData.fareDetails.couponDiscount}</td></tr>
              <tr><td><strong>IGST Rate:</strong></td><td>{currentData.fareDetails.IGSTRate}%</td></tr>
              <tr><td><strong>Total Payable:</strong></td><td><strong>₹ {currentData.invoiceTotal}</strong></td></tr>
            </tbody>
          </Table>

          <h3 className="mt-4">CANCELLATION POLICY</h3>
          <p style={{ fontSize: '14px' }}>Last Cancellation Date: {new Date(currentData.lastCancellationDate).toLocaleString()}</p>
          <ul style={{ fontSize: '14px' }}>
            {currentData.Result.HotelRoomsDetails[0].CancellationPolicies.map((policy, index) => (
              <li key={index}>
                ₹ {policy.Charge} will be charged if cancelled between {new Date(policy.FromDate).toLocaleString()} and {new Date(policy.ToDate).toLocaleString()}
              </li>
            ))}
          </ul>

          <h3 className="mt-4">TERMS & CONDITIONS</h3>
          <ul style={{ fontSize: '14px', paddingLeft: '20px' }}>
            <li>This is a computer-generated invoice. No signature is required.</li>
            <li>All disputes are subject to the jurisdiction of New Delhi.</li>
            <li>Guests must present valid ID proof (Passport/Voter ID/Aadhar).</li>
            <li>Hotel rules and cancellation policies apply.</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );

  const renderBusInvoice = () => (
    <Container className="my-4">
      <Card>
        <Card.Body style={{ fontFamily: 'Arial, sans-serif' }}>
          <h2 className="text-center mb-4">Tax Invoice (Bus Booking)</h2>

          <Row className="mb-4">
            <Col md={6}>
              <div style={{ fontSize: '14px' }}>
                <strong>From:</strong> {currentData.supplierDetails.name}<br />
                <strong>Mobile:</strong> {currentData.supplierDetails.mobile}<br />
                <strong>Email:</strong> {currentData.supplierDetails.email}<br />
                <strong>PAN Number:</strong> {currentData.supplierDetails.pan}<br />
                <strong>State:</strong> {currentData.supplierDetails.state}
              </div>
            </Col>
            <Col md={6} className="text-end">
              <div style={{ fontSize: '14px' }}>
                <strong>Passenger Name:</strong> {currentData.receiverDetails.name}<br />
                <strong>Phone:</strong> {currentData.receiverDetails.phone}
              </div>
            </Col>
          </Row>

          <Table bordered size="sm" className="mb-4" style={{ fontSize: '14px' }}>
            <tbody>
              <tr>
                <td><strong>Invoice Number:</strong> {currentData.invoiceId}</td>
                <td><strong>Invoice Date:</strong> {new Date(currentData.invoiceDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td><strong>Booking ID:</strong> {currentData.bookingId}</td>
                <td><strong>Ticket No:</strong> {currentData.TicketNo}</td>
              </tr>
              <tr>
                <td><strong>From:</strong> {currentData.source}</td>
                <td><strong>To:</strong> {currentData.destination}</td>
              </tr>
              <tr>
                <td><strong>Departure:</strong> {new Date(currentData.departureTime).toLocaleString()}</td>
                <td><strong>Arrival:</strong> {new Date(currentData.arrivalTime).toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan="2"><strong>Bus Type:</strong> {currentData.busType}</td>
              </tr>
            </tbody>
          </Table>

          <h3>PASSENGER DETAILS</h3>
          <Table bordered size="sm" className="mb-4" style={{ fontSize: '14px' }}>
            <thead>
              <tr>
                <th>Ticket No</th>
                <th>Route</th>
                <th>Passenger Name</th>
                <th>Age</th>
                <th>Seat No</th>
                <th>Fare (₹)</th>
              </tr>
            </thead>
            <tbody>
              {currentData.passenger.map((p, index) => (
                <tr key={index}>
                  <td>{currentData.TicketNo}</td>
                  <td>{currentData.source} - {currentData.destination}</td>
                  <td>{p.Title} {p.FirstName} {p.LastName}</td>
                  <td>{p.Age}</td>
                  <td>{p.SeatName}</td>
                  <td>₹ {p.Seat.SeatFare}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <h3 className="mt-4">PAYMENT DETAILS</h3>
          <Table size="sm" style={{ fontSize: '14px', width: '50%' }}>
            <tbody>
              <tr><td><strong>No. of Seats:</strong></td><td>{currentData.fareDetails.NoOfSeats}</td></tr>
              <tr><td><strong>Base Fare:</strong></td><td>₹ {currentData.fareDetails.baseFare}</td></tr>
              <tr><td><strong>Taxes:</strong></td><td>₹ {currentData.fareDetails.taxes}</td></tr>
              <tr><td><strong>Service Charges:</strong></td><td>₹ {currentData.fareDetails.serviceCharges}</td></tr>
              <tr><td><strong>Coupon Discount (-):</strong></td><td>₹ {currentData.fareDetails.couponDiscount}</td></tr>
              <tr><td><strong>IGST Rate:</strong></td><td>{currentData.fareDetails.IGSTRate}%</td></tr>
              <tr><td><strong>Total Payable:</strong></td><td><strong>₹ {currentData.totalPayable}</strong></td></tr>
            </tbody>
          </Table>

          <h3 className="mt-4">BOARDING & DROPPING DETAILS</h3>
          <Row>
            <Col md={6}>
              <Card className="h-100">
                <Card.Header><strong>Boarding</strong></Card.Header>
                <Card.Body style={{ fontSize: '14px' }}>
                  <p><strong>Location:</strong> {currentData.boardingPointdetails.CityPointName}</p>
                  <p><strong>Address:</strong> {currentData.boardingPointdetails.CityPointLocation}</p>
                  <p><strong>Landmark:</strong> {currentData.boardingPointdetails.CityPointLandmark}</p>
                  <p><strong>Time:</strong> {new Date(currentData.boardingPointdetails.CityPointTime).toLocaleString()}</p>
                  <p><strong>Contact:</strong> {currentData.boardingPointdetails.CityPointContactNumber}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100">
                <Card.Header><strong>Dropping</strong></Card.Header>
                <Card.Body style={{ fontSize: '14px' }}>
                  <p><strong>Location:</strong> {currentData.droppingPointdetails[0].CityPointName}</p>
                  <p><strong>Address:</strong> {currentData.droppingPointdetails[0].CityPointLocation}</p>
                  <p><strong>Time:</strong> {new Date(currentData.droppingPointdetails[0].CityPointTime).toLocaleString()}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <h3 className="mt-4">TERMS & CONDITIONS</h3>
          <ul style={{ fontSize: '14px', paddingLeft: '20px' }}>
            <li>This is a computer-generated invoice; no signature required.</li>
            <li>All disputes are subject to jurisdiction of New Delhi.</li>
            <li>Please report at the boarding point at least 30 minutes before departure.</li>
            <li>Ensure correct contact number for updates on schedule or cancellation.</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );

  return (
    <div>
      {/* Demo Controls */}
      <Container className="my-3 hidden">
        <Row>
          <Col>
            <Form>
              <Form.Group>
                <Form.Label>Select Invoice Type:</Form.Label>
                <Form.Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <option value="hotel">Hotel</option>
                  <option value={Jtype}>Flight</option>
                  <option value="bus">Bus</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Col>
        </Row>
      </Container>

      {/* Invoice Content */}
      {/* <Button onClick={() => window.print()}>Print Invoice</Button> */}

      <div id="invoice-print" ref={printRef}>
  {selectedType === 'flight' && renderFlightInvoice()}
  {selectedType === 'hotel' && renderHotelInvoice()}
  {selectedType === 'bus' && renderBusInvoice()}
</div>
    </div>
  );
};

export default InvoiceTemplate;