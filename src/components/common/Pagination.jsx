import React from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'rgba(var(--borderColor-rgb), 0.5)'};
  background: ${props => props.active ? 'var(--primary)' : 'var(--cardBackground)'};
  color: ${props => props.active ? 'white' : 'var(--textPrimary)'};
  font-weight: ${props => props.active ? '600' : '500'};
  font-size: 0.9rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? '0.6' : '1'};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? 'var(--primaryDark)' : 'rgba(var(--primary-rgb), 0.1)'};
    border-color: var(--primary);
    transform: translateY(-2px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const PageIndicator = styled.div`
  font-size: 0.9rem;
  color: var(--textSecondary);
  margin: 0 1rem;
`;

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showInfo = true
}) => {
  const handlePageChange = (page) => {
    if (page === currentPage) return;
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    if (currentPage > 1 + siblingCount && showFirstLast) {
      pageNumbers.push(1);
      // Add ellipsis if there's a gap
      if (currentPage > 2 + siblingCount) {
        pageNumbers.push('...');
      }
    }
    
    // Calculate range of pages to show around current page
    const startPage = Math.max(1, currentPage - siblingCount);
    const endPage = Math.min(totalPages, currentPage + siblingCount);
    
    // Add range of pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Always show last page
    if (currentPage < totalPages - siblingCount && showFirstLast) {
      // Add ellipsis if there's a gap
      if (currentPage < totalPages - 1 - siblingCount) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  return (
    <PaginationContainer>
      {/* First page button */}
      {showFirstLast && (
        <PageButton 
          onClick={() => handlePageChange(1)} 
          disabled={currentPage === 1}
          title="First page"
        >
          <ChevronsLeft size={18} />
        </PageButton>
      )}
      
      {/* Previous page button */}
      <PageButton 
        onClick={() => handlePageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        title="Previous page"
      >
        <ChevronLeft size={18} />
      </PageButton>
      
      {/* Page numbers */}
      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <PageIndicator key={`ellipsis-${index}`}>...</PageIndicator>
        ) : (
          <PageButton 
            key={page} 
            active={page === currentPage}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </PageButton>
        )
      ))}
      
      {/* Next page button */}
      <PageButton 
        onClick={() => handlePageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        title="Next page"
      >
        <ChevronRight size={18} />
      </PageButton>
      
      {/* Last page button */}
      {showFirstLast && (
        <PageButton 
          onClick={() => handlePageChange(totalPages)} 
          disabled={currentPage === totalPages}
          title="Last page"
        >
          <ChevronsRight size={18} />
        </PageButton>
      )}
      
      {/* Page info */}
      {showInfo && totalPages > 1 && (
        <PageIndicator>
          Page {currentPage} of {totalPages}
        </PageIndicator>
      )}
    </PaginationContainer>
  );
};

export default Pagination; 