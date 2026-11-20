(function(){pop(null);setStart("e1");choose("16");
setTimeout(function(){
 ["mast","dock"].forEach(function(i){var e=document.getElementById(i);if(e)e.style.display="none"});
 document.querySelectorAll(".ctl,.toast,.pop,.farbox,.farscr,#resRow").forEach(function(e){e.style.display="none"});
 var o=document.querySelector(".osm");if(o){o.style.opacity="1"}
 var b=lastBox,w=b[2]-b[0];fitBox(b[0]-w*1.05,b[1]-25,b[2]+30,b[3]+25,0);
 var c=document.createElement("div");c.className="glass";
 c.style.cssText="position:fixed;left:48px;top:50%;transform:translateY(-50%);width:520px;padding:40px 44px;border-radius:40px;z-index:99;color:var(--ink);"
  +"background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.28));-webkit-backdrop-filter:blur(14px) saturate(1.7);backdrop-filter:blur(14px) saturate(1.7);"
  +"box-shadow:0 30px 70px -20px rgba(20,26,30,.45),inset 1.5px 1.5px 1px -.5px rgba(255,255,255,.95),inset -1.5px -1.5px 1px -.5px rgba(255,255,255,.55),inset 0 0 0 .5px rgba(255,255,255,.4)";
 c.innerHTML='<div style="display:flex;align-items:center;gap:16px;margin-bottom:26px"><img src="brand/ariadna-favicon.svg" width="64" height="64" style="border-radius:16px"><div style="font-size:22px;font-weight:600;opacity:.75;line-height:1.25">Карта-план<br>психіатричної лікарні</div></div>'
  +'<div style="font-size:54px;font-weight:700;line-height:1.05;letter-spacing:-.02em;margin-bottom:20px">Як дійти до корпусу й відділення</div>'
  +'<div style="font-size:25px;line-height:1.35;opacity:.82">Київ, вул. Кирилівська, 103<br>Нитка поведе від зупинки<br>або від вас</div>';
 document.body.appendChild(c)},1200)})();1
