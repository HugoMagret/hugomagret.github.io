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
  "> hugo@dev:~$ whoami",
  "Développeur Full-Stack | Étudiant en Informatique",
  "> hugo@dev:~$ cat passions.txt",
  "💻 Résolution de problèmes complexes",
  "🎯 Architecture logicielle & optimisation",
  "🌐 Technologies web modernes & DevOps",
  "> hugo@dev:~$ ./deploy_future.sh",
  "🚀 Transformation d'idées en solutions concrètes...",
  "✨ Innovation en cours..."
], linesEN = [
  "> hugo@dev:~$ whoami",
  "Full-Stack Developer | Computer Science Student",
  "> hugo@dev:~$ cat passions.txt",
  "💻 Solving complex problems",
  "🎯 Software architecture & optimization",
  "🌐 Modern web technologies & DevOps",
  "> hugo@dev:~$ ./deploy_future.sh",
  "🚀 Turning ideas into concrete solutions...",
  "✨ Innovation in progress..."
];
function typeLines(lines) {
  cb.innerHTML = '';
  lines.forEach((txt,i) => {
    setTimeout(()=>{
      const div = document.createElement('div');
      // coloration selon le contenu
      if (txt.startsWith('>')) div.style.color = '#00FFFF';
      else if (txt.includes('💻') || txt.includes('🎯') || txt.includes('🌐')) div.style.color = '#28A745';
      else if (txt.includes('🚀')) div.style.color = '#E83E8C';
      else if (txt.includes('✨')) div.style.color = '#FFC107';
      else if (txt.includes('Développeur') || txt.includes('Developer')) div.style.color = '#00FFFF';
      else div.style.color = '#D1D1D1';
      cb.appendChild(div);
      let j=0;
      (function typeChar(){
        if (j < txt.length) {
          div.textContent += txt[j++];
          setTimeout(typeChar, 30);
        }
      })();
    }, i * 400);
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
      expTitle = document.querySelector('.expertise h2');

if (btnFR && btnEN) {
  btnFR.addEventListener('click', ()=>{
    btnEN.classList.remove('active');
    btnFR.classList.add('active');
    tagline.textContent = 'Coder le futur, une ligne à la fois.';
    expTitle.textContent = 'Compétences Techniques';
    typeLines(linesFR);
  });
  btnEN.addEventListener('click', ()=>{
    btnFR.classList.remove('active');
    btnEN.classList.add('active');
    tagline.textContent = 'Coding the future, one line at a time.';
    expTitle.textContent = 'Technical Expertise';
    typeLines(linesEN);
  });
}

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
    
    // Nettoyer l'URL
    setTimeout(() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 100);
  }
});
