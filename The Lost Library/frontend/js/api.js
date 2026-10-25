/**
 * The Lost Library - API Service Module
 * Handles all network requests to the backend server, including
 * authentication token injection, puzzle retrieval, answer validation,
 * game progress persistence, and third-party book catalog lookups.
 */

const API_BASE_URL = "http://localhost:5000/api";

const api = {
    /**
     * Retrieve the stored JWT authentication token from localStorage.
     */
    getToken: function () {
        return localStorage.getItem("lostLibraryToken") || null;
    },

    /**
     * Retrieve the currently logged-in user profile from localStorage.
     */
    getCurrentUser: function () {
        try {
            const raw = localStorage.getItem("lostLibraryUser");
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error("Error reading user profile:", e);
            return null;
        }
    },

    /**
     * Clear all session data to log the user out.
     */
    logout: function () {
        localStorage.removeItem("lostLibraryToken");
        localStorage.removeItem("lostLibraryUser");
    },

    /**
     * Standardized request headers helper that includes Bearer token if logged in.
     */
    getHeaders: function (customHeaders = {}) {
        const headers = {
            "Content-Type": "application/json",
            ...customHeaders
        };
        const token = this.getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        return headers;
    },

    /**
     * Load a new math puzzle from the backend (which fetches from Marc Conrad's Banana API).
     */
    getBananaPuzzle: async function () {
        const response = await fetch(`${API_BASE_URL}/banana/puzzle`, {
            method: "GET",
            headers: this.getHeaders()
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || `Server error (${response.status}) loading puzzle.`);
        }
        return data.puzzle;
    },

    /**
     * Validate the player's puzzle answer on the backend without leaking the answer to client.
     */
    checkBananaAnswer: async function (answer) {
        const response = await fetch(`${API_BASE_URL}/banana/answer`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ answer: String(answer).trim() })
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || `Server error (${response.status}) checking answer.`);
        }
        return data; // { success: true, correct: boolean, message: string }
    },

    /**
     * Fetch the saved game progress for a given player name or user account.
     */
    getProgress: async function (playerName) {
        if (!playerName) return null;
        try {
            const encodedName = encodeURIComponent(playerName.trim());
            const response = await fetch(`${API_BASE_URL}/progress/${encodedName}`, {
                method: "GET",
                headers: this.getHeaders()
            });
            if (response.status === 404) {
                return null; // No saved progress yet
            }
            const data = await response.json();
            return data.progress || null;
        } catch (error) {
            console.warn("Could not fetch player progress:", error);
            return null;
        }
    },

    /**
     * Create an initial progress entry for a new player.
     */
    createProgress: async function (progressData) {
        try {
            const response = await fetch(`${API_BASE_URL}/progress`, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify(progressData)
            });
            return await response.json();
        } catch (error) {
            console.warn("Could not create initial progress:", error);
            return null;
        }
    },

    /**
     * Update existing player progress (current level, solved puzzles count, completed levels).
     */
    saveProgress: async function (playerName, updates) {
        if (!playerName) return null;
        try {
            const encodedName = encodeURIComponent(playerName.trim());
            const response = await fetch(`${API_BASE_URL}/progress/${encodedName}`, {
                method: "PUT",
                headers: this.getHeaders(),
                body: JSON.stringify(updates)
            });

            // If progress did not exist yet (404), create it
            if (response.status === 404) {
                return await this.createProgress({
                    playerName: playerName.trim(),
                    currentLevel: updates.currentLevel || 1,
                    solvedPuzzles: updates.solvedPuzzles || 0,
                    completedLevels: updates.completedLevels || []
                });
            }

            return await response.json();
        } catch (error) {
            console.warn("Could not save progress:", error);
            return null;
        }
    },

    /**
     * Search book catalog or external Open Library API.
     * Uses backend proxy if available, with a resilient direct Open Library fallback.
     */
    searchBooks: async function (query) {
        const trimmed = (query || "ancient library").trim();
        try {
            // Attempt backend endpoint first
            const backendRes = await fetch(`${API_BASE_URL}/books/search?q=${encodeURIComponent(trimmed)}`, {
                headers: this.getHeaders()
            });
            if (backendRes.ok) {
                const data = await backendRes.json();
                if (data.books && data.books.length > 0) {
                    return data.books;
                }
            }
        } catch (err) {
            // Backend endpoint not ready yet; fallback to direct Open Library API
            console.info("Using direct Open Library client connection for search.");
        }

        // Direct Open Library public REST API fallback (Interoperability showcase)
        try {
            const openLibUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmed)}&limit=6`;
            const res = await fetch(openLibUrl);
            if (!res.ok) throw new Error("Open Library API request failed");
            const data = await res.json();
            return (data.docs || []).slice(0, 6).map((doc) => ({
                title: doc.title,
                author: doc.author_name ? doc.author_name.join(", ") : "Unknown Author",
                firstYear: doc.first_publish_year || "Ancient Era",
                coverId: doc.cover_i || null,
                coverUrl: doc.cover_i
                    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                    : null
            }));
        } catch (e) {
            console.error("Open Library fallback failed:", e);
            return [];
        }
    }
};

// Make api globally available
window.api = api;
