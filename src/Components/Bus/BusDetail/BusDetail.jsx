import { Container, Row, Col } from 'react-bootstrap';
import BusStep from "../BusStep"
import BusDetailinfo from "./BusDetailinfo"
import BusFareSummary from "../BusFareSummary"
import BusPromoCode from "../BusPromoCode"
import { useLocation } from 'react-router-dom';

const BusDetail = () => {
    const location = useLocation();
    
    // Extract all the data that should be passed from BusResultPage or previous components
    const locationState = location.state || {};
    
    console.log("BusDetail - Full location state:", locationState);
    
    return (
        <div>
            <Container className='px-2 px-md-3 mt-2 mt-md-5'>
                <Row className='mb-2 mb-md-4'>
                    <Col>
                        <BusStep activeIndex={0} />
                    </Col>
                </Row>
                
                <Row className='g-2 g-md-3'>
                    <Col xs={12} lg={9} className='mb-3 mb-lg-0'>
                        {/* BusDetailinfo will handle displaying bus details and seat info */}
                        <BusDetailinfo />
                    </Col>
                    <Col xs={12} lg={3}>
                        {/* BusFareSummary will automatically get data from useLocation()
                             and calculate fare based on selected seats */}
                        <BusFareSummary
                            showVendorCommission={true}
                        // vendorCommissionPercentage will be taken dynamically from API data
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default BusDetail