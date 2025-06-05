import './App.css';
import DealsSection from './Components/Deals/DealsSection';
import Header from './Components/header/Header';
import Slider from './Components/hero/Slider';
import FlightRoutes from './Components/PopularFlight/FlightRoutes';
import TravelBenefits from './Components/TravelBenefits/TravelBenefits';

function App() {
  return (
    <div className="App">
      <Header />
      <Slider />
      <DealsSection />
      <TravelBenefits/>
      <FlightRoutes/>
    </div>
  );
}

export default App;
