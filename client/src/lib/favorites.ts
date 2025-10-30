export function getFavorites(): string[] {
  const stored = localStorage.getItem('favorites');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export function addFavorite(postId: string) {
  const favorites = getFavorites();
  if (!favorites.includes(postId)) {
    favorites.push(postId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}

export function removeFavorite(postId: string) {
  const favorites = getFavorites();
  const filtered = favorites.filter(id => id !== postId);
  localStorage.setItem('favorites', JSON.stringify(filtered));
}

export function isFavorite(postId: string): boolean {
  return getFavorites().includes(postId);
}
