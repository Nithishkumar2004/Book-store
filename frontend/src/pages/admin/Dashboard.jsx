import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Endpoint from '../../Endpoint/Endpoint';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [counts, setCounts] = useState({
    totalBookCount: 0,
    totalUserCount: 0,
    totalSellerCount: 0,
  });

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Total Counts',
        data: [],
        backgroundColor: [],  // Array for different bar colors
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  });

  // Fetch counts from the backend
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch(`${Endpoint}admin/counts`);
        const result = await response.json();
        
        if (result.success) {
          setCounts({
            totalBookCount: result.totalBookCount,
            totalUserCount: result.totalUserCount,
            totalSellerCount: result.totalSellerCount,
          });

          // Set chart data
          setChartData({
            labels: ['Total Books', 'Total Users', 'Total Sellers'],
            datasets: [
              {
                label: 'Total Counts',
                data: [
                  result.totalBookCount,
                  result.totalUserCount,
                  result.totalSellerCount,
                ],
                backgroundColor: [
                  'rgba(75, 192, 192, 0.6)', // Color for Total Books
                  'rgba(153, 102, 255, 0.6)', // Color for Total Users
                  'rgba(255, 159, 64, 0.6)', // Color for Total Sellers
                ],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
            ],
          });
        } else {
          console.error('Failed to fetch counts');
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 20,   // Width of the box in the legend
          padding: 15,    // Add padding to the labels to separate them
        },
      },
      title: {
        display: true,
        text: 'Total Counts of Books, Users, and Sellers',
      },
    },
    layout: {
      padding: {
        top: 40,   // Add top padding to separate the legend from the chart
      },
    },
    scales: {
      y: {
        ticks: {
          beginAtZero: true,   // Start the y-axis at zero
          stepSize: 1,         // Ensure the ticks are integers
          callback: function(value) { return value % 1 === 0 ? value : ''; },  // Display only integers
        },
      },
    },
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <div>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default Dashboard;
