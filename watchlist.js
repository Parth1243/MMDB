const API_KEY = "ae4ebfd6169b89a98bf9d603cb53e53f";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const movieContainer = document.getElementById("movieContainer");
const loadingText = document.getElementById("loadingText");

async function loadWatchlist() {
    let watchlist = JSON.parse(localStorage.getItem('mmdb_watchlist')) || [];
    if (watchlist.length === 0) {
        movieContainer.innerHTML = "<h2 class='empty-msg' style='white-space:nowrap;'>Your watchlist is empty. Go add some movies!</h2>";
        return;
    }
    movieContainer.innerHTML = "";
    for (let savedMovie of watchlist) {
        try {
            const response = await fetch(`${BASE_URL}/movie/${savedMovie.id}?api_key=${API_KEY}`);
            const movie = await response.json();

            const genres = movie.genres ? movie.genres.slice(0, 3).map(g => g.name).join(", ") : "N/A";
            const card = document.createElement("div");
            card.classList.add("movie-card");

            card.setAttribute("onclick", `window.location.href='details.html?id=${movie.id}'`);
            card.innerHTML = `
                <img src="${movie.poster_path ? IMAGE_URL + movie.poster_path : "https://via.placeholder.com/300x450?text=No+Image"}" alt="${movie.title}">
                
                <div class="card-overlay">
                    <button class="watchlist-icon-btn added" 
                            onclick="removeFromWatchlist(event, this, ${movie.id})">
                        <i class="fa-solid fa-check"></i>
                    </button>

                    <h3>${movie.title}</h3>
                    <p class="genres">${genres}</p>
                    <div class="bottom-info">
                        <p>⭐ ${movie.vote_average.toFixed(1)}</p>
                        <p>Release - ${movie.release_date ? movie.release_date.split('-')[0] : "N/A"}</p>
                    </div>
                </div>
            `;
            
            movieContainer.appendChild(card);
            
        } catch (error) {
            console.log("Error fetching movie for watchlist:", error);
        }
    }
}

window.removeFromWatchlist = function(event, buttonElement, movieId) {
    event.stopPropagation();
    let watchlist = JSON.parse(localStorage.getItem('mmdb_watchlist')) || [];
    watchlist = watchlist.filter(m => m.id !== movieId);
    
    localStorage.setItem('mmdb_watchlist', JSON.stringify(watchlist));
    const card = buttonElement.closest('.movie-card');
    card.style.transform = "scale(0)";
    card.style.opacity = "0";
    
    setTimeout(() => {
        card.remove();
        
        if (watchlist.length === 0) {
            movieContainer.innerHTML = "<h2 class='empty-msg' style='white-space:nowrap;'>Your watchlist is empty. Go add some movies!</h2>";
        }
    }, 300);
};

loadWatchlist();

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
    }
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const isCurrentlyDark = !body.classList.contains("light-mode");
            applyTheme(isCurrentlyDark);
            localStorage.setItem("mmdb_theme", isCurrentlyDark ? "light" : "dark");
        });
    }
});

async function loadWatchlistStats() {
    const watchlist = JSON.parse(localStorage.getItem('mmdb_watchlist')) || [];
    
    const statTotal = document.getElementById("statTotal");
    const statRating = document.getElementById("statRating");
    const statGenre = document.getElementById("statGenre");

    if (!statTotal || watchlist.length === 0) {
        if(statTotal) statTotal.innerText = "0";
        if(statRating) statRating.innerText = "0.0";
        if(statGenre) statGenre.innerText = "-";
        return;
    }

    statTotal.innerText = watchlist.length;
    statRating.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="font-size:1.2rem;"></i>';
    statGenre.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="font-size:1.2rem;"></i>';

    let totalRating = 0;
    let genreCounts = {};

    try {
        const API_KEY = "ae4ebfd6169b89a98bf9d603cb53e53f";

        const fetchPromises = watchlist.map(movie => 
            fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}`).then(res => res.json())
        );

        const moviesData = await Promise.all(fetchPromises);
        moviesData.forEach(data => {
            if (data.vote_average) {
                totalRating += data.vote_average;
            }

            if (data.genres) {
                data.genres.forEach(g => {
                    genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
                });
            }
        });

        const avg = totalRating / moviesData.length;
        statRating.innerText = avg.toFixed(1);

        let topGenre = "-";
        let maxCount = 0;
        for (const [genre, count] of Object.entries(genreCounts)) {
            if (count > maxCount) {
                maxCount = count;
                topGenre = genre;
            }
        }
        statGenre.innerText = topGenre;

    } catch (error) {
        console.error("Error calculating stats:", error);
        statRating.innerText = "N/A";
        statGenre.innerText = "N/A";
    }
}
document.addEventListener("DOMContentLoaded", () => {
    loadWatchlistStats();
});