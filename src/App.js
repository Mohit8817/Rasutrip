import './App.css';
import { Routes, Route } from 'react-router-dom';

import Home from './Components/Home/Home';
import FlightResultsPage from './Pages/FlightResultsPage/FlightResultsPage';
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
import AgentLogin from './Components/Login/AgentLogin';
import TermsandConditions from './Pages/LegalPages/TermsandConditions';
import PrivacyPolicy from './Pages/LegalPages/PrivacyPolicy';
import Declaration from './Pages/LegalPages/Declaration';
import UserAgreement from './Pages/LegalPages/UserAgreement';
import CancellationRefundpolicy from './Pages/LegalPages/CancellationRefundpolicy';
import FAQ from './Pages/LegalPages/FAQ';
import AboutUs from './Pages/LegalPages/Aboutus';
import BusPayment from './Components/Bus/BusPayment/BusPayment';
import SetResetMPIN from './Components/Login/SetResetMPIN';
import CustomerLogin from './Components/Login/CustomerLogin';
import ScrollToTop from './Components/ScrollToTop/ScrollToTop';
import HotelConfirmation from './Components/Hotel/BookingSummaryPage/HotelConfirmation/HotelConfirmation';
import Bookingconfirm from './Components/Bus/Bookingconfirm/Bookingconfirm';

function App() {
  return (
    <>
      <Header />

      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/flight-results" element={<FlightResultsPage />} />
        <Route path="/flight-details" element={<FlightDetails />} />
        <Route path="/traveller-details" element={<FlightTravellerDetails />} />
        <Route path="/addons" element={<FlightAddon />} />
        <Route path="/review" element={<FlightReview />} />
        <Route path="/payment" element={<FlightPayment />} />

        {/* Hotel */}
        <Route path="/hotel-results" element={<HotelResultsPage />} />
        <Route path="/HotelDetailsPage/:id" element={<HotelDetailsPage />} />
        <Route path="/HotelDetail" element={<HotelDetail />} />
        <Route path="/guest-details" element={<GuestDetails />} />
        <Route path="/Hotelreview" element={<HotelReview />} />
        <Route path="/HotelPayment" element={<HotelPayment />} />
        <Route path="/hotel/confirmation" element={<HotelConfirmation />} />



        {/* Bus */}
        <Route path="/bus-results" element={<BusResultPage />} />
        <Route path="/bus-detail" element={<BusDetail />} />
        <Route path="/bus-traveller-details" element={<BusTravellerDetails />} />
        <Route path="/bus-review" element={<BusReview />} />
        <Route path="/bus-payment" element={<BusPayment />} />
        <Route path="/bus-confirm" element={<Bookingconfirm />} />


        {/* Login */}



        {/* ✅ Customer & Agent Login */}
        <Route path="/login/customer" element={<CustomerLogin />} />
        <Route path="/login/agent" element={<AgentLogin />} />






        {/* ✅ Complete Signup (for new users only) */}

        {/* ✅ Set or Reset MPIN */}
        <Route path="/set-mpin" element={<SetResetMPIN />} />

        {/* ✅ Optional: Dashboard after login */}
        <Route path="/dashboard" element={<h1>Welcome to Dashboard</h1>} />



        {/* Footer pages  */}


        <Route path="/Aboutus" element={<AboutUs />} />
        <Route path="/terms-and-conditions" element={<TermsandConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/disclaimer" element={<Declaration />} />
        <Route path="/UserAgreement" element={<UserAgreement />} />
        <Route path="/CancellationRefundpolicy" element={<CancellationRefundpolicy />} />
        <Route path="/faq" element={<FAQ />} />


      </Routes>
      <Footer />
    </>
  );
}

export default App;
