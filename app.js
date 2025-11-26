console.log("App is running");

function searchcon() {
    const countryInput = document.getElementById('country-input').value;

    if (!countryInput.trim()) {
        alert('Please enter a country name!');
        return;
    }

    fetch(`http://api.weatherapi.com/v1/current.json?key=24636336a68e4f859fa90222251211&q=${countryInput}`)
    .then(response => response.json())
    .then(data => {

        fetch(`https://restcountries.com/v3.1/name/${data.location.country}`)
            .then(response => response.json())
            .then(data => {
                const country = data[0];
                document.getElementById('country-name').innerText = country.name.common;
                document.getElementById('country-info').innerText = country.region || 'N/A';
                document.getElementById('country-population').innerText = country.population.toLocaleString();
                document.getElementById('country-capital').innerText = country.capital ? country.capital[0] : 'N/A';

                document.getElementById('country-flag').innerHTML = `<img src="${country.flags.png}" alt="Flag of ${country.name.common}"></img>`;
                document.getElementById('coat').innerHTML = `<img height="210px" src="${country.coatOfArms.png}" alt="Coat of Arms of ${country.name.common}"></img>`;
                document.getElementById('country-currency').innerHTML =country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(', ') : 'N/A';

                const lat = country.latlng[0];
                const lng = country.latlng[1];
                const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 5},${lat - 5},${lng + 5},${lat + 5}&layer=mapnik&marker=${lat},${lng}`;

                document.getElementById('mapVIEW').innerHTML = `<iframe width="1000px" height="600px" frameborder="0" style="border-radius: 12px;" src="${mapUrl}"></iframe>`;
                
            })
    })
}
