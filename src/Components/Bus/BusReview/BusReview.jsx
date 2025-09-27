import { Container, Row, Col } from 'react-bootstrap';
import BusFareSummary from '../BusFareSummary';
import BusStep from '../BusStep';
import BusReviewInfo from './BusReviewInfo';
import { useLocation } from 'react-router-dom';

const BusReview = () => {
    const location = useLocation();
    const { travellerInfo, totalPrice } = location.state || {};

    return (
        <div>
            <Container className='mt-lg-5 mt-3'>
                <Row className='g-2'>
                    <Col xs={12}>
                        <BusStep activeIndex={2} />
                    </Col>
                </Row>

                <Row className='g-2 mt-2'>
                    <Col lg={9} xs={12} className='mb-3 mb-lg-0'>
                        <BusReviewInfo travellerInfo={travellerInfo} />
                    </Col>
                    <Col lg={3} xs={12}>
                        <BusFareSummary totalPrice={totalPrice} />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BusReview;