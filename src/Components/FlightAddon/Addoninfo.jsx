import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updatePassengerAddons } from '../../redux/Slices/PassengersSlice';
import '../../Style/Pagescss/FlightResultsPage.css';

const Addoninfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { SSR } = location?.state || {};
  const passengersData = useSelector((state) => state.passengersData || []);
  console.log("passenger",passengersData)
  const mealOptions = SSR?.Meal?.[0] || [];
  const baggageOptions = SSR?.Baggage?.[0] || [];
  const seatOptions = SSR?.Seats?.[0]?.[0]?.ul?.flat() || [];
  const { Origin, Destination } = mealOptions;

  // Initialize state with passenger data or empty selections
  const [passengerSelections, setPassengerSelections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (passengersData.length > 0) {
      setPassengerSelections(
        passengersData.map(passenger => ({
          meal: passenger.Meal?.[0] || null,
          baggage: passenger.Baggage?.[0] || null,
          seat: passenger.Seat?.[0] || null
        }))
      );
      setIsLoading(false);
    }
  }, [passengersData]);

  const handleMealChange = (index, e) => {
    console.log("index",index,"e",e.target.value)
    const selected = mealOptions.find((meal) => meal.Key === e.target.value);
    console.log("slected",selected)
    const updatedSelections = [...passengerSelections];
    updatedSelections[index].meal = selected;
    console.log("updatedSelections",updatedSelections)
    
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
    const selected = seatOptions.find((seat) => seat.Key === e.target.value);
    const updatedSelections = [...passengerSelections];
    updatedSelections[index].seat = selected;
    setPassengerSelections(updatedSelections);
    
    dispatch(updatePassengerAddons({
      passengerId: { index, type: passengersData[index].type },
      seat: selected
    }));
  };

  const handleContinue = () => {
    navigate('/review', {
      state: {
        passengerSelections,
        SSR
      }
    });
  };

  // Check if all required selections are made for all non-infant passengers
  const allSelectionsComplete = passengerSelections.every((selection, index) => {
    // Skip check for infants
    if (passengersData[index]?.type === 'INF') return true;
    
    return selection.meal && selection.baggage && selection.seat;
  });

  if (isLoading) {
    return <div>Loading passenger data...</div>;
  }

  return (
    <div className="container">
      {passengersData.map((passenger, index) => {
        // Skip rendering for INFANT passengers
        if (passenger.type === 'INF') return null;

        return (
          <Card key={`passenger-${index}`} className="mt-3">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <strong>
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
                <Col md={4}>
                  <h5 className="fw-bold">Meal</h5>
                  <p className="mb-1">{Origin} → {Destination}</p>
                  <Form.Select 
                    className="mb-2" 
                    onChange={(e) => handleMealChange(index, e)}
                    value={passengerSelections[index]?.meal?.Key || ''}
                    aria-label="Select meal option"
                  >
                    <option value="">Select a meal</option>
                    {mealOptions.map((meal) => (
                      <option key={`meal-${meal.Key}`} value={meal.Key}>
                        {meal.AirlineDescription} (Rs. {meal.Price})
                      </option>
                    ))}
                  </Form.Select>
                  {passengerSelections[index]?.meal && (
                    <div className="selected-option">
                      <p className="mb-1">Selected Meal: {passengerSelections[index].meal.AirlineDescription}</p>
                      <p>Charges: Rs. {passengerSelections[index].meal.Price}</p>
                    </div>
                  )}
                </Col>

                {/* Baggage Section */}
                <Col md={4}>
                  <h5 className="fw-bold">Baggage</h5>
                  <p className="mb-1">{Origin} → {Destination}</p>
                  <Form.Select 
                    className="mb-2" 
                    onChange={(e) => handleBaggageChange(index, e)}
                    value={passengerSelections[index]?.baggage?.Key || ''}
                    aria-label="Select baggage option"
                  >
                    <option value="">Select baggage</option>
                    {baggageOptions.map((bag) => (
                      <option key={`baggage-${bag.Key}`} value={bag.Key}>
                        {bag.Weight} Kg - Rs. {bag.Price}
                      </option>
                    ))}
                  </Form.Select>
                  {passengerSelections[index]?.baggage && (
                    <div className="selected-option">
                      <p className="mb-1">Selected Baggage: {passengerSelections[index].baggage.Weight} Kg</p>
                      <p>Charges: Rs. {passengerSelections[index].baggage.Price}</p>
                    </div>
                  )}
                </Col>

                {/* Seat Section */}
                <Col md={4}>
                  <h5 className="fw-bold">Seat</h5>
                  <p className="mb-1">{Origin} → {Destination}</p>
                  <Form.Select 
                    className="mb-2" 
                    onChange={(e) => handleSeatChange(index, e)}
                    value={passengerSelections[index]?.seat?.Key || ''}
                    aria-label="Select seat option"
                  >
                    <option value="">Select a seat</option>
                    {seatOptions.map((seat) => (
                      <option key={`seat-${seat.Key}`} value={seat.Key}>
                        {seat.Code} - Rs. {seat.Price}
                      </option>
                    ))}
                  </Form.Select>
                  {passengerSelections[index]?.seat && (
                    <div className="selected-option">
                      <p className="mb-1">Selected Seat: {passengerSelections[index].seat.Code}</p>
                      <p>Charges: Rs. {passengerSelections[index].seat.Price}</p>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );
      })}

      <div className="text-start mt-4 mb-4">
        <Button
          variant="primary"
          className="btn-red"
          onClick={handleContinue}
          disabled={!allSelectionsComplete}
        >
          Continue Booking
        </Button>
      </div>
    </div>
  );
};

export default Addoninfo;