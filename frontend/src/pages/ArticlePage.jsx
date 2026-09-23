import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import ErrorList from '../components/ErrorList';

export const ArticlePage = () => {
  const { slug } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState('');
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchArticleAndComments = async () => {
    try {
      const artRes = await api.get(`/articles/${slug}`);
      setArticle(artRes.data.article);
      const comRes = await api.get(`/articles/${slug}/comments`);
      setComments(comRes.data.comments || []);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticleAndComments();
  }, [slug]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading article...</div>;
  }

  if (!article) {
    return (
      <div className="article-page container mx-auto p-4">
        <ErrorList errors={errors || { article: ['not found'] }} />
      </div>
    );
  }

  const isAuthor = currentUser && currentUser.username === article.author.username;

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const endpoint = `/profiles/${article.author.username}/follow`;
      const res = article.author.following
        ? await api.delete(endpoint)
        : await api.post(endpoint);
      setArticle({
        ...article,
        author: res.data.profile,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFavorite = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const endpoint = `/articles/${slug}/favorite`;
      const res = article.favorited
        ? await api.delete(endpoint)
        : await api.post(endpoint);
      setArticle(res.data.article);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteArticle = async () => {
    try {
      await api.delete(`/articles/${slug}`);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    try {
      const res = await api.post(`/articles/${slug}/comments`, {
        comment: { body: commentBody },
      });
      setComments([res.data.comment, ...comments]);
      setCommentBody('');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/articles/${slug}/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  const renderArticleMeta = () => (
    <div className="article-meta flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Link to={`/profile/${article.author.username}`}>
          <img
            src={article.author.image || '/default-avatar.svg'}
            alt={article.author.username}
            className="w-8 h-8 rounded-full object-cover"
          />
        </Link>
        <div className="info text-sm">
          <Link to={`/profile/${article.author.username}`} className="author font-semibold text-emerald-600">
            {article.author.username}
          </Link>
          <span className="date text-xs text-slate-400 block">
            {new Date(article.createdAt).toDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {isAuthor ? (
          <>
            <Link
              to={`/editor/${article.slug}`}
              className="btn btn-outline-secondary px-3 py-1 text-sm rounded border border-slate-400 text-slate-600 hover:bg-slate-100"
            >
              <i className="ion-edit"></i> Edit Article
            </Link>
            <button
              onClick={handleDeleteArticle}
              className="btn btn-outline-danger px-3 py-1 text-sm rounded border border-rose-600 text-rose-600 hover:bg-rose-600 hover:text-white"
            >
              <i className="ion-trash-a"></i> Delete Article
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleFollow}
              className={`btn px-3 py-1 text-sm rounded border border-slate-400 ${
                article.author.following ? 'bg-slate-200 text-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="ion-plus-round"></i>{' '}
              {article.author.following ? `Unfollow ${article.author.username}` : `Follow ${article.author.username}`}
            </button>
            <button
              onClick={handleFavorite}
              className={`btn px-3 py-1 text-sm rounded border ${
                article.favorited
                  ? 'btn-primary bg-emerald-600 text-white border-emerald-600'
                  : 'btn-outline-primary border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white'
              }`}
            >
              <i className="ion-heart"></i>{' '}
              {article.favorited ? 'Unfavorite Article' : 'Favorite Article'} ({article.favoritesCount})
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="article-page">
      <div className="banner bg-slate-800 text-white py-8 px-4 mb-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          {renderArticleMeta()}
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4">
        <ErrorList errors={errors} />

        <div className="article-content text-lg leading-relaxed text-slate-800 mb-8 whitespace-pre-wrap">
          <p>{article.body}</p>
        </div>

        <ul className="tag-list flex flex-wrap gap-1 mb-8">
          {article.tagList?.map((tag) => (
            <li key={tag} className="tag-default tag-pill tag-outline">
              {tag}
            </li>
          ))}
        </ul>

        <hr className="my-8 border-slate-200" />

        <div className="article-actions mb-8 flex justify-center">
          {renderArticleMeta()}
        </div>

        <div className="row flex justify-center">
          <div className="w-full max-w-2xl">
            {currentUser ? (
              <form onSubmit={handlePostComment} className="card comment-form mb-6 border rounded border-slate-300">
                <div className="card-block p-4">
                  <textarea
                    className="w-full focus:outline-none"
                    rows="3"
                    name="comment"
                    placeholder="Write a comment..."
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="card-footer bg-slate-50 p-3 border-t border-slate-300 flex items-center justify-between">
                  <img
                    src={currentUser.image || '/default-avatar.svg'}
                    alt={currentUser.username}
                    className="comment-author-img w-6 h-6 rounded-full object-cover"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary px-4 py-1 text-sm font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Post Comment
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-center mb-6">
                <Link to="/login" className="text-emerald-600 hover:underline">Sign in</Link>
                {' or '}
                <Link to="/register" className="text-emerald-600 hover:underline">sign up</Link>
                {' to add comments on this article.'}
              </p>
            )}

            {comments.map((comment) => (
              <div key={comment.id} className="card mb-4 border rounded border-slate-300">
                <div className="card-block p-4 text-slate-800">
                  <p>{comment.body}</p>
                </div>
                <div className="card-footer bg-slate-50 p-3 border-t border-slate-300 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Link to={`/profile/${comment.author.username}`}>
                      <img
                        src={comment.author.image || '/default-avatar.svg'}
                        alt={comment.author.username}
                        className="comment-author-img w-5 h-5 rounded-full object-cover"
                      />
                    </Link>
                    <Link to={`/profile/${comment.author.username}`} className="author font-medium text-emerald-600">
                      {comment.author.username}
                    </Link>
                    <span className="date-posted text-slate-400">
                      {new Date(comment.createdAt).toDateString()}
                    </span>
                  </div>
                  {currentUser?.username === comment.author.username && (
                    <span className="mod-options">
                      <i
                        onClick={() => handleDeleteComment(comment.id)}
                        className="ion-trash-a"
                      ></i>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
