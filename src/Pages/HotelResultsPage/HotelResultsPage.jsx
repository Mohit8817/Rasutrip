import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './HotelResultsPage.css';
import FilterSidebar from '../../Components/Hotel/Hotelpage/FilterSidebar';
import SearchSummary from '../../Components/Hotel/Hotelpage/SearchSummary';
import HotelList from '../../Components/Hotel/Hotelpage/HotelList';

const HotelResultsPage = () => {
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [actualPriceRange, setActualPriceRange] = useState([0, 20000]);
  const [starRatings, setStarRatings] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [hotelNames, setHotelNames] = useState([]); // This holds all hotel names for dropdown

  return (
    <Container className=''>
      <Row>
        <Col>
          <SearchSummary />
        </Col>
      </Row>

      <Row className='mt-4'>
        {/* Sidebar */}
        <Col lg={3}>
          <FilterSidebar
            priceRange={priceRange}
            actualPriceRange={actualPriceRange}
            onPriceChange={setPriceRange}
            selectedRatings={starRatings}
            onRatingChange={setStarRatings}
            searchName={searchName}
            onSearchNameChange={setSearchName}
            hotelNames={hotelNames} // pass hotel names for dropdown
          />
        </Col>

        {/* Hotel List */}
        <Col lg={9}>
          <HotelList
            priceRange={priceRange}
            selectedRatings={starRatings}
            searchName={searchName}
            setActualPriceRange={setActualPriceRange}
            setHotelNames={setHotelNames} // allow HotelList to set hotelNames for dropdown
          />
        </Col>
      </Row>
    </Container>
  );
};

export default HotelResultsPage;
