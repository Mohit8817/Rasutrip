import { Card, Button, Row, Col, Container } from 'react-bootstrap';
import '../../Style/Dealsection.css';

const DealCard = ({ ...deal }) => {
    const { image, title, subtitle, type } = deal;
    return (
        <Container className="">
            <Row className="justify-content-center">
                <Col xs={12} md={10} lg={8}>
                    <Card className="deal-card-custom d-flex flex-row align-items-center">
                        <div className="deal-image-wrapper">
                            <img
                                src={image}
                                alt={title}
                                className="deal-image-custom"
                            />
                        </div>
                        <div className="deal-content">

                           <div className='deal-badge-wrapper'>
                             <div className="deal-badge">{type}</div>
                           </div>

                            <h5 className="deal-title">{title}</h5>
                            <p className="deal-subtitle">{subtitle}</p>
                            <div className="deal-button-wrapper">
                                <Button variant="link" className="deal-link">
                                    Book Now
                                </Button>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DealCard;
