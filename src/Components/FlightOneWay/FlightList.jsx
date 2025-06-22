import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import FlightCard from './FlightCards';
import { fetchFlightData } from '../../Components/FlightApi/FlightApi';

const FlightList = () => {
    const { state } = useLocation();

    const {
        // fromCity = 'Delhi',
        // toCity = 'Mumbai',
        // fromAirport = 'Delhi Airport',
        // toAirport = 'Mumbai Airport',
        fromCode = 'DEL', 
        toCode = 'BOM',  
        departDate = new Date(),
        passengers = { adults: 1, children: 0, infants: 0 },
        cabinClass = 2,
    } = state || {};

    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const requestPayload = {
            UserIp: "27.60.0.238",
            Adult: passengers.adults || 1,
            Child: passengers.children || 0,
            Infant: passengers.infants || 0,
            DirectFlight: false,
            JourneyType: 1,
            PreferredCarriers: null,
            CabinClass: cabinClass,
            AirSegments: [
                {
                    Origin: fromCode, // ✅ use city code
                    Destination: toCode, // ✅ use city code
                    PreferredTime: `${moment(departDate).format("YYYY-MM-DD")}T00:00:00`,
                },
            ],
            Sources: null,
        };

        console.log("Flight Search Request Payload:", requestPayload);

        const getFlights = async () => {
            try {
                const response = await fetchFlightData(requestPayload);
                console.log("Flight API Response:", response);

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
            <h5 className="mb-3">Showing {flights.length} Flights</h5>
            {flights.map((flight, idx) => (
                <FlightCard key={idx} flight={flight} />
            ))}
        </div>
    );
};

export default FlightList;
