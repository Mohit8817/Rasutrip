import React, { useEffect, useState, useContext } from 'react';
import moment from 'moment';
import FlightCard from './FlightCards';
import { fetchFlightData } from '../APIS/FlightApi/FlightApi'
import { LocationContext } from '../../Components/Context/LocationContext';
import { useSelector, useDispatch } from 'react-redux';
import { setFlights } from "../../redux/Slices/flightSlices";
import FlightLoader from '../FlightLoader/FlightLoader';


const FlightList = () => {
  const dispatch = useDispatch();
  const { locationData } = useContext(LocationContext);
  const flightsData = useSelector((state) => state?.flight?.flights || []);

  const {
    fromCode = 'DEL',
    toCode = 'BOM',
    departDate = new Date(),
    passengers = { adults: 1, children: 0, infants: 0 },
    cabinClass = '',
  } = locationData || {};

  const [allFlights, setAllFlights] = useState(flightsData || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore flights from localStorage on initial mount
  useEffect(() => {
    const savedFlights = localStorage.getItem('SearchedFlights');
    if (savedFlights && flightsData.length === 0) {
      const parsedFlights = JSON.parse(savedFlights);
      dispatch(setFlights(parsedFlights));
      setAllFlights(parsedFlights);
      setLoading(false); // skip fetching
    }
  }, [dispatch, allFlights]);

  // Format departure date
  let displayDate = 'Not selected';
  try {
    const rawDate =
      typeof departDate === 'string'
        ? departDate
        : departDate?.PreferredTime ?? departDate ?? new Date();

    const jsDate = new Date(rawDate);

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

  // Fetch flights from API
  useEffect(() => {
    const cabinMap = {
      "Economy": 1,
      "Premium Economy": 2,
      "Business": 4,
      "First": 5
    };

    const normalizedCabin =
      typeof cabinClass === 'number' ? cabinClass : cabinMap[cabinClass] || 1;

    const requestPayload = {
      // UserIp: "27.60.0.238",
      UserIp:"122.161.64.143",
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
            typeof departDate === 'object' && departDate?.PreferredTime
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
        console.log("searchToken",response?.SearchTokenId);
        console.log("UserIp",response?.UserIp)
        localStorage.setItem("searchToken",response?.SearchTokenId)
        localStorage.setItem("UserIp",response?.UserIp)
        setAllFlights(result || []);
        dispatch(setFlights(result || []));
      } catch (err) {
        console.error("Error fetching flights:", err);
        setError("Failed to load flight data.");
      } finally {
        setLoading(false);
      }
    };

    getFlights();
  }, [fromCode, toCode, departDate, passengers, cabinClass, dispatch]);

  // Save flights to localStorage when updated
  useEffect(() => {
    if (flightsData?.length) {
      localStorage.removeItem('SearchedFlights');
      localStorage.setItem('SearchedFlights', JSON.stringify(flightsData));
    }
  }, [flightsData]);

  if (loading) return <div className="text-center my-4"><FlightLoader></FlightLoader> </div>;
  if (error) return <div className="text-danger text-center my-4">{error}</div>;

  return (
 <div className="my-4 overflow-auto" style={{ maxHeight: '70vh' }}>
  <h5 className="mb-2">Showing {allFlights?.length} Flights</h5>
  <p className="text-muted">
    Departure Date: <strong>{displayDate}</strong>
  </p>

  {allFlights?.map((flight, idx) => (
    <FlightCard key={idx} flight={flight} />
  ))}
</div>

  );
};

export default FlightList;