import React from 'react';

interface StationHealthProps {
  health: {
    score: number;
    status: string;
  };
}

const StationHealth: React.FC<StationHealthProps> = ({ health }) => {
  const getStatusColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-slate-700 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-sky-300">Station Health</h2>
        <div className={`text-2xl font-bold ${getStatusColor(health.score)}`}>
          {health.score}
        </div>
      </div>
      <p className="text-sm text-sky-400 mb-2">Overall Station Status</p>
      <p className="text-lg font-medium text-white capitalize">{health.status}</p>
      <div className="mt-4 h-2 w-full bg-slate-600 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600" 
          style={{ width: `${health.score}%` }}
        ></div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-sky-400">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default StationHealth;