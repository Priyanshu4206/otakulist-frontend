import React, { useEffect, useRef, useState, useMemo } from 'react';
import styled from 'styled-components';
import { X, RefreshCw } from 'lucide-react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import NotificationCard from './NotificationCard';
import MiniLoadingSpinner from './MiniLoadingSpinner';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.32);
  z-index: 2000;
  transition: opacity 0.2s;
  opacity: ${({ open }) => (open ? 1 : 0)};
  pointer-events: ${({ open }) => (open ? 'auto' : 'none')};
`;

const Panel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 370px;
  max-width: 100vw;
  background: var(--cardBackground, #23243a);
  box-shadow: -4px 0 24px rgba(0,0,0,0.18);
  z-index: 2100;
  display: flex;
  flex-direction: column;
  transform: translateX(${({ open }) => (open ? '0' : '100%')});
  transition: transform 0.28s cubic-bezier(0.4,0.2,0.2,1);
  @media (max-width: 480px) {
    width: 100vw;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem 0.7rem 1.2rem;
  border-bottom: 1px solid var(--borderColor, #33344a);
  background: var(--cardBackground, #23243a);
  z-index: 1;
`;

const Title = styled.h2`
  font-size: 1.08rem;
  font-weight: 700;
  color: var(--textPrimary, #fff);
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--primary, #FFA500);
  padding: 4px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.15s;
  &:hover {
    background: rgba(var(--primary-rgb,255,165,0),0.08);
  }
`;

const CloseButton = styled(ActionButton)`
  color: var(--danger, #F44336);
  margin-left: 0.5rem;
`;

const TabBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--cardBackground, #23243a);
  border-bottom: 1px solid var(--borderColor, #33344a);
  padding: 0 1.2rem;
  height: 38px;
`;

const Tab = styled.button`
  background: none;
  border: none;
  color: ${({ active }) => (active ? 'var(--primary, #FFA500)' : 'var(--textSecondary, #B0B0B0)')};
  font-size: 0.98rem;
  font-weight: 600;
  padding: 0.2rem 0.7rem;
  border-bottom: 2px solid ${({ active }) => (active ? 'var(--primary, #FFA500)' : 'transparent')};
  cursor: pointer;
  transition: color 0.18s, border-bottom 0.18s;
  outline: none;
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.7rem 1.2rem 1.2rem 1.2rem;
  background: var(--cardBackground, #23243a);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: var(--textSecondary, #B0B0B0);
  font-size: 1.02rem;
  gap: 1.2rem;
`;

const LoadMoreButton = styled.button`
  background: var(--primary, #FFA500);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.1rem;
  font-size: 0.98rem;
  font-weight: 600;
  margin: 1.2rem auto 0 auto;
  display: block;
  cursor: pointer;
  transition: background 0.18s;
  &:hover {
    background: var(--primaryDark, #e69500);
  }
`;

const NotificationSidePanel = ({ open, onClose }) => {
  const {
    notifications,
    markAllRead,
    deleteNotification,
    fetchNotifications,
    pagination,
  } = useNotificationContext();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('unread'); // Default to 'unread'
  const panelRef = useRef();
  const wasOpen = useRef(false); // Track previous open state

  // Filter notifications based on tab
  const filteredNotifications = useMemo(() => {
    if (tab === 'unread') return notifications.filter(n => !n.read);
    if (tab === 'read') return notifications.filter(n => n.read);
    return notifications;
  }, [notifications, tab]);

  // Hydrate in case the panel was opened directly
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    
    fetchNotifications(1, pagination.limit, { append: false })
      .then(({ notifications }) => {
      })
      .catch(err => {
      })
      .finally(() => {
        setLoading(false);
      });
      
    setTab('unread'); // Always show unread by default when opening
  }, [open, fetchNotifications, pagination.limit]);

  // Only mark all as read when panel transitions from open to closed
  useEffect(() => {
    if (wasOpen.current && !open) {
      markAllRead();
    }
    wasOpen.current = open;
  }, [open, markAllRead]);

  // Load more notifications
  const handleLoadMore = async () => {
    setLoading(true);
    await fetchNotifications(pagination.page + 1, pagination.limit, { append: true });
    setLoading(false);
  };

  // Refresh notifications
  const handleRefresh = async () => {
    setLoading(true);
    await fetchNotifications(1, pagination.limit, { append: false });
    setLoading(false);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  return (
    <Overlay open={open}>
      <Panel open={open} ref={panelRef}>
        <Header>
          <Title>Notifications</Title>
          <Actions>
            <ActionButton title="Refresh" onClick={handleRefresh}>
              <RefreshCw size={18} />
            </ActionButton>
            <CloseButton title="Close" onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </Actions>
        </Header>
        <TabBar>
          <Tab active={tab === 'all'} onClick={() => setTab('all')}>All</Tab>
          <Tab active={tab === 'unread'} onClick={() => setTab('unread')}>Unread</Tab>
          <Tab active={tab === 'read'} onClick={() => setTab('read')}>Read</Tab>
        </TabBar>
        <List>
          {loading && <MiniLoadingSpinner />}
          {!loading && filteredNotifications.length === 0 && (
            <EmptyState>
              <span>No notifications yet.</span>
            </EmptyState>
          )}
          {!loading && filteredNotifications.map((notif) => (
            <NotificationCard
              key={notif?._id}
              notification={notif}
              onDelete={() => deleteNotification(notif?._id)}
              onClick={() => {}}
              compact
            />
          ))}
          {!loading && pagination.hasMore && (
            <LoadMoreButton onClick={handleLoadMore}>
              Load more
            </LoadMoreButton>
          )}
        </List>
      </Panel>
    </Overlay>
  );
};

export default NotificationSidePanel; 