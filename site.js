function AOEInit(){
var y = document.getElementById("y"); if (y) y.textContent = new Date().getFullYear();
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function base(){return "/";}
var briefEl = document.getElementById("brief-body");
function sampleBrief(){
  return fetch(base()+"data/brief.json").then(function(r){return r.json();}).then(function(b){
    document.getElementById("brief-label").textContent = b.label + " · " + b.updated;
    briefEl.innerHTML = b.sections.map(function(s){return '<div class="brief-sec"><h3>'+esc(s.title)+'</h3><ul>'+s.items.map(function(i){return '<li>'+esc(i)+'</li>';}).join("")+'</ul></div>';}).join("");
  });
}
if (briefEl) fetch(base()+"data/brief.html",{cache:"no-cache"}).then(function(r){
  if(!r.ok) throw 0; return r.text();
}).then(function(h){
  if(!h.trim()) throw 0;
  briefEl.classList.add("brief-real"); briefEl.innerHTML = h;
  var badge=document.querySelector(".brief-badge"); if(badge) badge.remove();
  var lbl=document.getElementById("brief-label"); if(lbl) lbl.remove();
}).catch(function(){ return sampleBrief(); }).catch(function(){briefEl.textContent="Today's brief isn't available yet. Check back soon.";});
var dirEl = document.getElementById("dir-body");
if (dirEl) fetch(base()+"data/directory.json").then(function(r){return r.json();}).then(function(d){
  var cats=["Equipment rental","Dirt work / excavation","Fencing","Snow removal","Hauling","Materials","Ag supply","Ag services","Trades & supplies","Auto parts","Mechanic shops","Heavy equipment welding","Welding & fabrication","Welding gas & supplies","Dealers"];
  var tel=function(p){return p?'<a href="tel:+1'+p.replace(/\D/g,"")+'">'+esc(p)+'</a>':'';};
  var f=d.featured;
  document.getElementById("dir-featured").innerHTML='<p class="card-kicker">Featured listing</p><h3>'+esc(f.name)+'</h3><p>'+esc(f.blurb)+'</p><p>'+esc((f.categories||[f.category]).join(', '))+' · '+esc(f.town)+'</p>'+(f.text&&f.text!==f.phone?'<p>Call '+tel(f.phone)+' · Text '+tel(f.text)+'</p>':'<p>Call or text '+tel(f.phone)+'</p>');
  dirEl.innerHTML=cats.map(function(c){var ls=d.listings.filter(function(l){return (l.categories||[l.category]).indexOf(c)>-1;});
    return '<section class="dir-cat"><h2>'+esc(c)+'</h2>'+(ls.length?'<ul class="dir-list">'+ls.map(function(l){return '<li class="card"><strong>'+esc(l.name)+'</strong><span>'+esc(l.town)+', WY</span>'+(l.phone?'<span>'+tel(l.phone)+'</span>':'')+(l.note?'<span>'+esc(l.note)+'</span>':'')+'<a href="'+esc(l.website)+'" rel="nofollow noopener" target="_blank">'+(l.note&&/U-Haul/.test(l.name)?'Rates &amp; reservations':'Website')+'</a><small class="tag">Unverified · not affiliated</small></li>';}).join("")+'</ul>':'<p class="note">No listings yet.</p>')+'</section>';}).join("");
});
if(window.AOEPlayer) window.AOEPlayer.bindBrief();
}

