import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SensorChartsProps {
  data: Array<{
    temperature: number;
    pressure: number;
    humidity: number;
    timestamp: string;
  }>;
  isDetecting: boolean;
}

const SensorCharts: React.FC<SensorChartsProps> = ({ data, isDetecting }) => {
  // Format timestamp to HH:MM:SS
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const chartData = data.map((d) => ({
    ...d,
    time: formatTime(d.timestamp),
  }));

  return (
    <div className="bg-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-sky-300 mb-4">Live Sensor Data</h2>
      <div className="relative">
        {isDetecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full border-4 border-t-sky-400 h-12 w-12"></div>
          </div>
        )}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: any) => `${value}`} 
              labelFormatter={(value: any) => `${value}`} 
            />
            <Legend verticalAlign="top" height={36} />
            <Line type="monotone" dataKey="temperature" stroke="#ef4444" name="Temperature (°C)" />
            <Line type="monotone" dataKey="pressure" stroke="#10b981" name="Pressure (hPa)" />
            <Line type="monotone" dataKey="humidity" stroke="#3b82f6" name="Humidity (%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SensorCharts;