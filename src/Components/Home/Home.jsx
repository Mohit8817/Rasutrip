import React, { useEffect } from 'react'
// import Header from '../header/Header'
// import Footer from '../Footer/Footer';
import Slider from '../hero/Slider'
import DealsSection from '../Deals/DealsSection'
import TravelBenefits from '../TravelBenefits/TravelBenefits'
import FlightRoutes from '../PopularFlight/FlightRoutes'
import c1 from "../../Assests/newHomeImgs/Europe.jpg"
import c2 from "../../Assests/newHomeImgs/Getty.jpg"
import c3 from "../../Assests/newHomeImgs/Multiple.jpeg"
import c4 from "../../Assests/newHomeImgs/girl.jpg"
import { motion } from "framer-motion";
import road from "../../Assests/newHomeImgs/Background.png"
import GoogleReviews from './GoogleReviews'
import AboutRasu from './AboutRasu'
import { getUserIP } from '../APIS/FlightApi/FlightApi'

const Home = () => {


       const GetUserIP = async () => {
    const ip = await getUserIP();
    localStorage.setItem('UserIp', ip);
  };

  useEffect(() => {
    GetUserIP();
  }, []); 

      const images = [
        {
            id: 1,
            icon: c1,
        },
        {
            id: 2,
            icon: c2,
        },
        {
            id: 3,
            icon: c3,
        },
        {
            id: 4,
            icon: c4,
        },
    ];
    return (
        <div>

            {/* <Header /> */}
            <Slider />
            {/* <DealsSection /> */}
            <TravelBenefits />
            <FlightRoutes />
            <section>
                {/* <AboutRasu /> */}
                <img src={road} />

                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-black font-font1 py-3"
                >
                    <h2 className="text-center text-3xl font-semibold leading-[36px] md:mb-10 my-[1.5rem] font-montserrat">
                        Customer Testimonial
                    </h2>

                    <div className="grid gap-10 justify-items-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-4">
                        {images.map((feature) => (
                            <motion.div
                                key={feature.id}
                                initial={{ scale: 0.8 }}
                                whileInView={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="text-center"
                            >
                                <div className="flex justify-center">
                                    <img
                                        src={feature.icon}
                                        alt={feature.title}
                                        className="w-[15.625rem] h-[10.625rem]"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold font-montserrat mt-4">
                                    {feature.title}
                                </h3>
                                <p className="text-sm max-w-[15.625rem] font-montserrat mx-auto mt-2">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                </motion.section>


                {/* <section className="bg-[#EDEDED] md:h-[15rem] xsm:h-auto grid place-content-center">
                    <ServicesSection />
                </section> */}
            </section>
            <GoogleReviews />
        </div>
    )
}

export default Home