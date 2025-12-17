// 1. Canvas particles avec collision
const canvas = document.getElementById('bg'),
      ctx = canvas.getContext('2d');
let w,h,parts=[],n=80;

// Clé de persistance pour l'état des particules
const PARTICLE_KEY = 'portfolio_particles_v1';
let _lastParticleSave = 0;

// Palette de 10 couleurs douces et harmonieuses
const colors = [
  '#00FFFF', // Cyan bleu (couleur de départ)
  '#4FC3F7', // Bleu ciel doux
  '#81C784', // Vert menthe
  '#FFB74D', // Orange pêche
  '#BA68C8', // Violet pastel
  '#FF8A80', // Rose corail doux
  '#64B5F6', // Bleu clair
  '#AED581', // Vert pomme doux
  '#FFD54F', // Jaune doux
  '#9575CD'  // Lavande
];

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function resize() {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;

  // Optimisation mobile : réduire les particules sur petits écrans
  const isMobile = window.innerWidth < 768;
  n = isMobile ? 30 : 80;

  // Restaurer les particules sauvegardées si disponibles ; sinon en créer de nouvelles
  const saved = loadParticles();
  parts = [];
  if (saved && Array.isArray(saved) && saved.length === n) {
    saved.forEach(p => {
      parts.push({
        x: Math.max((p.radius||2), Math.min(w - (p.radius||2), p.x)),
        y: Math.max((p.radius||2), Math.min(h - (p.radius||2), p.y)),
        vx: p.vx || (Math.random()-0.5)*0.5,
        vy: p.vy || (Math.random()-0.5)*0.5,
        radius: p.radius || 2,
        color: p.color || '#00FFFF'
      });
    });
  } else {
    for (let i = 0; i < n; i++) {
      parts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 2,
        color: '#00FFFF' // Toutes démarrent en bleu cyan
      });
    }
  }
}

function loadParticles() {
  try {
    const raw = localStorage.getItem(PARTICLE_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : null;
  } catch (e) { return null; }
}

function saveParticles() {
  try {
    const now = Date.now();
  // limiter les écritures à environ une fois toutes les ~800ms
  if (now - _lastParticleSave < 800) return;
    _lastParticleSave = now;
    const data = parts.map(p => ({ x: p.x, y: p.y, vx: p.vx, vy: p.vy, radius: p.radius, color: p.color }));
    localStorage.setItem(PARTICLE_KEY, JSON.stringify(data));
  } catch (e) { /* ignorer les erreurs de stockage (localStorage plein / bloqué) */ }
}

// Fonction pour détecter et gérer les collisions entre particules
function checkCollision(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDist = p1.radius + p2.radius;
  
  if (distance < minDist) {
    // Changer les couleurs des deux particules après collision
    p1.color = getRandomColor();
    p2.color = getRandomColor();
    
    // Calculer l'angle de collision
    const angle = Math.atan2(dy, dx);
    
    // Calculer les vitesses relatives
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    
    // Rotation des vitesses
    const vx1 = p1.vx * cos + p1.vy * sin;
    const vy1 = p1.vy * cos - p1.vx * sin;
    const vx2 = p2.vx * cos + p2.vy * sin;
    const vy2 = p2.vy * cos - p2.vx * sin;
    
    // Échanger les vitesses (collision élastique)
    const vx1Final = vx2;
    const vx2Final = vx1;
    
    // Rotation inverse pour retrouver les vraies vitesses
    p1.vx = vx1Final * cos - vy1 * sin;
    p1.vy = vy1 * cos + vx1Final * sin;
    p2.vx = vx2Final * cos - vy2 * sin;
    p2.vy = vy2 * cos + vx2Final * sin;
    
    // Séparer les particules pour éviter qu'elles restent collées
    const overlap = minDist - distance;
    const separateX = (overlap / 2) * cos;
    const separateY = (overlap / 2) * sin;
    
    p1.x -= separateX;
    p1.y -= separateY;
    p2.x += separateX;
    p2.y += separateY;
  }
}

window.addEventListener('resize', resize);
resize();

(function anim(){
  ctx.fillStyle='rgba(0,0,0,0.1)';
  ctx.fillRect(0,0,w,h);
  
  // Mettre à jour les positions
  parts.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy;
    
    // Rebond sur les bords
    if(p.x<p.radius || p.x>w-p.radius) p.vx*=-1;
    if(p.y<p.radius || p.y>h-p.radius) p.vy*=-1;
    
    // Garder dans les limites
    p.x = Math.max(p.radius, Math.min(w-p.radius, p.x));
    p.y = Math.max(p.radius, Math.min(h-p.radius, p.y));
  });
  
  // Vérifier les collisions entre toutes les particules
  for(let i=0; i<parts.length; i++) {
    for(let j=i+1; j<parts.length; j++) {
      checkCollision(parts[i], parts[j]);
    }
  }
  
  // Dessiner les particules avec leur couleur
  parts.forEach(p=>{
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2*Math.PI);
    ctx.fillStyle=p.color; 
    ctx.fill();
  });
  
    // Persister périodiquement l'état des particules
      saveParticles();

    requestAnimationFrame(anim);
})();
// Sauvegarder lors de la fermeture/masquage de la page pour éviter la perte d'état entre navigations
window.addEventListener('beforeunload', saveParticles);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveParticles(); });

