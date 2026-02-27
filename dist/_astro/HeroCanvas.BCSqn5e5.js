import{r as b}from"./index.DiEladB3.js";import{M as te,O as Q,B as se,F as I,S as k,U as V,V as y,W as ie,H as ae,N as ne,C as oe,a as W,R as re,b as le,c as ce,L as ue,d as fe,e as he,A as pe,f as de,g as me,h as ge,i as ve,j as Se,k as xe,l as _e,I as Ee}from"./three.module.BXrdTxcK.js";import{a as Y,s as F}from"./tokens.BSsUJJ8u.js";var R={exports:{}},w={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var U;function we(){if(U)return w;U=1;var r=Symbol.for("react.transitional.element"),e=Symbol.for("react.fragment");function s(t,i,a){var n=null;if(a!==void 0&&(n=""+a),i.key!==void 0&&(n=""+i.key),"key"in i){a={};for(var o in i)o!=="key"&&(a[o]=i[o])}else a=i;return i=a.ref,{$$typeof:r,type:t,key:n,ref:i!==void 0?i:null,props:a}}return w.Fragment=e,w.jsx=s,w.jsxs=s,w}var H;function De(){return H||(H=1,R.exports=we()),R.exports}var Ce=De();const Me={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class D{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Ae=new Q(-1,1,1,-1,0,1);class be extends se{constructor(){super(),this.setAttribute("position",new I([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new I([0,2,0,0,2,0],2))}}const Te=new be;class J{constructor(e){this._mesh=new te(Te,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Ae)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class $ extends D{constructor(e,s){super(),this.textureID=s!==void 0?s:"tDiffuse",e instanceof k?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=V.clone(e.uniforms),this.material=new k({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new J(this.material)}render(e,s,t){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=t.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(s),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class X extends D{constructor(e,s){super(),this.scene=e,this.camera=s,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,s,t){const i=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let n,o;this.inverse?(n=0,o=1):(n=1,o=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),a.buffers.stencil.setFunc(i.ALWAYS,n,4294967295),a.buffers.stencil.setClear(o),a.buffers.stencil.setLocked(!0),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(i.EQUAL,1,4294967295),a.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),a.buffers.stencil.setLocked(!0)}}class Le extends D{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class Pe{constructor(e,s){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),s===void 0){const t=e.getSize(new y);this._width=t.width,this._height=t.height,s=new ie(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:ae}),s.texture.name="EffectComposer.rt1"}else this._width=s.width,this._height=s.height;this.renderTarget1=s,this.renderTarget2=s.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new $(Me),this.copyPass.material.blending=ne,this.clock=new oe}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,s){this.passes.splice(s,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const s=this.passes.indexOf(e);s!==-1&&this.passes.splice(s,1)}isLastEnabledPass(e){for(let s=e+1;s<this.passes.length;s++)if(this.passes[s].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const s=this.renderer.getRenderTarget();let t=!1;for(let i=0,a=this.passes.length;i<a;i++){const n=this.passes[i];if(n.enabled!==!1){if(n.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),n.render(this.renderer,this.writeBuffer,this.readBuffer,e,t),n.needsSwap){if(t){const o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}X!==void 0&&(n instanceof X?t=!0:n instanceof Le&&(t=!1))}}this.renderer.setRenderTarget(s)}reset(e){if(e===void 0){const s=this.renderer.getSize(new y);this._pixelRatio=this.renderer.getPixelRatio(),this._width=s.width,this._height=s.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,s){this._width=e,this._height=s;const t=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(t,i),this.renderTarget2.setSize(t,i);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(t,i)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Re extends D{constructor(e,s,t=null,i=null,a=null){super(),this.scene=e,this.camera=s,this.overrideMaterial=t,this.clearColor=i,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new W}render(e,s,t){const i=e.autoClear;e.autoClear=!1;let a,n;this.overrideMaterial!==null&&(n=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(a=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:t),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=n),e.autoClear=i}}const ye={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new y(1/1024,1/512)}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		// FXAA algorithm from NVIDIA, C# implementation by Jasper Flick, GLSL port by Dave Hoskins
		// http://developer.download.nvidia.com/assets/gamedev/files/sdk/11/FXAA_WhitePaper.pdf
		// https://catlikecoding.com/unity/tutorials/advanced-rendering/fxaa/

		uniform sampler2D tDiffuse;
		uniform vec2 resolution;
		varying vec2 vUv;

		#define EDGE_STEP_COUNT 6
		#define EDGE_GUESS 8.0
		#define EDGE_STEPS 1.0, 1.5, 2.0, 2.0, 2.0, 4.0
		const float edgeSteps[EDGE_STEP_COUNT] = float[EDGE_STEP_COUNT]( EDGE_STEPS );

		float _ContrastThreshold = 0.0312;
		float _RelativeThreshold = 0.063;
		float _SubpixelBlending = 1.0;

		vec4 Sample( sampler2D  tex2D, vec2 uv ) {

			return texture( tex2D, uv );

		}

		float SampleLuminance( sampler2D tex2D, vec2 uv ) {

			return dot( Sample( tex2D, uv ).rgb, vec3( 0.3, 0.59, 0.11 ) );

		}

		float SampleLuminance( sampler2D tex2D, vec2 texSize, vec2 uv, float uOffset, float vOffset ) {

			uv += texSize * vec2(uOffset, vOffset);
			return SampleLuminance(tex2D, uv);

		}

		struct LuminanceData {

			float m, n, e, s, w;
			float ne, nw, se, sw;
			float highest, lowest, contrast;

		};

		LuminanceData SampleLuminanceNeighborhood( sampler2D tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData l;
			l.m = SampleLuminance( tex2D, uv );
			l.n = SampleLuminance( tex2D, texSize, uv,  0.0,  1.0 );
			l.e = SampleLuminance( tex2D, texSize, uv,  1.0,  0.0 );
			l.s = SampleLuminance( tex2D, texSize, uv,  0.0, -1.0 );
			l.w = SampleLuminance( tex2D, texSize, uv, -1.0,  0.0 );

			l.ne = SampleLuminance( tex2D, texSize, uv,  1.0,  1.0 );
			l.nw = SampleLuminance( tex2D, texSize, uv, -1.0,  1.0 );
			l.se = SampleLuminance( tex2D, texSize, uv,  1.0, -1.0 );
			l.sw = SampleLuminance( tex2D, texSize, uv, -1.0, -1.0 );

			l.highest = max( max( max( max( l.n, l.e ), l.s ), l.w ), l.m );
			l.lowest = min( min( min( min( l.n, l.e ), l.s ), l.w ), l.m );
			l.contrast = l.highest - l.lowest;
			return l;

		}

		bool ShouldSkipPixel( LuminanceData l ) {

			float threshold = max( _ContrastThreshold, _RelativeThreshold * l.highest );
			return l.contrast < threshold;

		}

		float DeterminePixelBlendFactor( LuminanceData l ) {

			float f = 2.0 * ( l.n + l.e + l.s + l.w );
			f += l.ne + l.nw + l.se + l.sw;
			f *= 1.0 / 12.0;
			f = abs( f - l.m );
			f = clamp( f / l.contrast, 0.0, 1.0 );

			float blendFactor = smoothstep( 0.0, 1.0, f );
			return blendFactor * blendFactor * _SubpixelBlending;

		}

		struct EdgeData {

			bool isHorizontal;
			float pixelStep;
			float oppositeLuminance, gradient;

		};

		EdgeData DetermineEdge( vec2 texSize, LuminanceData l ) {

			EdgeData e;
			float horizontal =
				abs( l.n + l.s - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.se - 2.0 * l.e ) +
				abs( l.nw + l.sw - 2.0 * l.w );
			float vertical =
				abs( l.e + l.w - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.nw - 2.0 * l.n ) +
				abs( l.se + l.sw - 2.0 * l.s );
			e.isHorizontal = horizontal >= vertical;

			float pLuminance = e.isHorizontal ? l.n : l.e;
			float nLuminance = e.isHorizontal ? l.s : l.w;
			float pGradient = abs( pLuminance - l.m );
			float nGradient = abs( nLuminance - l.m );

			e.pixelStep = e.isHorizontal ? texSize.y : texSize.x;
			
			if (pGradient < nGradient) {

				e.pixelStep = -e.pixelStep;
				e.oppositeLuminance = nLuminance;
				e.gradient = nGradient;

			} else {

				e.oppositeLuminance = pLuminance;
				e.gradient = pGradient;

			}

			return e;

		}

		float DetermineEdgeBlendFactor( sampler2D  tex2D, vec2 texSize, LuminanceData l, EdgeData e, vec2 uv ) {

			vec2 uvEdge = uv;
			vec2 edgeStep;
			if (e.isHorizontal) {

				uvEdge.y += e.pixelStep * 0.5;
				edgeStep = vec2( texSize.x, 0.0 );

			} else {

				uvEdge.x += e.pixelStep * 0.5;
				edgeStep = vec2( 0.0, texSize.y );

			}

			float edgeLuminance = ( l.m + e.oppositeLuminance ) * 0.5;
			float gradientThreshold = e.gradient * 0.25;

			vec2 puv = uvEdge + edgeStep * edgeSteps[0];
			float pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
			bool pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !pAtEnd; i++ ) {

				puv += edgeStep * edgeSteps[i];
				pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
				pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			}

			if ( !pAtEnd ) {

				puv += edgeStep * EDGE_GUESS;

			}

			vec2 nuv = uvEdge - edgeStep * edgeSteps[0];
			float nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
			bool nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !nAtEnd; i++ ) {

				nuv -= edgeStep * edgeSteps[i];
				nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
				nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			}

			if ( !nAtEnd ) {

				nuv -= edgeStep * EDGE_GUESS;

			}

			float pDistance, nDistance;
			if ( e.isHorizontal ) {

				pDistance = puv.x - uv.x;
				nDistance = uv.x - nuv.x;

			} else {
				
				pDistance = puv.y - uv.y;
				nDistance = uv.y - nuv.y;

			}

			float shortestDistance;
			bool deltaSign;
			if ( pDistance <= nDistance ) {

				shortestDistance = pDistance;
				deltaSign = pLuminanceDelta >= 0.0;

			} else {

				shortestDistance = nDistance;
				deltaSign = nLuminanceDelta >= 0.0;

			}

			if ( deltaSign == ( l.m - edgeLuminance >= 0.0 ) ) {

				return 0.0;

			}

			return 0.5 - shortestDistance / ( pDistance + nDistance );

		}

		vec4 ApplyFXAA( sampler2D  tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData luminance = SampleLuminanceNeighborhood( tex2D, texSize, uv );
			if ( ShouldSkipPixel( luminance ) ) {

				return Sample( tex2D, uv );

			}

			float pixelBlend = DeterminePixelBlendFactor( luminance );
			EdgeData edge = DetermineEdge( texSize, luminance );
			float edgeBlend = DetermineEdgeBlendFactor( tex2D, texSize, luminance, edge, uv );
			float finalBlend = max( pixelBlend, edgeBlend );

			if (edge.isHorizontal) {

				uv.y += edge.pixelStep * finalBlend;

			} else {

				uv.x += edge.pixelStep * finalBlend;

			}

			return Sample( tex2D, uv );

		}

		void main() {

			gl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv );
			
		}`},Fe={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class ze extends D{constructor(){super();const e=Fe;this.uniforms=V.clone(e.uniforms),this.material=new re({name:e.name,uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new J(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,s,t){this.uniforms.tDiffuse.value=t.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},le.getTransfer(this._outputColorSpace)===ce&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===ue?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===fe?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===he?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===pe?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===de?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===me&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(s),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}const f=Y.hero.canvas,T=Math.PI*2,j=(1+Math.sqrt(5))/2,Ne=(r,e,s,t)=>2*s/Math.PI*Math.atan(Math.sin(T*r*t)/e);function Ge(r,e,s){const t=r*e,i=new Float32Array(t),a=new Float32Array(t),n=new Float32Array(t),o=T/(j*j);for(let l=0;l<t;l++){const u=l*o,h=s*Math.sqrt(l),d=Math.cos(u)*h,p=Math.sin(u)*h;i[l]=d,a[l]=p,n[l]=Math.sqrt(d*d+p*p)}return{posX:i,posY:a,dist:n,total:t}}function Oe(r,e,s,t){const i=r*e,a=new Float32Array(i),n=new Float32Array(i),o=new Float32Array(i);let l=0;for(let u=0;u<e;u++){const h=t+u*s;for(let d=0;d<r;d++){const p=d/r*T;a[l]=Math.cos(p)*h,n[l]=Math.sin(p)*h,o[l]=h,l++}}return{posX:a,posY:n,dist:o,total:i}}function Be(r,e,s){const t=e*s,i=s*Math.sqrt(3)/2,a=Math.ceil(t*2/i),n=[],o=[],l=[];for(let u=-a;u<=a;u++){const h=u*i,d=u%2*s*.5,p=Math.ceil(t*2/s);for(let m=-p;m<=p;m++){const c=m*s+d,x=c*c+h*h;x>t*t||(n.push(c),o.push(h),l.push(Math.sqrt(x)))}}return{posX:new Float32Array(n),posY:new Float32Array(o),dist:new Float32Array(l),total:n.length}}function Ie(r,e,s){const t=r*e,i=new Float32Array(t),a=new Float32Array(t),n=new Float32Array(t),o=Math.max(2,Math.round(r/20));for(let l=0;l<t;l++){const u=l/t*T*o,h=Math.cos(o*u)*e*s*.3,d=Math.abs(h),p=h>=0?1:-1,m=Math.cos(u)*d*p,c=Math.sin(u)*d*p;i[l]=m,a[l]=c,n[l]=Math.sqrt(m*m+c*c)}return{posX:i,posY:a,dist:n,total:t}}const q={spiral:Ge,concentric:Oe,hexagonal:Be,rose:Ie};function ke(r,e,s,t){const i=1-r;return i*i*e+2*i*r*s+r*r*t}function Ue(r,e,s,t,i,a,n){for(let o=0;o<e;o++){const l=i[o],u=n*f.waveSpeed-l/f.propagation,h=Ne(u,f.waveSharpness+.2*l/50,f.waveAmplitude,f.waveFrequency),d=h+f.baseScale,p=h*f.twistAmount,m=s[o]*d,c=t[o]*d,x=Math.cos(p),g=Math.sin(p),E=a[o],_=o*16;r[_]=E,r[_+5]=E,r[_+10]=E,r[_+12]=m*x-c*g,r[_+13]=m*g+c*x}}function He(){const r=q[f.arrangement]||q.concentric,{posX:e,posY:s,dist:t,total:i}=r(f.numRays,f.dotsPerRay,f.spacing,f.innerRadius);let a=0;for(let c=0;c<i;c++)t[c]>a&&(a=t[c]);a===0&&(a=1);const n=new Float32Array(i);for(let c=0;c<i;c++)n[c]=ke(t[c]/a,f.sizeStart,f.sizeMid,f.sizeEnd);const o=new Se,l=new xe(f.dotRadius,f.dotSegments),u=F.color.accent,h=f.accentOpacity??1,d=[{color:u[1],delay:1,opacity:h},{color:u[2],delay:2,opacity:h},{color:u[3],delay:3,opacity:h},{color:F.color.text.primary,delay:0,opacity:1}],p=[],m=[];for(const c of d){const x=new _e({color:c.color,depthWrite:!1,depthTest:!1,transparent:!0,opacity:c.opacity}),g=new Ee(l,x,i);o.add(g),p.push(g),m.push(c.delay)}return{scene:o,meshes:p,delays:m,posX:e,posY:s,dist:t,dotScales:n,total:i}}function Qe(){const r=b.useRef(null),[e,s]=b.useState(!0);return b.useEffect(()=>{try{const t=document.createElement("canvas");if(!(t.getContext("webgl2")||t.getContext("webgl"))){s(!1);return}}catch{s(!1);return}},[]),b.useEffect(()=>{const t=r.current;if(!t||!e)return;const i=window.matchMedia("(prefers-reduced-motion: reduce)").matches,a=Math.min(window.devicePixelRatio,f.maxDpr),n=new ge({antialias:!1,alpha:!1});n.sortObjects=!1,n.outputColorSpace=ve,n.setPixelRatio(a),n.setClearColor(new W(f.bgColor||F.color.bg.primary).convertSRGBToLinear(),1),t.appendChild(n.domElement),n.domElement.style.display="block";const o=new Q(-1,1,1,-1,.1,1e3);o.position.set(0,0,100),o.zoom=f.zoom;const{scene:l,meshes:u,delays:h,posX:d,posY:p,dist:m,dotScales:c,total:x}=He(),g=new Pe(n),E=new Re(l,o);E.clearAlpha=1,g.addPass(E);const _=new $(ye);g.addPass(_);const Z=new ze;g.addPass(Z);let C=!0,z=0,N=0;const G=new IntersectionObserver(([v])=>{const S=C;C=v.isIntersecting,!C&&S?(cancelAnimationFrame(M),z=performance.now()):C&&!S&&!i&&(N+=performance.now()-z,M=requestAnimationFrame(L))},{threshold:0});G.observe(t);function O(){const v=t.clientWidth,S=t.clientHeight;if(v===0||S===0)return;n.setSize(v,S);const A=v*a,P=S*a;g.setSize(v,S),_.uniforms.resolution.value.set(1/A,1/P),o.left=-v/2,o.right=v/2,o.top=S/2,o.bottom=-S/2,o.zoom=f.zoom,o.position.set(0,0,100),o.updateProjectionMatrix()}O();const B=new ResizeObserver(O);B.observe(t);let M=0;const K=performance.now(),ee=Y.hero.canvas.cmyStagger;function L(){i||(M=requestAnimationFrame(L));const v=(performance.now()-K-N)/1e3,S=f.wavePaused||i?0:v;u.forEach((A,P)=>{Ue(A.instanceMatrix.array,x,d,p,m,c,S-h[P]*ee),A.instanceMatrix.needsUpdate=!0}),g.render()}return L(),()=>{cancelAnimationFrame(M),G.disconnect(),B.disconnect(),g.dispose(),u.forEach(v=>v.material.dispose()),u[0].geometry.dispose(),n.dispose(),n.domElement.parentNode&&n.domElement.parentNode.removeChild(n.domElement)}},[e]),e?Ce.jsx("div",{ref:r,"aria-hidden":"true",style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",zIndex:"var(--z-base)"}}):null}export{Qe as default};
