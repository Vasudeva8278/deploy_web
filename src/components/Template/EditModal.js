import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PlusIcon } from '@heroicons/react/outline';
import { getImgLink, imgLink, uploadImg } from '../../services/highlightsApi';
import DynamicTable from '../DynamicTable';

  

const EditModal = ({ isOpen, onClose, onSave, initialText,label,editHighlight }) => {
  const [newText, setNewText] = useState(initialText);
  const [newLabel, setNewLabel] = useState(label);
  const [newImage, setNewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState('')
  const [highlightType, setHighlightType] = useState('text');
  const tableDivRef = useRef(null);
  const inputRef = useRef();
 
  const handleButtonClick = () => {
    inputRef.current.click(); // Trigger file input click
  }; 

 const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadNewImage = async () => {
    if (!newImage) return;
    
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('highlightId', editHighlight?.id);
   
    console.log(formData);

    try {
      const response =  await  uploadImg(editHighlight?.id,formData)
      console.log("response", response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    
  };

  const handleContentChange = (event) => {
    setNewText(event.target.innerHTML);
  };


  // Ensure the newText state updates when initialText changes
  useEffect(() => {
    setNewText(initialText);
    setNewLabel(label);
    setHighlightType(editHighlight.type);
     
    /* if(editHighlight.type==='table'){
    const parser = new DOMParser();
    const doc = parser.parseFromString(initialText, 'text/html');
    const table = doc.querySelectorAll('table');
    console.log(table);
    if(table){
      table[0]?.setAttribute('contenteditable', 'true');
    };
    setNewText(doc.body.innerHTML);
 
    } */
    }, [initialText,label,editHighlight]);

  const handleSave = () => {
    onSave(newText,newLabel);
    onClose();
  };
  
  const addRow = () => {
    const table = tableDivRef.current.querySelector('table');
    const newRow = table.insertRow();
    const columnCount = table.rows[0].cells.length;

    for (let i = 0; i < columnCount; i++) {
      const newCell = newRow.insertCell(i);
      const referenceCell = table.rows[1].cells[i];
      newCell.innerHTML = `New Cell ${i + 1}`;
      newCell.style.cssText = referenceCell.style.cssText;
    }
  };

  const addColumn = () => {
    const table = tableDivRef.current.querySelector('table');
    const rowCount = table.rows.length;

    for (let i = 0; i < rowCount; i++) {
      const newCell = table.rows[i].insertCell(-1);
      const referenceCell = table.rows[i].cells[table.rows[i].cells.length - 2];
      if (i === 0) {
        newCell.innerHTML = `New Column`;
      } else {
        newCell.innerHTML = `New Cell ${i + 1}`;
      }
      newCell.style.cssText = referenceCell.style.cssText;
    }
  };

   
  const cancelEditImage =()=> {
    setNewImage(null);
    onClose();
  }


  const handleSaveImage = async() => {
    
    console.log("in handle Save Image", initialText)
    if(!newImage) { 
      onSave(initialText,newLabel);
    }else{
   const newImageName= await uploadNewImage();
   console.log(newImageName);
    const newSrc= await getImgLink(newImageName);
   
    //const newUpdatedImage = document.getElementById('newImage').innerHTML;
    const parser = new DOMParser();
    const doc = parser.parseFromString(initialText, 'text/html');
    const img = doc.querySelectorAll('img');
     if(img){
      img[0].src = newSrc;
    };
    console.log(img[0]);
    const edittedImage =img[0];
    onSave(edittedImage?.outerHTML,newLabel);
  }
    setNewImage(null);
    onClose();
  }

  const handleSaveTable = () => {
     const newUpdatedTable = document.getElementById('dynamicTable').innerHTML;
    const parser = new DOMParser();
    const doc = parser.parseFromString(newUpdatedTable, 'text/html');
    const table = doc.querySelectorAll('table');
     if(table){
      table[0].removeAttribute('contenteditable');
     // const controls = table[0].querySelectorAll('td .cell-controls-horizontal, td .cell-controls-vertical');
     // controls.forEach(control => control.remove());
    };
    console.log(table[0]);
    const edittedTable =table[0];
    onSave(edittedTable?.outerHTML,newLabel);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 overflow-auto" >
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-w-[90%] min-w-[700px] max-h-[80%)] overflow-auto">
        <h2 className="text-lg font-semibold text-gray-900">Edit Highlighted Texts</h2>
        <div className="mt-4">
          <label htmlFor="originalText" className="block text-sm font-medium text-gray-700">Label:</label>
          <input
            id="originalText"
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="mt-1 block w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        {editHighlight.type==='text' && 
          <>
            <div className="mt-4">
              <label htmlFor="originalText" className="block text-sm font-medium text-gray-700">Original Text:</label>
              <input
                id="originalText"
                type="text"
                value={initialText}
                readOnly={true}
                className="mt-1 block w-full px-3 py-2 bg-gray-100 text-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="editText" className="block text-sm font-medium text-gray-700">Edit Text:</label>
              <textarea
                id="editText"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                rows="4"
              />
            </div>
            <div className='block text-sm font-medium text-gray-700 py-4'>
            <button
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={onClose}
              >
                Cancel
              </button> 
              <button
                className="inline-flex justify-center ml-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleSave}
              >
                Save
              </button>
        </div>
        </>}
        {editHighlight.type==='image' && 
        <>
          <div className="mt-4">
            {/* <label htmlFor="originalText" className="block text-sm font-medium text-gray-700">Original Image:</label>*/}
            <div id="originalText"  dangerouslySetInnerHTML={{ __html: initialText }}  className="mt-2 w-64 h-64 object-cover"/>
          </div>
          <div className="image-uploader" >
              {newImage && (
              <>
                  <label className="block text-sm font-medium text-gray-700">
                    New Image:
                  </label>
                  <div id="newImage">
                    <img src={newImage} alt="Uploaded" className="mt-2 w-64 h-64 object-cover" />
                  </div>
              </>
              )}  
          </div>
       
          {/*  <div className="mt-3 flex justify-left space-x-2">
              <label className="block text-sm font-medium text-gray-700"> Upload Image:</label>
              <input type="file" name='selectedImage' accept="image/*" 
              onChange={handleImageUpload} className="block mb-5 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"  id="default_size"/>
             </div>*/}
             
             <div className="modal-footer flex flex-row">
              <div className='left-buttons  w-1/2 mb-2'>
              <button
        type="button"
        onClick={handleButtonClick}
        className="block text-gray-900 border border-gray-300 rounded-lg cursor-pointer
          bg-gray-50 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600
          dark:hover:bg-gray-600 focus:outline-none py-2 px-4"
      >
        Change Image
      </button>
      <input
        type="file"
        ref={inputRef}
        name="selectedImage"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
              </div>
            <div className='right-buttons  w-1/2 text-right'> <button
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={cancelEditImage}
              >
                Cancel
              </button>
              <button
                className="inline-flex justify-center px-4 py-2 ml-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleSaveImage}
              >
                Done
              </button>
              </div>
                </div>
        </>
        }
        {editHighlight.type==='table' && <>
          <div className="mt-4 hidden">
              <label htmlFor="originalText" className="block text-sm font-medium text-gray-700">
                Original Table:
              </label>
              <div id="originalText" dangerouslySetInnerHTML={{ __html: initialText }} />
           
             <div id="newTable" ref={tableDivRef} dangerouslySetInnerHTML={{ __html: newText }} />
            </div>
            <div className="block text-sm font-medium text-gray-700 mt-2">
             <div className="flex space-x-2">
              <DynamicTable  initialTableHtml={editHighlight.text} setNewText={setNewText} handleSaveTable={handleSaveTable}/>
              </div>
          
              <div className="flex justify-between">
                <div className="flex space-x-2">
                 
             
                  <button
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-flex justify-center ml-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={handleSaveTable}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
        </>
        }
       </div>
    </div>
  );
};

export default EditModal;
