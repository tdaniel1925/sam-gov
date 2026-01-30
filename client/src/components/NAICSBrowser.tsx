// =============================================================================
// NAICS BROWSER COMPONENT
// World-class NAICS code selector with autocomplete, hierarchy, and browsing
// Enhanced with recent selections tracking
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, Star, X, Info, Folder, FolderOpen, Clock, History } from 'lucide-react';

interface NAICSCode {
  code: string;
  title: string;
  description: string;
  level: 2 | 3 | 4 | 5 | 6;
  parentCode?: string;
  popular?: boolean;
  keywords?: string[];
}

interface NAICSBrowserProps {
  value?: string;
  onChange: (code: string) => void;
  onSelect?: (naics: NAICSCode) => void;
}

const RECENT_NAICS_KEY = 'naics_recent_selections';
const MAX_RECENT_ITEMS = 5;

export default function NAICSBrowser({ value, onChange, onSelect }: NAICSBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NAICSCode[]>([]);
  const [popularCodes, setPopularCodes] = useState<NAICSCode[]>([]);
  const [recentCodes, setRecentCodes] = useState<NAICSCode[]>([]);
  const [selectedNAICS, setSelectedNAICS] = useState<NAICSCode | null>(null);
  const [hierarchy, setHierarchy] = useState<NAICSCode[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'popular' | 'browse'>('popular');

  // Browse Tab State
  const [sectors, setSectors] = useState<NAICSCode[]>([]);
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());
  const [childrenMap, setChildrenMap] = useState<Map<string, NAICSCode[]>>(new Map());
  const [browseLoading, setBrowseLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Load popular codes, recent selections, and sectors on mount
  useEffect(() => {
    loadPopularCodes();
    loadRecentSelections();
    loadSectors();
  }, []);

  // Load NAICS details if value changes
  useEffect(() => {
    if (value) {
      loadNAICSDetails(value);
    }
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setLoading(true);
      searchTimeoutRef.current = setTimeout(() => {
        searchNAICS(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  async function loadPopularCodes() {
    try {
      const response = await fetch('http://localhost:3001/api/naics/popular');
      const data = await response.json();
      setPopularCodes(data.data || []);
    } catch (error) {
      console.error('Failed to load popular NAICS:', error);
    }
  }

  function loadRecentSelections() {
    try {
      const stored = localStorage.getItem(RECENT_NAICS_KEY);
      if (stored) {
        const recent: NAICSCode[] = JSON.parse(stored);
        setRecentCodes(recent);
      }
    } catch (error) {
      console.error('Failed to load recent NAICS:', error);
    }
  }

  function saveToRecentSelections(naics: NAICSCode) {
    try {
      // Remove if already exists (to avoid duplicates)
      const filtered = recentCodes.filter(r => r.code !== naics.code);

      // Add to front
      const updated = [naics, ...filtered].slice(0, MAX_RECENT_ITEMS);

      // Save to localStorage
      localStorage.setItem(RECENT_NAICS_KEY, JSON.stringify(updated));
      setRecentCodes(updated);
    } catch (error) {
      console.error('Failed to save recent NAICS:', error);
    }
  }

  async function searchNAICS(query: string) {
    try {
      const response = await fetch(`http://localhost:3001/api/naics/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.data || []);
    } catch (error) {
      console.error('NAICS search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadSectors() {
    try {
      const response = await fetch('http://localhost:3001/api/naics/all?level=2');
      const data = await response.json();
      setSectors(data.data || []);
    } catch (error) {
      console.error('Failed to load sectors:', error);
    }
  }

  async function loadChildren(parentCode: string) {
    // Check if already loaded
    if (childrenMap.has(parentCode)) {
      return;
    }

    try {
      setBrowseLoading(true);
      const response = await fetch(`http://localhost:3001/api/naics/children/${parentCode}`);
      const data = await response.json();

      const newMap = new Map(childrenMap);
      newMap.set(parentCode, data.data || []);
      setChildrenMap(newMap);
    } catch (error) {
      console.error('Failed to load children:', error);
    } finally {
      setBrowseLoading(false);
    }
  }

  function toggleExpand(code: string) {
    const newExpanded = new Set(expandedCodes);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
      loadChildren(code);
    }
    setExpandedCodes(newExpanded);
  }

  async function loadNAICSDetails(code: string) {
    try {
      const [detailsRes, hierarchyRes] = await Promise.all([
        fetch(`http://localhost:3001/api/naics/code/${code}`),
        fetch(`http://localhost:3001/api/naics/hierarchy/${code}`),
      ]);

      if (detailsRes.ok) {
        const details = await detailsRes.json();
        setSelectedNAICS(details.data);
      }

      if (hierarchyRes.ok) {
        const hierarchyData = await hierarchyRes.json();
        setHierarchy(hierarchyData.data || []);
      }
    } catch (error) {
      console.error('Failed to load NAICS details:', error);
    }
  }

  function handleSelectCode(naics: NAICSCode) {
    setSelectedNAICS(naics);
    onChange(naics.code);
    setShowDropdown(false);
    setSearchQuery('');
    loadNAICSDetails(naics.code);

    // Save to recent selections
    saveToRecentSelections(naics);

    if (onSelect) {
      onSelect(naics);
    }
  }

  function clearSelection() {
    setSelectedNAICS(null);
    setHierarchy([]);
    onChange('');
  }

  function renderNAICSCard(naics: NAICSCode, showFullDetails = false) {
    const levelColors = {
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-green-100 text-green-800',
      4: 'bg-yellow-100 text-yellow-800',
      5: 'bg-orange-100 text-orange-800',
      6: 'bg-purple-100 text-purple-800',
    };

    return (
      <div
        key={naics.code}
        onClick={() => handleSelectCode(naics)}
        className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all"
      >
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${levelColors[naics.level]}`}>
              {naics.code}
            </span>
            {naics.popular && (
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
            )}
          </div>
          <span className="text-xs text-gray-500">{naics.level}-digit</span>
        </div>
        <h4 className="font-semibold text-gray-900 text-sm mb-1">{naics.title}</h4>
        {showFullDetails && (
          <p className="text-xs text-gray-600">{naics.description}</p>
        )}
      </div>
    );
  }

  function renderTreeNode(naics: NAICSCode, depth: number = 0) {
    const isExpanded = expandedCodes.has(naics.code);
    const children = childrenMap.get(naics.code) || [];
    const hasChildren = naics.level < 6; // All codes except 6-digit can have children

    const levelColors = {
      2: 'text-blue-600',
      3: 'text-green-600',
      4: 'text-yellow-600',
      5: 'text-orange-600',
      6: 'text-purple-600',
    };

    return (
      <div key={naics.code} className="select-none">
        <div
          className="flex items-center gap-2 py-2 px-2 hover:bg-gray-50 rounded cursor-pointer group"
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(naics.code);
              }}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <FolderOpen size={14} className="text-gray-600" />
              ) : (
                <Folder size={14} className="text-gray-600" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}

          {/* Code and Title */}
          <div
            onClick={() => handleSelectCode(naics)}
            className="flex-1 flex items-center gap-2"
          >
            <span className={`font-mono text-sm font-bold ${levelColors[naics.level]}`}>
              {naics.code}
            </span>
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
              {naics.title}
            </span>
            {naics.popular && (
              <Star size={12} className="text-yellow-500 fill-yellow-500" />
            )}
          </div>
        </div>

        {/* Render Children */}
        {isExpanded && children.length > 0 && (
          <div className="border-l-2 border-gray-200 ml-2">
            {children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected NAICS Display */}
      {selectedNAICS ? (
        <div className="bg-white border-2 border-blue-500 rounded-lg p-4 mb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                  {selectedNAICS.code}
                </span>
                {selectedNAICS.popular && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium flex items-center gap-1">
                    <Star size={12} className="fill-yellow-500" />
                    Popular
                  </span>
                )}
                <span className="text-xs text-gray-500">{selectedNAICS.level}-digit level</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{selectedNAICS.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{selectedNAICS.description}</p>

              {/* Hierarchy Breadcrumb */}
              {hierarchy.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500 flex-wrap">
                  {hierarchy.map((h, idx) => (
                    <div key={h.code} className="flex items-center">
                      {idx > 0 && <ChevronRight size={12} className="mx-1" />}
                      <span className={idx === hierarchy.length - 1 ? 'font-semibold text-blue-600' : ''}>
                        {h.code} - {h.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={clearSelection}
              className="ml-4 p-1 hover:bg-gray-100 rounded transition-colors"
              title="Clear selection"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
      ) : (
        /* Search Input */
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NAICS Code
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
                if (e.target.value.trim().length >= 2) {
                  setActiveTab('search');
                }
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search by code, industry, or keyword..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Dropdown Panel */}
      {showDropdown && !selectedNAICS && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('popular')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'popular'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Star size={16} className="inline mr-1" />
              Popular
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'search'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search size={16} className="inline mr-1" />
              Search
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'browse'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Folder size={16} className="inline mr-1" />
              Browse
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 max-h-80 overflow-y-auto">
            {activeTab === 'popular' && (
              <div>
                {/* Recent Selections Section */}
                {recentCodes.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-gray-600" />
                      <h3 className="text-sm font-semibold text-gray-900">Recent Selections</h3>
                    </div>
                    <div className="space-y-2">
                      {recentCodes.map(naics => (
                        <div key={`recent-${naics.code}`} className="relative">
                          {renderNAICSCard(naics)}
                          <div className="absolute top-2 right-2">
                            <History size={14} className="text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="my-4 border-t border-gray-200"></div>
                  </div>
                )}

                {/* Popular Codes Section */}
                <div className="mb-3 flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-900">
                    These are the most commonly used NAICS codes in government contracting,
                    especially IT, engineering, and professional services.
                  </p>
                </div>
                <div className="space-y-2">
                  {popularCodes.length > 0 ? (
                    popularCodes.map(naics => renderNAICSCard(naics))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Loading popular codes...</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'search' && (
              <div>
                {loading && (
                  <p className="text-sm text-gray-500 text-center py-4">Searching...</p>
                )}
                {!loading && searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map(naics => renderNAICSCard(naics, true))}
                  </div>
                )}
                {!loading && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No results found for "{searchQuery}"
                  </p>
                )}
                {searchQuery.trim().length < 2 && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Try searching for:</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• <strong>Industry name:</strong> "engineering", "cybersecurity", "consulting"</li>
                      <li>• <strong>NAICS code:</strong> "541330", "541512", "541519"</li>
                      <li>• <strong>Service type:</strong> "software", "cloud", "testing"</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'browse' && (
              <div>
                <div className="mb-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-900 flex items-center gap-2">
                    <Folder size={14} className="flex-shrink-0" />
                    Browse all 20 NAICS sectors. Click folder icons to expand subsectors and drill down to 6-digit codes. Click any code to select it.
                  </p>
                </div>

                {browseLoading && sectors.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Loading sectors...</p>
                ) : sectors.length > 0 ? (
                  <div className="space-y-1">
                    {sectors.map(sector => renderTreeNode(sector, 0))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No sectors available</p>
                )}

                {browseLoading && sectors.length > 0 && (
                  <div className="text-xs text-gray-500 text-center py-2">
                    Loading...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Helper Text */}
      {!selectedNAICS && !showDropdown && (
        <p className="mt-1 text-xs text-gray-500">
          Search by industry name, service type, or enter a NAICS code directly
        </p>
      )}
    </div>
  );
}
