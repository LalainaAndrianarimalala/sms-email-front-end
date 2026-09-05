import React from 'react';
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaClock, FaChartLine } from 'react-icons/fa';

const EmailStatsCards = ({ stats, loading }) => {
  const cards = [
    {
      title: 'Total Emails',
      value: stats?.totalEmails || 0,
      icon: FaEnvelope,
      color: 'bg-blue-500',
    },
    {
      title: 'Emails Envoyés',
      value: stats?.totalSent || 0,
      icon: FaCheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Emails Échoués',
      value: stats?.totalFailed || 0,
      icon: FaTimesCircle,
      color: 'bg-red-500',
    },
    {
      title: 'En Attente',
      value: stats?.totalPending || 0,
      icon: FaClock,
      color: 'bg-yellow-500',
    },
    {
      title: "Taux d'échec",
      value: stats?.totalEmails ? Math.round((stats.totalFailed / stats.totalEmails) * 100) : 0,
      icon: FaChartLine,
      color: 'bg-orange-500',
      suffix: '%',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {card.value}{card.suffix || ''}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EmailStatsCards;