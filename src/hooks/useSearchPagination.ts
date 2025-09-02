import { useState, useMemo, useCallback } from 'react';

export interface SearchPaginationOptions<T> {
  /** Initial number of items per page */
  initialRowsPerPage?: number;
  /** Search fields to filter by */
  searchFields?: (keyof T)[];
  /** Custom search function */
  customFilter?: (items: T[], searchTerm: string) => T[];
  /** Case sensitive search */
  caseSensitive?: boolean;
}

export interface UseSearchPaginationReturn<T> {
  // Search state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  clearSearch: () => void;
  
  // Pagination state
  page: number;
  setPage: (page: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rowsPerPage: number) => void;
  handleChangePage: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => void;
  handleChangeRowsPerPage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  
  // Computed data
  filteredData: T[];
  paginatedData: T[];
  emptyRows: number;
  totalItems: number;
  hasResults: boolean;
  
  // Utility functions
  resetPagination: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

/**
 * Custom hook for handling search and pagination functionality
 * 
 * @param data - Array of items to search and paginate
 * @param options - Configuration options for search and pagination
 * 
 * @example
 * ```tsx
 * const { 
 *   searchTerm, 
 *   handleSearchChange, 
 *   filteredData, 
 *   paginatedData,
 *   page,
 *   rowsPerPage,
 *   handleChangePage,
 *   handleChangeRowsPerPage,
 *   totalItems
 * } = useSearchPagination(questions, {
 *   initialRowsPerPage: 5,
 *   searchFields: ['Title', 'Name']
 * });
 * ```
 */
export function useSearchPagination<T extends Record<string, unknown>>(
  data: T[],
  options: SearchPaginationOptions<T> = {}
): UseSearchPaginationReturn<T> {
  const {
    initialRowsPerPage = 10,
    searchFields = [],
    customFilter,
    caseSensitive = false,
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Handle search input change
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    setPage(0); // Reset to first page when searching
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setPage(0);
  }, []);

  // Handle page change
  const handleChangePage = useCallback((
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  }, []);

  // Handle rows per page change
  const handleChangeRowsPerPage = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  }, []);

  // Reset pagination to first page
  const resetPagination = useCallback(() => {
    setPage(0);
  }, []);

  // Go to first page
  const goToFirstPage = useCallback(() => {
    setPage(0);
  }, []);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data;
    }

    // Use custom filter if provided
    if (customFilter) {
      return customFilter(data, searchTerm);
    }

    // Default filtering behavior
    const searchValue = caseSensitive ? searchTerm.trim() : searchTerm.toLowerCase().trim();
    
    return data.filter(item => {
      // If no search fields specified, search all string properties
      if (searchFields.length === 0) {
        return Object.values(item).some(value => {
          if (typeof value === 'string') {
            const itemValue = caseSensitive ? value : value.toLowerCase();
            return itemValue.includes(searchValue);
          }
          return false;
        });
      }

      // Search specified fields only
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          const itemValue = caseSensitive ? value : value.toLowerCase();
          return itemValue.includes(searchValue);
        }
        return false;
      });
    });
  }, [data, searchTerm, searchFields, customFilter, caseSensitive]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return rowsPerPage > 0 ? filteredData.slice(startIndex, endIndex) : filteredData;
  }, [filteredData, page, rowsPerPage]);

  // Calculate empty rows for consistent table height
  const emptyRows = useMemo(() => 
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredData.length) : 0,
    [page, rowsPerPage, filteredData.length]
  );

  // Total number of items after filtering
  const totalItems = useMemo(() => filteredData.length, [filteredData.length]);

  // Whether there are results after filtering
  const hasResults = useMemo(() => filteredData.length > 0, [filteredData.length]);

  // Go to last page (memoized with proper dependencies)
  const goToLastPage = useCallback(() => {
    const totalPages = Math.ceil((filteredData.length || 1) / rowsPerPage);
    setPage(Math.max(0, totalPages - 1));
  }, [filteredData.length, rowsPerPage]);

  return {
    // Search state
    searchTerm,
    setSearchTerm,
    handleSearchChange,
    clearSearch,

    // Pagination state
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,

    // Computed data
    filteredData,
    paginatedData,
    emptyRows,
    totalItems,
    hasResults,

    // Utility functions
    resetPagination,
    goToFirstPage,
    goToLastPage,
  };
}

export default useSearchPagination;