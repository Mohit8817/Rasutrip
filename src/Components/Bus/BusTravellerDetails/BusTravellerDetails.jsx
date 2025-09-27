import { Container, Row, Col } from 'react-bootstrap';
import BusStep from "../BusStep"
import BusTravellerinfo from './BusTravellerinfo';
import BusFareSummary from '../BusFareSummary';
import BusPromoCode from '../BusPromoCode';
import { useLocation } from 'react-router-dom';

const BusTravellerDetails = () => {
    const location = useLocation();
    const {totalPrice } = location.state || {};

    return (
        <div>
            <Container className='mt-3 mt-md-5' style={{ padding: '0 10px' }}>
                <Row className='mb-2 mb-md-3'>
                    <Col>
                        <BusStep activeIndex={1} />
                    </Col>
                </Row>

                <Row className='g-2 g-md-3'>
                    <Col xs={12} lg={9} className='mb-3 mb-lg-0'>
                        <BusTravellerinfo />
                    </Col>
                    <Col xs={12} lg={3}>
                        <BusFareSummary totalPrice={totalPrice} />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default BusTravellerDetails