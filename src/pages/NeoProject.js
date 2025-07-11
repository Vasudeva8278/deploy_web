import React, { useState, useContext } from "react";
//import { createProject, updateProject } from "../services/projectApi";
import { ProjectContext } from "../context/ProjectContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NeoProject = ({ mode = "view", project = {}, onSave, handleClose }) => {
  const [blockTags, setBlockTags] = useState(project.block || []);
  const [propertyTags, setPropertyTags] = useState(project.property || []);
  const [blockInput, setBlockInput] = useState("");
  const [propertyInput, setPropertyInput] = useState("");
  const [projectName, setProjectName] = useState(project.projectName || "");
  const [projectImage, setProjectImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState("");
  const { addProject, editProject } = useContext(ProjectContext);

  const addTag = (tagType) => {
    if (tagType === "block") {
      if (blockInput.trim()) {
        setBlockTags([...blockTags, blockInput.trim()]);
        setBlockInput("");
      }
    } else if (tagType === "property") {
      if (propertyInput.trim()) {
        setPropertyTags([...propertyTags, propertyInput.trim()]);
        setPropertyInput("");
      }
    }
  };

  const handleCancel = () => {
    handleClose();
  };

  const removeTag = (tagType, index) => {
    if (tagType === "block") {
      setBlockTags(blockTags.filter((_, i) => i !== index));
    } else if (tagType === "property") {
      setPropertyTags(propertyTags.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (50KB = 51900 bytes)
      if (file.size > 250000) {
        toast.error("File size should be less than 250KB");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          // Check dimensions
          if (img.width > 1000|| img.height > 1000) {
            toast.error("Image dimensions should be 250x250 pixels or less");
            return;
          }
          // If all checks pass, set the project image and simulate uploading process
          setUploading(true);
          setProjectImage(file);
          simulateUpload(file.size); // Simulate the upload process
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateUpload = (fileSize) => {
    const uploadDuration = 3000; // Simulate 3 seconds upload time
    const startTime = Date.now();

    const uploadInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / uploadDuration) * 100, 100);
      setUploadProgress(progress);
      setTimeRemaining(
        `${((uploadDuration - elapsed) / 1000).toFixed(1)}s remaining`
      );

      if (progress >= 100) {
        clearInterval(uploadInterval);
        setUploading(false);
        setTimeRemaining("Upload complete");
      }
    }, 100);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("projectName", projectName);
    formData.append("block", JSON.stringify(blockTags)); // Convert arrays to JSON strings
    formData.append("property", JSON.stringify(propertyTags));

    if (projectImage) {
      formData.append("thumbnail", projectImage); // Append image file
    }

    try {
      let response;
      if (mode === "add") {
        console.log(formData);
        response = await addProject(formData);
        //  addProject(response);
      } else if (mode === "edit") {
        console.log(project._id, projectName);
        response = await editProject(project._id, formData);
        // editProject(response);
      }
      onSave(response);
    } catch (error) {
      console.error("Error saving project:", error);
    }

    handleClose();
  };

  const handleButtonClick = () => {
    document.getElementById("hiddenFileInput").click();
  };

  return (
    <div className="flex justify-center items-center fixed inset-0 z-50 overflow-x-hidden overflow-y-auto">
      <div className="relative w-auto my-6 mx-auto max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg relative flex flex-col w-full outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
            <h3 className="text-xl font-normal">
              {mode === "add" ? "Add Project" : "Edit Project"}
            </h3>
          </div>
          <ToastContainer />
          <div className="relative p-6 flex-auto">
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label
                  htmlFor="projectName"
                  className="block text-gray-700 font-normal mb-1"
                >
                  Project Name:
                </label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              {/* Block Tags */}
              <div className="mb-4 hidden">
                <label className="block text-gray-700 font-normal mb-1">
                  Block:
                </label>
                <div id="blockTags" className="flex flex-wrap">
                  {blockTags.map((tag, index) => (
                    <span
                      key={index}
                      className="tag rounded-md px-1 border mb-1 text-gray-500 text-xs"
                    >
                      {tag}
                      {mode !== "view" && (
                        <span
                          className="tag-remove pl-2 cursor-pointer text-zinc-950 text-sm"
                          onClick={() => removeTag("block", index)}
                        >
                          x
                        </span>
                      )}
                    </span>
                  ))}
                </div>
                {mode !== "view" && (
                  <div className="flex items-center">
                    <input
                      type="text"
                      id="blockInput"
                      value={blockInput}
                      onChange={(e) => setBlockInput(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <button
                      type="button"
                      className="bg-indigo-500 hover:bg-blue-700 text-white font-normal py-2 px-4 rounded ml-2"
                      onClick={() => addTag("block")}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* Property Tags */}
              <div className="mb-4 hidden">
                <label className="block text-gray-700 font-normal mb-1">
                  Property:
                </label>
                <div id="propertyTags" className="flex flex-wrap">
                  {propertyTags.map((tag, index) => (
                    <span
                      key={index}
                      className="tag rounded-md px-1 border mb-1 text-gray-500 text-xs"
                    >
                      {tag}
                      {mode !== "view" && (
                        <span
                          className="tag-remove pl-2 cursor-pointer text-zinc-950 text-sm"
                          onClick={() => removeTag("property", index)}
                        >
                          x
                        </span>
                      )}
                    </span>
                  ))}
                </div>
                {mode !== "view" && (
                  <div className="flex items-center">
                    <input
                      type="text"
                      id="propertyInput"
                      value={propertyInput}
                      onChange={(e) => setPropertyInput(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <button
                      type="button"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
                      onClick={() => addTag("property")}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
              {/* Project Image Input only when editing */}
              {(mode === "edit" || mode === "add") && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-normal mb-2">
                    Project Image:
                  </label>
                  <input
                    type="file"
                    id="hiddenFileInput"
                    name="projectImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={handleButtonClick}
                      className=" mr-2 bg-indigo-500 hover:bg-blue-700 text-white font-normal py-2 px-4 rounded"
                    >
                      Upload Image
                    </button>
                    <div> {projectImage ? `${projectImage.name} ` : ""}</div>
                  </div>
                  {/* Upload Progress UI */}
                  {uploading && (
                    <div className="bg-gray-100 p-4 rounded-lg mt-4">
                      <p className="text-gray-600">
                        {uploading ? "Uploading..." : "Upload Complete"}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        {/* <span className="text-gray-600">{uploadProgress}% ・ {timeRemaining}</span>*/}
                        <span className="text-gray-600">
                          {projectImage
                            ? `${projectImage.name} (${(
                                projectImage.size /
                                (1024 * 1024)
                              ).toFixed(2)}MB)`
                            : "No file selected"}
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Only support .jpg and .png files
                      </p>
                    </div>
                  )}

                  <p className="text-gray-500 text-xs mt-1">
                    Please upload an image of 250x250 pixels or less and size
                    less than 50KB.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end pt-4 border-t border-solid border-gray-300 rounded-b">
                <button
                  type="button"
                  className="bg-gray-100 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded mr-2"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                {mode !== "view" && (
                  <button
                    type="submit"
                    className="bg-indigo-500 hover:bg-blue-700 text-white font-normal py-2 px-4 rounded"
                  >
                    {mode === "add" ? "Add Project" : "Save"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeoProject;
