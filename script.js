var titleEl = document.getElementById('title-text');
var titleCursor = document.getElementById('title-cursor');

function typeTitle(callback) {
  var word = 'reskyline';
  var i = 0;
  function next() {
    titleEl.textContent = word.substring(0, i);
    i++;
    if (i <= word.length) {
      setTimeout(next, 120);
    } else {
      setTimeout(function() {
        titleCursor.style.display = 'none';
        if (callback) callback();
        startGlitch();
      }, 500);
    }
  }
  next();
}

function startGlitch() {
  function doGlitch() {
    var h1 = document.querySelector('h1');
    if (h1) {
      h1.classList.add('glitch');
      setTimeout(function() { h1.classList.remove('glitch'); }, 300);
    }
    setTimeout(doGlitch, 4000 + Math.random() * 6000);
  }
  setTimeout(doGlitch, 2000 + Math.random() * 3000);
}

var phrases = [
  'bmws',
  'gym',
  'programming',
  'python',
  'rust',
  'cybersecurity',
  'web automation',
];
var typeEl = document.getElementById('typewriter-text');
var phraseIndex = 0, charIndex = 0, deleting = false;

function type() {
  var current = phrases[phraseIndex];
  if (deleting) {
    charIndex--;
    typeEl.textContent = current.substring(0, charIndex);
    if (charIndex === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; setTimeout(type, 400); return; }
    setTimeout(type, 50);
  } else {
    charIndex++;
    typeEl.textContent = current.substring(0, charIndex);
    if (charIndex === current.length) { deleting = true; setTimeout(type, 1600); return; }
    setTimeout(type, 90);
  }
}

var beamCanvas = document.getElementById('beam-canvas');
var bctx = beamCanvas.getContext('2d');
var dashOffset = 0;
var perimeter = 0;
var R = 22;

function setupBeam() {
  var wrap = beamCanvas.parentElement;
  beamCanvas.width = wrap.offsetWidth;
  beamCanvas.height = wrap.offsetHeight;
  var w = beamCanvas.width;
  var h = beamCanvas.height;
  perimeter = 2 * (w + h) - (8 - 2 * Math.PI) * R;
}

function tracePath(w, h) {
  bctx.beginPath();
  bctx.moveTo(R, 0);
  bctx.lineTo(w - R, 0);
  bctx.arcTo(w, 0, w, R, R);
  bctx.lineTo(w, h - R);
  bctx.arcTo(w, h, w - R, h, R);
  bctx.lineTo(R, h);
  bctx.arcTo(0, h, 0, h - R, R);
  bctx.lineTo(0, R);
  bctx.arcTo(0, 0, R, 0, R);
  bctx.closePath();
}

function animateBeam() {
  var w = beamCanvas.width;
  var h = beamCanvas.height;
  if (!w || !h) { requestAnimationFrame(animateBeam); return; }
  bctx.clearRect(0, 0, w, h);
  var tailLen = perimeter * 0.2;
  var gapLen = perimeter - tailLen;
  bctx.save();
  tracePath(w, h);
  bctx.strokeStyle = 'rgba(180, 80, 255, 0.95)';
  bctx.lineWidth = 2.5;
  bctx.shadowColor = 'rgba(180, 80, 255, 1)';
  bctx.shadowBlur = 14;
  bctx.setLineDash([tailLen, gapLen]);
  bctx.lineDashOffset = -dashOffset;
  bctx.stroke();
  bctx.restore();
  bctx.save();
  tracePath(w, h);
  bctx.strokeStyle = 'rgba(100, 120, 255, 0.95)';
  bctx.lineWidth = 2.5;
  bctx.shadowColor = 'rgba(100, 120, 255, 1)';
  bctx.shadowBlur = 14;
  bctx.setLineDash([tailLen, gapLen]);
  bctx.lineDashOffset = -(dashOffset + perimeter * 0.5);
  bctx.stroke();
  bctx.restore();
  dashOffset = (dashOffset + 3) % perimeter;
  requestAnimationFrame(animateBeam);
}

var canvas = document.getElementById('ascii-canvas');
var ctx = canvas.getContext('2d');
var trailCanvas = document.getElementById('trail-canvas');
var tctx = trailCanvas.getContext('2d');
var chars = '@#$%&?!*+~=^<>[]{}|/\\'.split('');
var particles = [];
var gradientColors = [[180,80,255],[130,60,255],[80,80,255],[60,120,255],[40,160,255]];
var mouseNX = 0, mouseNY = 0;

function pickColor() {
  var i = Math.floor(Math.random()*(gradientColors.length-1));
  var t = Math.random(), a = gradientColors[i], b = gradientColors[i+1];
  return [Math.round(a[0]+(b[0]-a[0])*t), Math.round(a[1]+(b[1]-a[1])*t), Math.round(a[2]+(b[2]-a[2])*t)];
}

