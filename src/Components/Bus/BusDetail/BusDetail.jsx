import { Container, Row, Col } from 'react-bootstrap';
import BusStep from "../BusStep"
import BusDetailinfo from "./BusDetailinfo"
import BusFareSummary from "../BusFareSummary"
import BusPromoCode from "../BusPromoCode"
import { useLocation } from 'react-router-dom';



const BusDetail = () => {

      const location = useLocation();
  const { totalPrice } = location.state || {};

    return (
        <div>

            <Container className='mt-5 pt-3'>
                <Row>
                    <Col>
                        <BusStep activeIndex={0} />
                    </Col>
                </Row>

                <Row>
                    <Col lg={9}>
                        <BusDetailinfo />
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

export default BusDetail