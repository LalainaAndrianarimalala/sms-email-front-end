import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FaChartBar, FaCalendarAlt } from 'react-icons/fa';
import { statsService } from '../../api/api';
import LoadingSpinner from '../Common/LoadingSpinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SmsChart = () => {
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

      const response = await statsService.getFullStats({
        period,
        startDate,
        endDate,
      });

      if (response.data.success) {
        const data = response.data.chartData;
        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: 'Total SMS',
              data: data.total,
              backgroundColor: 'rgba(59, 130, 246, 0.6)',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 1,
            },
            {
              label: 'SMS Envoyés',
              data: data.outgoing,
              backgroundColor: 'rgba(16, 185, 129, 0.6)',
              borderColor: 'rgb(16, 185, 129)',
              borderWidth: 1,
            },
            {
              label: 'SMS Reçus',
              data: data.incoming,
              backgroundColor: 'rgba(139, 92, 246, 0.6)',
              borderColor: 'rgb(139, 92, 246)',
              borderWidth: 1,
            },
          ],
        });
      }
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
        position: 'top',
      },
      title: {
        display: true,
        text: `Statistiques des SMS par ${period === 'day' ? 'jour' : period === 'month' ? 'mois' : 'année'}`,
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
          <FaChartBar className="text-blue-500 mr-2" />
          Évolution des SMS
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
      {chartData && <Bar options={options} data={chartData} />}
    </div>
  );
};

export default SmsChart;