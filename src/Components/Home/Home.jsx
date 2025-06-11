import React from 'react'
// import Header from '../header/Header'
// import Footer from '../Footer/Footer';
import Slider from '../hero/Slider'
import DealsSection from '../Deals/DealsSection'
import TravelBenefits from '../TravelBenefits/TravelBenefits'
import FlightRoutes from '../PopularFlight/FlightRoutes'

const Home = () => {
    return (
        <div>

            {/* <Header /> */}
            <Slider />
            <DealsSection />
            <TravelBenefits />
            <FlightRoutes />
            {/* <Footer /> */}

        </div>
    )
}

export default Home