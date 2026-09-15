import React, { useState } from 'react';
import { LucideIcon, Thermometer, Droplets, Wind, Zap, Activity } from 'lucide-react';

interface FaultLabProps {}

const FaultLab: React.FC<FaultLabProps> = () => {
  const [selectedFault, setSelectedFault] = useState<'normal' | 'temp_spike' | 'pressure_spike' | 'humidity_spike' | 'thermo_inconsistent'>('normal');
  const [isInjecting, setIsInjecting] = useState(false);

  const faultOptions = [
    { value: 'normal', label: 'Normal Conditions', icon: Activity },
    { value: 'temp_spike', label: 'Temperature Spike', icon: Thermometer },
    { value: 'pressure_spike', label: 'Pressure Spike', icon: Wind },
    { value: 'humidity_spike', label: 'Humidity Spike', icon: Droplets },
    { value: 'thermo_inconsistent', label: 'Thermo-Inconsistent', icon: Zap },
  ];

  const handleInject = async () => {
    setIsInjecting(true);
    // In a real app, we would send this to the backend or simulate it
    // For now, we just show a message
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsInjecting(false);
    alert(`Fault injected: ${faultOptions.find(o => o.value === selectedFault)?.label}`);
  };

  return (
    <div className="bg-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-sky-300 mb-4">Fault Laboratory</h2>
      <p className="text-sm text-sky-400 mb-4">Simulate sensor faults to test the detection system</p>
      
      <div className="space-y-3">
        {faultOptions.map(option => (
          <label key={option.value} className="flex items-center space-x-3">
            <input
              type="radio"
              value={option.value}
              checked={selectedFault === option.value}
              onChange={(e) => setSelectedFault(e.target.value as any)}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500"
            />
            <div className="flex-1">
              <option.icon className="h-4 w-4 text-sky-400" />
              <span className="text-sm">{option.label}</span>
            </div>
          </label>
        ))}
      </div>
      
      <button
        onClick={handleInject}
        disabled={isInjecting}
        className="w-full mt-6 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isInjecting ? 'Injecting...' : 'Inject Fault'}
      </button>
    </div>
  );
};

export default FaultLab;