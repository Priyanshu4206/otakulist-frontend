import styled from 'styled-components';

const StatusContainer = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  color: var(--white);
  background-color: ${({ status }) => {
    switch (status) {
      case 'watching':
        return 'var(--success)';
      case 'completed':
        return 'var(--tertiary)';
      case 'on_hold':
        return 'var(--warning)';
      case 'dropped':
        return 'var(--danger)';
      case 'plan_to_watch':
        return 'var(--info)';
      default:
        return 'var(--textSecondary)';
    }
  }};
`;

const statusLabels = {
  watching: 'Watching',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped',
  plan_to_watch: 'Plan to Watch'
};

const WatchStatusBadge = ({ status }) => {
  return (
    <StatusContainer status={status}>
      {statusLabels[status] || status}
    </StatusContainer>
  );
};

export default WatchStatusBadge; 