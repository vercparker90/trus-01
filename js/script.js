// Language system
let currentLanguage = 'en';
let translations = {};

// Initialize language system
async function initLanguage() {
    try {
        const response = await fetch('translations.json');
        translations = await response.json();

        // Detect browser language
        const browserLang = detectBrowserLanguage();
        currentLanguage = browserLang;

        // Load from localStorage if exists
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang) {
            currentLanguage = savedLang;
        }

        setLanguage(currentLanguage);

        // Ensure language display is updated after a small delay
        setTimeout(() => {
            updateLanguageDisplay();
        }, 100);
    } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback to English if translations don't load
        currentLanguage = 'en';
    }
}

function detectBrowserLanguage() {
    const browserLang = (navigator.language || navigator.userLanguage).split('-')[0];
    const availableLangs = ['en', 'ru', 'de', 'fr', 'es', 'pt', 'uk', 'zh'];

    // Check if browser language is available
    if (availableLangs.includes(browserLang)) {
        return browserLang;
    }

    // Check if partial language match exists (e.g., 'en' from 'en-US')
    const partialMatch = availableLangs.find(lang => browserLang.startsWith(lang));
    if (partialMatch) {
        return partialMatch;
    }

    // Default to English
    return 'en';
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    updateLanguageDisplay();
    updatePageTranslations();
    document.documentElement.lang = lang;
}

function updateLanguageDisplay() {
    const langToggle = document.getElementById('lang-toggle');
    const mobileLangToggle = document.getElementById('mobile-lang-toggle');
    const langMap = {
        'en': { text: 'EN', flag: 'рџ‡єрџ‡ё' },
        'ru': { text: 'Р РЈ', flag: 'рџ‡·рџ‡є' },
        'de': { text: 'DE', flag: 'рџ‡©рџ‡Є' },
        'fr': { text: 'FR', flag: 'рџ‡«рџ‡·' },
        'es': { text: 'ES', flag: 'рџ‡Єрџ‡ё' },
        'pt': { text: 'PT', flag: 'рџ‡µрџ‡№' },
        'uk': { text: 'РЈРљ', flag: 'рџ‡єрџ‡¦' },
        'zh': { text: 'дё­ж–‡', flag: 'рџ‡Ёрџ‡і' }
    };

    // Update desktop language display
    if (langToggle) {
        const currentLangSpan = langToggle.querySelector('#current-lang');
        const currentLangFlag = langToggle.querySelector('#current-lang-flag');
        if (currentLangSpan) {
            const langData = langMap[currentLanguage] || langMap['en'];
            currentLangSpan.textContent = langData.text;
            if (currentLangFlag) {
                currentLangFlag.textContent = langData.flag;
            }
        }
    }

    // Update mobile language display
    if (mobileLangToggle) {
        const mobileLangSpan = mobileLangToggle.querySelector('#mobile-current-lang');
        const mobileLangFlag = mobileLangToggle.querySelector('#mobile-current-lang-flag');
        if (mobileLangSpan) {
            const langData = langMap[currentLanguage] || langMap['en'];
            mobileLangSpan.textContent = langData.text;
            if (mobileLangFlag) {
                mobileLangFlag.textContent = langData.flag;
            }
        }
    }

    // Update active language button in desktop menu
    document.querySelectorAll('.lang-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === currentLanguage) {
            btn.classList.add('active');
        }
    });

    // Update active language button in mobile menu
    document.querySelectorAll('.mobile-lang-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === currentLanguage) {
            btn.classList.add('active');
        }
    });
}

function updatePageTranslations() {
    const currentTranslations = translations[currentLanguage] || translations['en'];

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const keys = key.split('.');
        let value = currentTranslations;

        for (const k of keys) {
            value = value?.[k];
        }

        if (value) {
            // Check if element contains HTML (like <br> tags)
            if (element.innerHTML.includes('<br') || element.innerHTML.includes('<span')) {
                // For elements with HTML, preserve structure but update text nodes
                if (element.tagName === 'H1' || element.tagName === 'H2') {
                    element.innerHTML = value.replace(/\\n/g, '<br>');
                } else if (element.classList.contains('highlight')) {
                    element.textContent = value;
                } else {
                    element.textContent = value;
                }
            } else {
                element.textContent = value;
            }
        }
    });
}

// Update active navigation link on scroll and click
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function setActiveLink() {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });

        mobileNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    }

    // Update on scroll
    window.addEventListener('scroll', setActiveLink);

    // Update on load
    setActiveLink();
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Small delay to let scroll finish before updating active link
            setTimeout(() => {
                const sections = document.querySelectorAll('section[id]');
                const navLinks = document.querySelectorAll('.nav-links a');
                const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

                const targetId = this.getAttribute('href').slice(1);
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').slice(1) === targetId) {
                        link.classList.add('active');
                    }
                });

                mobileNavLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').slice(1) === targetId) {
                        link.classList.add('active');
                    }
                });
            }, 100);
        }
    });
});

updateActiveNav();

// FAQ Accordion functionality
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const faqId = question.getAttribute('data-faq');
        const answer = document.getElementById(`faq-${faqId}`);

        // Close other open answers
        document.querySelectorAll('.faq-answer.active').forEach(activeAnswer => {
            if (activeAnswer.id !== `faq-${faqId}`) {
                activeAnswer.classList.remove('active');
            }
        });

        document.querySelectorAll('.faq-question.active').forEach(activeQuestion => {
            if (activeQuestion !== question) {
                activeQuestion.classList.remove('active');
            }
        });

        // Toggle current answer
        answer.classList.toggle('active');
        question.classList.toggle('active');
    });
});

