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
            <Container className='mt-5'>
                <Row>
                    <Col>
                        <BusStep activeIndex={0} />
                    </Col>
                </Row>

                <Row>
                    <Col lg={9}>
                        {/* BusDetailinfo will handle displaying bus details and seat info */}
                        <BusDetailinfo />
                    </Col>
                    <Col lg={3}>
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