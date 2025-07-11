import React, { useState, useEffect, useRef } from "react";
import DynamicTable from "../DynamicTable";
import { getImgLink, uploadImgforDocument } from "../../services/highlightsApi";
import { v4 as uuidv4 } from "uuid";

const ClientHighlightsModal = ({ isOpen, onClose, onSave, highlight }) => {
  const [newText, setNewText] = useState(highlight.text);
  const [newImage, setNewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  let imageRef = useRef(null);
  const tableDivRef = useRef(null);
  const inputRef = useRef();

  // Ensure the newText state updates when initialText changes
  useEffect(() => {
    setNewImage(null);
    imageRef = null;
  }, [highlight]);

  const cancelEditImage = () => {
    setNewImage(null);
    imageRef = null;
    onClose();
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
    const tempDocId = uuidv4();
    const highlightId = highlight?.id;
    formData.append("image", selectedImage);
    formData.append("highlightId", highlightId);
    formData.append("documentId", tempDocId);
    try {
      const response = await uploadImgforDocument(
        tempDocId,
        highlightId,
        formData
      );
      console.log("response in docsHighlightModel", response);
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleSaveImage = async () => {
    // console.log("in handle Save Image", initialText)
    if (!newImage) {
      alert("please select an image to save.");
      return;
    }
    const newImageName = await uploadNewImage();
    console.log(newImageName);
    const newSrc = await getImgLink(newImageName);
    //const newUpdatedImage = document.getElementById('newImage').innerHTML;
    const parser = new DOMParser();
    const doc = parser.parseFromString(highlight.text, "text/html");
    const img = doc.querySelectorAll("img");
    if (img) {
      //console.log(img[0])
      img[0].src = newSrc;
    }

    // console.log(img[0]);
    const edittedImage = img[0];
    console.log(edittedImage?.outerHTML);
    onSave(highlight.label, edittedImage?.outerHTML);

    imageRef = null;
    onClose();
  };

  const handleSaveTable = () => {
    const newUpdatedTable = document.getElementById("dynamicTable").innerHTML;
    const parser = new DOMParser();
    const doc = parser.parseFromString(newUpdatedTable, "text/html");
    const table = doc.querySelectorAll("table");
    if (table) {
      table[0].removeAttribute("contenteditable");
    }
    console.log(table[0]);
    const edittedTable = table[0];
    onSave(highlight.label, edittedTable?.outerHTML);
    onClose();
  };

  const cancelTableEdit = () => {
    setNewText(null);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 overflow-auto'>
      <div className='bg-white rounded-lg shadow-lg w-auto max-w-[90%] min-w-[700px] max-h-[80%] overflow-auto'>
        <div className='bg-gray-300 p-2 rounded-t-lg'>
          <h2 className='text-lg font-medium text-gray-800'>
            {highlight.label}
          </h2>
        </div>
        <div className='p-4'>
          {highlight.type === "image" && (
            <>
              {!newImage && (
                <div className='mt-4'>
                  <label
                    htmlFor='originalText'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Original Image:
                  </label>
                  <div
                    id='originalText'
                    dangerouslySetInnerHTML={{ __html: highlight.text }}
                    className='mt-2 w-64 h-64 object-cover'
                  />
                </div>
              )}
              <div className='image-uploader'>
                {newImage && (
                  <>
                    <label className='block text-sm font-medium text-gray-700'>
                      New Image:
                    </label>

                    <div className='relative w-64 h-64 mt-2' id='newImage'>
                      {<img ref={imageRef} src={newImage} alt='New upload' />}
                    </div>
                  </>
                )}
              </div>

              <div className='block text-sm font-medium text-gray-700 mt-4 flex justify-end space-x-2'>
                <div className='left-buttons mb-2'>
                  <input
                    type='file'
                    name='selectedImage'
                    accept='image/png,image/jpeg'
                    onChange={handleImageUpload}
                    className='mt-2'
                    ref={inputRef}
                    hidden
                  />
                  <button
                    type='button'
                    className='block text-gray-900 border border-gray-300 rounded-lg cursor-pointer
          bg-gray-50 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600
          dark:hover:bg-gray-600 focus:outline-none py-2 px-4'
                    onClick={() => {
                      inputRef.current.click();
                    }}
                  >
                    Change Image
                  </button>
                </div>
                <div className='right-buttons text-right'>
                  <button
                    className='inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                    onClick={cancelEditImage}
                  >
                    Cancel
                  </button>

                  <button
                    className={`inline-flex justify-center px-4 py-2 text-sm font-medium border border-transparent rounded-md ${
                      newImage
                        ? "text-white bg-blue-600 hover:bg-blue-700"
                        : "text-gray-500 bg-gray-300 cursor-not-allowed"
                    }`}
                    onClick={handleSaveImage}
                    disabled={!newImage}
                  >
                    Save
                  </button>
                </div>
              </div>
            </>
          )}
          {highlight.type === "table" && (
            <>
              <div className='mt-4 hidden'>
                <label
                  htmlFor='originalText'
                  className='block text-sm font-medium text-gray-700'
                >
                  Original Table:
                </label>
                <div
                  id='originalText'
                  dangerouslySetInnerHTML={{ __html: highlight.text }}
                />

                <div
                  id='newTable'
                  ref={tableDivRef}
                  dangerouslySetInnerHTML={{ __html: newText }}
                />
              </div>
              <div className='block text-sm font-medium text-gray-700 mt-2'>
                <div className='flex space-x-2'>
                  <DynamicTable
                    initialTableHtml={highlight.text}
                    setNewText={setNewText}
                    handleSaveTable={handleSaveTable}
                  />
                </div>
                <div className='flex justify-between'>
                  <div className='flex space-x-2'>
                    <button
                      className='inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                      onClick={cancelTableEdit}
                    >
                      Cancel
                    </button>
                    <button
                      className='inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      onClick={handleSaveTable}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientHighlightsModal;
