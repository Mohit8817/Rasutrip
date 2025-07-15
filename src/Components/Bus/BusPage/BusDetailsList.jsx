import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";
import BusDetailsCard from "./BusDetailsCard";
import BusSeatSelect from "./BusSeatSelect";
import { fetchBusResults } from "../../APIS/BusApi/BusApis";
import "../../../Style/Pagescss/BusResultPage.css";
import Busloader from "../Busloader/Busloader";

const USER_IP_FALLBACK = "122.161.64.143";

const BusDetailsList = ({
  priceRange,
  setActualPriceRange,
  selectedOperators,
  selectedBusTypes,
  setAvailableOperators,
  setAvailableBusTypes,
}) => {
  const { state } = useLocation();
  const from = state?.fromCity ?? null;
  const to = state?.toCity ?? null;
  const formattedDate = state?.departDate ?? null;
  const DateOfJourney = formattedDate?.split("T")[0];
  const OriginId = state?.fromCityId;
  const DestinationId = state?.toCityId;
  const UserIp = USER_IP_FALLBACK;

  const [busList, setBusList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showSeatModal, setShowSeatModal] = useState(false);

  const getDuration = useCallback((start, end) => {
    const ms = end - start;
    const hrs = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m`;
  }, []);

  useEffect(() => {
    const getBusData = async () => {
      if (!from || !to || !DateOfJourney) return;

      setLoading(true);

      try {
        const apiResult = await fetchBusResults(
          DateOfJourney,
          OriginId,
          DestinationId,
          UserIp
        );

        const prices = apiResult.Result.map((item) =>
          item.BusPrice?.PublishedPrice || 0
        );
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setActualPriceRange([min, max]);

        const mapped = apiResult.Result.map((item) => {
          const dep = new Date(item.DepartureTime);
          const arr = new Date(item.ArrivalTime);

          return {
            operator: item.TravelName || "N/A",
            busType: item.BusType || "N/A",
            departTime: dep.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            arriveTime: arr.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            departDate: dep.toLocaleDateString("en-CA"),
            arriveDate: arr.toLocaleDateString("en-CA"),
            departLocation: item.BoardingPointsDetails?.[0]?.CityPointLocation || from,
            arriveLocation: item.DroppingPointsDetails?.[0]?.CityPointLocation || to,
            duration: getDuration(dep, arr),
            price: item.BusPrice?.PublishedPrice?.toFixed(2),
            numericPrice: item.BusPrice?.PublishedPrice || 0,
            seatsAvailable: item.AvailableSeats || 0,
            ResultIndex: item.ResultIndex,
            SearchTokenId: apiResult.SearchTokenId,
            OriginId,
            DestinationId,
            UserIp,
            BoardingPointsDetails: item.BoardingPointsDetails || [],
            DroppingPointsDetails: item.DroppingPointsDetails || [],
          };
        });

        // Populate dynamic filters
        const operatorSet = [...new Set(mapped.map((bus) => bus.operator))];
        const busTypeSet = [...new Set(mapped.map((bus) => bus.busType))];
        setAvailableOperators(operatorSet);
        setAvailableBusTypes(busTypeSet);

        const filtered = mapped.filter(
          (bus) =>
            bus.numericPrice >= priceRange[0] &&
            bus.numericPrice <= priceRange[1] &&
            (selectedOperators.length === 0 || selectedOperators.includes(bus.operator)) &&
            (selectedBusTypes.length === 0 || selectedBusTypes.includes(bus.busType))
        );

        setBusList(filtered);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    getBusData();
  }, [
    DateOfJourney,
    DestinationId,
    OriginId,
    UserIp,
    from,
    getDuration,
    to,
    priceRange,
    selectedOperators,
    selectedBusTypes,
    setActualPriceRange,
    setAvailableOperators,
    setAvailableBusTypes,
  ]);

  const handleBusClick = (bus) => {
    setSelectedBus(bus);
    setShowSeatModal(true);
  };

  return (
    <Container className="bus-list-container">
      <div className="sort-header d-flex p-2 mb-2">
        <div className="flex-fill text-center">Sort&nbsp;By:</div>
        <div className="flex-fill text-center fw-bold">Depart</div>
        <div className="flex-fill text-center fw-bold">Duration</div>
        <div className="flex-fill text-center fw-bold">Arrive</div>
        <div className="flex-fill text-center fw-bold">Price</div>
      </div>

      {loading ? (
        <div className="text-center py-5"><Busloader /></div>
      ) : busList.length ? (
        busList.map((bus, idx) => (
          <BusDetailsCard key={idx} bus={bus} onSelect={handleBusClick} />
        ))
      ) : (
        <div className="text-center text-muted py-5">No buses found for your search.</div>
      )}

      <BusSeatSelect
        show={showSeatModal}
        onHide={() => setShowSeatModal(false)}
        bus={selectedBus}
      />
    </Container>
  );
};

export default BusDetailsList;
