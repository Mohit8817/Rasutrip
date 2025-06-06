import { Container, Row, Col } from 'react-bootstrap';

import CitySelector from './CitySelector'
import DateSelector from './DateSelector'
import GuestRoomSelector from './GuestRoomSelector'
import CountrySelector from './CountrySelector'
import SearchButton from '../FlightBooking/SearchButton'

const HotelSearchForm = () => {
    return (
        <div>
            <Container>

                <Row>
                    <Col>
                        <h6 className="fw-bold mb-3 text-start">Book Domestic and International Hotels</h6>

                    </Col>
                </Row>
                <Row className='mt-2'>
                    <Col lg={3}>
                        <CitySelector />
                    </Col>
                    <Col lg={3}>
                        <DateSelector />
                    </Col>
                    <Col lg={3}>
                        <GuestRoomSelector />
                    </Col>
                    <Col lg={2}>
                        <CountrySelector />
                    </Col>
                    <Col lg={1}>

                        <SearchButton />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default HotelSearchForm