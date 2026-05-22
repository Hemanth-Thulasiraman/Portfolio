// ===== PARTICLE CANVAS =====
(function () {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const COLORS = [
        'rgba(56,189,248,',   // sky blue
        'rgba(129,140,248,',  // indigo
        'rgba(52,211,153,',   // emerald
    ];

    let particles = [];
    let W, H;

    function resize() {
        const hero = canvas.parentElement;
        W = canvas.width  = hero.offsetWidth;
        H = canvas.height = hero.offsetHeight;
    }

    function randomBetween(a, b) { return a + Math.random() * (b - a); }

    function spawnParticle() {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        return {
            x: randomBetween(0, W),
            y: randomBetween(H * 0.2, H),
            r: randomBetween(1, 2.5),
            vx: randomBetween(-0.15, 0.15),
            vy: randomBetween(-0.35, -0.12),
            alpha: 0,
            maxAlpha: randomBetween(0.25, 0.55),
            fadeIn: true,
            color,
            life: 0,
            maxLife: randomBetween(220, 420),
        };
    }

    function init() {
        particles = [];
        for (let i = 0; i < 55; i++) {
            const p = spawnParticle();
            p.y = randomBetween(0, H);
            p.life = randomBetween(0, p.maxLife);
            p.alpha = p.maxAlpha * Math.sin((p.life / p.maxLife) * Math.PI);
            particles.push(p);
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life++;

            const t = p.life / p.maxLife;
            p.alpha = p.maxAlpha * Math.sin(t * Math.PI);

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.alpha + ')';
            ctx.fill();

            if (p.life >= p.maxLife) {
                particles[i] = spawnParticle();
            }
        }

        requestAnimationFrame(draw);
    }

    resize();
    init();
    draw();
    window.addEventListener('resize', () => { resize(); init(); });
}());

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
    });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
        }
    });
});

// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link:not(.contact-btn)');

function updateActiveNav() {
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
        const top = section.offsetTop - 100;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollY >= top && scrollY < bottom) {
            navLinks.forEach(l => l.classList.remove('active'));
            const active = document.querySelector(`.nav-link[href="#${id}"]`);
            if (active) active.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });

// ===== TYPING ANIMATION =====
const roles = [
    'production ML systems',
    'LLM-powered agents',
    'fraud detection engines',
    'autonomous AI assistants',
    'real-time ML pipelines',
];

const typedEl = document.getElementById('typed-role');
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let isPaused = false;

function typeLoop() {
    const current = roles[roleIndex];

    if (!isDeleting && charIndex <= current.length) {
        typedEl.textContent = current.slice(0, charIndex++);
        setTimeout(typeLoop, charIndex > current.length ? 0 : 60);
    } else if (!isDeleting && charIndex > current.length) {
        if (!isPaused) {
            isPaused = true;
            setTimeout(() => { isDeleting = true; isPaused = false; typeLoop(); }, 1800);
        }
    } else if (isDeleting && charIndex >= 0) {
        typedEl.textContent = current.slice(0, charIndex--);
        setTimeout(typeLoop, 30);
    } else {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(typeLoop, 300);
    }
}

setTimeout(typeLoop, 800);

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, 60);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const original = btn.textContent;
        btn.textContent = 'Message Sent!';
        btn.style.background = 'linear-gradient(135deg, #34d399, #059669)';
        btn.disabled = true;
        setTimeout(() => {
            btn.textContent = original;
            btn.style.background = '';
            btn.disabled = false;
            contactForm.reset();
        }, 3000);
    });
}

// ===== PROFILE IMAGE =====
const profileImage = document.getElementById('profileImage');
document.addEventListener('keydown', (e) => {
    if ((e.key === 'u' || e.key === 'U') && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (ev) => {
            const file = ev.target.files[0];
            if (file && profileImage) {
                const reader = new FileReader();
                reader.onload = (re) => {
                    profileImage.src = re.target.result;
                    profileImage.style.display = 'block';
                    document.querySelector('.profile-placeholder').style.display = 'none';
                    localStorage.setItem('profileImage', re.target.result);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }
});

localStorage.removeItem('profileImage');
