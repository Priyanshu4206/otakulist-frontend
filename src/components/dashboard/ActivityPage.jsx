import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Users, Activity, Search, Clock, UserPlus } from 'lucide-react';
import Card from '../common/Card';
import UserAvatar from '../common/UserAvatar';
import useAuth from '../../hooks/useAuth';
import { userAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import useToast from '../../hooks/useToast';
import GameScreenLoader from '../settings/GameScreenLoader';

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: calc(100vh - 250px);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--textPrimary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  max-width: 280px;
  width: 100%;
  margin-left: auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border-radius: 1.5rem;
  border: 1px solid var(--borderColor);
  background-color: var(--inputBackground);
  color: var(--textPrimary);
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--textSecondary);
  display: flex;
  align-items: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const StatItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0.5rem;
  border-radius: 8px;
  background-color: ${props => props.active ? 'var(--primary)' : 'var(--backgroundLight)'};
  color: ${props => props.active ? 'white' : 'var(--textPrimary)'};
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primaryDark)' : 'rgba(var(--primary-rgb), 0.1)'};
  }
  
  svg {
    color: ${props => props.active ? 'white' : 'var(--primary)'};
    margin-bottom: 0.5rem;
  }
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${props => props.active ? 'rgba(255, 255, 255, 0.9)' : 'var(--textSecondary)'};
  margin-top: 0.25rem;
`;

const ContentPanel = styled(Card)`
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TabContent = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: var(--backgroundLight);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(var(--primary-rgb), 0.05);
    transform: translateY(-2px);
  }
`;

const UserInfo = styled.div`
  flex: 1;
  margin-left: 1rem;
  
  h4 {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--textPrimary);
    margin: 0;
  }
  
  p {
    font-size: 0.8rem;
    color: var(--textSecondary);
    margin: 0.25rem 0 0 0;
  }
`;

const UserActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: none;
  background-color: ${props => 
    props.$primary 
      ? 'var(--primary)' 
      : props.$danger 
        ? 'var(--dangerLight)'
        : 'transparent'
  };
  color: ${props => 
    props.$primary 
      ? 'white' 
      : props.$danger 
        ? 'var(--danger)'
        : 'var(--textSecondary)'
  };
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => 
      props.$primary 
        ? 'var(--primaryDark)' 
        : props.$danger 
          ? 'var(--danger)'
          : 'rgba(var(--primary-rgb), 0.1)'
    };
    color: ${props => 
      props.$primary 
        ? 'white' 
        : props.$danger 
          ? 'white'
          : 'var(--primary)'
    };
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  flex: 1;
  
  svg {
    color: var(--textSecondary);
    opacity: 0.5;
    margin-bottom: 1rem;
    width: 48px;
    height: 48px;
  }
  
  h3 {
    font-size: 1.1rem;
    color: var(--textPrimary);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--textSecondary);
    font-size: 0.9rem;
    max-width: 400px;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  background-color: ${props => props.active ? 'var(--primary)' : 'var(--cardBackground)'};
  color: ${props => props.active ? 'white' : 'var(--textSecondary)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'var(--borderColor)'};
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? 'var(--primaryDark)' : 'var(--backgroundLight)'};
  }
`;

// Enum for tab values
const TABS = {
  ACTIVITY: 'activity',
  FOLLOWERS: 'followers',
  FOLLOWING: 'following'
};

// Activity component that shows recent activities (coming soon)
const ActivitiesList = () => {
  return (
    <ContentPanel>
      <TabContent>
        <SectionHeader>
          <h3>
            <Activity size={18} />
            Recent Activity
          </h3>
        </SectionHeader>
        
        <EmptyState>
          <Clock size={36} />
          <h3>Coming Soon</h3>
          <p>Activity tracking will be available in a future update</p>
        </EmptyState>
      </TabContent>
    </ContentPanel>
  );
};

