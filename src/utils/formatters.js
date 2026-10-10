// Helper utility functions for formatting CriSoS emergency data

export function formatDate(epochMs) {
  if (!epochMs) return 'N/A';
  try {
    const date = new Date(Number(epochMs));
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Invalid Date';
  }
}

export function formatRelativeTime(epochMs) {
  if (!epochMs) return 'Unknown';
  try {
    const ms = Number(epochMs);
    const now = Date.now();
    const diff = now - ms;

    // In case timestamps are simulated in the near future or past
    if (diff < 0) {
      const futureDiff = Math.abs(diff);
      const minutes = Math.floor(futureDiff / 60000);
      if (minutes < 60) return `in ${minutes}m`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `in ${hours}h`;
      return formatDate(epochMs);
    }

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(epochMs);
  } catch {
    return 'Unknown';
  }
}

export function getCategoryBadgeClass(category) {
  switch (category?.toUpperCase()) {
    case 'FLOOD':
      return 'badge-FLOOD';
    case 'FIRE':
      return 'badge-FIRE';
    case 'MEDICAL':
      return 'badge-MEDICAL';
    case 'EARTHQUAKE':
      return 'badge-EARTHQUAKE';
    case 'TRAPPED':
    case 'SEARCH_RESCUE':
      return 'badge-TRAPPED';
    case 'VIOLENCE':
      return 'badge-VIOLENCE';
    default:
      return 'badge-OTHER';
  }
}

export function getStatusBadgeClass(status) {
  switch (status?.toUpperCase()) {
    case 'SENT':
      return 'badge-status SENT';
    case 'RECEIVED':
      return 'badge-status RECEIVED';
    case 'RELAYED':
      return 'badge-status RELAYED';
    case 'QUEUED':
      return 'badge-status QUEUED';
    case 'RESOLVED':
    case 'ACKNOWLEDGED':
      return 'badge-status RESOLVED';
    case 'IN_PROGRESS':
      return 'badge-status IN_PROGRESS';
    default:
      return 'badge-status SENT';
  }
}
