import React from "react";
import carImage from "../../Assests/newHomeImgs/aboutLogo.png"; // Image of the car illustration

const AboutRasu = () => {
    const aboutTSJData = [
        {
            id: 1,
            title: "About TSJ Car Rental Service",
            description: `
Founded in 2019 with just one car in Indore, Madhya Pradesh, TSJ Car Rental Service has grown into one of the leading car rental companies in India. Thanks to the trust and support of our valued customers, we now proudly operate in Indore, Bhopal, Udaipur, and Ujjain, offering a fleet of over 50 premium vehicles.
</br>
</br>

At TSJ Car Rental, we specialize in providing self-drive car rental services with a wide range of premium cars to suit every need. Whether you’re planning a road trip, a family vacation, or simply need a car for your daily commute, we ensure an affordable, hassle-free, and private travel experience.
</br>
</br>

We understand the importance of privacy and safety when you’re on the road. With our self-drive option, customers can enjoy complete freedom and flexibility—pause at scenic spots, explore hidden gems, and create unforgettable memories with family and friends.
</br>
</br>
At TSJ Car Rental Service, your privacy, safety, and satisfaction are our top priorities. Join us for a smooth and enjoyable driving experience, and let every journey become a standard journey with TSJ!`,
        },
    ];

    return (
        <section className="max-w-[80vw] mx-auto justify-between flex flex-col lg:flex-row items-center gap-10 px-10 py-5">
            {/* Left Section: Image */}
            <div className="w-full lg:w-[40%]">
                <img src={carImage} alt="Car Rental" className="max-w-full h-auto" />
            </div>

            {/* Right Section: About TSJ */}
            {aboutTSJData.map((data) => (
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
