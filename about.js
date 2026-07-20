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




//fade-in effect
document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("aboutContent");
    setTimeout(() => {
        content.style.transition = "opacity 1s ease-out, transform 1s ease-out";
        content.style.opacity = "1";
        content.style.transform = "translateY(0)";
    }, 200);
});




