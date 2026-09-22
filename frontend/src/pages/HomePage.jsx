import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export const HomePage = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const { tag: tagParam } = useParams();
  const navigate = useNavigate();

  const feedParam = searchParams.get('feed');
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [articles, setArticles] = useState([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  const limit = 10;
  const offset = (pageParam - 1) * limit;

  // Determine active feed mode
  let feedMode = 'global';
  if (tagParam) {
    feedMode = 'tag';
  } else if (feedParam === 'following' && currentUser) {
    feedMode = 'following';
  }

  useEffect(() => {
    // Fetch tags for sidebar
    api.get('/tags')
      .then((res) => setTags(res.data.tags || []))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    let endpoint = '/articles';
    const params = { limit, offset };

    if (feedMode === 'tag') {
      params.tag = tagParam;
    } else if (feedMode === 'following') {
      endpoint = '/articles/feed';
    }

    api.get(endpoint, { params })
      .then((res) => {
        setArticles(res.data.articles || []);
        setArticlesCount(res.data.articlesCount || 0);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [feedMode, tagParam, pageParam, currentUser]);

  const handleFavorite = async (slug, currentlyFavorited) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const endpoint = `/articles/${slug}/favorite`;
      const res = currentlyFavorited
        ? await api.delete(endpoint)
        : await api.post(endpoint);

      setArticles(articles.map((a) => (a.slug === slug ? res.data.article : a)));
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(articlesCount / limit);

  return (
    <div className="home-page">
      {!currentUser && (
        <div className="banner bg-emerald-600 text-white py-8 px-4 text-center mb-8 shadow-inner">
          <div className="container mx-auto">
            <h1 className="text-5xl font-bold font-serif mb-2">conduit</h1>
            <p className="text-xl font-light">A place to share your knowledge.</p>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-5xl px-4 py-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-3/4">
            <div className="feed-toggle border-b border-slate-200 mb-4">
              <ul className="nav nav-pills flex space-x-4">
                {currentUser && (
                  <li className="nav-item">
                    <Link
                      className={`nav-link pb-2 block border-b-2 font-medium ${
                        feedMode === 'following' ? 'active border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'
                      }`}
                      to="/?feed=following"
                    >
                      Your Feed
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link
                    className={`nav-link pb-2 block border-b-2 font-medium ${
                      feedMode === 'global' ? 'active border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'
                    }`}
                    to="/"
                  >
                    Global Feed
                  </Link>
                </li>
                {feedMode === 'tag' && (
                  <li className="nav-item">
                    <span className="nav-link active pb-2 block border-b-2 border-emerald-500 text-emerald-600 font-medium">
                      #{tagParam}
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {loading ? (
              <div className="py-4">Loading articles...</div>
            ) : articles.length === 0 ? (
              <div className="empty-feed-message py-4 text-slate-500">
                No articles here... yet.
              </div>
            ) : (
              <>
                {articles.map((art) => (
                  <div key={art.slug} className="article-preview py-6 border-b border-slate-200">
                    <div className="article-meta flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Link to={`/profile/${art.author.username}`}>
                          <img
                            src={art.author.image || '/default-avatar.svg'}
                            alt={art.author.username}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => { e.target.src = '/default-avatar.svg'; }}
                          />
                        </Link>
                        <div className="info text-sm">
                          <Link to={`/profile/${art.author.username}`} className="author font-semibold text-emerald-600 block">
                            {art.author.username}
                          </Link>
                          <span className="date text-xs text-slate-400">
                            {new Date(art.createdAt).toDateString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleFavorite(art.slug, art.favorited)}
                        className={`btn btn-sm px-2 py-1 text-xs rounded border ${
                          art.favorited
                            ? 'btn-primary bg-emerald-600 text-white border-emerald-600'
                            : 'btn-outline-primary border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        <i className="ion-heart"></i> {art.favoritesCount}
                      </button>
                    </div>

                    <Link to={`/article/${art.slug}`} className="preview-link block">
                      <h1 className="text-xl font-bold text-slate-800 mb-1">{art.title}</h1>
                      <p className="text-slate-500 mb-3">{art.description}</p>
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>Read more...</span>
                        <ul className="tag-list flex flex-wrap gap-1">
                          {art.tagList?.map((tag) => (
                            <li key={tag} className="tag-default tag-pill tag-outline">
                              {tag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Link>
                  </div>
                ))}

                {totalPages > 1 && (
                  <nav className="my-6">
                    <ul className="pagination flex flex-wrap gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                        const targetUrl = feedMode === 'tag'
                          ? `/tag/${tagParam}?page=${pageNum}`
                          : feedMode === 'following'
                            ? `/?feed=following&page=${pageNum}`
                            : `/?page=${pageNum}`;

                        return (
                          <li
                            key={pageNum}
                            className={`page-item ${pageNum === pageParam ? 'active' : ''}`}
                          >
                            <Link to={targetUrl} className="page-link">
                              {pageNum}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                )}
              </>
            )}
          </div>

          <div className="w-full md:w-1/4">
            <div className="sidebar bg-slate-100 p-4 rounded">
              <p className="font-semibold text-slate-700 mb-2">Popular Tags</p>
              <div className="tag-list flex flex-wrap gap-1">
                {tags.map((t) => (
                  <Link
                    key={t}
                    to={`/tag/${t}`}
                    className="tag-pill tag-default"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
