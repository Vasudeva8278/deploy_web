import React, { useState, useEffect } from 'react'
import axios from 'axios';

const UserCard = ({ userid, onClose }) => {
    const [userdetails, setUserdetails] = useState(null);
    const [showCard, setShowCard] = useState(true);

    useEffect(() => {
        if (!userid) return;
        const fetchUserDetails = async () => {
            try {
                const userdetailsbyid = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/profile/${userid}`);
                setUserdetails(userdetailsbyid.data);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        }
        fetchUserDetails();
    }, [userid]);

    if (!showCard) return null;

    return (
        <div style={{
            maxWidth: '700px',
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
            <h3 style={{ marginBottom: 18, fontWeight: 600, fontSize: 22, textAlign: 'center' }}>User Profile</h3>
            {userdetails ? (
                <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                    {userdetails.profilePic ? (
                        <img src={userdetails.profilePic} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
                    ) : (
                        <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: '#888' }}>👤</div>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 32 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: 12 }}><strong>First Name:</strong> {userdetails.firstName || '-'}</div>
                        <div style={{ marginBottom: 12 }}><strong>Last Name:</strong> {userdetails.lastName || '-'}</div>
                        <div style={{ marginBottom: 12 }}><strong>Mobile:</strong> {userdetails.mobile || '-'}</div>
                        <div style={{ marginBottom: 12 }}><strong>Gender:</strong> {userdetails.gender ? userdetails.gender.charAt(0).toUpperCase() + userdetails.gender.slice(1) : '-'}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: 12 }}><strong>Date of Birth:</strong> {userdetails.dateOfBirth ? new Date(userdetails.dateOfBirth).toLocaleDateString() : '-'}</div>
                        <div style={{ marginBottom: 12 }}><strong>Address:</strong> {userdetails.address ? `${userdetails.address.street || ''}${userdetails.address.city ? ', ' + userdetails.address.city : ''}${userdetails.address.state ? ', ' + userdetails.address.state : ''}${userdetails.address.postalCode ? ', ' + userdetails.address.postalCode : ''}${userdetails.address.country ? ', ' + userdetails.address.country : ''}` : '-'}</div>
                    </div>
                </div>
                </>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    )
}

export default UserCard
