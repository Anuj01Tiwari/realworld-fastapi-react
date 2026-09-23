import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import NotificationBell from './NotificationBell';

export const Navbar = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar container mx-auto flex items-center justify-between py-3 px-4">
      <Link className="navbar-brand text-2xl font-bold text-emerald-600" to="/">
        conduit
      </Link>
      <ul className="flex items-center space-x-4">
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/') ? 'active font-semibold' : ''}`} to="/">
            Home
          </Link>
        </li>
        {currentUser ? (
          <>
            <li className="nav-item flex items-center">
              <NotificationBell />
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/editor') ? 'active font-semibold' : ''}`} to="/editor">
                <i className="ion-compose mr-1"></i>New Article
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/settings') ? 'active font-semibold' : ''}`} to="/settings">
                <i className="ion-gear-a mr-1"></i>Settings
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link flex items-center space-x-2 ${isActive(`/profile/${currentUser.username}`) ? 'active font-semibold' : ''}`}
                to={`/profile/${currentUser.username}`}
              >
                <img
                  src={currentUser.image || '/default-avatar.svg'}
                  className="user-pic w-6 h-6 rounded-full object-cover"
                  alt={currentUser.username}
                />
                <span>{currentUser.username}</span>
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/login') ? 'active font-semibold' : ''}`} to="/login">
                Sign in
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/register') ? 'active font-semibold' : ''}`} to="/register">
                Sign up
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
