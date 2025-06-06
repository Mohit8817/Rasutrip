
import './App.css';
import DealsSection from './Components/Deals/DealsSection';
import Header from './Components/header/Header';
import Footer from './Components/Footer/Footer';
import Slider from './Components/hero/Slider';
import FlightRoutes from './Components/PopularFlight/FlightRoutes';
import SubscribeSection from './Components/SubscribeSection/SubscribeSection';
import TravelBenefits from './Components/TravelBenefits/TravelBenefits';

function App() {
  return (
    <div className="App">
      <Header />
      <Slider />
      <DealsSection />
      <TravelBenefits />
      <FlightRoutes />
      {/* <SubscribeSection /> */}
      
      <Footer />





    </div>
  );
}

export default App;