// 2. Simulation de saisie dans la console (plusieurs couleurs et lignes)
const cb = document.getElementById('console-body'),
      linesFR = [
  "> git clone https://github.com/HugoMagret/hugomagret.github.io",
  "Clonage dans 'hugomagret.github.io'...",
  "> cd hugomagret.github.io",
  "> chmod +x deploy_portfolio.sh",
  "> ./deploy_portfolio.sh",
  "🚀 Déploiement du portfolio en cours...",
  "✨ Portfolio en ligne sur hugomagret.github.io !"
], linesEN = [
  "> git clone https://github.com/HugoMagret/hugomagret.github.io",
  "Cloning into 'hugomagret.github.io'...",
  "> cd hugomagret.github.io",
  "> chmod +x deploy_portfolio.sh",
  "> ./deploy_portfolio.sh",
  "🚀 Deploying portfolio...",
  "✨ Portfolio live at hugomagret.github.io!"
];
function typeLines(lines) {
  cb.innerHTML = '';
  lines.forEach((txt,i) => {
    setTimeout(()=>{
      const div = document.createElement('div');
      // coloration selon le contenu
      if (txt.startsWith('>')) div.style.color = '#00FFFF';
      else if (txt.startsWith('drwx') || txt.startsWith('*')) div.style.color = '#888';
      else if (txt.includes('✓') || txt.includes('✨')) div.style.color = '#28A745';
      else if (txt.includes('🚀')) div.style.color = '#E83E8C';
      else if (txt.includes('NAMES') || txt.includes('STATUS')) div.style.color = '#FFC107';
      else if (txt.includes('[') && txt.includes(']')) div.style.color = '#9B59B6';
      else div.style.color = '#D1D1D1';
      cb.appendChild(div);
      let j=0;
      (function typeChar(){
        if (j < txt.length) {
          div.textContent += txt[j++];
          setTimeout(typeChar, 20);
        }
      })();
    }, i * 200);
  });
}

// 3. Active nav-item selon la page
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(a => {
    const href = a.getAttribute('href');
    const hrefPage = href.split('/').pop();
    
    // Vérifier si c'est la page actuelle
    if (hrefPage === currentPage || 
        (currentPage === '' && hrefPage === 'index.html') ||
        (currentPage === 'index.html' && hrefPage === 'index.html')) {
      a.classList.add('active');
    }
  });
});

