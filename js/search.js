// ========== NAVIGATION FUNCTIONS ==========
function navigateToHome() {
    window.location.href = '../home/home.html';
}

function navigateToPopular() {
    window.location.href = '../populer/populer.html';
}

function navigateToSearch() {
    window.location.href = 'search.html';
}

function navigateToAbout() {
    window.location.href = '../about/about.html';
}

// ========== API CONFIGURATION =========
const API_KEY = '1c768e4f';
const API_BASE_URL = 'https://www.omdbapi.com/';

const randomMovieKeywords = [
    "Batman", "Spider", "Avengers", "Star Wars", "Harry Potter",
    "Lord of the Rings", "Matrix", "Inception", "Marvel", "Fast",
    "Mission", "James Bond", "Jurassic", "Transformers", "Indiana",
    "Terminator", "Alien", "Rocky", "Godfather", "Pirates",
    "Iron Man", "Thor", "Superman", "Wonder Woman", "Deadpool",
    "Joker", "Black Panther", "Captain America", "Guardians"
];

// ========== STATE MANAGEMENT =========
let allMoviesCache = [];
let currentSort = 'rating-desc';
let currentFilters = {
    genre: '',
    year: '',
    rating: 0,
    type: ''
};

// ========== DOM ELEMENTS =========
const qInput = document.getElementById('query');
const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const searchForm = document.getElementById('searchForm');
const genreFilter = document.getElementById('genreFilter');
const yearFilter = document.getElementById('yearFilter');
const ratingFilter = document.getElementById('ratingFilter');
const typeFilter = document.getElementById('typeFilter');
const applyFiltersBtn = document.getElementById('applyFilters');
const resetFiltersBtn = document.getElementById('resetFilters');
const filterStatus = document.getElementById('filterStatus');
const toggleFiltersBtn = document.getElementById('toggleFilters');
const filterContent = document.getElementById('filterContent');
const sortBtns = document.querySelectorAll('.sort-btn');

// ========== UTILITY FUNCTIONS =========
function showStatus(text, isError = false) {
    if (statusEl) {
        statusEl.textContent = text;
        statusEl.style.color = isError ? '#ffb3b3' : 'var(--muted)';
        statusEl.style.display = 'block';
    }
}

function hideStatus() {
    if (statusEl) {
        statusEl.style.display = 'none';
    }
}

function showFilterStatus(text, isError = false) {
    if (filterStatus) {
        filterStatus.textContent = text;
        filterStatus.style.background = isError ? 'rgba(255, 59, 59, 0.2)' : 'rgba(154, 205, 50, 0.1)';
        filterStatus.style.color = isError ? '#ff3b3b' : '#9acd32';
        filterStatus.style.display = 'block';
    }
}

function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// ========== LOAD RANDOM MOVIES =========
function loadRandomMovies() {
    if (!resultsEl) return;

    resultsEl.innerHTML = '';
    showStatus('Loading popular movies...(It will take some time.)');
    allMoviesCache = [];

    const allMovies = [];
    const numberOfKeywords = 3;

    const shuffledKeywords = randomMovieKeywords.sort(() => 0.5 - Math.random());
    const selectedKeywords = shuffledKeywords.slice(0, numberOfKeywords);

    const fetchPromises = selectedKeywords.map(keyword => {
        const url = `${API_BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(keyword)}`;
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.Response === "True" && data.Search) {
                    const detailPromises = data.Search.map(movie => {
                        const detailUrl = `${API_BASE_URL}?apikey=${API_KEY}&i=${movie.imdbID}&plot=short`;
                        return fetch(detailUrl)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                }
                                return response.json();
                            })
                            .then(detailData => {
                                if (detailData.Response === 'True') {
                                    return detailData;
                                }
                                return null;
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                return null;
                            });
                    });
                    return Promise.all(detailPromises);
                }
                return [];
            })
            .catch(error => {
                console.error('Error:', error);
                return [];
            });
    });

    Promise.all(fetchPromises)
        .then(results => {
            results.forEach(movieList => {
                if (movieList && Array.isArray(movieList)) {
                    movieList.forEach(movie => {
                        if (movie) allMovies.push(movie);
                    });
                }
            });

            if (allMovies.length > 0) {
                const uniqueMovies = Array.from(new Map(allMovies.map(movie => [movie.imdbID, movie])).values());
                const shuffled = uniqueMovies.sort(() => 0.5 - Math.random());
                allMoviesCache = shuffled.slice(0, 30);

                displayMovies(allMoviesCache);
                showStatus(`Showing ${allMoviesCache.length} popular movies. Search or use filters to find more!`);
            } else {
                showStatus('No movies loaded. Try searching for something!', true);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showStatus('Error loading movies. Please try searching.', true);
        });
}

