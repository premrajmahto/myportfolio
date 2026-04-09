/* ============================================================
   PORTFOLIO – SCRIPT.JS
   Professional Redesign | All Interactivity
   ============================================================ */

'use strict';

/* ============================================================
   UTILITIES
   ============================================================ */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. THEME TOGGLE (dark / light)
   ============================================================ */
const themeBtn = qs('#theme-button');
const body     = document.body;

// Read saved preference, default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

themeBtn.addEventListener('click', () => {
    const isDark = body.classList.contains('dark-mode');
    applyTheme(isDark ? 'light' : 'dark');
});

function applyTheme(theme) {
    if (theme === 'light') {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
    localStorage.setItem('theme', theme);
}

/* ============================================================
   2. NAVBAR – sticky scroll shadow + active link
   ============================================================ */
const header = qs('#header');

window.addEventListener('scroll', () => {
    // Scrolled shadow
    header.classList.toggle('scrolled', window.scrollY > 40);

    // Back-to-top visibility
    backToTop.classList.toggle('visible', window.scrollY > 400);

    // Active nav-link
    updateActiveLink();
}, { passive: true });

function updateActiveLink() {
    const scrollY = window.scrollY + 120;
    qsa('section[id]').forEach(sec => {
        const top    = sec.offsetTop;
        const height = sec.offsetHeight;
        const link   = qs(`.nav-link[href="#${sec.id}"]`);
        if (link) {
            link.classList.toggle('active', scrollY >= top && scrollY < top + height);
        }
    });
}

/* ============================================================
   3. HAMBURGER MOBILE MENU
   ============================================================ */
const hamburger = qs('#nav-toggle');
const navList   = qs('#nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navList.classList.toggle('open');
    document.body.style.overflow = navList.classList.contains('open') ? 'hidden' : '';
});

// Close on link click
qsa('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navList.classList.remove('open');
        document.body.style.overflow = '';
    });
});

/* ============================================================
   4. TYPING ANIMATION
   ============================================================ */
const typingEl = qs('.typing-text');
const words    = ['Full Stack Developer', 'UI/UX Designer', 'Digital Marketer', 'Problem Solver'];
let wIdx = 0, cIdx = 0, deleting = false;

function typeLoop() {
    if (!typingEl) return;
    const word = words[wIdx];

    if (deleting) {
        typingEl.textContent = word.slice(0, --cIdx);
    } else {
        typingEl.textContent = word.slice(0, ++cIdx);
    }

    let delay = deleting ? 55 : 110;

    if (!deleting && cIdx === word.length) {
        delay = 1800;
        deleting = true;
    } else if (deleting && cIdx === 0) {
        deleting = false;
        wIdx = (wIdx + 1) % words.length;
        delay = 400;
    }

    setTimeout(typeLoop, delay);
}
typeLoop();

/* ============================================================
   5. SKILL BARS – animate on scroll
   ============================================================ */
const skillFills   = qsa('.skill-fill');
let   barsAnimated = false;

function animateBars() {
    if (barsAnimated) return;
    const skillSection = qs('#skills');
    if (!skillSection) return;
    const rect = skillSection.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
        skillFills.forEach(bar => {
            bar.style.width = bar.dataset.width + '%';
        });
        barsAnimated = true;
    }
}

window.addEventListener('scroll', animateBars, { passive: true });
animateBars(); // run once in case already in view

/* ============================================================
   6. PROJECT FILTER
   ============================================================ */
const filterBtns  = qsa('.filter-btn');
const projectGrid = qs('#projects-grid');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active-filter'));
        btn.classList.add('active-filter');

        const filter = btn.dataset.filter;

        qsa('.project-card', projectGrid).forEach(card => {
            const match = filter === 'all' || card.dataset.category === filter;
            // Fade out then hide / show and fade in
            if (match) {
                card.classList.remove('hidden');
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                });
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                setTimeout(() => card.classList.add('hidden'), 280);
            }
        });
    });
});

// Set initial transition for all cards
qsa('.project-card', projectGrid).forEach(card => {
    card.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
    card.style.opacity = '1';
    card.style.transform = 'scale(1)';
});

/* ============================================================
   7. CONTACT FORM VALIDATION
   ============================================================ */
const contactForm = qs('#contact-form');

if (contactForm) {
    const fields = {
        name:    { el: qs('#name'),    err: qs('#name-error'),    validate: v => v.trim().length >= 2 ? '' : 'Please enter your full name.' },
        email:   { el: qs('#email'),   err: qs('#email-error'),   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.' },
        message: { el: qs('#message'), err: qs('#message-error'), validate: v => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.' },
    };

    // Live validation on blur
    Object.values(fields).forEach(({ el, err, validate }) => {
        if (!el) return;
        el.addEventListener('blur', () => {
            const msg = validate(el.value);
            setFieldState(el, err, msg);
        });
        el.addEventListener('input', () => {
            if (err.textContent) {
                const msg = validate(el.value);
                setFieldState(el, err, msg);
            }
        });
    });

    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        let valid = true;

        Object.values(fields).forEach(({ el, err, validate }) => {
            if (!el) return;
            const msg = validate(el.value);
            setFieldState(el, err, msg);
            if (msg) valid = false;
        });

        if (!valid) return;

        // Send email via Formsubmit.co
        const submitBtn = qs('#submit-btn');
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;

        fetch("https://formsubmit.co/ajax/ceoofmylife1210@gmail.com", {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: qs('#name').value,
                email: qs('#email').value,
                subject: qs('#subject').value,
                message: qs('#message').value
            })
        })
        .then(response => response.json())
        .then(data => {
            contactForm.reset();
            Object.values(fields).forEach(({ el, err }) => {
                if (el) { el.classList.remove('error-field'); err.textContent = ''; }
            });
            const successMsg = qs('#success-msg');
            successMsg.style.display = 'flex';
            submitBtn.innerHTML = 'Send Message <i class="fa-regular fa-paper-plane"></i>';
            submitBtn.disabled = false;

            setTimeout(() => { successMsg.style.display = 'none'; }, 6000);
        })
        .catch(error => {
            console.log(error);
            submitBtn.innerHTML = 'Error - Try Again';
            submitBtn.disabled = false;
        });
    });
}

function setFieldState(el, err, msg) {
    err.textContent = msg;
    el.classList.toggle('error-field', !!msg);
}

/* ============================================================
   8. BACK TO TOP
   ============================================================ */
const backToTop = qs('#back-to-top');
if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ============================================================
   9. AOS – Animate On Scroll
   ============================================================ */
AOS.init({
    duration: 800,
    easing:   'ease-out-quart',
    once:     true,
    offset:   80,
});