// 4. Switch FR/EN pour tagline, titre exp & console
const btnFR = document.getElementById('btn-fr'),
      btnEN = document.getElementById('btn-en'),
      tagline = document.getElementById('hero-tagline') || document.querySelector('.hero-tagline'),
      expTitle = document.querySelector('.expertise h2');

// Traductions pour la page About
const translations = {
  fr: {
    tagline: 'Coder le futur, une ligne à la fois.',
    aboutTitle: 'À Propos de Moi',
    aboutP1: "Je suis un développeur informatique passionné avec une forte concentration sur la création d'applications web évolutives et efficaces. Mon expertise réside dans les langages C/C++, Python, PHP, et JavaScript, ainsi que dans l'architecture microservices. J'aime relever des défis complexes avec des solutions élégantes.",
    aboutP2: "Que ce soit pour créer des interfaces utilisateur intuitives, automatiser des flux de travail avec des APIs puissantes, ou architecturer des systèmes pour une évolutivité transparente entre les environnements, je m'épanouis dans la création de solutions innovantes et pratiques.",
    aboutP3: "Au-delà du code, je gère mon propre serveur domestique, en améliorant constamment les performances et la sécurité. Quand je ne code pas, j'aime me détendre avec quelques jeux classiques. Si vous cherchez un passionné de technologie qui aime construire, faire évoluer et sécuriser des applications, connectons-nous !",
    gamesTitle: 'Détente & Mini-Jeux',
    thankYou: 'Merci de votre visite',
    contactTitle: 'Entrons en Contact',
    contactSubtitle: 'Discutons de votre projet',
    contactName: 'Nom',
    contactNamePlaceholder: 'Votre nom complet',
    contactEmail: 'Email',
    contactEmailPlaceholder: 'votre.email@exemple.com',
    contactMessage: 'Message',
    contactMessagePlaceholder: 'Décrivez votre projet ou votre question...',
    contactSubmit: 'Envoyer le Message',
    cvTitle: 'Mon CV',
    cvView: 'Visualiser',
    cvDownload: 'Télécharger',
    certTitle: 'Certifications',
    certPix: 'Certification Pix',
    certPixDesc: "Certification officielle des compétences numériques reconnue par l'État français. Niveau avancé en développement, sécurité et gestion de données.",
    certDate: "Date d'obtention :",
    projectsTitle: 'Mes Projets'
  },
  en: {
    tagline: 'Coding the future, one line at a time.',
    aboutTitle: 'About Me',
    aboutP1: "I am a passionate computer developer with a strong focus on creating scalable and efficient web applications. My expertise lies in C/C++, Python, PHP, and JavaScript languages, as well as microservices architecture. I love tackling complex challenges with elegant solutions.",
    aboutP2: "Whether it's building intuitive user interfaces, automating workflows with powerful APIs, or architecting systems for seamless scalability across environments, I thrive on creating innovative and practical solutions.",
    aboutP3: "Beyond coding, I manage my own home server, constantly improving performance and security. When I'm not coding, I enjoy relaxing with some classic games. If you're looking for a tech enthusiast who loves to build, scale and secure applications, let's connect!",
    gamesTitle: 'Relax & Mini-Games',
    contactTitle: "Let's Get in Touch",
    contactSubtitle: "Let's discuss your project",
    contactName: 'Name',
    contactNamePlaceholder: 'Your full name',
    contactEmail: 'Email',
    contactEmailPlaceholder: 'your.email@example.com',
    contactMessage: 'Message',
    contactMessagePlaceholder: 'Describe your project or question...',
    contactSubmit: 'Send Message',
    cvTitle: 'My Resume',
    cvView: 'View',
    cvDownload: 'Download',
    certTitle: 'Certifications',
    certPix: 'Pix Certification',
    certPixDesc: "Official digital skills certification recognized by the French government. Advanced level in development, security and data management.",
    certDate: "Date obtained:",
    projectsTitle: 'My Projects'
    ,
    thankYou: 'Thanks for your visit'
  }
};

