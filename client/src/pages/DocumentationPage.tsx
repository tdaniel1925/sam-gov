// =============================================================================
// DOCUMENTATION PAGE
// Following CodeBakers pattern 04-frontend.md
// Comprehensive help and documentation with search
// =============================================================================

import { useState, useEffect } from 'react';
import { Search, ChevronRight, Home, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface DocCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface DocArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
  order: number;
}

export default function DocumentationPage() {
  const [categories, setCategories] = useState<DocCategory[]>([]);
  const [articles, setArticles] = useState<DocArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<DocArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<DocArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/documentation/categories');
      if (!response.ok) throw new Error('Failed to load categories');
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load documentation categories');
    }
  };

  const loadCategoryArticles = async (categoryId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/documentation/category/${categoryId}`
      );
      if (!response.ok) throw new Error('Failed to load articles');
      const data = await response.json();
      setArticles(data.articles);
      setSelectedCategory(categoryId);
      setSelectedArticle(null);
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to load articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  const loadArticle = async (articleId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/documentation/article/${articleId}`
      );
      if (!response.ok) throw new Error('Failed to load article');
      const data = await response.json();
      setSelectedArticle(data.article);
      setRelatedArticles(data.related || []);
    } catch (error) {
      console.error('Failed to load article:', error);
      toast.error('Failed to load article');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/documentation/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.results);
      setSelectedCategory(null);
      setSelectedArticle(null);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const goHome = () => {
    setSelectedCategory(null);
    setSelectedArticle(null);
    setSearchQuery('');
    setSearchResults([]);
    setArticles([]);
  };

  // Render home view (categories)
  const renderHome = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Documentation</h1>
        <p className="text-gray-600">
          Find answers, tutorials, and best practices for using the SAM.gov Opportunities App
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => loadCategoryArticles(category.id)}
            className="text-left bg-white border border-gray-200 hover:border-blue-400 hover:shadow-lg rounded-lg p-6 transition-all"
          >
            <div className="text-4xl mb-3">{category.icon}</div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{category.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{category.description}</p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              View articles <ChevronRight size={16} className="ml-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Render category view (list of articles)
  const renderCategory = () => {
    const category = categories.find((c) => c.id === selectedCategory);
    if (!category) return null;

    return (
      <div>
        <button
          onClick={goHome}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <Home size={20} className="mr-1" />
          Back to Categories
        </button>

        <div className="mb-8">
          <div className="text-4xl mb-3">{category.icon}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          <p className="text-gray-600">{category.description}</p>
        </div>

        <div className="space-y-3">
          {articles.map((article) => (
            <button
              key={article.id}
              onClick={() => loadArticle(article.id)}
              className="w-full text-left bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md rounded-lg p-4 transition-all flex items-center justify-between"
            >
              <div>
                <h3 className="font-medium text-gray-900 mb-1">{article.title}</h3>
                <div className="flex gap-2 flex-wrap">
                  {article.keywords.slice(0, 3).map((keyword) => (
                    <span
                      key={keyword}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render article view
  const renderArticle = () => {
    if (!selectedArticle) return null;

    return (
      <div>
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <Home size={20} className="mr-1" />
          Back
        </button>

        <article className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{selectedArticle.title}</h1>
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => loadArticle(article.id)}
                  className="text-left bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md rounded-lg p-4 transition-all"
                >
                  <h3 className="font-medium text-gray-900">{article.title}</h3>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render search results
  const renderSearchResults = () => (
    <div>
      <button onClick={goHome} className="flex items-center text-blue-600 hover:text-blue-700 mb-6">
        <Home size={20} className="mr-1" />
        Back to Categories
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Search Results for "{searchQuery}"
        </h2>
        <p className="text-gray-600">{searchResults.length} articles found</p>
      </div>

      {searchResults.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No articles found matching your search.</p>
          <p className="text-sm text-gray-500">Try different keywords or browse categories.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {searchResults.map((article) => (
            <button
              key={article.id}
              onClick={() => loadArticle(article.id)}
              className="w-full text-left bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md rounded-lg p-4 transition-all flex items-center justify-between"
            >
              <div>
                <h3 className="font-medium text-gray-900 mb-1">{article.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {article.content.substring(0, 150)}...
                </p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSearching ? <Loader2 size={20} className="animate-spin" /> : 'Search'}
          </button>
        </form>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={48} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {selectedArticle
            ? renderArticle()
            : searchResults.length > 0
            ? renderSearchResults()
            : selectedCategory
            ? renderCategory()
            : renderHome()}
        </>
      )}
    </div>
  );
}
