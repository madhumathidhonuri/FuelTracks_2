import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import DateRangePicker from '../../components/common/DateRangePicker';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  RadarController,
  LineController,
  BarController,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  RadarController,
  LineController,
  BarController,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const Statistics = () => {
  const { isDarkMode } = useTheme();

  const isDark = isDarkMode;
  const textColor = isDark ? 'rgba(226,241,247,0.6)' : 'rgba(26,58,74,0.5)';
  const gridColor = isDark ? 'rgba(61,122,138,0.18)' : 'rgba(61,122,138,0.08)';
  const radarGridColor = isDark ? 'rgba(61,122,138,0.22)' : 'rgba(61,122,138,0.12)';
  const pointLabelColor = isDark ? 'rgba(226,241,247,0.7)' : 'rgba(26,58,74,0.7)';
  const tooltipBg = isDark ? 'rgba(13,30,38,0.95)' : 'rgba(26,58,74,0.88)';

  const sharedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.85)',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      }
    }
  };

  const axisCfg = {
    ticks: { color: textColor, font: { size: 10, family: 'Inter' } },
    grid: { color: gridColor, drawBorder: false },
    border: { display: false }
  };

  const getGradient = (ctx, chartArea, colorStart, colorEnd) => {
    if (!chartArea) return null;
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  };

  // FUEL CHART
  const fuelData = {
    labels: ['Jun 1', 'Jun 5', 'Jun 10', 'Jun 15', 'Jun 20', 'Jun 25', 'Jun 30'],
    datasets: [{
      data: [4200, 4050, 4400, 4180, 4350, 4100, 4280],
      borderColor: 'rgba(29,100,120,0.9)',
      borderWidth: 2.5,
      pointBackgroundColor: 'rgba(29,100,120,1)',
      pointRadius: 4,
      tension: 0.5,
      fill: true,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        return getGradient(
          ctx, chartArea,
          isDark ? 'rgba(61,122,138,0.2)' : 'rgba(61,122,138,0.35)',
          isDark ? 'rgba(61,122,138,0.01)' : 'rgba(61,122,138,0.02)'
        );
      }
    }]
  };
  const fuelOptions = {
    ...sharedOptions,
    scales: { x: axisCfg, y: axisCfg }
  };

  // UTILIZATION CHART
  const utilizationData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [210, 225, 218, 230, 222, 180, 140],
      backgroundColor: isDark ? 'rgba(61,122,138,0.4)' : 'rgba(61,122,138,0.25)',
      borderColor: 'rgba(29,100,120,0.6)',
      borderWidth: 1.5,
      borderRadius: 8,
      borderSkipped: false
    }]
  };
  const utilizationOptions = {
    ...sharedOptions,
    scales: { x: { ...axisCfg, grid: { display: false } }, y: axisCfg }
  };

  // DRIVER CHART
  const driverData = {
    labels: ['Safety', 'Fuel Eff.', 'Speed', 'Timing', 'Distance'],
    datasets: [
      {
        label: 'Top Driver',
        data: [92, 88, 85, 94, 90],
        backgroundColor: isDark ? 'rgba(52,216,181,0.2)' : 'rgba(52,216,181,0.12)',
        borderColor: 'rgba(52,216,181,0.8)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(52,216,181,1)',
        pointRadius: 4
      },
      {
        label: 'Fleet Avg',
        data: [78, 74, 80, 82, 76],
        backgroundColor: isDark ? 'rgba(61,122,138,0.1)' : 'rgba(61,122,138,0.06)',
        borderColor: 'rgba(61,122,138,0.4)',
        borderWidth: 1.5,
        pointBackgroundColor: 'rgba(61,122,138,0.6)',
        pointRadius: 3
      }
    ]
  };
  const driverOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: isDark ? 'rgba(226,241,247,0.7)' : 'rgba(26,58,74,0.7)',
          font: { size: 10, family: 'Inter' }
        }
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.85)',
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      r: {
        grid: { color: radarGridColor },
        angleLines: { color: radarGridColor },
        ticks: { display: false },
        pointLabels: { color: pointLabelColor, font: { size: 10, family: 'Inter' } }
      }
    }
  };

  // DISTANCE CHART
  const distanceDataObj = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [128, 122, 135, 138, 140, 142],
      borderColor: 'rgba(29,100,120,0.9)',
      borderWidth: 2.5,
      pointBackgroundColor: 'rgba(29,100,120,1)',
      pointRadius: 4,
      tension: 0.5,
      fill: true,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        return getGradient(
          ctx, chartArea,
          isDark ? 'rgba(61,122,138,0.2)' : 'rgba(61,122,138,0.35)',
          isDark ? 'rgba(61,122,138,0.01)' : 'rgba(61,122,138,0.02)'
        );
      }
    }]
  };
  const distanceOptions = {
    ...sharedOptions,
    scales: { x: axisCfg, y: axisCfg }
  };

  return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      {/* ── Header row ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-[20px] font-bold text-text-primary">Fleet Statistics</h2>
        <DateRangePicker onChange={() => {}} />
      </div>

      {/* ── KPI GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Distance" value="5,420 km" icon={() => <i className="fa-solid fa-map"></i>} trend="+12% this week" trendDirection="up" />
        <StatCard title="Total Trips" value="186" icon={() => <i className="fa-solid fa-route"></i>} subtitle="This month" />
        <StatCard title="Avg Trip Length" value="29 km" icon={() => <i className="fa-solid fa-road"></i>} trend="-2% from last month" trendDirection="down" />
        <StatCard title="Total Fuel" value="1,420 L" icon={() => <i className="fa-solid fa-gas-pump"></i>} trend="+8% this week" trendDirection="up" />
      </div>

      {/* ── ANALYTICS CHARTS 2x2 ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <Card className="rounded-[22px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-text-primary">
              <i className="fa-solid fa-chart-area text-text-tertiary"></i> Fuel Consumption Trend
            </div>
            <div className="text-[11px] cursor-pointer hover:underline text-text-secondary">This Month ▾</div>
          </div>
          <div className="relative h-[250px]">
            <Line data={fuelData} options={fuelOptions} />
          </div>
        </Card>

        <Card className="rounded-[22px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-text-primary">
              <i className="fa-solid fa-chart-bar text-text-tertiary"></i> Fleet Utilization
            </div>
            <div className="text-[11px] cursor-pointer hover:underline text-text-secondary">Weekly ▾</div>
          </div>
          <div className="relative h-[250px]">
            <Bar data={utilizationData} options={utilizationOptions} />
          </div>
        </Card>

        <Card className="rounded-[22px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-text-primary">
              <i className="fa-solid fa-user-check text-text-tertiary"></i> Driver Performance
            </div>
            <div className="text-[11px] cursor-pointer hover:underline text-text-secondary">View All ▾</div>
          </div>
          <div className="relative h-[250px]">
            <Radar data={driverData} options={driverOptions} />
          </div>
        </Card>

        <Card className="rounded-[22px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-text-primary">
              <i className="fa-solid fa-chart-line text-text-tertiary"></i> Monthly Distance
            </div>
            <div className="text-[11px] cursor-pointer hover:underline text-text-secondary">6 Months ▾</div>
          </div>
          <div className="relative h-[250px]">
            <Line data={distanceDataObj} options={distanceOptions} />
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Statistics;
