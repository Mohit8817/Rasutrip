import { Container, Row, Col } from 'react-bootstrap';
import './HotelResultsPage.css';
import FilterSidebar from '../../Components/Hotel/Hotelpage/FilterSidebar';
import SearchSummary from '../../Components/Hotel/Hotelpage/SearchSummary';
import SortBar from '../../Components/Hotel/Hotelpage/SortBar';
import HotelCard from '../../Components/Hotel/Hotelpage/HotelCard';
import Card1 from "../../assest/crd1.jpeg";
import HotelList from '../../Components/Hotel/Hotelpage/HotelList';
import HotelLoader from '../../Components/Hotel/HotelLoaderCard/HotelLoader';

const HotelResultsPage = () => {
  return (
    <>



      <Container className='mt-5 pt-5'>
        <Row>
          <Col>
            <SearchSummary />
          </Col>
        </Row>
        <Row className='mt-4'>
          <Col lg={3}>
            <FilterSidebar />
          </Col>
          <Col lg={9}>
            <SortBar />
            <div className="">
              <div>
                <HotelCard />
                <HotelList />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>

  );
};

export default HotelResultsPage;
