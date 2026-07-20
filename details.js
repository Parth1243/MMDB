
const API_KEY = "ae4ebfd6169b89a98bf9d603cb53e53f";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/original"; 

const genreMap = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');
const detailsContent = document.getElementById('detailsContent');





document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const body = document.body;

    function applyTheme(isLight) {
        if (isLight) {
            body.classList.add("light-mode");
            if(themeIcon) {
                themeIcon.classList.remove("fa-moon");
                themeIcon.classList.add("fa-sun");
            }
        } else {
            body.classList.remove("light-mode");
            if(themeIcon) {
                themeIcon.classList.remove("fa-sun");
                themeIcon.classList.add("fa-moon");
            }
        }
    }
    const savedTheme = localStorage.getItem("mmdb_theme");
    
    if (savedTheme) {
        applyTheme(savedTheme === "light");
    } else {
        const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        applyTheme(systemPrefersLight);
    }
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const isCurrentlyDark = !body.classList.contains("light-mode");
            applyTheme(isCurrentlyDark);
            localStorage.setItem("mmdb_theme", isCurrentlyDark ? "light" : "dark");
        });
    }
});


function getWatchlist() {
    return JSON.parse(localStorage.getItem('mmdb_watchlist')) || [];
}
function isInWatchlist(id) {
    return getWatchlist().some(m => parseInt(m.id) === parseInt(id));
}

function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => { toast.classList.remove("show"); }, 3000);
}

window.toggleDetailsWatchlist = function(btnElement, id, title, poster_path) {
    let watchlist = getWatchlist();
    const index = watchlist.findIndex(m => String(m.id) === String(id));

    if (index > -1) {
        watchlist.splice(index, 1);
        btnElement.innerHTML = '<i class="fa-solid fa-plus"></i> Add to Watchlist';
        btnElement.classList.remove('added');
        showToast("Removed from Watchlist");
    } else {
        watchlist.push({ id, title, poster_path });
        btnElement.innerHTML = '<i class="fa-solid fa-check"></i> Already in Watchlist';
        btnElement.classList.add('added');
        showToast("Added to Watchlist ✓");
    }
    localStorage.setItem('mmdb_watchlist', JSON.stringify(watchlist));
};

window.toggleWatchlist = function(event) {
    event.stopPropagation();
    const btn = event.currentTarget;
    const id = parseInt(btn.getAttribute('data-id'));
    const title = btn.getAttribute('data-title');
    const poster_path = btn.getAttribute('data-poster');
    
    let watchlist = getWatchlist();
    const index = watchlist.findIndex(m => parseInt(m.id) === id);
    if (index > -1) {
        watchlist.splice(index, 1);
        btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
        btn.classList.remove('added');
        btn.setAttribute('title', 'Add to Watchlist');
        showToast("Removed from Watchlist");
    } else {
        watchlist.push({ id, title, poster_path });
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.classList.add('added');
        btn.setAttribute('title', 'Remove from Watchlist');
        showToast("Added to Watchlist ✓");
    }
    localStorage.setItem('mmdb_watchlist', JSON.stringify(watchlist));
};

function getGenres(genreIds) {
    if (!genreIds || genreIds.length === 0) return "N/A";
    return genreIds.slice(0, 3).map(id => genreMap[id]).join(", ");
}