function updateLanguage(lang) {
  // Sauvegarder la langue dans localStorage
  localStorage.setItem('preferredLanguage', lang);
  
  // Mettre à jour tous les titres avec data-fr et data-en
  document.querySelectorAll('[data-fr][data-en]').forEach(el => {
    el.textContent = lang === 'fr' ? el.getAttribute('data-fr') : el.getAttribute('data-en');
  });
  
  // Mettre à jour le tagline
  if (tagline) tagline.textContent = translations[lang].tagline;
  
  // Mettre à jour la page About
  const aboutTitle = document.querySelector('.about-intro h2');
  const aboutParagraphs = document.querySelectorAll('.about-intro p');
  const gamesTitle = document.querySelector('.games-section h3');
  
  if (aboutTitle) aboutTitle.textContent = translations[lang].aboutTitle;
  if (aboutParagraphs[0]) aboutParagraphs[0].textContent = translations[lang].aboutP1;
  if (aboutParagraphs[1]) aboutParagraphs[1].textContent = translations[lang].aboutP2;
  if (aboutParagraphs[2]) aboutParagraphs[2].textContent = translations[lang].aboutP3;
  if (gamesTitle) gamesTitle.textContent = translations[lang].gamesTitle;

  // Mettre à jour le message de remerciement (About)
  const thankEl = document.getElementById('thankYou');
  const thanksTitle = document.getElementById('thanksTitle');
  if (thankEl) thankEl.textContent = translations[lang].thankYou || (lang === 'fr' ? 'Merci de votre visite' : 'Thanks for your visit');
  if (thanksTitle) thanksTitle.textContent = lang === 'fr' ? 'Merci' : 'Thanks';

  // Mettre à jour le CV (hrefs + iframe)
  // (moved below so DOM elements are defined before updating their attributes)
  
  // Mettre à jour la page Contact
  const contactTitle = document.querySelector('.contact-section h2');
  const contactSubtitle = document.querySelector('.contact-section .subtitle');
  const nameLabel = document.querySelector('label[for="name"]');
  const nameInput = document.querySelector('#name');
  const emailLabel = document.querySelector('label[for="email"]');
  const emailInput = document.querySelector('#email');
  const messageLabel = document.querySelector('label[for="message"]');
  const messageInput = document.querySelector('#message');
  const submitBtn = document.querySelector('.submit-btn');
  
  if (contactTitle) contactTitle.textContent = translations[lang].contactTitle;
  if (contactSubtitle) contactSubtitle.textContent = translations[lang].contactSubtitle;
  if (nameLabel) nameLabel.textContent = translations[lang].contactName;
  if (nameInput) nameInput.placeholder = translations[lang].contactNamePlaceholder;
  if (emailLabel) emailLabel.textContent = translations[lang].contactEmail;
  if (emailInput) emailInput.placeholder = translations[lang].contactEmailPlaceholder;
  if (messageLabel) messageLabel.textContent = translations[lang].contactMessage;
  if (messageInput) messageInput.placeholder = translations[lang].contactMessagePlaceholder;
  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> ' + translations[lang].contactSubmit;
  }
  
  // Mettre à jour la page CV
  const cvTitle = document.querySelector('.cv-section h2');
  const cvViewBtn = document.querySelector('.cv-controls a:first-child');
  const cvDownloadBtn = document.querySelector('.cv-controls a:last-child');
  const certTitle = document.querySelector('.certifications h3');
  const certPixTitle = document.querySelector('.cert-card h4');
  const certPixDesc = document.querySelector('.cert-card p:first-of-type');
  const certDate = document.querySelector('.cert-card p:last-of-type strong');
  
  if (cvTitle) cvTitle.textContent = translations[lang].cvTitle;
  if (cvViewBtn) cvViewBtn.innerHTML = '<i class="fas fa-eye"></i> ' + translations[lang].cvView;
  if (cvDownloadBtn) cvDownloadBtn.innerHTML = '<i class="fas fa-download"></i> ' + translations[lang].cvDownload;
  // Mettre à jour les hrefs et iframe du CV (après que cvViewBtn/cvDownloadBtn soient définis)
  const cvEmbed = document.getElementById('cvEmbed');
  const viewHref = lang === 'en' ? '../images/cv_anglais.pdf' : '../images/cv.pdf';
  if (cvViewBtn) cvViewBtn.setAttribute('href', viewHref);
  if (cvDownloadBtn) {
    cvDownloadBtn.setAttribute('href', viewHref);
    cvDownloadBtn.setAttribute('download', lang === 'en' ? 'CV_Hugo_Magret_EN.pdf' : 'CV_Hugo_Magret_FR.pdf');
  }
  if (cvEmbed) cvEmbed.setAttribute('src', viewHref);
  if (certTitle) certTitle.textContent = translations[lang].certTitle;
  if (certPixTitle) certPixTitle.textContent = translations[lang].certPix;
  if (certPixDesc) certPixDesc.textContent = translations[lang].certPixDesc;
  if (certDate) certDate.textContent = translations[lang].certDate + ' ';
  
  // Mettre à jour la page Projets
  const projectsTitle = document.querySelector('.projects-section h2');
  if (projectsTitle) projectsTitle.textContent = translations[lang].projectsTitle;
}

