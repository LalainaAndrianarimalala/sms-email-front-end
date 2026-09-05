import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import StatsCards from '../components/Dashboard/StatsCards';
import SmsChart from '../components/Dashboard/SmsChart';
import WeekdayChart from '../components/Dashboard/WeekdayChart';
import { statsService } from '../api/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await statsService.getFullStats({
        period: 'month',
        startDate,
        endDate,
      });

      if (response.data.success) {
        const data = response.data.chartData;
        const total = data.total.reduce((a, b) => a + b, 0);
        const outgoing = data.outgoing.reduce((a, b) => a + b, 0);
        const incoming = data.incoming.reduce((a, b) => a + b, 0);
        const sent = data.sent.reduce((a, b) => a + b, 0);

        setStats({
          totalMessages: total,
          totalOutgoing: outgoing,
          totalIncoming: incoming,
          totalSent: sent,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble des communications SMS</p>
        </div>

        <StatsCards stats={stats} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SmsChart />
          <WeekdayChart />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;