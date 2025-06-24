import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import RoundTripCard from './RoundTripCard';
import { fetchFlightData } from '../../Components/FlightApi/FlightApi';
import { Row, Col } from 'react-bootstrap'; 

const RoundTripCardList = () => {
    const { state } = useLocation();

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
    useEffect(() => {
        const requestPayload = {
            UserIp: "27.60.0.238",
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
                    PreferredTime: moment(departDate).format("YYYY-MM-DD[T]00:00:00"),
                },
                {
                    Origin: toCode,
                    Destination: fromCode,
                    PreferredTime: moment(returnDate).format("YYYY-MM-DD[T]00:00:00"),
                },
            ],
            Sources: null,
        };

        console.log("check Payloaddddddddddddddddddd", requestPayload)

        const getFlights = async () => {
            try {
                const response = await fetchFlightData(requestPayload);
                const result = response?.Result || [];
                console.log("RESULT:", result);

                setFlights(result || []);

            } catch (err) {
                console.error("Error fetching round trip flights:", err);
                setError("Failed to fetch flights.");
            } finally {
                setLoading(false);
            }
        };

        getFlights();
    // }, [fromCode, toCode, departDate, returnDate, passengers, cabinClass]);
      },);

    if (loading) return <div className="text-center my-4">Loading flights...</div>;
    if (error) return <div className="text-danger text-center my-4">{error}</div>;

    return (
      <div className="px-4">
  {flights?.length > 0 ? (
    <Row>
      {/* Onward Flights - Left Column */}
      <Col md={6}>
        {Array.isArray(flights[0]) &&
          flights[0].map((flight, index) => (
            <RoundTripCard key={`f0-${index}`} flight={flight} type="onward" />
          ))}
      </Col>

      {/* Return Flights - Right Column */}
      <Col md={6}>
        {Array.isArray(flights[1]) &&
          flights[1].map((flight, index) => (
            <RoundTripCard key={`f1-${index}`} flight={flight} type="return" />
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
