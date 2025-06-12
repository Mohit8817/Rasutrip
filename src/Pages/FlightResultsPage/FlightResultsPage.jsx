import { Container, Row, Col } from 'react-bootstrap';
import FlightSearchBar from '../../Components/FlightOneWay/FlightSearchBar/FlightSearchBar'
import FlightSidebar from '../../Components/FlightOneWay/FlightSearchBar/FlightSidebar';
import FlightList from '../../Components/FlightOneWay/FlightSearchBar/FlightList';

const FlightResultsPage = () => {
    return (
        <div>

            <Container className='mt-5 pt-5'>
                <Row>
                    <Col>
                        <FlightSearchBar />
                    </Col>
                </Row>

                <Row className='mt-4'>
                    <Col lg={3}>
                        <FlightSidebar />
                    </Col>

                    <Col lg={9}>
                        <FlightList />
                    </Col>
                </Row>
            </Container>

        </div>
    )
}

export default FlightResultsPage