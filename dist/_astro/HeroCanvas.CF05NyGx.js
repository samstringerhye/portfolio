import{r as T}from"./index.DiEladB3.js";import{M as se,O as V,B as ie,F as k,S as U,U as W,V as F,W as ae,H as ne,N as oe,C as re,a as Y,R as le,b as ce,c as ue,L as fe,d as he,e as pe,A as de,f as me,g as ge,h as ve,i as xe,j as Se,k as _e,l as we,I as Ee}from"./three.module.BXrdTxcK.js";import{a as J,s as z}from"./tokens.C1a5fR-W.js";var y={exports:{}},D={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var H;function De(){if(H)return D;H=1;var l=Symbol.for("react.transitional.element"),e=Symbol.for("react.fragment");function t(s,i,a){var r=null;if(a!==void 0&&(r=""+a),i.key!==void 0&&(r=""+i.key),"key"in i){a={};for(var n in i)n!=="key"&&(a[n]=i[n])}else a=i;return i=a.ref,{$$typeof:l,type:s,key:r,ref:i!==void 0?i:null,props:a}}return D.Fragment=e,D.jsx=t,D.jsxs=t,D}var X;function Ce(){return X||(X=1,y.exports=De()),y.exports}var Me=Ce();const Ae={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class C{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const be=new V(-1,1,1,-1,0,1);class Te extends ie{constructor(){super(),this.setAttribute("position",new k([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new k([0,2,0,0,2,0],2))}}const Le=new Te;class ${constructor(e){this._mesh=new se(Le,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,be)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Z extends C{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof U?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=W.clone(e.uniforms),this.material=new U({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new $(this.material)}render(e,t,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class j extends C{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,s){const i=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let r,n;this.inverse?(r=0,n=1):(r=1,n=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),a.buffers.stencil.setFunc(i.ALWAYS,r,4294967295),a.buffers.stencil.setClear(n),a.buffers.stencil.setLocked(!0),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(i.EQUAL,1,4294967295),a.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),a.buffers.stencil.setLocked(!0)}}class Re extends C{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class Pe{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const s=e.getSize(new F);this._width=s.width,this._height=s.height,t=new ae(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:ne}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Z(Ae),this.copyPass.material.blending=oe,this.clock=new re}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let s=!1;for(let i=0,a=this.passes.length;i<a;i++){const r=this.passes[i];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,s),r.needsSwap){if(s){const n=this.renderer.getContext(),o=this.renderer.state.buffers.stencil;o.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),o.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}j!==void 0&&(r instanceof j?s=!0:r instanceof Re&&(s=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new F);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const s=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(s,i),this.renderTarget2.setSize(s,i);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(s,i)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class ye extends C{constructor(e,t,s=null,i=null,a=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=s,this.clearColor=i,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new Y}render(e,t,s){const i=e.autoClear;e.autoClear=!1;let a,r;this.overrideMaterial!==null&&(r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(a=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=r),e.autoClear=i}}const Fe={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new F(1/1024,1/512)}},vertexShader:`

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
			
		}`},ze={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};class Ne extends C{constructor(){super();const e=ze;this.uniforms=W.clone(e.uniforms),this.material=new le({name:e.name,uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new $(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,s){this.uniforms.tDiffuse.value=s.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},ce.getTransfer(this._outputColorSpace)===ue&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===fe?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===he?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===pe?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===de?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===me?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===ge&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}const c=J.hero.canvas,L=Math.PI*2,q=(1+Math.sqrt(5))/2,Ge=(l,e,t,s)=>2*t/Math.PI*Math.atan(Math.sin(L*l*s)/e);function Oe(l,e,t){const s=l*e,i=new Float32Array(s),a=new Float32Array(s),r=new Float32Array(s),n=L/(q*q);for(let o=0;o<s;o++){const h=o*n,f=t*Math.sqrt(o),d=Math.cos(h)*f,p=Math.sin(h)*f;i[o]=d,a[o]=p,r[o]=Math.sqrt(d*d+p*p)}return{posX:i,posY:a,dist:r,total:s}}function Be(l,e,t,s){const i=l*e,a=new Float32Array(i),r=new Float32Array(i),n=new Float32Array(i);let o=0;for(let h=0;h<e;h++){const f=s+h*t;for(let d=0;d<l;d++){const p=d/l*L;a[o]=Math.cos(p)*f,r[o]=Math.sin(p)*f,n[o]=f,o++}}return{posX:a,posY:r,dist:n,total:i}}function Ie(l,e,t){const s=e*t,i=t*Math.sqrt(3)/2,a=Math.ceil(s*2/i),r=[],n=[],o=[];for(let h=-a;h<=a;h++){const f=h*i,d=h%2*t*.5,p=Math.ceil(s*2/t);for(let m=-p;m<=p;m++){const g=m*t+d,S=g*g+f*f;S>s*s||(r.push(g),n.push(f),o.push(Math.sqrt(S)))}}return{posX:new Float32Array(r),posY:new Float32Array(n),dist:new Float32Array(o),total:r.length}}function ke(l,e,t){const s=l*e,i=new Float32Array(s),a=new Float32Array(s),r=new Float32Array(s),n=Math.max(2,Math.round(l/20));for(let o=0;o<s;o++){const h=o/s*L*n,f=Math.cos(n*h)*e*t*.3,d=Math.abs(f),p=f>=0?1:-1,m=Math.cos(h)*d*p,g=Math.sin(h)*d*p;i[o]=m,a[o]=g,r[o]=Math.sqrt(m*m+g*g)}return{posX:i,posY:a,dist:r,total:s}}const Q={spiral:Oe,concentric:Be,hexagonal:Ie,rose:ke};function Ue(l,e,t,s){const i=1-l;return i*i*e+2*i*l*t+l*l*s}function He(l,e,t,s,i,a,r){for(let n=0;n<e;n++){const o=i[n],h=r*c.waveSpeed-o/c.propagation,f=Ge(h,c.waveSharpness+.2*o/50,c.waveAmplitude,c.waveFrequency),d=f+c.baseScale,p=f*c.twistAmount,m=t[n]*d,g=s[n]*d,S=Math.cos(p),w=Math.sin(p),u=a[n],_=n*16;l[_]=u,l[_+5]=u,l[_+10]=u,l[_+12]=m*S-g*w,l[_+13]=m*w+g*S}}function Xe(l=!1){const e=Q[c.arrangement]||Q.concentric,t=l?Math.round(c.numRays*.5):c.numRays,s=l?Math.round(c.dotsPerRay*.5):c.dotsPerRay,{posX:i,posY:a,dist:r,total:n}=e(t,s,c.spacing,c.innerRadius);let o=0;for(let u=0;u<n;u++)r[u]>o&&(o=r[u]);o===0&&(o=1);const h=new Float32Array(n);for(let u=0;u<n;u++)h[u]=Ue(r[u]/o,c.sizeStart,c.sizeMid,c.sizeEnd);const f=new Se,d=new _e(c.dotRadius,c.dotSegments),p=z.color.accent,m=c.accentOpacity??1,g=[{color:p[1],delay:1,opacity:m},{color:p[2],delay:2,opacity:m},{color:p[3],delay:3,opacity:m},{color:z.color.text.primary,delay:0,opacity:1}],S=[],w=[];for(const u of g){const _=new we({color:u.color,depthWrite:!1,depthTest:!1,transparent:!0,opacity:u.opacity}),E=new Ee(d,_,n);f.add(E),S.push(E),w.push(u.delay)}return{scene:f,meshes:S,delays:w,posX:i,posY:a,dist:r,dotScales:h,total:n}}function Ve(){const l=T.useRef(null),[e,t]=T.useState(!0);return T.useEffect(()=>{try{const s=document.createElement("canvas");if(!(s.getContext("webgl2")||s.getContext("webgl"))){t(!1);return}}catch{t(!1);return}},[]),T.useEffect(()=>{const s=l.current;if(!s||!e)return;const i=window.matchMedia("(prefers-reduced-motion: reduce)").matches,a=window.matchMedia("(max-width: 768px)").matches,r=Math.min(window.devicePixelRatio,a?1.5:c.maxDpr),n=new ve({antialias:!1,alpha:!1});n.sortObjects=!1,n.outputColorSpace=xe,n.setPixelRatio(r),n.setClearColor(new Y(c.bgColor||z.color.bg.primary).convertSRGBToLinear(),1),s.appendChild(n.domElement),n.domElement.style.display="block";const o=new V(-1,1,1,-1,.1,1e3);o.position.set(0,0,100),o.zoom=c.zoom;const{scene:h,meshes:f,delays:d,posX:p,posY:m,dist:g,dotScales:S,total:w}=Xe(a),u=new Pe(n),_=new ye(h,o);_.clearAlpha=1,u.addPass(_);const E=new Z(Fe);u.addPass(E);const K=new Ne;u.addPass(K);let M=!0,N=0,G=0;const O=new IntersectionObserver(([v])=>{const x=M;M=v.isIntersecting,!M&&x?(cancelAnimationFrame(A),N=performance.now()):M&&!x&&!i&&(G+=performance.now()-N,A=requestAnimationFrame(R))},{threshold:0});O.observe(s);function B(){const v=s.clientWidth,x=s.clientHeight;if(v===0||x===0)return;n.setSize(v,x);const b=v*r,P=x*r;u.setSize(v,x),E.uniforms.resolution.value.set(1/b,1/P),o.left=-v/2,o.right=v/2,o.top=x/2,o.bottom=-x/2,o.zoom=c.zoom,o.position.set(0,0,100),o.updateProjectionMatrix()}B();const I=new ResizeObserver(B);I.observe(s);let A=0;const ee=performance.now(),te=J.hero.canvas.cmyStagger;function R(){i||(A=requestAnimationFrame(R));const v=(performance.now()-ee-G)/1e3,x=c.wavePaused||i?0:v;f.forEach((b,P)=>{He(b.instanceMatrix.array,w,p,m,g,S,x-d[P]*te),b.instanceMatrix.needsUpdate=!0}),u.render()}return R(),()=>{cancelAnimationFrame(A),O.disconnect(),I.disconnect(),u.dispose(),f.forEach(v=>v.material.dispose()),f[0].geometry.dispose(),n.dispose(),n.domElement.parentNode&&n.domElement.parentNode.removeChild(n.domElement)}},[e]),e?Me.jsx("div",{ref:l,"aria-hidden":"true",style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",zIndex:"var(--z-base)"}}):null}export{Ve as default};
