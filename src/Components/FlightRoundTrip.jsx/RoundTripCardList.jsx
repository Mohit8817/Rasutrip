import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import RoundTripCard from './RoundTripCard';
import { fetchFlightData } from '../../Components/FlightApi/FlightApi';
import { Row, Col } from 'react-bootstrap';
import InterRoundtripCard from './InterRoundtripCard';
import RoundTripBookingBar from './RoundTripBookingBar';
import { useSelector, useDispatch } from 'react-redux';
import { setOnwardFlight, setReturnFlight, setSelectedOnwardFare, setSelectedReturnFare } from './../../redux/Slices/SelectedFlight';


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

  const handleOnwardSelect = (flight, fare) => {
    console.log("handleOnwardSelect", fare);
    dispatch(setSelectedOnwardFare(fare));
    dispatch(setOnwardFlight(flight));
  };

  const handleReturnSelect = (flight, fare) => {
    console.log("handleReturnSelect: fare", fare);
    dispatch(setSelectedReturnFare(fare));
    dispatch(setReturnFlight(flight));
  };

  


  useEffect(() => {
    const requestPayload = {
      UserIp: '27.60.0.238',
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

    const getFlights = async () => {
      try {
        const response = await fetchFlightData(requestPayload);
        const result = response?.Result || [];

        setFlights(result || []);



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

  if (loading) return <div className="text-center my-4">Loading flights...</div>;
  if (error) return <div className="text-danger text-center my-4">{error}</div>;

  return (
    <div className="px-4 pb-32">
      {flights?.length > 1 ? (
        <Row>
          {/* {setShowdetailsBar(true)} */}
          {/* Onward Flights */}
          <Col md={6}>
            {Array.isArray(flights[0]) &&
              flights[0].map((flight) => (
                <div key={flight.FlightNumber || Math.random()}>
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
              flights[1].map((flight) => (
                <div key={flight.FlightNumber || Math.random()}>
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
          {/* {setShowdetailsBar(false)} */}
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
