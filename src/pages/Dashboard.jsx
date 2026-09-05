import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaEnvelope, 
  FaSms, 
  FaInbox, 
  FaArrowRight,
  FaChartLine,
  FaPaperPlane,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from 'react-icons/fa';
import Layout from '../components/Layout/Layout';
import { statsService, emailService } from '../api/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Dashboard = () => {
  const [smsStats, setSmsStats] = useState(null);
  const [emailStats, setEmailStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      
      // Statistiques SMS
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const smsResponse = await statsService.getFullStats({
        period: 'month',
        startDate,
        endDate,
      });

      if (smsResponse.data.success) {
        const data = smsResponse.data.chartData;
        const total = data.total.reduce((a, b) => a + b, 0);
        const outgoing = data.outgoing.reduce((a, b) => a + b, 0);
        const incoming = data.incoming.reduce((a, b) => a + b, 0);
        const sent = data.sent.reduce((a, b) => a + b, 0);
        const failed = data.failed.reduce((a, b) => a + b, 0);

        setSmsStats({
          total,
          outgoing,
          incoming,
          sent,
          failed,
          successRate: total > 0 ? Math.round((sent / (sent + failed)) * 100) : 0
        });
      }

      // Statistiques Email
      const emailResponse = await emailService.list({
        limit: 1000,
        offset: 0
      });

      const emails = emailResponse.data.data || [];
      const totalEmails = emails.length;
      const totalSent = emails.filter(e => e.status === 'sent').length;
      const totalFailed = emails.filter(e => e.status === 'failed').length;
      const totalPending = emails.filter(e => e.status === 'pending').length;

      setEmailStats({
        total: totalEmails,
        sent: totalSent,
        failed: totalFailed,
        pending: totalPending,
        successRate: totalEmails > 0 ? Math.round((totalSent / totalEmails) * 100) : 0
      });

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

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
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de vos communications</p>
        </div>

        {/* Statistiques SMS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center">
              <span className="bg-green-500 w-3 h-3 rounded-full mr-2"></span>
              Statistiques SMS
            </h2>
            <Link to="/sms" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              Voir tout <FaArrowRight className="ml-1 w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-800">{smsStats?.total || 0}</p>
                </div>
                <div className="bg-green-500 p-3 rounded-lg text-white">
                  <FaSms className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Envoyés</p>
                  <p className="text-2xl font-bold text-gray-800">{smsStats?.outgoing || 0}</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-lg text-white">
                  <FaPaperPlane className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Reçus</p>
                  <p className="text-2xl font-bold text-gray-800">{smsStats?.incoming || 0}</p>
                </div>
                <div className="bg-purple-500 p-3 rounded-lg text-white">
                  <FaInbox className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Taux de succès</p>
                  <p className="text-2xl font-bold text-gray-800">{smsStats?.successRate || 0}%</p>
                </div>
                <div className="bg-orange-500 p-3 rounded-lg text-white">
                  <FaChartLine className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Échoués</p>
                  <p className="text-2xl font-bold text-gray-800">{smsStats?.failed || 0}</p>
                </div>
                <div className="bg-red-500 p-3 rounded-lg text-white">
                  <FaTimesCircle className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques Email */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center">
              <span className="bg-blue-500 w-3 h-3 rounded-full mr-2"></span>
              Statistiques Email
            </h2>
            <Link to="/emails" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              Voir tout <FaArrowRight className="ml-1 w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-800">{emailStats?.total || 0}</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-lg text-white">
                  <FaEnvelope className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Envoyés</p>
                  <p className="text-2xl font-bold text-gray-800">{emailStats?.sent || 0}</p>
                </div>
                <div className="bg-green-500 p-3 rounded-lg text-white">
                  <FaCheckCircle className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Échoués</p>
                  <p className="text-2xl font-bold text-gray-800">{emailStats?.failed || 0}</p>
                </div>
                <div className="bg-red-500 p-3 rounded-lg text-white">
                  <FaTimesCircle className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Taux de succès</p>
                  <p className="text-2xl font-bold text-gray-800">{emailStats?.successRate || 0}%</p>
                </div>
                <div className="bg-orange-500 p-3 rounded-lg text-white">
                  <FaChartLine className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">En attente</p>
                  <p className="text-2xl font-bold text-gray-800">{emailStats?.pending || 0}</p>
                </div>
                <div className="bg-yellow-500 p-3 rounded-lg text-white">
                  <FaClock className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaEnvelope className="text-blue-500 mr-2" />
              Actions rapides - Email
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link to="/emails/send" className="btn-primary text-center">
                ✉️ Nouvel email
              </Link>
              <Link to="/emails" className="px-4 py-2 border border-gray-300 rounded-lg text-center hover:bg-gray-50 transition-colors text-gray-700">
                📋 Historique
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaSms className="text-green-500 mr-2" />
              Actions rapides - SMS
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link to="/sms/send" className="btn-success text-center">
                💬 Nouveau SMS
              </Link>
              <Link to="/sms" className="px-4 py-2 border border-gray-300 rounded-lg text-center hover:bg-gray-50 transition-colors text-gray-700">
                📋 Historique
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;