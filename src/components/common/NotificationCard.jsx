import React from 'react';
import styled, { css } from 'styled-components';
import { Award, UserPlus, Bell, Heart, MessageCircle, Trash2, CheckCircle, Circle, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Card = styled.div`
  display: flex;
  align-items: center;
  background: var(--cardBackground, #23243a);
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  padding: ${props => props.compact ? '0.7rem 1rem' : '1.1rem 1.5rem'};
  margin-bottom: ${props => props.compact ? '0.5rem' : '1rem'};
  gap: ${props => props.compact ? '0.7rem' : '1.2rem'};
  position: relative;
  transition: background 0.2s;
  cursor: pointer;
  border: 2px solid transparent;
  ${props => !props.read && css`
    border-color: var(--primary, #FFA500);
    background: linear-gradient(90deg, var(--primary), var(--cardBackground) 80%);
    box-shadow: 0 2px 8px rgba(var(--primary-rgb,255,165,0),0.06);
  `}
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ type }) => {
    switch (type) {
      case 'achievement':
      case 'achievements': return 'var(--gradientPrimary, linear-gradient(135deg, #FFA500 0%, #FFB733 100%))';
      case 'follow': return 'var(--gradientSecondary, linear-gradient(135deg, #1E88E5 0%, #64B5F6 100%))';
      case 'playlist_like': return 'var(--gradientAccent, linear-gradient(135deg, #FF8C00 0%, #FFB733 100%))';
      case 'playlist_comment':
      case 'comment_reply': return 'var(--gradientSecondary, linear-gradient(135deg, #1E88E5 0%, #64B5F6 100%))';
      default: return 'var(--gradientPrimary, linear-gradient(135deg, #FFA500 0%, #FFB733 100%))';
    }
  }};
  border-radius: 50%;
  padding: ${props => props.compact ? '0.45rem' : '0.7rem'};
  color: #fff;
  min-width: ${props => props.compact ? '32px' : '44px'};
  min-height: ${props => props.compact ? '32px' : '44px'};
  box-shadow: 0 1px 4px rgba(0,0,0,0.10);
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.compact ? '0.08rem' : '0.2rem'};
`;

const Message = styled.div`
  color: var(--textPrimary, #fff);
  font-size: ${props => props.compact ? '0.98rem' : '1.08rem'};
  font-weight: 500;
  line-height: 1.35;
`;

const Timestamp = styled.div`
  color: var(--textSecondary, #B0B0B0);
  font-size: ${props => props.compact ? '0.85rem' : '0.92rem'};
  margin-top: 2px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.compact ? '0.4rem' : '0.7rem'};
`;

const UnreadDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary, #FFA500);
  position: absolute;
  left: 10px;
  top: 10px;
  box-shadow: 0 0 6px var(--primary, #FFA500);
  display: ${props => props.read ? 'none' : 'block'};
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--danger, #F44336);
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.18s, background 0.18s;
  &:hover {
    color: #fff;
    background: var(--danger, #F44336);
    border-radius: 50%;
  }
`;

function getIcon(type) {
  switch (type) {
    case 'achievement': 
    case 'achievements': return <Trophy size={22} />;
    case 'follow': return <UserPlus size={22} />;
    case 'playlist_like': return <Heart size={22} />;
    case 'playlist_comment':
    case 'comment_reply': return <MessageCircle size={22} />;
    case 'system': return <Bell size={22} />;
    default: return <Bell size={22} />;
  }
}

const NotificationCard = ({ notification, onMarkRead, onDelete, onClick, compact }) => {
  // Ensure we have a valid notification object
  if (!notification) {
    console.error('[NotificationCard] Received invalid notification object:', notification);
    return null;
  }
  
  const { type, message, createdAt, read } = notification;
  
  // Normalize the type to handle variations
  const normalizedType = type ? type.toLowerCase() : 'system';

  // Check for valid createdAt date
  const createdDate = createdAt ? new Date(createdAt) : new Date();
  const isValidDate = !isNaN(createdDate.getTime());

  return (
    <Card read={read} compact={compact} onClick={() => {
      if (onClick) onClick(notification);
    }}>
      <UnreadDot read={read} />
      <IconWrapper type={normalizedType} compact={compact}>{getIcon(normalizedType)}</IconWrapper>
      <Content compact={compact}>
        <Message compact={compact}>{message}</Message>
        <Timestamp compact={compact}>
          {isValidDate 
            ? formatDistanceToNow(createdDate, { addSuffix: true })
            : 'Recently'}
        </Timestamp>
      </Content>
      <Actions compact={compact}>
        {!compact && (
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: read ? 'var(--primary)' : 'var(--success)', marginRight: 2, padding: 0 }}
            title={read ? 'Mark as unread' : 'Mark as read'}
            onClick={e => {
              e.stopPropagation();
              if (onMarkRead) onMarkRead(notification);
            }}
          >
            {read ? <Circle size={18} /> : <CheckCircle size={18} />}
          </button>
        )}
        <DeleteButton
          title="Delete"
          onClick={e => {
            e.stopPropagation();
            if (onDelete) onDelete(notification);
          }}
        >
          <Trash2 size={18} />
        </DeleteButton>
      </Actions>
    </Card>
  );
};

export default NotificationCard; 