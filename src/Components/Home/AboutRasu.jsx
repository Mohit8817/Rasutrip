import React from "react";
import travelImage from "../../Assests/newHomeImgs/info.png"; // Image of travel illustration

const AboutRasu = () => {
    const aboutRasuData = [
        {
            id: 1,
            title: "About RasuTrip - Your Travel Booking Partner",
            description: `
Founded in 2025, <strong>RasuTrip</strong> has emerged as one of India’s most reliable and customer-centric online travel booking platforms. With a presence across major cities, we offer a comprehensive range of travel services including bus bookings, flight reservations (domestic and international), and hotel accommodations.
</br></br>

Whether you're planning a spontaneous weekend trip, a family vacation, or a professional tour, RasuTrip brings convenience and affordability right to your fingertips. We believe that travel should be smooth, secure, and enjoyable — and our platform reflects just that.
</br></br>

By partnering with leading bus operators, renowned airlines like Akasa Air, and top-rated hotels in cities like Mumbai, we ensure you get the best deals, flexible options, and a hassle-free booking experience.
</br></br>

From hill stations to metro cities, travel with confidence knowing that <strong>RasuTrip</strong> has your journey covered from start to finish. Let every trip begin with trust and comfort — book with RasuTrip today!
            `,
        },
    ];

    return (
        <section className="max-w-[80vw] mx-auto justify-between flex flex-col lg:flex-row items-center gap-10 px-10 py-5">
            {/* Left Section: Image */}
            <div className="w-full lg:w-[40%]">
                <img src={travelImage} alt="RasuTrip Travel" className="max-w-full h-auto rounded-lg shadow-lg" />
            </div>

            {/* Right Section: About RasuTrip */}
            {aboutRasuData.map((data) => (
                <div
                    key={data.id}
                    className="w-full lg:w-[60%] xsm:w-[90vw] my-[2rem] text-start p-5 justify-between flex flex-col h-auto"
                >
                    <h2 className="text-left mb-5 text-[30px] font-semibold leading-[36px] font-font1">
                        {data.title}
                    </h2>

                    <p
                        className="text-[#484848] text-[14px] font-normal leading-[24px] font-font1"
                        dangerouslySetInnerHTML={{ __html: data.description }}
                    ></p>
                </div>
            ))}
        </section>
    );
};

export default AboutRasu;
