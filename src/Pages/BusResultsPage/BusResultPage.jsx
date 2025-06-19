import { Container, Row, Col } from 'react-bootstrap';
import BusSearchSummary from '../../Components/Bus/BusPage/BusSearchSummary';
import BusSidebarFilter from '../../Components/Bus/BusPage/BusSidebarFilter';
import BusDetailsList from '../../Components/Bus/BusPage/BusDetailsList';

const BusResultPage = () => {
    return (
        <div>
            <Container className='mt-5 pt-5'>
                <Row>
                    <Col>
                        <BusSearchSummary />
                    </Col>
                </Row>
                <Row className='mt-4'>
                    <Col lg={3}>
                        <BusSidebarFilter />
                    </Col>
                    <Col lg={9}>

                        <BusDetailsList />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default BusResultPage