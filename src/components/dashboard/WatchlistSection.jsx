import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Edit2, Trash2, ArrowUp, ArrowDown, Eye, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { watchlistAPI } from '../../services/api';
import WatchStatusBadge from '../common/WatchStatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import WatchlistFilter from './WatchlistFilter';
import CustomSelect from '../common/CustomSelect';

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--borderColor);
  margin-bottom: 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  gap: 0.5rem;
  padding-bottom: 0.25rem;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.button`
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  border-radius: 6px 6px 0 0;
  border-bottom: 3px solid ${props => props.active ? 'var(--tertiary)' : 'transparent'};
  color: ${props => props.active ? 'var(--tertiary)' : 'var(--textSecondary)'};
  font-weight: ${props => props.active ? '600' : '400'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  
  &:hover {
    color: var(--tertiary);
    background-color: rgba(var(--tertiary-rgb), 0.05);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 3px;
    background-color: ${props => props.active ? 'transparent' : 'var(--tertiary)'};
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: ${props => props.active ? '0' : '100%'};
  }
`;

const TabCount = styled.span`
  background-color: ${props => props.active ? 'var(--tertiary)' : 'var(--backgroundLight)'};
  color: ${props => props.active ? 'white' : 'var(--textSecondary)'};
  font-size: 0.7rem;
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
  min-width: 1.5rem;
  text-align: center;
  font-weight: 500;
  box-shadow: ${props => props.active ? '0 2px 4px rgba(var(--tertiary-rgb), 0.2)' : 'none'};
  transition: all 0.2s ease;
  
  ${Tab}:hover & {
    background-color: ${props => props.active ? 'var(--tertiary)' : 'rgba(var(--tertiary-rgb), 0.1)'};
  }
`;

const ControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.5rem;
  background-color: var(--backgroundLight);
  border-radius: 8px;
`;

const SortControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid var(--borderColor);
  background-color: var(--inputBackground);
  color: var(--textPrimary);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--tertiary);
    color: var(--tertiary);
    background-color: rgba(var(--tertiary-rgb), 0.05);
    transform: translateY(-2px);
  }
`;

const AnimeTable = styled.div`
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--borderColor);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const AnimeRow = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1.25rem;
  background-color: var(--cardBackground);
  border-bottom: 1px solid var(--borderColor);
  transition: all 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: var(--backgroundLight);
    transform: translateX(2px);
  }
`;

const AnimeImage = styled.img`
  width: 50px;
  height: 70px;
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  
  ${AnimeRow}:hover & {
    transform: scale(1.05);
  }
`;

const PlaceholderImage = styled.div`
  width: 50px;
  height: 70px;
  border-radius: 6px;
  background-color: var(--borderColor);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--textSecondary);
  font-size: 0.7rem;
  text-align: center;
`;

const AnimeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AnimeTitle = styled.h4`
  font-size: 1rem;
  font-weight: 500;
  color: var(--textPrimary);
  margin: 0;
  transition: color 0.2s ease;
  
  ${AnimeRow}:hover & {
    color: var(--tertiary);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--borderColor);
  background-color: var(--cardBackground);
  color: var(--textSecondary);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.danger ? 'var(--danger)' : 'var(--tertiary)'};
    border-color: ${props => props.danger ? 'var(--danger)' : 'var(--tertiary)'};
    background-color: ${props => props.danger ? 'rgba(var(--danger-rgb), 0.05)' : 'rgba(var(--tertiary-rgb), 0.05)'};
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
  color: var(--textSecondary);
  background-color: var(--backgroundLight);
  border-radius: 10px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--tertiary);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  margin-top: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(var(--tertiary-rgb), 0.3);
  
  &:hover {
    background-color: var(--tertiaryLight);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(var(--tertiary-rgb), 0.4);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
`;