function makeParticle() {
  var c = pickColor();
  return {
    x: Math.random()*canvas.width, y: Math.random()*canvas.height,
    char: chars[Math.floor(Math.random()*chars.length)],
    size: Math.random()*20+10, opacity: Math.random()*0.4+0.05,
    vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*3,
    r: c[0], g: c[1], b: c[2],
    depth: Math.random() * 0.8 + 0.2,
    charTimer: Math.random()*80, charInterval: Math.random()*60+40,
    fadeDir: Math.random()>0.5?1:-1, fadeSpeed: Math.random()*0.003+0.001,
    maxOpacity: Math.random()*0.7+0.1,
  };
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  trailCanvas.width = window.innerWidth;
  trailCanvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', function() { resize(); particles=[]; init(); setupBeam(); });

function init() {
  var count = Math.max(40, Math.min(Math.floor((canvas.width*canvas.height)/3000), 120));
  for (var i = 0; i < count; i++) particles.push(makeParticle());
}
init();

function animateParticles() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for (var i=0;i<particles.length;i++) {
    var p=particles[i];
    var px = p.x + mouseNX * 30 * p.depth;
    var py = p.y + mouseNY * 20 * p.depth;
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<-20)p.x=canvas.width+20; if(p.x>canvas.width+20)p.x=-20;
    if(p.y<-20)p.y=canvas.height+20; if(p.y>canvas.height+20)p.y=-20;
    p.opacity+=p.fadeDir*p.fadeSpeed;
    if(p.opacity>=p.maxOpacity){p.opacity=p.maxOpacity;p.fadeDir=-1;}
    if(p.opacity<=0.01){var nc=pickColor();p.r=nc[0];p.g=nc[1];p.b=nc[2];p.char=chars[Math.floor(Math.random()*chars.length)];p.fadeDir=1;p.maxOpacity=Math.random()*0.7+0.05;}
    p.charTimer++;
    if(p.charTimer>p.charInterval){p.char=chars[Math.floor(Math.random()*chars.length)];p.charTimer=0;p.charInterval=Math.random()*60+40;}
    ctx.font=p.size+'px monospace';
    ctx.fillStyle='rgba('+p.r+','+p.g+','+p.b+','+p.opacity+')';
    ctx.fillText(p.char,px,py);
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();

var trailPoints = [];
var isFlipped = false;

window.addEventListener('mousemove', function(e) {
  trailPoints.push({ x: e.clientX, y: e.clientY, life: 1.0 });
  if (trailPoints.length > 60) trailPoints.shift();
  var cx = window.innerWidth/2, cy = window.innerHeight/2;
  mouseNX = (e.clientX - cx) / cx;
  mouseNY = (e.clientY - cy) / cy;
  if (!isFlipped) {
    var wrap = document.getElementById('panel-wrap');
    wrap.style.transform = 'rotateX('+(mouseNY*-15)+'deg) rotateY('+(mouseNX*25)+'deg)';
  }
});

function animateTrail() {
  tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
  for (var i = 0; i < trailPoints.length; i++) {
    var p = trailPoints[i];
    p.life -= 0.025;
    if (p.life <= 0) continue;
    var t = i / trailPoints.length;
    var rv = Math.round(160 - t * 100);
    var gv = Math.round(60 + t * 60);
    var size = t * 6 + 1;
    tctx.beginPath();
    tctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    tctx.fillStyle = 'rgba(' + rv + ',' + gv + ',255,' + (p.life * t * 0.8) + ')';
    tctx.fill();
  }
  trailPoints = trailPoints.filter(function(p) { return p.life > 0; });
  requestAnimationFrame(animateTrail);
}
animateTrail();

function updateClock() {
  var now = new Date();
  var formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  var el = document.getElementById('clock');
  if (el) el.textContent = 'local time: ' + formatter.format(now);
}
updateClock();
setInterval(updateClock, 1000);

var flipper = document.getElementById('card-flipper');
var projectsBtn = document.getElementById('projects-btn');
var backBtn = document.getElementById('back-btn');
var panelWrap = document.getElementById('panel-wrap');

projectsBtn.addEventListener('click', function() {
  isFlipped = true;
  beamCanvas.style.opacity = '0';
  flipper.classList.add('flipped');
  setTimeout(function() { beamCanvas.style.opacity = '1'; }, 850);
});

backBtn.addEventListener('click', function() {
  isFlipped = false;
  beamCanvas.style.opacity = '0';
  flipper.classList.remove('flipped');
  setTimeout(function() { beamCanvas.style.opacity = '1'; }, 850);
});

var splash = document.getElementById('splash');
var panel = document.getElementById('panel');
var music = document.getElementById('bg-music');

splash.addEventListener('click', function() {
  music.load();
  music.play().catch(function() {});
  splash.classList.add('hidden');
  setTimeout(function() {
    panel.style.transition = 'opacity 0.8s ease';
    panel.style.opacity = '1';
    setTimeout(function() {
      setupBeam();
      animateBeam();
      typeTitle(function() {
        type();
      });
    }, 800);
  }, 400);
});
