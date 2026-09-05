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
import { FaCalendarWeek } from 'react-icons/fa';
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

const WeekdayChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeekdayData();
  }, []);

  const fetchWeekdayData = async () => {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await statsService.getWeekdayStats({
        startDate,
        endDate,
      });

      if (response.data.success) {
        const data = response.data.data;
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
        text: 'SMS par jour de la semaine',
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
        <button onClick={fetchWeekdayData} className="btn-primary mt-4">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-6">
        <FaCalendarWeek className="text-purple-500 mr-2" />
        Répartition par jour de semaine
      </h3>
      {chartData && <Bar options={options} data={chartData} />}
    </div>
  );
};

export default WeekdayChart;