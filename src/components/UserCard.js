import React, { useState, useEffect } from 'react'
import axios from 'axios';

const UserCard = ({ userid, onClose }) => {
    const [userdetails, setUserdetails] = useState(null);
    const [profileDetails, setProfileDetails] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [roles, setRoles] = useState([]);
    const [showCard, setShowCard] = useState(true);
    const [loading, setLoading] = useState(true);

    // Fetch roles for role name display
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const API_URL = process.env.REACT_APP_API_URL || "http://13.200.200.137:7000";
                const res = await axios.get(`${API_URL}/api/roles`);
                setRoles(res.data);
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };
        fetchRoles();
    }, []);

    const getRoleName = (roleId) => {
        const role = roles.find(r => r._id === roleId);
        return role ? role.name : "User";
    };

    useEffect(() => {
        if (!userid) return;
        
        const fetchUserDetails = async () => {
            try {
                setLoading(true);
                
                // Fetch user information
                const userResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/getalluser`);
                const allUsers = userResponse.data.users || userResponse.data;
                const currentUser = allUsers.find(u => u._id === userid);
                setUserInfo(currentUser);
                
                // Fetch profile details
                try {
                    const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL || "http://13.200.200.137:7000"}/api/profile/${userid}`);
                    setProfileDetails(profileResponse.data);
                } catch (profileError) {
                    console.log('No profile found for user:', userid);
                    setProfileDetails(null);
                }
                
                setUserdetails(currentUser); // Keep for backward compatibility
            } catch (error) {
                console.error('Error fetching user details:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchUserDetails();
    }, [userid]);

    if (!showCard) return null;

    return (
        <div style={{
            maxWidth: '800px',
            margin: '20px auto',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            background: '#fff',
            position: 'relative',
        }}>
            <button
                onClick={() => { setShowCard(false); if (onClose) onClose(); }}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: '#eee',
                    border: 'none',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 18,
                }}
                aria-label="Close"
            >
                ×
            </button>
            <h3 style={{ marginBottom: 18, fontWeight: 600, fontSize: 22, textAlign: 'center' }}>User Profile Details</h3>
            
            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading user details...</div>
            ) : userInfo ? (
                <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                    {userInfo.profilePic ? (
                        <img src={userInfo.profilePic} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
                    ) : (
                        <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: '#888' }}>👤</div>
                    )}
                </div>
                
                {/* User Information Section */}
                <div style={{ marginBottom: 24 }}>
                    <h4 style={{ marginBottom: 12, fontWeight: 600, color: '#333', borderBottom: '2px solid #eee', paddingBottom: 8 }}>User Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div><strong>Name:</strong> {userInfo.name || '-'}</div>
                        <div><strong>Email:</strong> {userInfo.email || '-'}</div>
                        <div><strong>Role:</strong> {getRoleName(userInfo.role)}</div>
                        <div><strong>Organization ID:</strong> {userInfo.orgId || '-'}</div>
                        <div><strong>Email Verified:</strong> {userInfo.emailVerified ? 'Yes' : 'No'}</div>
                        <div><strong>Created:</strong> {userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : '-'}</div>
                    </div>
                </div>

                {/* Profile Details Section */}
                {profileDetails && (
                    <div style={{ marginBottom: 24 }}>
                        <h4 style={{ marginBottom: 12, fontWeight: 600, color: '#333', borderBottom: '2px solid #eee', paddingBottom: 8 }}>Profile Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div><strong>First Name:</strong> {profileDetails.firstName || '-'}</div>
                            <div><strong>Last Name:</strong> {profileDetails.lastName || '-'}</div>
                            <div><strong>Mobile:</strong> {profileDetails.mobile || '-'}</div>
                            <div><strong>Gender:</strong> {profileDetails.gender ? profileDetails.gender.charAt(0).toUpperCase() + profileDetails.gender.slice(1) : '-'}</div>
                            <div><strong>Date of Birth:</strong> {profileDetails.dateOfBirth ? new Date(profileDetails.dateOfBirth).toLocaleDateString() : '-'}</div>
                            <div><strong>Address:</strong> {profileDetails.address || '-'}</div>
                        </div>
                    </div>
                )}

                {/* Features Section */}
                {userInfo.features && userInfo.features.length > 0 && (
                    <div>
                        <h4 style={{ marginBottom: 12, fontWeight: 600, color: '#333', borderBottom: '2px solid #eee', paddingBottom: 8 }}>User Features</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {userInfo.features.map((feature, index) => (
                                <span key={index} style={{
                                    background: '#e3f2fd',
                                    color: '#1976d2',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 500
                                }}>
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {!profileDetails && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic' }}>
                        User has not updated their profile details yet.
                    </div>
                )}
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>User not found</div>
            )}
            
        </div>
    )
}

export default UserCard
