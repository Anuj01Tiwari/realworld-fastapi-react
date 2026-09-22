import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

describe('Navbar Component', () => {
  test('renders brand title and unauthenticated links', () => {
    const authContextValue = {
      currentUser: null,
      authState: 'unauthenticated',
      login: () => {},
      register: () => {},
      logout: () => {},
    };

    render(
      <AuthContext.Provider value={authContextValue}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('conduit')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  test('renders authenticated links when user is logged in', () => {
    const authContextValue = {
      currentUser: { username: 'testuser', email: 'test@example.com', image: null },
      authState: 'authenticated',
      login: () => {},
      register: () => {},
      logout: () => {},
    };

    render(
      <AuthContext.Provider value={authContextValue}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('New Article')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });
});
