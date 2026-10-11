import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox } from 'lucide-react';
import CommunityPostComposer from './CommunityPostComposer';
import CommunitySosPost from './CommunitySosPost';

export default function CommunityFeed({
  messages,
  activeFilter,
  setActiveFilter,
  selectedCategory,
  setSelectedCategory,
  selectedTag,
  setSelectedTag,
  sortBy,
  setSortBy,
  onPostSos,
  onResolve,
  onFocusMap,
  onShowToast,
  totalRawCount,
  counts = {},
  availableTags = [],
  currentUser,
  onVolunteer,
  onOpenAuthModal,
}) {
  const isFiltered = selectedTag || selectedCategory !== 'ALL' || activeFilter !== 'all';

  return (
    <div className="community-feed-column">
      {/* Social Post Composer */}
      <CommunityPostComposer onPostSos={onPostSos} />

      {/* Feed List or Empty State */}
      <div className="feed-posts-list">
        {messages.length === 0 ? (
          <div className="community-empty-feed">
            <div className="empty-feed-icon">
              <Inbox size={32} />
            </div>
            <div className="empty-feed-title">No Emergency Signals Found</div>
            <p className="empty-feed-desc">
              No community SOS alerts match your selected filters or search terms. Try clearing active filters.
            </p>
            {isFiltered && (
              <button
                type="button"
                className="btn-clear-filters"
                onClick={() => {
                  setSelectedTag(null);
                  setSelectedCategory('ALL');
                  setActiveFilter('all');
                }}
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <CommunitySosPost
                key={msg._id || msg.id}
                message={msg}
                onResolve={onResolve}
                onFocusMap={onFocusMap}
                onTagClick={(tag) => setSelectedTag(tag)}
                onShowToast={onShowToast}
                currentUser={currentUser}
                onVolunteer={onVolunteer}
                onOpenAuthModal={onOpenAuthModal}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
