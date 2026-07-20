const API_KEY = "ae4ebfd6169b89a98bf9d603cb53e53f";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const sliderWrapper = document.getElementById('sliderWrapper');
const movieContainer = document.getElementById("movieContainer");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchSection = document.getElementById("searchSection");
const searchContainer = document.getElementById("searchContainer");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const floatingResults = document.getElementById("floatingResults"); 

let currentPage = 1;
let totalSlides = 0;
let currentSlide = 0;
let currentFocus = -1; 
let slideInterval;
let allMovies = [];
let displayedMovies = 0;
const MOVIES_PER_LOAD = 12;

const genreMap = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};


function getWatchlist() {
    return JSON.parse(localStorage.getItem('mmdb_watchlist')) || [];
}

function isInWatchlist(id) {
    return getWatchlist().some(m => m.id === id);
}

window.toggleWatchlist = function(event) {
    event.stopPropagation(); 
    
    const btn = event.currentTarget;
    const id = parseInt(btn.getAttribute('data-id'));
    const title = btn.getAttribute('data-title');
    const poster_path = btn.getAttribute('data-poster');
    
    let watchlist = getWatchlist();
    const index = watchlist.findIndex(m => m.id === id);

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




const sortDropdown = document.getElementById('mainSortDropdown');
let originalMovieOrder = []; 

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


function getGenres(genreIds) {
    if (!genreIds || genreIds.length === 0) return "N/A";
    return genreIds.slice(0, 3).map(id => genreMap[id]).join(", ");
}

async function getPopularMovies() {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${currentPage}`);
        const data = await response.json();
        
        allMovies.push(...data.results);
        displayMovies();

        if (currentPage === 1) {
            displayHeroSlider(data.results);
        }
    } catch (error) {
        console.log("Error fetching popular movies:", error);
    }
}

function displayMovies() {
    if (displayedMovies === 0) {
        movieContainer.innerHTML = "";
    }
    
    const nextMovies = allMovies.slice(displayedMovies, displayedMovies + MOVIES_PER_LOAD);
    
    nextMovies.forEach(movie => {
        const card = document.createElement("div");
        card.classList.add("movie-card");
        
        card.setAttribute("onclick", `window.location.href='details.html?id=${movie.id}'`);
        
        card.innerHTML = `
            <img src="${movie.poster_path ? IMAGE_URL + movie.poster_path : "https://via.placeholder.com/300x450?text=No+Image"}" alt="${movie.title}">
            
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
                    <p>Release : ${movie.release_date || "N/A"}</p>
                </div>
            </div>
        `;
        
        movieContainer.appendChild(card);
    });
    
    displayedMovies += nextMovies.length;
}

function displayHeroSlider(movies) {
    sliderWrapper.innerHTML = "";
    movies.slice(0, 4).forEach(movie => {
        const slide = document.createElement("div");
        slide.classList.add("slide");
        
        slide.innerHTML = `
            <img src="https://image.tmdb.org/t/p/original${movie.backdrop_path}" alt="${movie.title}" onclick="window.location.href='details.html?id=${movie.id}'" style="cursor:pointer;">
            <div class="slide-info">
                <h2>${movie.title}</h2>
                <p>${movie.overview.substring(0, 150)}...</p>
            </div>
        `;
        
        sliderWrapper.appendChild(slide);
    });
    totalSlides = document.querySelectorAll(".slide").length;
    currentSlide = 0;
    sliderWrapper.style.transform = "translateX(0%)";
    startAutoPlay();
}

function moveToNextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    sliderWrapper.style.transform = `translateX(${currentSlide * -100}%)`;
}

function moveToPrevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    sliderWrapper.style.transform = `translateX(${currentSlide * -100}%)`;
}

function startAutoPlay() {
    clearInterval(slideInterval);
    slideInterval = setInterval(moveToNextSlide, 4000);
}

function resetTimer() {
    clearInterval(slideInterval); 
    startAutoPlay(); 
}

async function searchMovies(movieName) {
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(movieName)}`);
        const data = await response.json();
        
        displayFloatingResults(data.results);
    } catch (error) {
        console.log(error);
    }
}

function displayFloatingResults(movies) {
    floatingResults.innerHTML = "";
    currentFocus = -1;
    
    floatingResults.style.display = "block";
    
    if (movies.length === 0) {
        floatingResults.innerHTML = `
            <div style="padding: 15px; color: #ccc; text-align: center; font-size: 14px;">
                No movies found
            </div>
        `;
        return; 
    }

    movies.slice(0, 6).forEach(movie => {
        const item = document.createElement("div");
        item.classList.add("floating-movie-item");
        
        item.innerHTML = `
            <img src="${movie.poster_path ? IMAGE_URL + movie.poster_path : "https://via.placeholder.com/40x60?text=NA"}" alt="${movie.title}">
            <div class="info">
                <h4>${movie.title}</h4>
                <p>⭐ ${movie.vote_average.toFixed(1)} | ${movie.release_date ? movie.release_date.split('-')[0] : "N/A"}</p>
            </div>
        `;
        
        item.addEventListener("click", () => {
            window.location.href = `details.html?id=${movie.id}`;
        });

        floatingResults.appendChild(item);
    });
}

