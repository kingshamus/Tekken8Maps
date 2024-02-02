// Replace `<YOUR_NOMINATIM_ENDPOINT>` with the Nominatim API endpoint
var nominatimEndpoint = 'https://nominatim.openstreetmap.org/search';

// Initialize the map
var map = L.map('map').setView([0, 0], 2);

// Add a tile layer (you can use other providers or your own)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Define headers and query for fetching data
var token = "fce7d38cd20cfa58739be8d97eb2358b";
var headers = { "Authorization": "Bearer " + token };
var query = `
  query TournamentsByVideogame($perPage: Int!, $videogameId: ID!) {
    tournaments(query: {
      perPage: $perPage
      page: 1
      sortBy: "startAt asc"
      filter: {
        upcoming: true
        videogameIds: [
          $videogameId
        ]
      }
    }) {
      nodes {
        name
        url
        lat
        lng
        isRegistrationOpen
        startAt
      }
    }
  }
`;

// Variables for the GraphQL query
var variables = {
    "perPage": 500,
    "videogameId": 49783
};

async function fetchData() {
    try {
        const response = await fetch('https://api.start.gg/gql/alpha', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const json_data = await response.json();
        const tournaments = json_data.data.tournaments.nodes;

        const filteredTournaments = tournaments.filter(tournament => tournament.isRegistrationOpen !== false);

        return filteredTournaments;
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        throw error;
    }
}

async function displayData() {
    try {
        const data = await fetchData();

        if (data && Array.isArray(data) && data.length > 0) {
            data.forEach(tournament => {
                const { name, lat, lng, startAt, url } = tournament;

                // Check if lat and lng are valid numbers and not null
                const latNum = parseFloat(lat);
                const lngNum = parseFloat(lng);

                if (!isNaN(latNum) && !isNaN(lngNum) && lat !== null && lng !== null) {
                    // Add marker for each entry using lat and lng directly
                    L.marker([latNum, lngNum]).addTo(map)
                        .bindPopup(`<b>${name}</b><br><b>Starts at:</b> ${new Date(startAt * 1000).toLocaleString()}<br><b>Sign Up Link:</b> <a href="https://start.gg${url}" target="_blank">https://start.gg${url}</a>`);
                } else {
                    console.error(`Invalid lat/lng values or null for tournament: ${name}`);
                }
            });
        } else {
            console.log('No valid data available.');
        }
    } catch (error) {
        console.error(`Error displaying data: ${error.message}`);
    }
}

// Call the function to display data without a delay
displayData();
