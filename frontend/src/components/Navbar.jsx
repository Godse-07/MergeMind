import React, { useContext } from "react";
import { Link, useNavigate } from "react-router";
import { UserContext } from "../context/UserContext";
import ProfilePicture from "./ProfilePicture";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  return (
    <div
      className="fixed top-0 left-0 w-full h-20 
      bg-white/70 backdrop-blur-md border-b border-gray-200
      flex items-center justify-around z-50 shadow-sm transition-all duration-300"
    >
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img src="/PR_icon.png" alt="logo" className="h-12 w-12" />
        <p className="font-bold text-xl text-gray-800">MergeMind</p>
      </div>

      <div className="flex items-center gap-16 text-gray-700 font-medium">
        <Link
          to="/dashboard"
          className="hover:text-blue-500 transition cursor-pointer"
        >
          Dashboard
        </Link>
        <p className="hover:text-blue-600 transition cursor-pointer">
          Features
        </p>
        <p className="hover:text-blue-600 transition cursor-pointer">Docs</p>
      </div>

      {user ? (
        <ProfilePicture profilePicture={user.profilePicture} />
      ) : (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={() => navigate("/login")}
        >
          Get Started
        </button>
      )}
    </div>
  );
};

export default Navbar;
