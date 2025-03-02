
import React from "react";
import CustomNavbar from "@/components/CustomNavbar";

const ProfileNotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomNavbar />
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
        <p className="mt-2 text-gray-600">The user you're looking for doesn't exist or has been removed.</p>
      </div>
    </div>
  );
};

export default ProfileNotFound;
