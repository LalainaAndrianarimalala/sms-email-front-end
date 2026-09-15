import React from 'react';
import {
  FaEnvelope, FaSms, FaCheckCircle, FaTimesCircle, FaClock
} from 'react-icons/fa';

const StatBlock = ({ title, icon: Icon, color, data }) => (
  <div className="bg-white rounded-xl shadow p-4">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <div className={`${color} p-2 rounded-lg text-white`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-800 mb-3">{data?.total || 0}</p>
    <div className="grid grid-cols-3 gap-2 text-center text-xs">
      <div className="bg-green-50 rounded p-1.5">
        <p className="font-semibold text-green-600">{data?.sent || 0}</p>
        <p className="text-gray-500">Envoyés</p>
      </div>
      <div className="bg-red-50 rounded p-1.5">
        <p className="font-semibold text-red-600">{data?.failed || 0}</p>
        <p className="text-gray-500">Échoués</p>
      </div>
      <div className="bg-yellow-50 rounded p-1.5">
        <p className="font-semibold text-yellow-600">{data?.pending || 0}</p>
        <p className="text-gray-500">Attente</p>
      </div>
    </div>
  </div>
);

const ContactStatsCards = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatBlock
        title="Emails envoyés"
        icon={FaEnvelope}
        color="bg-blue-500"
        data={stats.email}
      />
      <StatBlock
        title="SMS envoyés"
        icon={FaSms}
        color="bg-green-500"
        data={stats.sms}
      />
    </div>
  );
};

export default ContactStatsCards;