import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Components/Home/Home';
import FlightResultsPage from './Pages/FlightResultsPage/FlightResultsPage';
// import BusResultsPage from './Pages/BusResultsPage/BusResultsPage';
import Header from './Components/header/Header';
import Footer from './Components/Footer/Footer';
import HotelResultsPage from './Pages/HotelResultsPage/HotelResultsPage';


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/flight-results" element={<FlightResultsPage />} />
        <Route path="/hotel-results" element={<HotelResultsPage />} />
        ...
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
