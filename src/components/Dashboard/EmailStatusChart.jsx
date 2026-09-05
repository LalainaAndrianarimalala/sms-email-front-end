import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FaChartPie } from 'react-icons/fa';
import { emailService } from '../../api/api';
import LoadingSpinner from '../Common/LoadingSpinner';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const EmailStatusChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatusData();
  }, []);

  const fetchStatusData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await emailService.list({
        limit: 1000,
        offset: 0
      });

      const emails = response.data.data || [];

      // Compter les emails par statut
      const statusCounts = {
        sent: 0,
        failed: 0,
        pending: 0,
      };

      emails.forEach(email => {
        if (email.status === 'sent') statusCounts.sent += 1;
        else if (email.status === 'failed') statusCounts.failed += 1;
        else if (email.status === 'pending') statusCounts.pending += 1;
      });

      const total = statusCounts.sent + statusCounts.failed + statusCounts.pending;

      setChartData({
        labels: ['Envoyés', 'Échoués', 'En Attente'],
        datasets: [
          {
            data: [statusCounts.sent, statusCounts.failed, statusCounts.pending],
            backgroundColor: [
              'rgba(16, 185, 129, 0.8)',  // Vert pour sent
              'rgba(239, 68, 68, 0.8)',   // Rouge pour failed
              'rgba(234, 179, 8, 0.8)',   // Jaune pour pending
            ],
            borderColor: [
              'rgb(16, 185, 129)',
              'rgb(239, 68, 68)',
              'rgb(234, 179, 8)',
            ],
            borderWidth: 2,
          },
        ],
      });
    } catch (error) {
      setError('Erreur lors du chargement des statistiques');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: 'Répartition des Emails par Statut',
        font: {
          size: 16,
        },
      },
    },
    cutout: '60%',
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center text-red-500">
        <p>{error}</p>
        <button onClick={fetchStatusData} className="btn-primary mt-4">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
        <FaChartPie className="text-purple-500 mr-2" />
        Répartition des Emails
      </h3>
      {chartData && (
        <div className="max-w-md mx-auto">
          <Doughnut options={options} data={chartData} />
        </div>
      )}
    </div>
  );
};

export default EmailStatusChart;