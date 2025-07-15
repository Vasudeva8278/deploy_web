import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import bannerImage from "../Assets/Banner.jpg";
import { FaTrash, FaEdit, FaSave, FaUserCircle, FaEye } from 'react-icons/fa';
import { useCallback } from 'react';
import photo from '../Assets/general_profile.png';
import UserCard from '../components/UserCard';


const api = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL}/api/users/getalluser`, // updated baseURL
});

const NEO_EXPERT_ROLE_ID = "68621581db15fbb9bbd2f836";
const NEO_EXECUTIVE_ROLE_ID = "68621597db15fbb9bbd2f838";
const SUPER_ADMIN_ROLE_ID = "685f9b7d3d988647b344e5ca";
const NEO_ORGANIZATION_ID = "6870a1c2f0884e1560f8dadf";

const roleOptions = [
  { value: NEO_EXPERT_ROLE_ID, label: 'Neo Expert' },
  { value: NEO_EXECUTIVE_ROLE_ID, label: 'Neo Executive' },
  { value: SUPER_ADMIN_ROLE_ID, label: 'Admin' },
  { value: NEO_ORGANIZATION_ID, label: 'Neo Organization' } 
];

const FEATURE_LIST = ["Projects", "Clients", "Templates", "Documents", "Users"];

const UserManage = () => {
  const [search, setSearch] = useState('');
const [roleFilter, setRoleFilter] = useState('All');
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(5);
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editRole, setEditRole] = useState({});
  const [roles, setRoles] = useState([]);
  const [roleLoading, setRoleLoading] = useState(true);
  const [viewUserId, setViewUserId] = useState(null);

  // Fetch roles and their features
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesRes = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/roles/`);
        setRoles(rolesRes.data);
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
      await axios.put(`${process.env.REACT_APP_BASE_URL}/api/roles/${roleId}`, { features: updatedFeatures });
      setRoles(roles.map(r => r._id === roleId ? { ...r, features: updatedFeatures } : r));
      toast.success('Role features updated!');
    } catch (error) {
      toast.error('Failed to update role features');
    }
  }, [roles]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const profilesRes = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/getalluser`);
        console.log('profilesRes.data:', profilesRes.data);
        // Use the array of users from the backend
        if (profilesRes.data && Array.isArray(profilesRes.data.users)) {
          setUsers(profilesRes.data.users);
        } else {
          setUsers([]);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setEditRole({ ...editRole, [userId]: newRole });
  };

  const handleUpdateUser = async (id) => {
    try {
      const newRole = editRole[id];
      if (!newRole) return;
      const updateRes = await axios.put(`${process.env.REACT_APP_BASE_URL}/api/users/update-status/${id}`, { role: newRole });
      setUsers(users.map(user => user._id === id ? { ...user, role: newRole } : user));
      setEditRole({ ...editRole, [id]: undefined });
      toast.success('User role updated successfully!');
    } catch (error) {
      setError(error);
      toast.error('Failed to update user role.');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const deleteRes = await axios.delete(`${process.env.REACT_APP_BASE_URL}/api/users/delete/${id}`);
      setUsers(users.filter(user => user._id !== id));
      toast.success('User deleted successfully!');
    } catch (error) {
      setError(error);
      toast.error('Failed to delete user.');
    }
  };


  

  // Filtering logic
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      (u.name?.toLowerCase().includes(search.toLowerCase()) ||
       u.email?.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
    <ToastContainer />
    {viewUserId && (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <UserCard userid={viewUserId} onClose={() => setViewUserId(null)} />
      </div>
    )}
    <div>
      
      

      {loading && (
        <div className="overflow-x-auto mt-4 border-2 border-gray-300 rounded-xl p-4">
          <table className="equipment-table">
            <thead>
              <tr>
             
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
                  <td><Skeleton circle width={40} height={40} /></td>
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
    
        <div className="w-full p-5 mt-8">
  <div className="flex flex-wrap gap-4 mb-4 items-center">
    <div>
      <span className="font-semibold text-lg">User Management</span>
    </div>
    <input
      className="border rounded-lg px-3 py-2"
      placeholder={`Search: ${users.length} records...`}
      value={search}
      onChange={e => { setSearch(e.target.value); setPage(1); }}
    />
   
      
  </div>
  <div className="bg-white rounded-xl shadow overflow-x-auto">
    <table className="min-w-full">
      <thead>
        <tr className="border-b">
          <th className="py-3 px-4 text-left">Name</th>
          <th className="py-3 px-4 text-left">Email</th>
          <th className="py-3 px-4 text-left">Role</th>
         
          <th className="py-3 px-4 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {paginatedUsers
          .filter(u =>
            u._id !== user?._id &&
            u._id !== user?.id &&
            u.email !== user?.email &&
            u.role !== NEO_ORGANIZATION_ID
          )
          .map(u => {
            const isCurrentUser = u._id === user?._id || u._id === user?.id || u.email === user?.email;
            const isAdmin = u.role === SUPER_ADMIN_ROLE_ID;
            const isOrgUser = user.role === NEO_ORGANIZATION_ID;
            const canEditDeleteAdmin = isAdmin && isOrgUser;
            const canEditDelete = !isCurrentUser && (!isAdmin || canEditDeleteAdmin);
            return (
              <tr key={u._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 flex items-center gap-3">
                  <img src={u.profilePic || photo} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div>
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                </td>
                <td className="py-3 px-4">{u.email}</td>
                <td className="py-3 px-4">
                  {editRole[u._id] !== undefined ? (
                    <select
                      value={editRole[u._id]}
                      onChange={e => handleRoleChange(u._id, e.target.value)}
                      className="border rounded px-2 py-1"
                      disabled={isCurrentUser || (isAdmin && !isOrgUser)}
                    >
                    {roleOptions
                      .filter(option => option.label !== 'Neo Organization')
                      .map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    roleOptions.find(option => option.value === u.role)?.label || u.role || 'User'
                  )}
                </td>
                <td className="py-3 px-4 flex gap-2">
                  <button onClick={() => setViewUserId(u._id)} title="View" className="text-blue-600 hover:text-blue-800">
                    <FaEye size={18} />
                  </button>
                  {(!canEditDelete || editRole[u._id] !== undefined && isCurrentUser) ? (
                    <FaEdit
                      className="text-gray-400 cursor-not-allowed"
                      title={isCurrentUser ? "Edit (locked for yourself)" : "Edit (locked)"}
                      disabled
                    />
                  ) : editRole[u._id] !== undefined ? (
                    <FaSave
                      className="text-green-600 cursor-pointer"
                      title="Save"
                      onClick={() => handleUpdateUser(u._id)}
                    />
                  ) : (
                    <FaEdit
                      className="text-gray-600 cursor-pointer"
                      title="Edit"
                      onClick={() => handleRoleChange(u._id, u.role)}
                    />
                  )}
                  {(!canEditDelete) ? (
                    <FaTrash
                      className="text-gray-400 cursor-not-allowed"
                      title={isCurrentUser ? "Delete (locked for yourself)" : "Delete (locked)"}
                      disabled
                    />
                  ) : (
                    <FaTrash
                      className="text-red-600 cursor-pointer"
                      title="Delete"
                      onClick={() => handleDeleteUser(u._id)}
                    />
                  )}
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  </div>
  {/* Pagination controls */}
  <div className="flex justify-between items-center mt-4">
    <div>
      Page {page} of {totalPages}
    </div>
    <div className="flex items-center gap-2">
      <span>Show</span>
      <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1">
        {[5, 10, 20].map(size => <option key={size} value={size}>{size}</option>)}
      </select>
      <button onClick={() => setPage(p => Math.max(1, p - 1))}>&lt;</button>
      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}>&gt;</button>
    </div>
  </div>
</div>
       
   
    </div>
    </>
  )
}

export default UserManage;
