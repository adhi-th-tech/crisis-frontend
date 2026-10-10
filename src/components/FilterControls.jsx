import React from 'react';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  Table, 
  MapPin, 
  Code2, 
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function FilterControls({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  categories = [],
  statuses = [],
  filteredCount,
  totalCount,
  onResetFilters
}) {
  return (
    <div className="controls-bar">
      <div className="controls-bar-row">
        {/* Search Input */}
        <div className="search-box-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ID, device, keyword, or assistance type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* View Switcher */}
        <div className="view-mode-tabs">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid Card View"
          >
            <LayoutGrid size={14} />
            <span>Cards</span>
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Compact Table View"
          >
            <Table size={14} />
            <span>Table</span>
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
            title="Geographic Map View"
          >
            <MapPin size={14} />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* Row 2: Select Filters */}
      <div className="filters-group">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#64748b' }}>
          <Filter size={13} />
          <span>Filters:</span>
        </div>

        {/* Category Filter */}
        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          className="filter-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: 'auto' }}>
          <ArrowUpDown size={13} style={{ color: '#94a3b8' }} />
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="hops">Fewest Hops</option>
            <option value="accuracy">Highest Accuracy</option>
          </select>
        </div>

        {/* Reset button if filtered */}
        {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={onResetFilters}
            title="Reset filters"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}

        <div style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>
          Showing <strong>{filteredCount}</strong> of {totalCount} records
        </div>
      </div>
    </div>
  );
}
