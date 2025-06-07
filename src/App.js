import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './Components/header/Header';
import Footer from './Components/Footer/Footer';
import Slider from './Components/hero/Slider';
import DealsSection from './Components/Deals/DealsSection';
import TravelBenefits from './Components/TravelBenefits/TravelBenefits';
import FlightRoutes from './Components/PopularFlight/FlightRoutes';
import FilterSidebar from './Components/Filter/FilterSidebar';
import HotelCard from './Components/Hotel/HotelCard';
import HotelList from './Components/Hotel/HotelList';

import RoomCard from "./Components/Hotel/RoomCard";
import HotelDetails from './Components/Hotel/HotelDetails';
import HotelImages from './Components/Hotel/HotelImages';
import BookingInfo from './Components/Hotel/BookingInfo';

// Home page component
const Home = () => (
  <>
    <Slider />
    <DealsSection />
    <TravelBenefits />
    <FlightRoutes />
  </>
);

// Hotel page component
const Hotels = () => (
  <>
    <FilterSidebar />
    {/* <HotelCard /> */}
    <HotelList />
  </>
);

const HotelDetail=()=>(
  <>
  <HotelDetails/>
  <HotelImages/>
  <RoomCard/>
  <BookingInfo/>
  {/* <HotelCard/> */}
  </>
)

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hoteldetails" element={<HotelDetail/>}/>
          <Route path="/info" element={<HotelDetails/>}/>

          {/* Add more routes as needed */}
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
