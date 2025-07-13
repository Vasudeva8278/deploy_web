import React, { useContext, useEffect, useState } from "react";
import ChangePassword from "./ChangePassword";
import NeoModal from "../NeoModal";
import axios from "axios";
import {
  createAndUpdateProfile,
  fetchProfile,
} from "../../services/profileApi";
import { ToastContainer, toast } from "react-toastify";
import photo from '../../Assets/general_profile.png';
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";


const ProfileSettings = ({ onClose }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    userId: "", // Add userId for backend identification
    firstName: user && user.name ? user.name : "",
    lastName: "",
    email: user && user.email ? user.email : "",
    mobile: "",
    gender: "",
    dateOfBirth: "",
    address: "",
  });


  const EXECUTIVE = "68621597db15fbb9bbd2f838";
  const EXPERT = "68621581db15fbb9bbd2f836";
  const ADMIN = "68621571db15fbb9bbd2f834";
  
  // Function to get role name based on role ID
  const getRoleName = (roleId) => {
    if (roleId === "68621571db15fbb9bbd2f834") return "Admin";
    if (roleId === "68621581db15fbb9bbd2f836") return "Neo Expert";
    if (roleId === "68621597db15fbb9bbd2f838") return "Neo Executive";
    return "User";
  };

  // Print user role name when component mounts
  useEffect(() => {
    if (user && user.role) {
      const roleName = getRoleName(user.role);
      console.log(`User Role: ${roleName} (ID: ${user.role})`);
    }
  }, [user]);

  // Fetch initial profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetchProfile(); // Replace with your backend API endpoint
        if (response.profile) {
          const profile = response.profile;
          if (profile.dateOfBirth) {
            profile.dateOfBirth = new Date(profile.dateOfBirth)
              .toISOString()
              .split("T")[0];
          }
          if (profile.profilePic) {
            setImagePreview(profile.profilePic);
          }
          // Ensure all fields are strings to prevent trim() errors
          const safeProfile = {
            userId: profile.userId || "",
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            email: profile.email || "",
            mobile: profile.mobile || "",
            gender: profile.gender || "",
            dateOfBirth: profile.dateOfBirth || "",
            address: profile.address || "",
          };
          setFormData(safeProfile);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error.message);
      }
    };
    fetchProfileData();
  }, []);
  const validateForm = () => {
    const newErrors = {};
    
    // Convert all values to strings to ensure .trim() works
    const firstName = String(formData.firstName || '');
    const lastName = String(formData.lastName || '');
    const email = String(formData.email || '');
    const mobile = String(formData.mobile || '');
    const gender = String(formData.gender || '');
    const dateOfBirth = String(formData.dateOfBirth || '');
    const address = String(formData.address || '');
    
    if (!firstName.trim())
      newErrors.firstName = "First name is required.";
    if (!lastName.trim())
      newErrors.lastName = "Last name is required.";
    if (!email.trim()) 
      newErrors.email = "Email address is required.";
    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number.";
    }
    if (!gender.trim()) 
      newErrors.gender = "Please select a gender.";
    if (!dateOfBirth.trim())
      newErrors.dateOfBirth = "Date of birth is required.";
    if (!address.trim()) 
      newErrors.address = "Address is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "address") setAddressError("");
    // Ensure the value is always a string
    setFormData({ ...formData, [name]: String(value || '') });
    setErrors({ ...errors, [name]: "" });
  };

  const handleChangePwd = () => {
    setIsModalOpen(true);
  };

  const validateAddress = (address) => {
    // Match format: "Street, City, State, Postal Code, Country"
    //const addressPattern = /^.+,\s*.+,\s*[A-Za-z]{2},\s*\d{6},\s*.+$/;
    const addressPattern = /^.+\s*,\s*.+\s*,\s*[A-Za-z]*\s*,\s*\d{6}\s*,\s*.+$/;
    if (!addressPattern.test(address)) {
      console.log("address validation failed");
      return "Please enter the complete address in the format: Street, City, State, Postal Code, Country.";
    }
    console.log("address validated");
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const error = validateAddress(formData.address);
    if (error) {
      setAddressError(error);
      return;
    }
    try {
      const formDataToSend = new FormData();

      // Append form data fields
      Object.entries(formData).forEach(([key, value]) => {
        console.log(key, " : : ", value);
        if (key === "profilePic" && value instanceof File) {
          console.log(key, " ** : ", value);
          formDataToSend.append(key, value); // Append file
        } else {
          formDataToSend.append(key, value); // Append other data
        }
      });

      const response = await createAndUpdateProfile(formDataToSend); // Replace with your backend API endpoint
      if (response.status === 200 || response.status === 201) {
        toast.success("Profile saved successfully!");
      }
    } catch (error) {
      console.error("Error saving profile data:", error.message);
      toast.error("Failed to save profile data. Please try again.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePic: file }); // Store the file in formData
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result); // Preview the uploaded image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    document.getElementById("imageUpload").click();
  };

  const featureRouteMap = {
    'viewDashboard': '/dashboard',
    'projects': '/projects',
    'Clients': '/clients',
    'Templates': '/Neo',
    'Documents': '/NeoDocements',
    'Users': '/user-manage',
    'viewProfile': '/profile',
    'viewOrganizations': '/organizations',
  };

  const handleClose = async () => {
    if (onClose) {
      onClose();
    } else if (user && user.role) {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/roles/${user.role}`);
        const features = res.data.features || [];
        if (features.length > 0 && featureRouteMap[features[0]]) {
          navigate(featureRouteMap[features[0]]);
          return;
        }
      } catch (err) {
        // fallback below
      }
      // Fallback: go to dashboard or home
      navigate('/dashboard');
    } else {
      // Fallback: go to dashboard or home
      navigate('/dashboard');
    }
  };

  return (
    <div className='flex flex-col gap-4 bg-white shadow rounded-lg relative'>
      {/* Top right close icon */}
      <button
        className='absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none'
        onClick={handleClose}
        aria-label='Close'
      >
        &times;
      </button>
      <div className='flex justify-between items-center bg-blue-100  p-4 border-red-500'>
        <h2 className='text-xl font-bold text-gray-700'>Profile Settings</h2>
        <div className='flex gap-4'>
          <button
            className='text-sm text-red-600 font-semibold mr-6'
            onClick={handleChangePwd}
          >
            Change Password
          </button>
        </div>
      </div>
      <div className='pl-8 pr-8 mt-4 pt-4'>
        <div className='flex items-center mb-4 '>
          <div className='w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500'>
            {imagePreview ? (
              <img src={imagePreview} alt='Profile' className='w-full h-full' />
            ) : (
              <img src={photo} />
            )}
          </div>
          <button
            className='ml-4 text-sm text-blue-500 hover:underline'
            onClick={handleImageClick}
          >
            Edit Image
          </button>
          <input
            type='file'
            id='imageUpload'
            accept='image/*'
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className='flex flex-col gap-8'>
            <div className='grid grid-cols-2 gap-6 '>
              <div>
                <label
                  htmlFor='firstName'
                  className='block text-sm font-medium text-gray-700'
                >
                  First Name
                </label>
                <input
                  type='text'
                  id='firstName'
                  name='firstName'
                  value={formData.firstName}
                  onChange={handleChange}
                  className='mt-2 h-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                  placeholder='First Name'
                />
                {errors.firstName && (
                  <p className='text-red-500 text-sm mt-2'>
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor='lastName'
                  className='block text-sm font-medium text-gray-700'
                >
                  Last Name
                </label>
                <input
                  type='text'
                  id='lastName'
                  name='lastName'
                  value={formData.lastName}
                  onChange={handleChange}
                  className='mt-2 h-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                  placeholder='Last Name'
                />
                {errors.lastName && (
                  <p className='text-red-500 text-sm mt-2'>{errors.lastName}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700'
                >
                  Email Address
                </label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  value={formData.email}
                  readOnly
                  onChange={handleChange}
                  className='mt-2 h-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                  placeholder='Email Address'
                />
              </div>
              <div>
                <label
                  htmlFor='mobile'
                  className='block text-sm font-medium text-gray-700'
                >
                  Mobile Number
                </label>
                <input
                  type='tel'
                  id='mobile'
                  name='mobile'
                  value={formData.mobile}
                  onChange={handleChange}
                  className='mt-2 h-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                  placeholder='Mobile Number'
                />
                {errors.mobile && (
                  <p className='text-red-500 text-sm mt-2'>{errors.mobile}</p>
                )}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Gender
              </label>
              <div className='flex items-center gap-4 mt-2'>
                {["Male", "Female", "Other"].map((option) => (
                  <label key={option} className='flex items-center'>
                    <input
                      type='radio'
                      name='gender'
                      value={option.toLowerCase()}
                      checked={formData.gender === option.toLowerCase()}
                      onChange={handleChange}
                      className='text-blue-500 focus:ring-blue-500'
                    />
                    <span className='ml-2 text-gray-700'>{option}</span>
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className='text-red-500 text-sm mt-2'>{errors.gender}</p>
              )}
            </div>

            <div className='grid grid-cols-2 gap-6'>
              <div>
                <label
                  htmlFor='dateOfBirth'
                  className='block text-sm font-medium text-gray-700'
                >
                  Date of Birth
                </label>
                <input
                  type='date'
                  id='dateOfBirth'
                  name='dateOfBirth'
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className='mt-2 h-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                />
                {errors.dateOfBirth && (
                  <p className='text-red-500 text-sm mt-2'>
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor='address'
                  className='block text-sm font-medium text-gray-700'
                >
                  Address
                </label>
                <input
                  type='text'
                  id='address'
                  name='address'
                  value={formData.address}
                  onChange={handleChange}
                  className='mt-2 h-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                  placeholder='123 Main St, Springfield, IL, 62704, USA'
                />
                <span>
                  {errors.address && (
                    <p className='text-red-500 text-sm mt-2'>
                      {errors.address}
                    </p>
                  )}

                  {addressError && (
                    <p className='text-red-500 text-sm mt-2'>{addressError}</p>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className='flex gap-4 mt-8'>
            <button
              type='submit'
              className='bg-blue-500 text-white px-6 py-2 rounded-lg font-medium justify-center'
            >
              Save Changes
            </button>
            <button
              type='button'
              className='bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300'
              onClick={handleClose}
            >
              Close
            </button>
            <button
              type='button'
              className='bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300'
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </form>
        <ToastContainer />
        <NeoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ChangePassword className='gap-4' onClose={() => setIsModalOpen(false)} />
        </NeoModal>
      </div>
    </div>
  );
};

export default ProfileSettings;