if (btnFR && btnEN) {
  btnFR.addEventListener('click', ()=>{
    btnEN.classList.remove('active');
    btnFR.classList.add('active');
    if (expTitle) expTitle.textContent = 'Compétences Techniques';
    if (cb) typeLines(linesFR);
    updateLanguage('fr');
  });
  btnEN.addEventListener('click', ()=>{
    btnFR.classList.remove('active');
    btnEN.classList.add('active');
    if (expTitle) expTitle.textContent = 'Technical Expertise';
    if (cb) typeLines(linesEN);
    updateLanguage('en');
  });
}

// Init console + default langue
window.addEventListener('load', ()=>{
  // Charger la langue sauvegardée ou utiliser FR par défaut
  const savedLang = localStorage.getItem('preferredLanguage') || 'fr';
  
  // Appliquer la langue sauvegardée
  if (savedLang === 'en' && btnEN) {
    btnFR.classList.remove('active');
    btnEN.classList.add('active');
    if (expTitle) expTitle.textContent = 'Technical Expertise';
    if (cb) typeLines(linesEN);
    updateLanguage('en');
  } else {
    if (cb) typeLines(linesFR);
    updateLanguage('fr');
  }

  // Reveal on scroll (IntersectionObserver) with staggered children animation
  // expose initRevealObserver
  let initRevealObserver = null;
  try {
    function staggerReveal(el) {
      // Add show to parent (so any parent-based CSS triggers)
      el.classList.add('show');
      // Find plausible children to stagger (icons, skill blocks, categories)
      const children = el.querySelectorAll('.icon, .exp-category, .exp-item, .skill, .exp-block, .icons-grid > *');
      children.forEach((c, i) => {
        // apply incremental transition delay
        c.style.transitionDelay = (i * 120) + 'ms';
        c.classList.add('show');
      });
    }

  // trigger later when more of the element is in view
  const revealOptions = { threshold: 0.6, rootMargin: '0px 0px -12% 0px' };
      let io = null;
      // make initRevealObserver available in outer scope
      initRevealObserver = function() {
        if (io) try { io.disconnect(); } catch(e){}
        io = new IntersectionObserver((entries)=>{
          entries.forEach(e=>{
            if (e.isIntersecting) { staggerReveal(e.target); io.unobserve(e.target); }
          });
        }, revealOptions);
        document.querySelectorAll('.reveal-on-scroll').forEach(el => io.observe(el));
      };
      initRevealObserver();
  } catch(e) { /* ignore if not supported */ }
  
  // Vérifier le message de succès pour le formulaire de contact
  const urlParams = new URLSearchParams(window.location.search);
  const formMessage = document.getElementById('formMessage');
  if (urlParams.get('success') === 'true' && formMessage) {
    const successMsg = savedLang === 'fr' 
      ? '✓ Message envoyé avec succès ! Je vous répondrai bientôt.'
      : '✓ Message sent successfully! I will reply to you soon.';
    formMessage.textContent = successMsg;
    formMessage.className = 'form-message success';
    formMessage.style.display = 'block';
    
    // Redirection automatique vers l'accueil après 2 secondes
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 2000);
  }
});

