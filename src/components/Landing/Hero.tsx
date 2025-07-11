import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Frame1 from "../../Assets/card1.jpg"
import Frame2 from "../../Assets/card2.jpg"
import Frame3 from "../../Assets/card3.jpg"
import Frame4 from "../../Assets/card4.jpg"
import Frame5 from "../../Assets/card5.jpg"
import Frame6 from "../../Assets/card6.jpg"
import Frame7 from "../../Assets/card7.jpg"

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Sample data for the cards
  const cards = [
    {
      id: 1,
      image: Frame1,
    },
    {
      id: 2,
      image: Frame2,
    },
    {
      id: 3,
      image: Frame3,
    },
    {
      id: 4,
      image: Frame4,
    },
    {
      id: 5,
      image: Frame5,
    },
    {
      id: 6,
      image: Frame6,
    },
    {
      id: 7,
      image: Frame7,
    },
  ];


  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === cards.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? cards.length - 1 : prevIndex - 1
    );
  };

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(nextSlide, 3000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, currentIndex]);

  // Get visible cards with rainbow positioning
  const getVisibleCards = () => {
    const visibleCards = [];
    const totalCards = cards.length;

    for (let i = -3; i <= 3; i++) {
      const index = (currentIndex + i + totalCards) % totalCards;
      visibleCards.push({
        ...cards[index],
        position: i,
        isCenter: i === 0
      });
    }

    return visibleCards;
  };

  const getRainbowPosition = (position) => {
    // Rainbow arc calculations
    const radius = 450; // Radius of the rainbow arc
    const centerY = 10; // Vertical center adjustment
    const angleStep = 30; // Degrees between each card
    const angle = position * angleStep * (Math.PI / 240); // Convert to radians

    // Calculate position on the rainbow arc
    const x = Math.sin(angle) * radius;
    const y = centerY - Math.cos(angle) * radius + radius;

    // Scale and rotation based on position
    const scaleValue = position === 0 ? 1.1 : Math.max(0.75, 1 - Math.abs(position) * 0.08);
    const rotateValue = position * 15; // Tilt cards along the curve
    const zIndex = 10 - Math.abs(position);
    const opacity = Math.max(0.4, 1 - Math.abs(position) * 0.15);

    return {
      transform: `translate(${x}px, ${y}px) scale(${scaleValue}) rotate(${rotateValue}deg)`,
      zIndex,
      opacity
    };
  };

  return (
    <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center mt-10 pt-20 pb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your Imagination Into Beautiful Designs In{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 italic">
              Just a Few Clicks.
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
          </p>
          <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
            Start Creating Template
          </button>
        </div>

        {/* Rainbow Slider Section */}
        <div className="relative w-full max-w-full mx-auto pb-20">
          {/* Main slider container */}
          <div
            className="relative w-full h-96 flex items-end justify-center"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            style={{ paddingBottom: '80px' }}
          >
            {/* Rainbow background decoration */}
            {/* <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
              <div className="w-full max-w-full bg-gradient-to-r from-red-200/30 via-yellow-200/30 via-green-200/30 via-blue-200/30 to-purple-200/30 rounded-t-full opacity-50"></div>
            </div> */}

            {/* Cards container */}
            <div className="relative w-full max-w-full mx-auto h-full flex items-end justify-center">
              {getVisibleCards().map((card, index) => (
                <div
                  key={`${card.id}-${index}`}
                  className="absolute w-full md:w-56 h-60 md:h-72 rounded-2xl shadow-2xl cursor-pointer transition-all duration-700 ease-out bg-white hover:shadow-3xl overflow-hidden"
                  style={getRainbowPosition(card.position)}
                  onClick={() => {
                    if (card.position !== 0) {
                      setCurrentIndex((currentIndex + card.position + cards.length) % cards.length);
                    }
                  }}
                >
                  <img
                    src={card.image}
                    alt={`Card ${card.id}`}
                    className="w-full  object-cover"
                  />
                  {/* <div className="h-1/4 flex items-center justify-center text-sm font-semibold">
                    ID: {card.id}
                  </div> */}
                </div>
              ))}
            </div>


            {/* Navigation arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/50"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/50"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center mt-12 space-x-3">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125 shadow-lg'
                  : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                  }`}
              />
            ))}
          </div>

          {/* Auto-play control */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isAutoPlaying ? '⏸️ Pause' : '▶️ Play'} Auto-slide
            </button>
          </div>

          {/* Rainbow reflection effect */}
          {/* <div className="absolute bottom-0 transform -translate-x-1/2 w-full  h-32 bg-gradient-to-t from-white/20 to-transparent rounded-t-full pointer-events-none"></div> */}
        </div>

      </div>
    </section>
  );
};

export default Hero;