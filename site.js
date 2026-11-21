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
var ysYard = document.getElementById("yard-sales-body");
var ysGarden = document.getElementById("garden-body");
var ysFarm = document.getElementById("farm-body");
var ysFood = document.getElementById("food-body");
if (ysYard || ysGarden || ysFarm || ysFood) {
  function ysToday(){ return new Date().toLocaleDateString("en-CA", {timeZone:"America/Denver"}); }
  function ysDay(iso){
    if(!iso) return "";
    var p = String(iso).split("-");
    if(p.length!==3) return esc(iso);
    var d = new Date(Date.UTC(Number(p[0]), Number(p[1])-1, Number(p[2]), 12));
    return d.toLocaleDateString("en-US", {weekday:"short", month:"short", day:"numeric", timeZone:"UTC"});
  }
  function ysAddDays(iso, days){
    var p = String(iso).split("-");
    if(p.length!==3) return "";
    var d = new Date(Date.UTC(Number(p[0]), Number(p[1])-1, Number(p[2]), 12));
    d.setUTCDate(d.getUTCDate()+days);
    return d.toISOString().slice(0,10);
  }
  function ysCategory(s){
    var c=String(s.category||"yard-sale").toLowerCase().replace(/_/g,"-");
    if(c==="garden"||c==="eggs"||c==="garden-eggs") return "garden";
    if(c==="farm"||c==="hay"||c==="hay-farm") return "farm";
    if(c==="food-truck"||c==="foodtruck"||c==="truck") return "food-truck";
    if(c==="coffee"||c==="coffee-shop"||c==="coffee-hut") return "coffee";
    if(c==="restaurant"||c==="restaurants") return "restaurant";
    return "yard-sale";
  }
  function ysPaid(s){
    var cat=ysCategory(s);
    return !!(s.paid || s.featured || cat==="restaurant");
  }
  function ysUntil(s){
    if(s.end) return String(s.end);
    if(s.expires) return String(s.expires);
    var cat=ysCategory(s), paid=ysPaid(s);
    if(cat==="coffee" && !paid){
      if(s.added) return ysAddDays(s.added, 7);
      return s.start?String(s.start):"";
    }
    if(cat==="food-truck" && !paid){
      return s.start?String(s.start):(s.added?String(s.added):"");
    }
    if(paid || cat==="restaurant"){
      return s.start?String(s.start):"";
    }
    if(s.start) return String(s.start);
    if(s.added) return ysAddDays(s.added, 30);
    return "";
  }
  function ysRange(s){
    var start=s.start, end=s.end;
    if(start && end && start!==end) return ysDay(start)+" – "+ysDay(end);
    if(start) return ysDay(start);
    var until=ysUntil(s);
    return until?("Through "+ysDay(until)):"";
  }
  var emptyMsg={
    "yard-sale":"No yard sales listed right now. If you are having one, send us the details and we will put it up.",
    "garden":"No garden, egg, or honey listings right now. If you have extras to share, send us the details and we will put it up.",
    "farm":"No hay or farm listings right now. If you have hay, straw, or feed to sell, send us the details and we will put it up.",
    "food":"No food trucks, coffee specials, or restaurant listings right now. Food trucks can post today's spot, and coffee shops can post a special."
  };
  var defaultTitle={"yard-sale":"Yard sale","garden":"Garden goods","farm":"Hay and farm goods","food-truck":"Food truck","coffee":"Coffee special","restaurant":"Restaurant"};
  function ysCard(s){
    var when=ysRange(s);
    var times=s.times?esc(s.times):"";
    var kicker=when+(times?(when?" · ":"")+times:"");
    var paid=ysPaid(s);
    var featured=!!s.featured;
    var tag=paid?' <span class="board-sponsored">Sponsored</span>':'';
    var price=s.price?('<p class="yard-sale-price">'+esc(s.price)+'</p>'):'';
    var loc=s.location?('<p class="yard-sale-loc">'+esc(s.location)+'</p>'):'';
    var desc=s.description?('<p class="yard-sale-desc">'+esc(s.description)+'</p>'):'';
    var contact=s.contact?('<p class="yard-sale-contact">'+esc(s.contact)+'</p>'):'';
    var cat=ysCategory(s);
    var cls="card yard-sale-card"+(featured?" featured":"");
    return '<li class="'+cls+'"><p class="card-kicker">'+(kicker?kicker:"Listed")+tag+'</p><h3>'+esc(s.title||defaultTitle[cat])+'</h3>'+price+loc+desc+contact+'</li>';
  }
  function ysRender(el, items, cat){
    if(!el) return;
    if(!items.length){
      el.innerHTML='<p class="note yard-sales-empty">'+emptyMsg[cat]+'</p>';
      return;
    }
    el.innerHTML='<ul class="yard-sale-list">'+items.map(ysCard).join("")+'</ul>';
  }
  function ysSort(a,b,cat){
    if(cat==="food"){
      var fa=!!a.featured, fb=!!b.featured;
      if(fa!==fb) return fa?-1:1;
      var pa=ysPaid(a), pb=ysPaid(b);
      if(pa!==pb) return pa?-1:1;
    }
    if(cat==="yard-sale" || cat==="food"){
      var as=a.start||a.added||"", bs=b.start||b.added||"";
      if(as!==bs) return as<bs?-1:1;
    } else {
      var aa=a.added||"", ba=b.added||"";
      if(aa!==ba) return aa>ba?-1:1;
    }
    var ae=ysUntil(a), be=ysUntil(b);
    if(ae!==be) return ae<be?-1:1;
    return String(a.title||"").localeCompare(String(b.title||""));
  }
  fetch(base()+"data/yard-sales.json",{cache:"no-cache"}).then(function(r){
    if(!r.ok) throw 0; return r.json();
  }).then(function(data){
    var today = ysToday();
    var all = (Array.isArray(data) ? data : (data.listings||[])).filter(function(s){
      var until = ysUntil(s);
      return until && String(until) >= today;
    });
    function itemsFor(cats){
      var set=cats;
      return all.filter(function(s){return set.indexOf(ysCategory(s))>-1;});
    }
    ysRender(ysGarden, itemsFor(["garden"]).sort(function(a,b){return ysSort(a,b,"garden");}), "garden");
    ysRender(ysFood, itemsFor(["food-truck","coffee","restaurant"]).sort(function(a,b){return ysSort(a,b,"food");}), "food");
    ysRender(ysYard, itemsFor(["yard-sale"]).sort(function(a,b){return ysSort(a,b,"yard-sale");}), "yard-sale");
    ysRender(ysFarm, itemsFor(["farm"]).sort(function(a,b){return ysSort(a,b,"farm");}), "farm");
  }).catch(function(){
    var fail='<p class="note">The community board isn\'t loading right now. Check back soon, or send us your details and we will post them.</p>';
    [ysYard,ysGarden,ysFarm,ysFood].forEach(function(el){ if(el) el.innerHTML=fail; });
  });
}

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