// ---------------------------
// Tagline per-character animation
// ---------------------------
function animateTagline() {
  const el = document.getElementById('hero-tagline') || document.querySelector('.hero-tagline');
  if (!el) return;
  const text = (el.getAttribute('data-text') || el.textContent || '').trim();
  // Clear existing and build spans
  // remove any existing chars to avoid duplicate or partially-animated nodes
  el.innerHTML = '';
  const fragment = document.createDocumentFragment();
  Array.from(text).forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'tag-char';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    // use CSS animation for a stronger effect: staggered tagPop
    // définir l'animation : augmentation de la durée et du décalage pour un effet plus lent
    span.style.animation = 'none';
    span.style.display = 'inline-block';
    span.style.animation = `tagPop 760ms cubic-bezier(.2,.8,.2,1) ${i * 90}ms both`;
    fragment.appendChild(span);
  });
  el.appendChild(fragment);
  // add sweep class for highlight
  el.classList.remove('sweep');
  // small cleanup: force reflow so animation reliably restarts
  void el.offsetWidth;
  // reflow then add sweep to trigger pseudo-element animation
  requestAnimationFrame(()=> el.classList.add('sweep'));
}

// Fallback: observe for tagline insertion and animate when found
try {
  const mo = new MutationObserver((list, obs) => {
    const el = document.getElementById('hero-tagline') || document.querySelector('.hero-tagline');
    if (el) {
      // ensure data-text is set
      const savedLang = localStorage.getItem('preferredLanguage') || 'fr';
      if (!el.getAttribute('data-text')) el.setAttribute('data-text', translations && translations[savedLang] ? translations[savedLang].tagline : el.textContent);
      animateTagline();
      // small delay: run again to be extra safe
      setTimeout(()=> animateTagline(), 120);
      obs.disconnect();
    }
  });
  mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
} catch(e) { /* ignore */ }

// Ensure tagline runs after language change
const _origUpdateLanguage = updateLanguage;
updateLanguage = function(lang){
  _origUpdateLanguage(lang);
  // store raw text so animateTagline can read it
  const el = document.getElementById('hero-tagline') || document.querySelector('.hero-tagline');
  if (el) el.setAttribute('data-text', translations[lang].tagline);
  // small delay to ensure DOM updated
  setTimeout(()=> animateTagline(), 40);
};

