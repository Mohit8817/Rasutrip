import { useState, useEffect } from "react";
import Carousel from "react-bootstrap/Carousel";
import slidimg1 from "../../assest/img (1).png";
import slidimg2 from "../../assest/img (2).png";
import slidimg3 from "../../assest/img (1).png";
import "../../Style/Slider.css"; // Make sure path is correct
import FlightBooking from "../FlightBooking/FlightBooking";
import TravelTabs from "./TravelTabs";
import HotelSearchForm from "../HotelSearchForm/HotelSearchForm";
import BusBooking from "../Busbooking/BusBooking";
import { useLocation, useNavigate } from "react-router-dom";

const Slider = ({ type = "home" }) => {
  const [index, setIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("flight");
  const location = useLocation();
  const navigate = useNavigate();

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  // Handle URL parameters and custom events
  useEffect(() => {
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");

    if (tabFromUrl && ["flight", "hotel", "bus"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
      // Remove the parameter from URL after setting the tab
      const newParams = new URLSearchParams(location.search);
      newParams.delete("tab");
      const newSearch = newParams.toString();
      const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ""}`;
      navigate(newUrl, { replace: true });
    }

    // Listen for custom events from header
    const handleSetActiveTab = (event) => {
      setActiveTab(event.detail.tabType);
    };

    window.addEventListener("setActiveTab", handleSetActiveTab);

    // Cleanup event listener
    return () => {
      window.removeEventListener("setActiveTab", handleSetActiveTab);
    };
  }, [location, navigate]);

  // Update activeTab and update URL
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  // Function to render tab content
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "flight":
        return <FlightBooking />;
      case "hotel":
        return <HotelSearchForm />;
      case "bus":
        return <BusBooking />;
      default:
        return <FlightBooking />;
    }
  };

  return (
    <div className="slider-container">
      {/* White box for your components */}
      <div className={type === "home" ? "overlay-box" : ""}>
        {location.pathname === "/" && (
          <div className="travel-tabs">
            <TravelTabs
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              className=""
            />
          </div>
        )}
        {/* Conditionally show active component */}
        {renderActiveTabContent()}
      </div>

      {location.pathname === "/" && (
        <Carousel
          activeIndex={index}
          onSelect={handleSelect}
          className="slider"
          indicators={false}
          controls={false}
        >
          {[slidimg1, slidimg2, slidimg3].map((img, idx) => (
            <Carousel.Item key={idx}>
              <div className="slider-image-wrapper">
                <img
                  className="d-block w-100"
                  src={img}
                  alt={`Slide ${idx + 1}`}
                />
                <div className="top-overlay"></div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      )}
    </div>
  );
};

export default Slider;
