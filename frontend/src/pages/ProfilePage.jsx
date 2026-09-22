import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import ErrorList from '../components/ErrorList';

export const ProfilePage = () => {
  const { username } = useParams();
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(null);

  const isFavoritedTab = location.pathname.endsWith('/favorites');

  useEffect(() => {
    setLoading(true);
    setErrors(null);
    api.get(`/profiles/${username}`)
      .then((res) => {
        setProfile(res.data.profile);
      })
      .catch((err) => {
        if (err.response?.data?.errors) {
          setErrors(err.response.data.errors);
        }
      });
  }, [username]);

  useEffect(() => {
    if (!profile) return;
    const params = isFavoritedTab
      ? { favorited: username }
      : { author: username };

    api.get('/articles', { params })
      .then((res) => {
        setArticles(res.data.articles || []);
        setArticlesCount(res.data.articlesCount || 0);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [profile, isFavoritedTab, username]);

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const endpoint = `/profiles/${username}/follow`;
      const res = profile.following
        ? await api.delete(endpoint)
        : await api.post(endpoint);
      setProfile(res.data.profile);
    } catch (err) {
      console.error(err);
    }
  };

  const isSelf = currentUser && currentUser.username === username;

  return (
    <div className="profile-page">
      <div className="user-info bg-slate-100 text-center py-8 px-4 mb-6">
        <div className="container mx-auto max-w-4xl">
          <img
            src={profile?.image || '/default-avatar.svg'}
            alt={username}
            className="user-img mx-auto mb-4 rounded-full object-cover"
            onError={(e) => { e.target.src = '/default-avatar.svg'; }}
          />
          <h4 className="text-2xl font-bold text-slate-800 mb-2">{username}</h4>
          <p className="text-slate-500 max-w-lg mx-auto mb-4">{profile?.bio}</p>

          <div className="flex justify-end">
            {isSelf ? (
              <Link
                to="/settings"
                className="btn btn-outline-secondary px-3 py-1 text-sm rounded border border-slate-400 text-slate-600 hover:bg-slate-200"
              >
                <i className="ion-gear-a"></i> Edit Profile Settings
              </Link>
            ) : (
              <button
                onClick={handleFollow}
                className={`btn px-3 py-1 text-sm rounded border border-slate-400 ${
                  profile?.following ? 'bg-slate-300 text-slate-800' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <i className="ion-plus-round"></i>{' '}
                {profile?.following ? `Unfollow ${username}` : `Follow ${username}`}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4">
        <ErrorList errors={errors} />

        <div className="articles-toggle border-b border-slate-200 mb-4">
          <ul className="nav nav-pills flex space-x-4">
            <li className="nav-item">
              <Link
                className={`nav-link pb-2 block border-b-2 font-medium ${
                  !isFavoritedTab ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'
                }`}
                to={`/profile/${username}`}
              >
                My Articles
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link pb-2 block border-b-2 font-medium ${
                  isFavoritedTab ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'
                }`}
                to={`/profile/${username}/favorites`}
              >
                Favorited Articles
              </Link>
            </li>
          </ul>
        </div>

        {loading ? (
          <div className="py-4">Loading articles...</div>
        ) : articles.length === 0 ? (
          <div className="empty-feed-message py-4 text-slate-500">
            No articles here... yet.
          </div>
        ) : (
          articles.map((art) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
