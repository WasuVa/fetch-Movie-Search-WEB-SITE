// ========== API CONFIGURATION ==========
const API_KEY = ''; // <-- Add your OMDb API key here
const API_BASE_URL = 'https://www.omdbapi.com/';

// ========== DOM ELEMENTS ==========
// ...existing code...

// ========== NAVBAR FUNCTIONALITY ==========
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const body = document.body;

// Toggle hamburger menu
if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    });
}

// Handle nav link clicks
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

ntListener('DOMContentLoaded', () => {
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

// ...existing code...

