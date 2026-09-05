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
import { FaChartBar, FaChartLine, FaChartPie, FaCalendarAlt, FaSms } from 'react-icons/fa';
import { statsService } from '../../api/api';
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

const SmsCharts = () => {
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [weekdayData, setWeekdayData] = useState(null);

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

      // Récupérer les statistiques
      const [statsResponse, weekdayResponse] = await Promise.all([
        statsService.getFullStats({ period, startDate, endDate }),
        statsService.getWeekdayStats({ startDate, endDate })
      ]);

      if (statsResponse.data.success) {
        const data = statsResponse.data.chartData;
        setChartData({
          labels: data.labels,
          total: data.total,
          outgoing: data.outgoing,
          incoming: data.incoming,
          sent: data.sent,
          failed: data.failed
        });
      }

      if (weekdayResponse.data.success) {
        setWeekdayData(weekdayResponse.data.data);
      }

    } catch (error) {
      setError('Erreur lors du chargement des statistiques');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const periodLabels = {
    day: 'Jour',
    month: 'Mois',
    year: 'Année'
  };

  // Configuration des couleurs
  const colors = {
    blue: 'rgba(59, 130, 246, 0.8)',
    blueBorder: 'rgb(59, 130, 246)',
    green: 'rgba(16, 185, 129, 0.8)',
    greenBorder: 'rgb(16, 185, 129)',
    purple: 'rgba(139, 92, 246, 0.8)',
    purpleBorder: 'rgb(139, 92, 246)',
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

  // Graphique en barres - Évolution des SMS
  const barChartData = {
    labels: chartData?.labels || [],
    datasets: [
      {
        label: '📤 Envoyés',
        data: chartData?.outgoing || [],
        backgroundColor: colors.blue,
        borderColor: colors.blueBorder,
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: '📥 Reçus',
        data: chartData?.incoming || [],
        backgroundColor: colors.green,
        borderColor: colors.greenBorder,
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
        text: `Évolution des SMS par ${periodLabels[period]}`,
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

  // Graphique en ligne - Tendance
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
        text: `Tendance des SMS par ${periodLabels[period]}`,
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

  // Graphique en camembert - Répartition
  const totalSent = chartData?.sent?.reduce((a, b) => a + b, 0) || 0;
  const totalFailed = chartData?.failed?.reduce((a, b) => a + b, 0) || 0;
  const totalIncoming = chartData?.incoming?.reduce((a, b) => a + b, 0) || 0;

  const pieChartData = {
    labels: ['📤 Envoyés', '📥 Reçus', '❌ Échoués'],
    datasets: [
      {
        data: [totalSent, totalIncoming, totalFailed],
        backgroundColor: [colors.blue, colors.green, colors.red],
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
        text: 'Répartition des SMS',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 },
      },
    },
    cutout: '50%',
  };

  // Graphique par jour de semaine
  const weekdayChartData = {
    labels: weekdayData?.labels || ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'SMS',
        data: weekdayData?.total || [],
        backgroundColor: ['#3B82F6', '#60A5FA', '#93C5FD', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
        borderColor: '#3B82F6',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const weekdayOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'SMS par jour de semaine',
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

  return (
    <div className="space-y-6">
      {/* Filtre de période */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FaSms className="text-green-500 mr-2" />
          Statistiques SMS
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
        <div className="card">
          <div className="h-72">
            <Doughnut options={pieOptions} data={pieChartData} />
          </div>
        </div>

        {/* Par jour de semaine */}
        <div className="card">
          <div className="h-72">
            <Bar options={weekdayOptions} data={weekdayChartData} />
          </div>
        </div>
      </div>

      {/* Résumé des statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalSent + totalIncoming}</p>
          <p className="text-sm text-gray-500">Total SMS</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalSent}</p>
          <p className="text-sm text-gray-500">Envoyés</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{totalIncoming}</p>
          <p className="text-sm text-gray-500">Reçus</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{totalFailed}</p>
          <p className="text-sm text-gray-500">Échoués</p>
        </div>
      </div>
    </div>
  );
};

export default SmsCharts;