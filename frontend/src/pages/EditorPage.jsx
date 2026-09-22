import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ErrorList from '../components/ErrorList';

export const EditorPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState([]);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      api.get(`/articles/${slug}`)
        .then((res) => {
          const art = res.data.article;
          setTitle(art.title);
          setDescription(art.description);
          setBody(art.body);
          setTagList(art.tagList || []);
        })
        .catch((err) => {
          if (err.response?.data?.errors) {
            setErrors(err.response.data.errors);
          }
        });
    }
  }, [slug]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tagList.includes(val)) {
        setTagList([...tagList, val]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTagList(tagList.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    setLoading(true);

    const articleData = {
      title,
      description,
      body,
      tagList,
    };

    try {
      let res;
      if (slug) {
        res = await api.put(`/articles/${slug}`, { article: articleData });
      } else {
        res = await api.post('/articles', { article: articleData });
      }
      navigate(`/article/${res.data.article.slug}`);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors('Failed to publish article.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor-page container mx-auto max-w-3xl my-8 px-4">
      <ErrorList errors={errors} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            className="w-full px-4 py-3 text-lg border border-slate-300 rounded focus:outline-none focus:border-emerald-500"
            type="text"
            name="title"
            placeholder="Article Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            className="w-full px-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-emerald-500"
            type="text"
            name="description"
            placeholder="What's this article about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <textarea
            className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-emerald-500"
            rows="8"
            name="body"
            placeholder="Write your article (in markdown)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <input
            className="w-full px-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-emerald-500 mb-2"
            type="text"
            placeholder="Enter tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
          <div className="tag-list flex flex-wrap gap-1">
            {tagList.map((tag) => (
              <span
                key={tag}
                className="tag-default tag-pill flex items-center gap-1 cursor-pointer"
                onClick={() => handleRemoveTag(tag)}
              >
                <i className="ion-close-round text-xs"></i>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-6 py-3 text-lg font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            Publish Article
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditorPage;
