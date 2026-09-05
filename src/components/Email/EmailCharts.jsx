import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { FaChartBar, FaChartLine, FaChartPie, FaCalendarAlt, FaEnvelope } from 'react-icons/fa';
import { emailService } from '../../api/api';
import LoadingSpinner from '../Common/LoadingSpinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const EmailCharts = () => {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [statusData, setStatusData] = useState(null);

  useEffect(() => {
    fetchChartData();
  }, [period]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date().toISOString().split('T')[0];
      let startDate;
      const d = new Date();

      switch (period) {
        case 'day':
          d.setDate(d.getDate() - 30);
          break;
        case 'month':
          d.setMonth(d.getMonth() - 12);
          break;
        case 'year':
          d.setFullYear(d.getFullYear() - 5);
          break;
        default:
          d.setMonth(d.getMonth() - 12);
      }
      startDate = d.toISOString().split('T')[0];

      // Récupérer les emails
      const response = await emailService.list({
        limit: 1000,
        offset: 0
      });

      const emails = response.data.data || [];

      // Grouper par période
      const groupedData = groupEmailsByPeriod(emails, period);

      // Statistiques par statut
      const statusCounts = {
        sent: emails.filter(e => e.status === 'sent').length,
        failed: emails.filter(e => e.status === 'failed').length,
        pending: emails.filter(e => e.status === 'pending').length,
      };

      setChartData({
        labels: Object.keys(groupedData),
        total: Object.values(groupedData).map(d => d.total),
        sent: Object.values(groupedData).map(d => d.sent),
        failed: Object.values(groupedData).map(d => d.failed),
        pending: Object.values(groupedData).map(d => d.pending),
      });

      setStatusData(statusCounts);

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
        grouped[key] = { total: 0, sent: 0, failed: 0, pending: 0 };
      }

      grouped[key].total += 1;
      if (email.status === 'sent') grouped[key].sent += 1;
      else if (email.status === 'failed') grouped[key].failed += 1;
      else if (email.status === 'pending') grouped[key].pending += 1;
    });

    return grouped;
  };

  const periodLabels = {
    day: 'Jour',
    month: 'Mois',
    year: 'Année'
  };

  const colors = {
    blue: 'rgba(59, 130, 246, 0.8)',
    blueBorder: 'rgb(59, 130, 246)',
    green: 'rgba(16, 185, 129, 0.8)',
    greenBorder: 'rgb(16, 185, 129)',
    red: 'rgba(239, 68, 68, 0.8)',
    redBorder: 'rgb(239, 68, 68)',
    yellow: 'rgba(234, 179, 8, 0.8)',
    yellowBorder: 'rgb(234, 179, 8)',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
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

  // Graphique en barres
  const barChartData = {
    labels: chartData?.labels || [],
    datasets: [
      {
        label: '✅ Envoyés',
        data: chartData?.sent || [],
        backgroundColor: colors.green,
        borderColor: colors.greenBorder,
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: '❌ Échoués',
        data: chartData?.failed || [],
        backgroundColor: colors.red,
        borderColor: colors.redBorder,
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: '⏳ En attente',
        data: chartData?.pending || [],
        backgroundColor: colors.yellow,
        borderColor: colors.yellowBorder,
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: `Évolution des Emails par ${periodLabels[period]}`,
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  // Graphique en ligne
  const lineChartData = {
    labels: chartData?.labels || [],
    datasets: [
      {
        label: '✅ Succès',
        data: chartData?.sent || [],
        borderColor: colors.greenBorder,
        backgroundColor: colors.green,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: colors.greenBorder,
      },
      {
        label: '❌ Échecs',
        data: chartData?.failed || [],
        borderColor: colors.redBorder,
        backgroundColor: colors.red,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: colors.redBorder,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: `Tendance des Emails par ${periodLabels[period]}`,
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  // Graphique en camembert
  const pieData = {
    labels: ['✅ Envoyés', '❌ Échoués', '⏳ En attente'],
    datasets: [
      {
        data: [statusData?.sent || 0, statusData?.failed || 0, statusData?.pending || 0],
        backgroundColor: [colors.green, colors.red, colors.yellow],
        borderColor: ['#fff', '#fff', '#fff'],
        borderWidth: 3,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 13 },
        },
      },
      title: {
        display: true,
        text: 'Répartition des Emails',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 },
      },
    },
    cutout: '50%',
  };

  return (
    <div className="space-y-6">
      {/* Filtre de période */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FaEnvelope className="text-blue-500 mr-2" />
          Statistiques Email
        </h2>
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

      {/* Grille des graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution */}
        <div className="card">
          <div className="h-72">
            <Bar options={barOptions} data={barChartData} />
          </div>
        </div>

        {/* Tendance */}
        <div className="card">
          <div className="h-72">
            <Line options={lineOptions} data={lineChartData} />
          </div>
        </div>

        {/* Répartition */}
        <div className="card lg:col-span-2">
          <div className="h-64 max-w-md mx-auto">
            <Doughnut options={pieOptions} data={pieData} />
          </div>
        </div>
      </div>

      {/* Résumé des statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {(statusData?.sent || 0) + (statusData?.failed || 0) + (statusData?.pending || 0)}
          </p>
          <p className="text-sm text-gray-500">Total Emails</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{statusData?.sent || 0}</p>
          <p className="text-sm text-gray-500">Envoyés</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{statusData?.failed || 0}</p>
          <p className="text-sm text-gray-500">Échoués</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{statusData?.pending || 0}</p>
          <p className="text-sm text-gray-500">En attente</p>
        </div>
      </div>
    </div>
  );
};

export default EmailCharts;