// Animated counter for stats (if needed)
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Button click handlers
const ctaButtons = document.querySelectorAll('.btn-primary, .btn-cta');
ctaButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Add ripple effect
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);

        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    button {
        position: relative;
        overflow: hidden;
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Intersection Observer for animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe privilege cards and FAQ items
document.querySelectorAll('.privilege-card, .faq-item').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
});

// Mobile menu toggle functionality
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileMenuToggle && mobileNav) {
        // Toggle menu when clicking hamburger
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileNav.classList.toggle('active');
        });

        // Close menu when clicking a link
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
            });
        });

        // Close menu when clicking the Obtain Card button
        const obtainBtn = document.querySelector('.btn-mobile-obtain');
        if (obtainBtn) {
            obtainBtn.addEventListener('click', () => {
                mobileNav.classList.remove('active');
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar')) {
                mobileNav.classList.remove('active');
                // Also close language menu
                const mobileLangMenu = document.getElementById('mobile-lang-menu');
                if (mobileLangMenu) {
                    mobileLangMenu.classList.remove('active');
                }
                const mobileLangToggle = document.getElementById('mobile-lang-toggle');
                if (mobileLangToggle) {
                    mobileLangToggle.classList.remove('active');
                }
            }
        });

    }
}

// Language selector functionality
function initLanguageSelector() {
    const langToggle = document.getElementById('lang-toggle');
    const langMenu = document.getElementById('lang-menu');
    const langOptions = document.querySelectorAll('.lang-option');

    if (langToggle) {
        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            langMenu.classList.toggle('active');
            langToggle.classList.toggle('active');
        });
    }

    langOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const selectedLang = option.getAttribute('data-lang');
            setLanguage(selectedLang);
            // РћР±РЅРѕРІР»СЏРµРј РѕС‚РѕР±СЂР°Р¶РµРЅРёРµ СЏР·С‹РєР° РІ РєРЅРѕРїРєРµ
            updateLanguageDisplay();
            langMenu.classList.remove('active');
            if (langToggle) langToggle.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (langMenu && !e.target.closest('.language-selector')) {
            langMenu.classList.remove('active');
            if (langToggle) langToggle.classList.remove('active');
        }
    });
}

// Mobile language selector functionality
function initMobileLanguageSelector() {
    const mobileLangToggle = document.getElementById('mobile-lang-toggle');
    const mobileLangMenu = document.getElementById('mobile-lang-menu');
    const mobileLangOptions = document.querySelectorAll('.mobile-lang-option');

    if (mobileLangToggle) {
        mobileLangToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileLangMenu.classList.toggle('active');
            mobileLangToggle.classList.toggle('active');
        });
    }

    mobileLangOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const selectedLang = option.getAttribute('data-lang');
            setLanguage(selectedLang);
            updateLanguageDisplay();
            mobileLangMenu.classList.remove('active');
            if (mobileLangToggle) {
                mobileLangToggle.classList.remove('active');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileLangMenu && !e.target.closest('.mobile-language-section')) {
            mobileLangMenu.classList.remove('active');
            if (mobileLangToggle) {
                mobileLangToggle.classList.remove('active');
            }
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await initLanguage();
    initLanguageSelector();
    initMobileLanguageSelector();
    initMobileMenu();

    // Ensure language display is visible after initialization
    setTimeout(() => {
        updateLanguageDisplay();
    }, 100);

    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.5s ease';
    }, 150);
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        // Mobile adjustments
    } else {
        // Desktop adjustments
    }
});

// Add click handler for "Discover More" button
document.addEventListener('DOMContentLoaded', () => {
    const discoverMoreBtn = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Discover') || btn.getAttribute('data-i18n') === 'buttons.discoverMore'
    );

    if (discoverMoreBtn) {
        discoverMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const privilegesSection = document.getElementById('privileges');
            if (privilegesSection) {
                privilegesSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
});

// Prevent default button behavior for demo
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button').forEach(button => {
        // Skip Activate Card Now button - it has its own handler
        if (button.id === 'activate-card-btn' ||
            button.textContent.includes('Activate Card Now')) {
            return;
        }

        button.addEventListener('click', function(e) {
            // You can add actual functionality here
            if (!button.getAttribute('data-i18n')?.includes('discover') &&
                !button.textContent.includes('Discover')) {
                console.log('Button clicked:', this.textContent);
            }
        });
    });
});

// Add scroll-to-top button
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.classList.add('scroll-to-top');
scrollToTopBtn.innerHTML = 'в†‘';
scrollToTopBtn.style.display = 'none';
document.body.appendChild(scrollToTopBtn);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Add styles for scroll-to-top button
const scrollToTopStyle = document.createElement('style');
scrollToTopStyle.textContent = `
    .scroll-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 82, 255, 0.3);
        transition: all 0.3s ease;
        z-index: 999;
    }

    .scroll-to-top:hover {
        background: #0041cc;
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 82, 255, 0.4);
    }

    @media (max-width: 768px) {
        .scroll-to-top {
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
        }
    }
`;
document.head.appendChild(scrollToTopStyle);

// Modal functionality for "Obtain Card"
function initObtainCardModal() {
    const modal = document.getElementById('obtain-card-modal');
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');

    if (!modal || !overlay) return;

    // Find all "Obtain Card" buttons
    const obtainButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
        btn.getAttribute('data-i18n')?.includes('obtain') ||
        btn.textContent.includes('Obtain')
    );

    // Open modal
    obtainButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            overlay.classList.add('active');
        });
    });

    // Close modal
    closeBtn?.addEventListener('click', () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
    });

    overlay?.addEventListener('click', () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
    });
}

// Initialize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initObtainCardModal();
});