async function fetchMovieDetails(id) {
    if (!id) {
        detailsContent.innerHTML = "<h2 style='color:red; text-align:center; margin-top:100px;'>No Movie Found!</h2>";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
        const movie = await response.json();
        const providerRes = await fetch(`${BASE_URL}/movie/${id}/watch/providers?api_key=${API_KEY}`);
        const providerData = await providerRes.json();

        const regionalProviders = providerData.results?.IN || providerData.results?.US;
        let ottText = "Theaters / Not Streaming Yet"; 

        if (regionalProviders && regionalProviders.flatrate) {
            ottText = regionalProviders.flatrate.map(p => p.provider_name).join(", ");
        }

        const bgImage = movie.backdrop_path ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` : "none";
        const average = movie.vote_average || 0;
        const totalVotes = movie.vote_count || 0;
        const formattedVotes = totalVotes > 1000 ? (totalVotes / 1000).toFixed(1) + 'K' : totalVotes.toLocaleString();
        const runtime = movie.runtime ? `${movie.runtime} min` : "N/A";
        const genres = movie.genres ? movie.genres.map(g => g.name).join(", ") : "N/A";
        const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : "N/A";
        const language = movie.original_language ? movie.original_language.toUpperCase() : "N/A";
        const posPercentage = totalVotes > 0 ? (average / 10) * 100 : 0;
        const negPercentage = totalVotes > 0 ? 100 - posPercentage : 0;
        const posVotes = Math.round((posPercentage / 100) * totalVotes);
        const negVotes = totalVotes - posVotes;

        detailsContent.innerHTML = `
            <div class="hero-banner" style="background-image: ${bgImage};">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <img class="hero-poster" src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : "https://via.placeholder.com/300x450?text=No+Image"}" alt="${movie.title}">
                    <div class="hero-info">
                        <h1>${movie.title}</h1>
                        <div class="vote-container">
                            <div class="vote-top">
                                <div class="star-rating"><i class="fa-solid fa-star"></i> ${average.toFixed(1)}/10 <span style="font-size: 0.9rem; font-weight: normal; color: #aaa;">(${formattedVotes} Votes)</span></div>
                                <div class="vote-labels">
                                    <span class="thumbs-up"><i class="fa-solid fa-thumbs-up"></i> ${posVotes.toLocaleString()}</span>
                                    <span class="thumbs-down"><i class="fa-solid fa-thumbs-down"></i> ${negVotes.toLocaleString()}</span>
                                </div>
                            </div>
                            <div class="vote-bar-bg">
                                <div class="vote-green" style="width: ${totalVotes === 0 ? '0%' : posPercentage + '%'}"></div>
                                <div class="vote-red" style="width: ${totalVotes === 0 ? '0%' : negPercentage + '%'}"></div>
                            </div>
                        </div>

                        <p class="meta-line">${runtime} • ${genres} • ${releaseYear}</p>
                        <div class="tags-line">
                            <span>Popularity: ${movie.popularity ? movie.popularity.toFixed(1) : "N/A"}</span>
                            <span>${language}</span>
                        </div>

                        <div class="ott-section">
                            <p><strong><i class="fa-solid fa-tv"></i> Available On:</strong> <span>${ottText}</span></p>
                        </div>
                        <button id="detailsWatchlistBtn" 
                                class="details-watchlist-btn ${isInWatchlist(movie.id) ? 'added' : ''}" 
                                onclick="toggleDetailsWatchlist(this, '${movie.id}', '${movie.title.replace(/"/g, '&quot;')}', '${movie.poster_path}')">
                            ${isInWatchlist(movie.id) ? '<i class="fa-solid fa-check"></i> Already in Watchlist' : '<i class="fa-solid fa-plus"></i> Add to Watchlist'}
                        </button>
                    </div>
                </div>
            </div>
            <div class="overview-section">
                <h2>Overview</h2>
                <p>${movie.overview || "No overview available for this title."}</p>
            </div>
        `;
        
        document.title = `${movie.title} - MMDB`;

        getCast(id);
        getRecommendations(id);
    } catch (error) {
        console.error("Error fetching details:", error);
        detailsContent.innerHTML = "<h2 style='color:red; text-align:center; margin-top:100px;'>Error loading details. Please try again.</h2>";
    }
}

async function getCast(id) {
    const castSection = document.getElementById('castSection');
    const castContainer = document.getElementById('castContainer');
    try {
        const response = await fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`);
        const data = await response.json();

        if (!data.cast || data.cast.length === 0) {
            return;
        }
        castSection.style.display = "block";
        castContainer.innerHTML = "";

        data.cast.slice(0, 15).forEach(actor => {
            const card = document.createElement("div");
            card.classList.add("cast-card");

            const imageSrc = actor.profile_path 
                ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` 
                : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";

            card.innerHTML = `
                <img src="${imageSrc}" alt="${actor.name}">
                <h4>${actor.name}</h4>
                <p>${actor.character}</p>
            `;
            
            castContainer.appendChild(card);
        });

    } catch (error) {
        console.log("Error fetching cast:", error);
    }
}

async function getRecommendations(id) {
    const recSection = document.getElementById('recommendationsSection');
    const recGrid = document.getElementById('recommendationsGrid');
    try {
        const response = await fetch(`${BASE_URL}/movie/${id}/recommendations?api_key=${API_KEY}`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return; 
        }
        recSection.style.display = "block";
        recGrid.innerHTML = "";

        data.results.slice(0, 6).forEach(movie => {
            const card = document.createElement("div");
            card.classList.add("rec-card");
            card.onclick = () => window.location.href = `details.html?id=${movie.id}`;

            card.innerHTML = `
                <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : "https://via.placeholder.com/180x270?text=No+Image"}" alt="${movie.title}">
                
                <div class="card-overlay">
                    <button class="watchlist-icon-btn ${isInWatchlist(movie.id) ? 'added' : ''}" 
                            title="${isInWatchlist(movie.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}"
                            data-id="${movie.id}" data-title="${movie.title.replace(/"/g, '&quot;')}" data-poster="${movie.poster_path}" 
                            onclick="toggleWatchlist(event)">
                        <i class="fa-solid ${isInWatchlist(movie.id) ? 'fa-check' : 'fa-plus'}"></i>
                    </button>
                    <h3>${movie.title}</h3>
                    <p class="genres">${getGenres(movie.genre_ids)}</p>
                    <div class="bottom-info">
                        <p>⭐ ${movie.vote_average.toFixed(1)}</p>
                        <p>Release - ${movie.release_date ? movie.release_date.split('-')[0] : "N/A"}</p>
                    </div>
                </div>
            `;
            recGrid.appendChild(card);
        });
    } catch (error) {
        console.log("Error fetching recommendations:", error);
    }
}
fetchMovieDetails(movieId);