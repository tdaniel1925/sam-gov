// =============================================================================
// DASHBOARD PAGE
// Following CodeBakers pattern 04-frontend.md + 09-design.md
// Main app dashboard with user info and subscription status
// =============================================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { opportunityAPI } from '../lib/api';

interface Opportunity {
  id: string;
  noticeId: string;
  title: string;
  department?: string;
  naicsCode?: string;
  postedDate?: string;
  responseDeadLine?: string;
  type?: string;
  uiLink?: string;
  discoveredAt: string;
}

interface OpportunityScore {
  score: number;
  reasoning: string;
  matchFactors: {
    naicsMatch: boolean;
    certificationMatch: boolean;
    sizeMatch: boolean;
    capabilityMatch: boolean;
  };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile, subscription, teams, signOut, loading } = useAuth();

  const [newOpportunities, setNewOpportunities] = useState<Opportunity[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);
  const [scores, setScores] = useState<Map<string, OpportunityScore>>(new Map());

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Fetch new opportunities on component mount
  useEffect(() => {
    if (!loading && user) {
      fetchNewOpportunities();
    }
  }, [loading, user]);

  const fetchNewOpportunities = async () => {
    setLoadingOpportunities(true);
    setOpportunitiesError(null);
    try {
      const response = await opportunityAPI.getNewToday();
      const opps = response.data.data || [];
      setNewOpportunities(opps);

      // Fetch scores for all opportunities
      if (opps.length > 0) {
        fetchScores(opps);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : null;
      setOpportunitiesError(errorMessage || 'Failed to load new opportunities');
    } finally {
      setLoadingOpportunities(false);
    }
  };

  const fetchScores = async (opportunities: Opportunity[]) => {
    const newScores = new Map<string, OpportunityScore>();

    for (const opp of opportunities.slice(0, 5)) {
      try {
        const response = await opportunityAPI.score(opp);
        newScores.set(opp.id, response.data.score);
      } catch (error) {
        // Silently fail for individual scores
      }
    }

    setScores(newScores);
  };

  const getScoreBadgeColor = (score: number): string => {
    if (score >= 75) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading your dashboard...</div>
      </div>
    );
  }

  const subscriptionStatus = subscription?.status || 'none';
  const subscriptionPlan = subscription?.plan || 'Free';
  const currentTeam = teams.length > 0 ? teams[0] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SAM.gov Opportunities Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome, {profile?.fullName || user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/search"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Search
              </Link>
              <Link
                to="/saved"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Saved
              </Link>
              <Link
                to="/profile"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Profile
              </Link>
              <Link
                to="/subscription"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Subscription
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Status Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Subscription</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Plan:</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize">
                    {subscriptionPlan}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${
                    subscriptionStatus === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {subscriptionStatus}
                  </span>
                </div>
                {currentTeam && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Team:</span>
                    <span className="text-sm text-gray-900">{currentTeam.teamName}</span>
                    <span className="text-xs text-gray-500">({currentTeam.role})</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {subscriptionStatus !== 'active' ? (
                <Link
                  to="/subscription"
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Subscribe Now
                </Link>
              ) : (
                <Link
                  to="/subscription"
                  className="px-6 py-2 bg-white text-blue-600 text-sm font-medium border-2 border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Manage Subscription
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saved Opportunities</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loadingOpportunities ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    newOpportunities.length
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Email Alerts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* New Today Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">New Opportunities Today</h2>
              <p className="text-sm text-gray-600">
                Automatically discovered opportunities matching your profile
              </p>
            </div>
            <button
              onClick={fetchNewOpportunities}
              disabled={loadingOpportunities}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingOpportunities ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Loading State */}
          {loadingOpportunities && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {opportunitiesError && !loadingOpportunities && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error Loading Opportunities</h3>
                  <p className="text-sm text-red-700 mt-1">{opportunitiesError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loadingOpportunities && !opportunitiesError && newOpportunities.length === 0 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No new opportunities today</h3>
              <p className="text-sm text-gray-600">
                Check back later for new matches, or{' '}
                <Link to="/search" className="text-blue-600 hover:text-blue-700 font-medium">
                  search manually
                </Link>
              </p>
            </div>
          )}

          {/* Opportunities List */}
          {!loadingOpportunities && !opportunitiesError && newOpportunities.length > 0 && (
            <div className="space-y-4">
              {newOpportunities.slice(0, 5).map((opportunity) => {
                const score = scores.get(opportunity.id);
                return (
                  <div
                    key={opportunity.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <h3 className="font-medium text-gray-900 line-clamp-2 flex-1">
                            {opportunity.title}
                          </h3>
                          {score && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-semibold ${getScoreBadgeColor(score.score)}`}>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span>{score.score}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                          {opportunity.department && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="truncate">{opportunity.department}</span>
                            </div>
                          )}
                          {opportunity.naicsCode && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span>NAICS: {opportunity.naicsCode}</span>
                            </div>
                          )}
                          {opportunity.responseDeadLine && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Due: {formatDate(opportunity.responseDeadLine)}</span>
                            </div>
                          )}
                        </div>
                        {score && (
                          <div className="mt-2 text-xs text-gray-600">
                            <div className="flex flex-wrap gap-2">
                              {score.matchFactors.naicsMatch && (
                                <span className="inline-flex items-center gap-1 text-green-700">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  NAICS Match
                                </span>
                              )}
                              {score.matchFactors.certificationMatch && (
                                <span className="inline-flex items-center gap-1 text-green-700">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Certification Match
                                </span>
                              )}
                            </div>
                            <p className="mt-1 italic">{score.reasoning}</p>
                          </div>
                        )}
                      </div>
                      {opportunity.uiLink && (
                        <a
                          href={opportunity.uiLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          View
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
              {newOpportunities.length > 5 && (
                <div className="text-center pt-2">
                  <Link
                    to="/search"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View all {newOpportunities.length} new opportunities →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/search"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <svg className="w-5 h-5 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Search Opportunities</h3>
                  <p className="text-sm text-gray-600">Find new contracting opportunities</p>
                </div>
              </div>
            </Link>

            <Link
              to="/saved"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <svg className="w-5 h-5 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Saved Opportunities</h3>
                  <p className="text-sm text-gray-600">View your saved opportunities</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
