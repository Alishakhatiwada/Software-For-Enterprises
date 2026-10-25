/**
 * The Lost Library - Books & Archive Module
 * Interoperates with external book catalog services (Open Library REST API)
 * to allow players to search for ancient texts, inspect book covers,
 * and discover hidden lore clues scattered in the library archives.
 */

const booksModule = {
    // Curated lore to inject into library searches
    loreNotes: [
        "A note tucked in the binding reads: 'The digits of the glyphs always sum to a sacred balance.'",
        "Marginalia in faded ink notes: 'Marc Conrad's mathematical riddles were known even to the ancients.'",
        "Between pages 42 and 43 lies a pressed laurel leaf with a strange formula.",
        "An inscription reads: 'The truth is guarded by logic and unlocked by patience.'",
        "A faded seal on the back flyleaf confirms this tome belonged to the Grand Archivist."
    ],

    init: function () {
        this.archiveModal = document.getElementById("archiveModal");
        this.openArchiveButton = document.getElementById("openArchiveButton");
        this.closeArchiveButton = document.getElementById("closeArchiveButton");
        this.searchButton = document.getElementById("searchBooksButton");
        this.searchInput = document.getElementById("searchBooksInput");
        this.resultsContainer = document.getElementById("booksResults");
        this.archiveStatus = document.getElementById("archiveStatus");

        if (this.openArchiveButton) {
            this.openArchiveButton.addEventListener("click", () => this.open());
        }
        if (this.closeArchiveButton) {
            this.closeArchiveButton.addEventListener("click", () => this.close());
        }
        if (this.searchButton && this.searchInput) {
            this.searchButton.addEventListener("click", () => this.performSearch());
            this.searchInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    this.performSearch();
                }
            });
        }

        // Close on Escape key
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.isOpen()) {
                this.close();
            }
        });
    },

    isOpen: function () {
        return this.archiveModal && !this.archiveModal.classList.contains("hidden");
    },

    open: function () {
        if (!this.archiveModal) return;
        this.archiveModal.classList.remove("hidden");
        if (this.searchInput) {
            this.searchInput.focus();
            if (!this.searchInput.value) {
                this.searchInput.value = "ancient mystery";
                this.performSearch();
            }
        }
    },

    close: function () {
        if (this.archiveModal) {
            this.archiveModal.classList.add("hidden");
        }
    },

    performSearch: async function () {
        const query = (this.searchInput.value || "").trim();
        if (!query) {
            this.archiveStatus.textContent = "Please enter a search topic or keyword.";
            return;
        }

        this.archiveStatus.textContent = `Searching external library archives for "${query}"...`;
        this.searchButton.disabled = true;
        this.resultsContainer.innerHTML = "<div class='loading-spinner'>Scanning the ancient shelves...</div>";

        try {
            const books = await window.api.searchBooks(query);
            this.renderBooks(books, query);
        } catch (error) {
            console.error("Book search error:", error);
            this.archiveStatus.textContent = "Could not reach the archive service. Try again later.";
            this.resultsContainer.innerHTML = "";
        } finally {
            this.searchButton.disabled = false;
        }
    },

    renderBooks: function (books, query) {
        this.resultsContainer.innerHTML = "";

        if (!books || books.length === 0) {
            this.archiveStatus.textContent = `No scrolls or manuscripts found matching "${query}".`;
            return;
        }

        this.archiveStatus.textContent = `Found ${books.length} archive records via Open Library API for "${query}":`;

        books.forEach((book, index) => {
            const card = document.createElement("div");
            card.className = "book-card";

            const coverHtml = book.coverUrl
                ? `<img src="${book.coverUrl}" alt="${book.title}" class="book-cover" onerror="this.style.display='none'">`
                : `<div class="book-cover-placeholder">📖</div>`;

            const lore = this.loreNotes[index % this.loreNotes.length];

            card.innerHTML = `
                ${coverHtml}
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">By ${book.author}</p>
                    <p class="book-year">First documented: ${book.firstYear}</p>
                    <p class="book-lore"><em>${lore}</em></p>
                </div>
            `;
            this.resultsContainer.appendChild(card);
        });
    }
};

window.booksModule = booksModule;
