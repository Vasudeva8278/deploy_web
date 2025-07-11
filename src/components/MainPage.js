import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentList from '../components/Documents/DocumentList';
import * as docx from 'docx-preview';

const MainPage = () => {
    const navigate = useNavigate();
    const [conversionStatus, setConversionStatus] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const contentRef = useRef(null);

    const handleSelectDocument = (docId) => {
        navigate(`/document/${docId}`);
    };
    const handleExport = (docId) => {
      navigate(`/export/${docId}`);
  };
    const handleDragOver = (e) => {
        e.preventDefault(); // Prevent default behavior (Prevent file from being opened)
        setIsDragging(true);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            onGetFile(file);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onGetFile(file);
        }
    };
/*
    const onGetFile = async (file) => {
        setFile(file);

        const container = document.getElementById('container');
        container.innerHTML = ''; // Clear previous content

        const options = { inWrapper: true, ignoreWidth: false, ignoreHeight: false, ignoreLastRenderedPageBreak: false };

        try {
            await docx.renderAsync(file, container, null, options);
            console.log('docx: finished');
            console.log(container.innerHTML);
            convertFiled(container.innerHTML, file);
            // Ensure the container height matches the document height for pagination
            const pages = container.querySelectorAll('.docx-page');
            if (pages.length > 0) {
                const totalHeight = Array.from(pages).reduce((height, page) => height + page.scrollHeight, 0);
                container.style.height = `${totalHeight}px`;
            }
        } catch (error) {
            console.error('docx rendering error:', error);
        }
    };*/

    const onGetFile = async (file) => {
        setFile(file);
    
        const container = document.getElementById('container');
        container.innerHTML = ''; // Clear previous content
    
        const options= {
            // className: "docx", //class name/prefix for default and document style classes
             inWrapper:  true, //enables rendering of wrapper around document content
             ignoreWidth:  false, //disables rendering width of page
             ignoreHeight:  false, //disables rendering height of page
             ignoreFonts:  false, //disables fonts rendering
             breakPages:  true, //enables page breaking on page breaks
             ignoreLastRenderedPageBreak:  true, //disables page breaking on lastRenderedPageBreak elements
            // experimental:  false, //enables experimental features (tab stops calculation)
             //trimXmlDeclaration:  true, //if true, xml declaration will be removed from xml documents before parsing
            // useBase64URL: true, //if true, images, fonts, etc. will be converted to base 64 URL, otherwise URL.createObjectURL is used
            // renderChanges: false, //enables experimental rendering of document changes (inserions/deletions)
             renderHeaders: true, //enables headers rendering
             renderFooters: true, //enables footers rendering
             renderFootnotes: true, //enables footnotes rendering
             renderEndnotes: true, //enables endnotes rendering
            // renderComments: true, //enables experimental comments rendering
            // debug: false, //enables additional logging
         }
         
      
    
        try {
            await docx.renderAsync(file, container, null, options);
            console.log('docx: finished');
            console.log(container.innerHTML);
    
            // Convert all image elements to Base64
            const images = container.querySelectorAll('img');
             if(images.length>0){
                console.log("images exists");
                for (let img of images) {
                    const response = await fetch(img.src);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    
                    reader.onloadend = () => {
                        // Convert the image to a JPEG data URL
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const image = new Image();
                        
                        image.onload = () => {
                            canvas.width = image.width;
                            canvas.height = image.height;
                            ctx.drawImage(image, 0, 0);
                            img.src = canvas.toDataURL('image/png');
                            
                            // Call convertFiled after all images are converted
                            if ([...images].every(image => image.src.startsWith('data:image/png'))) {
                                convertFiled(container.innerHTML, file);
                            }
                        };
                        
                        image.src = reader.result;
                    };
                    
                    reader.readAsDataURL(blob);
                }
            }else{ convertFiled(container.innerHTML, file);}
            
            console.log("after img ")
    
            // Ensure the container height matches the document height for pagination
            const pages = container.querySelectorAll('.docx-page');
            if (pages.length > 0) {
                const totalHeight = Array.from(pages).reduce((height, page) => height + page.scrollHeight, 0);
                container.style.height = `${totalHeight}px`;
            }
        } catch (error) {
            console.error('docx rendering error:', error);
        }
    };
    

    const convertFiled = async (content, file) => {
        setConversionStatus('Converting...');
        const formData = new FormData();
        formData.append('docxFile', file);
        formData.append('content', content);

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/templates/converted`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                handleSelectDocument(result._id);
                setConversionStatus(`Conversion successful! Content: ${result.content}`);
            } else {
                setConversionStatus('Conversion failed. Please try again.');
            }
        } catch (error) {
            setConversionStatus('An error occurred during conversion.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 min-h-screen">
            <div className="flex flex-col items-center mb-4">
                <div
                    className={`w-full max-w-lg border-dashed p-8 mb-4 border-2 ${isDragging ? 'border-green-500 bg-blue-100' : 'border-blue-500'} rounded-lg`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="text-center py-10 relative">
                        <div className="text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 7a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm-2 4a1 1 0 000-2h10a1 1 0 100 2H5z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="mt-2 text-gray-600">Drag your file(s) to start uploading</p>
                        <input
                            type="file"
                            name="docxFile"
                            accept=".docx, .pdf"
                            onChange={handleFileChange}
                            className="opacity-0 absolute inset-0 cursor-pointer"
                        />
                        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Browse files</button>
                    </div>
                </div>

                <div
                    id="container"
                    style={{
                        overflowY: 'auto',
                        border: '1px solid #ccc',
                        marginTop: '20px',
                        padding: '20px',
                        position: 'relative',
                        display: 'none',
                    }}
                    ref={contentRef}
                ></div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-row justify-between items-center">
                <DocumentList onSelectDocument={handleSelectDocument}  onExport={handleExport}/>
            </div>
        </div>
    );
};

export default MainPage;
