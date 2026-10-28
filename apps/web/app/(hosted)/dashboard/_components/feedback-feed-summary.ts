type FeedbackFeedSummaryInput = {
  loadedCount: number | undefined;
  totalCount: number | undefined;
  visibleCount: number;
  hasLocalFilters: boolean;
};

function formatResponseCount(count: number) {
  return `${count.toLocaleString()} response${count === 1 ? "" : "s"}`;
}

export function formatFeedbackFeedSummary({
  loadedCount,
  totalCount,
  visibleCount,
  hasLocalFilters,
}: FeedbackFeedSummaryInput) {
  if (loadedCount === undefined || totalCount === undefined) {
    return "Loading feedback…";
  }

  if (loadedCount === 0 && totalCount === 0) {
    return "Showing all 0 responses";
  }

  if (hasLocalFilters) {
    if (loadedCount >= totalCount) {
      const matchVerb = loadedCount === 1 ? "matches" : "match";
      return `${visibleCount.toLocaleString()} of ${formatResponseCount(loadedCount)} ${matchVerb}`;
    }

    const matchLabel = visibleCount === 1 ? "match" : "matches";
    return `${visibleCount.toLocaleString()} ${matchLabel} in the latest ${formatResponseCount(loadedCount)}`;
  }

  if (loadedCount < totalCount) {
    return `Showing latest ${loadedCount.toLocaleString()} of ${formatResponseCount(totalCount)}`;
  }

  return `Showing all ${formatResponseCount(loadedCount)}`;
}
