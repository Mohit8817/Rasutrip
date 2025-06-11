import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Components/Home/Home';
import FlightResultsPage from './Pages/FlightResultsPage/FlightResultsPage';
// import BusResultsPage from './Pages/BusResultsPage/BusResultsPage';
import HotelResultsPage from './Pages/HotelResultsPage/HotelResultsPage';
import Header from './Components/header/Header';
import Footer from './Components/Footer/Footer';

function App() {
  return (
    <Router>
    <Header/>
      <Routes>
        {/* Default Home Page Route */}
        <Route path="/" element={<Home />} />

        {/* Result Pages */}
        <Route path="/flight-results" element={<FlightResultsPage />} />
        <Route path="/hotel-results" element={<HotelResultsPage />} />
        {/* <Route path="/bus-results" element={<BusResultsPage />} /> */}
      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;
