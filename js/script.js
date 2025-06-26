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
  "> Initialisation de l'environnement de développement...",
  "✔ Compilation C/C++ réussie.",
  "✔ Déploiement Docker : conteneurs up.",
  "✔ Services PHP, Python & OCaml lancés.",
  "ℹ Base de données SQL connectée.",
  "⚙ Ionic & Android prêts à coder.",
  "🚀 Pipeline CI/CD (Jenkins) opérationnel.",
  "🤖 Apprentissage en continu activé."
], linesEN = [
  "> Booting up development environment...",
  "✔ C/C++ compilation succeeded.",
  "✔ Docker deployment: containers up.",
  "✔ PHP, Python & OCaml services started.",
  "ℹ SQL database connected.",
  "⚙ Ionic & Android ready to code.",
  "🚀 CI/CD pipeline (Jenkins) is live.",
  "🤖 Continuous learning enabled."
];
function typeLines(lines) {
  cb.innerHTML = '';
  lines.forEach((txt,i) => {
    setTimeout(()=>{
      const div = document.createElement('div');
      // première ligne en cyan, les ✔ en vert, ℹ en bleu, ⚙ en orange, 🚀 en magenta
      if (txt.startsWith('>')) div.style.color = '#00FFFF';
      else if (txt.includes('✔')) div.style.color = '#28A745';
      else if (txt.includes('ℹ')) div.style.color = '#17A2B8';
      else if (txt.includes('⚙')) div.style.color = '#FFC107';
      else if (txt.includes('🚀')) div.style.color = '#E83E8C';
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
document.querySelectorAll('.nav-item').forEach(a => {
  if (a.getAttribute('href') === location.pathname.split('/').pop()) {
    a.classList.add('active');
  }
});

// 4. Switch FR/EN pour tagline, titre exp & console
const btnFR = document.getElementById('btn-fr'),
      btnEN = document.getElementById('btn-en'),
      tagline = document.getElementById('hero-tagline'),
      expTitle = document.querySelector('.expertise h2');

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

// Init console + default langue
window.addEventListener('load', ()=>{
  typeLines(linesFR);
});
