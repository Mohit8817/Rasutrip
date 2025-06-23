import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import RoundTripCard from './RoundTripCard';
import { fetchFlightData } from '../../Components/FlightApi/FlightApi';

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

        const getFlights = async () => {
            try {
                const response = await fetchFlightData(requestPayload);
                const result = response?.Result || [];
                console.log("RESULT:", result);

                const transformedFlights = result.map((item) => {
                    const onward = item?.Segments?.[0]?.[0];
                    const returnSeg = item?.Segments?.[1]?.[0];
                    const fare = item?.FareList?.[0];

                    return {
                        // Onward Journey
                        airlineOnward: onward?.Airline?.AirlineName || 'N/A',
                        airlineLogoOnward: onward?.Airline?.airlineLogo || '',
                        flightNumberOnward: onward?.Airline
                            ? `${onward.Airline.AirlineCode}-${onward.Airline.FlightNumber}`
                            : 'N/A',
                        fromCode: onward?.Origin?.AirportCode || '',
                        fromTime: moment(onward?.Origin?.DepartTime).format('HH:mm'),
                        fromDate: moment(onward?.Origin?.DepartTime).format('DD MMM'),
                        toCode: onward?.Destination?.AirportCode || '',
                        toTime: moment(onward?.Destination?.ArrivalTime).format('HH:mm'),
                        toDate: moment(onward?.Destination?.ArrivalTime).format('DD MMM'),
                        durationOnward: `${Math.floor(onward?.Duration / 60)} h ${onward?.Duration % 60} m`,

                        // Return Journey
                        airlineReturn: returnSeg?.Airline?.AirlineName || 'N/A',
                        airlineLogoReturn: returnSeg?.Airline?.airlineLogo || '',
                        flightNumberReturn: returnSeg?.Airline
                            ? `${returnSeg.Airline.AirlineCode}-${returnSeg.Airline.FlightNumber}`
                            : 'N/A',
                        returnFromCode: returnSeg?.Origin?.AirportCode || '',
                        returnFromTime: moment(returnSeg?.Origin?.DepartTime).format('HH:mm'),
                        returnFromDate: moment(returnSeg?.Origin?.DepartTime).format('DD MMM'),
                        returnToCode: returnSeg?.Destination?.AirportCode || '',
                        returnToTime: moment(returnSeg?.Destination?.ArrivalTime).format('HH:mm'),
                        returnToDate: moment(returnSeg?.Destination?.ArrivalTime).format('DD MMM'),
                        durationReturn: `${Math.floor(returnSeg?.Duration / 60)} h ${returnSeg?.Duration % 60} m`,

                        seatsLeft: fare?.SeatBaggage?.[0]?.[0]?.NoOfSeatAvailable || 1,
                        airlineRemark: fare?.AirlineRemark || 'N/A',

                        fareOptions: [
                            {
                                price: `₹ ${fare?.Fare?.OfferedPrice || 0}`,
                                label: fare?.FareType || 'Standard',
                                refundable: fare?.IsRefundable,
                                selected: true,
                            },
                        ],
                    };
                });

                setFlights(transformedFlights);
            } catch (err) {
                console.error("Error fetching round trip flights:", err);
                setError("Failed to fetch flights.");
            } finally {
                setLoading(false);
            }
        };

        getFlights();
    }, [fromCode, toCode, departDate, returnDate, passengers, cabinClass]);

    if (loading) return <div className="text-center my-4">Loading flights...</div>;
    if (error) return <div className="text-danger text-center my-4">{error}</div>;

    return (
        <div className="px-4">
            {flights.length > 0 ? (
                flights.map((flight, index) => (
                    <RoundTripCard key={index} flight={flight} />
                ))
            ) : (
                <div className="text-center text-muted">No flights found for this round trip.</div>
            )}
        </div>
    );
};

export default RoundTripCardList;
