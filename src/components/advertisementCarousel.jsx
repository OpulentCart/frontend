import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { motion } from "framer-motion"; // Import Framer Motion
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const ads = [
  {
    quote: "Push your limits, break your records. Gear up with the best sports equipment",
    image: "/images/Sports.jpg", // Ensure high-resolution images
  },
  {
    quote: "Because you deserve to feel as good as you look. Explore our beauty collection today!",
    image: "/images/Beauty.jpg", // Ensure high-resolution images
  },
  {
    quote: "Upgrade your wardrobe, upgrade your life.",
    image: "/images/Furniture.jpg", // Ensure high-resolution images
  },
  {
    quote: "Step into the spotlight with trends that turn heads. Shop the latest fashion now!",
    image: "/images/Fashion.jpg", // Ensure high-resolution images
  },
  {
    quote: "Transform your house into a home with smart appliances that make life easier.",
    image: "/images/Appliances.png", // Ensure high-resolution images
  },
  {
    quote: "Everyday essentials, delivered with care. Because convenience shouldn’t be a luxury.",
    image: "/images/Grocery.jpg", // Ensure high-resolution images
  },
  {
    quote: "Power up your life with gadgets that keep you ahead of the curve.",
    image: "/images/Laptops.jpg"
  }
];

const AdvertisementCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showQuote, setShowQuote] = useState(false);

  useEffect(() => {
    // Reset the quote visibility when the active index changes
    setShowQuote(false);

    // Set a timeout to show the quote after 1 second
    const timeout = setTimeout(() => {
      setShowQuote(true);
    }, 1000);

    // Clear the timeout if the component unmounts or the active index changes
    return () => clearTimeout(timeout);
  }, [activeIndex]);

  return (
    <div className="w-full max-w-7xl mx-auto mt-16"> {/* Added margin-top */}
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop={true}
        className="w-full h-[600px]"
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {ads.map((ad, index) => (
          <SwiperSlide key={index} className="relative w-full h-[600px]">
            {/* Image (Loads Instantly) */}
            <div className="w-full h-full">
              <img
                src={ad.image}
                alt="Ad Image"
                className="w-full h-full object-cover"
                loading="lazy" // Optional: Lazy loading for better performance
              />
            </div>

            {/* Quote with Forced Re-Animation on Slide Change */}
            {activeIndex === index && (
              <motion.div
                className="absolute right-10 top-1/3 text-white text-5xl font-bold max-w-md leading-tight"
                initial={{ opacity: 0, x: 100 }}
                animate={showQuote ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 1 }}
                key={ad.quote} // Unique key forces re-animation when slide changes
              >
                {ad.quote}
              </motion.div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default AdvertisementCarousel;