function addActive(items) {
    if (!items || items.length === 0) return false;
    
    removeActive(items);
    
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (items.length - 1);
    
    items[currentFocus].classList.add("active-focus");
    items[currentFocus].scrollIntoView({ block: "nearest" });
}

function removeActive(items) {
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove("active-focus");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loader-wrapper");
    
    if (loader) {
        if (sessionStorage.getItem("hasSeenLoader")) {
            loader.remove(); 
        } else {
            setTimeout(() => {
                loader.classList.add("fade-out"); 
                
                setTimeout(() => {
                    loader.remove();
                    sessionStorage.setItem("hasSeenLoader", "true"); 
                }, 500); 
                
            }, 1800);
        }
    }
});

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

const randomDiceBtn = document.getElementById("random-movie-btn");
const diceIcon = document.getElementById("dice-icon");

if (randomDiceBtn && diceIcon) {
    const diceFaces = [
        "fa-dice-one", 
        "fa-dice-two", 
        "fa-dice-three", 
        "fa-dice-four", 
        "fa-dice-five", 
        "fa-dice-six"
    ];
    
    let faceIndex = 0;
    
    let diceInterval = setInterval(() => {
        diceIcon.className = `fa-solid ${diceFaces[faceIndex]}`;
        faceIndex = (faceIndex + 1) % 6; 
    }, 500);

    randomDiceBtn.addEventListener("click", async () => {
        try {
            clearInterval(diceInterval);
            randomDiceBtn.style.color = "white";
            diceIcon.className = "fa-solid fa-spinner fa-spin"; 

            const randomPage = Math.floor(Math.random() * 500) + 1;
            
            const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${randomPage}`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.results.length);
                const randomMovie = data.results[randomIndex];
                
                window.location.href = `details.html?id=${randomMovie.id}`;
            }
        } catch (error) {
            console.error("Error fetching random movie:", error);
            diceIcon.className = "fa-solid fa-dice-one";
            randomDiceBtn.style.color = "orange";
        }
    });
}

loadMoreBtn.addEventListener("click", () => {
    if (displayedMovies < allMovies.length) {
        displayMovies();
    } else {
        currentPage++;
        getPopularMovies();
    }
});

sortDropdown.addEventListener('click', function() {
    const defaultOption = document.querySelector('#mainSortDropdown option[value="default"]');
    if (defaultOption) {
        defaultOption.textContent = "Default";
    }
});

sortDropdown.addEventListener('change', function(e) {
    const sortType = e.target.value;
    
    if (originalMovieOrder.length === 0) {
        originalMovieOrder = [...allMovies]; 
    }
    
    if (sortType === 'rating') {
        allMovies.sort((a, b) => b.vote_average - a.vote_average);
    } else if (sortType === 'date') {
        allMovies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    } else if (sortType === 'title') {
        allMovies.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortType === 'default') {
        allMovies = [...originalMovieOrder];
    }
    
    displayedMovies = 0; 
    movieContainer.innerHTML = ""; 
    displayMovies(); 
});

document.getElementById('nextBtn').addEventListener('click', () => { moveToNextSlide(); resetTimer(); });
document.getElementById('prevBtn').addEventListener('click', () => { moveToPrevSlide(); resetTimer(); });

searchInput.addEventListener("input", () => {
    const movieName = searchInput.value.trim();
    if (movieName === "") {
        floatingResults.style.display = "none";
    } else {
        searchMovies(movieName); 
    }
});

searchInput.addEventListener("keydown", (event) => {
    const items = floatingResults.querySelectorAll(".floating-movie-item");

    if (event.key === "ArrowDown") {
        currentFocus++;
        addActive(items);
    } 
    else if (event.key === "ArrowUp") {
        currentFocus--;
        addActive(items);
    } 
    else if (event.key === "Enter") {
        event.preventDefault(); 
        
        if (currentFocus > -1) {
            if (items) items[currentFocus].click();
        } 
        else if (items && items.length === 1) {
            items[0].click();
        }
    }
});

searchBtn.addEventListener("click", (event) => {
    event.preventDefault();
});

document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !floatingResults.contains(e.target)) {
        floatingResults.style.display = "none";
    }
});

getPopularMovies();