// ========== SEARCH MOVIES =========
function searchMovies() {
    const query = qInput.value.trim();

    if (!query) {
        loadRandomMovies();
        return;
    }

    resultsEl.innerHTML = '';
    showStatus('Searching...');
    allMoviesCache = [];

    let url = `${API_BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;

    if (currentFilters.type) {
        url += `&type=${currentFilters.type}`;
    }

    if (currentFilters.year && !currentFilters.year.includes('-')) {
        url += `&y=${currentFilters.year}`;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.Response === "True" && data.Search) {
                const detailPromises = data.Search.map(movie => {
                    const detailUrl = `${API_BASE_URL}?apikey=${API_KEY}&i=${movie.imdbID}`;
                    return fetch(detailUrl)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(detailData => {
                            if (detailData.Response === 'True') {
                                return detailData;
                            }
                            return null;
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            return null;
                        });
                });

                return Promise.all(detailPromises);
            } else {
                showStatus(data.Error || 'No movies found. Try a different search!', true);
                return [];
            }
        })
        .then(detailedMovies => {
            const validMovies = detailedMovies.filter(movie => movie !== null);
            allMoviesCache = validMovies;
            if (validMovies.length > 0) {
                applyFiltersAndSort();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showStatus('Error searching. Please try again.', true);
        });
}

// ========== APPLY FILTERS AND SORT =========
function applyFiltersAndSort() {
    let filtered = [...allMoviesCache];

    if (currentFilters.genre) {
        filtered = filtered.filter(movie =>
            movie.Genre && movie.Genre.includes(currentFilters.genre)
        );
    }

    if (currentFilters.year) {
        if (currentFilters.year.includes('-')) {
            const [startYear, endYear] = currentFilters.year.split('-').map(Number);
            filtered = filtered.filter(movie => {
                const movieYear = parseInt(movie.Year);
                return movieYear >= startYear && movieYear <= endYear;
            });
        } else {
            filtered = filtered.filter(movie => movie.Year === currentFilters.year);
        }
    }

    if (currentFilters.rating > 0) {
        filtered = filtered.filter(movie =>
            movie.imdbRating && parseFloat(movie.imdbRating) >= currentFilters.rating
        );
    }

    if (currentFilters.type) {
        filtered = filtered.filter(movie =>
            movie.Type && movie.Type.toLowerCase() === currentFilters.type.toLowerCase()
        );
    }

    filtered = sortMovies(filtered, currentSort);

    displayMovies(filtered);

    if (filtered.length === 0) {
        showFilterStatus('No movies match your filters. Try adjusting them.', true);
    } else {
        showFilterStatus(`✓ Found ${filtered.length} movie${filtered.length !== 1 ? 's' : ''}`);
        hideStatus();
    }
}

// ========== SORT MOVIES =========
function sortMovies(movies, sortType) {
    const sorted = [...movies];

    switch (sortType) {
        case 'rating-desc':
            return sorted.sort((a, b) => parseFloat(b.imdbRating || 0) - parseFloat(a.imdbRating || 0));
        case 'rating-asc':
            return sorted.sort((a, b) => parseFloat(a.imdbRating || 0) - parseFloat(b.imdbRating || 0));
        case 'year-desc':
            return sorted.sort((a, b) => parseInt(b.Year || 0) - parseInt(a.Year || 0));
        case 'year-asc':
            return sorted.sort((a, b) => parseInt(a.Year || 0) - parseInt(b.Year || 0));
        case 'title-asc':
            return sorted.sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
        default:
            return sorted;
    }
}

// ========== DISPLAY MOVIES =========
function displayMovies(movies) {
    resultsEl.innerHTML = '';

    movies.forEach(movie => {
        const card = document.createElement('button');
        card.className = 'card';
// ========== OPEN MODAL =========
function openModal(imdbID) {
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalPoster = document.getElementById('modalPoster');
    const modalTitle = document.getElementById('modalTitle');
    const modalYear = document.getElementById('modalYear');
    const modalPlot = document.getElementById('modalPlot');
    const modalMeta = document.getElementById('modalMeta');
    const modalExtra = document.getElementById('modalExtra');

    if (!modalBackdrop) return;

    modalBackdrop.style.display = 'flex';

    const url = `${API_BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.Response === 'True') {
                if (modalPoster) modalPoster.src = data.Poster !== 'N/A' ? data.Poster : 'https://via.placeholder.com/300x450?text=No+Image';
                if (modalTitle) modalTitle.textContent = data.Title;
                if (modalYear) modalYear.textContent = `${data.Year} • ${data.Runtime || 'N/A'}`;
                if (modalPlot) modalPlot.textContent = data.Plot || 'No plot available.';
                if (modalMeta) modalMeta.textContent = `${data.Genre || 'N/A'} • Director: ${data.Director || 'N/A'}`;
                if (modalExtra) modalExtra.innerHTML = `
                <div style="color:var(--muted);margin-top:8px">
                    <strong>Actors:</strong> ${data.Actors || 'N/A'}<br>
                    <strong>Rated:</strong> ${data.Rated || 'N/A'}<br>
                    <strong>IMDb Rating:</strong> ⭐ ${data.imdbRating || 'N/A'}/10
                </div>
            `;
            }
        })
        .catch(error => console.error('Error:', error));
}       if (data.Response === 'True') {
            if (modalPoster) modalPoster.src = data.Poster !== 'N/A' ? data.Poster : 'https://via.placeholder.com/300x450?text=No+Image';
            if (modalTitle) modalTitle.textContent = data.Title;
            if (modalYear) modalYear.textContent = `${data.Year} • ${data.Runtime || 'N/A'}`;
            if (modalPlot) modalPlot.textContent = data.Plot || 'No plot available.';
            if (modalMeta) modalMeta.textContent = `${data.Genre || 'N/A'} • Director: ${data.Director || 'N/A'}`;
            if (modalExtra) modalExtra.innerHTML = `
                <div style="color:var(--muted);margin-top:8px">
                    <strong>Actors:</strong> ${data.Actors || 'N/A'}<br>
                    <strong>Rated:</strong> ${data.Rated || 'N/A'}<br>
                    <strong>IMDb Rating:</strong> ⭐ ${data.imdbRating || 'N/A'}/10
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ========== EVENT LISTENERS =========
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        searchMovies();
    });
}

if (qInput) {
    qInput.addEventListener('input', () => {
        if (qInput.value.trim() === '') {
            setTimeout(() => {
                if (qInput.value.trim() === '') {
                    loadRandomMovies();
                }
            }, 500);
        }
    });
}

if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
        currentFilters.genre = genreFilter.value;
        currentFilters.year = yearFilter.value;
        currentFilters.rating = parseFloat(ratingFilter.value) || 0;
        currentFilters.type = typeFilter.value;
        applyFiltersAndSort();
    });
}

if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
        genreFilter.value = '';
        yearFilter.value = '';
        ratingFilter.value = '0';
        typeFilter.value = '';
        currentFilters = { genre: '', year: '', rating: 0, type: '' };
        currentSort = 'rating-desc';
        
        sortBtns.forEach(btn => {
            btn.style.background = 'rgba(154, 205, 50, 0.15)';
            btn.style.borderColor = 'rgba(154, 205, 50, 0.3)';
        });
        
        if (allMoviesCache.length > 0) {
            applyFiltersAndSort();
        }
        showFilterStatus('✓ All filters reset');
    });
}

sortBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentSort = btn.dataset.sort;

        sortBtns.forEach(b => {
            b.style.background = 'rgba(154, 205, 50, 0.15)';
            b.style.borderColor = 'rgba(154, 205, 50, 0.3)';
        });
        btn.style.background = 'rgba(154, 205, 50, 0.3)';
        btn.style.borderColor = '#9acd32';
        
        applyFiltersAndSort();
    });
});

if (toggleFiltersBtn) {
    toggleFiltersBtn.addEventListener('click', () => {
        if (filterContent.style.display === 'none') {
            filterContent.style.display = 'block';
            toggleFiltersBtn.textContent = 'Hide Filters';
        } else {
            filterContent.style.display = 'none';
            toggleFiltersBtn.textContent = 'Show Filters';
        }
    });
}

const modalClose = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');

if (modalClose) {
    modalClose.addEventListener('click', () => {
        if (modalBackdrop) modalBackdrop.style.display = 'none';
    });
}

if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            modalBackdrop.style.display = 'none';
        }
    });
}

// ========== NAVBAR =========
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const body = document.body;

if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
}

// ========== INITIALIZE =========
window.addEventListener('DOMContentLoaded', () => {
    loadRandomMovies();
});

console.log('🔍 Advanced Search page initialized');