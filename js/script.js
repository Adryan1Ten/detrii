var $ = function(s){return document.querySelector(s)};
document.getElementById("nm").textContent = "✨ " + NAMA + " ✨";
var modal = $("#modal"), sheet = $("#sheet");


var petals = ["🌹","🤍","🍒","✨","🎀"];
setInterval(function(){
  var p = document.createElement("div");
  p.className = "fall"; p.textContent = petals[Math.floor(Math.random()*petals.length)];
  p.style.left = Math.random()*100+"vw"; p.style.fontSize = (14+Math.random()*14)+"px";
  p.style.animationDuration = (7+Math.random()*6)+"s";
  document.body.appendChild(p); setTimeout(function(){p.remove()},13000);
},900);


function confetti(){
  var cols = ["#8b2635","#c9a46b","#f3d9a4","#a8434f","#fff6e3"];
  var r = $("#cake").getBoundingClientRect(), cx = r.left+r.width/2, cy = r.top+r.height*.3;
  for(var i=0;i<46;i++){
    var c = document.createElement("i"); c.className = "conf";
    c.style.left = cx+"px"; c.style.top = cy+"px"; c.style.background = cols[i%cols.length];
    c.style.setProperty("--dx",(Math.random()*340-170)+"px");
    c.style.setProperty("--dy",(Math.random()*-260+120)+"px");
    document.body.appendChild(c); setTimeout(function(e){e.remove()},1700,c);
  }
}
var out = false;
$("#cake").addEventListener("click", function(){
  out = !out;
  $("#stage").classList.toggle("off", out);
  $("#hint").textContent = out ? "Yeay! Semoga semua permintaanmu terkabul yaa 🎉 (ketuk lagi buat nyalain)" : "Ketuk kuenya buat tiup lilin 🕯️";
  if(out) confetti();
});

var audio = null, ctx = null, timers = [], playing = false, useSynth = false;
var F = {G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99};
var TUNE = [["G4",.75],["G4",.25],["A4",1],["G4",1],["C5",1],["B4",2],
            ["G4",.75],["G4",.25],["A4",1],["G4",1],["D5",1],["C5",2],
            ["G4",.75],["G4",.25],["G5",1],["E5",1],["C5",1],["B4",1],["A4",1],
            ["F5",.75],["F5",.25],["E5",1],["C5",1],["D5",1],["C5",2]];
function tone(f,t,d){
  var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
  o.type = "sine"; o2.type = "triangle"; o.frequency.value = f; o2.frequency.value = f*2;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.22,t+.01);
  g.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(g); o2.connect(g); g.connect(ctx.destination);
  o.start(t); o2.start(t); o.stop(t+d+.05); o2.stop(t+d+.05);
}
function setUI(on){
  playing = on;
  var v = $(".vinyl"), b = $("#pb");
  if(v) v.classList.toggle("play", on);
  if(b) b.textContent = on ? "Berhenti" : "Putar";
}
function stopAll(){
  timers.forEach(clearTimeout); timers = [];
  if(audio){ audio.pause(); audio.currentTime = 0; }
  if(ctx){ try{ ctx.close(); }catch(e){} ctx = null; }
  setUI(false);
}
function synth(){
  try{
    stopAll();
    ctx = new (window.AudioContext||window.webkitAudioContext)();
    var t = ctx.currentTime+.1, beat = .55;
    TUNE.forEach(function(n){ tone(F[n[0]],t,n[1]*beat*1.4); t += n[1]*beat; });
    setUI(true);
    timers.push(setTimeout(stopAll,(t-ctx.currentTime)*1000+400));
  }catch(e){ var n = $("#pn"); if(n) n.textContent = "Browser kamu belum bisa memutar suara."; }
}
function fallback(){
  audio = null; useSynth = true;
  var n = $("#pn"); if(n) n.textContent = "File lagu belum ditemukan, jadi diputar versi kotak musik 🎶";
  synth();
}
function playMusic(){
  if(useSynth) return synth();
  if(!audio){
    audio = new Audio(encodeURI(MUSIK.src)); audio.loop = true;
    audio.onerror = function(){ if(!useSynth) fallback(); };
  }
  var p = audio.play();
  if(p && p.then) p.then(function(){ setUI(true); }).catch(function(e){
    if(e && e.name === "NotAllowedError") return;
    if(!useSynth) fallback();
  });
  else setUI(true);
}

