import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NotificationBell } from './NotificationBell';
import { NotificationContext } from '../context/NotificationContext';

const renderWithContext = (contextValue) => {
  return render(
    <NotificationContext.Provider value={contextValue}>
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    </NotificationContext.Provider>
  );
};

describe('NotificationBell Component', () => {
  it('renders bell icon without unread badge when unreadCount is 0', () => {
    renderWithContext({
      notifications: [],
      unreadCount: 0,
      isOpen: false,
      setIsOpen: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    expect(bellButton).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders unread badge counter when unreadCount is greater than 0', () => {
    renderWithContext({
      notifications: [
        {
          id: 1,
          type: 'follow',
          actor: { username: 'alice', image: null },
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ],
      unreadCount: 3,
      isOpen: false,
      setIsOpen: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    });

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('opens dropdown and displays notifications list when isOpen is true', () => {
    const mockMarkAll = vi.fn();
    renderWithContext({
      notifications: [
        {
          id: 1,
          type: 'follow',
          actor: { username: 'alice', image: null },
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      isOpen: true,
      setIsOpen: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: mockMarkAll,
    });

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText(/started following you/i)).toBeInTheDocument();

    const markAllBtn = screen.getByText('Mark all as read');
    fireEvent.click(markAllBtn);
    expect(mockMarkAll).toHaveBeenCalledTimes(1);
  });
});
