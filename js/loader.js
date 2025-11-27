const loadingMessages = [
    'Initializing...',
    'Loading resources...',
    'Preparing cinema...',
    'Setting up stage...',
    'Almost ready...',
    'Welcome!'
];

const loadingProgress = document.querySelector('.loading-progress');
const loadingPercentage = document.querySelector('.loading-percentage');
const loadingMessage = document.querySelector('.loading-message');
const loaderContainer = document.querySelector('.loader-container');

let progress = 0;
let messageIndex = 0;

function updateProgress() {
    if (progress < 100) {
        const increment = Math.floor(Math.random() * 6) + 2;
        progress = Math.min(progress + increment, 100);
        
        // Update progress bar and percentage with force reflow
        if (loadingProgress) {
            loadingProgress.style.width = progress + '%';
            loadingProgress.style.transition = 'width 0.3s ease';
        }
        if (loadingPercentage) {
            loadingPercentage.textContent = progress + '%';
        }
        
        if (loadingMessage) {
            if (progress >= 20 && messageIndex < 1) {
                messageIndex = 1;
                loadingMessage.textContent = loadingMessages[messageIndex];
            } else if (progress >= 40 && messageIndex < 2) {
                messageIndex = 2;
                loadingMessage.textContent = loadingMessages[messageIndex];
            } else if (progress >= 60 && messageIndex < 3) {
                messageIndex = 3;
                loadingMessage.textContent = loadingMessages[messageIndex];
            } else if (progress >= 80 && messageIndex < 4) {
                messageIndex = 4;
                loadingMessage.textContent = loadingMessages[messageIndex];
            } else if (progress >= 95 && messageIndex < 5) {
                messageIndex = 5;
                loadingMessage.textContent = loadingMessages[messageIndex];
            }
        }
        
        const delay = Math.random() * 100 + 50;
        setTimeout(updateProgress, delay);
    } else {
        completeLoading();
    }
}

function completeLoading() {
    setTimeout(() => {
        if (loaderContainer) {
            loaderContainer.style.opacity = '0';
            loaderContainer.style.transition = 'opacity 0.8s ease';
            setTimeout(() => {
                window.location.href = 'components/home/home.html';
            }, 800);
        }
    }, 500);
}
function animateParticles() {
    const particles = document.querySelectorAll('.particle');
    if (particles.length > 0) {
        particles.forEach((particle, index) => {
            setTimeout(() => {
                particle.style.opacity = '1';
            }, index * 200);
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (!loadingProgress || !loadingPercentage || !loadingMessage || !loaderContainer) {
        console.error('Loader elements not found. Redirecting...');
        setTimeout(() => {
            window.location.href = 'components/home/home.html';
        }, 1000);
        return;
    }
    
    setTimeout(() => {
        updateProgress();
        animateParticles();
    }, 500);
});

window.addEventListener('popstate', (e) => {
    e.preventDefault();
    history.pushState(null, null, window.location.href);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && progress < 100) {
        progress = 95;
        updateProgress();
    }
});

if (loaderContainer) {
    loaderContainer.addEventListener('click', () => {
        if (progress < 100) {
            progress = 95;
            updateProgress();
        }
    });
}

setTimeout(() => {
    if (progress < 100) {
        console.warn('Loading timeout. Redirecting...');
        window.location.href = 'components/home/home.html';
    }
}, 15000);
