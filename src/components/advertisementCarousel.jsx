import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ads = [
  {
    quote: "Style is a way to say who you are without having to speak.",
    images: [
      "/images/style1.jpg",
      "https://source.unsplash.com/300x200/?shopping",
      "https://source.unsplash.com/300x200/?store"
    ],
    bgColor: "bg-blue-100",
    textColor: "text-blue-900"
  },
  {
    quote: "Good things come to those who shop!",
    images: [
      "https://source.unsplash.com/300x200/?sale",
      "https://source.unsplash.com/300x200/?discount",
      "https://source.unsplash.com/300x200/?clothing"
    ],
    bgColor: "bg-purple-50",
    textColor: "text-purple-900"
  },
  {
    quote: "Upgrade your wardrobe, upgrade your life.",
    images: [
      "https://source.unsplash.com/300x200/?clothes",
      "https://source.unsplash.com/300x200/?outfits",
      "https://source.unsplash.com/300x200/?apparel"
    ],
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-900"
  }
];

export default function AdvertisementCarousel() {
  const [currentAd, setCurrentAd] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const adInterval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
      setImageIndex(0); 
    }, 10000);

    return () => clearInterval(adInterval);
  }, []);

  useEffect(() => {
    const imgInterval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % ads[currentAd].images.length);
    }, 3000);

    return () => clearInterval(imgInterval);
  }, [currentAd]);

  return (
    // <div
    //   className={`w-full min-h-[70vh] md:h-[600px] flex items-center px-10 transition-all duration-500 ${ads[currentAd].bgColor}`}
    // >
    //   <motion.div
    //     className="max-w-xl"
    //     initial={{ opacity: 0, y: 50 }}
    //     animate={{ opacity: 1, y: 0 }}
    //     exit={{ opacity: 0, y: -50 }}
    //     transition={{ duration: 0.8, ease: "easeOut" }}
    //     key={currentAd}
    //   >
    //     <motion.h1
    //       className={`text-6xl font-bold ${ads[currentAd].textColor}`}
    //       initial={{ opacity: 0, x: -50 }}
    //       animate={{ opacity: 1, x: 0 }}
    //       exit={{ opacity: 0, x: 50 }}
    //       transition={{ duration: 1 }}
    //       key={currentAd}
    //     >
    //       {ads[currentAd].quote}
    //     </motion.h1>
    //   </motion.div>

    //   <div className="w-1/2 flex justify-center items-center relative">
    //     <motion.img
    //       src={ads[currentAd].images[imageIndex]}
    //       alt="Advertisement"
    //       className="w-40 h-32 object-cover rounded-lg shadow-lg transition-opacity duration-500"
    //       initial={{ opacity: 0, scale: 0.8 }}
    //       animate={{ opacity: 1, scale: 1 }}
    //       exit={{ opacity: 0, scale: 0.8 }}
    //       transition={{ duration: 0.5 }}
    //       key={imageIndex}
    //     />
    //   </div>
    // </div>
    <div className="flex flex-col gap-6 p-6">
    {ads.map((ad, index) => (
      <div
        key={index}
        className="relative w-full h-64 rounded-xl shadow-lg overflow-hidden"
        style={{
          backgroundImage: `url(${ad.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Quote on the right */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 text-gray-900 p-4 rounded-lg shadow-md w-1/3">
          <p className="text-lg font-semibold text-right">{ad.quote}</p>
        </div>
      </div>
    ))}
  </div>
  );
}
