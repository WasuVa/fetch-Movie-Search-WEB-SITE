fetch("components/loader/loading.html").then(res=> res.text()).then(data=> {
    document.getElementById("root").innerHTML = data;
})

function navigateToHome() {
    fetch("components/home/home.html").then(res=> res.text()).then(data=> {
        document.getElementById("root").innerHTML = data;
    })
}
function navigateToPopular() {
    fetch("components/populer/populer.html").then(res=> res.text()).then(data=> {
        document.getElementById("root").innerHTML = data;
    })
}
function navigateToSearch() {
    fetch("components/search/search.html").then(res=> res.text()).then(data=> {
        document.getElementById("root").innerHTML = data;
        // Initialize search page after content is loaded
        if (typeof window.initializeSearchPage === 'function') {
            window.initializeSearchPage();
        }
    })
}
function navigateToAbout() {
    fetch("components/about/about.html").then(res=> res.text()).then(data=> {
        document.getElementById("root").innerHTML = data;
    })
}


