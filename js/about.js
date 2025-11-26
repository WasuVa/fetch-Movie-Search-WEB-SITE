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
    window.location.href = 'about.html';
}

// Navbar functionality
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}
