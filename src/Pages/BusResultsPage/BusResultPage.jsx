import { Container, Row, Col } from "react-bootstrap";
import { useState } from "react";
import BusSearchSummary from "../../Components/Bus/BusPage/BusSearchSummary";
import BusSidebarFilter from "../../Components/Bus/BusPage/BusSidebarFilter";
import BusDetailsList from "../../Components/Bus/BusPage/BusDetailsList";

const BusResultPage = () => {
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [actualPriceRange, setActualPriceRange] = useState([0, 10000]);

    const [selectedOperators, setSelectedOperators] = useState([]);
    const [selectedBusTypes, setSelectedBusTypes] = useState([]);

    const [availableOperators, setAvailableOperators] = useState([]);
    const [availableBusTypes, setAvailableBusTypes] = useState([]);

    return (
        <div> 
            <Container className="mt-5 pt-5 innerpagecontainer">
                <Row>
                    <Col>
                        <BusSearchSummary />
                    </Col>
                </Row>
                <Row className="mt-4">
                    <Col lg={3}>
                        <BusSidebarFilter
                            priceRange={priceRange}
                            actualPriceRange={actualPriceRange}
                            onPriceChange={setPriceRange}
                            selectedOperators={selectedOperators}
                            setSelectedOperators={setSelectedOperators}
                            selectedBusTypes={selectedBusTypes}
                            setSelectedBusTypes={setSelectedBusTypes}
                            availableOperators={availableOperators}
                            availableBusTypes={availableBusTypes}
                        />
                    </Col>
                    <Col lg={9}>
                        <BusDetailsList
                            priceRange={priceRange}
                            setActualPriceRange={setActualPriceRange}
                            selectedOperators={selectedOperators}
                            selectedBusTypes={selectedBusTypes}
                            setAvailableOperators={setAvailableOperators}
                            setAvailableBusTypes={setAvailableBusTypes}
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BusResultPage;
