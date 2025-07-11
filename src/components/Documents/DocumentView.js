import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ReactHtmlParser from "react-html-parser";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaLink,
  FaUndo,
  FaRedo,
  FaPalette,
} from "react-icons/fa";
import {
  downloadDocument,
  getDocumentById,
  sendDocumentViaEmail,
  updateDocumentContent,
} from "../../services/documentApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DocumentView(props) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = props.id || paramId;
  const [editorContent, setEditorContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    unorderedList: false,
    orderedList: false,
    link: false,
  });
  const [fontColor, setFontColor] = useState("#000000");
  const [fontSize, setFontSize] = useState("12pt"); // Default font size
  const [fontFamily, setFontFamily] = useState("Arial"); // Default font style
  const editorRef = useRef(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("projectId");
  const tempId = queryParams.get("templateId");
  const templateId = props.templateId || tempId;

  /* const handlePrint = () => {
    const printContents = editorRef.current.innerHTML;
    console.log(printContents);
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    console.log("in print")
  } 
  */
  const handleSendEmail = async () => {
    try {
      setIsEdit(true);
      setLoading(true);
      const response = await sendDocumentViaEmail(id);
      if (response.status === 200) {
        toast.success("Email sent successfully");
      }
    } catch (error) {
      console.error("Failed to save updated document content", error);
      toast.error("Failed to send email. Please try later");
    } finally {
      setIsEdit(false);
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContents = editorRef.current.innerHTML;
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = printContents;
    const footerElementNodes = tempContainer.querySelectorAll("footer");
    const footerContent = footerElementNodes[0]?.innerHTML || "";
    console.log(footerContent);
    console.log(footerElementNodes.length);

    if (footerElementNodes.length > 0) {
      footerElementNodes.forEach((footer) => footer.remove());
      console.log("Footer elements removed.");
    } else {
      console.log("No footer elements found.");
    }
    const printWindow = window.open("", "_blank");

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Document</title>
            <style>
              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
                          
              @page {
                size: A4;
                margin: 15mm 15mm 15mm 15mm;
              }
  
              html, body {
                width: 210mm;
                min-height: 297mm;
                font-family: Arial, sans-serif;
                line-height: 1.6;
                background: white;s
              }
  
              .print-wrapper {
                position: relative;
                width: 100%;
                min-height: 100%;
                padding-bottom: 20mm; /* Space for footer */
                background: white;
              }
  
              .content {
                height: 100%;
                border: 1px solid #ddd;
              }
  
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 1em 0;
                page-break-inside: auto; /* Allow tables to break if too large */
              }
  
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
  
              table, th, td {
                border: 1px solid #ddd;
                padding: 8px;
              }
  
              h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
                break-after: avoid;
                margin-top: 0.5em;
                margin-bottom: 0.5em;
              }
  
              p {
                orphans: 3;
                widows: 3;
                margin-bottom: 0.5em;
              }
                           
               
              @media print {
                html, body {
                  margin: 0;
                  padding: 0;
                  width: 210mm;
                  height: 297mm;
                }

             footer {
                position: fixed !important;
                bottom: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 15mm !important;
                background: white !important;
                z-index: 10 !important;
              }  
                             
              .docx-wrapper {
                  background: none !important;
                  padding: 0 !important;
                  padding-bottom: 0 !important;
                  display: block !important;
                  flex-flow: initial !important;
                  align-items: initial !important;
              }
              .docx-wrapper > section.docx {
                  background: none !important;
                  box-shadow: none !important;
                  margin-top: 0 !important;
                  margin-bottom: 0 !important;
                  padding-top: 0 !important;
                  padding-bottom: 0 !important;
                  flex-flow: initial !important;
                  align-items: initial !important;
                  border: 1px solid #ddd;
              }
                
                .print-wrapper {
                  width: 100%;
                  height: 100%;
                  margin: 0;
                  padding: 0 0 0 0;
                }
  
                .content {
                  height: auto;
               }
  
                div {
                  page-break-inside: auto;
                }
  
                img, figure {
                  page-break-inside: avoid;
                  max-width: 100% !important;
                }
  
                .footer {
                  position: fixed;
                  bottom: 0;
                }
  
                .page:blank {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-wrapper">
              <div class="content">
              ${tempContainer.innerHTML}
              </div>
              <div class="footer" id="pageFooter">
              ${footerContent}
              </div>
              </div>
            <script>
              function setupPagination() {
                let style = document.createElement('style');
                style.textContent = \`
                  body {
                    counter-reset: pageNumber;
                  }
                  .pageNumber::before {
                    counter-increment: pageNumber;
                    content: counter(pageNumber);
                  }
                \`;
                document.head.appendChild(style);
  
                const images = document.querySelectorAll('img');
                images.forEach(img => {
                  img.style.maxWidth = '100%';
                  img.style.height = 'auto';
                });
  
                const tables = document.querySelectorAll('table');
                tables.forEach(table => {
                  if (table.offsetWidth > table.parentElement.offsetWidth) {
                    table.style.width = '100%';
                  }
                });
              }
  
              function handlePageBreaks() {
                const content = document.querySelector('.content');
                const elements = Array.from(content.children);
                
                elements.forEach((element, index) => {

                  const rect = element.getBoundingClientRect();
                  const pageHeight = 297 - 35; // A4 height minus margins in mm
                  
                  if (rect.bottom > pageHeight && index > 0) {

                  const wrapper = document.createElement('div');
                    wrapper.style.pageBreakBefore = 'always';
                    element.parentNode.insertBefore(wrapper, element);
                    wrapper.appendChild(element);
                  }
                });
              }
  
              window.onload = function() {
                setupPagination();
                handlePageBreaks();
                
                setTimeout(() => {
                  window.print();
                  window.onfocus = function() {
                    window.close();
                  }
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus(); // Focus on the new window
        printWindow.print(); // Trigger print
        printWindow.close(); // Close the print window after printing
      };
    } else {
      console.error("Failed to open the print window.");
    }
  };

  useEffect(() => {
    setLoading(true);
    const fetchDocument = async () => {
      if (id) {
        try {
          const response = await getDocumentById(id);
          const result = response;
          setEditorContent(result?.content);
          setFileName(result?.fileName);
          if (response) setLoading(false);
        } catch (error) {
          console.error("Failed to fetch document", error);
        }
      }
    };

    fetchDocument();
  }, [id]);

  const handleSave = async () => {
    setIsEdit(true);
    setLoading(true);
    try {
      const response = await updateDocumentContent(
        id,
        editorRef.current.innerHTML
      );
      if (response) {
        setIsEdit(false);
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to save updated document content", error);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const status = await downloadDocument(id, fileName);
      if (status === "Success") setLoading(false);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const handleBack = () => {
    // navigate(`/export/${templateId}?projectId=${projectId}`);
    navigate(-1);
  };

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      orderedList: document.queryCommandState("insertOrderedList"),
      link: document.queryCommandState("createLink"),
    });
  };

  const format = (command, value = null) => {
    document.execCommand(command, false, value);
    updateActiveFormats();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };
  /*
  const updateActiveFormats = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
  
    const range = selection.getRangeAt(0);
    const parentElement = range.commonAncestorContainer.parentElement;
  
    setActiveFormats({
      bold: parentElement.style.fontWeight === 'bold',
      italic: parentElement.style.fontStyle === 'italic',
      underline: parentElement.style.textDecoration === 'underline',
      font: parentElement.style.fontFamily || 'default',
      color: parentElement.style.color || 'default',
      unorderedList: parentElement.tagName === 'UL',
      orderedList: parentElement.tagName === 'OL',
      link: parentElement.tagName === 'A',
    });
  };
  
  const format = (command, value = null) => {
    
    const selection = window.getSelection();
  
    if (!selection.rangeCount) return;
  
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
  
    if (selectedText.length === 0) return; // No text selected
  
    const parentElement = range.commonAncestorContainer.parentElement;
    let span;
  
    // Handle lists (ordered/unordered)
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      let listType = command === 'orderedList' ? 'OL' : 'UL';
      let list = document.createElement(listType);
      let listItem = document.createElement('LI');
      listItem.innerText = selectedText;
      
          // Apply list styles
      if (listType === 'OL') {
        list.setAttribute('type', '1'); // '1' for decimal in ordered lists
      } else if (listType === 'UL') {
        list.style.listStyleType = 'disc'; // 'disc' for unordered lists
      }
      
      // If the parent is already a list, append a new list item
      if (parentElement.tagName === listType) {
        parentElement.appendChild(listItem);
      } else {
        range.deleteContents();
        list.appendChild(listItem);
        range.insertNode(list);
      }
  
      updateActiveFormats();
      return;
    }
  
    // Handle links
    if (command === 'createLink') {
      console.log(command);
      let anchor = document.createElement('a');
      anchor.href = value;
      
      anchor.target = '_blank';  // Ensure the link opens in a new tab
      anchor.rel = 'noopener noreferrer';  // Security measure
      anchor.innerText = selectedText;
      
      // Wrap the selected text in the <a> tag
      try {
        range.deleteContents();
        range.insertNode(anchor);
  
        // Optional: Use range.surroundContents() to ensure the link wraps the text
        const linkRange = document.createRange();
        linkRange.selectNode(anchor);
        selection.removeAllRanges();
        selection.addRange(linkRange);
      } catch (error) {
        console.error('Error inserting link:', error);
      }
    }

      // Handle text formatting
  if (parentElement.tagName === 'SPAN' && parentElement.innerText === selectedText) {
    span = parentElement; // Reuse existing span if selectedText matches
  } else {
    span = document.createElement('span');
    span.innerText = selectedText;
    range.deleteContents();
    range.insertNode(span);
  }

  
  
    // Apply the appropriate style or attribute based on the command
    switch (command) {
      case 'bold':
        span.style.fontWeight = span.style.fontWeight === 'bold' ? 'normal' : 'bold';
        break;
      case 'italic':
        span.style.fontStyle = span.style.fontStyle === 'italic' ? 'normal' : 'italic';
        break;
      case 'underline':
       //span.style.textDecoration = span.style.textDecoration === 'underline' ? 'none' : 'underline';
       span.classList.add('docx_hyperlink');
        break;
      case 'fontName':
        span.style.fontFamily = value;
        break;
      case 'fontSize':
          span.style.fontSize = value;
          break;
      case 'foreColor':
        span.style.color = value;
        break;
      default:
        break;
    }
  
    updateActiveFormats();
  
    if (editorRef.current) {
      editorRef.current.focus(); // Maintain focus on the editor
    }
  };*/

  const createLink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      format("createLink", url);
      setActiveFormats((prev) => ({ ...prev, link: true }));
    }
  };

  const handleInput = (e) => {
    setEditorContent(e.currentTarget.innerHTML);
  };

  const handleColorChange = (e) => {
    const color = e.target.value;
    setFontColor(color);
    format("foreColor", color);
  };

  const sizeMap = {
    1: "8pt",
    2: "10pt",
    3: "12pt",
    4: "14pt",
    5: "18pt",
    6: "24pt",
    7: "36pt",
  };

  const reverseSizeMap = Object.fromEntries(
    Object.entries(sizeMap).map(([key, value]) => [value, key])
  );

  const handleFontSizeChange = (e) => {
    const sizeWithPt = e.target.value; // Get the selected value, e.g., '16pt'
    const size = reverseSizeMap[sizeWithPt] || "3"; // Convert 'pt' to a value between 1 and 7, default to '3'
    setFontSize(sizeWithPt); // Optionally, set the font size including 'pt'
    format("fontSize", size); // Pass the numerical value between 1 and 7 to the format function
  };

  const handleFontFamilyChange = (e) => {
    const family = e.target.value;
    setFontFamily(family);
    format("fontName", family);
  };

  return (
    <div className='flex w-full h-screen p-4'>
      <div className='w-3/4 p-4 flex flex-col'>
        {loading && (
          <div className='fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50'>
            <div className='loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32'></div>
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          className='border p-4 bg-white shadow-sm rounded-lg flex-grow print-content'
          style={{ height: "500px", overflow: "auto" }}
          onFocus={updateActiveFormats}
          //onInput={handleInput}
        >
          {ReactHtmlParser(editorContent)}
        </div>
      </div>
      <div className='w-1/4 p-4 bg-gray-100 shadow-md rounded-lg flex flex-col'>
        <h2 className='text-lg font-semibold mb-4'>Options</h2>
        <div className='flex gap-2 mb-4'>
          <button
            onClick={() => format("bold")}
            className={`p-2 rounded hover:bg-gray-200 ${
              activeFormats.bold ? "bg-gray-300" : ""
            }`}
          >
            <FaBold />
          </button>
          <button
            onClick={() => format("italic")}
            className={`p-2 rounded hover:bg-gray-200 ${
              activeFormats.italic ? "bg-gray-300" : ""
            }`}
          >
            <FaItalic />
          </button>
          <button
            onClick={() => format("underline")}
            className={`p-2 rounded hover:bg-gray-200 ${
              activeFormats.underline ? "bg-gray-300" : ""
            }`}
          >
            <FaUnderline />
          </button>
          <button
            onClick={() => format("insertUnorderedList")}
            className={`p-2 rounded hover:bg-gray-200 ${
              activeFormats.unorderedList ? "bg-gray-300" : ""
            }`}
          >
            <FaListUl />
          </button>
          <button
            onClick={() => format("insertOrderedList")}
            className={`p-2 rounded hover:bg-gray-200 ${
              activeFormats.orderedList ? "bg-gray-300" : ""
            }`}
          >
            <FaListOl />
          </button>
          <button
            onClick={createLink}
            className={`p-2 rounded hover:bg-gray-200 ${
              activeFormats.link ? "bg-gray-300" : ""
            }`}
          >
            <FaLink />
          </button>
        </div>
        <div className='flex gap-2 mb-4'>
          <button
            onClick={() => format("undo")}
            className='p-2 rounded hover:bg-gray-200'
          >
            <FaUndo />
          </button>
          <button
            onClick={() => format("redo")}
            className='p-2 rounded hover:bg-gray-200'
          >
            <FaRedo />
          </button>
          <div className='flex items-center'>
            <input
              id='color-picker'
              type='color'
              value={fontColor}
              onChange={handleColorChange}
              className='position-absolute border-none rounded m-1 visible w-5'
            />
          </div>
        </div>
        <div className='mb-4'>
          <label htmlFor='font-size-picker' className='block mb-1'>
            Font Size
          </label>
          <select
            id='font-size-picker'
            value={fontSize}
            onChange={handleFontSizeChange}
            className='w-full p-2 border rounded'
          >
            {Object.values(sizeMap).map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className='mb-4'>
          <label htmlFor='font-family-picker' className='block mb-1'>
            Font Style
          </label>
          <select
            id='font-family-picker'
            value={fontFamily}
            onChange={handleFontFamilyChange}
            className='w-full p-2 border rounded'
          >
            {[
              "Arial",
              "Times New Roman",
              "Verdana",
              "Courier New",
              "Georgia",
              "Palatino Linotype",
              "Tahoma",
              "Trebuchet MS",
              "Impact",
            ].map((family) => (
              <option key={family} value={family}>
                {family}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSave}
          className='mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          Save
        </button>
        {/*  <button
          onClick={handleExport}
          disabled={isEdit}
          className='mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          Download
        </button> */}
        <button
          onClick={handleSendEmail}
          disabled={isEdit}
          className='mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          Share in Email
        </button>

        <button
          onClick={handlePrint}
          disabled={isEdit}
          className='mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          Print Document
        </button>
        <button
          onClick={handleBack}
          className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
        >
          Back
        </button>
        <ToastContainer />
      </div>
    </div>
  );
}

export default DocumentView;
