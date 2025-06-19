import { Container, Row, Col } from 'react-bootstrap';
import BusFareSummary from '../BusFareSummary'
import BusPromoCode from '../BusPromoCode'
import BusStep from '../BusStep';
import BusReviewInfo from './BusReviewInfo';

const BusReview = () => {
    return (
        <div>
            <Container className='mt-5 pt-3'>
                <Row>
                    <Col>
                        <BusStep activeIndex={2} />
                    </Col>
                </Row>

                <Row>
                    <Col lg={9}>
                        <BusReviewInfo />
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

export default BusReview