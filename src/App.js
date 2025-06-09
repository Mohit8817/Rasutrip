import './App.css';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './Components/header/Header';
import Footer from './Components/Footer/Footer';
import Slider from './Components/hero/Slider';
import DealsSection from './Components/Deals/DealsSection';
import TravelBenefits from './Components/TravelBenefits/TravelBenefits';
import FlightRoutes from './Components/PopularFlight/FlightRoutes';




function App() {
  return (
    <>
      <Header />
      <Slider />
      <DealsSection />
      <TravelBenefits />
      <FlightRoutes />
      <Footer />
    </>
  );
}

export default App;