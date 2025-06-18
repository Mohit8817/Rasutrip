import { Container, Row, Col } from 'react-bootstrap';
import './HotelResultsPage.css';
import FilterSidebar from '../../Components/Hotel/Hotelpage/FilterSidebar';
import SearchSummary from '../../Components/Hotel/Hotelpage/SearchSummary';
import SortBar from '../../Components/Hotel/Hotelpage/SortBar';
import HotelCard from '../../Components/Hotel/Hotelpage/HotelCard';
import Card1 from "../../assest/crd1.jpeg";
import HotelList from '../../Components/Hotel/Hotelpage/HotelList';

const HotelResultsPage = () => {
  const hotels = [
    {
      name: "ELIVAAS 1 BHK with Rooftop Pool - Kamerios Verano",
      location: "Pilerne - Candolim Rd, Saipem Goa India",
      rating: 5,
      price: 3904.49,
      image: Card1,
    },
    {
      name: "ELIVAAS Kamerios Verano 1 BHK with Pool",
      location: "Pilerne - Candolim Rd Marra India",
      rating: 4,
      price: 3936.16,
      image: Card1,
    }
  ];

  return (
    <>

      {/* <div className="results-container mt-5 pt-5">

        <div className="results-content mt-3">


        </div>
      </div> */}

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
            <div className="">
              <SortBar />
              {hotels.map((hotel, index) => (
                <HotelCard key={index} {...hotel} />
              ))}

              <div>
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
