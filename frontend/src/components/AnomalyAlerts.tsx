import React from 'react';

interface AnomalyAlertsProps {
  anomalies: Array<{
    is_anomaly: boolean;
    anomaly_score: number;
    fault_type: string | null;
    confidence: number;
    explanation: string;
    corrected_values: {
      temperature: number;
      pressure: number;
      humidity: number;
    } | null;
  }>;
}

const AnomalyAlerts: React.FC<AnomalyAlertsProps> = ({ anomalies }) => {
  const getAlertClass = (faultType: string | null): string => {
    if (!faultType) return 'border-sky-500';
    if (faultType.includes('SPIKE')) return 'border-red-500';
    if (faultType.includes('DRIFT')) return 'border-yellow-500';
    if (faultType.includes('FROZEN')) return 'border-blue-500';
    if (faultType.includes('THERMODYNAMIC')) return 'border-purple-500';
    return 'border-sky-500';
  };

  const getFaultIcon = (faultType: string | null): React.ReactNode => {
    if (!faultType) return null;
    if (faultType.includes('TEMPERATURE')) return <span className="text-red-400">🌡️</span>;
    if (faultType.includes('PRESSURE')) return <span className="text-green-400">💨</span>;
    if (faultType.includes('HUMIDITY')) return <span className="text-blue-400">💧</span>;
    if (faultType.includes('FROZEN')) return <span className="text-indigo-400">❄️</span>;
    if (faultType.includes('THERMODYNAMIC')) return <span className="text-purple-400">⚗️</span>;
    return <span className="text-sky-400">⚠️</span>;
  };

  return (
    <div className="bg-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-sky-300 mb-4">Anomaly Alerts</h2>
      {anomalies.length === 0 ? (
        <p className="text-center text-sky-400 py-8">No anomalies detected</p>
      ) : (
        <div className="space-y-4">
          {anomalies.map((anomaly, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-l-4 ${getAlertClass(anomaly.fault_type)} bg-slate-600/50`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-sky-300 flex items-center">
                  {getFaultIcon(anomaly.fault_type)}
                  <span className="ml-2">{anomaly.fault_type || 'Anomaly Detected'}</span>
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full 
                  ${anomaly.confidence > 0.8 ? 'bg-red-500/20 text-red-400' : 
                    anomaly.confidence > 0.6 ? 'bg-yellow-500/20 text-yellow-400' : 
                    'bg-sky-500/20 text-sky-400'}`}>
                  {Math.round(anomaly.confidence * 100)}% Confidence
                </span>
              </div>
              <p className="text-sm text-sky-400 mb-2">{anomaly.explanation}</p>
              {anomaly.corrected_values && (
                <div className="text-xs text-sky-300 border-t pt-2">
                  <strong>Suggested Correction:</strong><br/>
                  Temp: {anomaly.corrected_values.temperature.toFixed(1)}°C, 
                  Pressure: {anomaly.corrected_values.pressure.toFixed(1)} hPa, 
                  Humidity: {anomaly.corrected_values.humidity.toFixed(1)}%
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnomalyAlerts;