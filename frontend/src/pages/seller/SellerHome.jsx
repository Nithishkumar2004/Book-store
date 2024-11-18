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
import { useAuth } from '../../context/AuthContext';
import Endpoint from '../../Endpoint/Endpoint';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SellerHome = () => {
  const { authToken } = useAuth(); // Assuming authToken is used for authentication
  const [counts, setCounts] = useState({
    sellerBookCount: 0,
    sellerUserCount: 0,
    sellerOrderCount: 0,
  });

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Current Seller Counts',
        data: [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // Color for Seller's Books
          'rgba(153, 102, 255, 0.6)', // Color for Seller's Users
          'rgba(54, 162, 235, 0.6)', // Color for Seller's Orders
        ],
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  });

  // Fetch seller-specific counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch(`${Endpoint}seller/counts`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`, // Include authToken for authentication
          },
        });
        const result = await response.json();

        if (result.success) {
          setCounts({
            sellerBookCount: result.sellerBookCount,
            sellerUserCount: result.sellerUserCount,
            sellerOrderCount: result.sellerOrderCount,
          });

          // Set chart data
          setChartData({
            labels: ['Books', 'Users', 'Orders'], // Labels for the seller data
            datasets: [
              {
                label: 'Current Seller Counts',
                data: [
                  result.sellerBookCount,
                  result.sellerUserCount,
                  result.sellerOrderCount,
                ],
                backgroundColor: [
                  'rgba(75, 192, 192, 0.6)', // Seller's Books
                  'rgba(153, 102, 255, 0.6)', // Seller's Users
                  'rgba(54, 162, 235, 0.6)', // Seller's Orders
                ],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
            ],
          });
        } else {
          console.error('Failed to fetch seller counts');
        }
      } catch (error) {
        console.error('Error fetching seller counts:', error);
      }
    };

    fetchCounts();
  }, [authToken]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 20,
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'Seller Dashboard - Books, Users, and Orders',
      },
    },
    layout: {
      padding: {
        top: 40,
      },
    },
    scales: {
      y: {
        ticks: {
          beginAtZero: true,
          stepSize: 1,
          callback: function(value) {
            return value % 1 === 0 ? value : '';
          },
        },
      },
    },
  };

  return (
    <div>
      <div>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default SellerHome;
