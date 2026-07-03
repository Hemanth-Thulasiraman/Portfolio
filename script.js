// ===== HERO 3D SCENE (Three.js) =====
(function () {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof THREE === 'undefined') {
        init2DParticles(canvas); // fallback if CDN fails
        return;
    }

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (e) {
        init2DParticles(canvas);
        return;
    }

    const hero = canvas.parentElement;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 11;

    const group = new THREE.Group();
    scene.add(group);

    // --- Particle constellation with real depth ---
    const COUNT = 130;
    const SPREAD = { x: 10, y: 5.5, z: 5 };
    const palette = [
        new THREE.Color(0x38bdf8), // sky
        new THREE.Color(0x818cf8), // indigo
        new THREE.Color(0x34d399), // emerald
    ];

    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const velocities = [];

    for (let i = 0; i < COUNT; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 2 * SPREAD.x;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2 * SPREAD.y;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2 * SPREAD.z;
        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
        velocities.push({
            x: (Math.random() - 0.5) * 0.006,
            y: (Math.random() - 0.5) * 0.006,
            z: (Math.random() - 0.5) * 0.004,
        });
    }

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const points = new THREE.Points(pointsGeo, new THREE.PointsMaterial({
        size: 0.09,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        sizeAttenuation: true,
    }));
    group.add(points);

    // --- Connecting lines between nearby particles ---
    const MAX_SEGMENTS = 700;
    const CONNECT_DIST = 2.4;
    const linePositions = new Float32Array(MAX_SEGMENTS * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));

    const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    }));
    group.add(lines);

    // --- Wireframe geometry: floating icosahedron + torus knot ---
    const icoOuter = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.2, 1),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.14 })
    );
    icoOuter.position.set(4.2, 0.4, -2);
    scene.add(icoOuter);

    const icoInner = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.3, 0),
        new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.22 })
    );
    icoInner.position.copy(icoOuter.position);
    scene.add(icoInner);

    const knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.8, 0.24, 90, 12),
        new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true, transparent: true, opacity: 0.1 })
    );
    knot.position.set(-5.5, -2.2, -3);
    scene.add(knot);

    // --- Mouse parallax ---
    const mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // --- Pause rendering when hero is off-screen ---
    let heroVisible = true;
    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }, { threshold: 0 }).observe(hero);

    function resize() {
        const w = hero.offsetWidth, h = hero.offsetHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST;
    const pos = pointsGeo.attributes.position.array;

    function animate() {
        requestAnimationFrame(animate);
        if (!heroVisible) return;

        if (!reducedMotion) {
            // Drift particles and wrap at bounds
            for (let i = 0; i < COUNT; i++) {
                pos[i * 3]     += velocities[i].x;
                pos[i * 3 + 1] += velocities[i].y;
                pos[i * 3 + 2] += velocities[i].z;
                if (Math.abs(pos[i * 3])     > SPREAD.x) velocities[i].x *= -1;
                if (Math.abs(pos[i * 3 + 1]) > SPREAD.y) velocities[i].y *= -1;
                if (Math.abs(pos[i * 3 + 2]) > SPREAD.z) velocities[i].z *= -1;
            }
            pointsGeo.attributes.position.needsUpdate = true;

            group.rotation.y += 0.0007;
            icoOuter.rotation.x += 0.0012;
            icoOuter.rotation.y += 0.0018;
            icoInner.rotation.x -= 0.002;
            icoInner.rotation.y -= 0.0026;
            knot.rotation.x += 0.002;
            knot.rotation.z += 0.0014;
        }

        // Rebuild connection lines
        let seg = 0;
        for (let i = 0; i < COUNT && seg < MAX_SEGMENTS; i++) {
            for (let j = i + 1; j < COUNT && seg < MAX_SEGMENTS; j++) {
                const dx = pos[i * 3] - pos[j * 3];
                const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
                const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
                if (dx * dx + dy * dy + dz * dz < CONNECT_DIST_SQ) {
                    linePositions[seg * 6]     = pos[i * 3];
                    linePositions[seg * 6 + 1] = pos[i * 3 + 1];
                    linePositions[seg * 6 + 2] = pos[i * 3 + 2];
                    linePositions[seg * 6 + 3] = pos[j * 3];
                    linePositions[seg * 6 + 4] = pos[j * 3 + 1];
                    linePositions[seg * 6 + 5] = pos[j * 3 + 2];
                    seg++;
                }
            }
        }
        lineGeo.setDrawRange(0, seg * 2);
        lineGeo.attributes.position.needsUpdate = true;

        // Camera parallax follows mouse
        camera.position.x += (mouse.x * 0.9 - camera.position.x) * 0.03;
        camera.position.y += (-mouse.y * 0.6 - camera.position.y) * 0.03;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();
}());