/* Site-wide music player + same-origin page swaps so audio never stops */
(function(){
  if (window.AOEPlayer) return;
  var KEY="aoe-muted", muted=localStorage.getItem(KEY)==="1";
  var audio=new Audio(); audio.preload="auto"; var list=[], i=0, started=false;
  function shuffle(a){for(var j=a.length-1;j>0;j--){var k=Math.floor(Math.random()*(j+1));var t=a[j];a[j]=a[k];a[k]=t;}return a;}
  var ready=fetch("/data/playlist.json").then(function(r){return r.json();}).then(function(d){list=shuffle(d.tracks.slice());});
  function title(){return list.length?list[i].title:"";}
  function load(){var t=list[i]; audio.src="/"+t.src.replace(/^\//,""); ui();}
  function next(){ if(!list.length) return; i=(i+1)%list.length; if(i===0) shuffle(list); load(); if(!muted) audio.play().catch(function(){}); }
  audio.addEventListener("ended",next);
  audio.addEventListener("error",function(){ if(started) setTimeout(next,500); });
  audio.addEventListener("play",ui); audio.addEventListener("pause",ui);
  function tryPlay(){ if(muted) return Promise.resolve(); return audio.play().then(function(){started=true;ui();}); }
  function unlock(){ document.removeEventListener("pointerdown",unlock,true); document.removeEventListener("keydown",unlock,true); if(!muted) tryPlay().catch(function(){}); }
  var btn=document.createElement("button"); btn.type="button"; btn.id="aoe-sound"; btn.className="sound-fab";
  btn.addEventListener("click",function(e){ e.stopPropagation(); muted=!muted; localStorage.setItem(KEY,muted?"1":"0");
    if(muted){audio.pause();} else { if(!audio.src) load(); tryPlay().catch(function(){}); } ui(); });
  function ui(){
    btn.textContent=muted?"🔇":"🔊"; btn.setAttribute("aria-label",muted?"Turn music on":"Mute music");
    btn.title=muted?"Music off. Tap to turn on":("Now playing: "+title()+". Tap to mute");
    var np=document.getElementById("now-playing"); if(np) np.textContent=title()?("♪ "+title()+(muted?" (muted)":audio.paused?" (tap anywhere to start)":"")):"";
  }
  function mountBtn(){ if(!document.body.contains(btn)) document.body.appendChild(btn); ui(); }
  window.AOEPlayer={ next:next, ui:ui, bindBrief:function(){
    var nb=document.getElementById("player-next"); if(nb){ nb.hidden=false; nb.onclick=function(){ if(muted){muted=false;localStorage.setItem(KEY,"0");} next(); }; }
    var pb=document.getElementById("player-pause"); if(pb) pb.remove();
    var st=document.getElementById("sound-toggle"); if(st) st.remove();
    ui(); } };
  ready.then(function(){ load(); tryPlay().catch(function(){ document.addEventListener("pointerdown",unlock,true); document.addEventListener("keydown",unlock,true); }); });

  /* Page swaps: same-origin, non-hash, non-download links */
  function swap(url,push){
    return fetch(url,{credentials:"same-origin"}).then(function(r){ if(!r.ok||!/text\/html/.test(r.headers.get("content-type")||"")) throw 0; return r.text(); }).then(function(h){
      var doc=new DOMParser().parseFromString(h,"text/html");
      document.title=doc.title;
      ["description"].forEach(function(n){var a=document.querySelector('meta[name="'+n+'"]'),b=doc.querySelector('meta[name="'+n+'"]'); if(a&&b) a.setAttribute("content",b.getAttribute("content"));});
      doc.body.querySelectorAll("script").forEach(function(s){s.remove();});
      if(push) history.pushState({aoe:1},"",url);
      document.body.innerHTML=doc.body.innerHTML;
      var hsh=new URL(url,location.href).hash; if(hsh&&document.querySelector(hsh)) document.querySelector(hsh).scrollIntoView(); else if(push) window.scrollTo(0,0);
      mountBtn(); AOEInit();
      /* Count in-place page views (first load is counted by count.js itself) */
      if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({path: location.pathname + location.search, title: document.title});
    }).catch(function(){ location.href=url; });
  }
  document.addEventListener("click",function(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
    var a=e.target.closest&&e.target.closest("a"); if(!a||a.target||a.hasAttribute("download")) return;
    var u; try{u=new URL(a.getAttribute("href"),location.href);}catch(x){return;}
    if(u.origin!==location.origin||!/^https?:$/.test(u.protocol)) return;
    if(u.pathname===location.pathname&&u.hash) return;
    if(/\.(mp3|jpg|jpeg|png|webp|pdf|xml|json|txt|svg)$/i.test(u.pathname)) return;
    e.preventDefault(); swap(u.href,true);
  });
  history.replaceState({aoe:1},"",location.href);
  window.addEventListener("popstate",function(e){ if(e.state&&e.state.aoe) swap(location.href,false); });
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",mountBtn); else mountBtn();
})();
AOEInit();
