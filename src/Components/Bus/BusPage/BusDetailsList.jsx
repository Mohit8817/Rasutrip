/* -----------------------------------------------
   BusDetailsList.jsx  –  merged & enhanced version
------------------------------------------------ */
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

  const [masterBusList, setMasterBusList] = useState([]);
  const [busList, setBusList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showSeatModal, setShowSeatModal] = useState(false);

  const getDuration = useCallback((start, end) => {
    const ms = end - start;
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
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

        const mapped = apiResult.Result.map((item) => {
          const dep = new Date(item.DepartureTime);
          const arr = new Date(item.ArrivalTime);

          return {
            operator: item.TravelName || "N/A",
            serviceName: item.ServiceName || "N/A",
            busType: item.BusType || "N/A",
            departTime: dep.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            arriveTime: arr.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            departDate: dep.toLocaleDateString("en-CA"),
            arriveDate: arr.toLocaleDateString("en-CA"),
            departLocation: item.BoardingPointsDetails?.[0]?.CityPointLocation || from,
            arriveLocation: item.DroppingPointsDetails?.[0]?.CityPointLocation || to,
            duration: getDuration(dep, arr),
            price: item.BusPrice?.PublishedPrice
              ? `₹ ${item.BusPrice.PublishedPrice.toFixed(2)}`
              : "Price Not Available",
            numericPrice: item.BusPrice?.PublishedPrice || 0,
            seatsAvailable: item.AvailableSeats || 0,
            cancellationPolicies: item.CancellationPolicies || [],
            ResultIndex: item.ResultIndex,
            SearchTokenId: apiResult.SearchTokenId,
            OriginId,
            DestinationId,
            UserIp,
            BoardingPointsDetails: item.BoardingPointsDetails || [],
            DroppingPointsDetails: item.DroppingPointsDetails || [],
          };
        });

        setMasterBusList(mapped);

        const prices = mapped.map((b) => b.numericPrice);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setActualPriceRange([min, max]);

        setAvailableOperators([...new Set(mapped.map((b) => b.operator))]);
        setAvailableBusTypes([...new Set(mapped.map((b) => b.busType))]);
      } catch (err) {
        console.error("Bus API Error:", err);
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
    to,
    getDuration,
    setActualPriceRange,
    setAvailableOperators,
    setAvailableBusTypes,
  ]);

  // Apply filters when any of them change
  useEffect(() => {
    if (!masterBusList.length) return;

    const filtered = masterBusList.filter(
      (b) =>
        b.numericPrice >= priceRange[0] &&
        b.numericPrice <= priceRange[1] &&
        (selectedOperators.length === 0 || selectedOperators.includes(b.operator)) &&
        (selectedBusTypes.length === 0 || selectedBusTypes.includes(b.busType))
    );

    setBusList(filtered);
  }, [priceRange, selectedOperators, selectedBusTypes, masterBusList]);

  const handleBusClick = (bus) => {
    setSelectedBus(bus);
    setShowSeatModal(true);
  };

  return (
    <Container className="bus-list-container">
      <div className="sort-header d-flex p-2 mb-2">
        <div className="flex-fill text-center">Sort By:</div>
        <div className="flex-fill text-center fw-bold">Depart</div>
        <div className="flex-fill text-center fw-bold">Duration</div>
        <div className="flex-fill text-center fw-bold">Arrive</div>
        <div className="flex-fill text-center fw-bold">Price</div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Busloader />
        </div>
      ) : busList.length ? (
        busList.map((bus, idx) => (
          <BusDetailsCard key={idx} bus={bus} onSelect={handleBusClick} />
        ))
      ) : (
        <div className="text-center text-muted py-5">
          No buses found for your search.
        </div>
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
