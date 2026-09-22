import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorList from '../components/ErrorList';

export const SettingsPage = () => {
  const { currentUser, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [image, setImage] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setImage(currentUser.image || '');
      setUsername(currentUser.username || '');
      setBio(currentUser.bio || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    setLoading(true);

    const updateData = {
      image,
      username,
      bio,
      email,
    };

    if (password) {
      updateData.password = password;
    }

    try {
      const updated = await updateUser(updateData);
      navigate(`/profile/${updated.username}`);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors('Failed to update settings.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="settings-page container mx-auto max-w-md my-8 px-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-normal text-slate-800">Your Settings</h1>
      </div>

      <ErrorList errors={errors} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            className="w-full px-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-emerald-500"
            type="text"
            name="image"
            placeholder="URL of profile picture"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>
        <div>
          <input
            className="w-full px-4 py-3 text-lg font-semibold border border-slate-300 rounded focus:outline-none focus:border-emerald-500"
            type="text"
            name="username"
            placeholder="Your Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <textarea
            className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-emerald-500"
            rows="8"
            name="bio"
            placeholder="Short bio about you"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>
        </div>
        <div>
          <input
            className="w-full px-4 py-3 text-lg border border-slate-300 rounded focus:outline-none focus:border-emerald-500"
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            className="w-full px-4 py-3 text-lg border border-slate-300 rounded focus:outline-none focus:border-emerald-500"
            type="password"
            name="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-6 py-3 text-lg font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            Update Settings
          </button>
        </div>
      </form>

      <hr className="my-6 border-slate-200" />

      <div className="text-left">
        <button
          onClick={handleLogout}
          type="button"
          className="btn btn-outline-danger px-4 py-2 rounded border border-rose-600 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
        >
          Or click here to logout
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
