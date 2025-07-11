import React, { useState, useEffect, useRef } from 'react';
import DynamicTable from '../DynamicTable';
import { getImgLink, uploadImgforDocument } from '../../services/highlightsApi';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FaCropSimple } from "react-icons/fa6";
import { GiResize } from "react-icons/gi";
//import {getCroppedImg} from '../../services/cropImage'; 
// import Resizer from "react-image-file-resizer";

const DocumentHighlightsModal = ({ isOpen, onClose, onSave, highlight,  tempDocument, initialText } ) => {
  const [newText, setNewText] = useState(initialText);
  const [newImage, setNewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState('')
  const [highlightType, setHighlightType] = useState('text');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isCropping, setIsCropping] = useState(false); 
  const [isResizing, setIsResizing] = useState(false); // Track resizing state
  const [imageSize, setImageSize] = useState(null); // Image size state
  let imageRef = useRef(null);
  const tableDivRef = useRef(null);
  const inputRef = useRef();
  const [croppedUrl, setCroppedUrl] = useState(null);

/* 
  const resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        300,
        300,
        "JPEG",
        100,
        0,
        (uri) => {
          resolve(uri);
        },
        "base64"
      );
    }); */
  
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
  const onImageLoaded = (image) => {
    imageRef = image;
  };

  const showCroppedImage = async (crop) => {
    try {
      const croppedImg = await getCroppedImg(imageRef.current, crop);
      setCroppedImage(croppedImg);
      setCroppedUrl(URL.createObjectURL(croppedImg));

    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const uploadNewImage = async () => {
    if (!newImage) return;
    const documentId = tempDocument.id? tempDocument.id : tempDocument._id;
    const formData = new FormData();
    const highlightId = highlight?.id?.id
    let tempFile= selectedImage;
    if(croppedImage){
      tempFile = new File([croppedImage], selectedImage?.name, { type: 'image/jpeg' });
    }
    formData.append('image', tempFile);
    //console.log('selectedImage', selectedImage)
   // formData.append('image', selectedImage);
    formData.append('highlightId', highlightId);
    formData.append('documentId', documentId);
    try {
      const response = await uploadImgforDocument(documentId,highlightId,formData)
      console.log("response in docsHighlightModel",response );
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    
  };

  
  // Ensure the newText state updates when initialText changes
  useEffect(() => {
    setHighlightType(highlight.type);
    setNewImage(null);
    setIsCropping(false); 
    setCroppedImage(null);
    setCrop({ x: 0, y: 0 })
    setCompletedCrop(null);
    imageRef=null;
  }, [highlight,tempDocument]);

  const handleSaveImage = async() => {
   // console.log("in handle Save Image", initialText)
   if(!newImage) { 
      alert("please select an image to save.");
      return;
   }
   const newImageName= await uploadNewImage();
    console.log(newImageName);
    const newSrc=await getImgLink(newImageName);
    //const newUpdatedImage = document.getElementById('newImage').innerHTML;
    const parser = new DOMParser();
    const doc = parser.parseFromString(highlight.text, 'text/html');
    const img = doc.querySelectorAll('img');
     if(img){
      //console.log(img[0])
      img[0].src = newSrc;
    };
    if (imageSize && imageRef) {
      img[0].style.width = `${imageSize.width}px`;
      img[0].style.height = `${imageSize.height}px`;
    }
   // console.log(img[0]);  
    const edittedImage =img[0];
    console.log(edittedImage?.outerHTML);
    onSave(edittedImage?.outerHTML);
    setNewImage(null);
    setCroppedImage(null);
    setCrop({ x: 0, y: 0 });
    setCompletedCrop(null);
    imageRef=null;
    onClose();
  }

  const getCroppedImg = async (image, crop) => {
    if (!crop || !image) return;
  
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");
  
    // Clear the canvas to ensure it has a transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Set the background to be transparent, ensuring no black background
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Properly scale and draw the image onto the canvas
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
  
    // Convert the canvas to a blob (which is the cropped image)
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty");
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        1 // Full quality
      );
    });
  };
  

  const handleSaveTable = () => {
     const newUpdatedTable = document.getElementById('dynamicTable').innerHTML;
    const parser = new DOMParser();
    const doc = parser.parseFromString(newUpdatedTable, 'text/html');
    const table = doc.querySelectorAll('table');
     if(table){
      table[0].removeAttribute('contenteditable');
    };
    console.log(table[0]);
    const edittedTable =table[0];
    onSave(edittedTable?.outerHTML);
    onClose();
  }

  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleResizeMouseMove = (e) => {
    if (!isResizing || !imageRef.current) return;
  
    const newWidth = e.clientX - imageRef.current.getBoundingClientRect().left;
    const newHeight = e.clientY - imageRef.current.getBoundingClientRect().top;
  
    if (newWidth > 0 && newHeight > 0) {
      setImageSize({
        width: newWidth,
        height: newHeight,
        border: '1px dotted red',
      });
    }
  };

 
const handleResizeMouseUp = async () => {
  setIsResizing(false);

  // Update the resized image after mouse up
  if (imageSize && imageRef) {
    const canvas = document.createElement('canvas');
    canvas.width = imageSize.width;
    canvas.height = imageSize.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      imageRef.current,
      0,
      0,
      imageSize.width,
      imageSize.height
    );

    // Convert the resized image on canvas to a blob or data URL
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('Resized image blob is null');
        return;
      }

      const resizedFile = new File([blob], selectedImage?.name, {
        type: 'image/jpeg',
      });

      // Save the resized image file for uploading
      setSelectedImage(resizedFile);
      const resizedImageUrl = URL.createObjectURL(resizedFile);
      setNewImage(resizedImageUrl); // Update the preview with resized image
    }, 'image/jpeg');
  }
};

  useEffect(() => {
    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, [isResizing]);
 
  
  const cancelEditImage =()=> {
    setNewImage(null);
    setCroppedImage(null);
    setCompletedCrop(null);
    setCrop({ x: 0, y: 0 });
    setIsCropping(false);
    imageRef = null;
    onClose();
  }

  const cancelTableEdit = () =>{
    setNewText(null);
    onClose();
  }

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
    <div className="bg-white rounded-lg shadow-lg w-auto max-w-[90%] min-w-[700px] max-h-[80%] overflow-auto">
      <div className="bg-gray-300 p-2 rounded-t-lg">
        <h2 className="text-lg font-medium text-gray-800">{highlight.label}</h2>
      </div>
      <div className="p-4">
        {highlight.type === 'image' && (
          <>
           {!newImage && <div className="mt-4">
              <label htmlFor="originalText" className="block text-sm font-medium text-gray-700">
                Original Image:
              </label>
              <div
                id="originalText"
                dangerouslySetInnerHTML={{ __html: highlight.text }}
                className="mt-2 w-64 h-64 object-cover"
              />
            </div>}
            <div className="image-uploader">
            {newImage && (
              <>
              <label className="block text-sm font-medium text-gray-700">New Image:</label>
              <div  className='left-buttons mb-2'> 
                <button
                    className={`inline-flex justify-center px-4 py-2 text-sm font-medium border border-transparent rounded-md ${!newImage ? 'hidden' : ''} `}
                    onClick={() =>{ 
                    //  showCroppedImage();
                    setImageSize(null);
                    setIsCropping(true);
                    }} title='Crop Image' 
                >
                <FaCropSimple />
                </button>
                <button
                    className={`inline-flex justify-center px-4 py-2 text-sm font-medium border border-transparent rounded-md ${!newImage ? 'hidden' : ''} `}
                     title='Resize Image' 
                     onClick={ () => {
                    // const resizeImage = await resizeFile(selectedImage);
                    // setSelectedImage(new File([resizeImage], selectedImage?.name, { type: 'image/jpeg' }));
                     setIsResizing(true);
                    }}
                >
                  
                  <GiResize />
                  </button>
                  </div>
              <div className="relative w-64 h-64 mt-2" id="newImage">
              {isCropping ? (
                        <ReactCrop
                          crop={crop}
                          onChange={(_, percentCrop) => setCrop(percentCrop)}
                          onComplete={(c) => {
                            showCroppedImage(c);
                            setCompletedCrop(c);
                          }}
                          minHeight={100}
                        >
                          <img
                            ref={imageRef}
                            alt="Crop me"
                            src={newImage}
                            onLoad={onImageLoaded}
                          />
                        </ReactCrop>) 
                        : 
                        <img
                        ref={imageRef}
                        src={newImage}
                        alt="New upload"
                        style={imageSize}
                         />
                      }
                {
                  croppedImage && <>
                  <label className="block text-sm font-medium text-gray-700">Preview:</label>

                  <div id="croppedImageDiv">
                  <img
                            alt="Cropped image"
                            src={croppedUrl}
                          />

                  </div>
                  </>
                }
        </div>
        </>
      )}

              
            </div>
           
            <div className="block text-sm font-medium text-gray-700 mt-4 flex justify-end space-x-2">
            <div className='left-buttons mb-2'>
            <input
              type="file"
              name="selectedImage"
              accept="image/png,image/jpeg"
              onChange={handleImageUpload}
              className="mt-2"
              ref={inputRef}
              hidden
            />
            <button
              type="button"
              className="block text-gray-900 border border-gray-300 rounded-lg cursor-pointer
          bg-gray-50 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600
          dark:hover:bg-gray-600 focus:outline-none py-2 px-4"
              onClick={() =>{setImageSize(null); inputRef.current.click();}}
            >
              Change Image
            </button>
            </div>
            <div className="right-buttons text-right">
                  <button
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    onClick={cancelEditImage}
                  >
                    Cancel
                  </button>
                
                  <button
                    className={`inline-flex justify-center px-4 py-2 text-sm font-medium border border-transparent rounded-md ${
                      newImage
                        ? 'text-white bg-blue-600 hover:bg-blue-700'
                        : 'text-gray-500 bg-gray-300 cursor-not-allowed'
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
        {highlight.type === 'table' && (
          <>
           
            <div className="mt-4 hidden">
              <label htmlFor="originalText" className="block text-sm font-medium text-gray-700">
                Original Table:
              </label>
              <div id="originalText" dangerouslySetInnerHTML={{ __html: highlight.text }} />
           
             <div id="newTable" ref={tableDivRef} dangerouslySetInnerHTML={{ __html: newText }} />
            </div>
             <div className="block text-sm font-medium text-gray-700 mt-2">
             <div className="flex space-x-2">
              <DynamicTable  initialTableHtml={highlight.text} setNewText={setNewText} handleSaveTable={handleSaveTable}/>
              </div>
              <div className="flex justify-between">
            
                <div className="flex space-x-2">
                  <button
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    onClick={cancelTableEdit}
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

export default DocumentHighlightsModal;
