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

        // Mobile dropdown click/tap handler
        const dropdownToggles = navMenu.querySelectorAll('.nav-item-dropdown > a, .nav-item-dropdown .dropdown-toggle');
        dropdownToggles.forEach(toggleBtn => {
            toggleBtn.addEventListener('click', function (e) {
                const isMobile = window.innerWidth <= 991 || navMenu.classList.contains('active');
                if (isMobile) {
                    e.preventDefault();
                    e.stopPropagation();
                    const parent = this.closest('.nav-item-dropdown');
                    const isCurrentlyOpen = parent.classList.contains('open');

                    // Close any other open dropdowns in mobile menu (accordion style)
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

    window.toggleSiteTheme = function () {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        document.body.setAttribute('data-theme', newTheme);
        try {
            localStorage.setItem('shomaji_theme', newTheme);
        } catch (e) {
            console.error('Could not save theme preference:', e);
        }
        updateThemeToggleUI(newTheme);
    };

    // Apply saved theme on DOM ready
    const savedTheme = (function() {
        try {
            return localStorage.getItem('shomaji_theme') || 'dark';
        } catch(e) {
            return 'dark';
        }
    })();
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeToggleUI(savedTheme);

    // Header scroll & Back to top button
    const header = document.querySelector('.site-header');
    const backToTopBtn = document.querySelector('.back-to-top');

    window.addEventListener('scroll', function () {
        if (header) {
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        if (backToTopBtn) {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
    });

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

        // Touch swipe support (Mobile & Tablet)
        let touchStartX = 0;
        let touchEndX = 0;
        sliderWrap.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderWrap.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            if (Math.abs(diff) > 40) {
                if (diff < 0) {
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
});
