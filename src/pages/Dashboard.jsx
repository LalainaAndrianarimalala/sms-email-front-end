import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaSms, FaInbox, FaHistory, FaArrowRight } from 'react-icons/fa';
import Layout from '../components/Layout/Layout';
import { emailService, smsService } from '../api/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState({
    emails: 0,
    sms: 0,
    smsInbox: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [emailRes, smsRes, inboxRes] = await Promise.all([
        emailService.list({ limit: 1 }),
        smsService.history({ limit: 1 }),
        smsService.inbox(),
      ]);

      setStats({
        emails: emailRes.data.data?.length || 0,
        sms: smsRes.data.messages?.length || 0,
        smsInbox: inboxRes.data.messages?.length || 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Emails',
      count: stats.emails,
      icon: FaEnvelope,
      color: 'blue',
      link: '/emails',
      description: 'Historique des emails',
    },
    {
      title: 'SMS',
      count: stats.sms,
      icon: FaSms,
      color: 'green',
      link: '/sms',
      description: 'Historique des SMS',
    },
    {
      title: 'Boîte de réception',
      count: stats.smsInbox,
      icon: FaInbox,
      color: 'indigo',
      link: '/sms/inbox',
      description: 'SMS reçus',
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble des communications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            const colorClasses = {
              blue: 'bg-blue-500',
              green: 'bg-green-500',
              indigo: 'bg-indigo-500',
            };

            return (
              <div key={card.title} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{card.count}</p>
                    <p className="text-xs text-gray-400 mt-2">{card.description}</p>
                  </div>
                  <div className={`${colorClasses[card.color]} p-3 rounded-lg text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <Link
                  to={card.link}
                  className="inline-flex items-center mt-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  Voir plus
                  <FaArrowRight className="ml-1 w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaEnvelope className="text-blue-500 mr-2" />
              Actions rapides - Email
            </h3>
            <div className="mt-4 space-y-3">
              <Link
                to="/emails/send"
                className="block w-full text-center btn-primary"
              >
                Envoyer un email
              </Link>
              <Link
                to="/emails"
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voir l'historique
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaSms className="text-green-500 mr-2" />
              Actions rapides - SMS
            </h3>
            <div className="mt-4 space-y-3">
              <Link
                to="/sms/send"
                className="block w-full text-center btn-success"
              >
                Envoyer un SMS
              </Link>
              <Link
                to="/sms"
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voir l'historique
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;