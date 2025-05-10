import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ArrowUp, ArrowDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { watchlistAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import WatchlistFilter from './WatchlistFilter';
import WatchlistTabs, { STATUSES } from './WatchlistTabs';
import SortingControls from './SortingControls';
import WatchlistAnimeItem from './WatchlistAnimeItem';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import EmptyWatchlist from './EmptyWatchlist';
import useToast from '../../hooks/useToast';

// Styled components
const WatchlistContainer = styled.div`
  padding: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
  position: relative; /* Create a stacking context */
  width: 100%;
  height: 100%;
  overflow: visible !important; /* Ensure content can flow beyond container */
  z-index: 1; /* Base z-index */
`;

const ControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const AnimeList = styled.div`
  background-color: var(--cardBackground);
  border-radius: 12px;
  border: 1px solid var(--borderColor);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  position: relative; /* Create a new stacking context */
  isolation: isolate; /* Further isolate the stacking context */
  max-height: unset; /* Remove any max height constraints */
  overflow: visible !important; /* Ensure content can flow beyond container */
  z-index: 1; /* Base z-index */
  transform-style: preserve-3d; /* Ensure dropdowns can display properly */
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

const WatchlistSection = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // State
  const [watchlistData, setWatchlistData] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('last_updated');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({
    search: '',
    genres: [],
    seasons: [],
    years: []
  });
  const [counts, setCounts] = useState({
    all: 0,
    watching: 0,
    completed: 0,
    on_hold: 0,
    dropped: 0,
    plan_to_watch: 0
  });
  const [currentAnime, setCurrentAnime] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch watchlist data
  const fetchWatchlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await watchlistAPI.getWatchlist();

      if (response && response.success) {
        // Ensure data is an array, handle different API response structures
        const watchlistData = Array.isArray(response.data)
          ? response.data
          : (response.data?.watchlist || []);

        setWatchlistData(watchlistData);

        // Calculate counts
        const newCounts = {
          all: watchlistData.length || 0,
        };

        // Count items for each status
        STATUSES.forEach(status => {
          newCounts[status.id] = watchlistData.filter(item => item.status === status.id).length;
        });

        setCounts(newCounts);
      } else {
        setError('Failed to load watchlist');
        setWatchlistData([]); // Set empty array on error
      }
    } catch (err) {
      console.error('Error fetching watchlist:', err);
      setError('Failed to load watchlist. Please try again later.');
      setWatchlistData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Handle filter change
  const handleFilterChange = (filterData) => {
    setFilters(filterData);
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
  };

  // Toggle sort order
  const handleSortOrderToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Handle anime status change
  const handleStatusChange = async (anime, newStatus) => {
    const statusLabel = STATUSES.find(s => s.id === newStatus)?.label || newStatus;
    const updateData = {
      animeId: anime.animeId.toString(),
      status: newStatus,
    };

    try {
      // Send the update to the API
      const response = await watchlistAPI.addOrUpdateAnime(updateData);

      if (response && response.success) {
        // Update local state
        setWatchlistData(prev => {
          return prev.map(item => {
            if (item.animeId === anime.animeId) {
              return { ...anime, status: newStatus };
            }
            return item;
          });
        });

        // Update counts if status changed
        if (anime.status !== newStatus) {
          setCounts(prev => ({
            ...prev,
            [anime.status]: Math.max(0, prev[anime.status] - 1),
            [newStatus]: prev[newStatus] + 1,
          }));
        }

        // Show success toast
        showToast({
          type: 'success',
          message: `Updated to ${statusLabel}`,
        });
      } else {
        // Show error toast for unsuccessful response
        showToast({
          type: 'error',
          message: 'Failed to update anime status',
        });
      }
    } catch (error) {
      console.error('Error updating anime status:', error);
      // Show error toast
      showToast({
        type: 'error',
        message: 'Error updating anime status. Please try again.',
      });
    }
  };

  // Delete anime from watchlist
  const openDeleteModal = (anime) => {
    setCurrentAnime(anime);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setCurrentAnime(null);
  };

  const handleDelete = async () => {
    if (!currentAnime) return;

    setDeleting(true);
    try {
      // Call the API to remove the anime from watchlist
      const response = await watchlistAPI.removeFromWatchlist(currentAnime.animeId);

      if (response && response.success) {
        // Update local state by removing the deleted anime
        setWatchlistData(prev =>
          prev.filter(item => item.animeId !== currentAnime.animeId)
        );

        // Update counts
        setCounts(prev => ({
          ...prev,
          all: Math.max(0, prev.all - 1),
          [currentAnime.status]: Math.max(0, prev[currentAnime.status] - 1),
        }));

        // Show success toast
        showToast({
          type: 'success',
          message: 'Anime removed from your watchlist'
        });

        // Close modal
        closeDeleteModal();
      } else {
        console.error('API response was not successful:', response);
        // Show error toast
        showToast({
          type: 'error',
          message: 'Failed to remove anime from watchlist'
        });
      }
    } catch (error) {
      console.error('Error deleting anime:', error);
      // Show error toast
      showToast({
        type: 'error',
        message: 'Error occurred while deleting. Please try again.'
      });
    } finally {
      setDeleting(false);
    }
  };

  // Filter and sort the watchlist data
  const getFilteredAnimeList = () => {
    // Create a copy of the array to avoid modifying the original
    let filteredList = [...watchlistData];

    // First filter by tab (status)
    if (activeTab !== 'all') {
      filteredList = filteredList.filter(anime => anime.status === activeTab);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredList = filteredList.filter(anime => {
        const animeData = anime.anime || anime;
        const title = animeData.titles?.english || animeData.titles?.default || animeData.title || '';
        return title.toLowerCase().includes(searchLower);
      });
    }

    // Apply genre filter
    if (filters.genres && filters.genres.length > 0) {
      filteredList = filteredList.filter(anime => {
        const animeData = anime.anime || anime;
        if (!animeData.genres || animeData.genres.length === 0) return false;

        const animeGenres = animeData.genres.map(g =>
          typeof g === 'string' ? g.toLowerCase() : g.name.toLowerCase()
        );

        return filters.genres.some(g => animeGenres.includes(g.toLowerCase()));
      });
    }

    // Apply season filter
    if (filters.seasons && filters.seasons.length > 0) {
      filteredList = filteredList.filter(anime => {
        const animeData = anime.anime || anime;
        if (!animeData.season) return false;
        return filters.seasons.includes(animeData.season.toLowerCase());
      });
    }

    // Apply year filter
    if (filters.years && filters.years.length > 0) {
      filteredList = filteredList.filter(anime => {
        const animeData = anime.anime || anime;
        if (!animeData.year) return false;
        return filters.years.includes(animeData.year.toString());
      });
    }

    // Only sort if filteredList is an array with items
    if (Array.isArray(filteredList) && filteredList.length > 0) {
      // Sort the list
      return filteredList.sort((a, b) => {
        const aData = a.anime || a;
        const bData = b.anime || b;

        let valueA, valueB;

        switch (sortBy) {
          case 'title':
            valueA = aData.titles?.english || aData.titles?.default || aData.title || '';
            valueB = bData.titles?.english || bData.titles?.default || bData.title || '';
            break;
          case 'rating':
            valueA = a.rating || 0;
            valueB = b.rating || 0;
            break;
          case 'date_added':
            valueA = new Date(a.createdAt || 0).getTime();
            valueB = new Date(b.createdAt || 0).getTime();
            break;
          case 'last_updated':
          default:
            valueA = new Date(a.updatedAt || 0).getTime();
            valueB = new Date(b.updatedAt || 0).getTime();
        }

        if (sortOrder === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    }

    return filteredList;
  };

  const filteredAnimeList = getFilteredAnimeList();

  return (
    <WatchlistContainer>
      <WatchlistTabs
        activeTab={activeTab}
        counts={counts}
        onTabChange={handleTabChange}
      />

      <ControlsRow>
        <WatchlistFilter
          filters={filters}
          onChange={handleFilterChange}
        />

        <SortingControls
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onSortOrderToggle={handleSortOrderToggle}
        />
      </ControlsRow>

      {error && (
        <ErrorMessage>
          <X size={18} />
          {error}
        </ErrorMessage>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingContainer key="loading">
            <LoadingSpinner size={40} />
          </LoadingContainer>
        ) : filteredAnimeList.length === 0 ? (
          <EmptyWatchlist
            key="empty"
            onAddAnime={() => navigate('/schedule')}
          />
        ) : (
          <AnimeList key="list">
            <AnimatePresence>
              {filteredAnimeList.map(anime => (
                <WatchlistAnimeItem
                  key={anime.animeId}
                  anime={anime}
                  onStatusChange={handleStatusChange}
                  onDelete={openDeleteModal}
                />
              ))}
            </AnimatePresence>
          </AnimeList>
        )}
      </AnimatePresence>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        anime={currentAnime}
        onDelete={handleDelete}
        isDeleting={deleting}
      />
    </WatchlistContainer>
  );
};

export default WatchlistSection; 