import React, { useContext } from 'react'
import { UserContext } from '../context/UserContext'

const ProfilePicture = () => {

    const { user } = useContext(UserContext);

  return (
    <div className="relative">
      <img
        src={user.profilePicture}
        alt={user.fullName || "Profile"}
        className="h-10 w-10 rounded-full object-cover cursor-pointer border-2 border-gray-300"
      />
    </div>
  )
}

export default ProfilePicture
