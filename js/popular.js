// ========== NAVIGATION FUNCTIONS ==========
function navigateToHome() {
    window.location.href = '../home/home.html';
}

function navigateToPopular() {
    window.location.href = 'populer.html';
}

function navigateToSearch() {
    window.location.href = '../search/search.html';
}

function navigateToAbout() {
    window.location.href = '../about/about.html';
}

// ========== API CONFIGURATION =========
const API_KEY = '1c768e4f';
const API_BASE_URL = 'https://www.omdbapi.com/';

const popularMovieTitles = [
    "The Shawshank Redemption", "The Godfather", "The Dark Knight", "Pulp Fiction",
    "Forrest Gump", "Inception", "Fight Club", "The Matrix", "Goodfellas",
    "The Lord of the Rings", "Star Wars", "Interstellar", "The Green Mile",
    "Gladiator", "Saving Private Ry an", "The Departed", "The Prestige",
    "Django Unchained", "WALL-E", "The Lion King", "Back to the Future",
    "The Silence of the Lambs", "Terminator 2", "Avengers", "Iron Man",
    "Spider-Man", "Batman Begins", "Joker", "Parasite", "1917",
    "Titanic", "Avatar", "Jurassic Park", "Toy Story", "Finding Nemo",
    "The Incredibles", "Up", "Inside Out", "Coco", "Frozen",
    "Moana", "Zootopia", "Big Hero 6", "Ratatouille", "Brave",
    "Tangled", "How to Train Your Dragon", "Kung Fu Panda", "Shrek",
    "Madagascar", "Ice Age", "Despicable Me", "Minions", "The Secret Life of Pets"
];

// ========== DOM ELEMENTS ==========
const resultsEl = document.getElementById('popularResults');
const statusEl = document.getElementById('popularStatus');
const ratingFilter = document.getElementById('ratingFilter');
const movieCount = document.getElementById('movieCount');

let allMovies = [];
let filteredMovies = []; 

// ========== UTILITY FUNCTIONS ==========
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

function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function updateMovieCount() {
    if (movieCount) {
        movieCount.textContent = `${filteredMovies.length} movies`;
    }
}

// ========== FETCH ALL POPULAR MOVIES ==========
function loadPopularMovies() {
    if (!resultsEl) return;

    resultsEl.innerHTML = '';
    showStatus('Loading popular movies...');
    allMovies = [];

    let loadedCount = 0;

    const fetchPromises = popularMovieTitles.map(title => {
        const url = `${API_BASE_URL}?apikey=${API_KEY}&t=${encodeURIComponent(title)}`;
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.Response === 'True' && data.imdbRating && data.imdbRating !== 'N/A') {
                    loadedCount++;

                    if (loadedCount % 5 === 0) {
                        showStatus(`Loaded ${loadedCount} of ${popularMovieTitles.length} movies...`);
                    }

                    return {
                        ...data,
                        rating: parseFloat(data.imdbRating)
                    };
                }
                return null;
            })
            .catch(error => {
                console.error('Error:', error);
                return null;
            });
    });

    Promise.all(fetchPromises)
        .then(results => {
            allMovies = results.filter(movie => movie !== null);
            allMovies.sort((a, b) => b.rating - a.rating);

            filteredMovies = [...allMovies];
            renderMovies();
            hideStatus();
            updateMovieCount();
        })
        .catch(error => console.error('Error:', error));
}

// ========== RENDER MOVIES ==========
function renderMovies() {
    if (!resultsEl) return;

    resultsEl.innerHTML = '';

    if (filteredMovies.length === 0) {
        showStatus('No movies found with the selected rating filter.', true);
        return;
    }

    filteredMovies.forEach(movie => {
        renderMovieCard(movie);
    });

    hideStatus();
}

// ========== RENDER MOVIE CARD ==========
function renderMovieCard(movie) {
    if (!resultsEl) return;

    const card = document.createElement('button');
    card.className = 'card';
    card.type = 'button';
    card.innerHTML = `
        <img class="poster" 
             src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" 
             alt="${escapeHtml(movie.Title)} poster"
             loading="lazy">
        <div class="title" style="color:white">${escapeHtml(movie.Title)}</div>
        <div class="meta">
            <span style="color:white">${movie.Year}</span>
            <span style="color:#9acd32; font-weight: 600;">⭐${movie.imdbRating}</span>
        </div>
    `;
    card.addEventListener('click', () => openModal(movie.imdbID));
    resultsEl.appendChild(card);
}

// ========== FILTER MOVIES BY RATING ==========
function filterByRating(minRating) {
    const min = parseFloat(minRating);

    if (min === 0) {

        filteredMovies = [...allMovies];
    } else {

        filteredMovies = allMovies.filter(movie => movie.rating >= min);
    }

    renderMovies();
    updateMovieCount();
}

// ========== OPEN MOVIE DETAILS MODAL ==========
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

    if (modalTitle) modalTitle.textContent = 'Loading...';
    if (modalPoster) modalPoster.src = '';

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
            } else {
                if (modalTitle) modalTitle.textContent = 'Not found';
                if (modalPlot) modalPlot.textContent = 'Movie details not available.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (modalTitle) modalTitle.textContent = 'Error';
            if (modalPlot) modalPlot.textContent = 'Could not load movie details.';
        });
}

// ========== EVENT LISTENERS ==========

if (ratingFilter) {
    ratingFilter.addEventListener('change', (e) => {
        const minRating = e.target.value;
        filterByRating(minRating);
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

// ========== NAVBAR FUNCTIONALITY ==========
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

// ========== INITIALIZE ==========
window.addEventListener('DOMContentLoaded', () => {
    loadPopularMovies();
});

console.log('🎬 Popular Movies page initialized');