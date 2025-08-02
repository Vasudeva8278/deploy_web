import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PlusCircleIcon,
  DownloadIcon,
  ArrowLeftIcon,
  ViewBoardsIcon,
  EyeIcon,
  TrashIcon,
  MinusIcon,
} from "@heroicons/react/outline";
import { v4 as uuidv4 } from "uuid";
import imageIcon from "../Assets/image.png";
import tableIcon from "../Assets/table.png";
import DocumentHighlightsModal from "../components/Documents/DocumentHighlightsModal";
import { ViewListIcon } from "@heroicons/react/solid";
import Instructions from "../components/Instructions";
import TableHeader from "../components/TableHeader";
import { FaArrowRight } from "react-icons/fa";
import NeoModal from "../components/NeoModal";

import {
  addNewDocument,
  deleteDocument,
  exportDocument,
  generateZipFile,
  getDocumentsListByTemplateId,
  updateDocHighlightText,
} from "../services/documentApi";
import TooltipIcon from "../components/TooltipIcon";
import FileCarousel from "../components/FileCarousel";
import Carousel from "../components/FileCarousel";

// Debounce function for API calls
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};



 
const HighlightTable = ({ highlightsArray, templateId, filename }) => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlight, setHighlight] = useState("");
  const [msDocument, setMsDocument] = useState("");
  const [rowNo, setRowNo] = useState("");
  const [cellNo, setCellNo] = useState("");
  const [currentDoc, setCurrentDoc] = useState("");
  const [conversionStatus, setConversionStatus] = useState("");
  const contentRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState({});

  const location = useLocation(); // Gives you access to the current URL including the query string
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("projectId");
  const [templateName, setTemplateName] = useState("");

  // Function to fetch clients
  const fetchClients = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL || 'http://13.200.200.137:7000'}/api/clients`);
      if (response.data.success) {
        setClients(response.data.data);
        console.log("Clients fetched:", response.data.data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError("Failed to load clients. Please try again.");
    }
  };

  // Function to handle client selection from dropdown
  const handleClientDropdownSelection = (clientName, rowIndex) => {
    // Replace the entire field content with just the client name
    handleInputChange(clientName, rowIndex, false);
    setShowClientDropdown(prev => ({ ...prev, [rowIndex]: false }));
    
    // Trigger blur event to save the changes
    setTimeout(() => {
      handleBlur(rowIndex, false);
    }, 100);
    
    // Don't update the main selectedClient - just use the name in the field
    console.log(`Using client name: ${clientName} in document field`);
  };

  // Function to toggle client dropdown
  const toggleClientDropdown = (rowIndex) => {
    setShowClientDropdown(prev => ({ ...prev, [rowIndex]: !prev[rowIndex] }));
  };

  // Function to handle client selection
  const handleClientSelection = (clientId) => {
    setSelectedClient(clientId);
    const selectedClientData = clients.find(client => client._id === clientId);
    if (selectedClientData) {
      console.log("Selected client:", selectedClientData);
      // You can add additional logic here to filter documents based on client
    }
  };

  // Function to get selected client data
  const getSelectedClientData = () => {
    return clients.find(client => client._id === selectedClient);
  };

  // Function to extract client name from document name
  const getClientFromDocumentName = (fileName) => {
    const match = fileName.match(/^([^_]+)_(.+)$/);
    if (match) {
      const clientName = match[1];
      const documentName = match[2];
      return { clientName, documentName };
    }
    return { clientName: null, documentName: fileName };
  };

  // Function to extract client name from any input field
  const extractClientFromInput = (inputValue) => {
    // Check if the input contains a client name
    const clientMatch = clients.find(client => 
      inputValue.toLowerCase().includes(client.name.toLowerCase())
    );
    
    if (clientMatch) {
      return clientMatch;
    }
    
    // If no exact match, try to extract from the beginning of the input
    const words = inputValue.split(/[\s_-]/);
    if (words.length > 0) {
      const potentialClientName = words[0];
      const clientMatch = clients.find(client => 
        client.name.toLowerCase().includes(potentialClientName.toLowerCase()) ||
        potentialClientName.toLowerCase().includes(client.name.toLowerCase())
      );
      return clientMatch || null;
    }
    
    return null;
  };

  // Function to handle document name input with client detection
  const handleDocumentNameInput = (value, rowIndex) => {
    // First update the input value
    handleInputChange(value, rowIndex, false);
    
    // Then try to extract client information
    const detectedClient = extractClientFromInput(value);
    if (detectedClient) {
      console.log(`Detected client: ${detectedClient.name} from input: ${value}`);
      
      // Don't update the main selectedClient - just detect and log
      // setSelectedClient(detectedClient._id); // Removed this line
      
      // You can add additional logic here to populate other client-related fields
      // For example, you might want to update other form fields with client information
    }
  };

  console.log(templateId, filename);
  const fetchData = async () => {
    try {
      const response = await getDocumentsListByTemplateId(projectId, templateId);
      const templateName = response?.templateName;
      setTemplateName(templateName);
      const data = response?.documents;
      setMsDocument(data);
      console.log(data);

      const items =
        data.length > 0
          ? data.map((item) => ({
              id: item._id,
              image: item?.thumbnail, // Assuming `thumbnail` exists in each item
              title: item.fileName,
              description: item.highlights
                .filter((highlight) => highlight.type === "text")
                .map((highlight) => highlight.text)
                .join(" "),
            }))
          : [];

      setItems(items);
      setTableData(
        data.length > 0
          ? data
          : highlightsArray.map((highlight) => ({
              ...highlight,
          id: uuidv4(),
          templateId,
            }))
      );
    } catch (error) {
      console.error("Error fetching documents:", error);
      
      // Handle 404 error gracefully
      if (error.response?.status === 404) {
        console.log("Template not found, using highlights array as fallback");
        // Use highlightsArray as fallback when template is not found
        setTableData(
          highlightsArray.map((highlight) => ({
            ...highlight,
        id: uuidv4(),
        templateId,
          }))
        );
        setTemplateName("Template (Not Found)");
        setItems([]);
      } else {
        // For other errors, show error message
        setError("Failed to load documents. Please try again.");
      }
    }
  };

  useEffect(() => {
    console.log(templateId);
    fetchData();
    fetchClients(); // Fetch clients when component mounts
  }, [highlightsArray, templateId]);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.client-dropdown-container')) {
        setShowClientDropdown({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const viewAllDocument = (docId) => {
    navigate(`/docviewall/${templateId}?projectId=${projectId}`);
  };
  const handleInputChange = (value, rowIndex, cellIndex) => {
    const updatedTableData = [...tableData];
    try {
      updatedTableData[rowIndex].highlights[cellIndex].text = value;
    } catch (err) {
      updatedTableData[rowIndex].fileName = value;
    }
    setTableData(updatedTableData);
  };

  const handleDeleteDocument = async (doc) => {
    const doc_id = doc.id ? doc.id : doc._id;
    console.log("Deleting document:", doc_id, "Project ID:", projectId);
    
    try {
      const response = await deleteDocument(projectId, doc_id);
      if (response) {
        console.log("Document deleted successfully");
        fetchData(); // Refresh the data after successful deletion
      }
    } catch (error) {
      console.error("Delete failed:", error);
      
      // Handle specific error types
      if (error.response?.status === 404) {
        setError("Document not found. It may have already been deleted.");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to delete this document.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (error.code === 'ERR_NETWORK') {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to delete document. Please try again.");
      }
    }
  };
  const handleViewDocument = async (doc) => {
    const doc_id = doc.id ? doc.id : doc._id;
    console.log("viewing document", doc_id);
    navigate(`/docview/${doc_id}`);
  };

  const displayListofDocuments = async () => {
    console.log("list of all document");
    navigate(`/listview`, { state: { data: tableData } });
  };

  const changeImage = (event, rowIndex, cellIndex) => {
    setIsModalOpen(true);
    //console.log(tableData[rowIndex].highlights[cellIndex]);
    setHighlight(tableData[rowIndex].highlights[cellIndex]);
    //console.log(tableData[rowIndex]);
    setCurrentDoc(tableData[rowIndex]);
    setRowNo(rowIndex);
    setCellNo(cellIndex);
  };

  const saveTableOrImage = async (value) => {
    try {
      const updatedTableData = [...tableData];
      updatedTableData[rowNo].highlights[cellNo].text = value;
      const updatedRow = updatedTableData[rowNo];
      const updatedHighlight = updatedTableData[rowNo].highlights[cellNo];
      //  updatedRow.content = await editDocumentContent(conversionStatus,updatedHighlight)
      console.log(updatedRow);
      const doc_id = updatedRow.id ? updatedRow.id : updatedRow._id;
      const response = await updateDocHighlightText(doc_id, updatedRow);
      if (response) fetchData();
    } catch (error) {
      console.error("Failed to save table or image:", error);
      
      // Handle specific error types
      if (error.code === 'ERR_NETWORK') {
        setError("Network error. Please check your connection and try again.");
      } else if (error.response?.status === 404) {
        setError("Document not found. It may have been deleted.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to save changes. Please try again.");
      }
    }
  };

  const handleBlur = async (rowIndex, cellIndex) => {
    try {
      const updatedRow = tableData[rowIndex];
      const updatedHighlight = updatedRow.highlights[cellIndex];
      // updatedRow.content = await editDocumentContent(conversionStatus,updatedHighlight)
      console.log("Saving document with updated row:", updatedRow);
      console.log("Document name being saved:", updatedRow.fileName);
      const doc_id = updatedRow.id ? updatedRow.id : updatedRow._id;
      const response = await updateDocHighlightText(doc_id, updatedRow);
      console.log("Save response:", response);
      //setTableData([...tableData]);
      fetchData();
    } catch (error) {
      console.error("Failed to update document:", error);
      
      // Handle specific error types
      if (error.code === 'ERR_NETWORK') {
        setError("Network error. Please check your connection and try again.");
      } else if (error.response?.status === 404) {
        setError("Document not found. It may have been deleted.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to update document. Please try again.");
      }
    }
  };

  const handleBack = () => {
    navigate("/Neo");
  };

  const handleExportTemplate = (row) => {
    handleExport(templateId, row);
  };

  const handleExport = async (row) => {
    try {
      const response = exportDocument(row._id);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", row.fileName.trim() + ".docx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const handleDocument = (rowIndex, cellIndex) => {
    setConversionStatus(tableData[rowIndex].content);
  };

  const handleAddRow = async () => {
    if (!tableData[0] || !tableData[0].highlights) {
      console.error("No table data or highlights available");
      setError("No template data available to create new document");
      return;
    }
    
    try {
      const newCells = {
        id: uuidv4(),
        templateId,
        fileName: "DocName" + tableData.length,
        highlights: tableData[0].highlights.map((cell) => ({
          id: cell.id,
          label: cell.label,
          text: cell.text,
          type: cell.type,
        })),
      };
      console.log("Sending to backend:", newCells);
      const response = await addNewDocument(newCells);
      const { id } = response;
      newCells.id = id;
      setTableData([...tableData, newCells]);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error adding new row:", error);
      
      // Handle specific error types
      if (error.response?.status === 404) {
        setError("Template not found. Please check if the template exists.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (error.code === 'ERR_NETWORK') {
        setError("Network error. Please check your connection.");
      } else {
      setError("Failed to add new document. Please try again.");
    }
    }
  };
  const handleExportAll = async (event) => {
    event.preventDefault();
      const documentIds = msDocument.map((doc) => doc._id);
      const document = {
        documentIds,
        folderName: filename,
        templateId: templateId,
        projectId: projectId,
      };
    try {
      setIsLoading(true);
      const response = await generateZipFile(document, filename);
      if (response === "Success") setIsLoading(false);
    } catch (error) {
      console.error(error);
      console.log("Failed to zip the documents.");
    }
  };

  return (
    <div className='w-full'>
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='w-full rounded-lg'>
        <div className='flex pb-2'>
          <div className='w-96 flex-1 rounded-lg mr-4 text-gray-400 pt-2 text-sm'>
            <div className='flex'>
              {/*Project Name <FaArrowRight className="text-gray-500 pt-2" size={16} />*/}{" "}
              {templateName}
            </div>
            {/* Client Selector */}
            <div className='mt-2'>
             
            
              {selectedClient && (
                <div className='mt-2 p-2 bg-blue-50 rounded-md'>
                  <p className='text-sm text-blue-800'>
                    <strong>Selected Client:</strong> {getSelectedClientData()?.name}
                  </p>
                  <p className='text-xs text-blue-600 mt-1'>
                    Documents: {getSelectedClientData()?.documents?.length || 0}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className='w-1/2 text-gray-400 rounded-lg mr-4'>
            <input
              type='text'
              value='Search'
              //onChange={handleInputChange}
              placeholder='Search...'
              className='px-4 py-2 w-full max-w-md border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='w-1/4 rounded-lg mr-4'>
            <button
              className='px-2 py-2 bg-gray-200 border-black-500 text-blue-500 rounded hover:bg-gray-600 mr-2'
              onClick={viewAllDocument}
            >
              Preview
            </button>
            <button
              className='px-2 py-2 bg-indigo-500 border-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2'
              onClick={handleExportAll}
            >
              Generate
            </button>
            <button
              className='px-2 py-2 bg-indigo-500 border-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
              onClick={displayListofDocuments}
            >
              Summary
            </button>
          </div>
          <div className='w-1/8 rounded-lg'>
            <TooltipIcon>
              <ul className='list-disc pl-5 space-y-2 flex-grow'>
                <li>
                  Please click on the + sign to add more columns/rows to the
                  tables.
                </li>
                <li>
                  Variable names can be edited by double-clicking on the name.
                  (The allotted space will remain unchanged)
                </li>
                <li>
                  Click on Generate button below to get the documents prepared
                  using your standard format.
                </li>
                <li>
                  The documents can be auto formatted in the preview window.
                </li>
              </ul>
            </TooltipIcon>{" "}
          </div>
        </div>
      </div>
      <div className='flex w-full'>
        <div className='w-full bg-white rounded-lg' style={{ height: '500px' }}>
          {tableData.length > 0 && (
            <div className="w-full h-full overflow-y-auto">
              <table
                id='doc-table'
                className='bg-white shadow-md rounded-lg border-collapse w-full'
              >
                <thead className="sticky top-0 bg-gray-300 z-10">
                  <tr className='bg-gray-300 text-gray-700 text-sm font-normal'>
                    <TableHeader
                      tableData={tableData}
                      handleAddRow={handleAddRow}
                      name='Variable Name'
                      firstColumn={true}
                    />
                    {tableData.map((row, rowIndex) => (
                      <th key={rowIndex} className='px-2 text-left'>
                          {/* Document Name Input */}
                          <div className='flex items-center justify-between text-sm'>
                            <div className='flex flex-col relative'>
                              <div className='flex items-center'>
                                <input
                                  type='text'
                                  value={row.fileName}
                                  onChange={(e) =>
                                    handleDocumentNameInput(e.target.value, rowIndex)
                                  }
                                  onFocus={() => toggleClientDropdown(rowIndex)}
                                  onBlur={() => {
                                    handleBlur(rowIndex, false);
                                    // Delay hiding dropdown to allow for clicks
                                    setTimeout(() => {
                                      setShowClientDropdown(prev => ({ ...prev, [rowIndex]: false }));
                                    }, 200);
                                  }}
                                  className='h-4 px-2 bg-transparent rounded focus:ring-2 focus:ring-blue-500 max-w-32 truncate'
                                  style={{
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title={row.fileName} // Show full name on hover
                                />
                                <button
                                  onClick={() => toggleClientDropdown(rowIndex)}
                                  className='ml-1 text-xs text-gray-500 hover:text-gray-700'
                                  title='Select client'
                                >
                                  ▼
                                </button>
                              </div>
                              
                              {/* Client Dropdown */}
                              {showClientDropdown[rowIndex] && (
                                <div className='absolute top-full left-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto min-w-32 client-dropdown-container'>
                                  <div className='text-xs text-gray-500 px-2 py-1 border-b border-gray-200'>
                                    Select Client:
                                  </div>
                                  {clients.map((client) => (
                                    <button
                                      key={client._id}
                                      onClick={() => handleClientDropdownSelection(client.name, rowIndex)}
                                      className='w-full text-left px-2 py-1 text-xs hover:bg-blue-50 focus:bg-blue-50'
                                    >
                                      {client.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                              
                              {/* Show detected client */}
                         
                            </div>
                          <div className='flex items-center'>
                            {tableData.length > 1 && (
                              <button
                                className='bg-transparent text-red-400 rounded hover:bg-white transition-colors m-2 flex items-center'
                                onClick={() => handleDeleteDocument(row)}
                              >
                                <MinusIcon className='w-5 h-5 inline-block m-1' />
                                <span className='m-1'>Remove</span>
                              </button>
                            )}
                            <button
                              className='hidden bg-green-500 text-white rounded hover:bg-blue-600 transition-colors m-2'
                              onClick={() => handleViewDocument(row)}
                            >
                              <EyeIcon className='w-5 h-5 inline-block m-1' />
                            </button>
                            <button
                              className='hidden bg-green-500 text-white rounded hover:bg-blue-600 transition-colors m-2'
                              onClick={() => handleExport(row)}
                            >
                              <DownloadIcon className='w-5 h-5 inline-block m-1' />
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData[0].highlights.map((cell, cellIndex) => (
                    <tr key={cellIndex} className=' p-1 m-1'>
                      <td className='p-1 m-1 border-r border-gray-300'>
                        <div className='border border-gray-300 rounded p-1 pl-4 m-1 text-sm'>
                          {cell.label}
                        </div>
                      </td>
                      {tableData.map((row, rowIndex) => (
                        <td
                          key={rowIndex}
                          className='  p-1 m-1 border-r border-gray-300 text-sm'
                        >
                          <div className='border border-gray-300 rounded   '>
                            {tableData[rowIndex].highlights[cellIndex].type ===
                            "text" ? (
                              <input
                                type='text'
                                value={
                                  tableData[rowIndex].highlights[cellIndex].text
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    e.target.value,
                                    rowIndex,
                                    cellIndex
                                  )
                                }
                                onBlur={() => handleBlur(rowIndex, cellIndex)}
                                onFocus={() =>
                                  handleDocument(rowIndex, cellIndex)
                                }
                                className=' rounded focus:ring-2 focus:ring-blue-500 w-full m-0 p-1 pl-4'
                              />
                            ) : tableData[rowIndex].highlights[cellIndex].type ===
                              "image" ? (
                              <>
                                {" "}
                                {tableData[rowIndex].highlights[cellIndex]
                                  .text !== "" ? (
                                  <>
                                    <span
                                      className='font-semibold hidden'
                                      dangerouslySetInnerHTML={{
                                        __html:
                                          tableData[rowIndex].highlights[
                                            cellIndex
                                          ].text,
                                      }}
                                    ></span>{" "}
                                    <button
                                      onClick={(e) =>
                                        changeImage(e, rowIndex, cellIndex)
                                      }
                                      className='mt-2'
                                    >
                                      <img src={imageIcon} />
                                    </button>
                                  </>
                                ) : (
                                  <button>
                                    <input
                                      type='file'
                                      name='selectedImage'
                                      onChange={(e) =>
                                        changeImage(
                                          e.target.value,
                                          rowIndex,
                                          cellIndex
                                        )
                                      }
                                      accept='image/*'
                                      className='mt-2'
                                    />
                                  </button>
                                )}{" "}
                              </>
                            ) : tableData[rowIndex].highlights[cellIndex].type ===
                              "table" ? (
                              <>
                                {" "}
                                {tableData[rowIndex].highlights[cellIndex]
                                  .text !== "" ? (
                                  <>
                                    <span
                                      className='font-normal hidden'
                                      dangerouslySetInnerHTML={{
                                        __html:
                                          tableData[rowIndex].highlights[
                                            cellIndex
                                          ].text,
                                      }}
                                    ></span>
                                    <button
                                      onClick={(e) =>
                                        changeImage(e, rowIndex, cellIndex)
                                      }
                                      className='mt-2'
                                    >
                                      <img src={tableIcon} />
                                    </button>
                                  </>
                                ) : (
                                  <button>+add</button>
                                )}{" "}
                              </>
                            ) : (
                              " "
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div
            ref={contentRef}
            id='hiddenRenderDoc'
            dangerouslySetInnerHTML={{ __html: conversionStatus }}
            className='border p-4 mr-4 flex-grow bg-white shadow-sm rounded-lg hidden'
            style={{ height: "500px", overflow: "auto" }}
          ></div>
          {isLoading && (
            <div className='fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50'>
              <div className='loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32'></div>
            </div>
          )}
          <div className='mt-4 space-x-2 hidden'>
            <button
              className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors'
              onClick={handleBack}
            >
              <ArrowLeftIcon className='w-5 h-5 inline-block mr-2' /> Back
            </button>
            <button
              className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors'
              onClick={handleExportAll}
            >
              <DownloadIcon className='w-5 h-5 inline-block mr-2' /> Export All
            </button>
            <button
              className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors'
              onClick={viewAllDocument}
            >
              <ViewListIcon className='w-5 h-5 inline-block mr-2' /> View All
            </button>
          </div>
          <div>
            <DocumentHighlightsModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={saveTableOrImage}
              highlight={highlight}
              tempDocument={currentDoc}
              initialText={highlight.text}
            />
          </div>
        </div>
      </div>
      <div className='flex ml-12'>
        <div className='mt-4'>
          <Carousel
            items={items}
            slidesToShow={6}
            itemWidth={150}
            carouselWidth={800}
            projectId={projectId}
            templateId={templateId}
          />
        </div>
      </div>
      {/*  <div className="col-span-1 bg-white rounded-lg shadow-md  ">
      Right column content goes here 

        <Instructions handleExportAll={handleExportAll} viewAllDocument={viewAllDocument} displayListofDocuments={displayListofDocuments} />
      </div>*/}
    </div>
  );
};

export default HighlightTable;