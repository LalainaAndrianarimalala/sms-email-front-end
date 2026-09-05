import React from 'react';
import { FaEnvelope, FaSms, FaInbox, FaChartLine, FaPaperPlane } from 'react-icons/fa'; // ← Ajouter FaPaperPlane

const StatsCards = ({ stats, loading }) => {
  const cards = [
    {
      title: 'Total SMS',
      value: stats?.totalMessages || 0,
      icon: FaSms,
      color: 'bg-green-500',
    },
    {
      title: 'SMS Envoyés',
      value: stats?.totalOutgoing || 0,
      icon: FaPaperPlane, // ← Maintenant FaPaperPlane est défini
      color: 'bg-blue-500',
    },
    {
      title: 'SMS Reçus',
      value: stats?.totalIncoming || 0,
      icon: FaInbox,
      color: 'bg-purple-500',
    },
    {
      title: 'Taux de succès',
      value: stats?.totalMessages ? Math.round((stats.totalSent / stats.totalMessages) * 100) : 0,
      icon: FaChartLine,
      color: 'bg-orange-500',
      suffix: '%',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

export default StatsCards;