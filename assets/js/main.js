// assets/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    // 1. Run the Boot Animation (Visuals)
    await runBootSequence();

    // 2. Load Content (Logic)
    // We check if 'portfolioData' exists from the other file
    if (typeof portfolioData !== 'undefined') {
        loadContent();
        setupTheme();
        setupMobileMenu();
    } else {
        console.error("Error: portfolioData is missing. Check assets/js/data.js");
        document.body.innerHTML = "<h2 style='text-align:center; margin-top:50px'>Error: Data file not found.</h2>";
        return;
    }

    // 3. Reveal the Website
    const bootScreen = document.getElementById('boot-screen');
    const siteWrapper = document.getElementById('site-wrapper');

    // Fade out black screen
    bootScreen.style.transition = 'opacity 0.5s';
    bootScreen.style.opacity = '0';

    // Fade in website
    siteWrapper.style.opacity = '1';

    // Remove boot screen element after fade finishes
    setTimeout(() => {
        bootScreen.style.display = 'none';
    }, 500);


    // Add this inside your DOMContentLoaded listener or at the end of your init() function
    const logo = document.querySelector('.logo');

    logo.addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent the page from just jumping to the top

        const bootScreen = document.getElementById('boot-screen');
        const siteWrapper = document.getElementById('site-wrapper');
        const bootText = document.getElementById('boot-text');

        // 1. Reset the boot screen state
        bootText.innerHTML = ''; // Clear previous messages
        bootScreen.style.display = 'flex';
        bootScreen.style.opacity = '1';
        bootScreen.style.transition = 'none'; // Show immediately without a fade-in

        // 2. Hide the main website content
        siteWrapper.style.opacity = '0';

        // 3. Run the animation again
        await runBootSequence();

        window.scrollTo(0, 0);

        // 4. Fade out the boot screen and reveal the site (same as init logic)
        bootScreen.style.transition = 'opacity 0.5s';
        bootScreen.style.opacity = '0';
        siteWrapper.style.opacity = '1';

        setTimeout(() => {
            bootScreen.style.display = 'none';
        }, 500);
    });
}

// --- Boot Sequence Animation ---
function runBootSequence() {
    return new Promise((resolve) => {
        const bootText = document.getElementById('boot-text');

        const messages = [
            "[ OK      ] Power on self-test passed.",
            "[ WARNING ] Yu-Heng Lin still unemployed...",
            "[ OK      ] Loading fantastic projects...",
            "[ OK      ] Verifying UCSD GPA (3.933)...",
            "[ OK      ] Target found: NYCU Network Engineering",
            "[ OK      ] User 'Yu-Heng' profile loaded.",
            "Loading graphical interface..."
        ];

        let i = 0;

        function printLine() {
            if (i < messages.length) {
                const line = document.createElement('div');
                line.textContent = messages[i];
                bootText.appendChild(line);

                // Optimized: Only scroll if the text actually overflows the screen
                if (document.body.scrollHeight > window.innerHeight) {
                    window.scrollTo(0, document.body.scrollHeight);
                }

                i++;
                const delay = 375;
                setTimeout(printLine, delay);
            } else {
                // Final pause: wait 800ms, then scroll to top and resolve
                setTimeout(() => {
                    window.scrollTo(0, 0);
                    resolve();
                }, 800);
            }
        }
        printLine();
    });
}

// --- Standard Rendering Logic ---
function loadContent() {
    // Hero
    const hero = document.querySelector('.hero-content');
    hero.innerHTML = `
        <p>Hi, my name is</p>
        <h1 class="highlight">${portfolioData.hero.name}</h1>
        <h1>${portfolioData.hero.role}</h1>
        <p>${portfolioData.hero.summary}</p>
        <div class="cta-group">
            <a href="#projects" class="btn btn-primary">View Projects</a>
            <a href="${portfolioData.hero.resumeLink}" class="btn btn-secondary" target="_blank">Resume</a>
        </div>
    `;

    // Projects
    const projectsGrid = document.getElementById('projects-grid');
    const filterContainer = document.getElementById('project-filters');

    const allTags = new Set(portfolioData.projects.flatMap(p => p.tags));
    const tagsArray = ['All', ...Array.from(allTags)];

    tagsArray.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = `filter-btn ${tag === 'All' ? 'active' : ''}`;
        btn.textContent = tag;
        btn.onclick = (e) => filterProjects(tag, e);
        filterContainer.appendChild(btn);
    });

    renderProjects(portfolioData.projects);

    // Experience & Education
    renderTimeline('experience-timeline', portfolioData.experience);
    renderTimeline('education-timeline', portfolioData.education);

    // Skills
    const skillsGrid = document.getElementById('skills-grid');
    for (const [category, items] of Object.entries(portfolioData.skills)) {
        const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
        const html = `
            <div class="skill-category">
                <h3>${capitalized}</h3>
                <ul class="skill-list">
                    ${items.map(skill => `<li><span>🔹</span> ${skill}</li>`).join('')}
                </ul>
            </div>
        `;
        skillsGrid.innerHTML += html;
    }

    // About
    const aboutContainer = document.getElementById('about-content');
    aboutContainer.innerHTML = `
        <div class="about-text">
            <p>${portfolioData.about.bio}</p>
        </div>
        <div class="currently-box">
            <h3>Now / Currently</h3>
            <ul class="skill-list">
                <li><strong>Learning:</strong> ${portfolioData.about.currently.learning}</li>
                <li><strong>Reading:</strong> ${portfolioData.about.currently.reading}</li>
                <li><strong>Hobby:</strong> ${portfolioData.about.currently.hobby}</li>
            </ul>
        </div>
    `;

    // Contact & Footer
    document.getElementById('contact-links').innerHTML = `
        <a href="mailto:${portfolioData.social.email}" class="btn btn-primary">Email Me</a>
        <a href="${portfolioData.social.github}" target="_blank" class="btn btn-secondary">GitHub</a>
        <a href="${portfolioData.social.linkedin}" target="_blank" class="btn btn-secondary">LinkedIn</a>
    `;
    document.getElementById('footer-text').innerHTML = `&copy; ${new Date().getFullYear()} ${portfolioData.hero.name}. Built with vanilla HTML/CSS/JS.`;
}

function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = projects.map(p => `
        <div class="project-card fade-in">
            <div class="project-header">
                <span class="folder-icon">📂</span>
                <div class="project-links">
                    ${p.github ? `<a href="${p.github}" target="_blank" aria-label="GitHub">GitHub</a>` : ''}
                    ${p.demo ? `<a href="${p.demo}" target="_blank" aria-label="Live Demo">Live</a>` : ''}
                </div>
            </div>
            <h3 class="project-title">${p.title}</h3>
            <p class="project-desc">${p.description}</p>
            <div class="project-tags">
                ${p.tags.map(t => `<span>${t}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function filterProjects(tag, event) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');

    const filtered = tag === 'All'
        ? portfolioData.projects
        : portfolioData.projects.filter(p => p.tags.includes(tag));

    renderProjects(filtered);
}

function renderTimeline(id, items) {
    const container = document.getElementById(id);
    container.innerHTML = items.map(item => `
        <div class="timeline-item">
            <span class="timeline-date">${item.date}</span>
            <h3 class="timeline-title">${item.role || item.degree}</h3>
            <p class="timeline-subtitle">${item.company || item.school}</p>
            <p class="timeline-desc">${item.description}</p>
        </div>
    `).join('');
}

function setupTheme() {
    const toggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || !savedTheme) {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggle.textContent = '☀️';
    }

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        toggle.textContent = next === 'dark' ? '☀️' : '🌙';
    });
}

function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}