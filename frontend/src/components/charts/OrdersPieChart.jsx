import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const OrdersPieChart = ({ data }) => {
  const chartData = {
    labels: Object.keys(data).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: [
          '#3B82F6', // pending - blue
          '#3B82F6', // processing - blue
          '#10B981', // ready - green
          '#10B981', // completed - green
          '#EF4444'  // cancelled - red
        ],
        borderWidth: 2,
        borderColor: '#fff',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return <Pie data={chartData} options={options} />;
};

export default OrdersPieChart;
