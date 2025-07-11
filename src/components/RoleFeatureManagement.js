import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FEATURE_LIST = ["projects", "Clients", "Templates", "Documents", "Users"];

const RoleFeatureManagement = () => {
  const [roles, setRoles] = useState([]);
  const [roleLoading, setRoleLoading] = useState(true);
  const [editRoleId, setEditRoleId] = useState(null);
  const [editedFeatures, setEditedFeatures] = useState([]);

  // Fetch roles and their features
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:7000";
        const res = await axios.get(`${API_URL}/api/roles/`);
        setRoles(res.data);
      } catch (error) {
        toast.error('Failed to fetch roles');
      } finally {
        setRoleLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // Start editing a role
  const handleEdit = (role) => {
    setEditRoleId(role._id);
    setEditedFeatures(role.features ? [...role.features] : []);
  };

  // Handle feature checkbox change
  const handleFeatureChange = (feature) => {
    setEditedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  // Save updated features for a role
  const handleSave = async (roleId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:7000";
      await axios.put(`${API_URL}/api/roles/${roleId}`, { features: editedFeatures });
      setRoles(roles.map(r => r._id === roleId ? { ...r, features: editedFeatures } : r));
      toast.success('Role features updated!');
      setEditRoleId(null);
      setEditedFeatures([]);
    } catch (error) {
      toast.error('Failed to update role features');
    }
  };

  return (
    <div className="mt-12">
      <ToastContainer />
      <h2 className="text-xl font-bold mb-4">Role Features Management</h2>
      {roleLoading ? (
        <div>Loading roles...</div>
      ) : (
        <div className="space-y-6">
          {roles.map((role) => (
            <div key={role._id} className="border border-gray-300 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="font-semibold text-lg mb-2 md:mb-0 md:w-1/4">{role.name}</div>
              <div className="flex flex-wrap gap-4 md:w-2/4">
                {FEATURE_LIST.map((feature) => (
                  <label key={feature} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editRoleId === role._id ? editedFeatures.includes(feature) : (role.features && role.features.includes(feature))}
                      disabled={editRoleId !== role._id}
                      onChange={() => handleFeatureChange(feature)}
                    />
                    <span>{feature.charAt(0).toUpperCase() + feature.slice(1)}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-4 md:mt-0 md:w-1/4 justify-end">
                {editRoleId === role._id ? (
                  <button
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                    onClick={() => handleSave(role._id)}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="bg-gray-200 text-gray-800 px-4 py-1 rounded hover:bg-gray-300"
                    onClick={() => handleEdit(role)}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleFeatureManagement; 