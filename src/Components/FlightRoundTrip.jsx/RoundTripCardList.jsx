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
import { async } from 'q';

const RoundTripCardList = ({ filters,onFlightsLoad  }) => {
  const dispatch = useDispatch()
  const { state } = useLocation();
  const [showdetailsBar, setShowdetailsBar] = useState(false)
  const selectedOnwardFare = useSelector((state) => state.selectedFlights.selectedOnwardFare);
  const selectedReturnFare = useSelector((state) => state.selectedFlights.selectedReturnFare);

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

  const [flights, setFlights] = useState(null);
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

    localStorage.setItem('fareSummery', JSON.stringify(updatedData));
  };

  const handleOnwardSelect = async (flight, fare) => {
    updateFareSummery(fare, 'onward');
    dispatch(setSelectedOnwardFare(fare));
    dispatch(setOnwardFlight(flight));
  };

  const handleReturnSelect = async (flight, fare) => {
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
        onFlightsLoad(result)

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
    const isRes =localStorage.getItem('SearchedFlights');
    const isData = JSON.parse(isRes)
   

    if(isData=='[]' || !isData ){
       getFlights();
      
       
    }else{ 
      setLoading(false);

       setFlights(isData || []);
    }
    
  }, []);

  // Default selection useEffect - flights load होने के बाद automatically पहला fare select करेगा
  useEffect(() => {
    if (flights?.length > 1 && !selectedOnwardFare && !selectedReturnFare) {

      const firstOnwardFlight = flights[0]?.[0];
      const firstOnwardFare = firstOnwardFlight?.FareList?.[0];

      const firstReturnFlight = flights[1]?.[0];
      const firstReturnFare = firstReturnFlight?.FareList?.[0];

      if (firstOnwardFlight && firstOnwardFare) {
        dispatch(setSelectedOnwardFare(firstOnwardFare));
        dispatch(setOnwardFlight(firstOnwardFlight));
      }

      if (firstReturnFlight && firstReturnFare) {
        dispatch(setSelectedReturnFare(firstReturnFare));
        dispatch(setReturnFlight(firstReturnFlight));
      }
    }
  }, [flights, selectedOnwardFare, selectedReturnFare, dispatch]);

  if (loading) return <div className="text-center my-4"><FlightLoader></FlightLoader></div>;
  if (error) return <div className="text-danger text-center my-4">{error}</div>;

  const filterFares = (flights, filters) => {
    if (!Array.isArray(flights)) return [];
    const isReset =
      (!filters.airlines || filters.airlines.length === 0) &&
      (!filters.stops || filters.stops.length === 0) &&
      (!filters.priceRange || filters.priceRange.length === 0) &&
      (filters.refundable === null || filters.refundable === undefined) &&
      (!filters.departureTime || filters.departureTime === null) &&
      (!filters.arrivalTime || filters.arrivalTime === null);

    if (isReset) {
      return flights; // bina modification ke return
    }

    return flights
      .map(flight => {
        const firstSegment = flight.Segments[0][0];
        const lastSegment = flight.Segments[0][flight.Segments[0].length - 1];

        // Airline filter — AirlineName match karega (case-insensitive)
        const airlineName = firstSegment.Airline.AirlineName?.toLowerCase();
        const airlineMatch =
          !filters.airlines || filters.airlines.length === 0 ||
          filters.airlines.some(a => airlineName.includes(a.toLowerCase()));

        // Stops filter
        const stopsCount = flight.Segments[0].length - 1;
        const stopMatch =
          !filters.stops || filters.stops.length === 0 ||
          filters.stops.includes(String(stopsCount));

        // Departure Time filter
        const depHour = new Date(firstSegment.Origin.DepartTime).getHours();
        const depTimeMatch =
          !filters.departureTime ||
          (depHour >= filters.departureTime[0] && depHour <= filters.departureTime[1]);

        // Arrival Time filter
        const arrHour = new Date(lastSegment.Destination.ArrivalTime).getHours();
        const arrTimeMatch =
          !filters.arrivalTime ||
          (arrHour >= filters.arrivalTime[0] && arrHour <= filters.arrivalTime[1]);

        // FareList filter
        const filteredFareList = flight.FareList.filter(fare => {
          // Price range
          const inPriceRange =
            !filters.priceRange ||
            (fare.OfferedPrice >= filters.priceRange[0] &&
              fare.OfferedPrice <= filters.priceRange[1]);

          // Refundable check
          const refundableCheck =
            filters.refundable === null || filters.refundable === undefined
              ? true
              : filters.refundable === "refundable"
                ? fare.IsRefundable === true
                : filters.refundable === "non-refundable"
                  ? fare.IsRefundable === false
                  : true;

          return inPriceRange && refundableCheck;
        });

        if (
          airlineMatch &&
          stopMatch &&
          depTimeMatch &&
          arrTimeMatch &&
          filteredFareList.length > 0
        ) {
          return { ...flight, FareList: filteredFareList };
        }
        return null;
      })
      .filter(f => f !== null);
  };

  const onwardFilteredFlights = filterFares(flights[0], filters);
  const returnFilteredFlights = filterFares(flights[1], filters);

  return (
    <div className="">
      {flights?.length > 1 ? (
        <Row>
          {/* Onward Flights */}
          <Col xs={6} md={6} className='p-0'>
            {Array.isArray(flights[0]) &&
              onwardFilteredFlights.map((flight, index) => (
                <div key={flight.FlightNumber || `onward-${index + 1}`}>
                  <RoundTripCard
                    flight={flight}
                    type="onward"
                    selectedFare={selectedOnwardFare}
                    onSelect={handleOnwardSelect}
                  />
                </div>
              ))}
          </Col>

          <Col xs={6} md={6} className='p-0'>
            {Array.isArray(flights[1]) &&
              returnFilteredFlights.map((flight, index) => (
                <div key={flight.FlightNumber || `return-${index + 2}`}>
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
              onwardFilteredFlights.map((flight, index) => (
                <InterRoundtripCard key={index} flight={flight}
                  type="onward"
                  selectedFare={selectedOnwardFare} />
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