import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import EditModal from "./Template/EditModal";
import {
	PencilIcon,
	TrashIcon,
	PlusCircleIcon,
	SaveIcon,
	DotsHorizontalIcon,
} from "@heroicons/react/solid";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import table from "../Assets/table.png";
import image from "../Assets/image.png";
import NeoModal from "./NeoModal";
import { getTemplatesById } from "../services/templateApi";
import {
	deleteHighlight,
	getImgLink,
	saveOrUpdateHighlights,
	saveTemplateContent,
	uploadImg,
    
} from "../services/highlightsApi";
import StyleComponents from "./StyleComponents";
import LabelsComponent from "./Template/LabelsComponent";
import { getExistingLabelsInProject } from "../services/projectApi";

// Suppress Chrome extension errors
window.addEventListener('error', function(e) {
    if (e.message.includes('Client has been destroyed') && 
        e.filename.includes('chrome-extension')) {
        e.preventDefault();
        return false;
    }
});

function HtmlParseTool() {
	const navigate = useNavigate();
	const { id } = useParams();
	const [conversionStatus, setConversionStatus] = useState("");
	const [highlights, setHighlights] = useState([]);
	const [templateId, setTemplateId] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editHighlightId, setEditHighlightId] = useState(null);
	const [editInitialText, setEditInitialText] = useState("");
	const [addLabel, setAddLabel] = useState(false);
	const [originalImage, setOriginalImage] = useState("");
	const [newHighlight, setNewHighlight] = useState({
		id: "",
		label: "",
		text: "",
		type: "text",
		name: "",
		multi: false,
	});
	const contentRef = useRef(null);
	const highlightCounter = useRef(0);
	const [fileName, setFileName] = useState("");
	const [isEditingFileName, setIsEditingFileName] = useState(false);
	const [selection, setSelection] = useState();
	const [searchText, setSearchText] = useState("");
	const [isMultiple, setIsMultiple] = useState(false);
	const [highlightName, setHighlightName] = useState("");
	const [editHighlight, setEditHighlight] = useState("");
	const [addTable, setAddTable] = useState(false);
	const [addImage, setAddImage] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [project, setProject] = useState("");
	const [mouseUpHandled, setMouseUpHandled] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const isTableSelectedRef = useRef(false);
	const isImageSelectedRef = useRef(false);
	const isTextSelectedRef = useRef(false);
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [alertText, setAlertText] = useState("");
	const [isResetAll, setIsResetAll] = useState(false);
	const location = useLocation(); // Gives you access to the current URL including the query string
	const queryParams = new URLSearchParams(location.search);
	const projectId = queryParams.get("projectId");
	const [editTemplate, setEditTemplate] = useState(true);
	const [rightSectionVisible, setRightSectionVisible] = useState(false);
	const [isContentTouched, setIsContentTouched] = useState(false);
	const [existingLabels, setExistingLabels] = useState([]); // Store fetched labels
	const [isAutoDetecting, setIsAutoDetecting] = useState(false);
	const [isConfirmingAutoDetect, setIsConfirmingAutoDetect] = useState(false);
	const [tableCounter, setTableCounter] = useState(1);
	const [imageCounter, setImageCounter] = useState(1);
	const [textCounter, setTextCounter] = useState(1);
	const [isTextPatternDetecting, setIsTextPatternDetecting] = useState(false);
	const [inlineEditId, setInlineEditId] = useState(null);
	const [inlineEditValue, setInlineEditValue] = useState("");

	const fetchLabels = async (projectId) => {
		console.log(projectId);
		try {
			const result = await getExistingLabelsInProject(projectId);

			const groupedLabels = result.reduce((acc, item) => {
				acc[item.highlightType] = item.labels;
				return acc;
			}, {});

			console.log(groupedLabels);
			setExistingLabels(groupedLabels || {});

			console.log("Existing Labels: ", result);
		} catch (error) {
			console.error("Error updating templates: ", error);
		}
	};

	useEffect(() => {
		const fetchDocument = async () => {
			if (id) {
				try {
					const response = await getTemplatesById(projectId, id);
					const result = response;
					setTemplateId(result._id);
					setConversionStatus(result.content);
					setHighlights(result.highlights);
					setFileName(result.fileName);
					setProject(result.projectId); // to get complete project Object to pass in state.
				} catch (error) {
					console.error("Failed to fetch document", error);
				}
			}
		};

		fetchDocument();
		fetchLabels(projectId);
	}, [id]);

	const handleContentChange = () => {
		setIsContentTouched(true);
	};
	const handleBack = () => {
		//console.log(projectId);
		if (projectId) {
			navigate(`/clients`);
		} else {
			navigate("/NeoTemplates");
		}
	};

	const handleFileNameChange = (e) => {
		setFileName(e.target.value);
	};

	const createHighlightSpan = (elementType, id, content) => {
		const ele = document.createElement(elementType);
		ele.id = id;
		ele.setAttribute("data-highlight-id", id);
		ele.classList.add("highlight");
		ele.innerHTML = content;
		return ele;
	};

	const generateHighlightId = () => {
		const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, "");
		return `highlight-${highlightCounter.current++}-${timestamp}`;
	};

	const handleImageHighlighting = async (imgData) => {
		if (!imgData) return;

		// Check if the parent element is a div and has data-highlight-id
		const parentElement = imgData.parentNode;
		console.log(parentElement);
		if (
			parentElement &&
			parentElement.tagName === "DIV" &&
			parentElement.hasAttribute("data-highlight-id")
		) {
			const existingHighlightId =
				parentElement.getAttribute("data-highlight-id");
			console.log("existingHighlightId", existingHighlightId);
			if (existingHighlightId) return null;

			// Check if the highlightId exists in the highlights array
			const highlightExists = highlights.some(
				(highlight) => highlight.id === existingHighlightId
			);

			if (highlightExists) {
				console.log(
					`Highlight with ID ${existingHighlightId} already exists.`,
					parentElement
				);
				return null;
			}
		} else {
			const highlightId = generateHighlightId();
			console.log("Img highlight doesnt exists");
			// Create a div element to wrap around the image
			const div = createHighlightSpan(
				"div",
				highlightId,
				imgData.outerHTML
			);
			div.style.border = "1px solid blue";
			div.style.boxSizing = "border-box";
			div.style.display = "inline-block";

			// Create a Blob from the image data if needed
			const newImageBlob = await createBlobFromImage(imgData);
			setOriginalImage(newImageBlob);

			// Update the state with the new highlight information
			setNewHighlight({
				id: highlightId,
				text: imgData.outerHTML,
				label: "",
				type: "image",
				multi: false,
			});
			isImageSelectedRef.current = true;
			console.log(highlightId);
			// Assuming you want to replace the original image with the new highlighted div
			console.log(imgData);

			if (parentElement) {
				parentElement.replaceChild(div, imgData);
			}
			console.log(parentElement.innerHTML);
			return parentElement?.innerHTML;
		}
	};

	const handleTextHighlight = async () => {
		if (addLabel) {
			if (isTextSelectedRef.current) {
				setIsAlertOpen(true);
				setAlertText(
					"Text is already selected. Please cancel and reselect"
				);
				return;
			}
			console.log(addLabel, addImage, addTable);
			if (addImage || addTable) {
				return;
			}
			setNewHighlight({
				id: "",
				text: "",
				label: "",
				type: "",
				name: "",
				multi: false,
			});
			const selection = window.getSelection();
			console.log(selection);
			if (!selection.rangeCount) return;

			const range = selection.getRangeAt(0);

			const selectedText = range.toString();
			console.log(selectedText);
			if (!selectedText) {
				console.log("@170");
				return;
			}

			const highlightId = generateHighlightId();

			const span = document.createElement("span");
			span.textContent = selectedText;
			span.id = highlightId;
			span.setAttribute("data-highlight-id", highlightId);
			span.classList.add("highlight");
			setHighlightName(highlightId);
			if (!isMultiple) {
				console.log("insert for single label");
				range.deleteContents();
				range.insertNode(span);
			}
			console.log(span);
			setNewHighlight({
				id: highlightId,
				text: selectedText,
				label: "",
				name: highlightId,
				type: "text",
				multi: isMultiple,
			});
			isTextSelectedRef.current = true;
			selection.removeAllRanges();
			setSelection(selection);
		}
		// console.log("new Highlight", newHighlight);
	};

	const handleTableHighlighting = (tableData) => {
		if (!tableData) return;

		const parentTag = tableData.parentNode;
		console.log(parentTag);
		if (
			parentTag &&
			parentTag.tagName === "SECTION" &&
			parentTag.hasAttribute("data-highlight-id")
		) {
			console.log("in if");
			const existingHighlightId =
				parentTag.getAttribute("data-highlight-id");
			if (existingHighlightId) return null;

			console.log("existingHighlightId", existingHighlightId);
			// Check if the highlightId exists in the highlights array
			const highlightExists = highlights.some(
				(highlight) => highlight.id === existingHighlightId
			);

			if (highlightExists) {
				console.log(
					`Highlight with ID ${existingHighlightId} already exists.`
				);
				console.log(parentTag);
				return null;
			}
		}

		const highlightId = generateHighlightId();

		const section = createHighlightSpan(
			"section",
			highlightId,
			tableData.outerHTML
		);
		section.style.border = "1px solid blue";
		section.style.boxSizing = "border-box";
		section.style.display = "inline-block";

		setNewHighlight({
			id: highlightId,
			text: tableData.outerHTML,
			label: "",
			type: "table",
			multi: false,
		});
		isTableSelectedRef.current = true;
		console.log(highlightId);
		// Assuming you want to replace the original image with the new highlighted div
		const parentElement = tableData.parentNode;
		if (parentElement) {
			parentElement.replaceChild(section, tableData);
		}
		return parentElement?.innerHTML;
	};

	const addId = async (e) => {
		//console.log(e.target.tagName, "-------------" ,addImage,addTable );
		if (e.target.tagName === "IMG" && addImage) {
			if (isImageSelectedRef.current) {
				setIsAlertOpen(true);
				setAlertText(
					"An Image is aleady selected. Please cancel and re-select."
				);
				return;
			}
			let imgData = e.target;
			imgData = await handleImageHighlighting(imgData);
			console.log(imgData);
			if (imgData !== null) {
				e.target.replaceWith(imgData);
				const updatedContent = contentRef.current.cloneNode(true);
				updatedContent.innerHTML =
					document.getElementById("neoDocView").innerHTML;
			}
		} else if (addTable) {
			if (isTableSelectedRef.current) {
				setIsAlertOpen(true);
				setAlertText(
					"A Table is aleady selected. Please cancel and re-select."
				);
				return;
			}
			console.log("at 271");
			let tableData;
			if (e.target.tagName === "TABLE") {
				tableData = e.target;
			} else if (
				e.target.tagName === "TD" ||
				e.target.tagName === "TR" ||
				e.target.tagName === "P" ||
				e.target.tagName === "SPAN"
			) {
				tableData = e.target.closest("TABLE");
			}
			if (tableData) {
				//console.log(tableData);
				tableData = await handleTableHighlighting(tableData);
				if (tableData !== null) {
					e.target.replaceWith(tableData);
					const updatedContent = contentRef.current.cloneNode(true);
					updatedContent.innerHTML =
						document.getElementById("neoDocView").innerHTML;
				}
			}
		}
	};

	useEffect(() => {
		if (contentRef.current) {
			const contentDiv = contentRef.current;
			const parser = new DOMParser();
			const doc = parser.parseFromString(conversionStatus, "text/html");
			console.log(doc);
			//contentDiv.innerHTML = doc.body.innerHTML;

			// Get the styles from the parsed document
			const styles = doc.querySelectorAll("style");

			// Append the content
			contentDiv.innerHTML = doc.body.innerHTML;

			// Append each style tag to the contentDiv or document head
			styles.forEach((style) => {
				const styleContent = style.innerHTML;

				// Check if any existing style tag in the contentDiv has the same content
				const existingStyle = Array.from(
					contentDiv.querySelectorAll("style")
				).find((existing) => existing.innerHTML === styleContent);

				// If the style content does not exist, append the style tag
				if (!existingStyle) {
					contentDiv.appendChild(style.cloneNode(true));
				}
			});

			const findParentTable = (element) => {
				return element.closest("table");
			};
			const addHighlight = (e) => {
				if (
					e.target.tagName === "TD" ||
					e.target.tagName === "TR" ||
					e.target.tagName === "P" ||
					e.target.tagName === "SPAN"
				) {
					const table = findParentTable(e.target);
					table.style.cursor = "cell";
				}
				if (e.target.tagName === "IMG") {
					e.target.style.cursor = "cell";
				}
			};
			const removeHighlight = (e) => {
				if (e.target.tagName === "TD") {
					const table = findParentTable(e.target);
					table.style.cursor = "";
				}
				if (e.target.tagName === "IMG") {
					e.target.style.cursor = "";
				}
			};
			const attachEventListeners = (element) => {
				if (addTable || addImage) {
					setAddLabel(false);
					if (
						element.tagName === "TABLE" ||
						element.tagName === "IMG"
					) {
						element.addEventListener("mouseover", addHighlight);
						element.addEventListener("mouseout", removeHighlight);
						element.addEventListener("click", addId);
					}
				}
			};
			// Attach event listeners to existing tables and images
			const tables = contentDiv.querySelectorAll("table");
			const images = contentDiv.querySelectorAll("img");
			[...tables, ...images].forEach(attachEventListeners);

			// Set up a MutationObserver to detect new elements
			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					mutation.addedNodes.forEach((node) => {
						if (
							node.tagName === "TABLE" ||
							node.tagName === "IMG"
						) {
							attachEventListeners(node);
						}
						// If the node is a parent container, check its children
						if (node.querySelectorAll) {
							const newTables = node.querySelectorAll("table");
							const newImages = node.querySelectorAll("img");
							[...newTables, ...newImages].forEach(
								attachEventListeners
							);
						}
					});
				});
			});

			// Start observing the content div for child additions
			observer.observe(contentDiv, { childList: true, subtree: true });

			// Clean up observer and event listeners on unmount
			return () => {
				observer.disconnect();
				[...tables, ...images].forEach((element) => {
					element.removeEventListener("mouseover", addHighlight);
					element.removeEventListener("mouseout", removeHighlight);
					element.removeEventListener("click", addId);
				});
			};
		}
	}, [conversionStatus, addImage, addTable, addLabel]);

	async function createBlobFromImage(originalImg) {
		let imgElement;

		if (typeof originalImg === "string") {
			const parser = new DOMParser();
			const doc = parser.parseFromString(originalImg, "text/html");
			imgElement = doc.querySelector("img");
		} else if (originalImg instanceof HTMLImageElement) {
			imgElement = originalImg;
		}

		if (!imgElement) {
			console.error("Invalid image element");
			return null;
		}

		imgElement.crossOrigin = "Anonymous";

		return new Promise((resolve, reject) => {
			const tempImg = new Image();
			tempImg.crossOrigin = "Anonymous";
			tempImg.src = imgElement.src;

			tempImg.onload = () => {
				const canvas = document.createElement("canvas");
				canvas.width = tempImg.naturalWidth;
				canvas.height = tempImg.naturalHeight;
				const ctx = canvas.getContext("2d");
				ctx.drawImage(tempImg, 0, 0);

				canvas.toBlob((blob) => {
					if (blob) {
						resolve(blob);
					} else {
						console.error("Failed to create blob from image");
						reject("Failed to create blob from image");
					}
				}, "image/png");
			};

			tempImg.onerror = (err) => {
				console.error("Image load error:", err);
				reject("Image load error");
			};
		});
	}

	async function uploadImageAndUpdateSrc(highlightId, imgData) {
		const formData = new FormData();
		formData.append("image", originalImage, `${highlightId}.jpeg`);
		formData.append("highlightId", highlightId);

		let imgElement;
		if (typeof imgData === "string") {
			const parser = new DOMParser();
			const doc = parser.parseFromString(imgData, "text/html");
			imgElement = doc.querySelector("img");
		} else if (imgData instanceof HTMLImageElement) {
			imgElement = imgData;
		}

		if (!imgElement) {
			console.error("Invalid image element");
			return null;
		}

		try {
			const response = await uploadImg(highlightId, formData);
			console.log("Image uploaded successfully:", response.data);

			if (response && response.data) {
				setOriginalImage(null);
				const newImgName = response.data;
				const newSrc = await getImgLink(newImgName);

				// Update the src attribute of the original image element
				imgElement.src = newSrc;
				console.log("Updated image source:", imgElement);
				return imgElement.outerHTML;
			}
		} catch (error) {
			console.error("Error uploading image:", error);
		}
		return null;
	}

	const saveImageLabel = async () => {
		const newText = await uploadImageAndUpdateSrc(
			newHighlight.id,
			newHighlight.text
		);
		console.log(newText);
		newHighlight.text = newText?.toString();
		setHighlights((prevHighlights) => [...prevHighlights, newHighlight]);
		const div = contentRef.current.querySelectorAll(
			`[data-highlight-id="${newHighlight.id}"]`
		);
		if (div[0] && div[0].parentNode) {
			div[0].innerHTML = newHighlight.text;
		}

		await saveHighlights(
			[...highlights, newHighlight],
			contentRef.current.innerHTML
		);
		resetTabs();
	};

	const resetTabs = () => {
		setAddLabel(false);
		setIsMultiple(false);
		setAddImage(false);
		setAddTable(false);
		isTableSelectedRef.current = false;
		isImageSelectedRef.current = false;
		isTextSelectedRef.current = false;
		// Reset counters when switching modes
		setTableCounter(1);
		setImageCounter(1);
		setTextCounter(1);
	};

	const saveLabel = () => {
		setHighlights((prevHighlights) => [...prevHighlights, newHighlight]);
		saveHighlights(
			[...highlights, newHighlight],
			contentRef.current.innerHTML
		);
		resetTabs();
	};

	const cancelSaveLabel = () => {
		resetTabs();

		if (newHighlight.text !== "" && newHighlight?.id) {
			console.log("@533");
			// console.log(newHighlight.type, ":::", `[data-highlight-id="${newHighlight.id}"]`);
			// need to be checked again. this is not working.
			if (newHighlight?.type === "text") {
				console.log("@537");
				const spans = contentRef.current.querySelectorAll(
					`[data-highlight-id="${newHighlight.id}"]`
				);
				//  console.log("text spans",spans);
				spans.forEach((span) => {
					if (span && span.parentNode) {
						const textNode = document.createTextNode(
							span.textContent
						);
						// console.log(textNode);
						span.parentNode.replaceChild(textNode, span);
					}
				});
			}

			if (newHighlight?.type === "table") {
				console.log("@550");
				const section = contentRef.current.querySelector(
					`section[data-highlight-id="${newHighlight.id}"]`
				);
				// console.log(section)
				if (section) {
					// Get the parent of the section
					const parent = section.parentNode;
					// Move all child nodes of the section to the parent node
					while (section.firstChild) {
						parent.insertBefore(section.firstChild, section);
					}
					// Remove the section element
					parent.removeChild(section);
				}
			}

			if (newHighlight?.type === "image") {
				console.log("@567");
				const div = contentRef.current.querySelector(
					`div[data-highlight-id="${newHighlight.id}"]`
				);
				if (div) {
					// Get the parent of the section
					const parent = div.parentNode;
					// Move all child nodes of the section to the parent node
					while (div.firstChild) {
						parent.insertBefore(div.firstChild, div);
					}
					// Remove the section element
					parent.removeChild(div);
				}
			}
		}
		setNewHighlight({
			id: "",
			text: "",
			label: "",
			type: "",
			name: "",
			multi: false,
		});
		setSearchText("");
		console.log("@590");
	};

	const handleEditHighlight = (id) => {
		const highlight = highlights.find((highlight) => highlight.id === id);
		if (highlight) {
			setEditHighlight(highlight);
			setEditHighlightId(id);
			setEditInitialText(highlight.text);
			setIsModalOpen(true);
			
			// Add hover effect to the corresponding highlight in the document
			addHoverEffectToHighlight(id);
		}
	};

	// Function to add hover effect to a specific highlight
	const addHoverEffectToHighlight = (highlightId) => {
		if (!contentRef.current) return;
		
		// Remove any existing hover effects
		removeAllHoverEffects();
		
		// Find the highlight element in the document
		const highlightElement = contentRef.current.querySelector(`[data-highlight-id="${highlightId}"]`);
		if (highlightElement) {
			// Add hover effect styles
			highlightElement.style.backgroundColor = "#fef08a";
			highlightElement.style.border = "3px solid #eab308";
			highlightElement.style.boxShadow = "0 0 10px rgba(234, 179, 8, 0.5)";
			highlightElement.style.transform = "scale(1.02)";
			highlightElement.style.transition = "all 0.3s ease";
			highlightElement.style.zIndex = "1000";
			highlightElement.style.position = "relative";
			
			// Add a pulsing animation for editing mode
			if (isModalOpen) {
				highlightElement.style.animation = "pulse 2s infinite";
			}
			
			// Scroll to the highlight if it's not visible
			highlightElement.scrollIntoView({ 
				behavior: 'smooth', 
				block: 'center' 
			});
		}
	};

	// Function to remove all hover effects
	const removeAllHoverEffects = () => {
		if (!contentRef.current) return;
		
		const allHighlights = contentRef.current.querySelectorAll('.highlight');
		allHighlights.forEach(element => {
			element.style.backgroundColor = "";
			element.style.border = "";
			element.style.boxShadow = "";
			element.style.transform = "";
			element.style.transition = "";
			element.style.zIndex = "";
			element.style.position = "";
			element.style.animation = "";
		});
	};

	const handleSaveHighlight = (newText, label) => {
		const updatedHighlights = highlights.map((highlight) =>
			highlight.id === editHighlightId
				? { ...highlight, text: newText, label: label }
				: highlight
		);

		setHighlights(updatedHighlights);
		
		// Update the document content based on highlight type
		if (editHighlight.type === "text") {
			const spans = contentRef.current.querySelectorAll(
				`[data-highlight-id="${editHighlightId}"]`
			);
			spans.forEach((span) => {
				if (span && span.parentNode) {
					span.textContent = newText;
				}
			});
		}

		if (editHighlight.type === "table") {
			const sections = contentRef.current.querySelectorAll(
				`[data-highlight-id="${editHighlightId}"]`
			);

			if (sections[0] && sections[0].parentNode) {
				sections[0].innerHTML = newText;
			}
		}

		if (editHighlight.type === "image") {
			const div = contentRef.current.querySelectorAll(
				`[data-highlight-id="${editHighlightId}"]`
			);

			if (div[0] && div[0].parentNode) {
				div[0].innerHTML = newText;
			}
		}

		// Update the conversion status with the new content
		const updatedContent = contentRef.current.innerHTML;
		setConversionStatus(updatedContent);

		// Save highlights with the updated content
		saveHighlights(updatedHighlights, updatedContent);
		
		// Ensure the changes are properly reflected
		ensureHighlightsReflected();
		
		// Remove hover effects when editing is complete
		removeAllHoverEffects();
		
		setEditHighlight("");
		setEditInitialText("");
		setAddLabel(false);
		setIsMultiple(false);
		setIsModalOpen(false);
	};

	const handleRemoveHighlight = (id) => {
		const updatedHighlights = highlights.filter(
			(highlight) => highlight.id !== id
		);

		const highlightToRemove = highlights.find(
			(highlight) => highlight.id === id
		);

		console.log(highlightToRemove);

		setHighlights(updatedHighlights);

		if (highlightToRemove?.type === "text") {
			const spans = contentRef.current.querySelectorAll(
				`[data-highlight-id="${id}"]`
			);
			//console.log(spans);
			spans.forEach((span) => {
				if (span && span.parentNode) {
					const textNode = document.createTextNode(span.textContent);
					//console.log(textNode);
					span.parentNode.replaceChild(textNode, span);
				}
			});
		}

		if (highlightToRemove?.type === "table") {
			const section = contentRef.current.querySelector(
				`section[data-highlight-id="${id}"]`
			);

			if (section) {
				// Get the parent of the section
				const parent = section.parentNode;

				// Move all child nodes of the section to the parent node
				while (section.firstChild) {
					parent.insertBefore(section.firstChild, section);
				}

				// Remove the section element
				parent.removeChild(section);
			}
		}

		if (highlightToRemove?.type === "image") {
			const div = contentRef.current.querySelector(
				`div[data-highlight-id="${id}"]`
			);

			if (div) {
				// Get the parent of the section
				const parent = div.parentNode;
				// Move all child nodes of the section to the parent node
				while (div.firstChild) {
					parent.insertBefore(div.firstChild, div);
				}
				// Remove the section element
				parent.removeChild(div);
			}
		}
		// saveHighlights(updatedHighlights, contentRef.current.innerHTML);
		deleteHighlights(id, contentRef.current.innerHTML);
	};

	const deleteHighlights = async (highlightId, content) => {
		try {
			const response = await deleteHighlight(
				templateId,
				highlightId,
				content
			);
			if (response) {
				setConversionStatus(content);
				setNewHighlight({
					id: "",
					text: "",
					label: "",
					type: "",
					name: "",
					multi: false,
				});
				setSearchText("");
			}
		} catch (error) {
			console.error("Failed to delete highlights", error);
		}
	};
	const confirmReset = () => {
		setIsResetAll(false);
		handleRemoveAllHighlights();
	};

	const handleRemoveAllHighlights = () => {
		highlights.forEach((highlight) => {
			if (highlight?.type === "text") {
				const spans = contentRef.current.querySelectorAll(
					`[data-highlight-id="${highlight.id}"]`
				);
				spans.forEach((span) => {
					if (span && span.parentNode) {
						const textNode = document.createTextNode(
							span.textContent
						);
						//console.log(textNode);
						span.parentNode.replaceChild(textNode, span);
					}
				});
			}

			if (highlight?.type === "table") {
				const section = contentRef.current.querySelector(
					`section[data-highlight-id="${highlight.id}"]`
				);
				if (section) {
					// Get the parent of the section
					const parent = section.parentNode;
					// Move all child nodes of the section to the parent node
					while (section.firstChild) {
						parent.insertBefore(section.firstChild, section);
					}
					// Remove the section element
					parent.removeChild(section);
				}
			}

			if (highlight?.type === "image") {
				const div = contentRef.current.querySelector(
					`div[data-highlight-id="${highlight.id}"]`
				);
				if (div) {
					// Get the parent of the section
					const parent = div.parentNode;
					// Move all child nodes of the section to the parent node
					while (div.firstChild) {
						parent.insertBefore(div.firstChild, div);
					}
					// Remove the section element
					parent.removeChild(div);
				}
			}
		});

		setHighlights([]);
		saveHighlights([], contentRef.current.innerHTML);
	};

	const handleSaveDocumentName = () => {
		setIsEditingFileName(false);
		saveHighlights(highlights, contentRef.current.innerHTML);
	};

	const saveHighlights = async (updatedHighlights, content) => {
		try {
			setIsLoading(true);
			const updatedObj = {
				highlights: updatedHighlights,
				content,
				fileName,
			};
			const response = await saveOrUpdateHighlights(
				templateId,
				updatedObj
			);

			if (response) {
				setIsLoading(false);
				setConversionStatus(content);
				
				// Update the document content to reflect all changes
				if (contentRef.current) {
					contentRef.current.innerHTML = content;
				}
				
				setNewHighlight({
					id: "",
					text: "",
					label: "",
					name: "",
					type: "",
					multi: false,
				});
				setSearchText("");
			}
			fetchLabels(projectId);
		} catch (error) {
			console.error("Failed to save highlights", error);
		}
	};

	const reloadContent = async () => {
		const response = await getTemplatesById(projectId, id);
		contentRef.current.innerHTML = response.content;
		setIsContentTouched(false);
	};

	const handleSaveTemplateContent = async () => {
		try {
			const content = contentRef.current.innerHTML;
			setIsLoading(true);
			const updatedObj = {
				content,
			};
			const response = await saveTemplateContent(templateId, updatedObj);

			if (response) {
				setIsLoading(false);
				setConversionStatus(content);
				setNewHighlight({
					id: "",
					text: "",
					label: "",
					name: "",
					type: "",
					multi: false,
				});
				setSearchText("");
			}
			setIsContentTouched(false);
		} catch (error) {
			console.error("Failed to save highlights", error);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewHighlight((prevState) => ({
			...prevState,
			[name]: value,
			id: prevState.id || generateHighlightId(),
		}));
	};

	// Need to check if parent node has same data-hightlight-Id
	const highlightText = (text, query) => {
		//console.log(text,"-------------",query);
		if (!query) return text;

		const regex = new RegExp(`(${query})`, "g");
		return text.replace(
			regex,
			`<span class="highlight hightlightcolor" data-highlight-id="${highlightName}" >$1</span>`
		);
	};

	const handleImageClick = () => {
		setAddTable(false);
		setAddImage(true);
		setIsMultiple(false);
		setAddLabel(false);
		
		// Reset counters when switching modes
		resetCounters();
		
		// Auto-highlight all images with sequential names
		autoHighlightImages();
	};

	const handleTableClick = () => {
		setAddTable(true);
		setAddImage(false);
		setIsMultiple(false);
		setAddLabel(false);
		
		// Reset counters when switching modes
		resetCounters();
		
		// Auto-highlight all tables with sequential names
		autoHighlightTables();
	};

	const handleTextClick = () => {
		setAddTable(false);
		setAddImage(false);
		setIsMultiple(false);
		setAddLabel(true);

		// Reset counters when switching modes
		resetCounters();

		// Auto-detect text patterns with underscores
		autoDetectTextPatterns();
	};

	// Function to reset table counter
	const resetTableCounter = () => {
		setTableCounter(1);
	};

	// Function to show table information
	const showTableInfo = () => {
		if (!contentRef.current) return;

		const tables = contentRef.current.querySelectorAll('table');
		const highlightedTables = contentRef.current.querySelectorAll('[data-highlight-id] table');
		
		const totalTables = tables.length;
		const highlightedCount = highlightedTables.length;
		const unhighlightedCount = totalTables - highlightedCount;
		
		setIsAlertOpen(true);
		setAlertText(`Table Information:\n\nTotal tables: ${totalTables}\nHighlighted: ${highlightedCount}\nUnhighlighted: ${unhighlightedCount}\n\nNext table will be named: table${tableCounter}`);
	};

	// Function to reset image counter
	const resetImageCounter = () => {
		setImageCounter(1);
	};

	// Function to show image information
	const showImageInfo = () => {
		if (!contentRef.current) return;

		const images = contentRef.current.querySelectorAll('img');
		const highlightedImages = contentRef.current.querySelectorAll('[data-highlight-id] img');
		
		const totalImages = images.length;
		const highlightedCount = highlightedImages.length;
		const unhighlightedCount = totalImages - highlightedCount;
		
		setIsAlertOpen(true);
		setAlertText(`Image Information:\n\nTotal images: ${totalImages}\nHighlighted: ${highlightedCount}\nUnhighlighted: ${unhighlightedCount}\n\nNext image will be named: image${imageCounter}`);
	};

	// Function to automatically highlight all images with sequential names
	const autoHighlightImages = () => {
		if (!contentRef.current) return;

		const images = contentRef.current.querySelectorAll('img');
		if (images.length === 0) {
			setIsAlertOpen(true);
			setAlertText("No images found in the content.");
			return;
		}

		// Check if any images are already highlighted
		const alreadyHighlightedImages = contentRef.current.querySelectorAll('[data-highlight-id] img');
		const unhighlightedImages = Array.from(images).filter(img => !img.closest('[data-highlight-id]'));
		
		if (unhighlightedImages.length === 0) {
			setIsAlertOpen(true);
			setAlertText("All images are already highlighted. No new images to extract.");
			return;
		}

		const newHighlights = [];
		let currentImageCounter = imageCounter;

		unhighlightedImages.forEach((image, index) => {
			const highlightId = generateHighlightId();
			const imageName = `image${currentImageCounter}`;
			
			// Create div wrapper for the image
			const div = createHighlightSpan(
				"div",
				highlightId,
				image.outerHTML
			);
			div.style.border = "3px solid #10b981";
			div.style.boxSizing = "border-box";
			div.style.display = "inline-block";
			div.style.margin = "10px 0";
			div.style.padding = "5px";
			div.style.backgroundColor = "#ecfdf5";
			div.style.borderRadius = "5px";
			div.setAttribute("title", `Image: ${imageName}`);

			// Replace the image with the highlighted div
			image.parentNode.replaceChild(div, image);

			// Add to highlights array
			const newHighlight = {
				id: highlightId,
				text: image.outerHTML,
				label: imageName,
				type: "image",
				name: imageName,
				multi: false,
			};

			newHighlights.push(newHighlight);
			currentImageCounter++;
		});

		if (newHighlights.length > 0) {
			// Update highlights state using functional update to avoid stale state
			setHighlights(prevHighlights => {
				const updatedHighlights = [...prevHighlights, ...newHighlights];
				
				// Save to server with updated highlights
				const updatedContent = contentRef.current.innerHTML;
				saveHighlights(updatedHighlights, updatedContent);
				
				return updatedHighlights;
			});
			
			// Update image counter
			setImageCounter(currentImageCounter);
			
			setIsAlertOpen(true);
			setAlertText(`Successfully Extracts highlights`);
		} else {
			setIsAlertOpen(true);
			setAlertText("All images are already highlighted or no new images found.");
		}
	};

	// Function to automatically highlight all tables with sequential names
	const autoHighlightTables = () => {	
		if (!contentRef.current) return;

		const tables = contentRef.current.querySelectorAll('table');
		if (tables.length === 0) {
			setIsAlertOpen(true);
			setAlertText("No tables found in the content.");
			return;
		}

		// Check if any tables are already highlighted
		const alreadyHighlightedTables = contentRef.current.querySelectorAll('[data-highlight-id] table');
		const unhighlightedTables = Array.from(tables).filter(table => !table.closest('[data-highlight-id]'));
		
		if (unhighlightedTables.length === 0) {
			setIsAlertOpen(true);
			setAlertText("All tables are already highlighted. No new tables to extract.");
			return;
		}

		const newHighlights = [];
		let currentTableCounter = tableCounter;

		unhighlightedTables.forEach((table, index) => {
			const highlightId = generateHighlightId();
			const tableName = `table${currentTableCounter}`;
			
			// Create section wrapper for the table
			const section = createHighlightSpan(
				"section",
				highlightId,
				table.outerHTML
			);
			section.style.border = "3px solid #3b82f6";
			section.style.boxSizing = "border-box";
			section.style.display = "inline-block";
			section.style.margin = "10px 0";
			section.style.padding = "5px";
			section.style.backgroundColor = "#eff6ff";
			section.style.borderRadius = "5px";
			section.setAttribute("title", `Table: ${tableName}`);

			// Replace the table with the highlighted section
			table.parentNode.replaceChild(section, table);

			// Add to highlights array
			const newHighlight = {
				id: highlightId,
				text: table.outerHTML,
				label: tableName,
				type: "table",
				name: tableName,
				multi: false,
			};

			newHighlights.push(newHighlight);
			currentTableCounter++;
		});

		if (newHighlights.length > 0) {
			// Update highlights state using functional update to avoid stale state
			setHighlights(prevHighlights => {
				const updatedHighlights = [...prevHighlights, ...newHighlights];
				
				// Save to server with updated highlights
				const updatedContent = contentRef.current.innerHTML;
				saveHighlights(updatedHighlights, updatedContent);
				
				return updatedHighlights;
			});
			
			// Update table counter
			setTableCounter(currentTableCounter);
			
			setIsAlertOpen(true);
			setAlertText(`Successfully Extracts highlights`);
		} else {
			setIsAlertOpen(true);
			setAlertText("All tables are already highlighted or no new tables found.");
		}
	};

	// Function to reset text counter
	const resetTextCounter = () => {
		setTextCounter(1);
	};

	// Function to show text pattern information
	const showTextPatternInfo = () => {
		if (!contentRef.current) return;

		const content = contentRef.current.innerHTML;
		// Fixed regex to match complete underscore groups including text before with spaces and special characters
		// This pattern will match text before underscores including spaces, commas, slashes, etc.
		const underscoreGroupRegex = /([a-zA-Z0-9\s,\/\.]+)([_]{5,})/g;
		// Improved regex to match pure underscore fields (minimum 3 underscores)
		const pureUnderscoreRegex = /([_]{5,})/g;
		const patternRegex = /([a-zA-Z0-9\s]+):"([_]+)"|([a-zA-Z0-9\s]+):([_]+)/g;
		const matches = [];
		let match;

		// Track all found patterns to avoid duplicates
		const allFoundPatterns = new Set();

		// Find all underscore groups (text + underscores as one value)
		while ((match = underscoreGroupRegex.exec(content)) !== null) {
			const textBefore = match[1].trim();
			const underscores = match[2];
			const fullValue = textBefore + underscores;
			
			// Only add if we haven't seen this exact group before
			if (!allFoundPatterns.has(fullValue)) {
				allFoundPatterns.add(fullValue);
				
				// Use meaningful text as label, or Value_X if no meaningful text
				const meaningfulText = textBefore.replace(/[,\s]+$/, '').trim();
				// Check if meaningfulText has actual content (not just spaces or empty)
				const hasMeaningfulText = meaningfulText && meaningfulText.length > 0 && !/^\s*$/.test(meaningfulText);
				const label = hasMeaningfulText ? meaningfulText : `Value_${matches.length + 1}`;
				
				matches.push({
					label: label,
					value: underscores, // Only the underscore part
					fullMatch: fullValue,
					textBefore: textBefore,
					underscores: underscores
				});
			}
		}

		// Find all pure underscore fields (just underscores without text before)
		while ((match = pureUnderscoreRegex.exec(content)) !== null) {
			const underscores = match[1];
			const fullValue = underscores;
			
			// Only add if we haven't seen this exact underscore pattern before
			if (!allFoundPatterns.has(fullValue)) {
				allFoundPatterns.add(fullValue);
				
				matches.push({
					label: `Value_${matches.length + 1}`,
					value: underscores, // Only the underscore part
					fullMatch: fullValue,
					textBefore: "",
					underscores: underscores
				});
			}
		}

		// Find all labeled patterns
		while ((match = patternRegex.exec(content)) !== null) {
			const fullMatch = match[0];
			const label = (match[1] || match[3]).trim();
			const value = match[2] || match[4];
			
			// Only add if we haven't seen this exact pattern before
			if (!allFoundPatterns.has(fullMatch)) {
				allFoundPatterns.add(fullMatch);
				matches.push({
					label: label,
					value: value, // Only the underscore part
					fullMatch: match[0]
				});
			}
		}

		setIsAlertOpen(true);
		setAlertText(`Text Pattern Information:\n\nTotal underscore groups found: ${matches.length}\n\nNext text will be named: text${textCounter}\n\nExamples:\n${matches.slice(0, 5).map(m => `${m.label}: "${m.value}" (highlighted part only)`).join('\n')}\n\nNote: Only the underscore part is highlighted, text before becomes the label.`);
	};

	const handleAutoDetectClick = () => {
		setAddTable(false);
		setAddImage(false);
		setIsMultiple(false);
		setAddLabel(false);
		
		// Check if there are existing highlights
		const existingHighlights = contentRef.current?.querySelectorAll('.highlight');
		if (existingHighlights && existingHighlights.length > 0) {
			setIsConfirmingAutoDetect(true);
			setIsAlertOpen(true);
			setAlertText("This will clear existing highlights and create new ones from underscores. Continue?");
		} else {
			// Auto-detect underscores and create highlights
			autoDetectUnderscores();
		}
	};

	const confirmAutoDetect = () => {
		setIsConfirmingAutoDetect(false);
		setIsAlertOpen(false);
		// Auto-detect underscores and create highlights
		autoDetectUnderscores();
	};

	// Function to clear existing auto-detected highlights
	const clearExistingAutoHighlights = () => {
		if (!contentRef.current) return;
		
		// Find all highlight spans and remove them, keeping only the text content
		const highlightSpans = contentRef.current.querySelectorAll('.highlight');
		highlightSpans.forEach(span => {
			if (span.parentNode) {
				const textNode = document.createTextNode(span.textContent);
				span.parentNode.replaceChild(textNode, span);
			}
		});
	};

	// Function to automatically detect underscores and create highlights
	const autoDetectUnderscores = () => {
		if (!contentRef.current) return;

		setIsAutoDetecting(true);
		
		// Clear existing highlights first
		clearExistingAutoHighlights();
		
		const content = contentRef.current.innerHTML;
		const regex = /([a-zA-Z0-9]{2,15})_/g;
		const pureUnderscoreRegex = /([_]{5,})/g;
		const matches = [];
		let match;

		// Track all found patterns to avoid duplicates
		const allFoundPatterns = new Set();

		// Find all matches with text before underscores and remove duplicates
		while ((match = regex.exec(content)) !== null) {
			const fullMatch = match[0];
			const label = match[1];
			const underscorePart = "_"; // Only the underscore part
			
			// Only add if we haven't seen this exact match before
			if (!allFoundPatterns.has(fullMatch)) {
				allFoundPatterns.add(fullMatch);
				matches.push({
					label: label,
					index: match.index,
					fullMatch: fullMatch,
					underscorePart: underscorePart
				});
			}
		}

		// Find all pure underscore fields
		while ((match = pureUnderscoreRegex.exec(content)) !== null) {
			const fullMatch = match[1];
			
			// Only add if we haven't seen this exact match before
			if (!allFoundPatterns.has(fullMatch)) {
				allFoundPatterns.add(fullMatch);
				matches.push({
					label: `Value_${matches.length + 1}`,
					index: match.index,
					fullMatch: fullMatch,
					underscorePart: fullMatch
				});
			}
		}

		if (matches.length === 0) {
			setIsAutoDetecting(false);
			setIsAlertOpen(true);
			setAlertText("No underscores found in the content. Please add underscores to text you want to highlight.");
			return;
		}

		// Create highlights for each match
		const newHighlights = [];
		matches.forEach((matchInfo, index) => {
		const highlightId = generateHighlightId();
			
			// Add to highlights array - store only the underscore part as text
			const newHighlight = {
			id: highlightId,
				text: matchInfo.underscorePart, // Only the underscore part
				label: matchInfo.label,
			type: "text",
				name: highlightId,
				multi: false,
			};

			newHighlights.push(newHighlight);
		});

		// Update the DOM with highlights - improved to avoid nested highlights
		setTimeout(() => {
			try {
			// Sort matches by length (longest first) to avoid partial matches
			const sortedHighlights = [...newHighlights].sort((a, b) => b.text.length - a.text.length);
			
			sortedHighlights.forEach((highlight) => {
				// Replace all occurrences of the underscore pattern in the content
				const contentDiv = contentRef.current;
				
				// Walk through all text nodes and replace the pattern
				const walker = document.createTreeWalker(
					contentDiv,
					NodeFilter.SHOW_TEXT,
					null,
					false
				);

				let node;
				while (node = walker.nextNode()) {
					if (node.textContent.includes(highlight.text)) {
						// Check if this node is already inside a highlight
						const parentHighlight = node.parentNode.closest('.highlight');
						if (parentHighlight) {
							continue; // Skip if already highlighted
						}
						
						// Create the highlight span for only the underscore part
						const span = document.createElement('span');
						span.id = highlight.id;
						span.setAttribute('data-highlight-id', highlight.id);
						span.classList.add('highlight');
						span.textContent = highlight.text; // Only the underscores
						
						// Replace only the underscore part with the span using a more reliable method
						const text = node.textContent;
						const parts = text.split(highlight.text);
						
						if (parts.length > 1) {
							const fragment = document.createDocumentFragment();
							
							parts.forEach((part, index) => {
								if (part) {
									fragment.appendChild(document.createTextNode(part));
								}
								if (index < parts.length - 1) {
									const spanClone = span.cloneNode(true);
									fragment.appendChild(spanClone);
								}
							});
							
							node.parentNode.replaceChild(fragment, node);
						} else if (text === highlight.text) {
							// If the entire text node matches, replace it directly
							node.parentNode.replaceChild(span, node);
						}
					}
				}
			});

				// Update highlights state using functional update to avoid stale state
				setHighlights(prevHighlights => {
					const updatedHighlights = [...prevHighlights, ...newHighlights];

					// Save to server with updated highlights
			const updatedContent = contentRef.current.innerHTML;
					saveHighlights(updatedHighlights, updatedContent);
					
					return updatedHighlights;
				});

			// Ensure highlights are properly reflected
			ensureHighlightsReflected();

			setIsAutoDetecting(false);
			setIsAlertOpen(true);
				setAlertText(`Successfully Extracts highlights`);
			} catch (error) {
				console.error('Error in autoDetectUnderscores:', error);
				setIsAutoDetecting(false);
				setIsAlertOpen(true);
				setAlertText(`Error occurred while highlighting underscores: ${error.message}`);
			}
		}, 100);
	};

	// Function to apply underscores to the example content
	const applyUnderscoresToExample = () => {
		if (!contentRef.current) return;

		// Example content with underscores that should be highlighted
		const exampleContent = `
			This Agreement for Sale ("Agreement") executed on this ____day of _____________, 2023 at Hyderabad.
			
			Value_1	docx_	
			Value_2	executed on this____	
			Value_3	day of_____________	
			Value_4	SriVasudev	
			Value_5	, aged about_____	
			Value_6	BLOCK___	
			Value_7	named as_____________	
			Value_8	Rupees________________________	
			Value_9	BLOCK____	
			PAN	PAN:XYZE9640H
		`;

		// Set the content
		contentRef.current.innerHTML = exampleContent;
		setConversionStatus(exampleContent);

		// Now apply underscore detection
		setTimeout(() => {
			autoDetectUnderscores();
		}, 100);
	};

	// Helper function to show usage instructions
	const showUsageInstructions = () => {
		setIsAlertOpen(true);
		setAlertText("Usage Instructions:\n\n1. Underscore Detection: Add underscores to text you want to highlight. Example: 'Sri_' will create a highlight with label 'Sri' and only highlight the underscore part.\n\n2. Text Pattern Detection: Click '+ Add Text' to highlight complete underscore groups. Only the underscore part is highlighted, meaningful text before becomes the label (e.g., 'Sri ________________________' → Label: 'Sri', Highlighted: '________________________').\n\n3. Table/Image Detection: Click '+ Add Table' or '+ Add Image' to automatically highlight all tables/images with sequential names.\n\nNote: Text before underscores becomes the label automatically, only the underscore part is highlighted!");
	};

	// Function to preview what will be detected
	const previewUnderscores = () => {
		if (!contentRef.current) return;

		const content = contentRef.current.innerHTML;
		const regex = /([a-zA-Z0-9]{2,15})_/g;
		const matches = [];
		let match;

		// Find all matches and remove duplicates
		const seenMatches = new Set();
		while ((match = regex.exec(content)) !== null) {
			const fullMatch = match[0];
			const label = match[1];
			const underscorePart = "_";
			
			// Only add if we haven't seen this exact match before
			if (!seenMatches.has(fullMatch)) {
				seenMatches.add(fullMatch);
				matches.push({
					label: label,
					index: match.index,
					fullMatch: fullMatch,
					underscorePart: underscorePart
				});
			}
		}

		if (matches.length === 0) {
			setIsAlertOpen(true);
			setAlertText("No underscores found in the content. Please add underscores to text you want to highlight.");
			return;
		}

		const previewText = matches.map(match => `Label: "${match.label}" → Highlighted: "${match.underscorePart}"`).join('\n');
		setIsAlertOpen(true);
		setAlertText(`Found ${matches.length} unique underscore pattern(s) to highlight:\n\n${previewText}\n\nClick "Auto Detect" to create highlights.\n\nNote: Text before underscore becomes the label, only the underscore part is highlighted (e.g., "Sri_" → Label: "Sri", Highlighted: "_")`);
	};

	const handleSearchChange = (event) => {
		if (addLabel) {
			// setConversionStatus(contentRef.current.innerHTML);
			setSearchText(newHighlight.text);
		}
	};

	const handleDocumentEdit = () => {
		setEditTemplate(true);
		setRightSectionVisible(false);
	};
	const highlightedText = highlightText(conversionStatus, searchText);

	// Function to show text pattern usage instructions
	const showTextPatternUsageInstructions = () => {
		setIsAlertOpen(true);
		setAlertText("Text Pattern Detection:\n\nThis will highlight only the underscore part of complete underscore groups:\n\n- Text + underscores: 'Sri ________________________' → Label: 'Sri', Highlighted: '________________________'\n- Comma + underscores: ', aged about_____' → Label: 'aged about', Highlighted: '_____'\n- Space + underscores: ' ________________' → Label: 'Value_X', Highlighted: '________________'\n- Labeled patterns: 'name:\"________________\"' → Label: 'name', Highlighted: '________________'\n\nMeaningful text before underscores becomes the label, only the underscore part is highlighted.\n\nClick '+ Add Text' to automatically detect and highlight all underscore groups.");
	};

	// Function to automatically detect text patterns with underscores
	const autoDetectTextPatterns = () => {
		if (!contentRef.current) return;

		setIsTextPatternDetecting(true);
		
		const content = contentRef.current.innerHTML;
		// Fixed regex to match complete underscore groups including text before with spaces and special characters
		// This pattern will match text before underscores including spaces, commas, slashes, etc.
		const underscoreGroupRegex = /([a-zA-Z0-9\s,\/\.]+)([_]{5,})/g;
		// Improved regex to match pure underscore fields (minimum 3 underscores)
		const pureUnderscoreRegex = /([_]{5,})/g;
		const patternRegex = /([a-zA-Z0-9\s]+):"([_]+)"|([a-zA-Z0-9\s]+):([_]+)/g;
		const matches = [];
		let match;

		// Track all found patterns to avoid duplicates
		const allFoundPatterns = new Set();

		// Find all underscore groups first (text + underscores as one value)
		while ((match = underscoreGroupRegex.exec(content)) !== null) {
			const textBefore = match[1].trim();
			const underscores = match[2];
			const fullValue = textBefore + underscores;
			
			// Only add if we haven't seen this exact group before
			if (!allFoundPatterns.has(fullValue)) {
				allFoundPatterns.add(fullValue);
				
				// Use meaningful text as label, or Value_X if no meaningful text
				const meaningfulText = textBefore.replace(/[,\s]+$/, '').trim();
				// Check if meaningfulText has actual content (not just spaces or empty)
				const hasMeaningfulText = meaningfulText && meaningfulText.length > 0 && !/^\s*$/.test(meaningfulText);
				const label = hasMeaningfulText ? meaningfulText : `Value_${matches.length + 1}`;
				
				matches.push({
					label: label,
					value: underscores, // Only the underscore part
					fullMatch: fullValue,
					textBefore: textBefore,
					underscores: underscores,
					isGroup: true
				});
			}
		}

		// Find all pure underscore fields (just underscores without text before)
		while ((match = pureUnderscoreRegex.exec(content)) !== null) {
			const underscores = match[1];
			const fullValue = underscores;
			
			// Only add if we haven't seen this exact underscore pattern before
			if (!allFoundPatterns.has(fullValue)) {
				allFoundPatterns.add(fullValue);
				
				matches.push({
					label: `Value_${matches.length + 1}`,
					value: underscores, // Only the underscore part
					fullMatch: fullValue,
					textBefore: "",
					underscores: underscores,
					isGroup: true
				});
			}
		}

		// Find all labeled patterns
		while ((match = patternRegex.exec(content)) !== null) {
			const fullMatch = match[0];
			const label = (match[1] || match[3]).trim();
			const value = match[2] || match[4];
			
			// Only add if we haven't seen this exact pattern before
			if (!allFoundPatterns.has(fullMatch)) {
				allFoundPatterns.add(fullMatch);
				matches.push({
					label: label,
					value: value, // Only the underscore part
					fullMatch: fullMatch,
					isGroup: false
				});
			}
		}

		if (matches.length === 0) {
			setIsTextPatternDetecting(false);
			setIsAlertOpen(true);
			setAlertText("No underscore groups or text patterns found in the content.");
			return;
		}

		// Check if any of these patterns are already highlighted
		const alreadyHighlightedText = contentRef.current.querySelectorAll('.highlight');
		const alreadyHighlightedContent = Array.from(alreadyHighlightedText).map(span => span.textContent);
		
		// Filter out patterns that are already highlighted
		const newMatches = matches.filter(match => !alreadyHighlightedContent.includes(match.value));
		
		if (newMatches.length === 0) {
			setIsTextPatternDetecting(false);
			setIsAlertOpen(true);
			setAlertText("All found text patterns are already highlighted. No new patterns to extract.");
			return;
		}

		// Create highlights for each new match
		const newHighlights = [];
		let currentTextCounter = textCounter;

		newMatches.forEach((matchInfo, index) => {
			const highlightId = generateHighlightId();
			const textName = `text${currentTextCounter}`;
			
			// Add to highlights array - store only the underscore part as text
			const newHighlight = {
				id: highlightId,
				text: matchInfo.value, // Only the underscore part
				label: matchInfo.label,
				type: "text",
				name: textName,
				multi: false,
			};

			newHighlights.push(newHighlight);
			currentTextCounter++;
		});

		// Update the DOM with highlights - improved to avoid nested highlights
		setTimeout(() => {
			try {
			// Sort matches by length (longest first) to avoid partial matches
			const sortedHighlights = [...newHighlights].sort((a, b) => b.text.length - a.text.length);
			
			sortedHighlights.forEach((highlight) => {
				// Find all text nodes that contain the underscore pattern
				const walker = document.createTreeWalker(
					contentRef.current,
					NodeFilter.SHOW_TEXT,
					null,
					false
				);

				let node;
				while (node = walker.nextNode()) {
					if (node.textContent.includes(highlight.text)) {
						// Check if this node is already inside a highlight
						const parentHighlight = node.parentNode.closest('.highlight');
						if (parentHighlight) {
							continue; // Skip if already highlighted
						}
						
						// Create the highlight span for only the underscore part
						const span = document.createElement('span');
						span.id = highlight.id;
						span.setAttribute('data-highlight-id', highlight.id);
						span.classList.add('highlight');
						span.textContent = highlight.text; // Only the underscores
						
						// Replace only the underscore part with the span
						const text = node.textContent;
						const parts = text.split(highlight.text);
						
						if (parts.length > 1) {
							const fragment = document.createDocumentFragment();
							
							parts.forEach((part, index) => {
								if (part) {
									fragment.appendChild(document.createTextNode(part));
								}
								if (index < parts.length - 1) {
									const spanClone = span.cloneNode(true);
									fragment.appendChild(spanClone);
								}
							});
							
							node.parentNode.replaceChild(fragment, node);
						} else if (text === highlight.text) {
							// If the entire text node matches, replace it directly
							node.parentNode.replaceChild(span, node);
						}
					}
				}
			});

				// Update highlights state using functional update to avoid stale state
				setHighlights(prevHighlights => {
					const updatedHighlights = [...prevHighlights, ...newHighlights];
					
					// Save to server with updated highlights
					const updatedContent = contentRef.current.innerHTML;
					saveHighlights(updatedHighlights, updatedContent);
					
					return updatedHighlights;
				});
			
			// Update text counter
			setTextCounter(currentTextCounter);

			// Ensure highlights are properly reflected
			ensureHighlightsReflected();

			setIsTextPatternDetecting(false);
			setIsAlertOpen(true);
				setAlertText(`Successfully highlighted ${newMatches.length} underscore group(s) with names: ${newMatches.map(m => m.label).join(', ')}`);
			} catch (error) {
				console.error('Error in autoDetectTextPatterns:', error);
				setIsTextPatternDetecting(false);
				setIsAlertOpen(true);
				setAlertText(`Error occurred while highlighting text patterns: ${error.message}`);
			}
		}, 100);
	};

	// Function to ensure highlights are properly reflected in the document
	const ensureHighlightsReflected = () => {
		if (!contentRef.current) return;
		
		// Update the conversion status with the current content
		const currentContent = contentRef.current.innerHTML;
		setConversionStatus(currentContent);
		
		// Force a re-render of the content
		const highlightedText = highlightText(currentContent, searchText);
		contentRef.current.innerHTML = highlightedText;
	};

	// Function to refresh document content with updated highlights
	const refreshDocumentContent = () => {
		if (!contentRef.current) return;
		
		// Get the current content
		const currentContent = contentRef.current.innerHTML;
		
		// Update all highlights in the content
		highlights.forEach(highlight => {
			const spans = contentRef.current.querySelectorAll(
				`[data-highlight-id="${highlight.id}"]`
			);
			spans.forEach(span => {
				if (span && span.parentNode) {
					span.textContent = highlight.text;
				}
			});
		});
		
		// Update the conversion status
		const updatedContent = contentRef.current.innerHTML;
		setConversionStatus(updatedContent);
		
		// Force a re-render
		ensureHighlightsReflected();
	};

	// Function to show current highlight status
	const showHighlightStatus = () => {
		if (!contentRef.current) return;

		const images = contentRef.current.querySelectorAll('img');
		const tables = contentRef.current.querySelectorAll('table');
		const textHighlights = contentRef.current.querySelectorAll('.highlight');
		
		const highlightedImages = contentRef.current.querySelectorAll('[data-highlight-id] img');
		const highlightedTables = contentRef.current.querySelectorAll('[data-highlight-id] table');
		
		const totalImages = images.length;
		const totalTables = tables.length;
		const totalTextHighlights = textHighlights.length;
		
		const highlightedImageCount = highlightedImages.length;
		const highlightedTableCount = highlightedTables.length;
		
		const unhighlightedImages = totalImages - highlightedImageCount;
		const unhighlightedTables = totalTables - highlightedTableCount;
		
		setIsAlertOpen(true);
		setAlertText(`Current Highlight Status:\n\n📷 Images: ${highlightedImageCount}/${totalImages} highlighted (${unhighlightedImages} remaining)\n📊 Tables: ${highlightedTableCount}/${totalTables} highlighted (${unhighlightedTables} remaining)\n📝 Text Patterns: ${totalTextHighlights} highlighted\n\nClick the extract buttons to highlight remaining items.`);
	};

	// Function to reset counters when switching modes
	const resetCounters = () => {
		setTableCounter(1);
		setImageCounter(1);
		setTextCounter(1);
	};

	// Function to handle modal close and remove hover effects
	const handleModalClose = () => {
		removeAllHoverEffects();
		setIsModalOpen(false);
		setEditHighlight("");
		setEditInitialText("");
		setEditHighlightId(null);
	};

	// Function to handle mouse enter on edit button
	const handleEditButtonMouseEnter = (highlightId) => {
		addHoverEffectToHighlight(highlightId);
	};

	// Function to handle mouse leave on edit button
	const handleEditButtonMouseLeave = () => {
		// Only remove hover effects if not currently editing
		if (!isModalOpen) {
			removeAllHoverEffects();
		}
	};

	// Function to handle clicking on highlight links
	const handleHighlightLinkClick = (highlightId) => {
		addHoverEffectToHighlight(highlightId);
		
		// Remove the hover effect after 3 seconds
		setTimeout(() => {
			if (!isModalOpen) {
				removeAllHoverEffects();
			}
		}, 3000);
	};

	// Function to start inline editing for text highlights (DEPRECATED - now uses modal)
	const startInlineEdit = (highlight) => {
		// This function is deprecated - use startEdit instead
		startEdit(highlight);
	};

	// Function to save inline edit (DEPRECATED - now uses modal)
	const saveInlineEdit = () => {
		// This function is deprecated - editing is now handled by modal
		console.log("Inline editing is deprecated - use modal instead");
	};

	// Function to cancel inline edit (DEPRECATED - now uses modal)
	const cancelInlineEdit = () => {
		// This function is deprecated - editing is now handled by modal
		console.log("Inline editing is deprecated - use modal instead");
	};

	// Function to add blue hover effect for inline editing (DEPRECATED)
	const addBlueHoverEffectToHighlight = (highlightId) => {
		// This function is deprecated - use addHoverEffectToHighlight instead
		addHoverEffectToHighlight(highlightId);
	};

	// Function to remove blue hover effects (DEPRECATED)
	const removeBlueHoverEffects = () => {
		// This function is deprecated - use removeAllHoverEffects instead
		removeAllHoverEffects();
	};

	// Function to debug regex pattern matching
	const debugRegexPattern = () => {
		if (!contentRef.current) return;

		const content = contentRef.current.innerHTML;
		// Fixed regex to match complete underscore groups including text before with spaces and special characters
		// This pattern will match text before underscores including spaces, commas, slashes, etc.
		const underscoreGroupRegex = /([a-zA-Z0-9\s,\/\.]+)([_]{5,})/g;
		const matches = [];
		let match;

		while ((match = underscoreGroupRegex.exec(content)) !== null) {
			const textBefore = match[1].trim();
			const underscores = match[2];
			const fullValue = textBefore + underscores;
			
			const meaningfulText = textBefore.replace(/[,\s]+$/, '').trim();
			const hasMeaningfulText = meaningfulText && meaningfulText.length > 0 && !/^\s*$/.test(meaningfulText);
			const label = hasMeaningfulText ? meaningfulText : `Value_${matches.length + 1}`;
			
			matches.push({
				textBefore: textBefore,
				meaningfulText: meaningfulText,
				hasMeaningfulText: hasMeaningfulText,
				label: label,
				underscores: underscores,
				fullValue: fullValue
			});
		}

		const debugText = matches.map((m, i) => 
			`${i + 1}. Text Before: "${m.textBefore}"\n   Meaningful Text: "${m.meaningfulText}"\n   Has Meaningful Text: ${m.hasMeaningfulText}\n   Final Label: "${m.label}"\n   Full Value: "${m.fullValue}"`
		).join('\n\n');

		setIsAlertOpen(true);
		setAlertText(`Debug Regex Pattern Results:\n\n${debugText || "No matches found"}`);
	};

	// Function to start editing for highlights (now uses modal for all types)
	const startEdit = (highlight) => {
		// Use modal for all highlight types (text, table, image)
		handleEditHighlight(highlight.id);
	};

	return (
		<div>
			<style>
				{`
					.highlight {
						background-color: transparent !important;
						border: 1px solid #0000FF !important;
						border-radius: 3px !important;
						padding: 2px 4px !important;
						margin: 0 2px !important;
						display: inline !important;
						font-weight: normal !important;
						color: inherit !important;
						vertical-align: baseline !important;
						line-height: inherit !important;
					}
					.highlightcolor {
						background-color: transparent !important;
						border: 1px solid #0000FF !important;
						border-radius: 3px !important;
						padding: 2px 4px !important;
						margin: 0 2px !important;
						display: inline !important;
						font-weight: normal !important;
						color: inherit !important;
						vertical-align: baseline !important;
						line-height: inherit !important;
					}
					/* Special styling for text pattern highlights */
					.highlight[data-highlight-id*="text"] {
						background-color: transparent !important;
						border: 1px solid #0000FF !important;
						border-radius: 3px !important;
						padding: 2px 4px !important;
						margin: 0 2px !important;
						display: inline !important;
						font-weight: normal !important;
						color: inherit !important;
						vertical-align: baseline !important;
						line-height: inherit !important;
						box-shadow: none !important;
					}
					/* Pulse animation for editing mode */
					@keyframes pulse {
						0% {
							box-shadow: 0 0 10px rgba(234, 179, 8, 0.5);
						}
						50% {
							box-shadow: 0 0 20px rgba(234, 179, 8, 0.8);
						}
						100% {
							box-shadow: 0 0 10px rgba(234, 179, 8, 0.5);
						}
					}
					/* Blue pulse animation for inline editing mode */
					@keyframes bluePulse {
						0% {
							box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
						}
						50% {
							box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
						}
						100% {
							box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
						}
					}
				`}
			</style>
			<div className="w-full p-2">
				<div>
					<div className="flex justify-end">
						<button
							onClick={() => {
								if (editTemplate && isContentTouched) {
									setIsAlertOpen(true);
									setAlertText(
										"Please Save or Cancel your changes before leaving edit mode."
									);
									return;
								}
								setEditTemplate(!editTemplate);
								setRightSectionVisible(!rightSectionVisible);
							}}
							className="px-4 py-2 text-center text-white bg-blue-500 hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white rounded-md" // Updated class
						>
							{rightSectionVisible
								? ">> Click here to Edit Template"
								: ">> Click here to Label Templates"}
						</button>
					</div>
					<div className="w-full p-2">
						{!rightSectionVisible && (
							<StyleComponents
								handleSave={handleSaveTemplateContent}
								handleCancel={reloadContent}
								content={contentRef}
							/>
						)}
					</div>
				</div>
				<div className="w-full flex">
					<div
						ref={contentRef}
						onMouseUp={handleTextHighlight}
						onKeyUp={handleContentChange}
						dangerouslySetInnerHTML={{ __html: highlightedText }}
						id="neoDocView"
						className={`custom-content ${
							rightSectionVisible ? "adjust-width mr-4" : ""
						}`}
						contentEditable={editTemplate}
						style={{
							cursor: "text",
							height: "calc(100vh - 155px)",
							overflowY: "auto",
						}}
					></div>

					{isLoading && (
						<div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
							<div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
						</div>
					)}
					{rightSectionVisible && (
						<div className="w-2/5">
							<div className=" h-[calc(100vh-64px)] overflow-y-auto bg-white shadow-lg rounded-lg">
								<>
									<div className="flex">
										{/* Label Templates Button */}
										<span className="w-full">
											<button className="w-full py-2 text-center text-black bg-blue-400 hover:bg-blue-300 hover:focus:bg-blue-500 focus:text-white rounded-r-md">
												Label Templates
											</button>
										</span>
									</div>
								</>

								{editTemplate ? (
									<StyleComponents
										handleSave={handleSaveTemplateContent}
										content={contentRef}
									/>
								) : (
									<>
										<div className="flex flex-col p-4">
											{isEditingFileName ? (
												<input
													type="text"
													className="text-xl font-bold border border-gray-300 p-2 rounded w-full"
													value={fileName}
													onChange={
														handleFileNameChange
													}
													onBlur={() =>
														handleSaveDocumentName()
													}
													autoFocus
												/>
											) : (
												<div className="flex items-center mb-2">
													<h2 className="text-xl font-bold">
														{fileName}
													</h2>
													<button
														className="ml-2 p-1 rounded hover:bg-blue-100"
														onClick={() =>
															setIsEditingFileName(
																true
															)
														}
														title="Edit"
													>
														<PencilIcon className="h-5 w-5 text-blue-500" />
													</button>
												</div>
											)}
											<div className="addbutton">
												<button
													className={`px-3 py-2 text-sm mr-2 rounded-md border  ${
														addLabel
															? "bg-indigo-600 text-white"
															: "bg-white-400 text-gray-600"
													}`}
													onClick={handleTextClick}
												>
													{isTextPatternDetecting ? "Detecting..." : "+ Add Text"}
												</button>
												<button
													className={`px-3 py-2 text-sm mr-2 rounded-md border ${
														addTable
															? "bg-indigo-600 text-white"
															: "bg-white-400 text-gray-600"
													}`}
													onClick={handleTableClick}
												>
													+ Add Table
												</button>
												
											
											
												<button
													className={`px-3 py-2 text-sm mr-2 rounded-md border ${
														addImage
															? "bg-indigo-600 text-white"
															: "bg-white-400 text-gray-600"
													}`}
													onClick={handleImageClick}
												>
													+ Add Image
												</button>
												
												
												
												
											</div>
										</div>

										<div className="space-y-4">
											{addLabel && (
												<>
													<div className="flex space-x-2 px-2">
														{/*    <div className='flex border rounded-md px-2 py-2'>
                              <input
                                type='text'
                                placeholder='Label'
                                name='label'
                                className='w-full border border-gray-300 p-2 rounded mr-2'
                                value={newHighlight.label}
                                onChange={handleInputChange}
                              />
                              <input
                                type='text'
                                placeholder='Value'
                                name='text'
                                className='w-full border border-gray-300 p-2 rounded'
                                value={newHighlight.text}
                                onChange={handleInputChange}
                                readOnly
                              />
                            </div> */}
														<LabelsComponent
															newHighlight={
																newHighlight
															}
															handleInputChange={
																handleInputChange
															}
															existingLabels={
																highlights
															} // Pass the full array, not just label names
															labelType="text"
														/>
													</div>

													<div className="flex space-x-2 px-2">
														<div className="border rounded-md flex w-full jusify-left">
															<div
																className="px-2"
																style={{
																	display:
																		addLabel
																			? "block"
																			: "none",
																}}
															>
																<input
																	type="checkbox"
																	onChange={
																		handleSearchChange
																	}
																	className="search-input p-2 border rounded"
																	value={
																		isMultiple
																	}
																	disabled={
																		!(
																			newHighlight.label !==
																				"" &&
																			newHighlight.text !==
																				"" &&
																			newHighlight.id
																		)
																	}
																/>{" "}
																Multi
															</div>
														</div>
														<div className="justify-items-end flex w-full">
															<button
																className="bg-gray-100 text-black px-4 mr-2 py-1 rounded"
																onClick={() =>
																	cancelSaveLabel()
																}
															>
																Cancel
															</button>
															<button
																className={`px-4 py-1 rounded ${
																	(newHighlight.label !==
																		"" ||
																		newHighlight.label) &&
																	(newHighlight.text !==
																		"" ||
																		newHighlight.text) &&
																	newHighlight.id
																		? "bg-indigo-600 text-white"
																		: "bg-gray-400 text-gray-600 cursor-not-allowed"
																}`}
																onClick={() =>
																	saveLabel()
																}
																disabled={
																	!(
																		newHighlight.label !==
																			"" &&
																		newHighlight.text !==
																			"" &&
																		newHighlight.id
																	)
																}
															>
																Save
															</button>
														</div>
													</div>
												</>
											)}
											{addTable && (
												<>
													<div className="flex space-x-2 px-2">
														<div className="flex py-2 px-2 rounded-md border w-full">
															{/* <input
                                type='text'
                                placeholder='Label'
                                name='label'
                                className='w-full border border-gray-300 p-2 rounded'
                                value={newHighlight.label}
                                onChange={handleInputChange}
                              />
                              <input
                                type='text'
                                placeholder='Value'
                                hidden
                                name='text'
                                className='w-full border border-gray-300 p-2 rounded'
                                value={newHighlight.text}
                                onChange={handleInputChange}
                              />*/}
															<LabelsComponent
																newHighlight={
																	newHighlight
																}
																handleInputChange={
																	handleInputChange
																}
																existingLabels={
																	existingLabels?.table ||
																	[]
																}
																labelType="table"
															/>
														</div>
													</div>
													<div className="flex space-x-2 justify-end px-4">
														<button
															className="bg-gray-300 text-black px-4 py-1 rounded"
															onClick={() =>
																cancelSaveLabel()
															}
														>
															Cancel
														</button>
														<button
															className={`px-4 py-1 rounded ${
																(newHighlight.label !==
																	"" ||
																	newHighlight.label) &&
																(newHighlight.text !==
																	"" ||
																	newHighlight.text) &&
																newHighlight.id
																	? "bg-indigo-600 text-white"
																	: "bg-gray-400 text-gray-600 cursor-not-allowed"
															}`}
															onClick={() =>
																saveLabel()
															}
															disabled={
																!(
																	newHighlight.label !==
																		"" &&
																	newHighlight.text !==
																		"" &&
																	newHighlight.id
																)
															}
														>
															Save
														</button>
													</div>
												</>
											)}

											{addImage && (
												<>
													<div className="flex space-x-2 px-2">
														<div className="flex border rounded-md px-2 py-2 w-full">
															{/*    <input
                                type='text'
                                placeholder='Label'
                                name='label'
                                className='w-full border border-gray-300 p-2 rounded'
                                value={newHighlight.label}
                                onChange={handleInputChange}
                              />
                              <input
                                type='text'
                                placeholder='Value'
                                hidden
                                name='text'
                                className='w-full border border-gray-300 p-2 rounded'
                                value={newHighlight.text}
                                onChange={handleInputChange}
                              />*/}
															<LabelsComponent
																newHighlight={
																	newHighlight
																}
																handleInputChange={
																	handleInputChange
																}
																existingLabels={
																	existingLabels?.image ||
																	[]
																}
																labelType="image"
															/>
														</div>
													</div>
													<div className="flex space-x-2 justify-end px-4">
														<button
															className="bg-gray-300 text-black px-4 py-1 rounded"
															onClick={() =>
																cancelSaveLabel()
															}
														>
															Cancel
														</button>
														<button
															className={`px-4 py-1 rounded ${
																(newHighlight.label !==
																	"" ||
																	newHighlight.label) &&
																(newHighlight.text !==
																	"" ||
																	newHighlight.text) &&
																newHighlight.id
																	? "bg-indigo-600 text-white"
																	: "bg-gray-400 text-gray-600 cursor-not-allowed"
															}`}
															onClick={() =>
																saveImageLabel()
															}
															disabled={
																!(
																	newHighlight.label !==
																		"" &&
																	newHighlight.text !==
																		"" &&
																	newHighlight.id
																)
															}
														>
															Save
														</button>
													</div>
												</>
											)}
											<div className="space-y-2 max-h-80 overflow-y-auto">
												{/* Summary display */}
												<div className="bg-gray-50 p-3 rounded-md mb-3">
													<div className="flex justify-between items-center text-sm">
														<div>
															<span className="font-medium">Text Highlights: </span>
															<span className="text-blue-600">{highlights.filter(h => h.type === "text").length}</span>
														</div>
														<div>
															<span className="font-medium">Table Highlights: </span>
															<span className="text-green-600">{highlights.filter(h => h.type === "table").length}</span>
														</div>
														<div>
															<span className="font-medium">Image Highlights: </span>
															<span className="text-purple-600">{highlights.filter(h => h.type === "image").length}</span>
														</div>
													</div>
													<div className="mt-2 text-xs text-gray-600">
														{addLabel && "Showing: Text highlights only"}
														{addTable && "Showing: Table highlights only"}
														{addImage && "Showing: Image highlights only"}
														{!addLabel && !addTable && !addImage && "Showing: All highlights"}
													</div>
												</div>
												<div className="flex justify-between items-center">
													<table className="min-w-full divide-y">
														<thead className="bg-gray-100">
															<tr>
																<th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
																	Label
																</th>
																<th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
																	Value
																</th>
																<th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
																	Action
																</th>
															</tr>
														</thead>
														<tbody>
															{highlights
																.filter(highlight => {
																	// Filter highlights based on current mode
																	if (addLabel) {
																		return highlight.type === "text";
																	} else if (addTable) {
																		return highlight.type === "table";
																	} else if (addImage) {
																		return highlight.type === "image";
																	}
																	return true; // Show all if no specific mode
																})
																.map((highlight, index) => (
																	<tr
																		key={highlight.id}
																		className={
																			index % 2 === 0
																				? "bg-white"
																				: "bg-gray-50"
																		}
																	>
																		<td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
																			<a
																				href={`#${highlight.id}`}
																				className="text-gray-600 hover:text-blue-800 cursor-pointer"
																				onClick={(e) => {
																					e.preventDefault();
																					handleHighlightLinkClick(highlight.id);
																				}}
																				title="Click to highlight in document"
																			>
																				{highlight.label}
																			</a>
																		</td>
																		<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
																			<a
																				href={`#${highlight.id}`}
																				className="text-gray-600 hover:text-blue-800 cursor-pointer"
																				onClick={(e) => {
																					e.preventDefault();
																					handleHighlightLinkClick(highlight.id);
																				}}
																				title="Click to highlight in document"
																			>
																				{highlight.type === "text" ? (
																					highlight.text
																				) : highlight.type === "image" ? (
																					<img
																						src={image}
																						alt="/"
																					/>
																				) : highlight.type === "table" ? (
																					<img
																						src={table}
																						alt="/"
																					/>
																				) : (
																					""
																				)}
																			</a>
																		</td>
																		<td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
																			<div className="flex items-center space-x-2">
																				<button
																					onClick={() =>
																						startEdit(highlight)
																					}
																					className="p-1 rounded hover:bg-blue-100"
																					title="Edit in modal"
																					onMouseEnter={() => handleEditButtonMouseEnter(highlight.id)}
																					onMouseLeave={handleEditButtonMouseLeave}
																				>
																					<PencilIcon className="h-4 w-4 text-blue-500" />
																				</button>
																				<button
																					onClick={() =>
																						handleRemoveHighlight(
																							highlight.id
																						)
																					}
																					className="p-1 rounded hover:bg-red-100 ml-2"
																					title="Remove"
																				>
																					<TrashIcon className="h-4 w-4 text-red-500" />
																				</button>
																			</div>
																		</td>
																	</tr>
																))}
														</tbody>
													</table>
												</div>
											</div>
											<div className="flex justify-between p-4 mt-4">
												<button
													className="border border-blue-600 text-blue-600 px-4 py-2 rounded"
													onClick={() =>
														setIsResetAll(true)
													}
												>
													Reset All
												</button>

												<button
													className="hidden px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
													onClick={handleBack}
												>
													<ArrowLeftIcon className="w-5 h-5 inline-block mr-2" />{" "}
													Back
												</button>
												<button
													className="bg-indigo-600 text-white px-2 rounded flex items-center"
													onClick={handleBack}
												>
													<SaveIcon className="h-4 w-4 mr-1" />{" "}
													Save
												</button>
											</div>
										</div>
									</>
								)}
							</div>
						</div>
					)}
				</div>

				<EditModal
					isOpen={isModalOpen}
					onClose={handleModalClose}
					onSave={handleSaveHighlight}
					editHighlight={editHighlight}
					initialText={editInitialText}
					label={editHighlight.label}
				/>
			</div>
			<NeoModal
				isOpen={isAlertOpen}
				onClose={() => setIsAlertOpen(false)}
			>
				<div className="bg-white p-6 rounded-lg  max-w-sm mx-auto ">
					<p className="text-gray-800 text-lg font-semibold mb-4">
						{alertText}
					</p>
					<div className="flex justify-center space-x-4">
						{isConfirmingAutoDetect ? (
							<>
								<button
									className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
									onClick={() => {
										setIsAlertOpen(false);
										setIsConfirmingAutoDetect(false);
									}}
								>
									Cancel
								</button>
								<button
									className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
									onClick={confirmAutoDetect}
								>
									Continue
								</button>
							</>
						) : (
						<button
							className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
							onClick={() => setIsAlertOpen(false)}
						>
							Close
						</button>
						)}
					</div>
				</div>
			</NeoModal>

			<NeoModal isOpen={isResetAll} onClose={() => setIsResetAll(false)}>
				{highlights.length > 0 ? (
					<div className="p-6 bg-white rounded-lg shadow-lg max-w-sm mx-auto">
						<h4 className="text-lg font-semibold text-center mb-4">
							Reset All
						</h4>
						<p className="text-center mb-6">
							Are you sure? Do you wish to reset all highlights?
						</p>
						<div className="flex justify-center space-x-4">
							<button
								className="inline-flex justify-center px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
								onClick={() => setIsResetAll(false)}
							>
								Cancel
							</button>
							<button
								className="inline-flex justify-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								onClick={() => confirmReset()}
							>
								Yes
							</button>
						</div>
					</div>
				) : (
					<div className="p-6 bg-white rounded-lg shadow-lg max-w-sm mx-auto">
						<h4 className="text-lg font-semibold text-center mb-4">
							No Highlights to Reset
						</h4>
						<div className="flex justify-center">
							<button
								className="inline-flex justify-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								onClick={() => setIsResetAll(false)}
							>
								Close
							</button>
						</div>
					</div>
				)}
			</NeoModal>
		</div>
	);
}

export default HtmlParseTool;
