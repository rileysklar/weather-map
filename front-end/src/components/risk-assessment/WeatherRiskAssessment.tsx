import React from 'react';
import { AlertTriangle, Wind, Droplets } from 'lucide-react';
import { WeatherAlert } from '@/services/weather';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

interface WeatherRiskAssessmentProps {
  alerts: WeatherAlert[];
  precipitationProbability: number;
  windSpeed: string;
}

interface RiskLevel {
  level: 'Extreme' | 'High' | 'Moderate' | 'Low' | 'Minimal';
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue';
}

interface RiskScoreDisplayProps {
  score: number;
  level: RiskLevel;
  riskFactors: {
    name: string;
    value: number;
    fullMark: number;
  }[];
}

interface ContributingFactorsProps {
  alerts: WeatherAlert[];
  precipitationProbability: number;
  windSpeed: string;
}

const calculateRiskScore = (
  alerts: WeatherAlert[],
  precipitationProbability: number,
  windSpeed: string
): { score: number; factors: { name: string; value: number; fullMark: number; }[] } => {
  let score = 0;
  let alertScore = 0;
  let precipScore = 0;
  let windScore = 0;
  
  // Calculate alert score
  alerts.forEach(alert => {
    switch (alert.type) {
      case 'Warning':
        alertScore += 30;
        break;
      case 'Watch':
        alertScore += 20;
        break;
      case 'Advisory':
        alertScore += 10;
        break;
      case 'Statement':
        alertScore += 5;
        break;
    }
  });

  // Calculate precipitation score
  if (precipitationProbability > 80) precipScore = 100;
  else if (precipitationProbability > 60) precipScore = 75;
  else if (precipitationProbability > 40) precipScore = 50;
  else if (precipitationProbability > 20) precipScore = 25;
  else precipScore = 10;

  // Calculate wind score
  const windSpeedNum = parseInt(windSpeed);
  if (windSpeedNum > 30) windScore = 100;
  else if (windSpeedNum > 20) windScore = 75;
  else if (windSpeedNum > 10) windScore = 50;
  else if (windSpeedNum > 5) windScore = 25;
  else windScore = 10;

  // Calculate total score
  score = Math.min((alertScore + precipScore + windScore) / 3, 100);

  return {
    score,
    factors: [
      { name: 'Weather Alerts', value: alertScore, fullMark: 100 },
      { name: 'Precipitation', value: precipScore, fullMark: 100 },
      { name: 'Wind Speed', value: windScore, fullMark: 100 },
    ]
  };
};

const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 80) return { level: 'Extreme', color: 'red' };
  if (score >= 60) return { level: 'High', color: 'orange' };
  if (score >= 40) return { level: 'Moderate', color: 'yellow' };
  if (score >= 20) return { level: 'Low', color: 'green' };
  return { level: 'Minimal', color: 'blue' };
};

const RiskScoreDisplay: React.FC<RiskScoreDisplayProps> = ({ score, level, riskFactors }) => (
  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
      <AlertTriangle className="h-5 w-5 text-yellow-400" />
      Overall Risk Assessment
    </h3>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-white/60">Risk Level</span>
        <span className={`px-3 py-1 rounded-full text-sm ${
          level.color === 'red' ? 'bg-red-500/20 text-red-400' :
          level.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
          level.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
          level.color === 'green' ? 'bg-green-500/20 text-green-400' :
          'bg-blue-500/20 text-blue-400'
        }`}>
          {level.level}
        </span>
      </div>
      
      {/* Risk Score Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Risk Score</span>
          <span>{score.toFixed(1)}/100</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              level.color === 'red' ? 'bg-red-500' :
              level.color === 'orange' ? 'bg-orange-500' :
              level.color === 'yellow' ? 'bg-yellow-500' :
              level.color === 'green' ? 'bg-green-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Risk Factors Radar Chart */}
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskFactors}>
            <PolarGrid stroke="rgba(255,255,255,0.2)" />
            <PolarAngleAxis 
              dataKey="name" 
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            />
            <Radar
              name="Risk Factors"
              dataKey="value"
              stroke={
                level.color === 'red' ? '#ef4444' :
                level.color === 'orange' ? '#f97316' :
                level.color === 'yellow' ? '#eab308' :
                level.color === 'green' ? '#22c55e' :
                '#3b82f6'
              }
              fill={
                level.color === 'red' ? 'rgba(239,68,68,0.2)' :
                level.color === 'orange' ? 'rgba(249,115,22,0.2)' :
                level.color === 'yellow' ? 'rgba(234,179,8,0.2)' :
                level.color === 'green' ? 'rgba(34,197,94,0.2)' :
                'rgba(59,130,246,0.2)'
              }
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const ContributingFactors: React.FC<ContributingFactorsProps> = ({
  alerts,
  precipitationProbability,
  windSpeed
}) => (
  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
    <h3 className="text-lg font-medium mb-3">Contributing Factors</h3>
    <div className="space-y-3">
      {/* Active Alerts */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <span>Active Alerts</span>
        </div>
        <span className="text-white/60">{alerts.length} active</span>
      </div>

      {/* Precipitation Risk */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-cyan-400" />
          <span>Precipitation Risk</span>
        </div>
        <span className="text-white/60">{precipitationProbability}% chance</span>
      </div>

      {/* Wind Risk */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-blue-400" />
          <span>Wind Risk</span>
        </div>
        <span className="text-white/60">{windSpeed}</span>
      </div>
    </div>
  </div>
);

export const WeatherRiskAssessment: React.FC<WeatherRiskAssessmentProps> = ({
  alerts,
  precipitationProbability,
  windSpeed
}) => {
  const { score, factors } = calculateRiskScore(alerts, precipitationProbability, windSpeed);
  const riskLevel = getRiskLevel(score);

  return (
    <div className="space-y-4">
      <RiskScoreDisplay 
        score={score} 
        level={riskLevel}
        riskFactors={factors}
      />
      <ContributingFactors
        alerts={alerts}
        precipitationProbability={precipitationProbability}
        windSpeed={windSpeed}
      />
    </div>
  );
}; 