// User list component for followers/following
const UserListComponent = ({ 
  title, 
  icon, 
  emptyTitle, 
  emptyMessage, 
  users, 
  isLoading, 
  searchQuery, 
  setSearchQuery, 
  pagination, 
  page, 
  setPage, 
  handleFollowToggle,
  showFollowAction,
  currentUserId,
}) => {
  // Function to filter users based on search query
  const filterUsers = (users) => {
    if (!searchQuery) return users;
    return users.filter(user => {
      const displayName = user.displayName || user.username || '';
      const username = user.username || '';
      
      return displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        username.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };
  
  // Generate an array of page numbers for pagination
  const getPageNumbers = () => {
    const { page, pages } = pagination;
    let pageNumbers = [];
    
    if (pages <= 5) {
      // If 5 or fewer pages, show all
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate range around current page
      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(pages - 1, page + 1);
      
      // Adjust if at the beginning or end
      if (page <= 2) {
        endPage = 4;
      } else if (page >= pages - 1) {
        startPage = pages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add pages in range
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < pages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      pageNumbers.push(pages);
    }
    
    return pageNumbers;
  };
  
  const filteredUsers = filterUsers(users);

  return (
    <ContentPanel>
      <TabContent>
        <SectionHeader>
          <h3>
            {icon}
            {title}
          </h3>
          
          <SearchContainer>
            <SearchInput 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon>
              <Search size={16} />
            </SearchIcon>
          </SearchContainer>
        </SectionHeader>
        
        {isLoading ? (
          <GameScreenLoader text="" />
        ) : filteredUsers.length > 0 ? (
          <>
            <UserList>
              {filteredUsers.map((person) => (
                <UserItem key={person._id}>
                  <Link to={`/user/${person.username}`}>
                    <UserAvatar 
                      src={person.avatarUrl} 
                      alt={person.displayName || person.username}
                      size={45}
                    />
                  </Link>
                  
                  <UserInfo>
                    <h4>{person.displayName || person.username}</h4>
                    {person.username && person.displayName && (
                      <p>@{person.username}</p>
                    )}
                  </UserInfo>
                  
                  <UserActions>
                    {showFollowAction && person._id !== currentUserId && !person.isFollowing && (
                      <ActionButton
                        $primary={true}
                        onClick={() => handleFollowToggle(person._id, person.isFollowing)}
                      >
                        {person.isFollowing ? "Unfollow" : "Follow Back"}
                      </ActionButton>
                    )}
                    {showFollowAction && person._id !== currentUserId && person.isFollowing && (
                      <ActionButton
                        $danger={true}
                        onClick={() => handleFollowToggle(person._id, person.isFollowing)}
                      >
                        Unfollow
                      </ActionButton>
                    )}
                    <Link to={`/user/${person.username}`}>
                      <ActionButton title="View profile">
                        View
                      </ActionButton>
                    </Link>
                  </UserActions>
                </UserItem>
              ))}
            </UserList>
            
            {pagination.pages > 1 && (
              <PaginationContainer>
                <PageButton 
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  Prev
                </PageButton>
                
                {getPageNumbers().map((pageNum, index) => (
                  <React.Fragment key={index}>
                    {pageNum === '...' ? (
                      <span style={{ alignSelf: 'center' }}>...</span>
                    ) : (
                      <PageButton 
                        active={page === pageNum}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </PageButton>
                    )}
                  </React.Fragment>
                ))}
                
                <PageButton 
                  onClick={() => setPage(prev => Math.min(prev + 1, pagination.pages))}
                  disabled={page === pagination.pages}
                >
                  Next
                </PageButton>
              </PaginationContainer>
            )}
          </>
        ) : (
          <EmptyState>
            <Users size={36} />
            <h3>{emptyTitle}</h3>
            <p>{emptyMessage}</p>
          </EmptyState>
        )}
      </TabContent>
    </ContentPanel>
  );
};

const AvtivityPage = () => {
  const { user,stats, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(TABS.ACTIVITY);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  // User data
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  
  // Tab loading states
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  
  // Fetch tab data on tab change
  useEffect(() => {
    setPage(1); // Reset to first page on tab change
    if (activeTab === TABS.FOLLOWERS) {
      fetchFollowers(1);
    } else if (activeTab === TABS.FOLLOWING) {
      fetchFollowing(1);
    }
  }, [activeTab]);

  // Fetch data on page change
  useEffect(() => {
    if (activeTab === TABS.FOLLOWERS) {
      fetchFollowers(page);
    } else if (activeTab === TABS.FOLLOWING) {
      fetchFollowing(page);
    }
  }, [page]);
  
  // Fetch followers
  const fetchFollowers = async (pageNum = page) => {
    if (!user) return;
    setFollowersLoading(true);
    try {
      const response = await userAPI.getFollowers(user._id, pageNum, 10);
      if (response.success) {
        const followersArray = Array.isArray(response.data) ? response.data : [];
        // Use isFollowing from API response directly
        setFollowers(followersArray);
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 1
        });
      } else {
        showToast({
          type: 'error',
          message: 'Failed to load followers'
        });
        setFollowers([]);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
      showToast({
        type: 'error',
        message: 'Error loading followers'
      });
      setFollowers([]);
    } finally {
      setFollowersLoading(false);
    }
  };
  
  // Fetch following
  const fetchFollowing = async (pageNum = page) => {
    if (!user) return;
    setFollowingLoading(true);
    try {
      const response = await userAPI.getFollowing(user._id, pageNum, 10);
      if (response.success) {
        const followingArray = Array.isArray(response.data) ? response.data : [];
        // Use isFollowing from API response directly
        setFollowing(followingArray);
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 1
        });
      } else {
        showToast({
          type: 'error',
          message: 'Failed to load following users'
        });
        setFollowing([]);
      }
    } catch (error) {
      console.error('Error fetching following users:', error);
      showToast({
        type: 'error',
        message: 'Error loading following users'
      });
      setFollowing([]);
    } finally {
      setFollowingLoading(false);
    }
  };
  
  // Handle follow/unfollow user
// Handle follow/unfollow user
const handleFollowToggle = async (userId, isFollowing) => {
  if (!user) return;
  try {
    setFollowersLoading(true);
    setFollowingLoading(true);
    
    // Create a promise that resolves after 2 seconds
    const delay = new Promise(resolve => setTimeout(resolve, 2000));
    
    let response;
    if (isFollowing) {
      response = await userAPI.unfollowUser(userId);
    } else {
      response = await userAPI.followUser(userId);
    }
    // Wait for both the API response and the 2-second delay to complete
    await delay;
        
    if (response.success) {
      // Only refetch the current list
      if (activeTab === TABS.FOLLOWERS) {
        await fetchFollowers(page);
      } else if (activeTab === TABS.FOLLOWING) {
        await fetchFollowing(page);
      }

      await refreshUser(true);

      showToast({
        type: 'success',
        message: isFollowing ? 'Unfollowed user successfully' : 'Now following user'
      });
    } else {
      throw new Error(response.message || 'Failed to update follow status');
    }
  } catch (error) {
    showToast({
      type: 'error',
      message: error.message || 'Error updating follow status'
    });
  } finally {
    setFollowersLoading(false);
    setFollowingLoading(false);
  }
};
  
  return (
    <Container>
      <StatsGrid>
        <StatItem 
          active={activeTab === TABS.ACTIVITY} 
          onClick={() => setActiveTab(TABS.ACTIVITY)}
        >
          <Activity size={20} />
          <StatValue>Activity</StatValue>
          <StatLabel active={activeTab === TABS.ACTIVITY}>Timeline</StatLabel>
        </StatItem>
        
        <StatItem 
          active={activeTab === TABS.FOLLOWERS} 
          onClick={() => setActiveTab(TABS.FOLLOWERS)}
        >
          <Users size={20} />
          <StatValue>{stats?.followersCount ?? 0}</StatValue>
          <StatLabel active={activeTab === TABS.FOLLOWERS}>Followers</StatLabel>
        </StatItem>
        
        <StatItem 
          active={activeTab === TABS.FOLLOWING} 
          onClick={() => setActiveTab(TABS.FOLLOWING)}
        >
          <UserPlus size={20} />
          <StatValue>{stats?.followingCount ?? 0}</StatValue>
          <StatLabel active={activeTab === TABS.FOLLOWING}>Following</StatLabel>
        </StatItem>
      </StatsGrid>
      
      {activeTab === TABS.ACTIVITY && <ActivitiesList />}
      
      {activeTab === TABS.FOLLOWERS && (
        <UserListComponent
          title={`My Followers (${stats?.followersCount ?? 0})`}
          icon={<Users size={18} />}
          emptyTitle="No followers yet"
          emptyMessage="When people follow you, they'll appear here"
          users={followers}
          isLoading={followersLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          pagination={pagination}
          page={page}
          setPage={setPage}
          handleFollowToggle={handleFollowToggle}
          showFollowAction={true}
          currentUserId={user?._id}
        />
      )}
      
      {activeTab === TABS.FOLLOWING && (
        <UserListComponent
          title={`People I Follow (${stats?.followingCount ?? 0})`}
          icon={<UserPlus size={18} />}
          emptyTitle="You're not following anyone yet"
          emptyMessage="When you follow others, they'll appear here"
          users={following}
          isLoading={followingLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          pagination={pagination}
          page={page}
          setPage={setPage}
          handleFollowToggle={handleFollowToggle}
          showFollowAction={true}
          currentUserId={user?._id}
        />
      )}
    </Container>
  );
};

export default AvtivityPage; 