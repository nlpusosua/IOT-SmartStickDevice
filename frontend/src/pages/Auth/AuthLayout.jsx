import React from 'react';
import { MapPin } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex justify-center items-center gap-3 mb-6">
        <MapPin size={40} className="text-blue-600" />
        <span className="text-3xl font-bold text-gray-800">Smart Cane</span>
      </div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{title}</h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        {subtitle}
      </p>
    </div>

    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;