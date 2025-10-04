import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import "./HotelResultsPage.css";
import FilterSidebar from "../../Components/Hotel/Hotelpage/FilterSidebar";
import SearchSummary from "../../Components/Hotel/Hotelpage/SearchSummary";
import HotelList from "../../Components/Hotel/Hotelpage/HotelList";
import HotelLoader from "../../Components/Hotel/HotelLoaderCard/HotelLoader";
import {
  fetchHotels,
  fetchHotelCities,
} from "../../Components/APIS/HotelApi/HotelAPi";
import { User } from "lucide-react";

const HotelResultsPage = () => {
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [actualPriceRange, setActualPriceRange] = useState([0, 20000]);
  const [starRatings, setStarRatings] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [hotelNames, setHotelNames] = useState([]);
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
  const roomDetails = state?.roomDetails || [
    { Adult: guests, Child: 0, ChildAge: [] },
  ];
  const resultCount = state?.resultCount ?? 20;

  // Helper function to calculate nights
  const getNights = (checkInDate, checkOutDate) => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end - start;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Parse date to ISO format
  const parseDateToISO = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split(" ");
    const day = parts[0].padStart(2, "0");
    const monthMap = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04",
      May: "05", Jun: "06", Jul: "07", Aug: "08",
      Sept: "09", Oct: "10", Nov: "11", Dec: "12",
    };
    const month = monthMap[parts[1]];
    const year = parts[2];
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch hotel data with dynamic IP
  useEffect(() => {
    const getHotelData = async () => {
      const cityId = state?.cityId;

      if (!city || !checkIn || !checkOut) {
        setIsLoading(false);
        setError("Missing search parameters");
        return;
      }

      setIsLoading(true);
      setError(null);
      setNoHotelsFound(false);

      try {
        console.log("🔍 Fetching hotels for:", city, checkIn, checkOut);
        console.log("📍 Using cityId:", cityId);

        let destinationCityId;

        // Use cityId from context if available
        if (cityId) {
          destinationCityId = cityId;
          console.log("✅ Using saved cityId:", destinationCityId);
        } else {
          // Fallback: search for city
          console.log("⚠️ No cityId found, searching for city...");
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

          destinationCityId = selectedCity.city_id;
        }

        // ✅ Prepare payload (dynamic IP will be added in fetchHotels function)
        const payload = {
          CheckInDate: parseDateToISO(checkIn),
          CheckOutDate: parseDateToISO(checkOut),
          NoOfNights: nights || getNights(checkIn, checkOut),
          CountryCode: state?.countryCode || "IN",
          DestinationCityId: Number(destinationCityId),
          ResultCount: resultCount,
          GuestNationality: "IN",
          NoOfRooms: rooms,
          RoomGuests: roomDetails.map((r) => ({
            Adult: Number(r.Adult || r.adults || guests),
            Child: Number(r.Child || r.children || 0),
            ChildAge: r.ChildAge || Array(r.Child || 0).fill(5),
          })),
          MaxRating: 5,
          MinRating: 1,
         
        };

        console.log("📤 API Payload (IP will be added dynamically):", payload);

        // ✅ fetchHotels will automatically add dynamic IP
        const hotelResponse = await fetchHotels(payload);
        const { SearchTokenId, Result = [] } = hotelResponse || {};

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
          rasutripCommissionPercentage:
            item.Price?.rasutripCommissionPercentage || "",
          originalPriceData: item.Price,
        }));

        setMasterHotelList(formattedHotels);

        // Set price range
        const prices = formattedHotels
          .map((h) => h.price)
          .filter((price) => price > 0);
        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setActualPriceRange([minPrice, maxPrice]);
          setPriceRange([minPrice, maxPrice]);
        }

        // Set hotel names for dropdown
        setHotelNames(formattedHotels.map((h) => h.name));
      } catch (err) {
        console.error("❌ Hotel API Error:", err);
        setError("Failed to fetch hotel data");
      } finally {
        setIsLoading(false);
      }
    };

    getHotelData();
  }, [city, state?.cityId, checkIn, checkOut, guests, rooms, nights, roomDetails, resultCount]);

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

  // Show "No hotels found" message
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
                Check-in: <strong>{formatDateForDisplay(checkIn)}</strong> →
                Check-out: <strong>{formatDateForDisplay(checkOut)}</strong>
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
      <Container
        fluid
        className="d-flex justify-content-center align-items-center min-vh-100"
      >
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
    <Container className="">
      <Row>
        <Col>
          <SearchSummary
            showFilter={showFilter}
            toggleFilter={() => setShowFilter(!showFilter)}
          />
        </Col>
      </Row>

      <Row className="mt-4">
        {/* Desktop Sidebar */}
        <Col lg={3} className="d-none d-lg-block">
          <FilterSidebar
            priceRange={priceRange}
            actualPriceRange={actualPriceRange}
            onPriceChange={setPriceRange}
            selectedRatings={starRatings}
            onRatingChange={setStarRatings}
            searchName={searchName}
            onSearchNameChange={setSearchName}
            hotelNames={hotelNames}
          />
        </Col>

        {/* Mobile Sidebar (toggle) */}
        {showFilter && (
          <Col xs={12} className="mt-3 d-block d-lg-none">
            <FilterSidebar
              priceRange={priceRange}
              actualPriceRange={actualPriceRange}
              onPriceChange={setPriceRange}
              selectedRatings={starRatings}
              onRatingChange={setStarRatings}
              searchName={searchName}
              onSearchNameChange={setSearchName}
              hotelNames={hotelNames}
            />
          </Col>
        )}

        {/* Hotel List */}
        <Col lg={9}>
          <HotelList
            masterHotelList={masterHotelList}
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