import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import BusDetailsCard from './BusDetailsCard';
import { fetchBusResults } from '../../APIS/BusApi/BusApis';
import "../../../Style/Pagescss/BusResultPage.css";

const BusDetailsList = () => {
  const { state } = useLocation();

  const from = state?.fromCity || null;
  const to = state?.toCity || null;
  const formattedDate = state?.departDate || null;
  const DateOfJourney = formattedDate?.split('T')[0]; // Extract "YYYY-MM-DD"

  const OriginId = state?.fromCityId;
  const DestinationId = state?.toCityId;
  const UserIp = "122.161.64.143";

  const [busList, setBusList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calculate duration between departure and arrival
  const getDuration = (start, end) => {
    const ms = end - start;
    const hrs = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m`;
  };

  // Fetch bus result data
  useEffect(() => {
    const getBusData = async () => {
      if (!from || !to || !DateOfJourney) return;

      setLoading(true);

      try {
        const apiResult = await fetchBusResults(DateOfJourney, OriginId, DestinationId, UserIp);

        const mapped = apiResult.Result.map((item) => {
          const dep = new Date(item.DepartureTime);
          const arr = new Date(item.ArrivalTime);

          return {
            operator: item.TravelName || "N/A",
            serviceName: item.ServiceName || "N/A",
            busType: item.BusType,
            departTime: dep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            departDate: dep.toLocaleDateString('en-CA'),
            departLocation: item.BoardingPointsDetails?.[0]?.CityPointLocation || from,
            duration: getDuration(dep, arr),
            arriveTime: arr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            arriveDate: arr.toLocaleDateString('en-CA'),
            arriveLocation: item.DroppingPointsDetails?.[0]?.CityPointLocation || to,
            price: item.BusPrice?.PublishedPrice
              ? `₹ ${item.BusPrice.PublishedPrice.toFixed(2)}`
              : "Price Not Available",
            seatsAvailable: item.AvailableSeats || 0,
            mTicket: item.MTicketEnabled,
            liveTracking: item.LiveTrackingAvailable,
            idProofRequired: item.IdProofRequired,
            maxSeatsPerTicket: item.MaxSeatsPerTicket,
            partialCancellationAllowed: item.PartialCancellationAllowed,
            operatorId: item.OperatorId,
            resultIndex: item.ResultIndex,
            routeId: item.RouteId,
            cancellationPolicies: item.CancellationPolicies || [] // ✅ Include this
          };
        });


        setBusList(mapped);
      } catch (error) {
        console.error("API Error:", error);
      }

      setLoading(false);
    };

    getBusData();
  }, [from, to, DateOfJourney, OriginId, DestinationId]);

  return (
    <Container className="bus-list-container">
      <div className="sort-header d-flex p-2 mb-2">
        <div className="flex-fill text-center">Sort By:</div>
        <div className="flex-fill text-center fw-bold">Depart</div>
        <div className="flex-fill text-center fw-bold">Duration</div>
        <div className="flex-fill text-center fw-bold">Arrive</div>
        <div className="flex-fill text-center fw-bold">Price</div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : busList.length > 0 ? (
        busList.map((bus, idx) => <BusDetailsCard key={idx} bus={bus} />)
      ) : (
        <div className="text-center text-muted py-5">No buses found for your search.</div>
      )}
    </Container>
  );
};

export default BusDetailsList;