const ErrorMessage = styled.div`
  color: var(--danger);
  text-align: center;
  padding: 1.25rem;
  background-color: rgba(var(--danger-rgb), 0.1);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const statuses = [
  { id: 'watching', label: 'Watching' },
  { id: 'completed', label: 'Completed' },
  { id: 'on_hold', label: 'On Hold' },
  { id: 'dropped', label: 'Dropped' },
  { id: 'plan_to_watch', label: 'Plan to Watch' },
];

const WatchlistTabs = ({ activeTab, counts, handleTabChange }) => (
  <TabsContainer>
    <Tab 
      active={activeTab === 'all'} 
      onClick={() => handleTabChange('all')}
    >
      All
      <TabCount active={activeTab === 'all'}>
        {counts.all || 0}
      </TabCount>
    </Tab>
    
    {statuses.map(status => (
      <Tab 
        key={status.id}
        active={activeTab === status.id} 
        onClick={() => handleTabChange(status.id)}
      >
        {status.label}
        <TabCount active={activeTab === status.id}>
          {counts[status.id] || 0}
        </TabCount>
      </Tab>
    ))}
  </TabsContainer>
);

const SortingControls = ({ sortBy, sortOrder, handleSortChange, toggleSortOrder }) => (
  <SortControls>
    <CustomSelect
      options={[
        { value: 'title', label: 'Title' },
        { value: 'rating', label: 'Rating' },
        { value: 'date_added', label: 'Date Added' },
        { value: 'last_updated', label: 'Last Updated' }
      ]}
      value={sortBy}
      onChange={handleSortChange}
      minWidth="160px"
    />
    
    <SortButton onClick={toggleSortOrder}>
      {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
    </SortButton>
  </SortControls>
);

const AnimeItem = ({ item, handleEditAnime }) => {
  // The API might return anime as a nested object or directly in the item
  const anime = item.anime || item;
  
  const getImageUrl = () => {
    // Handle different possible image structures
    if (anime.images?.jpg?.image_url) return anime.images.jpg.image_url;
    if (anime.images?.jpg?.imageUrl) return anime.images.jpg.imageUrl;
    if (anime.images?.webp?.image_url) return anime.images.webp.image_url;
    if (anime.images?.webp?.imageUrl) return anime.images.webp.imageUrl;
    if (anime.imageUrl) return anime.imageUrl;
    
    return null;
  };
  
  const getTitle = () => {
    // Handle different possible title structures
    if (anime.titles?.english) return anime.titles.english;
    if (anime.titles?.default) return anime.titles.default;
    if (anime.title) return anime.title;
    
    return "Unknown Anime";
  };
  
  return (
    <AnimeRow>
      {getImageUrl() ? (
        <AnimeImage src={getImageUrl()} alt={getTitle()} />
      ) : (
        <PlaceholderImage>No Image</PlaceholderImage>
      )}
      
      <AnimeInfo>
        <AnimeTitle>{getTitle()}</AnimeTitle>
        <WatchStatusBadge status={item.status} />
      </AnimeInfo>
      
      <ActionButtons>
        <ActionButton onClick={() => handleEditAnime(item)}>
          <Edit2 size={16} />
        </ActionButton>
      </ActionButtons>
    </AnimeRow>
  );
};

const EmptyWatchlist = ({ navigate }) => (
  <EmptyState>
    <Eye size={48} color="var(--textSecondary)" />
    <p>Your watchlist is empty for this status.</p>
    <AddButton onClick={() => navigate('/schedule')}>
      <Plus size={16} />
      Add Anime
    </AddButton>
  </EmptyState>
);

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background-color: var(--cardBackground);
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--borderColor);
`;

const ModalTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--textSecondary);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--inputBackground);
    color: var(--textPrimary);
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ModalFooter = styled.div`
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--borderColor);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: var(--textPrimary);
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--borderColor);
  border-radius: 8px;
  background-color: var(--inputBackground);
  color: var(--textPrimary);
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--tertiary);
    box-shadow: 0 0 0 2px rgba(var(--tertiary-rgb), 0.1);
  }
  
  &:hover {
    border-color: var(--tertiary);
  }
`;

const CancelButton = styled.button`
  background-color: var(--cardBackground);
  color: var(--textPrimary);
  border: 1px solid var(--borderColor);
  border-radius: 8px;
  padding: 0.875rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--backgroundLight);
    transform: translateY(-2px);
  }
`;

