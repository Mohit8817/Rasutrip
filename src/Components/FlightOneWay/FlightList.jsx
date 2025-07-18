import React, { useEffect, useState, useContext } from 'react';
import moment from 'moment';
import FlightCard from './FlightCards';
import { fetchFlightData } from '../../Components/FlightApi/FlightApi';
import { LocationContext } from '../../Components/Context/LocationContext';

const FlightList = () => {
  const { locationData } = useContext(LocationContext);

  const {
    fromCode = 'DEL',
    toCode = 'BOM',
    departDate = new Date(),
    passengers = { adults: 1, children: 0, infants: 0 },
    cabinClass = '',
  } = locationData || {};

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format departure date for display
  let displayDate = 'Not selected';
  try {
    const jsDate = new Date(
      typeof departDate === 'string' ? departDate : departDate.PreferredTime || departDate
    );
    if (!isNaN(jsDate.getTime())) {
      displayDate =
        jsDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) +
        ', ' +
        jsDate.toLocaleDateString('en-GB', {
          weekday: 'long',
        });
    }
  } catch (e) {
    console.warn('Invalid departure date:', departDate);
  }

  useEffect(() => {
    const cabinMap = {
      "Economy": 1,
      "Premium Economy": 2,
      "Business": 4,
      "First": 5
    };

    const normalizedCabin = typeof cabinClass === 'number'
      ? cabinClass
      : cabinMap[cabinClass] || 1;

    const requestPayload = {
      UserIp: "27.60.0.238",
      Adult: passengers.adults || 1,
      Child: passengers.children || 0,
      Infant: passengers.infants || 0,
      DirectFlight: false,
      JourneyType: 1,
      PreferredCarriers: null,
      CabinClass: normalizedCabin,
      AirSegments: [
        {
          Origin: fromCode,
          Destination: toCode,
          PreferredTime: `${moment(
            typeof departDate === 'object' && departDate.PreferredTime
              ? departDate.PreferredTime
              : departDate
          ).format("YYYY-MM-DD")}T00:00:00`,
        },
      ],
      Sources: null,
    };

    const getFlights = async () => {
      try {
        const response = await fetchFlightData(requestPayload);
        const result = response?.Result?.[0] || [];

        const transformedFlights = result.map((flight) => {
          const segment = flight.Segments?.[0]?.[0];
          const fare = flight.FareList?.[0];

          return {
            airline: segment?.Airline?.AirlineName || "Unknown Airline",
            flightNumber: `${segment?.Airline?.AirlineCode || ''}-${segment?.Airline?.FlightNumber || ''}`,
            departTime: moment(segment?.Origin?.DepartTime).format('HH:mm'),
            departDate: moment(segment?.Origin?.DepartTime).format('DD MMM'),
            departCity: segment?.Origin?.CityCode,
            arriveTime: moment(segment?.Destination?.ArrivalTime).format('HH:mm'),
            arriveDate: moment(segment?.Destination?.ArrivalTime).format('DD MMM'),
            arriveCity: segment?.Destination?.CityCode,
            duration: segment?.Duration
              ? `${Math.floor(segment.Duration / 60)} h ${segment.Duration % 60} m`
              : "N/A",
            price: fare?.OfferedPrice || 0,
            tag: fare?.FareType || '',
            classType: fare?.CabinClass || '',
            refund: fare?.IsRefundable ? 'Refundable' : 'Non-refundable',
            action: 'View Prices',
            seatsLeft: fare?.SeatBaggage?.[0]?.[0]?.NoOfSeatAvailable ?? 5,
            stop: 'Non Stop(s)',
          };
        });

        setFlights(transformedFlights);
      } catch (err) {
        console.error("Error fetching flights:", err);
        setError("Failed to load flight data.");
      } finally {
        setLoading(false);
      }
    };

    getFlights();
  }, [fromCode, toCode, departDate, passengers, cabinClass]);

  if (loading) return <div className="text-center my-4">Loading flights...</div>;
  if (error) return <div className="text-danger text-center my-4">{error}</div>;

  return (
    <div className="my-4">
      <h5 className="mb-2">Showing {flights.length} Flights</h5>
      <p className="text-muted">Departure Date: <strong>{displayDate}</strong></p>

      {flights.map((flight, idx) => (
        <FlightCard key={idx} flight={flight} />
      ))}
    </div>
  );
};

export default FlightList;
