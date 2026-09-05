import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import { emailService } from '../../api/api';
import LoadingSpinner from '../Common/LoadingSpinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EmailLineChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChartData();
  }, [period]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await emailService.list({
        limit: 1000,
        offset: 0
      });

      const emails = response.data.data || [];

      // Grouper les emails par période
      const groupedData = groupEmailsByPeriod(emails, period);

      const labels = Object.keys(groupedData);
      const sent = labels.map(label => groupedData[label].sent);
      const failed = labels.map(label => groupedData[label].failed);
      const pending = labels.map(label => groupedData[label].pending);

      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Envoyés',
            data: sent,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: 'rgb(16, 185, 129)',
          },
          {
            label: 'Échoués',
            data: failed,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: 'rgb(239, 68, 68)',
          },
          {
            label: 'En Attente',
            data: pending,
            borderColor: 'rgb(234, 179, 8)',
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: 'rgb(234, 179, 8)',
          },
        ],
      });
    } catch (error) {
      setError('Erreur lors du chargement des statistiques des emails');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const groupEmailsByPeriod = (emails, period) => {
    const grouped = {};

    emails.forEach(email => {
      const date = new Date(email.createdAt);
      let key;

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'month':
          key = date.toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = { sent: 0, failed: 0, pending: 0 };
      }

      if (email.status === 'sent') grouped[key].sent += 1;
      else if (email.status === 'failed') grouped[key].failed += 1;
      else if (email.status === 'pending') grouped[key].pending += 1;
    });

    return grouped;
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Tendance des Emails par ${period === 'day' ? 'jour' : period === 'month' ? 'mois' : 'année'}`,
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const periodLabels = {
    day: 'Jour',
    month: 'Mois',
    year: 'Année',
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
        <button onClick={fetchChartData} className="btn-primary mt-4">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaChartLine className="text-blue-500 mr-2" />
          Tendance des Emails
        </h3>
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="text-gray-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input-field w-auto py-1 px-3 text-sm"
          >
            <option value="day">Par jour</option>
            <option value="month">Par mois</option>
            <option value="year">Par année</option>
          </select>
        </div>
      </div>
      {chartData && <Line options={options} data={chartData} />}
    </div>
  );
};

export default EmailLineChart;