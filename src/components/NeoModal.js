import React from "react";
import "../styles/NeoModal.css"; // Import custom CSS if needed

const NeoModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-50 flex justify-center items-center'>
      <div className='relative bg-white rounded-lg shadow-lg w-1/2 mx-auto'>
        
        {children}
      </div>
    </div>
  );
};

export default NeoModal;
