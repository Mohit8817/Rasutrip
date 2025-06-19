import { Container, Row, Col } from 'react-bootstrap';
import BusStep from "../BusStep"
import BusTravellerinfo from './BusTravellerinfo';
import BusFareSummary from '../BusFareSummary';
import BusPromoCode from '../BusPromoCode';

const BusTravellerDetails = () => {
    return (
        <div>

            <Container className='mt-5 pt-3'>
                <Row>
                    <Col>
                        <BusStep activeIndex={1} />
                    </Col>
                </Row>

                <Row>
                    <Col lg={9}>
                        <BusTravellerinfo />
                    </Col>
                    <Col lg={3}>
                        <BusFareSummary />
                        <BusPromoCode />

                    </Col>
                </Row>
            </Container>


        </div>
    )
}

export default BusTravellerDetails