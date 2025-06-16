import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Components/Home/Home';
import FlightResultsPage from './Pages/FlightResultsPage/FlightResultsPage';
// import BusResultsPage from './Pages/BusResultsPage/BusResultsPage';
import Header from './Components/header/Header';
import Footer from './Components/Footer/Footer';
import HotelResultsPage from './Pages/HotelResultsPage/HotelResultsPage';
import HotelDetailsPage from './Components/HotelDetails/HotelDetailsPage';
import FlightDetails from './Components/FlightDetails/FlightDetails';
import FlightTravellerDetails from './Components/FlightTravellerDetails/FlightTravellerDetails';


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/flight-results" element={<FlightResultsPage />} />
        <Route path="/flight-details" element={<FlightDetails />} />
        <Route path="/traveller-details" element={<FlightTravellerDetails />} />

        {/* Hotel Results Page */}
        <Route path="/hotel-results" element={<HotelResultsPage />} />
        <Route path="/HotelDetailsPage/:id" element={<HotelDetailsPage />} />
        ...
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
