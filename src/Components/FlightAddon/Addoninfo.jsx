import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Form, Nav, Tab } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updatePassengerAddons } from '../../redux/Slices/PassengersSlice';
import '../../Style/Pagescss/FlightResultsPage.css';
import BookingSteps from '../FlightDetails/BookingSteps';
import FareSummary from '../FlightDetails/FareSummary';
import PromoCodeBox from '../FlightDetails/PromoCodeBox';
import SeatSelect from './SeatSelect';
import { post } from '../APIS/FlightApi/FlightApi';
import { toast } from 'react-toastify';

const Addoninfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [passengersData, setPassengersData] = useState([]);
  const { SelectedFare, SSR, Faresummary, ReturnSSR } = location?.state || {};

  const mealOptions = Array.isArray(SSR?.Meal?.[0]) ? SSR?.Meal?.[0] : SSR?.Meal;
  const ReturnMealOptions = Array.isArray(ReturnSSR?.Meal?.[0]) ? ReturnSSR?.Meal?.[0] : ReturnSSR?.Meal;

  console.log('mealOptions', SSR);
  console.log('ReturnMeal', ReturnSSR);

  const [selectedSeat, setSelectedSeat] = React.useState(null);
  const [Passengers, setPassengers] = React.useState(null);
  const [activeTab, setActiveTab] = useState('onward'); // Tab state
  
  // Onward options
  const baggageOptions = SSR?.Baggage?.[0] || [];
  const rawSeatData = SSR?.Seats?.[0]?.[0]?.ul;
  const seatOptions = Array.isArray(rawSeatData)
    ? rawSeatData.flat?.() || rawSeatData
    : rawSeatData && typeof rawSeatData === 'object'
      ? Object.values(rawSeatData).flat()
      : [];

  // Return options
  const ReturnBaggageOptions = ReturnSSR?.Baggage?.[0] || [];
  const ReturnRawSeatData = ReturnSSR?.Seats?.[0]?.[0]?.ul;
  const ReturnSeatOptions = Array.isArray(ReturnRawSeatData)
    ? ReturnRawSeatData.flat?.() || ReturnRawSeatData
    : ReturnRawSeatData && typeof ReturnRawSeatData === 'object'
      ? Object.values(ReturnRawSeatData).flat()
      : [];

  const { Origin, Destination } = mealOptions || {};
  const { Origin: ReturnOrigin, Destination: ReturnDestination } = ReturnMealOptions || {};

  // Onward और Return के लिए separate selections
  const [passengerSelections, setPassengerSelections] = useState([]);
  const [returnPassengerSelections, setReturnPassengerSelections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if it's roundtrip
  const isRoundtrip = !!ReturnSSR;

  useEffect(() => {
    const storedData = localStorage.getItem('passengersData');
    if (storedData) {
      try {
        setPassengersData(JSON.parse(storedData));
      } catch (e) {
        console.error('Error parsing passengersData:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (passengersData.length > 0) {
      // Onward selections
      setPassengerSelections(
        passengersData.map(passenger => ({
          meal: passenger.Meal?.[0] || null,
          baggage: passenger.Baggage?.[0] || null,
          seat: passenger.Seat?.[0] || null
        }))
      );

      // Return selections (if roundtrip)
      if (isRoundtrip) {
        setReturnPassengerSelections(
          passengersData.map(passenger => ({
            meal: passenger.ReturnMeal?.[0] || null,
            baggage: passenger.ReturnBaggage?.[0] || null,
            seat: passenger.ReturnSeat?.[0] || null
          }))
        );
      }

      setIsLoading(false);
    }
  }, [passengersData, isRoundtrip]);

  // Onward handlers
  const handleMealChange = (index, e) => {
    const selected = mealOptions?.find((meal) => meal.Key === e.target.value);
    const updatedSelections = [...passengerSelections];
    updatedSelections[index].meal = selected;
    setPassengerSelections(updatedSelections);

    dispatch(updatePassengerAddons({
      passengerId: { index, type: passengersData[index].type },
      meal: selected
    }));
  };

  const handleBaggageChange = (index, e) => {
    const selected = baggageOptions.find((bag) => bag.Key === e.target.value);
    const updatedSelections = [...passengerSelections];
    updatedSelections[index].baggage = selected;
    setPassengerSelections(updatedSelections);

    dispatch(updatePassengerAddons({
      passengerId: { index, type: passengersData[index].type },
      baggage: selected
    }));
  };

  const handleSeatChange = (index, e) => {
    const selected = seatOptions?.find((seat) => seat.Key === e.target.value);
    const updatedSelections = [...passengerSelections];
    updatedSelections[index].seat = selected;
    setPassengerSelections(updatedSelections);

    console.log('check fare', passengerSelections);
    dispatch(updatePassengerAddons({
      passengerId: { index, type: passengersData[index].type },
      seat: selected
    }));
  };

  // Return handlers
  const handleReturnMealChange = (index, e) => {
    const selected = ReturnMealOptions?.find((meal) => meal.Key === e.target.value);
    const updatedSelections = [...returnPassengerSelections];
    updatedSelections[index].meal = selected;
    setReturnPassengerSelections(updatedSelections);

    dispatch(updatePassengerAddons({
      passengerId: { index, type: passengersData[index].type },
      returnMeal: selected
    }));
  };

  const handleReturnBaggageChange = (index, e) => {
    const selected = ReturnBaggageOptions.find((bag) => bag.Key === e.target.value);
    const updatedSelections = [...returnPassengerSelections];
    updatedSelections[index].baggage = selected;
    setReturnPassengerSelections(updatedSelections);

    dispatch(updatePassengerAddons({
      passengerId: { index, type: passengersData[index].type },
      returnBaggage: selected
    }));
  };

  const handleSeatSelect = (seat) => {
    setSelectedSeat(seat);
  };

  const onAssignSeat = ({ passengerId, clickedSeat }) => {
    const updatedSelections = [...passengerSelections];
    updatedSelections[passengerId].seat = clickedSeat;
    setPassengerSelections(updatedSelections);
    setPassengers((prevPassengers) => {
      if (!prevPassengers) return prevPassengers;

      return prevPassengers.map((p, index) =>
        index === passengerId ? { ...p, seat: clickedSeat } : p
      );
    });
  };

  const onAssignReturnSeat = ({ passengerId, clickedSeat }) => {
    const updatedSelections = [...returnPassengerSelections];
    updatedSelections[passengerId].seat = clickedSeat;
    setReturnPassengerSelections(updatedSelections);
  };

  const handleContinue = async () => {
    navigate('/review', {
      state: {
        passengerSelections,
        returnPassengerSelections: isRoundtrip ? returnPassengerSelections : null,
        SSR,
        ReturnSSR,
        SelectedFare,
        selectedSeat,
        passengersData,
        isRoundtrip
      }
    });
  };

  // Check if all required selections are made for all non-infant passengers
  const allSelectionsComplete = passengerSelections.every((selection, index) => {
    if (passengersData[index]?.type === 'INF') return true;
    return selection.meal && selection.baggage && selection.seat;
  });

  console.log('isRoundtrip',isRoundtrip)
  const allReturnSelectionsComplete = !isRoundtrip || returnPassengerSelections.every((selection, index) => {
    if (passengersData[index]?.type === 'INF') return true;
    return selection && selection.meal && selection.baggage && selection.seat;
  });

  // Render passenger cards helper function
  const renderPassengerCards = (selections, handleMeal, handleBaggage, options, type = 'onward') => {
    const mealOpts = type === 'onward' ? mealOptions : ReturnMealOptions;
    const baggageOpts = type === 'onward' ? baggageOptions : ReturnBaggageOptions;
    const origin = type === 'onward' ? Origin : ReturnOrigin;
    const destination = type === 'onward' ? Destination : ReturnDestination;
    const badgeColor = type === 'onward' ? 'primary' : 'success';
    const badgeText = type === 'onward' ? 'ONWARD' : 'RETURN';

    return passengersData?.map((passenger, index) => {
      if (passenger.type === 'INF') return null;

      return (
        <Card key={`${type}-passenger-${index}`} className="mt-3">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center">
            <strong>
              <span className={`badge bg-${badgeColor} me-2`}>{badgeText}</span>
              Add Baggage, Meal, and Seat for {passenger.Title} {passenger.FirstName} {passenger.LastName}
            </strong>
            <span style={{ cursor: 'pointer', fontSize: '1.2rem' }}>⌃</span>
          </Card.Header>

          <Card.Body>
            <p className="fw-bold mb-1">
              {passenger.type === 'ADT' ? 'ADULT' : 'CHILD'} {index + 1}
            </p>
            <hr />

            <Row>
              {/* Meal Section */}
              <Col md={6}>
                <h5 className="fw-bold">Meal</h5>
                <p className="mb-1">{origin} → {destination}</p>
                <Form.Select
                  className="mb-2"
                  onChange={(e) => handleMeal(index, e)}
                  value={selections[index]?.meal?.Key || ''}
                  aria-label="Select meal option"
                >
                  <option value="">Select a meal</option>
                  {mealOpts?.map((meal) => (
                    <option key={`${type}-meal-${meal.Key}`} value={meal.Key}>
                      {meal.AirlineDescription == '' ? 'No Meal' : meal.AirlineDescription} (Rs. {meal.Price})
                    </option>
                  ))}
                </Form.Select>
                {selections[index]?.meal && (
                  <div className="selected-option">
                    <p className="mb-1">Selected Meal: {selections[index].meal.AirlineDescription}</p>
                    <p>Charges: Rs. {selections[index].meal.Price}</p>
                  </div>
                )}
              </Col>

              {/* Baggage Section */}
              <Col md={6}>
                <h5 className="fw-bold">Baggage</h5>
                <p className="mb-1">{origin} → {destination}</p>
                <Form.Select
                  className="mb-2"
                  onChange={(e) => handleBaggage(index, e)}
                  value={selections[index]?.baggage?.Key || ''}
                  aria-label="Select baggage option"
                >
                  <option value="">Select baggage</option>
                  {baggageOpts?.map((bag) => (
                    <option key={`${type}-baggage-${bag.Key}`} value={bag.Key}>
                      {bag.Weight} Kg - Rs. {bag.Price}
                    </option>
                  ))}
                </Form.Select>
                {selections[index]?.baggage && (
                  <div className="selected-option">
                    <p className="mb-1">Selected Baggage: {selections[index].baggage.Weight} Kg</p>
                    <p>Charges: Rs. {selections[index].baggage.Price}</p>
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      );
    });
  };

  if (isLoading) {
    return <div>Loading passenger data...</div>;
  }

  return (
    <div>
      <Container style={{ marginTop: '10rem' }}>
        <Row >
          <div>
            <BookingSteps activeIndex={2} />
          </div>
        </Row>
        
        <Row style={{ marginTop: '3rem' }}>
          <Col lg={9}>
            <div>
              <div className="container">
                
                {/* Tab Navigation */}
                {isRoundtrip ? (
                  <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                    <Nav variant="tabs" className="mb-4">
                      <Nav.Item>
                        <Nav.Link eventKey="onward" className="fw-bold">
                          🛫 Onward Flight - {Origin} → {Destination}
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="return" className="fw-bold">
                          🛬 Return Flight - {ReturnOrigin} → {ReturnDestination}
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>

                    <Tab.Content>
                      {/* Onward Tab Content */}
                      <Tab.Pane eventKey="onward">
                        <div className="mb-4">
                          <h4 className="text-primary fw-bold mb-3">
                            Select Add-ons for Onward Journey
                          </h4>
                          {renderPassengerCards(
                            passengerSelections, 
                            handleMealChange, 
                            handleBaggageChange, 
                            null, 
                            'onward'
                          )}
                          
                          {/* Onward Seat Selection */}
                          {rawSeatData && (
                            <div className="mt-4">
                              <SeatSelect
                                rawSeatData={rawSeatData}
                                passengersData={passengersData || []}
                                onSeatSelect={handleSeatSelect}
                                onAssignSeat={onAssignSeat}
                                title="Onward Flight Seats"
                              />
                            </div>
                          )}
                        </div>
                      </Tab.Pane>

                      {/* Return Tab Content */}
                      <Tab.Pane eventKey="return">
                        <div className="mb-4">
                          <h4 className="text-success fw-bold mb-3">
                            Select Add-ons for Return Journey
                          </h4>
                          {renderPassengerCards(
                            returnPassengerSelections, 
                            handleReturnMealChange, 
                            handleReturnBaggageChange, 
                            null, 
                            'return'
                          )}
                          
                          {/* Return Seat Selection */}
                          {ReturnRawSeatData && (
                            <div className="mt-4">
                              <SeatSelect
                                rawSeatData={ReturnRawSeatData}
                                passengersData={passengersData || []}
                                onSeatSelect={handleSeatSelect}
                                onAssignSeat={onAssignReturnSeat}
                                title="Return Flight Seats"
                              />
                            </div>
                          )}
                        </div>
                      </Tab.Pane>
                    </Tab.Content>
                  </Tab.Container>
                ) : (
                  // One-way trip - no tabs needed
                  <div className="mb-4">
                    <h4 className="text-primary fw-bold mb-3">
                      Select Add-ons for Your Flight - {Origin} → {Destination}
                    </h4>
                    {renderPassengerCards(
                      passengerSelections, 
                      handleMealChange, 
                      handleBaggageChange, 
                      null, 
                      'onward'
                    )}
                    
                    {/* Onward Seat Selection */}
                    {rawSeatData && (
                      <div className="mt-4">
                        <SeatSelect
                          rawSeatData={rawSeatData}
                          passengersData={passengersData || []}
                          onSeatSelect={handleSeatSelect}
                          onAssignSeat={onAssignSeat}
                          title="Select Seats"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="text-start mt-4 mb-4">
                  <Button
                    variant="primary"
                    className="btn-red"
                    onClick={handleContinue}
                    // disabled={!(allSelectionsComplete && allReturnSelectionsComplete)}
                  >
                    Continue Booking
                  </Button>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={3}>
            <div>
              <FareSummary 
                Faresummary={Faresummary} 
                passengerSelections={passengerSelections}
                returnPassengerSelections={returnPassengerSelections}
                isRoundtrip={isRoundtrip}
                liveCalculations={true}
              />
              {/* <PromoCodeBox /> */}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Addoninfo;
