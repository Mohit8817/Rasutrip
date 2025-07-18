import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Components/Home/Home';
import FlightResultsPage from './Pages/FlightResultsPage/FlightResultsPage';
// import BusResultsPage from './Pages/BusResultsPage/BusResultsPage';
import Header from './Components/header/Header';
import Footer from './Components/Footer/Footer';
import HotelResultsPage from './Pages/HotelResultsPage/HotelResultsPage';
import HotelDetailsPage from './Components/Hotel/HotelDetails/HotelDetailsPage';
import FlightDetails from './Components/FlightDetails/FlightDetails';
import FlightTravellerDetails from './Components/FlightTravellerDetails/FlightTravellerDetails';
import FlightAddon from './Components/FlightAddon/FlightAddon';
import FlightReview from './Components/FlightReview/FlightReview';
import FlightPayment from './Components/FlightPayment/FlightPayment';
import HotelDetail from './Components/Hotel/BookingSummaryPage/HotelDetail/HotelDetail';
import GuestDetails from './Components/Hotel/BookingSummaryPage/GuestDetails/GuestDetails';
import HotelReview from './Components/Hotel/BookingSummaryPage/HotelReview/HotelReview';
import HotelPayment from './Components/Hotel/BookingSummaryPage/HotelPayment/HotelPayment';
import BusResultPage from './Pages/BusResultsPage/BusResultPage';
import BusDetail from './Components/Bus/BusDetail/BusDetail';
import BusTravellerDetails from './Components/Bus/BusTravellerDetails/BusTravellerDetails';
import BusReview from './Components/Bus/BusReview/BusReview';
import CustomerLogin from './Components/Login/CustomerLogin';
import AgentLogin from './Components/Login/AgentLogin';


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/flight-results" element={<FlightResultsPage />} />
        <Route path="/flight-details" element={<FlightDetails />} />
        <Route path="/traveller-details" element={<FlightTravellerDetails />} />
        <Route path="/addons" element={<FlightAddon />} />
        <Route path="/review" element={<FlightReview />} />
        <Route path="/Payment" element={< FlightPayment />} />

        {/* Hotel Results Page */}
        <Route path="/hotel-results" element={<HotelResultsPage />} />
        <Route path="/HotelDetailsPage/:id" element={<HotelDetailsPage />} />
        {/* Steps pages  */}
        <Route path="/HotelDetail" element={<HotelDetail />} />
        <Route path="/guest-details" element={<GuestDetails />} />
        <Route path="/Hotelreview" element={<HotelReview/>} />
        <Route path="/HotelPayment" element={<HotelPayment/>} />




        {/* Bus Result page  */}

         <Route path="/bus-results" element={<BusResultPage />} />
         <Route path="/bus-detail" element={<BusDetail />} />
         <Route path="/bus-traveller-details" element={<BusTravellerDetails />} />
         <Route path="/bus-Review" element={<BusReview />} />


         {/* Login Routes page  */}

         <Route path="/login/customer" element={<CustomerLogin />} />
         <Route path="/login/agent" element={<AgentLogin />} />



      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
