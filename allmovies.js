const API_KEY = "ae4ebfd6169b89a98bf9d603cb53e53f";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

let allMoviesData = [];
let currentPage = 1;
let isLoading = false; 
let currentSortType = 'rating';

const movieContainer = document.getElementById("movieContainer");
const sortButtons = document.querySelectorAll(".sort-btn");



const genreMap = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};




//Watchlist Helper
function getWatchlist() { return JSON.parse(localStorage.getItem('mmdb_watchlist')) || []; }
function isInWatchlist(id) { return getWatchlist().some(m => parseInt(m.id) === parseInt(id)); }
function showToast(message) {
    let toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => { toast.classList.remove("show"); }, 3000);
}
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
        showToast("Removed from Watchlist");
    } else {
        watchlist.push({ id, title, poster_path });
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.classList.add('added');
        showToast("Added to Watchlist ✓");
    }
    localStorage.setItem('mmdb_watchlist', JSON.stringify(watchlist));
};

async function fetchInitialMovies() {
    isLoading = true;
    try {
        let fetchedMovies = [];
        for(let i = 1; i <= 3; i++) {
            const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${i}`);
            const data = await res.json();
            fetchedMovies = fetchedMovies.concat(data.results);
        }
        allMoviesData = fetchedMovies;
        currentPage = 3; 
        sortMovies('rating'); 
    } catch (error) {
        movieContainer.innerHTML = "<h3>Error loading movies.</h3>";
    } finally {
        isLoading = false;
    }
}
//Infinite Scroll
async function fetchNextPage() {
    if (isLoading) return;
    isLoading = true;
    currentPage++; 
    try {
        const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${currentPage}`);
        const data = await res.json();
        allMoviesData = allMoviesData.concat(data.results);

        sortMovies(currentSortType);
    } catch (error) {
        console.error("Error loading more movies");
    } finally {
        isLoading = false; 
    }
}




function sortMovies(type) {
    currentSortType = type;
    let sorted = [...allMoviesData]; 
    
    if (type === 'rating') {
        sorted.sort((a, b) => b.vote_average - a.vote_average);
    } else if (type === 'date') {
        sorted.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    } else if (type === 'title') {
        sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    renderMovies(sorted);
}

function renderMovies(movies) {
    movieContainer.innerHTML = "";
    movies.forEach(movie => {

        let genreText = "N/A";
        if (movie.genre_ids && movie.genre_ids.length > 0) {
            genreText = movie.genre_ids.map(id => genreMap[id]).filter(Boolean).slice(0, 2).join(", ");
        }
        let formattedDate = "N/A";
        if (movie.release_date) {
            const dateObj = new Date(movie.release_date);
            formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }

        const card = document.createElement("div");
        card.classList.add("movie-card");
        card.setAttribute("onclick", `window.location.href='details.html?id=${movie.id}'`);
        
        card.innerHTML = `
            <img src="${movie.poster_path ? IMAGE_URL + movie.poster_path : "https://via.placeholder.com/300x450?text=No+Image"}" alt="${movie.title}">
            <div class="card-overlay">
                <button class="watchlist-icon-btn ${isInWatchlist(movie.id) ? 'added' : ''}" 
                        data-id="${movie.id}" data-title="${movie.title.replace(/"/g, '&quot;')}" data-poster="${movie.poster_path}" 
                        onclick="toggleWatchlist(event)">
                    <i class="fa-solid ${isInWatchlist(movie.id) ? 'fa-check' : 'fa-plus'}"></i>
                </button>
                <h3>${movie.title}</h3>
                
                <!-- Added Genres -->
                <p style="font-size: 0.8rem; color: #ccc; font-style: italic; margin-bottom: 8px;">${genreText}</p>
                
                <p>⭐ ${movie.vote_average.toFixed(1)}</p>
                
                <!-- Updated Proper Release Date -->
                <p>Release : ${movie.release_date || "N/A"}</p>
            </div>
        `;
        movieContainer.appendChild(card);
    });
}
//INFINITE LISTENER
window.addEventListener('scroll', () => {

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        fetchNextPage();
    }
});
sortButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        sortButtons.forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        sortMovies(e.currentTarget.getAttribute("data-sort"));
    });
});
fetchInitialMovies();


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