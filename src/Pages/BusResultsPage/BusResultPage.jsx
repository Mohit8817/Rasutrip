import { Container, Row, Col } from "react-bootstrap";
import { useState } from "react";
import BusSearchSummary from "../../Components/Bus/BusPage/BusSearchSummary";
import BusSidebarFilter from "../../Components/Bus/BusPage/BusSidebarFilter";
import BusDetailsList from "../../Components/Bus/BusPage/BusDetailsList";

const BusResultPage = () => {
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [actualPriceRange, setActualPriceRange] = useState([0, 10000]);

    return (
        <div>
            <Container className="mt-5 pt-5">
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
                        />
                    </Col>
                    <Col lg={9}>
                        <BusDetailsList
                            priceRange={priceRange}
                            setActualPriceRange={setActualPriceRange}
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BusResultPage;
