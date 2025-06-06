import { Container, Row, Col } from 'react-bootstrap';
import TravelDate from './TravelDate'
import SearchButton from '../FlightBooking/SearchButton'

const BusBooking = () => {
    return (
        <div>
            <Container>
                <Row className="align-items-center">
                    <Col lg={5}>
                    </Col>
                    <Col lg={5}>
                        <TravelDate />
                    </Col>
                    <Col lg={2}>
                        <SearchButton />
                    </Col>
                </Row>




            </Container>



        </div>
    )
}

export default BusBooking