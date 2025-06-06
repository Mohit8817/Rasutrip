import { Container, Row, Col } from 'react-bootstrap';
import TravelDate from './TravelDate'
import SearchButton from '../FlightBooking/SearchButton'
import Location from './Location';

const BusBooking = () => {
    return (
        <div>
            <Container>
                <Row className="align-items-center">
                    <Col lg={6}>
                    <Location/>
                    </Col>
                    <Col lg={4}>
                        <TravelDate />
                    </Col>
                    <Col lg={2}>
                    <div className='mt-4'>
                        <SearchButton />
                    </div>
                        
                    </Col>
                </Row>




            </Container>



        </div>
    )
}

export default BusBooking