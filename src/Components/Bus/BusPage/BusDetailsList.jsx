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
      <div className="sort-header flex flex-wrap items-center justify-between bg-gray-100 rounded-md p-2 mb-2 text-sm sm:text-base">
        <div className="w-1/2 sm:w-1/5 text-center py-1 font-medium">Sort By:</div>
        <div className="w-1/2 sm:w-1/5 text-center py-1">Depart</div>
        <div className="w-1/2 sm:w-1/5 text-center py-1">Duration</div>
        <div className="w-1/2 sm:w-1/5 text-center py-1">Arrive</div>
        <div className="w-1/2 sm:w-1/5 text-center py-1">Price</div>
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