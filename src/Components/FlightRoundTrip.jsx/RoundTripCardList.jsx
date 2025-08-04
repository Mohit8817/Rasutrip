import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import RoundTripCard from './RoundTripCard';

import { Row, Col } from 'react-bootstrap';
import InterRoundtripCard from './InterRoundtripCard';
import RoundTripBookingBar from './RoundTripBookingBar';
import { useSelector, useDispatch } from 'react-redux';
import { setOnwardFlight, setReturnFlight, setSelectedOnwardFare, setSelectedReturnFare } from './../../redux/Slices/SelectedFlight';
import { fetchFlightData } from '../APIS/FlightApi/FlightApi';
import FlightLoader from '../FlightLoader/FlightLoader';

const RoundTripCardList = () => {
  const dispatch = useDispatch()
  const { state } = useLocation();
  const [showdetailsBar, setShowdetailsBar] = useState(false)
  const selectedOnwardFare = useSelector((state) => state.selectedFlights.selectedOnwardFare);
  const selectedReturnFare = useSelector((state) => state.selectedFlights.selectedReturnFare);

  console.log("selectedOnwardFare", selectedOnwardFare, "selectedReturnFare", selectedReturnFare)

  const {
    fromCode = 'DEL',
    toCode = 'BOM',
    departDate: departObj = {},
    returnDate: returnObj = {},
    passengers = { adults: 1, children: 0, infants: 0 },
    cabinClass = '',
  } = state || {};

  const departDate = departObj?.PreferredTime || new Date();
  const returnDate = returnObj?.PreferredTime || new Date();

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOnwardIndex, setSelectedOnwardIndex] = useState(0);
  const [selectedReturnIndex, setSelectedReturnIndex] = useState(0);

  const updateFareSummery = (fare, type) => {
  const existingData = JSON.parse(localStorage.getItem('fareSummery')) || {};

  const updatedData = {
    ...existingData,
    [type]: fare, // type can be 'onward' or 'return'
  };

  console.log('updateFareSummery',updatedData)
  localStorage.setItem('fareSummery', JSON.stringify(updatedData));
};

const handleOnwardSelect = (flight, fare) => {
  console.log("🛫 handleOnwardSelect - Flight:", flight);
  console.log("🛫 handleOnwardSelect - Fare:", fare);

  updateFareSummery(fare, 'onward');

  dispatch(setSelectedOnwardFare(fare));
  dispatch(setOnwardFlight(flight));
};

const handleReturnSelect = (flight, fare) => {
  console.log("🛬 handleReturnSelect - Flight:", flight);
  console.log("🛬 handleReturnSelect - Fare:", fare);

  updateFareSummery(fare, 'return');

  dispatch(setSelectedReturnFare(fare));
  dispatch(setReturnFlight(flight));
};


  useEffect(() => {
    const getFlights = async () => {
      try {
        const IP = localStorage.getItem('UserIp');
        const requestPayload = {
          UserIp: IP,
          Adult: passengers.adults,
          Child: passengers.children,
          Infant: passengers.infants,
          DirectFlight: false,
          JourneyType: 2,
          PreferredCarriers: null,
          CabinClass: cabinClass,
          AirSegments: [
            {
              Origin: fromCode,
              Destination: toCode,
              PreferredTime: moment(departDate).format('YYYY-MM-DD[T]00:00:00'),
            },
            {
              Origin: toCode,
              Destination: fromCode,
              PreferredTime: moment(returnDate).format('YYYY-MM-DD[T]00:00:00'),
            },
          ],
          Sources: null,
        };
        const response = await fetchFlightData(requestPayload);
        const result = response?.Result || [];

        setFlights(result || []);

        localStorage.setItem("searchToken", response?.SearchTokenId);
        localStorage.setItem("rasocommision", response?.rasutripCommissionPercentage);
        localStorage.removeItem('SearchedFlights');
        localStorage.setItem('SearchedFlights', JSON.stringify(result));

      } catch (err) {
        console.error('Error fetching round trip flights:', err);
        setError('Failed to fetch flights.');
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };

    getFlights();
  }, []);

  // Default selection useEffect - flights load होने के बाद automatically पहला fare select करेगा
  useEffect(() => {
    if (flights?.length > 1 && !selectedOnwardFare && !selectedReturnFare) {
      // Onward flight का पहला fare select करें
      const firstOnwardFlight = flights[0]?.[0];
      const firstOnwardFare = firstOnwardFlight?.FareList?.[0];
      
      // Return flight का पहला fare select करें
      const firstReturnFlight = flights[1]?.[0];
      const firstReturnFare = firstReturnFlight?.FareList?.[0];

      if (firstOnwardFlight && firstOnwardFare) {
        console.log("🔄 Auto-selecting first onward flight and fare");
        dispatch(setSelectedOnwardFare(firstOnwardFare));
        dispatch(setOnwardFlight(firstOnwardFlight));
      }

      if (firstReturnFlight && firstReturnFare) {
        console.log("🔄 Auto-selecting first return flight and fare");
        dispatch(setSelectedReturnFare(firstReturnFare));
        dispatch(setReturnFlight(firstReturnFlight));
      }
    }
  }, [flights, selectedOnwardFare, selectedReturnFare, dispatch]);

  if (loading) return <div className="text-center my-4"><FlightLoader></FlightLoader></div>;
  if (error) return <div className="text-danger text-center my-4">{error}</div>;

  console.log('flights', flights)
  console.log('flights[0]', flights[0])
  console.log('flights[1]', flights[1])

  return (
    <div className="px-4 pb-32">
      {flights?.length > 1 ? (
        <Row>
          {/* Onward Flights */}
          <Col md={6}>
            {Array.isArray(flights[0]) &&
              flights[0].map((flight, index) => (
                <div key={flight.FlightNumber || `onward-${index+1}`}>
                  <RoundTripCard
                    flight={flight}
                    type="onward"
                    selectedFare={selectedOnwardFare}
                    onSelect={handleOnwardSelect}
                  />
                </div>
              ))}
          </Col>

          <Col md={6}>
            {Array.isArray(flights[1]) &&
              flights[1].map((flight, index) => (
                <div key={flight.FlightNumber || `return-${index+2}`}>
                  <RoundTripCard
                    flight={flight}
                    type="return"
                    selectedFare={selectedReturnFare}
                    onSelect={handleReturnSelect}
                  />
                </div>
              ))}
          </Col>

        </Row>
      ) : flights?.length === 1 ? (
        <Row>
          <Col md={12}>
            {Array.isArray(flights[0]) &&
              flights[0].map((flight, index) => (
                <InterRoundtripCard key={index} flight={flight} />
              ))}
          </Col>
        </Row>
      ) : (
        <div className="text-center text-muted">No flights found for this round trip.</div>
      )}
    </div>
  );
};

export default RoundTripCardList;