import React from 'react';
import { PlusCircleIcon } from '@heroicons/react/solid';
import { PlusIcon } from '@heroicons/react/outline';

const TableHeader = ({ name,tableData, handleAddRow}) => {
  // Calculate width based on the length of tableData
  const calculateWidth = (length) => {
    const minWidth = 200; // Minimum width in pixels
    const screenWidth = window.innerWidth; // Get the screen width
    const availableWidth = screenWidth * 0.8; // 80% of the screen width
   
    return Math.max(minWidth, availableWidth / (length));
  };

  const width = calculateWidth(tableData.length+1);

  return (
    <th
      className="px-2 text-left"
      style={{ width: `${width}px `, minWidth: '200px' }}
    >
         <div className='flex items-center justify-between'>
      <span>{name}</span>
      <button
        className="text-blue-500 rounded hover:bg-white transition-colors flex items-center px-2 py-1"
        onClick={handleAddRow}
      >
        <PlusIcon className="w-5 h-5 mr-1 inline-block" /> Add
      </button>
      </div>
    </th>
    
  );
};

export default TableHeader;
