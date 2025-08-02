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

  // Add ellipsis card if there are more items than can be shown
  const shouldShowEllipsis = items.length > slidesToShow;
  const displayItems = shouldShowEllipsis ? items.slice(0, slidesToShow) : items;

  return (
    <div className="relative" style={{ width: `${carouselWidth + 20}px` }}>
      <div className="overflow-hidden" style={{ width: `${carouselWidth}px` }}>
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * itemWidth}px)`,
            width: `${displayItems.length * itemWidth}px`
          }}
        >
          {displayItems.map((item, index) => (
            <div 
              key={index} 
              className="flex-shrink-0"
              style={{ width: `${itemWidth}px`, height: '120px' }}
            >
              <div className="m-2 border rounded-lg overflow-hidden shadow-md bg-white" style={{ height: '100px' }}>
                <button 
                  className='bg-green-500 text-white rounded hover:bg-blue-600 transition-colors m-2' 
                  onClick={()=>handlePreviewDocument(item.id)}
                  style={{ height: '24px', width: '24px' }}
                >   
                  <EyeIcon className='w-4 h-4 inline-block' /> 
                </button>
                <div className="p-2" style={{ height: '60px', overflow: 'hidden' }}>
                  <h3 className="text-sm font-semibold truncate" style={{ 
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    maxHeight: '20px'
                  }}>
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-600" style={{
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    maxHeight: '16px'
                  }}>
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Ellipsis card to indicate more items */}
          {shouldShowEllipsis && (
            <div 
              className="flex-shrink-0"
              style={{ width: `${itemWidth}px`, height: '120px' }}
            >
              <div className="m-2 border rounded-lg overflow-hidden shadow-md bg-gray-100 flex items-center justify-center" style={{ height: '100px' }}>
                <div className="text-center">
                  <div className="text-2xl text-gray-400 mb-1">...</div>
                  <div className="text-xs text-gray-500">More files</div>
                </div>
              </div>
            </div>
          )}
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