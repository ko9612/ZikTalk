import { useState, useEffect } from 'react';

export const useBookmark = (storageKey = 'questionBookmarks') => {
  const [starredItems, setStarredItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (id) => {
    const idStr = String(id);
    const updated = starredItems.includes(idStr)
      ? starredItems.filter((bid) => bid !== idStr)
      : [...starredItems, idStr];
    setStarredItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const isBookmarked = (id) => starredItems.includes(String(id));

  return {
    starredItems,
    setStarredItems,
    toggleBookmark,
    isBookmarked
  };
}; 