// ===== 2D PARTICLE FALLBACK (if Three.js fails to load) =====
function init2DParticles(canvas) {
    const ctx = canvas.getContext('2d');
    const COLORS = ['rgba(56,189,248,', 'rgba(129,140,248,', 'rgba(52,211,153,'];
    let particles = [], W, H;

    function resize() {
        const hero = canvas.parentElement;
        W = canvas.width = hero.offsetWidth;
        H = canvas.height = hero.offsetHeight;
    }
    function rand(a, b) { return a + Math.random() * (b - a); }
    function spawn() {
        return {
            x: rand(0, W), y: rand(H * 0.2, H), r: rand(1, 2.5),
            vx: rand(-0.15, 0.15), vy: rand(-0.35, -0.12),
            alpha: 0, maxAlpha: rand(0.25, 0.55),
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            life: 0, maxLife: rand(220, 420),
        };
    }
    function init() {
        particles = [];
        for (let i = 0; i < 55; i++) {
            const p = spawn();
            p.y = rand(0, H);
            p.life = rand(0, p.maxLife);
            particles.push(p);
        }
    }
    function draw() {
        ctx.clearRect(0, 0, W, H);
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy; p.life++;
            p.alpha = p.maxAlpha * Math.sin((p.life / p.maxLife) * Math.PI);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.alpha + ')';
            ctx.fill();
            if (p.life >= p.maxLife) particles[i] = spawn();
        }
        requestAnimationFrame(draw);
    }
    resize(); init(); draw();
    window.addEventListener('resize', () => { resize(); init(); });
}

// ===== 3D TILT CARDS =====
(function () {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canHover || reducedMotion) return;

    const MAX_TILT = 7; // degrees

    document.querySelectorAll('.project-card, .skill-group, .other-card, .edu-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.12s ease-out';
        });
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            const rx = -(py - 0.5) * 2 * MAX_TILT;
            const ry = (px - 0.5) * 2 * MAX_TILT;
            card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
            card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
            card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.45s ease';
            card.style.transform = '';
        });
    });
}());

// ===== TERMINAL TYPING =====
(function () {
    const body = document.getElementById('terminalBody');
    if (!body) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PROMPT = '<span class="term-user">hemanth</span><span class="term-dim">@</span><span class="term-host">portfolio</span> <span class="term-dim">~ %</span> ';

    const LINES = [
        { cmd: 'whoami', out: ['ML Engineer — M.S. Data Science @ University of Maryland'] },
        { cmd: 'ls ~/stack', out: ['python/   pytorch/   langgraph/   fastapi/   docker/   aws/'] },
        { cmd: 'cat mission.txt', out: ['Build intelligent systems that survive contact with production.'] },
        { cmd: 'echo $STATUS', out: ['<span class="term-green">● open_to_opportunities = true</span>'] },
    ];

    function addOut(html) {
        const el = document.createElement('div');
        el.className = 'term-line term-out';
        el.innerHTML = html;
        body.appendChild(el);
    }

    function renderInstant() {
        LINES.forEach(({ cmd, out }) => {
            const line = document.createElement('div');
            line.className = 'term-line';
            line.innerHTML = PROMPT + '<span class="term-cmd">' + cmd + '</span>';
            body.appendChild(line);
            out.forEach(addOut);
        });
        finalPrompt();
    }

    function finalPrompt() {
        const p = document.createElement('div');
        p.className = 'term-line';
        p.innerHTML = PROMPT + '<span class="term-cursor">▊</span>';
        body.appendChild(p);
    }

    function run() {
        let li = 0;
        (function nextLine() {
            if (li >= LINES.length) { finalPrompt(); return; }
            const { cmd, out } = LINES[li++];
            const line = document.createElement('div');
            line.className = 'term-line';
            line.innerHTML = PROMPT;
            const cmdSpan = document.createElement('span');
            cmdSpan.className = 'term-cmd';
            line.appendChild(cmdSpan);
            body.appendChild(line);
            let ci = 0;
            (function typeCmd() {
                if (ci < cmd.length) {
                    cmdSpan.textContent += cmd[ci++];
                    setTimeout(typeCmd, 38 + Math.random() * 55);
                } else {
                    setTimeout(() => {
                        out.forEach(addOut);
                        setTimeout(nextLine, 380);
                    }, 260);
                }
            })();
        })();
    }

    const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            io.disconnect();
            reducedMotion ? renderInstant() : run();
        }
    }, { threshold: 0.4 });
    io.observe(body);
}());

// ===== SCROLL PROGRESS BAR =====
const scrollProgress = document.getElementById('scrollProgress');

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

// ===== ACTIVE NAV LINK + SCROLL PROGRESS =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link:not(.contact-btn)');

function onScroll() {
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

    if (scrollProgress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    }
}

window.addEventListener('scroll', onScroll, { passive: true });

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
    entries.forEach((entry) => {
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
