// Function for the hamburger menu toggle (remains simple and effective)
function toggleMenu() {
    const navLinks = document.querySelector(".nav-links");
    if (navLinks) {
        navLinks.classList.toggle("active");
    }
}

// Ensure all DOM-related scripts run after the entire page is loaded
document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;

    // =========================================================================
    // --- 1. Light/Dark Mode Toggle (Refactored) ---
    // =========================================================================
    const toggleBtn = document.getElementById("mode-toggle");
    if (toggleBtn) {
        const applyTheme = (theme) => {
            // Remove all existing theme classes and apply the new one
            body.classList.remove('light-mode', 'dark-mode');
            body.classList.add(theme);
            
            // The 'dark' class is for older components/variables, ensure it tracks the dark mode
            if (theme === 'dark-mode') {
                body.classList.add('dark');
            } else {
                body.classList.remove('dark');
            }

            localStorage.setItem("theme", theme);
            toggleBtn.textContent = (theme === "dark-mode") ? "🌙" : "☀️";
        };

        const savedTheme = localStorage.getItem("theme");
        applyTheme(savedTheme || "light-mode"); // Apply saved theme or default

        toggleBtn.addEventListener("click", () => {
            const currentTheme = body.classList.contains("dark-mode") ? "dark-mode" : "light-mode";
            const newTheme = currentTheme === "dark-mode" ? "light-mode" : "dark-mode";
            applyTheme(newTheme);
        });
    }

    // =========================================================================
    // --- 2. Image Modal (Lightbox) Functions (Unified and reusable) ---
    // =========================================================================
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const closeBtn = document.querySelector(".modal .close");

    if (modal && modalImg && closeBtn) {
        const openModal = (imgElement) => {
            modal.style.display = "flex"; 
            modalImg.src = imgElement.src;
            modalImg.alt = imgElement.alt;
        };

        const attachModalListeners = (selector) => {
            document.querySelectorAll(selector).forEach((img) => {
                 // Remove existing listener if present before attaching new one
                 if (img._modalListener) {
                     img.removeEventListener("click", img._modalListener); 
                 }
                
                 img._modalListener = function () {
                     openModal(this);
                 };
                 img.style.cursor = "zoom-in";
                 img.addEventListener("click", img._modalListener);
            });
        };

        // Close modal when 'x' is clicked
        closeBtn.addEventListener("click", () => modal.style.display = "none");

        // Close modal when clicking outside the image content (on the dark overlay)
        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });

        // Initial listeners for Awards/Testimonials (assuming these selectors exist on the page)
        attachModalListeners(".award-card img, .testimonial-card img");

    }
    
    // =========================================================================
    // --- 3. Patchnote badge popup logic (Simplified Global Click Listener) ---
    // =========================================================================
    const patchnoteBadge = document.getElementById('patchnote-badge');
    const patchnotePopup = document.getElementById('patchnote-popup');

    // IMPORTANT: Target the full-screen overlay for show/hide
    const patchnoteFullPopup = document.getElementById('full-patchnote-overlay'); 

    const patchnoteFullContent = document.getElementById('patchnote-full-content');
    const viewFullPatchnoteBtn = document.getElementById('view-full-patchnote');
    const closePatchnoteBtn = document.getElementById('close-patchnote');
    const closeFullPatchnoteBtn = document.getElementById('close-full-patchnote');

    if (patchnoteBadge && patchnotePopup && patchnoteFullPopup) {
        const closeAllPatchnotes = () => {
            patchnotePopup.style.display = 'none';
            patchnoteFullPopup.style.display = 'none'; // Closes the full-screen overlay
        }
        
        patchnoteBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            if (patchnotePopup.style.display === 'block') {
                patchnotePopup.style.display = 'none';
            } else {
                closeAllPatchnotes(); 
                patchnotePopup.style.display = 'block';
            }
        });

        [closePatchnoteBtn, closeFullPatchnoteBtn].forEach(btn => {
            if (btn) btn.addEventListener('click', (e) => { e.stopPropagation(); closeAllPatchnotes(); });
        });

        if (viewFullPatchnoteBtn) {
            viewFullPatchnoteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                patchnoteFullContent.innerHTML = '<h2>Loading Patch Notes...</h2>';
                
                // Show the full-screen overlay
                patchnoteFullPopup.style.display = 'block'; 
                
                patchnotePopup.style.display = 'none';

                fetch('patchnotes.html')
                    .then(response => {
                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                        return response.text();
                    })
                    .then(html => {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = html;
                        const patchList = tempDiv.querySelector('.patch-list');

                        if (patchList) {
                            patchnoteFullContent.innerHTML = patchList.outerHTML;
                        } else {
                            patchnoteFullContent.innerHTML = '<h2>Patch Notes Content Missing</h2>';
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching patch notes:', error);
                        patchnoteFullContent.innerHTML = '<h2>Error Loading Patch Notes</h2><p>Failed to load patch notes.</p>';
                    });
            });
        }

        window.addEventListener('click', (e) => {
            // Close small popup if clicking outside
            if (patchnotePopup.style.display === 'block' && !patchnotePopup.contains(e.target) && !patchnoteBadge.contains(e.target)) {
                patchnotePopup.style.display = 'none';
            }
            // Close full popup overlay if clicking outside the content
            if (patchnoteFullPopup.style.display === 'block' && !document.getElementById('patchnote-full-popup').contains(e.target) && e.target !== viewFullPatchnoteBtn) {
                 patchnoteFullPopup.style.display = 'none';
            }
        });

        [patchnotePopup, document.getElementById('patchnote-full-popup')].forEach(popup => {
            if (popup) popup.addEventListener('click', (e) => e.stopPropagation());
        });
    }
    
    // =========================================================================
    // --- 4. Project Carousel Scripts (2D Sliding/Scaling - Index Page) ---
    // =========================================================================
    
    const carouselTrack = document.querySelector(".IndexProject-carousel-track");
    const prevArrow = document.querySelector(".IndexProject-carousel-arrow.prev");
    const nextArrow = document.querySelector(".IndexProject-carousel-arrow.next");
    let currentIndex = 0;

    if (carouselTrack && prevArrow && nextArrow) {
        
        const allCards = carouselTrack.querySelectorAll(".IndexProject-card");
        const totalCards = allCards.length;

        const getCardStyles = (index, totalCards, currentActiveIndex) => {
            let distance = index - currentActiveIndex;
            
            // Circular logic to wrap around
            if (distance > totalCards / 2) distance -= totalCards;
            if (distance < -totalCards / 2) distance += totalCards;

            let translateX_offset, scale, zIndex, opacity, pointerEvents, visibility;

            // Defines the visual position based on distance
            if (distance === 0) {
                translateX_offset = "0"; scale = 1.1; zIndex = 20; opacity = 1; pointerEvents = "auto"; visibility = "visible";
            } else if (distance === -1) {
                translateX_offset = "-60%"; scale = 0.9; zIndex = 15; opacity = 0.7; pointerEvents = "auto"; visibility = "visible";
            } else if (distance === 1) {
                translateX_offset = "60%"; scale = 0.9; zIndex = 15; opacity = 0.7; pointerEvents = "auto"; visibility = "visible";
            } else {
                translateX_offset = distance < 0 ? "-200%" : "200%"; scale = 0.7; opacity = 0; zIndex = 1; visibility = "hidden";
            }

            return {
                transform: `translate(-50%, -50%) translateX(${translateX_offset}) scale(${scale})`,
                zIndex: zIndex,
                opacity: opacity,
                pointerEvents: pointerEvents,
                visibility: visibility,
                left: "50%",
                top: "50%",
                position: "absolute",
                transition: "transform 0.5s ease-in-out, opacity 0.5s ease-in-out, visibility 0.5s ease-in-out",
            };
        };
        
        const renderCarousel = () => {
            allCards.forEach((card, index) => {
                Object.assign(card.style, getCardStyles(index, totalCards, currentIndex));
            });
        };

        const nextSlide = () => { 
            currentIndex = (currentIndex + 1) % totalCards; 
            renderCarousel(); 
        };
        const prevSlide = () => { 
            currentIndex = (currentIndex - 1 + totalCards) % totalCards; 
            renderCarousel(); 
        };

        prevArrow.addEventListener("click", nextSlide);
        nextArrow.addEventListener("click", prevSlide);

        renderCarousel(); // Initial render to position the cards
    }

    // =========================================================================
    // --- 5. Simple Carousel Abstraction (Leadership & Volunteering) ---
    // =========================================================================

    const createSimpleCarousel = (data, cardTrackSelector, imageElementId, prevArrowSelector, nextArrowSelector, containerSelector, cardClass, iconClass) => {
        const cardTrack = document.querySelector(cardTrackSelector);
        const currentImage = document.getElementById(imageElementId);
        const prevArrow = document.querySelector(prevArrowSelector);
        const nextArrow = document.querySelector(nextArrowSelector);
        const container = document.querySelector(containerSelector);

        if (!cardTrack || !currentImage || !data.length) return;

        let currentIndex = 0;
        let interval;
        const transitionDuration = 500; 

        const getCardStyles = (index, currentActiveIndex) => {
            const distance = index - currentActiveIndex;
            let transform;
            
            if (distance === 0) {
                transform = "translateX(0%)";
            } else {
                transform = distance > 0 ? "translateX(100%)" : "translateX(-100%)";
            }
            
            return {
                opacity: distance === 0 ? 1 : 0,
                pointerEvents: distance === 0 ? "auto" : "none",
                transform: transform,
                zIndex: distance === 0 ? 10 : 1,
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                transition: `opacity ${transitionDuration/1000}s ease-in-out, transform ${transitionDuration/1000}s ease-in-out`,
            };
        };
        
        const renderCarousel = () => {
            currentImage.src = data[currentIndex].image;
            currentImage.alt = `Image for: ${data[currentIndex].title}`;

            if (cardTrack.children.length === 0) {
                data.forEach((item, index) => {
                    const card = document.createElement("div");
                    card.classList.add(cardClass);
                    card.dataset.index = index;

                    card.innerHTML = `
                        <h3><i class="${iconClass}"></i> ${item.title}</h3>
                        <p>${item.paragraph1}</p>
                        <p>${item.paragraph2 || ''}</p>
                    `;
                    cardTrack.appendChild(card);
                });
            }

            const allCards = cardTrack.querySelectorAll(`.${cardClass}`);
            allCards.forEach((card, index) => {
                 Object.assign(card.style, getCardStyles(index, currentIndex));
            });
        };

        const nextSlide = () => { currentIndex = (currentIndex + 1) % data.length; renderCarousel(); };
        const prevSlide = () => { currentIndex = (currentIndex - 1 + data.length) % data.length; renderCarousel(); };

        const startAutoScroll = () => {
            if (data.length > 1) {
                stopAutoScroll(); 
                interval = setInterval(nextSlide, 4000);
            }
        };
        const stopAutoScroll = () => { clearInterval(interval); };
        
        if (prevArrow) prevArrow.addEventListener("click", () => { stopAutoScroll(); prevSlide(); startAutoScroll(); });
        if (nextArrow) nextArrow.addEventListener("click", () => { stopAutoScroll(); nextSlide(); startAutoScroll(); });

        if (container) {
            container.addEventListener('mouseenter', stopAutoScroll);
            container.addEventListener('mouseleave', startAutoScroll);
            container.addEventListener('touchstart', stopAutoScroll);
            container.addEventListener('touchend', startAutoScroll); 
            startAutoScroll();
        }
        
        renderCarousel();
    };

    // --- Leadership Carousel Initialization ---
    const leadershipData = [
        { id: 1, title: "Early Leadership & Peer Support", paragraph1: "During secondary school and ITE...", paragraph2: "As a Peer Support Leader...", image: "../images/leadership-placeholder.jpg" },
        { id: 2, title: "National Cadet Corps (NCC) Leadership", paragraph1: "In the National Cadet Corps (NCC)...", paragraph2: "This experience developed my leadership...", image: "../images/leadership-NCC.jpg" },
        { id: 3, title: "Entrepreneurship Club & Student Mentor", paragraph1: "At ITE, I further grew as a leader...", paragraph2: "Additionally, as a Student Mentor...", image: "../images/leadership-placeholder-3.jpg" }
    ];
    createSimpleCarousel(leadershipData, ".leadership-card-track", "currentLeadershipImage", ".leadership-arrow.prev", ".leadership-arrow.next", '.leadership-carousel-container', 'leadership-card', 'fas fa-user-tie');

    // --- Volunteering Carousel Initialization ---
    const volunteeringData = [
        { id: 1, title: "Project Rice (ITE College East)", paragraph1: "At ITE College East, I became more involved...", paragraph2: null, image: "../images/Volunteering-ProjectRice.jpg" },
        { id: 2, title: "Meals on Wheels (Bethesda Care Services)", paragraph1: "The most rewarding experience was with Meals on Wheels...", paragraph2: "This experience deepened my empathy...", image: "../images/Volunteering-MealsOnWheels1.jpg" },
    ];
    createSimpleCarousel(volunteeringData, ".volunteering-card-track", "currentVolunteeringImage", ".volunteering-arrow.prev", ".volunteering-arrow.next", '.volunteering-carousel-container', 'volunteering-card', 'fas fa-hands-helping');


    // =========================================================================
    // --- 6. Contact Form Submission (Retained AJAX functionality) ---
    // =========================================================================
    const contactForm = document.getElementById("contact-form");
    const formPopup = document.getElementById("form-popup");

    if (contactForm && formPopup) {
        contactForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const form = e.target;
            const submitButton = form.querySelector('.submit-button-portfolio');
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            const formData = new FormData(form);

            try {
                const response = await fetch("https://formspree.io/f/xldbagko", {
                    method: "POST",
                    headers: { Accept: "application/json" },
                    body: formData
                });

                if (response.ok) {
                    form.reset();
                    formPopup.textContent = "✅ Your message has been sent successfully. I'll be in touch!";
                    formPopup.classList.add("show", "success");
                } else {
                    const data = await response.json();
                    const errorMessage = data.errors ? data.errors.map(error => error.message).join(', ') : 'An unknown error occurred.';
                    formPopup.textContent = `❌ Error: ${errorMessage}`;
                    formPopup.classList.add("show", "error");
                }
            } catch (error) {
                console.error("Form submission error:", error);
                formPopup.textContent = '❌ Network error. Please check your connection and try again.';
                formPopup.classList.add("show", "error");
            } finally {
                // Re-enable button and reset text after 1 second delay
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Send Message';
                }, 1000);

                // Hide popup after 5 seconds
                setTimeout(() => {
                    formPopup.classList.remove("show", "success", "error");
                }, 5000);
            }
        });
    }


    // =========================================================================
    // --- 7. "View More" Button for Skills ---
    // =========================================================================
    const toggleSkillsBtn = document.getElementById("toggle-skills-btn");
    if (toggleSkillsBtn) {
        toggleSkillsBtn.addEventListener("click", function () {
            const hiddenSkills = document.querySelector(".hidden-skill");
            const isExpanded = this.getAttribute("data-expanded") === "true";

            if (hiddenSkills) { 
                hiddenSkills.classList.toggle("expanded", !isExpanded);
            }
            this.textContent = isExpanded ? "View More >" : "View Less <";
            this.setAttribute("data-expanded", !isExpanded);
        });
    }

    // =========================================================================
    // --- 8. Project View Toggle (List/Grid) ---
    // =========================================================================
    function setupProjectViewToggle() {
        const listViewBtn = document.getElementById('list-view');
        const gridViewBtn = document.getElementById('grid-view');
        const projectContainer = document.getElementById('project-list-container');

        if (!listViewBtn || !gridViewBtn || !projectContainer) {
            return;
        }
        
        // Function to apply the view mode
        const applyViewMode = (mode) => {
            // Toggle the class on the main project list container
            projectContainer.classList.remove('list-view', 'grid-view');
            projectContainer.classList.add(mode);

            // Update active button state
            listViewBtn.classList.remove('active');
            gridViewBtn.classList.remove('active');

            if (mode === 'list-view') {
                listViewBtn.classList.add('active');
            } else {
                gridViewBtn.classList.add('active');
            }
            
            // Save the preferred view mode to local storage
            localStorage.setItem('projectViewMode', mode);
        };

        // --- Initialization (Ensures the saved view loads) ---
        const savedViewMode = localStorage.getItem('projectViewMode') || 'grid-view';
        applyViewMode(savedViewMode);

        // 2. Event Listeners for buttons
        listViewBtn.addEventListener('click', () => {
            applyViewMode('list-view');
        });

        gridViewBtn.addEventListener('click', () => {
            applyViewMode('grid-view');
        });
    }
    
    // Initialize the Project View Toggle function
    setupProjectViewToggle(); 
});