/* ===== Isi kartu ===== */
var STK = [["🎀","right:-12px;top:-14px"],["🌹","left:-12px;top:-14px"],["✨","right:-10px;top:-12px"]];
var ROT = [-4,3,-2,4];
var VIEWS = {
  letter: function(){
    return '<h2>Surat untukmu 💌</h2><div class="letter" id="lt"></div><p class="note">'+DARI+'</p>';
  },
  photo: function(){
    return '<h2>Si Paling Lucu 📸</h2><div class="polas">' + FOTO.map(function(f,i){
      var s = STK[i%STK.length];
      return '<div class="pola" style="transform:rotate('+ROT[i%ROT.length]+'deg)"><span class="stk" style="'+s[1]+'">'+s[0]+'</span>'+
        '<div class="ph"><img src="'+f.src+'" alt="" style="object-position:'+((f.fx||.5)*100)+'% '+((f.fy||.3)*100)+'%"><span class="ms">🖼️<br>Taruh fotonya di<br>assets/foto/</span></div><p>'+f.caption+'</p></div>';
    }).join("") + '</div><p class="note">Ketuk fotonya buat tempel stiker ✨</p>';
  },
  music: function(){
    return '<h2>Lagu Spesial 🎵</h2><div class="vinyl"></div><button class="btn" id="pb">▶ Putar</button><p class="note" id="pn">'+MUSIK.judul+'</p>';
  }
};
function open_(k){
  if(k === "game") return openGame();
  sheet.innerHTML = '<button class="x" aria-label="Tutup">✕</button>'+VIEWS[k]();
  modal.classList.add("on");
  sheet.querySelector(".x").onclick = close_;
  if(k === "letter") $("#lt").textContent = SURAT;
  if(k === "music"){ setUI(playing); $("#pb").onclick = function(){ playing ? stopAll() : playMusic(); }; }
  if(k === "photo") sheet.querySelectorAll(".pola").forEach(stickerize);
  if(k === "photo") sheet.querySelectorAll(".ph img").forEach(function(im){
    var miss = function(){ im.parentNode.classList.add("miss"); };
    im.onerror = miss;
    if(im.complete && im.naturalWidth === 0) miss();
  });
}
function close_(){ modal.classList.remove("on"); }
document.querySelectorAll("[data-open]").forEach(function(b){ b.onclick = function(){ open_(b.dataset.open); }; });
modal.addEventListener("click", function(e){ if(e.target === modal) close_(); });
document.addEventListener("keydown", function(e){ if(e.key === "Escape") close_(); });


var splash = $("#splash");
function openGift(){
  if(splash.classList.contains("hide")) return;
  splash.classList.add("hide");
  playMusic();
  confetti();
}
splash.addEventListener("click", openGift);
splash.addEventListener("keydown", function(e){ if(e.key === "Enter" || e.key === " ") openGift(); });


function pop(x,y,ch,dist){
  var e = document.createElement("span"); e.className = "sp"; e.textContent = ch;
  e.style.left = x+"px"; e.style.top = y+"px";
  e.style.setProperty("--dx",((Math.random()-.5)*dist*1.6)+"px"); e.style.setProperty("--dy",(-dist*(.4+Math.random()*.8))+"px");
  document.body.appendChild(e); setTimeout(function(){ e.remove(); },950);
}
var lastSp = 0;
document.addEventListener("pointermove", function(e){
  var n = Date.now(); if(n-lastSp < 80 || G.run) return; lastSp = n; pop(e.clientX,e.clientY,"✨",24);
});
document.addEventListener("click", function(e){
  if(e.target.closest("button,#cake,#bouquet,.gp,#splash,.sheet,#game")) return;
  for(var i=0;i<5;i++) pop(e.clientX,e.clientY,["💗","🤍","🌹","💖","🌷"][i],60);
});
var BUKET = ["Bunga ini khusus buat kamu 🌹","Wangi banget ya? 🤍","Semoga harimu semanis bunga ini 🌷","Peluk jauh dari aku 🫶"];
$("#bouquet").addEventListener("click", function(){
  var b = this; b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
  var r = b.getBoundingClientRect();
  for(var i=0;i<16;i++) pop(r.left+r.width/2+(Math.random()-.5)*r.width*.6, r.top+r.height*.3, ["🌹","🌸","🤍","✨"][i%4], 80+Math.random()*60);
  $("#bqhint").textContent = BUKET[Math.random()*BUKET.length|0];
});
function stickerize(p){
  var ph = p.querySelector(".ph"), S = ["👑","🎀","🐰","🌸","😍","💖","🕶️","🐱"];
  p.addEventListener("click", function(){
    var s = document.createElement("span"); s.className = "stkr"; s.textContent = S[Math.random()*S.length|0];
    s.style.left = (8+Math.random()*68)+"%"; s.style.top = (4+Math.random()*68)+"%";
    ph.appendChild(s); if(ph.querySelectorAll(".stkr").length > 6) ph.querySelector(".stkr").remove();
    p.classList.remove("wig"); void p.offsetWidth; p.classList.add("wig");
  });
}
(function(){
  var g = $("#garland"); if(!g) return;
  g.innerHTML = FOTO.slice(0,4).map(function(f,i){
    return '<div class="gp" style="--r:'+[-4,3,-2,4][i]+'deg;animation-delay:-'+(i*.7)+'s"><img src="'+f.src+'" alt="" style="object-position:'+((f.fx||.5)*100)+'% '+((f.fy||.3)*100)+'%"></div>';
  }).join("");
  g.querySelectorAll(".gp").forEach(function(p){
    p.onclick = function(){ open_("photo"); };
    p.querySelector("img").onerror = function(){ p.classList.add("miss"); };
  });
})();

