import React, { useContext, useState, useRef, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { logOut } from '../lib/api';

const ProfilePicture = () => {
  const { user, setUser } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await logOut();
      toast.success(res.message);
      setUser(null);
      navigate('/');
    } catch(err){
      toast.error(err.response.data.message)
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Picture */}
      <img
        src={user.profilePicture}
        alt={user.fullName || 'Profile'}
        className="h-10 w-10 rounded-full object-cover cursor-pointer border-2 border-gray-300"
        onClick={() => setOpen(!open)}
      />

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-md overflow-hidden z-50">
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => navigate('/settings')}
          >
            Settings
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
