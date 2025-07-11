import React, { useState, useRef } from 'react';
import {TagIcon, TableIcon, PhotographIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';

const ScrollableFields = ({ fields, onAddField }) => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full">
      {/* Left Arrow */}
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-1"
        onClick={scrollLeft}
        style={{ display: fields.length > 2 ? 'block' : 'none' }}
      >
        <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
      </button>

      {/* Scrollable Fields */}
      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide px-10 py-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {fields.map((field, idx) => (
          <div
            key={idx}
            className="min-w-[200px] bg-gray-100 rounded-lg p-4 shadow flex-shrink-0 scroll-snap-align-start"
          >
            {/* Render your field here */}
            {field}
          </div>
        ))}
        {/* Add Button */}
        <button
          className="min-w-[200px] bg-blue-100 rounded-lg p-4 shadow flex-shrink-0 text-blue-600 font-bold"
          onClick={onAddField}
        >
          + Add
        </button>
      </div>

      {/* Right Arrow */}
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-1"
        onClick={scrollRight}
        style={{ display: fields.length > 2 ? 'block' : 'none' }}
      >
        <ChevronRightIcon className="h-6 w-6 text-gray-600" />
      </button>
    </div>
  );
};

const AddEllipsisMenu = ({ setAddTable, setAddImage, setIsMultiple, setAddLabel }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div>
        <button 
          className="inline-flex justify-center w-full text-blue-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
         + Add <ChevronDownIcon className="h-4 w-4 mt-1" aria-hidden="true" /> 
        </button>
      </div>

      {menuOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button
              className="text-gray-700 block px-4 py-2 text-sm flex w-full items-center text-left hover:bg-blue-100"
              onClick={() => {
                setMenuOpen(false);
                setAddTable(false);
                setAddImage(false);
                setIsMultiple(false);
                setAddLabel(true);
              }}
            >
              <TagIcon className="h-5 w-5 mr-1" /> Add Label
            </button>
            <button
              className="text-gray-700 block px-4 py-2 text-sm flex w-full items-center text-left hover:bg-blue-100"
              onClick={() => {
                setMenuOpen(false);
                setAddTable(true);
                setAddLabel(false);
                setAddImage(false);
                setIsMultiple(false);
              }}
            >
              <TableIcon className="h-5 w-5 mr-1" /> Add Table
            </button>
            <button
              className="text-gray-700 block px-4 py-2 text-sm flex w-full items-center text-left hover:bg-blue-100"
              onClick={() => {
                setMenuOpen(false);
                setAddImage(true);
                setAddLabel(false);
                setAddTable(false);
                setIsMultiple(false);
              }}
            >
              <PhotographIcon className="h-5 w-5 mr-1" /> Add Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEllipsisMenu;