var G = {run:false};
var EN = ["🍩","🍰","🧁","🍪","🍫"], PAR = ["💖","✨","🌸","🎀"];
var SAY = ["Cantik banget! 😍","Yeay! 🎉","Kena deh! 💥","Woww 😎","Mantap! ✨","Our Princesss 👑"], GOAL = 25;
function faceFor(i, cb){
  var f = FOTO[i], img = new Image();
  img.onload = function(){
    var c = document.createElement("canvas"), x, side, sx, sy; c.width = c.height = 96; x = c.getContext("2d");
    side = Math.min(img.width, img.height, (f.fs||.5)*img.width);
    sx = Math.max(0, Math.min(img.width-side, (f.fx||.5)*img.width-side/2));
    sy = Math.max(0, Math.min(img.height-side, (f.fy||.3)*img.height-side/2));
    x.beginPath(); x.arc(48,48,48,0,7); x.clip(); x.drawImage(img,sx,sy,side,side,0,0,96,96); cb(c);
  };
  img.onerror = function(){ cb(null); };
  img.src = encodeURI(f.src);
}
function closeGame(){ G.run = false; $("#game").classList.remove("on"); }
function openGame(){
  var m = $("#gmsg"); G.run = false; $("#game").classList.add("on"); m.className = "";
  m.innerHTML = '<h2>Misinya Selamatkan Pesta! 🚀</h2><p>Geser pake jari kamu atau pake tombol panah. Tembakan keluar sendiri. Habisi '+GOAL+' kue jahat!</p><p>Pilih pilotnya:</p><div class="pick">'+
    FOTO.map(function(f,i){ return '<button data-i="'+i+'" aria-label="Pilot '+(i+1)+'"><img src="'+f.src+'" alt="" style="object-position:'+((f.fx||.5)*100)+'% '+((f.fy||.3)*100)+'%"></button>'; }).join("")+'</div>';
  m.querySelectorAll("button").forEach(function(b){ b.onclick = function(){ faceFor(+b.dataset.i, startGame); }; });
  if(!G.bound){
    G.bound = 1; var cv = $("#gc");
    var mv = function(e){ if(G.run && G.s){ G.s.tx = e.clientX-cv.getBoundingClientRect().left; G.s.ty = e.clientY-70; } };
    cv.addEventListener("pointerdown", mv); cv.addEventListener("pointermove", mv);
    document.addEventListener("keydown", function(e){
      if(!G.s || !G.run) return;
      if(e.key === "Escape") return closeGame();
      G.s.keys[e.key.length > 1 ? e.key : e.key.toLowerCase()] = 1;
      if(e.key.indexOf("Arrow") === 0) e.preventDefault();
    });
    document.addEventListener("keyup", function(e){ if(G.s) delete G.s.keys[e.key.length > 1 ? e.key : e.key.toLowerCase()]; });
    addEventListener("resize", function(){ if(G.fit) G.fit(); });
    $("#gx").onclick = closeGame;
  }
}
function startGame(face){
  var cv = $("#gc"), cx = cv.getContext("2d"), dpr = window.devicePixelRatio||1, W, H;
  function fit(){ W = Math.min(innerWidth,560); H = innerHeight; cv.width = W*dpr; cv.height = H*dpr; cv.style.width = W+"px"; cv.style.height = H+"px"; cx.setTransform(dpr,0,0,dpr,0,0); }
  fit(); G.fit = fit;
  var s = G.s = {x:W/2,y:H-120,tx:W/2,ty:H-120,b:[],e:[],p:[],t:[],score:0,lives:3,inv:0,diz:0,pw:0,fire:0,spawn:0,tm:0,face:face,keys:{}};
  function hud(){ $("#gs").textContent = "Skor "+Math.min(s.score,GOAL)+"/"+GOAL; $("#gl").textContent = s.lives > 0 ? "❤️".repeat(s.lives) : "💔"; }
  function burst(x,y,n){ for(var i=0;i<n;i++){ var a = Math.random()*6.28, v = 1+Math.random()*3; s.p.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2,l:40+Math.random()*25,e:PAR[Math.random()*PAR.length|0]}); } }
  function say(t,x,y){ s.t.push({s:t,x:Math.max(80,Math.min(W-80,x)),y:y,l:60}); }
  function end(win){
    G.run = false; var m = $("#gmsg"); m.className = "";
    m.innerHTML = win
      ? '<h2>Misi selesai! 🎉</h2><p>Semua kue jahat sudah kalah. Terima kasih sudah menyelamatkan pestanya, Princess ✨</p>'
      : '<h2>Yah, kuenya menang 😵</h2><p>Gapapaa tenang aja, pestanya belum bubar. Coba lagi yuk!</p>';
    m.innerHTML += '<div class="row"><button class="btn" id="ag">Main lagi</button><button class="btn alt" id="cl">Tutup</button></div>';
    $("#ag").onclick = openGame; $("#cl").onclick = closeGame;
    if(win) confetti();
  }
  function kill(e){
    s.score += e.big ? 3 : 1; burst(e.x,e.y,e.big ? 14 : 7);
    if(Math.random() < .35) say(SAY[Math.random()*SAY.length|0], e.x, e.y);
    if(Math.random() < .12){ s.pw = 360; say("Tembakan 3 arah! 🎀", s.x, s.y-70); }
    hud(); if(s.score >= GOAL) end(true);
  }
  function step(dt){
    var k = s.keys, sp = 8*dt; s.tm += dt;
    if(k.ArrowLeft || k.a) s.tx -= sp; if(k.ArrowRight || k.d) s.tx += sp;
    if(k.ArrowUp || k.w) s.ty -= sp; if(k.ArrowDown || k.s) s.ty += sp;
    s.tx = Math.max(30, Math.min(W-30, s.tx)); s.ty = Math.max(90, Math.min(H-50, s.ty));
    var f = .25*Math.min(dt,1.5); s.x += (s.tx-s.x)*f; s.y += (s.ty-s.y)*f;
    s.inv -= dt; s.diz -= dt; s.pw -= dt; s.fire -= dt;
    if(s.fire <= 0){ s.fire = s.pw > 0 ? 13 : 19; (s.pw > 0 ? [-16,0,16] : [0]).forEach(function(o){ s.b.push({x:s.x+o,y:s.y-34,vx:o/9}); }); }
    s.spawn -= dt;
    if(s.spawn <= 0){ s.spawn = Math.max(22, 62-s.score*1.6); s.e.push({x:30+Math.random()*(W-60),y:-30,v:1.6+s.score*.045+Math.random()*.8,ph:Math.random()*6,e:EN[Math.random()*EN.length|0],big:Math.random() < .12}); }
    s.b.forEach(function(b){ b.y -= 9*dt; b.x += b.vx*dt; });
    s.e.forEach(function(e){ e.y += e.v*dt; e.x += Math.sin(s.tm/20+e.ph)*1.2*dt; });
    s.e.forEach(function(e){ s.b.forEach(function(b){
      if(!e.dead && !b.dead && Math.hypot(e.x-b.x,e.y-b.y) < (e.big ? 32 : 24)){
        b.dead = 1; e.hp = (e.hp || (e.big ? 3 : 1))-1;
        if(e.hp <= 0){ e.dead = 1; kill(e); } else burst(e.x,e.y,2);
      } }); });
    s.e.forEach(function(e){
      if(G.run && !e.dead && s.inv <= 0 && Math.hypot(e.x-s.x,e.y-s.y) < (e.big ? 44 : 34)){
        e.dead = 1; burst(e.x,e.y,8); s.lives--; s.inv = 100; s.diz = 50; say("Aduh! 😵", s.x, s.y-60); hud();
        if(s.lives <= 0) end(false);
      } });
    s.e = s.e.filter(function(e){ return !e.dead && e.y < H+40; });
    s.b = s.b.filter(function(b){ return !b.dead && b.y > -20; });
    s.p.forEach(function(p){ p.x += p.vx*dt; p.y += p.vy*dt; p.vy += .12*dt; p.l -= dt; });
    s.p = s.p.filter(function(p){ return p.l > 0; });
    s.t.forEach(function(t){ t.y -= .8*dt; t.l -= dt; }); s.t = s.t.filter(function(t){ return t.l > 0; });
  }
  function ship(){
    var x = s.x, y = s.y, r = 24, blink = (s.tm|0)%6 < 3;
    if(s.inv > 0 && blink) cx.globalAlpha = .4;
    cx.fillStyle = blink ? "#ffb347" : "#ff7a3d"; cx.beginPath(); cx.moveTo(x-9,y+26); cx.lineTo(x,y+46+Math.sin(s.tm)*4); cx.lineTo(x+9,y+26); cx.fill();
    cx.fillStyle = "#8b2635";
    [-1,1].forEach(function(d){ cx.beginPath(); cx.moveTo(x+d*12,y+2); cx.lineTo(x+d*40,y+34); cx.lineTo(x+d*10,y+30); cx.closePath(); cx.fill(); });
    cx.fillStyle = "#fff6e3"; cx.strokeStyle = "#8b2635"; cx.lineWidth = 3; cx.beginPath(); cx.ellipse(x,y+10,19,32,0,0,6.3); cx.fill(); cx.stroke();
    cx.save(); cx.translate(x,y-6); if(s.diz > 0) cx.rotate(s.tm/2); cx.beginPath(); cx.arc(0,0,r,0,6.3);
    if(s.face){ cx.save(); cx.clip(); cx.drawImage(s.face,-r,-r,r*2,r*2); cx.restore(); }
    else { cx.fillStyle = "#ffd9b8"; cx.fill(); cx.font = "30px serif"; cx.fillText("😊",0,2); }
    cx.lineWidth = 4; cx.strokeStyle = "#c9a46b"; cx.beginPath(); cx.arc(0,0,r,0,6.3); cx.stroke(); cx.restore();
    cx.font = "22px serif"; cx.fillText(s.diz > 0 ? "😵" : "🎀", x+(s.diz > 0 ? 0 : 18), y-36); cx.globalAlpha = 1;
  }
  function draw(){
    cx.clearRect(0,0,W,H); cx.fillStyle = "rgba(255,246,227,.7)";
    for(var i=0;i<40;i++) cx.fillRect((i*137)%W, ((i*89)+s.tm*(.4+i%3*.3))%H, 2, 2);
    cx.textAlign = "center"; cx.textBaseline = "middle";
    s.e.forEach(function(e){ cx.font = (e.big ? 58 : 40)+"px serif"; cx.fillText(e.e,e.x,e.y); });
    cx.font = "22px serif"; s.b.forEach(function(b){ cx.fillText("💖",b.x,b.y); });
    ship();
    cx.font = "20px serif"; s.p.forEach(function(p){ cx.globalAlpha = Math.min(1,p.l/25); cx.fillText(p.e,p.x,p.y); }); cx.globalAlpha = 1;
    cx.font = "700 18px Quicksand,sans-serif"; cx.lineWidth = 4; cx.strokeStyle = "#6d1f2f"; cx.fillStyle = "#fff6e3";
    s.t.forEach(function(t){ cx.globalAlpha = Math.min(1,t.l/20); cx.strokeText(t.s,t.x,t.y); cx.fillText(t.s,t.x,t.y); }); cx.globalAlpha = 1;
  }
  $("#gmsg").className = "hide"; hud(); G.run = true;
  var last = performance.now();
  (function loop(now){
    if(!G.run || G.s !== s){ draw(); return; }
    var dt = Math.min(2,(now-last)/16.67); last = now; step(dt); draw(); requestAnimationFrame(loop);
  })(last);
}
