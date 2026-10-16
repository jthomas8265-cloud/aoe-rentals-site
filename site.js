var y = document.getElementById("y"); if (y) y.textContent = new Date().getFullYear();
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function base(){return document.body.getAttribute("data-base")||"";}
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
  var cats=["Equipment rental","Dirt work / excavation","Fencing","Snow removal","Hauling","Materials","Ag supply","Ag services"];
  var tel=function(p){return p?'<a href="tel:+1'+p.replace(/\D/g,"")+'">'+esc(p)+'</a>':'';};
  var f=d.featured;
  document.getElementById("dir-featured").innerHTML='<p class="card-kicker">Featured listing</p><h3>'+esc(f.name)+'</h3><p>'+esc(f.blurb)+'</p><p>'+esc((f.categories||[f.category]).join(', '))+' · '+esc(f.town)+'</p><p>Call '+tel(f.phone)+' · Text '+tel(f.text)+'</p>';
  dirEl.innerHTML=cats.map(function(c){var ls=d.listings.filter(function(l){return (l.categories||[l.category]).indexOf(c)>-1;});
    return '<section class="dir-cat"><h2>'+esc(c)+'</h2>'+(ls.length?'<ul class="dir-list">'+ls.map(function(l){return '<li class="card"><strong>'+esc(l.name)+'</strong><span>'+esc(l.town)+', WY</span>'+(l.phone?'<span>'+tel(l.phone)+'</span>':'')+(l.note?'<span>'+esc(l.note)+'</span>':'')+'<a href="'+esc(l.website)+'" rel="nofollow noopener" target="_blank">'+(l.note?'Rates &amp; reservations':'Website')+'</a><small class="tag">Unverified · not affiliated</small></li>';}).join("")+'</ul>':'<p class="note">No listings yet.</p>')+'</section>';}).join("");
});
(function(){
  var tog=document.getElementById("sound-toggle"); if(!tog) return;
  var np=document.getElementById("now-playing"), pb=document.getElementById("player-pause"), nb=document.getElementById("player-next");
  var audio=new Audio(); audio.preload="none"; var list=[], i=0, on=false;
  function shuffle(a){for(var j=a.length-1;j>0;j--){var k=Math.floor(Math.random()*(j+1));var t=a[j];a[j]=a[k];a[k]=t;}return a;}
  function play(){var t=list[i]; audio.src=base()+t.src; np.textContent="♪ "+t.title; audio.play().catch(function(){}); pb.textContent="Pause";}
  function next(){i=(i+1)%list.length; if(i===0) shuffle(list); play();}
  audio.addEventListener("ended",next);
  audio.addEventListener("error",function(){ if(on) next(); });
  function load(){return list.length?Promise.resolve():fetch(base()+"data/playlist.json").then(function(r){return r.json();}).then(function(d){list=shuffle(d.tracks.slice());});}
  tog.addEventListener("click",function(){
    on=!on; tog.setAttribute("aria-pressed",on); tog.textContent=on?"🔊 Sound on":"🔇 Sound off";
    pb.hidden=nb.hidden=!on;
    if(on){load().then(play).catch(function(){np.textContent="Music unavailable";});}
    else{audio.pause(); np.textContent="";}
  });
  pb.addEventListener("click",function(){ if(audio.paused){audio.play().catch(function(){});pb.textContent="Pause";} else {audio.pause();pb.textContent="Play";} });
  nb.addEventListener("click",next);
})();