// ---------------------------
// PJAX: fetch main content and replace without reloading canvas
// ---------------------------
function initPJAX() {
  // delegate click on internal links
  document.addEventListener('click', async function(e){
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || a.target === '_blank' || a.hasAttribute('data-no-pjax')) return;
    // resolve full url
    const url = new URL(href, location.href);
    if (url.origin !== location.origin) return; // external

    // only pjax for html pages (internal)
    if (!url.pathname.endsWith('.html') && !url.pathname.endsWith('/') && !url.pathname.endsWith('.htm')) return;

    e.preventDefault();
    try {
      // Capture un snapshot du canvas et afficher un overlay image pour masquer toute saccade
      try {
        const cvs = document.getElementById('bg');
        if (cvs && typeof cvs.toDataURL === 'function') {
          try {
            const snapshot = cvs.toDataURL('image/png');
            const OVERLAY_ID = 'pjax-snapshot-overlay';
            // réutiliser l'overlay s'il existe déjà
            let overlay = document.getElementById(OVERLAY_ID);
            if (!overlay) {
              overlay = document.createElement('img');
              overlay.id = OVERLAY_ID;
              Object.assign(overlay.style, {
                position: 'fixed',
                left: '0', top: '0',
                width: '100%', height: '100%',
                objectFit: 'cover',
                zIndex: 9999,
                pointerEvents: 'none',
                transition: 'opacity 360ms ease',
                opacity: '1',
                background: '#000'
              });
              document.body.appendChild(overlay);
            }
            overlay.src = snapshot;
            // s'assurer que l'overlay est visible immédiatement
            overlay.style.opacity = '1';
          } catch(e) { /* ignorer erreurs de snapshot */ }
        }
      } catch(e) { /* ignore */ }

      const res = await fetch(url.href, { cache: 'no-cache' });
      if (!res.ok) { window.location.href = url.href; return; }
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      // grab main content
      const incomingMain = doc.querySelector('main') || doc.querySelector('#pjax-content');
      const destMain = document.querySelector('main') || document.querySelector('#pjax-content');
      if (incomingMain && destMain) {
        // optional nice fade transition
        destMain.style.transition = 'opacity 260ms ease';
        destMain.style.opacity = '0';
        await new Promise(r => setTimeout(r, 180));
        destMain.innerHTML = incomingMain.innerHTML;
        // Mettre à jour le titre
        document.title = doc.title || document.title;

        // Attendre un premier rendu, puis exécuter les scripts pour éviter de bloquer le paint
        const scripts = Array.from(incomingMain.querySelectorAll('script'));

        // attendre deux frames pour garantir que le navigateur a peint le nouveau DOM
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        // Exécuter les scripts externes (si non déjà chargés) et les inline légèrement différés
        scripts.forEach(s => {
          if (s.src) {
            try {
              const abs = new URL(s.getAttribute('src'), url.href).href;
              if (document.querySelector('script[src="' + abs + '"]')) return; // déjà présent
              const sc = document.createElement('script'); sc.src = abs; sc.async = true; document.body.appendChild(sc);
            } catch (e) {
              const sc = document.createElement('script'); sc.src = s.getAttribute('src'); sc.async = true; document.body.appendChild(sc);
            }
          } else {
            // exécuter les scripts inline après un court délai pour laisser le navigateur peindre
            setTimeout(()=>{
              try { const sc = document.createElement('script'); sc.textContent = s.textContent; document.body.appendChild(sc); }catch(e){}
            }, 30);
          }
        });

        // petit délai puis fade-in du contenu
        await new Promise(r => setTimeout(r, 40));
        destMain.style.opacity = '1';

        // masquer l'overlay via cross-fade (si présent)
        try {
          const overlay = document.getElementById('pjax-snapshot-overlay');
          if (overlay) {
            // laisser un court délai pour que l'utilisateur voie le contenu rendu
            setTimeout(()=>{
              try {
                overlay.style.opacity = '0';
                overlay.addEventListener('transitionend', function onEnd(){ overlay.removeEventListener('transitionend', onEnd); try{ overlay.remove(); }catch(e){} });
              } catch(e) { try{ overlay.remove(); } catch(_){} }
            }, 140);
          }
        } catch(e) { /* ignore */ }
        // re-init behaviors for newly inserted content
        initRevealObserver();
        // re-run language to update any elements and tagline
        const saved = localStorage.getItem('preferredLanguage') || 'fr';
        updateLanguage(saved);
      } else {
        // fallback to full nav
        window.location.href = url.href;
      }
      history.pushState({ pjax: true }, '', url.href);
    } catch (err){ console.error('PJAX failed', err); window.location.href = href; }
  });

  // handle back/forward
  window.addEventListener('popstate', async function(){
    const url = location.href;
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) return;
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const incomingMain = doc.querySelector('main') || doc.querySelector('#pjax-content');
      const destMain = document.querySelector('main') || document.querySelector('#pjax-content');
      if (incomingMain && destMain) {
        destMain.innerHTML = incomingMain.innerHTML;
        document.title = doc.title || document.title;
        const scripts = Array.from(incomingMain.querySelectorAll('script'));
        scripts.forEach(s => {
          if (s.src) {
            try {
              const abs = new URL(s.getAttribute('src'), url).href;
              if (document.querySelector('script[src="' + abs + '"]')) return;
              const sc = document.createElement('script'); sc.src = abs; sc.async = true; document.body.appendChild(sc);
            } catch(e) {
              const sc = document.createElement('script'); sc.src = s.getAttribute('src'); sc.async = true; document.body.appendChild(sc);
            }
          } else {
            setTimeout(()=>{
              const sc = document.createElement('script'); sc.textContent = s.textContent; document.body.appendChild(sc);
            },0);
          }
        });
        initRevealObserver();
        const saved = localStorage.getItem('preferredLanguage') || 'fr';
        updateLanguage(saved);
      }
    } catch(e) { console.error('popstate pjax error', e); }
  });
}