const SaveButton = styled.button`
  background-color: var(--tertiary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(var(--tertiary-rgb), 0.2);
  
  &:hover {
    background-color: var(--tertiaryLight);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(var(--tertiary-rgb), 0.3);
  }
  
  &:disabled {
    background-color: var(--textSecondary);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const DeleteButton = styled.button`
  background-color: var(--danger);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: auto;
  
  &:hover {
    background-color: var(--dangerDark);
    transform: translateY(-2px);
  }
`;

const ConfirmDeleteModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 101;
  padding: 1rem;
`;

const ConfirmDeleteContent = styled.div`
  background-color: var(--cardBackground);
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  padding: 1.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  
  h3 {
    margin-top: 0;
    color: var(--danger);
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
`;

const EditAnimeModal = ({ 
  isOpen, 
  currentAnime, 
  formData, 
  loading, 
  handleChange, 
  handleSave, 
  handleClose, 
  promptDelete 
}) => {
  if (!isOpen || !currentAnime) return null;
  
  const getAnimeTitle = () => {
    const anime = currentAnime.anime || currentAnime;
    
    if (anime.titles?.english) return anime.titles.english;
    if (anime.titles?.default) return anime.titles.default;
    if (anime.title) return anime.title;
    
    return "Unknown Anime";
  };
  
  return (
    <Modal show={isOpen}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            {getAnimeTitle()}
          </ModalTitle>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <FormGroup>
            <Label htmlFor="status">Status</Label>
            <Select 
              id="status" 
              name="status" 
              value={formData.status}
              onChange={handleChange}
            >
              {statuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </Select>
          </FormGroup>
        </ModalBody>
        
        <ModalFooter>
          <DeleteButton onClick={promptDelete}>
            <Trash2 size={16} />
            Remove
          </DeleteButton>
          
          <CancelButton onClick={handleClose}>
            Cancel
          </CancelButton>
          
          <SaveButton onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </SaveButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const DeleteConfirmationModal = ({ 
  isOpen, 
  animeTitle, 
  loading, 
  handleDelete, 
  handleClose 
}) => (
  <ConfirmDeleteModal show={isOpen}>
    <ConfirmDeleteContent>
      <h3>Remove from Watchlist?</h3>
      <p>
        Are you sure you want to remove <strong>{animeTitle}</strong> from your watchlist?
      </p>
      <ModalFooter>
        <CancelButton onClick={handleClose}>
          Cancel
        </CancelButton>
        <DeleteButton onClick={handleDelete} disabled={loading}>
          {loading ? 'Removing...' : 'Remove'}
        </DeleteButton>
      </ModalFooter>
    </ConfirmDeleteContent>
  </ConfirmDeleteModal>
);

const WatchlistSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [watchlistData, setWatchlistData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentAnime, setCurrentAnime] = useState(null);
  const [formData, setFormData] = useState({
    status: 'watching',
    progress: 0,
    score: 0,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [counts, setCounts] = useState({
    all: 0,
    watching: 0,
    completed: 0,
    on_hold: 0,
    dropped: 0,
    plan_to_watch: 0,
  });
  
  // State for filters and sorting
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: '',
    genres: [],
    sort: 'last_updated',
    season: '',
  });
  const [sortBy, setSortBy] = useState('last_updated');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchWatchlist();
  }, []);
  
  useEffect(() => {
    // Apply filtering and sorting whenever the filters, activeTab or watchlistData change
    const filtered = filterWatchlist(watchlistData, activeTab);
    const sorted = sortWatchlist(filtered);
    setFilteredData(sorted);
  }, [activeTab, watchlistData, filters, sortBy, sortOrder]);
  
  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      // API returns a nested structure: { success, data: { watchlist, counts, pagination } }
      const response = await watchlistAPI.getWatchlist();
      
      if (response && response.success && response.data) {
        // Extract the watchlist array from the response
        const watchlist = response.data.watchlist || [];
        setWatchlistData(watchlist);
        
        // Use the counts directly from the API response
        const apiCounts = response.data.counts || {
          watching: 0,
          completed: 0,
          plan_to_watch: 0,
          on_hold: 0,
          dropped: 0,
          total: 0
        };
        
        setCounts({
          all: apiCounts.total || 0,
          watching: apiCounts.watching || 0,
          completed: apiCounts.completed || 0,
          on_hold: apiCounts.on_hold || 0,
          dropped: apiCounts.dropped || 0,
          plan_to_watch: apiCounts.plan_to_watch || 0
        });
      } else {
        // Handle unexpected response structure
        setWatchlistData([]);
        setCounts({
          all: 0,
          watching: 0,
          completed: 0,
          on_hold: 0,
          dropped: 0,
          plan_to_watch: 0
        });
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      // Set empty data on error
      setWatchlistData([]);
      setCounts({
        all: 0,
        watching: 0,
        completed: 0,
        on_hold: 0,
        dropped: 0,
        plan_to_watch: 0
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filterWatchlist = (list, tab) => {
    // Ensure list is an array before processing
    if (!list || !Array.isArray(list) || list.length === 0) return [];
    
    // First, filter by tab (status)
    let filtered = tab === 'all' 
      ? [...list] 
      : list.filter(item => item.status === tab);
    
    // Then apply additional filters
    // 1. Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const title = item.anime?.title || item.title || '';
        const alternativeTitles = item.anime?.titles || item.alternativeTitles || [];
        
        if (title.toLowerCase().includes(searchLower)) return true;
        
        // Check alternative titles if they exist
        if (Array.isArray(alternativeTitles)) {
          return alternativeTitles.some(altTitle => {
            if (typeof altTitle === 'string') {
              return altTitle.toLowerCase().includes(searchLower);
            } else if (altTitle && typeof altTitle === 'object') {
              // Handle object format like { english: "Title", japanese: "タイトル" }
              return Object.values(altTitle).some(value => 
                typeof value === 'string' && value.toLowerCase().includes(searchLower)
              );
            }
            return false;
          });
        } else if (alternativeTitles && typeof alternativeTitles === 'object') {
          // Handle object format like { english: "Title", japanese: "タイトル" }
          return Object.values(alternativeTitles).some(value => 
            typeof value === 'string' && value.toLowerCase().includes(searchLower)
          );
        }
        
        return false;
      });
    }
    
    // 2. Filter by status (if we're on 'all' tab and status filter is set)
    if (tab === 'all' && filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    // 3. Filter by genres
    if (filters.genres && filters.genres.length > 0) {
      filtered = filtered.filter(item => {
        const genres = item.anime?.genres || item.genres || [];
        if (!genres || !Array.isArray(genres) || genres.length === 0) return false;
        
        return genres.some(genre => {
          const genreName = typeof genre === 'string' ? genre : (genre.name || '');
          return filters.genres.includes(genreName.toLowerCase());
        });
      });
    }
    
    // 4. Filter by season
    if (filters.season) {
      filtered = filtered.filter(item => {
        const season = item.anime?.season || item.season || '';
        return season.toLowerCase() === filters.season;
      });
    }
    
    return filtered;
  };
  
  const sortWatchlist = (list) => {
    // Ensure list is an array before sorting
    if (!list || !Array.isArray(list) || list.length === 0) return [];
    
    return [...list].sort((a, b) => {
      let valueA, valueB;
      
      // Get values for sorting based on sort field
      switch (sortBy) {
        case 'title':
          valueA = (a.anime?.title || a.title || '').toLowerCase();
          valueB = (b.anime?.title || b.title || '').toLowerCase();
          break;
        case 'rating':
        case 'score':
          valueA = a.score || 0;
          valueB = b.score || 0;
          break;
        case 'progress':
          valueA = a.progress || 0;
          valueB = b.progress || 0;
          break;
        case 'date_added':
          valueA = new Date(a.added_at || a.createdAt || 0).getTime();
          valueB = new Date(b.added_at || b.createdAt || 0).getTime();
          break;
        case 'last_updated':
        default:
          valueA = new Date(a.updated_at || a.updatedAt || 0).getTime();
          valueB = new Date(b.updated_at || b.updatedAt || 0).getTime();
          break;
      }
      
      // Sort in ascending or descending order
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleSortChange = (value) => {
    setSortBy(value);
  };
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  const handleEditAnime = (anime) => {
    setCurrentAnime(anime);
    setFormData({
      status: anime.status,
      progress: anime.progress,
      score: anime.score,
      notes: anime.notes || '',
    });
    setEditModalOpen(true);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    if (!currentAnime) return;
    
    setSaving(true);
    try {
      const updatedAnime = {
        ...currentAnime,
        status: formData.status,
        progress: parseInt(formData.progress, 10),
        score: parseFloat(formData.score),
        notes: formData.notes,
        updated_at: new Date().toISOString(),
      };
      
      // In a real app, this would call your API
      await watchlistAPI.updateAnime(updatedAnime.id, updatedAnime);
      
      // Update local state
      setWatchlistData(prev => 
        prev.map(item => item.id === updatedAnime.id ? updatedAnime : item)
      );
      
      // Update counts if status changed
      if (updatedAnime.status !== currentAnime.status) {
        setCounts(prev => ({
          ...prev,
          [currentAnime.status]: prev[currentAnime.status] - 1,
          [updatedAnime.status]: prev[updatedAnime.status] + 1,
        }));
      }
      
      closeEditModal();
    } catch (error) {
      console.error('Error updating anime:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const promptDelete = () => {
    setDeleteModalOpen(true);
  };
  
  const handleDelete = async () => {
    if (!currentAnime) return;
    
    setDeleting(true);
    try {
      // In a real app, this would call your API
      await watchlistAPI.removeAnime(currentAnime.id);
      
      // Update local state
      setWatchlistData(prev => prev.filter(item => item.id !== currentAnime.id));
      
      // Update counts
      setCounts(prev => ({
        ...prev,
        all: prev.all - 1,
        [currentAnime.status]: prev[currentAnime.status] - 1,
      }));
      
      closeDeleteModal();
      closeEditModal();
    } catch (error) {
      console.error('Error deleting anime:', error);
    } finally {
      setDeleting(false);
    }
  };
  
  const getAnimeTitle = () => {
    return currentAnime ? currentAnime.title : '';
  };
  
  const closeEditModal = () => setEditModalOpen(false);
  const closeDeleteModal = () => setDeleteModalOpen(false);
  
  if (loading && watchlistData.length === 0) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <LoadingSpinner size={40} />
      </div>
    );
  }
  
  return (
    <>
      <WatchlistTabs 
        activeTab={activeTab} 
        counts={counts} 
        handleTabChange={handleTabChange} 
      />
        
        <ControlsRow>
        <WatchlistFilter 
          filters={filters}
          onChange={handleFilterChange}
        />
        
        <SortingControls 
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSortChange={handleSortChange}
          toggleSortOrder={toggleSortOrder}
        />
        </ControlsRow>
        
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: '1rem 0' }}
          >
            <LoadingSpinner size={30} />
          </motion.div>
        ) : filteredData.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyWatchlist navigate={navigate} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
          <AnimeTable>
              {filteredData.map(item => (
                <AnimeItem
                  key={item.id}
                  item={item}
                  handleEditAnime={handleEditAnime}
                />
            ))}
          </AnimeTable>
          </motion.div>
        )}
      </AnimatePresence>
      
      <EditAnimeModal
        isOpen={editModalOpen}
        currentAnime={currentAnime}
        formData={formData}
        loading={saving}
        handleChange={handleChange}
        handleSave={handleSave}
        handleClose={closeEditModal}
        promptDelete={promptDelete}
      />
      
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        animeTitle={getAnimeTitle()}
        loading={deleting}
        handleDelete={handleDelete}
        handleClose={closeDeleteModal}
      />
    </>
  );
};

export default WatchlistSection; 