// ========== NAVIGATION FUNCTIONS ==========
function navigateToHome() {
    window.location.href = '../home/home.html';
}

function navigateToPopular() {
    window.location.href = '../populer/populer.html';
}

function navigateToSearch() {
    window.location.href = '../search/search.html';
}

function navigateToAbout() {
    window.location.href = '../about/about.html';
}

// ========== API CONFIGURATION ==========
const API_KEY = '1c768e4f';
const API_BASE_URL = 'https://www.omdbapi.com/';

const randomMovieKeywords = [
    "avatar","titanic","avengers","iron man","the dark knight",
    "interstellar","inception","jurassic park",
    "the matrix",
    "gladiator",
    "harry potter",
    "the lord of the rings",
    "star wars",
    "fast and furious",
    "transformers",
    "spiderman",
    "batman",
    "black panther",
    "doctor strange",
    "thor",
    "joker",
    "dune",
    "the lion king",
    "frozen",
    "coco",
    "forrest gump",
    "fight club",
    "deadpool",
    "the hunger games",
    "twilight",
    "mission impossible",
    "pirates of the caribbean",
    "terminator",
    "rocky",
    "godzilla",
    "home alone",
    "the hangover",
    "pokemon",
    "mad max",
    "king kong"
];

// ========== DOM ELEMENTS ==========
const qInput = document.getElementById('query');
const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const searchForm = document.getElementById('searchForm');

// ========== UTILITY FUNCTIONS =========
function showStatus(text, isError = false) {
    if (statusEl) {
        statusEl.textContent = text;
        statusEl.style.color = isError ? '#ffb3b3' : 'var(--muted)';
    }
}

function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// ========== LOAD RANDOM MOVIES ON PAGE LOAD ==========
async function loadRandomMovies() {
    if (!resultsEl) return;

    resultsEl.innerHTML = '';
    showStatus('Loading popular movies...');

    const allMovies = [];
    const numberOfKeywords = 3;

    try {
        const shuffledKeywords = randomMovieKeywords.sort(() => 0.5 - Math.random());
        const selectedKeywords = shuffledKeywords.slice(0, numberOfKeywords);
        for (const keyword of selectedKeywords) {
            const url = `${API_BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(keyword)}`;
            const response = await fetch(url);

            if (!response.ok) {
                continue;
            }

            const data = await response.json();

            if (data.Response === "True" && data.Search) {
                allMovies.push(...data.Search);
            }
        }

        if (allMovies.length > 0) {
            const uniqueMovies = Array.from(new Map(allMovies.map(movie => [movie.imdbID, movie])).values());

            const shuffled = allMovies.sort(() => 0.5 - Math.random());
            const selectedMovies = shuffled.slice(0, 30);

            selectedMovies.forEach(movie => {
                renderMovieCard(movie);
            });

            showStatus(`Showing ${selectedMovies.length} popular movies. Search to find more!`);
        } else {
            showStatus('No movies found. Try searching for something!', true);
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        showStatus('Error loading movies. Please try again later.', true);
    }
}

// ========== RENDER MOVIE CARD =========
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
        <div class="meta" >
            <span style="color:white">${movie.Year}</span>
            <span style="color:white">IMDb</span>
        </div>
    `;
    card.addEventListener('click', () => openModal(movie.imdbID));
    resultsEl.appendChild(card);
}

// ========== SEARCH MOVIES =========
async function getmovieData() {
    const movieName = qInput.value.trim();

    if (!movieName) {
        loadRandomMovies();
        return;
    }

    resultsEl.innerHTML = '';
    showStatus('Searching...');

    try {
        const url = `${API_BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(movieName)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.Response === "True" && data.Search) {
            data.Search.forEach(movie => {
                renderMovieCard(movie);
            });
            showStatus(`✓ Found ${data.Search.length} results for "${movieName}"`);
        } else {
            showStatus(data.Error || 'No movies found. Try a different search!', true);
        }
    } catch (error) {
        console.error('Error searching movies:', error);
        showStatus('❌ Error searching. Please try again.', true);
    }
}

// ========== OPEN MOVIE DETAILS MODAL =========
async function openModal(imdbID) {
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

    try {
        const url = `${API_BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`;
        const response = await fetch(url);
        const data = await response.json();

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
                    <strong>IMDb Rating:</strong> ${data.imdbRating || 'N/A'}/10
                </div>
            `;
        } else {
            if (modalTitle) modalTitle.textContent = 'Not found';
            if (modalPlot) modalPlot.textContent = 'Movie details not available.';
        }
    } catch (error) {
        console.error('Error loading movie details:', error);
        if (modalTitle) modalTitle.textContent = 'Error';
        if (modalPlot) modalPlot.textContent = 'Could not load movie details.';
    }
}

// ========== EVENT LISTENERS ==========
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        getmovieData();
    });
}

// Search input - debounced search
let searchTimeout;
if (qInput) {
    qInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = qInput.value.trim();
            if (query) {
                getmovieData();
            } else {
                loadRandomMovies();
            }
        }, 500);
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
const navLinks = document.querySelectorAll('.nav-link');
const body = document.body;

// ========== Toggle hamburger menu ========== 
if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');

        if (navMenu.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (hamburger) {
            hamburger.classList.remove('active');
        }
        if (navMenu) {
            navMenu.classList.remove('active');
        }
        body.style.overflow = '';

        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const href = link.getAttribute('href');
        localStorage.setItem('activeNavLink', href);
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');

        if (linkHref === currentPage) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });
});

document.addEventListener('click', (e) => {
    if (navMenu && hamburger) {
        const isClickInsideMenu = navMenu.contains(e.target);
        const isClickOnHamburger = hamburger.contains(e.target);

        if (!isClickInsideMenu && !isClickOnHamburger && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
        if (hamburger) {
            hamburger.classList.remove('active');
        }
        navMenu.classList.remove('active');
        body.style.overflow = '';
    }
});

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            body.style.overflow = '';
        }
    }, 250);
});

// ========== NAVBAR SCROLL EFFECT ==========
let lastScroll = 0;
const navbar = document.querySelector('.navbar-header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.6)';
    } else {
        navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
    }

    lastScroll = currentScroll;
});

// ========== INITIALIZE ==========
window.addEventListener('DOMContentLoaded', () => {
    loadRandomMovies();
});

