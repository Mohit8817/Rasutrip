import { Container, Row, Col } from 'react-bootstrap';
import BusFareSummary from '../BusFareSummary';
import BusPromoCode from '../BusPromoCode';
import BusStep from '../BusStep';
import { useLocation } from 'react-router-dom';
import BusPaymentInfo from './BusPaymentInfo';

const BusPayment = () => {

    const location = useLocation();
    const { travellerInfo, totalPrice } = location.state || {};
    return (
        <div>
            <Container className='mt-5'>
                <Row>
                    <Col>
                        <BusStep activeIndex={3} />
                    </Col>
                </Row>

                <Row>
                    <Col lg={9}>
                        <BusPaymentInfo />
                    </Col>
                    <Col lg={3}>
                        <BusFareSummary totalPrice={totalPrice} />
                        <BusPromoCode />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default BusPayment