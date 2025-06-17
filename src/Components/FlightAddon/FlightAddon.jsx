import React from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import BookingSteps from '../FlightDetails/BookingSteps';
import FareSummary from '../FlightDetails/FareSummary';
import PromoCodeBox from '../FlightDetails/PromoCodeBox';


import '../../Style/Pagescss/FlightResultsPage.css';
import Addoninfo from './Addoninfo';


const FlightAddon = () => {

    
    return (
        <div>


            <Container style={{ marginTop: '8rem' }}>

                <Row>
                    <div>
                        <BookingSteps activeIndex={2} />
                    </div>
                </Row>
                <Row>
                    <Col lg={9}>
                        <div >

                        <Addoninfo/>
                        </div>

                    </Col>
                    <Col lg={3}>
                        <div>
                            <FareSummary />
                            <PromoCodeBox />

                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default FlightAddon