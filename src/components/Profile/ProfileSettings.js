import React, { useContext, useEffect, useState } from "react";
import ChangePassword from "./ChangePassword";
import NeoModal from "../NeoModal";
import axios from "axios";
import {
  createAndUpdateProfile,
  fetchProfile,
} from "../../services/profileApi";
import { ToastContainer, toast } from "react-toastify";
import photo from "../../Assets/general_profile.png";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfileSettings = ({ onClose }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    gender: "",
    dateOfBirth: "",
    address: "",
  });

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/roles`);
        console.log("Fetched roles:", res.data);
        setRoles(res.data);
        
        // Print each role and validate
        res.data.forEach(role => {
          console.log(`Role ID: ${role._id}, Name: ${role.name}, Valid: ${!!role._id && !!role.name}`);
        });
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  const getRoleName = (roleId) => {
    const role = roles.find(r => r._id === roleId);
    return role ? role.name : "User";
  };

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        userId: user._id || user.id || "",
        firstName: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (user?.role) {
      console.log("User Role ID:", user.role);
      console.log("User Role Name:", getRoleName(user.role));
    }
  }, [user, roles]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      const userId = user._id || user.id;
      if (!userId) return;

      try {
        setIsLoading(true);
        const profile = await fetchProfile(userId);
        console.log("Fetched profile object:", profile);

        let formattedDate = "";
          if (profile.dateOfBirth) {
          formattedDate = new Date(profile.dateOfBirth)
              .toISOString()
              .split("T")[0];
          }

          if (profile.profilePic) {
            setImagePreview(profile.profilePic);
          }

        // Handle address object properly
        const addressData = profile.address || {};
        console.log("Address data:", addressData);

        setFormData({
          userId: profile.userId || userId,
          firstName: profile.firstName || user.name || "",
            lastName: profile.lastName || "",
          email: profile.email || user.email || "",
            mobile: profile.mobile || "",
            gender: profile.gender || "",
          dateOfBirth: formattedDate,
            address: profile.address || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName?.trim()) newErrors.firstName = "Required";
    if (!formData.lastName?.trim()) newErrors.lastName = "Required";
    if (!formData.email?.trim()) newErrors.email = "Required";
    if (!formData.mobile?.trim()) newErrors.mobile = "Required";
    if (!formData.gender?.trim()) newErrors.gender = "Required";
    if (!formData.dateOfBirth?.trim()) newErrors.dateOfBirth = "Required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const fd = new FormData();

      // Check if profile picture is selected
      const hasProfilePic = formData.profilePic instanceof File;
      if (hasProfilePic) {
        toast.info("Preparing to upload profile picture...");
      }

      // Add all fields including address as string
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'profilePic' && value instanceof File) {
          // Handle profile picture file
          fd.append('profilePic', value);
          toast.info(`Profile picture added to upload: ${value.name}`);
        } else if (key !== 'profilePic') {
          // Handle other fields
          fd.append(key, value || "");
        }
      });

      console.log("FormData contents:");
      for (let [key, value] of fd.entries()) {
        console.log(`${key}:`, value);
      }

      toast.info("Sending profile data to server...");
      const res = await createAndUpdateProfile(fd);

      if (res.status === 200 || res.status === 201) {
        if (hasProfilePic) {
          toast.success("Profile and picture saved successfully!");
        } else {
          toast.success("Profile saved successfully!");
        }
      } else {
        toast.error("Failed to save profile.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(`Error saving profile: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    console.log("Selected file:", file);
    
    if (!file || !file.type.startsWith("image/")) {
      console.log("Invalid file type:", file?.type);
      toast.error("Please select a valid image file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB image allowed.");
      return;
    }

    console.log("Setting profile picture in formData:", file.name, file.size, file.type);
    toast.info(`Selected image: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
    
    setFormData((prev) => ({
      ...prev,
      profilePic: file,
    }));

    const reader = new FileReader();
    reader.onload = () => {
      console.log("File preview created");
      setImagePreview(reader.result);
      toast.success("Image preview loaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const handleClose = async () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow p-6 relative">
      <button
        className="absolute top-2 right-2 text-gray-500 text-2xl"
        onClick={handleClose}
      >
        &times;
      </button>

      <h2 className="text-xl font-bold mb-4">Profile Settings</h2>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
          <img
            src={imagePreview || photo}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
          <input
          type="file"
          id="profileImage"
          accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
        <button
          className="text-blue-500 underline"
          onClick={() => document.getElementById("profileImage").click()}
        >
          Change Photo
        </button>
        </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} error={errors.firstName} />
        <Input name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} error={errors.lastName} />
        <Input name="email" label="Email" value={formData.email} readOnly />
        <Input name="mobile" label="Mobile" value={formData.mobile} onChange={handleChange} error={errors.mobile} />
        <Input name="dateOfBirth" label="Date of Birth" value={formData.dateOfBirth} onChange={handleChange} type="date" error={errors.dateOfBirth} />
        <Input name="address" label="Address" value={formData.address} onChange={handleChange} error={errors.address} />

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Gender</label>
          <div className="flex gap-4">
            {["male", "female", "other"].map((g) => (
              <label key={g} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={formData.gender === g}
                  onChange={handleChange}
                />
                <span className="capitalize">{g}</span>
                  </label>
                ))}
              </div>
          {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
            </div>

        <div className="col-span-2 mt-4 flex justify-end gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-red-100 px-4 py-2 rounded"
          >
            ResetPassword
          </button>
        </div>
        </form>

        <NeoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ChangePassword onClose={() => setIsModalOpen(false)} />
        </NeoModal>

      <ToastContainer position="top-right" />
    </div>
  );
};

const Input = ({ name, label, value, onChange, type = "text", readOnly = false, error }) => (
  <div>
    <label className="block text-sm font-medium mb-1" htmlFor={name}>
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full h-10 px-3 border rounded ${
        readOnly ? "bg-gray-100" : ""
      }`}
    />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

export default ProfileSettings;
