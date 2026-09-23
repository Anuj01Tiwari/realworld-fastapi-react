import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

export const NotificationBell = () => {
  const { notifications, unreadCount, isOpen, setIsOpen, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);

    if (notif.type === 'follow') {
      navigate(`/profile/${notif.actor.username}`);
    } else if (notif.article) {
      navigate(`/article/${notif.article.slug}`);
    }
  };

  const getMessageText = (notif) => {
    switch (notif.type) {
      case 'follow':
        return (
          <>
            <span className="font-semibold text-slate-800">{notif.actor.username}</span> started following you
          </>
        );
      case 'comment':
        return (
          <>
            <span className="font-semibold text-slate-800">{notif.actor.username}</span> commented on your article{' '}
            <span className="font-medium text-emerald-600">"{notif.article?.title}"</span>
          </>
        );
      case 'favorite':
        return (
          <>
            <span className="font-semibold text-slate-800">{notif.actor.username}</span> favorited your article{' '}
            <span className="font-medium text-emerald-600">"{notif.article?.title}"</span>
          </>
        );
      default:
        return 'New notification';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-emerald-600 focus:outline-none flex items-center justify-center rounded-full transition-colors"
        aria-label="Notifications"
      >
        {/* Bell Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="unread-badge absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">No notifications yet.</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-start space-x-3 text-xs ${
                    !notif.is_read ? 'bg-emerald-50/50 font-normal' : 'text-slate-600'
                  }`}
                >
                  <img
                    src={notif.actor?.image || '/default-avatar.svg'}
                    alt={notif.actor?.username || 'User'}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="leading-snug text-slate-700">{getMessageText(notif)}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {!notif.is_read && (
                    <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-1"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
