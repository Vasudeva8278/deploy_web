import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { useNavigate } from 'react-router-dom';
import { EyeIcon } from '@heroicons/react/outline';

const Carousel = ({ items, slidesToShow = 4, itemWidth = 200, carouselWidth = 900,templateId, projectId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      Math.min(prevIndex + 1, items.length - slidesToShow)
    );
  };

  const handlePreviewDocument = (id) => {
    navigate(`/docview/${id}?templateId=${templateId}&projectId=${projectId}`)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" style={{ width: `${carouselWidth + 20}px` }}>
      <div className="overflow-hidden" style={{ width: `${carouselWidth}px` }}>
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * itemWidth}px)`,
            width: `${items.length * itemWidth}px`
          }}
        >
          {items.map((item, index) => (
            <div 
              key={index} 
              className="flex-shrink-0"
              style={{ width: `${itemWidth}px` }}
            >
              <div className="m-2 border rounded-lg overflow-hidden shadow-md bg-white">
              <button className=' bg-green-500 text-white rounded hover:bg-blue-600 transition-colors m-2' onClick={()=>handlePreviewDocument(item.id)}>   <EyeIcon className='w-5 h-5 inline-block m-1' /> </button>
                <div className="p-4">
                  <h3 className="text-lg font-semibold truncate">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={prevSlide}
        className="absolute top-1/2 -left-12 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
        disabled={currentIndex === 0}
      >
        <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 -right-12 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
        disabled={currentIndex === items.length - slidesToShow}
      >
        <ChevronRightIcon className="h-6 w-6 text-gray-800" />
      </button>
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {Array.from({ length: items.length - slidesToShow + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? 'bg-gray-800' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;