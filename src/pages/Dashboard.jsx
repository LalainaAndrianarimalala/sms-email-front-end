import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import StatsCards from '../components/Dashboard/StatsCards';
import EmailStatsCards from '../components/Dashboard/EmailStatsCards';
import SmsChart from '../components/Dashboard/SmsChart';
import EmailChart from '../components/Dashboard/EmailChart';
import EmailLineChart from '../components/Dashboard/EmailLineChart';
import WeekdayChart from '../components/Dashboard/WeekdayChart';
import EmailStatusChart from '../components/Dashboard/EmailStatusChart';
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

        setSmsStats({
          totalMessages: total,
          totalOutgoing: outgoing,
          totalIncoming: incoming,
          totalSent: sent,
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
        totalEmails,
        totalSent,
        totalFailed,
        totalPending,
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
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble des communications</p>
        </div>

        {/* Statistiques SMS */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="bg-green-500 w-3 h-3 rounded-full mr-2"></span>
            Statistiques SMS
          </h2>
          <StatsCards stats={smsStats} loading={loading} />
        </div>

        {/* Statistiques Email */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="bg-blue-500 w-3 h-3 rounded-full mr-2"></span>
            Statistiques Email
          </h2>
          <EmailStatsCards stats={emailStats} loading={loading} />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SmsChart />
          <EmailChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmailLineChart />
          <WeekdayChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmailStatusChart />
          {/* Vous pouvez ajouter d'autres graphiques ici */}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;