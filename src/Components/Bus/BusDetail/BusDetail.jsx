import { Container, Row, Col } from 'react-bootstrap';
import BusStep from "../BusStep"
import BusDetailinfo from "./BusDetailinfo"
import BusFareSummary from "../BusFareSummary"
import BusPromoCode from "../BusPromoCode"

const BusDetail = () => {
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

                        <BusFareSummary />
                        <BusPromoCode />

                    </Col>
                </Row>
            </Container>


        </div>
    )
}

export default BusDetail