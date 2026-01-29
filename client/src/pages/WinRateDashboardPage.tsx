// =============================================================================
// WIN RATE DASHBOARD PAGE
// Analytics and metrics for proposal submissions and win rates
// =============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, TrendingUp, TrendingDown, Target, DollarSign, FileText, Award, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface WinRateStats {
  totalProposals: number;
  submitted: number;
  won: number;
  lost: number;
  inProgress: number;
  withdrawn: number;
  decidedProposals: number;
  winRate: number;
  totalValue: number;
  wonValue: number;
  avgWinProbability: number;
}

interface TrendData {
  month: string;
  total: number;
  won: number;
  lost: number;
  submitted: number;
  winRate: number;
}

interface AgencyData {
  agency: string;
  total: number;
  won: number;
  lost: number;
  winRate: number;
  totalValue: number;
}

interface RecentDecision {
  id: string;
  title: string;
  solicitationNumber: string;
  agencyName: string;
  status: string;
  estimatedValue: number | null;
  winProbability: number | null;
  dueDate: string | null;
  updatedAt: string;
}

export default function WinRateDashboardPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [stats, setStats] = useState<WinRateStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [byAgency, setByAgency] = useState<AgencyData[]>([]);
  const [recentDecisions, setRecentDecisions] = useState<RecentDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.access_token) {
      loadDashboardData();
    }
  }, [session]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [statsRes, trendsRes, agencyRes, decisionsRes] = await Promise.all([
        fetch('http://localhost:3001/api/win-rate/stats', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` },
        }),
        fetch('http://localhost:3001/api/win-rate/trends?months=6', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` },
        }),
        fetch('http://localhost:3001/api/win-rate/by-agency', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` },
        }),
        fetch('http://localhost:3001/api/win-rate/recent-decisions?limit=10', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` },
        }),
      ]);

      if (!statsRes.ok || !trendsRes.ok || !agencyRes.ok || !decisionsRes.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const [statsData, trendsData, agencyData, decisionsData] = await Promise.all([
        statsRes.json(),
        trendsRes.json(),
        agencyRes.json(),
        decisionsRes.json(),
      ]);

      setStats(statsData.data);
      setTrends(trendsData.data);
      setByAgency(agencyData.data);
      setRecentDecisions(decisionsData.data);
    } catch (error) {
      console.error('Load dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <Award size={16} className="text-green-600" />;
      case 'lost':
        return <XCircle size={16} className="text-red-600" />;
      case 'submitted':
        return <Clock size={16} className="text-blue-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Unable to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Win Rate Dashboard</h1>
        <p className="text-gray-600">Track your proposal performance and success metrics</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Win Rate */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Win Rate</span>
            <Target className="text-green-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.winRate}%</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.won} wins / {stats.decidedProposals} decided
          </p>
        </div>

        {/* Total Proposals */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Proposals</span>
            <FileText className="text-blue-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalProposals}</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.inProgress} in progress
          </p>
        </div>

        {/* Won Value */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Won Value</span>
            <DollarSign className="text-emerald-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.wonValue)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            of {formatCurrency(stats.totalValue)} total
          </p>
        </div>

        {/* Avg Win Probability */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Avg Win Probability</span>
            <TrendingUp className="text-purple-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.avgWinProbability}%</div>
          <p className="text-xs text-gray-500 mt-1">AI-predicted success rate</p>
        </div>
      </div>

      {/* Win Rate Trend */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Win Rate Trend (Last 6 Months)</h2>

        {trends.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No trend data available yet</p>
        ) : (
          <div className="space-y-2">
            {trends.map((trend, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600 font-medium">
                  {formatMonth(trend.month)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      {trend.won > 0 && (
                        <div
                          className="absolute left-0 top-0 h-full bg-green-500 flex items-center justify-end pr-2"
                          style={{ width: `${(trend.won / trend.total) * 100}%` }}
                        >
                          <span className="text-xs font-semibold text-white">{trend.won}</span>
                        </div>
                      )}
                      {trend.lost > 0 && (
                        <div
                          className="absolute top-0 h-full bg-red-400 flex items-center justify-end pr-2"
                          style={{
                            left: `${(trend.won / trend.total) * 100}%`,
                            width: `${(trend.lost / trend.total) * 100}%`,
                          }}
                        >
                          <span className="text-xs font-semibold text-white">{trend.lost}</span>
                        </div>
                      )}
                    </div>
                    <div className="w-20 text-sm font-semibold text-gray-900 text-right">
                      {trend.winRate}%
                    </div>
                  </div>
                </div>
                <div className="w-24 text-sm text-gray-500 text-right">
                  {trend.total} total
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Win Rate by Agency */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance by Agency (Top 10)</h2>

        {byAgency.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No agency data available yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agency</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Won</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lost</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Win Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {byAgency.map((agency, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{agency.agency}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">{agency.total}</td>
                    <td className="px-6 py-4 text-sm text-green-600 text-center font-semibold">{agency.won}</td>
                    <td className="px-6 py-4 text-sm text-red-600 text-center font-semibold">{agency.lost}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        agency.winRate >= 50 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {agency.winRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(agency.totalValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Decisions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Proposal Decisions</h2>

        {recentDecisions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No proposal decisions yet</p>
            <button
              onClick={() => navigate('/proposals')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Proposal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentDecisions.map((decision) => (
              <div
                key={decision.id}
                onClick={() => navigate(`/proposals/${decision.id}`)}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(decision.status)}
                      <h3 className="font-semibold text-gray-900">{decision.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {decision.solicitationNumber && (
                        <span>#{decision.solicitationNumber}</span>
                      )}
                      {decision.agencyName && (
                        <span>{decision.agencyName}</span>
                      )}
                      {decision.estimatedValue && (
                        <span>{formatCurrency(decision.estimatedValue)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(decision.status)}`}>
                      {decision.status.toUpperCase()}
                    </span>
                    {decision.winProbability && (
                      <span className="text-xs text-gray-500">
                        {decision.winProbability}% win probability
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
