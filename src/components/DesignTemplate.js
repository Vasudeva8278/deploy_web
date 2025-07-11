import React, { useContext, useEffect, useRef, useState } from "react";
import * as docx from "docx-preview";
import { useNavigate } from "react-router-dom";
import { getAllProjects } from "../services/projectApi";
import { createTemplate } from "../services/templateApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProjectContext } from "../context/ProjectContext";

const DesignTemplate = ({ onClose, value, hasProject }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  //const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedProject, setSelectedProject] = useState(value || "");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [conversionStatus, setConversionStatus] = useState("");
  const contentRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState("");
  const fileInputRef = useRef(null);
  const { projects } = useContext(ProjectContext);

  const handleSelectDocument = (docId) => {
    navigate(`/document/${docId}?projectId=${selectedProject}`);
  };

  /*useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await getAllProjects();
      if (response) {
        setProjects(response);
      }
    } catch (error) {
      setError("Failed to fetch documents");
      console.error("Failed to fetch documents", error);
    }
  };*/

  const handleProjectChange = async (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);

    // Find the selected project object from the projects array
    const selectedProjectObject = projects.find(
      (project) => project._id === projectId
    );

    // Update blocks and properties based on the selected project
    if (selectedProjectObject) {
      setBlocks(selectedProjectObject.block || []);
      setProperties(selectedProjectObject.property || []);
    } else {
      setBlocks([]);
      setProperties([]);
    }
  };

  const convertFiled = async (content, file) => {
    setConversionStatus("Converting...");
    const formData = new FormData();
    formData.append("docxFile", file);
    formData.append("content", content);

    try {
      const response = await createTemplate(selectedProject, formData);

      if (response) {
        setLoading(false);

        handleSelectDocument(response._id);
        setConversionStatus(
          `Conversion successful! Content: ${response.fileName}`
        );
      } else {
        setConversionStatus("Conversion failed. Please try again.");
      }
    } catch (error) {
      setConversionStatus("An error occurred during conversion.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onGetFile(file);
    }
  };

  const handleSave = async () => {
    if (selectedProject === "") {
      toast.error("Please select a project");
      return;
    }
    if (file === "" || file === null) {
      toast.error("Please select a DOCX file to upload");
      return;
    }

    setLoading(true);
    const container = document.getElementById("container");
    await convertFiled(container.innerHTML, file);
  };

  const onGetFile = async (file) => {
    setFile(file);
    setUploading(true);
    setUploadProgress(0);
    setTimeRemaining("Calculating...");

    const container = document.getElementById("container");
    container.innerHTML = ""; // Clear previous content

    const options = {
      // className: "docx", //class name/prefix for default and document style classes
      inWrapper: true, //enables rendering of wrapper around document content
      ignoreWidth: false, //disables rendering width of page
      ignoreHeight: false, //disables rendering height of page
      ignoreFonts: false, //disables fonts rendering
      breakPages: true, //enables page breaking on page breaks
      ignoreLastRenderedPageBreak: true, //disables page breaking on lastRenderedPageBreak elements
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
    };

    try {
      await docx.renderAsync(file, container, null, options);
      console.log("docx: finished");
      console.log(container.innerHTML);

      // Convert all image elements to Base64
      const images = container.querySelectorAll("img");
      if (images.length > 0) {
        for (let img of images) {
          const response = await fetch(img.src);
          const blob = await response.blob();
          const reader = new FileReader();

          reader.onloadend = () => {
            // Convert the image to a JPEG data URL
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const image = new Image();

            image.onload = () => {
              canvas.width = image.width;
              canvas.height = image.height;
              ctx.drawImage(image, 0, 0);
              img.src = canvas.toDataURL("image/png");

              /*  // Call convertFiled after all images are converted
               if ([...images].every(image => image.src.startsWith('data:image/png'))) {
                   convertFiled(container.innerHTML, file);
               } */
            };

            image.src = reader.result;
          };

          reader.readAsDataURL(blob);
        }
      } else {
        //convertFiled(container.innerHTML, file);
      }

      // Ensure the container height matches the document height for pagination
      const pages = container.querySelectorAll(".docx-page");
      if (pages.length > 0) {
        const totalHeight = Array.from(pages).reduce(
          (height, page) => height + page.scrollHeight,
          0
        );
        container.style.height = `${totalHeight}px`;
      }
    } catch (error) {
      console.error("docx rendering error:", error);
    } finally {
      setUploading(false);
      setUploadProgress(100);
      setTimeRemaining("Upload complete");
    }
  };

  return (
    <>
      <div className="p-6">
        <ToastContainer />
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium mb-1">Document Upload</h2>
        </div>

        <p className="text-gray-600 mb-4 text-sm">Add your document here</p>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project<span className="text-red-500">*</span>
            </label>
            <select
              className={`mt-1 block w-full py-2 px-3 border rounded-md shadow-sm sm:text-sm ${
                hasProject
                  ? "bg-gray-100 cursor-not-allowed border-gray-300 text-gray-500"
                  : "bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              }`}
              value={selectedProject}
              onChange={handleProjectChange}
              disabled={hasProject}
            >
              <option>Select project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {" "}
                  {project.projectName}{" "}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden">
            <label className="block text-sm font-medium text-gray-700">
              Block
            </label>
            <select className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option>Select block</option>
              {blocks.map((block, index) => (
                <option key={index} value={block}>
                  {block}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden">
            <label className="block text-sm font-medium text-gray-700">
              Property
            </label>
            <select className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option>Select property</option>
              {properties.map((property, index) => (
                <option key={index} value={property}>
                  {property}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-12 h-12 mx-auto text-blue-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>

          <input
            type="file"
            name="docxFile"
            accept=".docx, .pdf"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            className="mt-4 bg-blue-100 text-blue-600 py-2 px-4 rounded-lg"
            onClick={() => {
              fileInputRef.current.click();
            }}
          >
            Browse files
          </button>
        </div>

        <div
          id="container"
          style={{
            overflowY: "auto",
            border: "1px solid #ccc",
            marginTop: "20px",
            padding: "20px",
            position: "relative",
            display: "none",
          }}
          ref={contentRef}
        ></div>
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
          </div>
        )}

        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <p className="text-gray-600">
            {uploading ? "Uploading..." : "Upload Complete"}
          </p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">
              {uploadProgress}% ・ {timeRemaining}
            </span>
            <span className="text-gray-600">
              {file
                ? `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`
                : "No file selected"}
            </span>
          </div>
          <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Only support .doc and .docx files
        </p>

        <div className="flex justify-end">
          <button
            className="bg-white border border-gray-100 hover:bg-gray-300 text-gray-700 font-normal py-2 px-4 rounded-lg mr-2"
            onClick={() => onClose()}
          >
            Cancel
          </button>
          <button
            className="bg-indigo-500 hover:bg-blue-700 text-white font-normal py-2 px-4 rounded-lg"
            onClick={() => handleSave()}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default DesignTemplate;
