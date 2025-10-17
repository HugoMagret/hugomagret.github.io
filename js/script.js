// 1. Canvas particles (inchangé)
const canvas = document.getElementById('bg'),
      ctx = canvas.getContext('2d');
let w,h,parts=[],n=80;
function resize() {
  w=canvas.width=innerWidth; h=canvas.height=innerHeight; parts=[];
  for(let i=0;i<n;i++){
    parts.push({ x:Math.random()*w, y:Math.random()*h,
      vx:(Math.random()-0.5)*0.5, vy:(Math.random()-0.5)*0.5 });
  }
}
window.addEventListener('resize', resize);
resize();
(function anim(){
  ctx.fillStyle='rgba(0,0,0,0.1)';
  ctx.fillRect(0,0,w,h);
  parts.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<0||p.x>w) p.vx*=-1;
    if(p.y<0||p.y>h) p.vy*=-1;
    ctx.beginPath();
    ctx.arc(p.x,p.y,2,0,2*Math.PI);
    ctx.fillStyle='#00FFFF'; ctx.fill();
  });
  requestAnimationFrame(anim);
})();

// 2. Console typing with multiple colors & lines
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
      tagline = document.getElementById('hero-tagline'),
      skillsTitle = document.getElementById('skills-title'),
      skillsLangTitle = document.getElementById('skills-lang-title'),
      skillsFwTitle = document.getElementById('skills-fw-title'),
      skillsToolsTitle = document.getElementById('skills-tools-title'),
      skillsCloudTitle = document.getElementById('skills-cloud-title');

const translations = {
  fr: {
    tagline: 'Coder le futur, une ligne à la fois.',
    skillsTitle: 'Compétences Techniques',
    skillsLangTitle: 'Langages de Programmation',
    skillsFwTitle: 'Frameworks & Bibliothèques',
    skillsToolsTitle: 'Outils & Plateformes',
    skillsCloudTitle: 'Cloud & DevOps'
  },
  en: {
    tagline: 'Coding the future, one line at a time.',
    skillsTitle: 'Technical Skills',
    skillsLangTitle: 'Programming Languages',
    skillsFwTitle: 'Frameworks & Libraries',
    skillsToolsTitle: 'Tools & Platforms',
    skillsCloudTitle: 'Cloud & DevOps'
  }
};

function setLanguage(lang) {
  if (tagline) tagline.textContent = translations[lang].tagline;
  if (skillsTitle) skillsTitle.textContent = translations[lang].skillsTitle;
  if (skillsLangTitle) skillsLangTitle.textContent = translations[lang].skillsLangTitle;
  if (skillsFwTitle) skillsFwTitle.textContent = translations[lang].skillsFwTitle;
  if (skillsToolsTitle) skillsToolsTitle.textContent = translations[lang].skillsToolsTitle;
  if (skillsCloudTitle) skillsCloudTitle.textContent = translations[lang].skillsCloudTitle;
  if (cb) typeLines(lang === 'fr' ? linesFR : linesEN);
}

if (btnFR && btnEN) {
  btnFR.addEventListener('click', ()=>{
    btnEN.classList.remove('active');
    btnFR.classList.add('active');
    setLanguage('fr');
  });
  btnEN.addEventListener('click', ()=>{
    btnFR.classList.remove('active');
    btnEN.classList.add('active');
    setLanguage('en');
  });
}

// Init console + default langue
window.addEventListener('load', ()=>{
  setLanguage('fr');
  // ...existing code...
});

// Init console + default langue
window.addEventListener('load', ()=>{
  if (cb) typeLines(linesFR);
  
  // Vérifier le message de succès pour le formulaire de contact
  const urlParams = new URLSearchParams(window.location.search);
  const formMessage = document.getElementById('formMessage');
  if (urlParams.get('success') === 'true' && formMessage) {
    formMessage.textContent = '✓ Message envoyé avec succès ! Je vous répondrai bientôt.';
    formMessage.className = 'form-message success';
    formMessage.style.display = 'block';
    
    // Redirection automatique vers l'accueil après 2 secondes
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 2000);
  }
});
