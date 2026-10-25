document.addEventListener('DOMContentLoaded', function () {
    // Mobile Menu & Submenu Toggle Handlers
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle && navMenu) {
        const setMenuOpen = isOpen => {
            navMenu.classList.toggle('active', isOpen);
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (!isOpen) {
                // When drawer closes, collapse all open submenus
                navMenu.querySelectorAll('.nav-item-dropdown.open, .nav-item-dropdown.active').forEach(dd => {
                    dd.classList.remove('open', 'active');
                    const toggle = dd.querySelector('.dropdown-toggle');
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
                });
            }
        };

        menuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            setMenuOpen(!navMenu.classList.contains('active'));
        });

        // Dropdown click/tap handler (Works seamlessly on Desktop click/touch & Mobile)
        const dropdownToggles = navMenu.querySelectorAll('.nav-item-dropdown > a, .nav-item-dropdown .dropdown-toggle');
        dropdownToggles.forEach(toggleBtn => {
            toggleBtn.addEventListener('click', function (e) {
                if (window.innerWidth <= 991 || navMenu.classList.contains('active')) {
                    e.preventDefault();
                }
                const parent = this.closest('.nav-item-dropdown');
                if (parent) {
                    const isCurrentlyOpen = parent.classList.contains('open');

                    // Close any other open dropdowns
                    navMenu.querySelectorAll('.nav-item-dropdown.open').forEach(item => {
                        if (item !== parent) {
                            item.classList.remove('open', 'active');
                            const otherToggle = item.querySelector('.dropdown-toggle');
                            if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
                        }
                    });

                    // Toggle current dropdown
                    parent.classList.toggle('open', !isCurrentlyOpen);
                    parent.classList.toggle('active', !isCurrentlyOpen);
                    this.setAttribute('aria-expanded', !isCurrentlyOpen ? 'true' : 'false');
                }
            });
        });

        // Close menu when clicking regular links or submenu items
        navMenu.querySelectorAll('a').forEach(link => {
            // Skip dropdown triggers so they can toggle without closing the menu
            if (link.classList.contains('dropdown-toggle') || link.matches('.nav-item-dropdown > a')) {
                return;
            }
            link.addEventListener('click', function () {
                setMenuOpen(false);
            });
        });

        // Close on clicking outside
        document.addEventListener('click', function (e) {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('active')) {
                setMenuOpen(false);
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                setMenuOpen(false);
                menuToggle.focus();
            }
        });
    }

    // Modal Consultation Popup
    const consultationBtns = document.querySelectorAll('.open-consultation-modal');
    const consultationModal = document.getElementById('consultationModal');
    const modalClose = document.querySelectorAll('.modal-close');

    consultationBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (consultationModal) {
                consultationModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    modalClose.forEach(btn => {
        btn.addEventListener('click', function () {
            if (consultationModal) {
                consultationModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    });

    if (consultationModal) {
        consultationModal.addEventListener('click', function (e) {
            if (e.target === consultationModal) {
                consultationModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // AJAX Handler for Appointment Forms
    const appointmentForms = document.querySelectorAll('.ajax-appointment-form');
    appointmentForms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Submitting...';
            }

            const formData = new FormData(form);
            fetch(form.action, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    form.reset();
                    alert(data.message || 'Consultation request submitted successfully!');
                    if (consultationModal) consultationModal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                } else {
                    alert('There was a problem submitting your request. Please check all fields.');
                }
            })
            .catch(error => {
                console.error(error);
                form.submit(); // fallback to regular submit
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            });
        });
    });

    // Theme Switcher & Initialization
    function updateThemeToggleUI(theme) {
        const label = document.getElementById('themeToggleLabel');
        const btn = document.getElementById('themeToggleBtn');
        if (label) {
            label.textContent = theme === 'dark' ? 'Light' : 'Dark';
        }
        if (btn) {
            btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
            btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
        }
    }

    function setSiteTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('shomaji_theme', theme);
        } catch (e) {
            console.error('Could not save theme preference:', e);
        }
        updateThemeToggleUI(theme);
    }

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function () {
            const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            setSiteTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    window.toggleSiteTheme = function () {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        setSiteTheme(currentTheme === 'dark' ? 'light' : 'dark');
    };

    // Apply saved theme on DOM ready
    const savedTheme = (function() {
        try {
            const theme = localStorage.getItem('shomaji_theme');
            return theme === 'light' || theme === 'dark' ? theme : 'dark';
        } catch(e) {
            return 'dark';
        }
    })();
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeToggleUI(savedTheme);

    // Header scroll & Back to top button (Jitter-free with Hysteresis Buffer)
    const header = document.querySelector('.site-header');
    const backToTopBtn = document.querySelector('.back-to-top');
    let isHeaderScrolled = false;
    let isBackToTopVisible = false;
    let scrollRafId = null;

    function handleScrollUpdate() {
        const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;

        // Hysteresis buffer: add at > 65px, remove at < 25px (no oscillation around 40px)
        if (header) {
            if (!isHeaderScrolled && currentY > 65) {
                isHeaderScrolled = true;
                header.classList.add('scrolled');
            } else if (isHeaderScrolled && currentY < 25) {
                isHeaderScrolled = false;
                header.classList.remove('scrolled');
            }
        }

        if (backToTopBtn) {
            if (!isBackToTopVisible && currentY > 350) {
                isBackToTopVisible = true;
                backToTopBtn.classList.add('show');
            } else if (isBackToTopVisible && currentY < 250) {
                isBackToTopVisible = false;
                backToTopBtn.classList.remove('show');
            }
        }
        scrollRafId = null;
    }

    window.addEventListener('scroll', function () {
        if (!scrollRafId) {
            scrollRafId = window.requestAnimationFrame(handleScrollUpdate);
        }
    }, { passive: true });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ==========================================
    // Hero Image Slider (60% Right-side Slider)
    // ==========================================
    const sliderWrap = document.querySelector('.hero-slider-wrap');
    if (sliderWrap) {
        const slides = sliderWrap.querySelectorAll('.hero-slide');
        const dots = sliderWrap.querySelectorAll('.hero-slider-dot');
        const prevBtn = sliderWrap.querySelector('.hero-slider-arrow.prev');
        const nextBtn = sliderWrap.querySelector('.hero-slider-arrow.next');
        const counter = sliderWrap.querySelector('.hero-slider-counter');
        const progressBar = sliderWrap.querySelector('.hero-slider-progress-bar');
        
        const totalSlides = slides.length;
        let currentIndex = 0;
        let slideTimer = null;
        let progressTimer = null;
        const SLIDE_DURATION = 5000;
        let progressStartTime = 0;
        let isPaused = false;

        function updateCounter(index) {
            if (counter) {
                const pad = num => (num < 10 ? '0' + num : num);
                counter.textContent = `${pad(index + 1)} / ${pad(totalSlides)}`;
            }
        }

        function startProgressBar() {
            if (!progressBar) return;
            clearInterval(progressTimer);
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
            
            void progressBar.offsetWidth;
            
            progressStartTime = Date.now();
            progressTimer = setInterval(() => {
                if (isPaused) return;
                const elapsed = Date.now() - progressStartTime;
                const percent = Math.min(100, (elapsed / SLIDE_DURATION) * 100);
                progressBar.style.transition = 'width 0.1s linear';
                progressBar.style.width = percent + '%';
                if (percent >= 100) {
                    clearInterval(progressTimer);
                }
            }, 100);
        }

        function goToSlide(index) {
            if (totalSlides === 0) return;
            
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;

            slides[currentIndex].classList.remove('active');
            if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

            currentIndex = index;

            slides[currentIndex].classList.add('active');
            if (dots[currentIndex]) dots[currentIndex].classList.add('active');

            updateCounter(currentIndex);
            startProgressBar();
        }

        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        function prevSlide() {
            goToSlide(currentIndex - 1);
        }

        function startAutoPlay() {
            stopAutoPlay();
            startProgressBar();
            slideTimer = setInterval(() => {
                if (!isPaused) {
                    nextSlide();
                }
            }, SLIDE_DURATION);
        }

        function stopAutoPlay() {
            if (slideTimer) clearInterval(slideTimer);
            if (progressTimer) clearInterval(progressTimer);
        }

        // Arrow controls
        if (nextBtn) {
            nextBtn.addEventListener('click', function (e) {
                e.preventDefault();
                nextSlide();
                startAutoPlay();
            });
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', function (e) {
                e.preventDefault();
                prevSlide();
                startAutoPlay();
            });
        }

        // Dot controls
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', function (e) {
                e.preventDefault();
                goToSlide(idx);
                startAutoPlay();
            });
        });

        // Pause on hover
        sliderWrap.addEventListener('mouseenter', function () {
            isPaused = true;
        });
        sliderWrap.addEventListener('mouseleave', function () {
            isPaused = false;
            progressStartTime = Date.now() - (parseFloat(progressBar ? progressBar.style.width : 0) / 100 * SLIDE_DURATION);
        });

        // Touch swipe support (Mobile & Tablet with Scroll-Safe Gesture Tracking)
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        sliderWrap.addEventListener('touchstart', function (e) {
            if (!e.changedTouches || e.changedTouches.length === 0) return;
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        sliderWrap.addEventListener('touchend', function (e) {
            if (!e.changedTouches || e.changedTouches.length === 0) return;
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            // Only trigger horizontal slide switch if user intentionally swiped horizontally more than vertically
            if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
                if (diffX < 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
                startAutoPlay();
            }
        }, { passive: true });

        // Keyboard navigation
        sliderWrap.setAttribute('tabindex', '0');
        sliderWrap.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') {
                nextSlide();
                startAutoPlay();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
                startAutoPlay();
            }
        });

        // Init
        updateCounter(0);
        startAutoPlay();
    }

    // Case Studies "View More" Toggle Handler
    const toggleMoreCasesBtn = document.getElementById('toggleMoreCasesBtn');
    if (toggleMoreCasesBtn) {
        const extraCards = document.querySelectorAll('.case-card-extra');
        const btnText = toggleMoreCasesBtn.querySelector('.btn-text');
        const totalMore = extraCards.length;
        let isExpanded = false;

        toggleMoreCasesBtn.addEventListener('click', function () {
            isExpanded = !isExpanded;
            this.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            this.classList.toggle('is-expanded', isExpanded);

            if (isExpanded) {
                extraCards.forEach((card, index) => {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.classList.add('is-visible');
                    }, index * 35);
                });
                if (btnText) {
                    btnText.textContent = 'Show Fewer Cases';
                }
            } else {
                extraCards.forEach(card => {
                    card.classList.remove('is-visible');
                    card.style.display = 'none';
                });
                if (btnText) {
                    btnText.textContent = `View More Case Studies (${totalMore} More)`;
                }
                const casesSection = document.getElementById('cases');
                if (casesSection) {
                    casesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    }

    // Automatic Active Navigation Link Highlighter
    function syncActiveNav() {
        const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
        const currentHash = window.location.hash;
        const navLinks = document.querySelectorAll('.nav-menu .nav-link, .nav-menu .dropdown-menu a');
        if (!navLinks.length) return;

        // If hash exists (e.g. preview mode #view-about or #view-practice-areas)
        if (currentHash && currentHash.startsWith('#view-')) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                const parentLi = link.closest('li');
                if (parentLi) parentLi.classList.remove('active');
            });
            document.querySelectorAll('.nav-item-dropdown').forEach(dd => {
                dd.classList.remove('active');
                const toggle = dd.querySelector('.dropdown-toggle');
                if (toggle) toggle.classList.remove('active');
            });

            let matched = false;
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === currentHash) {
                    link.classList.add('active');
                    const parentDropdown = link.closest('.nav-item-dropdown');
                    if (parentDropdown) {
                        parentDropdown.classList.add('active');
                        const toggle = parentDropdown.querySelector('.dropdown-toggle');
                        if (toggle) toggle.classList.add('active');
                    }
                    matched = true;
                }
            });

            if (!matched) {
                if (currentHash.includes('practice-area')) {
                    const pa = document.querySelector('.nav-menu a[href="#view-practice-areas"], .nav-menu a[href*="practice-areas"]');
                    if (pa) {
                        pa.classList.add('active');
                        const dd = pa.closest('.nav-item-dropdown');
                        if (dd) dd.classList.add('active');
                    }
                } else if (currentHash.includes('attorney') || currentHash.includes('team')) {
                    const team = document.querySelector('.nav-menu a[href="#view-attorneys"], .nav-menu a[href="#view-team"], .nav-menu a[href*="attorneys"]');
                    if (team) team.classList.add('active');
                } else if (currentHash.includes('gallery') || currentHash.includes('video') || currentHash.includes('blog')) {
                    const dds = document.querySelectorAll('.nav-item-dropdown');
                    if (dds[1]) {
                        dds[1].classList.add('active');
                        const toggle = dds[1].querySelector('.dropdown-toggle');
                        if (toggle) toggle.classList.add('active');
                    }
                } else if (currentHash === '#view-about') {
                    const ab = document.querySelector('.nav-menu a[href="#view-about"]');
                    if (ab) ab.classList.add('active');
                } else if (currentHash === '#view-contact') {
                    const ct = document.querySelector('.nav-menu a[href="#view-contact"]');
                    if (ct) ct.classList.add('active');
                } else if (currentHash === '#view-home') {
                    const hm = document.querySelector('.nav-menu a[href="#view-home"]');
                    if (hm) hm.classList.add('active');
                }
            }
            return;
        }

        // Multi-page Laravel matching based on URL pathname
        let bestMatch = null;
        let bestMatchLen = 0;

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href === '#' || href.startsWith('javascript:')) return;

            try {
                const linkUrl = new URL(href, window.location.origin);
                const linkPath = linkUrl.pathname.replace(/\/+$/, '') || '/';

                if (linkPath === currentPath) {
                    bestMatch = link;
                    bestMatchLen = 9999;
                } else if (linkPath !== '/' && currentPath.startsWith(linkPath) && linkPath.length > bestMatchLen) {
                    bestMatch = link;
                    bestMatchLen = linkPath.length;
                }
            } catch (e) {}
        });

        if (bestMatch) {
            navLinks.forEach(l => {
                if (l !== bestMatch) l.classList.remove('active');
            });
            bestMatch.classList.add('active');
            const parentDropdown = bestMatch.closest('.nav-item-dropdown');
            if (parentDropdown) {
                parentDropdown.classList.add('active');
                const toggle = parentDropdown.querySelector('.dropdown-toggle');
                if (toggle) toggle.classList.add('active');
            }
        }
    }

    syncActiveNav();
    window.addEventListener('hashchange', syncActiveNav);
    window.addEventListener('popstate', syncActiveNav);
});
