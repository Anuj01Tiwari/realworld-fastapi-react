import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorList from '../components/ErrorList';

export const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container mx-auto max-w-md my-8 px-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-normal text-slate-800 mb-2">Sign up</h1>
        <p>
          <Link to="/login" className="text-emerald-600 hover:underline">
            Have an account?
          </Link>
        </p>
      </div>

      <ErrorList errors={errors} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            className="w-full px-4 py-3 text-lg border border-slate-300 rounded focus:outline-none focus:border-emerald-500"
            type="text"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-6 py-3 text-lg font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
