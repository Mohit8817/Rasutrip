import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import './HotelResultsPage.css';
import FilterSidebar from '../../Components/Hotel/Hotelpage/FilterSidebar';
import SearchSummary from '../../Components/Hotel/Hotelpage/SearchSummary';
import HotelList from '../../Components/Hotel/Hotelpage/HotelList';
import HotelLoader from '../../Components/Hotel/HotelLoaderCard/HotelLoader';
import { fetchHotels, fetchHotelCities } from '../../Components/APIS/HotelApi/HotelAPi';

const HotelResultsPage = () => {
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [actualPriceRange, setActualPriceRange] = useState([0, 20000]);
  const [starRatings, setStarRatings] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [hotelNames, setHotelNames] = useState([]); // This holds all hotel names for dropdown
  
  // Hotel data state (similar to bus page)
  const [masterHotelList, setMasterHotelList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noHotelsFound, setNoHotelsFound] = useState(false);

  const { state } = useLocation();

  // Get search parameters from state
  const city = state?.city || "";
  const checkIn = state?.checkIn || "";
  const checkOut = state?.checkOut || "";
  const guests = Number(state?.guests || 1);
  const rooms = Number(state?.rooms || 1);
  const nights = Number(state?.nights || 1);
  const roomDetails = state?.roomDetails || [{ Adult: guests, Child: 0, ChildAge: [] }];
  const minRating = state?.minRating ?? 1;
  const maxRating = state?.maxRating ?? 5;
  const resultCount = state?.resultCount ?? 20;

  // Helper functions
  const getNights = (checkInDate, checkOutDate) => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end - start;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date) ? "" : date.toISOString().split("T")[0];
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch hotel data (moved from HotelList component)
  useEffect(() => {
    const getHotelData = async () => {
      if (!city || !checkIn || !checkOut) {
        setIsLoading(false);
        setError("Missing search parameters");
        return;
      }

      setIsLoading(true);
      setError(null);
      setNoHotelsFound(false);

      try {
        console.log("Fetching hotels for:", city, checkIn, checkOut);

        const cleanedCity = city?.split(",")[0]?.trim();
        const cityList = await fetchHotelCities(cleanedCity);

        const selectedCity = cityList.find(
          (item) =>
            item.destination &&
            cleanedCity.toLowerCase() === item.destination.toLowerCase()
        );

        if (!selectedCity) {
          setNoHotelsFound(true);
          setIsLoading(false);
          return;
        }

        const payload = {
          CheckInDate: formatDate(checkIn),
          CheckOutDate: formatDate(checkOut),
          NoOfNights: nights || getNights(checkIn, checkOut),
          CountryCode: "IN",
          DestinationCityId: selectedCity.city_id,
          ResultCount: resultCount,
          GuestNationality: "IN",
          NoOfRooms: rooms,
          RoomGuests: roomDetails,
          MaxRating: maxRating,
          MinRating: minRating,
          UserIp: "49.36.217.215",
        };

        const hotelResponse = await fetchHotels(payload);
        const { SearchTokenId, Result = [] } = hotelResponse || {};

        // Check if no hotels found
        if (!Result || Result.length === 0) {
          setNoHotelsFound(true);
          setIsLoading(false);
          return;
        }

        const formattedHotels = Result.map((item) => ({
          id: item.HotelCode,
          name: item.HotelName,
          location: item.HotelAddress,
          rating: item.StarRating,
          price: item.Price?.PublishedPrice || 0,
          tax: item.Price?.Tax || 0,
          image: item.HotelPicture,
          description: item.HotelDescription || "",
          resultIndex: item.ResultIndex,
          SearchTokenId,
        }));

        setMasterHotelList(formattedHotels);

        // Set price range
        const prices = formattedHotels.map((h) => h.price).filter(price => price > 0);
        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setActualPriceRange([minPrice, maxPrice]);
          setPriceRange([minPrice, maxPrice]); // Initialize priceRange with actual range
        }

        // Set hotel names for dropdown
        setHotelNames(formattedHotels.map((h) => h.name));

      } catch (err) {
        console.error("Hotel API Error:", err);
        setError("Failed to fetch hotel data");
      } finally {
        setIsLoading(false);
      }
    };

    getHotelData();
  }, [
    city,
    checkIn,
    checkOut,
    guests,
    rooms,
    nights,
    roomDetails,
    minRating,
    maxRating,
    resultCount,
  ]);

  // Show loader while data is loading
  if (isLoading) {
    return (
      <Container fluid className="min-vh-100">
        <Row>
          <Col className="text-center">
            <HotelLoader
              city={city}
              checkIn={formatDateForDisplay(checkIn)}
              checkOut={formatDateForDisplay(checkOut)}
              guests={guests}
              rooms={rooms}
            />
          </Col>
        </Row>
      </Container>
    );
  }

  // Show "No hotels found" message when no hotels are available
  if (noHotelsFound) {
    return (
      <Container fluid className="mt-5 pt-4 min-vh-100">
        <Row>
          <Col className="text-center">
            <div className="d-flex flex-column align-items-center">
              <i className="fas fa-hotel fa-4x text-muted mb-3"></i>
              <h4 className="text-muted">No Hotels Found</h4>
              <p className="text-muted">
                Sorry, no hotels are available for your selected location and dates.
              </p>
              <p className="text-secondary">
                City: <strong>{city}</strong>
              </p>
              <p className="text-secondary">
                Check-in: <strong>{formatDateForDisplay(checkIn)}</strong> → Check-out: <strong>{formatDateForDisplay(checkOut)}</strong>
              </p>
              <p className="text-secondary">
                Guests: <strong>{guests}</strong> | Rooms: <strong>{rooms}</strong>
              </p>
              <small className="text-muted mt-2">
                Please try searching for a different location or dates.
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  // Show error if any
  if (error) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center min-vh-100">
        <Row>
          <Col className="text-center">
            <h4>Error</h4>
            <p className="text-danger">{error}</p>
          </Col>
        </Row>
      </Container>
    );
  }

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
            masterHotelList={masterHotelList} // Pass master hotel list like bus page
            priceRange={priceRange}
            selectedRatings={starRatings}
            searchName={searchName}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default HotelResultsPage;