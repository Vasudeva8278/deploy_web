import React, { useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';

const TooltipIcon = ({children}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleMouseEnter = () => {
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  return (
    <div className="relative flex items-center">
      <FaQuestionCircle
        className="text-gray-600 hover:text-gray-800 cursor-pointer mt-2"
        size={24}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {tooltipVisible && (
        <div className="absolute top-full mb-2 w-96 left-0 transform -translate-x-full p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
             <div className='p-6'>
        {children}
      </div>
        </div>
      )}
    </div>
  );
};

export default TooltipIcon;
