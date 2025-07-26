import React, { useEffect, useState, useContext, useMemo } from 'react';
import moment from 'moment';
import FlightCard from './FlightCards';
import { fetchFlightData, getUserIP } from '../APIS/FlightApi/FlightApi'
import { LocationContext } from '../../Components/Context/LocationContext';
import { useSelector, useDispatch } from 'react-redux';
import { setFlights } from "../../redux/Slices/flightSlices";
import FlightLoader from '../FlightLoader/FlightLoader';

const FlightList = ({ filters }) => {
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
  const [UserIpAddress, setUserIpAddress] = useState(null);


  const filteredFlights = useMemo(() => {
    return allFlights.filter(flight => {
      const airline = flight.Segments?.[0]?.[0]?.Airline?.AirlineName;

      // Use MinPublishedPrice for filtering (lowest price from all fare options)
      const price = flight?.MinPublishedPrice;

      // Get departure and arrival times
      const depTime = new Date(flight.Segments?.[0]?.[0]?.Origin?.DepartTime);
      const arrTime = new Date(flight.Segments?.[0]?.[0]?.Destination?.ArrivalTime);
      const depHour = depTime.getHours();
      const arrHour = arrTime.getHours();

      // Calculate number of stops
      const segments = flight.Segments?.[0] || [];
      const stops = segments.length - 1; // Number of stops is segments - 1

      // Check if any fare option is refundable
      const hasRefundableFare = flight?.FareList?.some(fare => fare.IsRefundable);
      const hasNonRefundableFare = flight?.FareList?.some(fare => !fare.IsRefundable);

      // Apply filters
      let passesFilter = true;

      // Airlines filter
      if (filters?.airlines?.length > 0) {
        passesFilter = passesFilter && filters.airlines.includes(airline);
      }

      // Refundable filter
      if (filters?.refundable) {
        if (filters.refundable === 'refundable') {
          passesFilter = passesFilter && hasRefundableFare;
        } else if (filters.refundable === 'non-refundable') {
          passesFilter = passesFilter && hasNonRefundableFare;
        }
      }

      // Price range filter
      if (filters?.priceRange && filters.priceRange.length === 2) {
        passesFilter = passesFilter &&
          (price >= filters.priceRange[0] && price <= filters.priceRange[1]);
      }

      // Stops filter
      if (filters?.stops?.length > 0) {
        passesFilter = passesFilter && filters.stops.includes(stops.toString());
      }

      // Departure time filter
      if (filters?.departureTime && filters.departureTime.length === 2) {
        const [startHour, endHour] = filters.departureTime;
        if (endHour === 24) {
          // Handle 6PM-12AM case (18-24 hours)
          passesFilter = passesFilter && (depHour >= startHour || depHour < 1);
        } else {
          passesFilter = passesFilter && (depHour >= startHour && depHour < endHour);
        }
      }

      // Arrival time filter
      if (filters?.arrivalTime && filters.arrivalTime.length === 2) {
        const [startHour, endHour] = filters.arrivalTime;
        if (endHour === 24) {
          // Handle 6PM-12AM case (18-24 hours)
          passesFilter = passesFilter && (arrHour >= startHour || arrHour < 1);
        } else {
          passesFilter = passesFilter && (arrHour >= startHour && arrHour < endHour);
        }
      }

      return passesFilter;
    });
  }, [allFlights, filters]);

  // Restore flights from localStorage on initial mount
  useEffect(() => {
    const savedFlights = localStorage.getItem('SearchedFlights');
    if (savedFlights && flightsData.length === 0) {
      const parsedFlights = JSON.parse(savedFlights);
      dispatch(setFlights(parsedFlights));
      setAllFlights(parsedFlights);
      setLoading(false); // skip fetching
    }
  }, [dispatch, flightsData.length]);

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

  const UserIp = async () => {
    const UserIpAdd = await getUserIP()
    return UserIpAdd

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



    const getFlights = async () => {
      try {

        const ip = await getUserIP();
        const requestPayload = {
          UserIp: ip,
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
        
        const response = await fetchFlightData(requestPayload);
        const result = response?.Result?.[0] || [];
        localStorage.setItem("searchToken", response?.SearchTokenId);
        localStorage.setItem("rasocommision", response?.rasutripCommissionPercentage);

        localStorage.setItem("UserIp", response?.UserIp);
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

  if (loading) return <div className="text-center my-4"><FlightLoader message="Searching flights..." /></div>;
  if (error) return <div className="text-danger text-center my-4">{error}</div>;

  return (
    <div className="my-4 overflow-auto" >
      <h5 className="mb-2">Showing {filteredFlights?.length} of {allFlights?.length} Flights</h5>
      <p className="text-muted">
        Departure Date: <strong>{displayDate}</strong>
      </p>

      {filteredFlights?.length === 0 ? (
        <div className="text-center my-4">
          <p className="text-muted">No flights found matching your filters.</p>
        </div>
      ) : (
        filteredFlights?.map((flight, idx) => (
          <FlightCard key={idx} flight={flight} />
        ))
      )}
    </div>
  );
};

export default FlightList;