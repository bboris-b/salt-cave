/** Critical path: inlined in document HTML before the main bundle. */

export const SALT_LOADER_DRAW_MS = 2400
export const SALT_LOADER_FADE_MS = 600

export const LOADER_INLINE_CSS = `
#loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #0a0a08;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
#loader .salt-loader-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
#loader svg {
  width: 64px;
  height: 64px;
}
#loader path {
  fill: none;
  stroke: #d4967a;
  stroke-width: 0.8;
  stroke-linecap: round;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: salt-loader-draw 2.4s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}
@keyframes salt-loader-draw {
  0% { stroke-dashoffset: 100; opacity: 0.4; }
  15% { opacity: 0.8; }
  85% { stroke-dashoffset: 0; opacity: 0.8; }
  100% { stroke-dashoffset: 0; opacity: 0.3; }
}
#loader-pct {
  font-family: var(--font-dm-sans, system-ui, sans-serif);
  font-size: 13px;
  font-weight: 400;
  color: #6b645a;
  margin: 20px 0 0;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}
#loader.done {
  opacity: 0;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  #loader path {
    stroke-dashoffset: 0;
    animation: none;
    opacity: 0.5;
  }
}
`

export const LOADER_INLINE_SCRIPT = `
(function(){
  var DRAW_MS=${SALT_LOADER_DRAW_MS};
  var PHASE2_MS=300;
  var FADE_MS=${SALT_LOADER_FADE_MS};
  var T0=performance.now();
  window.__SALT_LOADER_T0=T0;
  var loader=document.getElementById('loader');
  var pctEl=document.getElementById('loader-pct');
  var svg=document.getElementById('loader-ring-svg');
  var appReady=false;
  var raf=0;
  var hideScheduled=false;
  function easeInOutQuad(t){return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
  function scheduleHide(){
    if(hideScheduled||!loader)return;
    hideScheduled=true;
    var elapsed=performance.now()-T0;
    var remaining=Math.max(0,DRAW_MS-elapsed);
    setTimeout(function(){
      loader.classList.add('done');
      setTimeout(function(){loader.remove();},FADE_MS);
    },remaining);
  }
  function markAppReady(){appReady=true;}
  window.__saltMarkLoaderReady=markAppReady;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    if(pctEl)pctEl.textContent='Caricamento...';
    if(svg)svg.setAttribute('aria-valuetext','Caricamento in corso');
    var doneRm=false;
    function tryHideRm(){
      if(!appReady||doneRm)return;
      doneRm=true;
      var elapsed=performance.now()-T0;
      var remaining=Math.max(0,DRAW_MS-elapsed);
      setTimeout(function(){
        if(!loader)return;
        loader.classList.add('done');
        setTimeout(function(){loader.remove();},FADE_MS);
      },remaining);
    }
    window.__saltMarkLoaderReady=function(){markAppReady();tryHideRm();};
    return;
  }
  function tick(){
    var elapsed=performance.now()-T0;
    var currentPct;
    if(!appReady){
      if(elapsed<DRAW_MS){
        var t=elapsed/DRAW_MS;
        currentPct=Math.round(easeInOutQuad(t)*85);
      }else{
        var extra=Math.floor((elapsed-DRAW_MS)/PHASE2_MS);
        currentPct=Math.min(99,85+extra);
      }
    }else{
      currentPct=100;
    }
    if(pctEl)pctEl.textContent=currentPct+'%';
    if(svg)svg.setAttribute('aria-valuenow',String(currentPct));
    if(currentPct<100){
      raf=requestAnimationFrame(tick);
    }else{
      scheduleHide();
    }
  }
  raf=requestAnimationFrame(tick);
})();
`
