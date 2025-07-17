import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import bannerImage from "../Assets/Banner.jpg";
import { FaTrash, FaEdit, FaSave, FaUser, FaEye } from 'react-icons/fa';
import { useCallback } from 'react';
import UserCard from '../components/UserCard';
import Select from 'react-select';
import { getAllProjects } from "../services/projectApi";
const api = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL}/api/users/getalluser`, // updated baseURL
});

const NEO_EXPERT_ROLE_ID = "68621581db15fbb9bbd2f836";
const NEO_EXECUTIVE_ROLE_ID = "68621597db15fbb9bbd2f838";
const SUPER_ADMIN_ROLE_ID = "68621581db15fbb9bbd2f839";
const roleOptions = [
  { value: NEO_EXPERT_ROLE_ID, label: 'Neo Expert' },
  { value: NEO_EXECUTIVE_ROLE_ID, label: 'Neo Executive' },
  { value: SUPER_ADMIN_ROLE_ID, label: 'Admin' }
];

const FEATURE_LIST = ["Projects", "Clients", "Templates", "Documents", "Users"];

const UserManage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editRole, setEditRole] = useState({});
  const [roles, setRoles] = useState([]);
  const [roleLoading, setRoleLoading] = useState(true);
  const [viewUserId, setViewUserId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [editProjects, setEditProjects] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch roles and their features
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const API_URL = process.env.REACT_APP_BASE_URL;
        console.log("ur;;;;",API_URL);
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

  // Handle feature toggle
  const handleFeatureToggle = useCallback(async (roleId, feature) => {
    const role = roles.find(r => r._id === roleId);
    if (!role) return;
    const hasFeature = role.features && role.features.includes(feature);
    const updatedFeatures = hasFeature
      ? role.features.filter(f => f !== feature)
      : [...(role.features || []), feature];
    try {
      const API_URL = process.env.REACT_APP_API_URL
      await axios.put(`${API_URL}/api/roles/${roleId}`, { features: updatedFeatures });
      setRoles(roles.map(r => r._id === roleId ? { ...r, features: updatedFeatures } : r));
      toast.success('Role features updated!');
    } catch (error) {
      toast.error('Failed to update role features');
    }
  }, [roles]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/getalluser`);
        console.log("API users response:", res.data);

        // If the response is an array, use it. If it's a single object, wrap it in an array.
        if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else if (res.data && Array.isArray(res.data.users)) {
          setUsers(res.data.users);
        } else if (res.data && typeof res.data === 'object') {
          setUsers([res.data]);
        } else {
          setUsers([]);
        }
      } catch (error) {
        setError(error);
        setUsers([]); // Always fallback to array
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getAllProjects();
        setProjects(data);
        console.log('Projects:', data);
      } catch (err) {
        setProjects([]);
        console.error('Failed to fetch projects', err);
      }
    };
    fetchProjects();
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setEditRole({ ...editRole, [userId]: newRole });
  };

  const handleUpdateUser = async (id) => {
    try {
      const newRole = editRole[id];
      const selectedProjects = 
        editProjects[id] !== undefined
          ? editProjects[id]
          : (users.find(u => u._id === id)?.features || []);
      if (!newRole) return;
      const res = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/users/update-status/${id}`,
        { role: newRole, features: selectedProjects }
      );
      setUsers(users.map(user => user._id === id ? { ...user, role: newRole, features: selectedProjects } : user));
      setEditRole({ ...editRole, [id]: undefined });
      setEditProjects({ ...editProjects, [id]: undefined });
      toast.success('User role and projects updated successfully!');
    } catch (error) {
      setError(error);
      toast.error('Failed to update user role and projects.');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const res = await axios.delete(`${process.env.REACT_APP_BASE_URL}/api/users/delete/${id}`);
      setUsers(users.filter(user => user._id !== id));
      toast.success('User deleted successfully!');
    } catch (error) {
      setError(error);
      toast.error('Failed to delete user.');
    }
  };

  const projectOptions = projects.map(project => ({
    value: project._id,
    label: project.projectName
  }));

  return (
    <>
    <ToastContainer />
    <div>
      
   
    <div className="md:flex md:flex-wrap gap-4 md:mb-4 items-center">
    <div >
    <span className="text-2xl font-bold ml-4">
            Users
          </span>
    </div>
    <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-96 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 ml-4"
      />
   
   
      
  </div>

      {console.log('users data before render:', users)}
      {loading && (
        <div className="overflow-x-auto mt-4 border-2 border-gray-300 rounded-xl p-6">
          <table className="equipment-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Delete</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, idx) => (
                <tr key={idx}>
                  <td><Skeleton width={80} /></td>
                  <td><Skeleton width={180} /></td>
                  <td><Skeleton width={100} /></td>
                  <td><Skeleton width={60} /></td>
                  <td><Skeleton width={60} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
         
        <div className="overflow-x-auto">
          <table className="equipment-table">
      <thead>
              <tr>
                <th><div className='w-30 text-white'>profile</div></th>
                <th>Name</th>
                <th>Email</th>
               
                <th>Role</th>
                <th>Actions</th>
        </tr>
      </thead>
      <tbody>
              {Array.isArray(users) && users
                .filter(u => user && (u._id !== user._id && u._id !== user.id))
                .filter(u => u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((u) => {
                  const canEdit = true;
            return (

              
                    <tr key={u._id}>
                      <td>
                        {u.profilePic ? (
                          <img
                            src={u.profilePic}
                            alt={u.name}
                            style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                          />
                        ) : (
                          <FaUser />
                        )}
                      </td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      
                        {/* {editRole[u._id] !== undefined ? (
                          <Select
                            isMulti
                            options={projectOptions}
                            value={projectOptions.filter(opt =>
                              (editProjects[u._id] || u.features || []).includes(opt.value)
                            )}
                            onChange={selectedOptions => {
                              const selected = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
                              setEditProjects(prev => ({ ...prev, [u._id]: selected }));
                            }}
                            placeholder="Select projects"
                            closeMenuOnSelect={false}
                            styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                          />
                        ) : (
                          <span>
                            {u.features && u.features.length > 0
                              ? projects
                                  .filter(p => u.features.includes(p._id))
                                  .map(p => p.projectName)
                                  .join(', ')
                              : <span style={{ color: '#aaa' }}>Select projects</span>
                            }
                          </span>
                        )} */}
                
                      <td>
                  {editRole[u._id] !== undefined ? (
                    <select
                      value={editRole[u._id]}
                      onChange={e => handleRoleChange(u._id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                            <option value='' disabled>Select new role</option>
                            {roleOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                          u.role === NEO_EXPERT_ROLE_ID ? 'Neo Expert' : u.role === NEO_EXECUTIVE_ROLE_ID ? 'Neo Executive' : u.role === SUPER_ADMIN_ROLE_ID ? 'Admin' : 'Admin'
                  )}
                </td>
                      <td>
                      <button className="view-btn gap-2" title="View" onClick={() => setViewUserId(u._id)}>
                          <FaEye />
                        </button>
                        {canEdit ? (
                          editRole[u._id] !== undefined ? (
                            <button className="save-btn " title="Save" onClick={() => handleUpdateUser(u._id)} disabled={!editRole[u._id]}>
                              <FaSave />
                  </button>
                          ) : (
                            <button className="edit-btn ml-2" title="Edit" onClick={() => setEditRole({ ...editRole, [u._id]: u.role })}>
                              <FaEdit />
                            </button>
                          )
                        ) : (
                          <button className="edit-btn ml-2" disabled><FaEdit /></button>
                        )}
                      
                        <button className="delete-btn" title="Delete" onClick={() => handleDeleteUser(u._id)}>
                          <FaTrash />
                        </button>
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  </div>
        {/* Print all projects after the table */}
       
        {/* UserCard Modal Overlay */}
        {viewUserId && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ position: 'relative' }}>
              <UserCard onClose={() => setViewUserId(null)} />
            </div>
          </div>
        )}
   
    </div>
    </>
  )
}

export default UserManage;
