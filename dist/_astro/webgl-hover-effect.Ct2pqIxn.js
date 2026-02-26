import{h,j as y,O as w,P as g,m as S,S as x,V as c,M,T as V,n as C}from"./three.module.BXrdTxcK.js";import{a as R}from"./tokens.D15fTzav.js";const t=R.workHover,U=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`,b=`
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uVelo;
  uniform vec2 uResolution;
  uniform vec2 uCoverScale;
  uniform float uRadius;
  uniform vec3 uChannelSpread;

  varying vec2 vUv;

  float circle(vec2 uv, vec2 center, float radius, float border) {
    uv -= center;
    uv *= uResolution;
    float dist = length(uv);
    return smoothstep(radius + border, radius - border, dist);
  }

  vec2 coverUV(vec2 uv) {
    return (uv - 0.5) * uCoverScale + 0.5;
  }

  void main() {
    vec2 newUV = vUv;
    float c = circle(newUV, uMouse, 0.0, uRadius);

    // Chromatic aberration: sample R, G, B at progressively offset UVs
    float r = texture2D(uTexture, coverUV(newUV += c * (uVelo * uChannelSpread.x))).x;
    float g = texture2D(uTexture, coverUV(newUV += c * (uVelo * uChannelSpread.y))).y;
    float b = texture2D(uTexture, coverUV(newUV += c * (uVelo * uChannelSpread.z))).z;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;function T(e,n){const u=e.offsetWidth,r=e.offsetHeight;if(!u||!r)return null;const a=new h({alpha:!1,antialias:!1});a.setPixelRatio(Math.min(window.devicePixelRatio,t.maxDpr)),a.setSize(u,r),a.setClearColor(16645371,1);const o=a.domElement;o.style.position="absolute",o.style.inset="0",o.style.width="100%",o.style.height="100%",o.style.pointerEvents="none",o.style.zIndex="2",o.style.opacity="0",o.style.transition=`opacity ${t.fadeDuration}s ease`,e.appendChild(o);const l=new y,f=new w(-1,1,1,-1,0,1),m=new g(2,2),i={uTexture:{value:null},uMouse:{value:new c(.5,.5)},uVelo:{value:0},uResolution:{value:new c(1,r/u)},uCoverScale:{value:new c(1,1)},uRadius:{value:t.radius},uChannelSpread:{value:new S(t.channelSpread.r,t.channelSpread.g,t.channelSpread.b)}},p=new x({vertexShader:U,fragmentShader:b,uniforms:i});l.add(new M(m,p));const s=new V(n);s.minFilter=C,s.generateMipmaps=!1,s.needsUpdate=!0,i.uTexture.value=s;const d=n.naturalWidth/n.naturalHeight,v=u/r;return v<d?i.uCoverScale.value.set(v/d,1):i.uCoverScale.value.set(1,d/v),{renderer:a,canvas:o,uniforms:i,scene:l,camera:f,rafId:null,targetSpeed:0,mouse:{x:.5,y:.5},prevMouse:{x:.5,y:.5},followMouse:new c(.5,.5),hovered:!1}}function E(e){if(e.rafId!==null)return;function n(){e.rafId=requestAnimationFrame(n),e.followMouse.x+=t.mouseSmoothing*(e.mouse.x-e.followMouse.x),e.followMouse.y+=t.mouseSmoothing*(e.mouse.y-e.followMouse.y);const u=e.mouse.x-e.prevMouse.x,r=e.mouse.y-e.prevMouse.y,a=Math.sqrt(u*u+r*r);e.targetSpeed+=t.speedSmoothing*(a-e.targetSpeed),e.targetSpeed*=t.speedDecay,e.prevMouse.x=e.mouse.x,e.prevMouse.y=e.mouse.y,e.uniforms.uMouse.value.copy(e.followMouse),e.uniforms.uVelo.value=Math.min(e.targetSpeed,t.maxVelocity),e.renderer.render(e.scene,e.camera),!e.hovered&&e.targetSpeed<t.idleThreshold&&(L(e),e.canvas.style.opacity="0")}n()}function L(e){e.rafId!==null&&(cancelAnimationFrame(e.rafId),e.rafId=null)}function I(){window.matchMedia("(prefers-reduced-motion: reduce)").matches||window.matchMedia("(hover: hover)").matches&&document.querySelectorAll("[data-work-card]").forEach(e=>{if(e.dataset.webglHoverBound==="true")return;e.dataset.webglHoverBound="true";const n=e.querySelector(".work-card-inner"),u=n?.querySelector("img");if(!n||!u)return;let r=null;function a(){return!r&&u.complete&&u.naturalWidth>0&&(r=T(n,u)),r}n.addEventListener("mouseenter",()=>{const o=a();o&&(o.hovered=!0,o.canvas.style.opacity="1",E(o))}),n.addEventListener("mousemove",o=>{if(!r)return;const l=n.getBoundingClientRect();r.mouse.x=(o.clientX-l.left)/l.width,r.mouse.y=1-(o.clientY-l.top)/l.height}),n.addEventListener("mouseleave",()=>{r&&(r.hovered=!1)})})}export{I as initWebGLHoverEffect};
