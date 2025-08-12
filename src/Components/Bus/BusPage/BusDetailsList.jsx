import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import BusDetailsCard from "./BusDetailsCard";
import BusSeatSelect from "./BusSeatSelect";
import "../../../Style/Pagescss/BusResultPage.css";

const BusDetailsList = ({
  masterBusList,
  priceRange,
  selectedOperators,
  selectedBusTypes,
}) => {
  const [busList, setBusList] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showSeatModal, setShowSeatModal] = useState(false);

  // Apply filters when any of them change
  useEffect(() => {
    if (!masterBusList.length) {
      setBusList([]);
      return;
    }

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
        <div className="flex-fill text-center">Sort By:</div>
        <div className="flex-fill text-center fw-bold">Depart</div>
        <div className="flex-fill text-center fw-bold">Duration</div>
        <div className="flex-fill text-center fw-bold">Arrive</div>
        <div className="flex-fill text-center fw-bold">Price</div>
      </div>

      {busList.map((bus, idx) => (
        <BusDetailsCard key={idx} bus={bus} onSelect={handleBusClick} />
      ))}

      <BusSeatSelect
        show={showSeatModal}
        onHide={() => setShowSeatModal(false)}
        bus={selectedBus}
      />
    </Container>
  );
};

export default BusDetailsList;