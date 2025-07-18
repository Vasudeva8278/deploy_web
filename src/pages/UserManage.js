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

  const getRoleName = (roleId) => {
    const role = roles.find(r => r._id === roleId);
    return role ? role.name : "User";
  };

  // Check if current user is Super Admin
  const isSuperAdmin = () => {
    const superAdminRole = roles.find(r => r.name.toLowerCase().includes('super admin') || r.name.toLowerCase().includes('superadmin'));
    return user && superAdminRole && user.role === superAdminRole._id;
  };

  // Check if current user is Admin
  const isAdmin = () => {
    const adminRole = roles.find(r => r.name.toLowerCase() === 'admin');
    return user && adminRole && user.role === adminRole._id;
  };

  // Check if a user is Super Admin
  const isUserSuperAdmin = (userRoleId) => {
    const superAdminRole = roles.find(r => r.name.toLowerCase().includes('super admin') || r.name.toLowerCase().includes('superadmin'));
    return superAdminRole && userRoleId === superAdminRole._id;
  };

  // Check if a user is Admin
  const isUserAdmin = (userRoleId) => {
    const adminRole = roles.find(r => r.name.toLowerCase() === 'admin');
    return adminRole && userRoleId === adminRole._id;
  };

  // Check if current user can manage a specific user
  const canManageUser = (targetUser) => {
    if (!user || !targetUser) return false;
    
    // Super Admin can manage all users
    if (isSuperAdmin()) return true;
    
    // Admin can manage all users except Super Admin users
    if (isAdmin()) {
      return !isUserSuperAdmin(targetUser.role);
    }
    
    return false;
  };

  // Fetch roles and their features
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://13.200.200.137:7000";
        console.log("API URL for roles:", API_URL);
        const res = await axios.get(`${API_URL}/api/roles`);
        console.log("Fetched roles:", res.data);
        setRoles(res.data);
        
        // Print each role and validate
        res.data.forEach(role => {
          console.log(`Role ID: ${role._id}, Name: ${role.name}, Valid: ${!!role._id && !!role.name}`);
        });
      } catch (error) {
        console.error("Error fetching roles:", error);
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
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
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
          <div className="text-sm text-gray-600 ml-4">
            Current User: {user?.name} ({getRoleName(user?.role)})
            {isSuperAdmin() && <span className="text-blue-600 ml-2">- Can manage all users</span>}
            {isAdmin() && <span className="text-green-600 ml-2">- Can manage all users except Super Admin</span>}
          </div>
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
      {console.log('current user role:', user?.role)}
      {console.log('isSuperAdmin:', isSuperAdmin())}
      {console.log('isAdmin:', isAdmin())}
      {console.log('available roles:', roles)}
      {console.log('users after filtering:', users.filter(u => {
        if (isAdmin() && isUserSuperAdmin(u.role)) {
          console.log('Hiding Super Admin user:', u.name, 'from Admin view');
          return false;
        }
        if (isAdmin()) {
          console.log('Admin can see user:', u.name, 'Role:', getRoleName(u.role));
          return !isUserSuperAdmin(u.role);
        }
        return canManageUser(u);
      }))}
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
                .filter(u => user && (u._id !== user._id && u._id !== user.id)) // Exclude current user
                .filter(u => u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) // Search filter
                .filter(u => {
                  // If current user is Admin, completely hide Super Admin users
                  if (isAdmin() && isUserSuperAdmin(u.role)) {
                    console.log('Admin user - Hiding Super Admin:', u.name);
                    return false; // Hide Super Admin users from Admin
                  }
                  // Admin users can see: Regular users + Other Admin users
                  if (isAdmin()) {
                    const canSee = !isUserSuperAdmin(u.role);
                    console.log('Admin user - Can see user:', u.name, 'Role:', getRoleName(u.role), 'Can see:', canSee);
                    return canSee;
                  }
                  // Otherwise, use the normal permission check
                  return canManageUser(u);
                }) // Permission filter - only show users current user can manage
                .map((u) => {
                  const canEdit = canManageUser(u);
                  
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
                      <td>
                        {editRole[u._id] !== undefined ? (
                          <select
                            value={editRole[u._id]}
                            onChange={e => handleRoleChange(u._id, e.target.value)}
                            className="border rounded px-2 py-1"
                          >
                            <option value='' disabled>Select new role</option>
                            {roles.map(option => (
                              <option key={option._id} value={option._id}>{option.name}</option>
                            ))}
                          </select>
                        ) : (
                          getRoleName(u.role)
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
                          <button className="edit-btn ml-2" disabled title="No permission to edit">
                            <FaEdit />
                          </button>
                        )}
                        <button 
                          className="delete-btn" 
                          title="Delete" 
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={!canEdit}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
      </tbody>
    </table>
    
    {/* Show message when no users are visible due to permissions */}
    {!loading && Array.isArray(users) && users.filter(u => {
      // If current user is Admin, completely hide Super Admin users
      if (isAdmin() && isUserSuperAdmin(u.role)) {
        return false; // Hide Super Admin users from Admin
      }
      // Otherwise, use the normal permission check
      return canManageUser(u);
    }).length === 0 && (
      <div className="text-center py-8 text-gray-500">
        <p>No users available to manage with your current permissions.</p>
        {isAdmin() && (
          <p className="text-sm mt-2">As an Admin, you can see and manage all users except Super Admin users.</p>
        )}
      </div>
    )}
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