// Lazy loading des icônes avec Intersection Observer
function setupLazyLoading() {
  const options = { threshold: 0.5 };
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.parentElement.classList.add('loaded');
          observer.unobserve(img);
        }
      }
    });
  }, options);

  document.querySelectorAll('.icon[data-src] img').forEach(img => {
    imageObserver.observe(img);
  });
}

// Animations de fade-in sur page load
function setupFadeInAnimations() {
  // Attendre que le DOM soit complètement peint avant de déclencher les animations
  requestAnimationFrame(() => {
    // Les animations CSS se déclenchent automatiquement grâce à @keyframes
    // Les délais d'animation sont définis dans le CSS via [data-fade-in="..."]
  });
}

// Mise à jour du fil d'Ariane (breadcrumb) en fonction de la page actuelle
function updateBreadcrumb() {
  const breadcrumb = document.querySelector('.breadcrumb');
  if (!breadcrumb) return;

  const current = document.title.split(' - ')[0] || 'Accueil';
  const pathname = window.location.pathname;
  
  let breadcrumbHTML = '<span class="breadcrumb-item" data-nav="index.html">Accueil</span>';
  
  if (!pathname.includes('index') && pathname !== '/') {
    breadcrumbHTML += '<span class="breadcrumb-separator">/</span>';
    
    if (pathname.includes('about')) {
      breadcrumbHTML += '<span class="breadcrumb-item active">À propos</span>';
    } else if (pathname.includes('projets')) {
      breadcrumbHTML += '<span class="breadcrumb-item active">Projets</span>';
    } else if (pathname.includes('cv')) {
      breadcrumbHTML += '<span class="breadcrumb-item active">CV</span>';
    } else if (pathname.includes('contact')) {
      breadcrumbHTML += '<span class="breadcrumb-item active">Contact</span>';
    }
  } else {
    breadcrumbHTML = '<span class="breadcrumb-item active">Accueil</span>';
  }
  
  breadcrumb.innerHTML = breadcrumbHTML;
  
  // Ajouter des listeners de navigation au breadcrumb
  breadcrumb.querySelectorAll('[data-nav]').forEach(item => {
    item.addEventListener('click', function() {
      const page = this.dataset.nav;
      if (page && window.loadPage) {
        window.loadPage('/' + page);
      }
    });
  });
}

// start PJAX
try{ initPJAX(); }catch(e){/* ignore */}

// Initialiser lazy loading et animations
try{ setupLazyLoading(); }catch(e){}
try{ setupFadeInAnimations(); }catch(e){}
try{ updateBreadcrumb(); }catch(e){}

// run initial tagline animation
try{ animateTagline(); }catch(e){}
