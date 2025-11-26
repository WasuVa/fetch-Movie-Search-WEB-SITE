fetch("components/loader/loading.html").then(res=> res.text()).then(data=> {
    document.getElementById("root").innerHTML = data;
})

function navigateToHome() {
    window.location.href = 'components/home/home.html';
}
function navigateToPopular() {
    window.location.href = 'components/populer/populer.html';
}
function navigateToSearch() {
    window.location.href = 'components/search/search.html';
}
function navigateToAbout() {
    window.location.href = 'components/about/about.html';
}
function navigateToContact() {
    window.location.href = 'components/contact/contact.html';
}
