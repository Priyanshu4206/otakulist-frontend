import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { BookOpen, UsersRound } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import ShimmerLoader from '../common/ShimmerLoader';
import { exploreAPI, userAPI } from '../../services/modules';
import MiniLoadingSpinner from '../common/MiniLoadingSpinner';
import { useAuth, useToast } from '../../hooks';

const Section = styled.section`
  margin-bottom: 2.5rem;
`;
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;
const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--textPrimary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  svg { color: var(--primary); }
`;
const ViewAllLink = styled.a`
  font-size: 0.9rem;
  color: var(--primary);
  cursor: pointer;
  &:hover { text-decoration: underline; }
`;
const PeopleGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: rgba(var(--borderColor-rgb), 0.1); border-radius: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(var(--primary-rgb), 0.3); border-radius: 4px; }
`;
const UserCard = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  border-bottom: 1px solid rgba(var(--borderColor-rgb), 0.9);
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;
const UserInfo = styled.div`
  flex: 1;
`;
const UserName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin: 0;
`;
const UserBio = styled.p`
  font-size: 0.85rem;
  color: var(--textSecondary);
  margin: 0.25rem 0 0;
`;

const ButtonSpinner = styled(MiniLoadingSpinner)`
  width: 16px;
  height: 16px;
  
  & > div {
    width: 16px;
    height: 16px;
    border-width: 2px;
    border-color: ${props => props.following ? 'var(--primary)' : 'white'};
    border-top-color: transparent;
  }
`;

const FollowButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.following ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--primary)'};
  color: ${props => props.following ? 'var(--primary)' : 'white'};
  border: 1px solid ${props => props.following ? 'var(--primary)' : 'transparent'};
  border-radius: 8px;
  font-weight: 500;
  cursor: ${props => props.isLoading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  opacity: ${props => props.isLoading ? 0.7 : 1};
  
  &:hover {
    background-color: ${props => props.following ? 'rgba(var(--primary-rgb), 0.2)' : 'var(--primaryDark)'};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ErrorMessage = styled.div`
  color: var(--danger);
  font-size: 0.85rem;
  margin-top: 0.25rem;
  text-align: center;
`;

const EmptyStateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--cardBackground);
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(var(--borderColor-rgb), 0.1);
`;

const EmptyStateIcon = styled.div`
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 1rem;
  opacity: 0.7;
`;

const EmptyStateText = styled.p`
  color: var(--textSecondary);
  font-size: 0.95rem;
  margin: 0;
`;

const PeopleToFollowSection = () => {
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [error, setError] = useState(null);
  const [followLoading, setFollowLoading] = useState({}); // Track loading state per user

  const fetchRecommendedUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await exploreAPI.getPersonalizedRecommendations({
        contentType: 'users',
        limit: 5,
        includeSimilarUsers: true
      });

      if (response.success && response.data) {
        setRecommendedUsers(response.data.users || []);
      } else {
        throw new Error(response.message || 'Failed to fetch recommendations');
      }
    } catch (error) {
      console.error('Error fetching recommended users:', error);
      setError('Failed to load recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommended users (right section)
  useEffect(() => {
    fetchRecommendedUsers();
  }, []);

  const handleFollowToggle = useCallback(async (userId) => {
    // If already loading for this user, prevent multiple requests
    if (followLoading[userId]) return;

    try {
      setFollowLoading(prev => ({ ...prev, [userId]: true }));

      const userToUpdate = recommendedUsers.find(user => user._id === userId);
      const isCurrentlyFollowing = userToUpdate?.isFollowing;
      let response;
      if (isCurrentlyFollowing) {
        response = await userAPI.unfollowUser(userId);
      } else {
        response = await userAPI.followUser(userId);
      }

      if (response.success) {
        // Update local state
        setRecommendedUsers(prev =>
          prev.map(user =>
            user._id === userId
              ? { ...user, isFollowing: !isCurrentlyFollowing }
              : user
          )
        );

        await fetchRecommendedUsers();

        showToast({
          type: 'success',
          message: isCurrentlyFollowing ? 'Unfollowed user successfully' : 'Now following user'
        });
      } else {
        throw new Error(response.message || 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      // Show error message to user (you could add a toast notification here)
      showToast({
        type: 'error',
        message: error.message || 'Error updating follow status'
      });
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  }, [recommendedUsers]);

  const renderContent = () => {
    if (loading) {
      return Array(5).fill(0).map((_, index) => (
        <ShimmerLoader key={index} type="user-card" height={100} />
      ));
    }
    
    if (error) {
      return <ErrorMessage>{error}</ErrorMessage>;
    }
    
    if (!recommendedUsers || recommendedUsers.length === 0) {
      return (
        <EmptyStateWrapper>
          <EmptyStateIcon>
            <UsersRound size={48} />
          </EmptyStateIcon>
          <EmptyStateText>No user recommendations available right now. Check back later!</EmptyStateText>
        </EmptyStateWrapper>
      );
    }
    
    return recommendedUsers.map(user => (
      <UserCard key={user._id || user.userId}>
          <UserAvatar style={{ marginTop: "6px" }} src={user.avatarUrl} alt={user.username} size={44} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: "8px"}}>
            <UserInfo>
              <UserName>{user.username}</UserName>
              <UserBio>
                {user.bio ? (
                  user.bio.length > 50
                    ? user.bio.slice(0, 50) + '...'
                    : user.bio
                ) : user.reasons[0]}
              </UserBio>
            </UserInfo>
            <FollowButton
              following={user.isFollowing}
              onClick={() => handleFollowToggle(user.username)}
              disabled={followLoading[user._id || user.userId]}
              isLoading={followLoading[user._id || user.userId]}
            >
              {followLoading[user._id || user.userId] ? (
                <ButtonSpinner following={user.isFollowing} />
              ) : (
                user.isFollowing ? 'Following' : 'Follow'
              )}
            </FollowButton>
          </div>
      </UserCard>
    ));
  };

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          <BookOpen size={20} />
          People to Follow
        </SectionTitle>
        {/* <ViewAllLink>View All</ViewAllLink> */}
      </SectionHeader>
      <PeopleGrid>
        {renderContent()}
      </PeopleGrid>
    </Section>
  );
};

export default PeopleToFollowSection; 