(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))h(a);new MutationObserver(a=>{for(const u of a)if(u.type==="childList")for(const m of u.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&h(m)}).observe(document,{childList:!0,subtree:!0});function f(a){const u={};return a.integrity&&(u.integrity=a.integrity),a.referrerPolicy&&(u.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?u.credentials="include":a.crossOrigin==="anonymous"?u.credentials="omit":u.credentials="same-origin",u}function h(a){if(a.ep)return;a.ep=!0;const u=f(a);fetch(a.href,u)}})();var B={},_;function U(){return _||(_=1,function(i){Object.defineProperty(i,"__esModule",{value:!0}),i.countMap=i.Random=i.phi=i.radiansPerDegree=i.degreesPerRadian=i.FULL_CIRCLE=i.FIGURE_SPACE=i.NON_BREAKING_SPACE=i.MIN_DATE=i.MAX_DATE=i.csvStringToArray=void 0,i.assertClass=o,i.sleep=f,i.testXml=h,i.parseXml=a,i.followPath=u,i.getAttribute=m,i.parseFloatX=L,i.parseIntX=v,i.parseTimeT=c,i.pickAny=d,i.pick=n,i.take=g,i.filterMap=b,i.makePromise=y,i.dateIsValid=x,i.angleBetween=H,i.positiveModulo=C,i.rotateArray=X,i.rectUnion=k,i.rectAddPoint=G,i.dateToFileName=$,i.lerp=j,i.assertFinite=z,i.shuffleArray=q,i.zip=K,i.count=W,i.initializedArray=I,i.sum=V,i.makeLinear=Z,i.makeBoundedLinear=Y,i.polarToRectangular=J,i.permutations=F;function o(t,e,r="Assertion Failed."){const s=p=>{throw new Error(`${r}  Expected type:  ${e.name}.  Found type:  ${p}.`)};if(t===null)s("null");else if(typeof t!="object")s(typeof t);else if(!(t instanceof e))s(t.constructor.name);else return t;throw new Error("wtf")}function f(t){return new Promise(e=>{setTimeout(e,t)})}function h(t){const r=new DOMParser().parseFromString(t,"application/xml");for(const s of Array.from(r.querySelectorAll("parsererror")))if(s instanceof HTMLElement)return{error:s};return{parsed:r}}function a(t){if(t!==void 0)return h(t)?.parsed?.documentElement}function u(t,...e){for(const r of e){if(t===void 0)return;if(typeof r=="number")t=t.children[r];else{const s=t.getElementsByTagName(r);if(s.length!=1)return;t=s[0]}}return t}function m(t,e,...r){if(e=u(e,...r),e!==void 0&&e.hasAttribute(t))return e.getAttribute(t)??void 0}function L(t){if(t==null)return;const e=+t;if(isFinite(e))return e}function v(t){const e=L(t);if(e!==void 0)return e>Number.MAX_SAFE_INTEGER||e<Number.MIN_SAFE_INTEGER||e!=Math.floor(e)?void 0:e}function c(t){if(typeof t=="string"&&(t=v(t)),t!=null&&!(t<=0))return new Date(t*1e3)}const l=t=>{const e=/(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^,\r\n]*))/gi,r=[[]];let s;for(;s=e.exec(t);)s[1].length&&s[1]!==","&&r.push([]),r[r.length-1].push(s[2]!==void 0?s[2].replace(/""/g,'"'):s[3]);return r};i.csvStringToArray=l;function d(t){const e=t.values().next();if(!e.done)return e.value}function n(t){if(t.length==0)throw new Error("wtf");return t[Math.random()*t.length|0]}function g(t){if(t.length<1)throw new Error("wtf");const e=Math.random()*t.length|0;return t.splice(e,1)[0]}function b(t,e){const r=[];return t.forEach((s,p)=>{const E=e(s,p);E!==void 0&&r.push(E)}),r}function y(){let t,e;return{promise:new Promise((s,p)=>{t=s,e=p}),resolve:t,reject:e}}i.MAX_DATE=new Date(864e13),i.MIN_DATE=new Date(-864e13);function x(t){return isFinite(t.getTime())}i.NON_BREAKING_SPACE=" ",i.FIGURE_SPACE=" ",i.FULL_CIRCLE=2*Math.PI,i.degreesPerRadian=360/i.FULL_CIRCLE,i.radiansPerDegree=i.FULL_CIRCLE/360,i.phi=(1+Math.sqrt(5))/2;function H(t,e){const r=C(t,i.FULL_CIRCLE);let p=C(e,i.FULL_CIRCLE)-r;const E=i.FULL_CIRCLE/2;if(p>E?p-=i.FULL_CIRCLE:p<-E&&(p+=i.FULL_CIRCLE),Math.abs(p)>E)throw new Error("wtf");return p}function C(t,e){const r=t%e;return r<0?r+Math.abs(e):r}function X(t,e){if((e|0)!=e)throw new Error(`invalid input: ${e}`);return e=C(e,t.length),e==0?t:[...t.slice(e),...t.slice(0,e)]}class D{static sfc32(e,r,s,p){return function(){e|=0,r|=0,s|=0,p|=0;let E=(e+r|0)+p|0;return p=p+1|0,e=r^r>>>9,r=s+(s<<3)|0,s=s<<21|s>>>11,s=s+E|0,(E>>>0)/4294967296}}static#n=42;static create(e=this.newSeed()){console.info(e);const r=JSON.parse(e);if(!(r instanceof Array))throw new Error("invalid seed");if(r.length!=4)throw new Error("invalid seed");const[s,p,E,S]=r;if(!(typeof s=="number"&&typeof p=="number"&&typeof E=="number"&&typeof S=="number"))throw new Error("invalid seed");return this.sfc32(s,p,E,S)}static newSeed(){const e=[];return e.push(Date.now()),e.push(this.#n++),e.push(Math.random()*2**31|0),e.push(Math.random()*2**31|0),JSON.stringify(e)}}i.Random=D;function k(t,e){const r=Math.min(t.x,e.x),s=Math.min(t.y,e.y),p=Math.max(t.x+t.width,e.x+e.width),E=Math.max(t.y+t.height,e.y+e.height),S=p-r,Q=E-s;return{x:r,y:s,width:S,height:Q}}function G(t,e,r){return k(t,{x:e,y:r,width:0,height:0})}function $(t){return isNaN(t.getTime())?"0000⸱00⸱00 00⦂00⦂00":`${t.getFullYear().toString().padStart(4,"0")}⸱${(t.getMonth()+1).toString().padStart(2,"0")}⸱${t.getDate().toString().padStart(2,"0")} ${t.getHours().toString().padStart(2,"0")}⦂${t.getMinutes().toString().padStart(2,"0")}⦂${t.getSeconds().toString().padStart(2,"0")}`}function j(t,e,r){return t+(e-t)*r}function z(...t){t.forEach(e=>{if(!isFinite(e))throw new Error("wtf")})}function q(t){for(let e=t.length-1;e>0;e--){const r=Math.floor(Math.random()*(e+1));[t[e],t[r]]=[t[r],t[e]]}return t}function*K(...t){const e=t.map(r=>r[Symbol.iterator]());for(;;){const r=e.map(s=>s.next());if(r.some(({done:s})=>s))break;yield r.map(({value:s})=>s)}}function*W(t=0,e=1/0,r=1){for(let s=t;s<e;s+=r)yield s}function I(t,e){const r=[];for(let s=0;s<t;s++)r.push(e(s));return r}i.countMap=I;function V(t){return t.reduce((e,r)=>e+r,0)}function Z(t,e,r,s){const p=(s-e)/(r-t);return function(E){return(E-t)*p+e}}function Y(t,e,r,s){r<t&&([t,e,r,s]=[r,s,t,e]);const p=(s-e)/(r-t);return function(E){return E<=t?e:E>=r?s:(E-t)*p+e}}function J(t,e){return{x:Math.cos(e)*t,y:Math.sin(e)*t}}function*F(t,e=[]){if(t.length==0)yield e;else for(let r=0;r<t.length;r++){const s=t[r],p=[...e,s],E=[...t.slice(0,r),...t.slice(r+1)];yield*F(E,p)}}}(B)),B}var w=U(),N={},P;function tt(){if(P)return N;P=1,Object.defineProperty(N,"__esModule",{value:!0}),N.AnimationLoop=void 0,N.getById=o,N.loadDateTimeLocal=f,N.getBlobFromCanvas=h,N.getAudioBalanceControl=a,N.getHashInfo=u,N.createElementFromHTML=m,N.download=L;const i=U();function o(c,l){const d=document.getElementById(c);if(!d)throw new Error("Could not find element with id "+c+".  Expected type:  "+l.name);if(d instanceof l)return d;throw new Error("Element with id "+c+" has type "+d.constructor.name+".  Expected type:  "+l.name)}function f(c,l,d="milliseconds"){let n;switch(d){case"minutes":{n=l.getSeconds()*1e3+l.getMilliseconds();break}case"seconds":{n=l.getMilliseconds();break}case"milliseconds":{n=0;break}default:throw new Error("wtf")}c.valueAsNumber=+l-l.getTimezoneOffset()*6e4-n}function h(c){const{reject:l,resolve:d,promise:n}=(0,i.makePromise)();return c.toBlob(g=>{g?d(g):l(new Error("blob is null!"))}),n}function a(c){const l=new AudioContext,d=l.createMediaElementSource(c),n=new StereoPannerNode(l,{pan:0});return d.connect(n).connect(l.destination),g=>{n.pan.value=g}}function u(){const c=new Map;return/^#?(.*)$/.exec(location.hash.replace("+","%20"))[1].split("&").forEach(n=>{const g=n.split("=",2);if(g.length==2){const b=decodeURIComponent(g[0]),y=decodeURIComponent(g[1]);c.set(b,y)}}),c}function m(c,l){var d=document.createElement("div");return d.innerHTML=c.trim(),(0,i.assertClass)(d.firstChild,l,"createElementFromHTML:")}function L(c,l){var d=document.createElement("a");if(d.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(l)),d.setAttribute("download",c),document.createEvent){var n=document.createEvent("MouseEvents");n.initEvent("click",!0,!0),d.dispatchEvent(n)}else d.click()}class v{onWake;constructor(l){this.onWake=l,this.callback=this.callback.bind(this),requestAnimationFrame(this.callback)}#n=!1;cancel(){this.#n=!0}callback(l){this.#n||(requestAnimationFrame(this.callback),this.onWake(l))}}return N.AnimationLoop=v,N}var et=tt();function M(i,o){const f=i.childNodes.length;i.insertAdjacentHTML("beforeend",o);const h=i.childNodes,a=new Array,u=i.childNodes.length;for(let m=f;m<u;m++)a.push(h[m]);return a}function R(i,o,f){const h=M(i,o);if(h.length!=1)throw new Error("wtf");return w.assertClass(h[0],f)}function O(i,o,f,h){const a=M(i,o);if(a.length!=2)throw new Error("wtf");return[w.assertClass(a[0],f),w.assertClass(a[1],h)]}class T{static#n=new DataView(new ArrayBuffer(Float64Array.BYTES_PER_ELEMENT));static toBinary(o){const h="",u=T.#n;return u.setFloat64(0,o,!1),w.initializedArray(Float64Array.BYTES_PER_ELEMENT,L=>u.getUint8(L).toString(2).padStart(8,"0")).join(h)}static fromBinary(o){if(o.length!=64)return;for(const u of o)if(u!="0"&&u!="1")return;const f=T.#n;for(let u=0;u<8;u++){const m=o.substring(u*8,(u+1)*8),L=parseInt(m,2);f.setUint8(u,L)}return f.getFloat64(0,!1)}static toFloat(o){return this.#n.setFloat32(0,o),this.#n.getFloat32(0)}#a;#l;#i=document.createElement("div");#c(o){const f=document.createElement("span"),h=()=>{const a=[...this.bits],m=a[o]=="0"?"1":"0";a[o]=m,this.bits=a.join("")};return f.addEventListener("pointerdown",h),f.addEventListener("keypress",a=>{(a.key==" "||a.key=="Enter")&&(h(),a.stopPropagation())}),f.style.cursor="pointer",f.dataset.digit=o.toString(),f.tabIndex=0,f}#d=w.initializedArray(64,o=>this.#c(o));#u=document.createElement("span");#h=document.createElement("span");#t=document.createElement("div");#p=w.initializedArray(52,o=>this.#c(o+12));#s=document.createElement("span");#r=[this.#s,...this.#p];#m=this.#c(0);#e=document.createElement("span");#o=document.createElement("input");get inputElement(){return this.#o}get exponentBits(){return this.bits.substring(1,12)}set exponentBits(o){if(!/^[01]{11}$/.test(o))throw new Error("wtf");const f=[...this.bits].toSpliced(1,o.length,...o).join("");if(this.bits=f,this.exponentBits!=o)throw new Error("wtf")}static EXPONENT_COUNT=2048;get exponent(){const o=parseInt(this.exponentBits,2);if(!(Number.isSafeInteger(o)&&o>=0&&o<T.EXPONENT_COUNT))throw new Error("wtf");return o}set exponent(o){if(!Number.isSafeInteger(o))throw new Error("wtf");o=w.positiveModulo(o,T.EXPONENT_COUNT),this.exponentBits=o.toString(2).padStart(11,"0")}get inputValue(){return w.parseFloatX(this.#o.value)??NaN}constructor(o=0){this.#a=o,this.#l=T.toBinary(o),this.#e.classList.add("exponent"),this.#e.dataset.digit="x",this.#e.innerText=".";const f=n=>{const{left:g,width:b}=this.#e.getBoundingClientRect();return n.clientX<g+b/2},h=n=>{this.#e.style.cursor=f(n)?"w-resize":"e-resize"};this.#e.addEventListener("mouseenter",h),this.#e.addEventListener("mouseleave",h),this.#e.addEventListener("mousemove",h),this.#e.addEventListener("click",n=>{f(n)?this.exponent--:this.exponent++}),this.#t.style.wordBreak="break-all",this.#s.classList.add("exponent"),this.#s.dataset.digit="x";const a=document.createElement("div");a.style.wordBreak="break-all",a.append(...this.#d);const u=document.createElement("div");u.append("Value:"+w.NON_BREAKING_SPACE+w.NON_BREAKING_SPACE,this.#u);const m=document.createElement("div");m.classList.add("exponent"),m.style.display="flex",m.append("Exponent:"+w.NON_BREAKING_SPACE+w.NON_BREAKING_SPACE,this.#h);const[,L]=O(m,w.NON_BREAKING_SPACE+"<button>+1</button>",Text,HTMLButtonElement),[,v]=O(m,w.NON_BREAKING_SPACE+"<button>-1</button>",Text,HTMLButtonElement);L.addEventListener("click",()=>this.exponent++),v.addEventListener("click",()=>this.exponent--);const c=document.createElement("div");{let n=document.createElement("button");n.innerText="=",n.addEventListener("click",()=>{this.value=this.inputValue}),c.append(n," "),n=document.createElement("button"),n.innerText="+=",n.addEventListener("click",()=>{this.value+=this.inputValue}),c.append(n," "),n=document.createElement("button"),n.innerText="-=",n.addEventListener("click",()=>{this.value-=this.inputValue}),c.append(n," "),n=document.createElement("button"),n.innerText="*=",n.addEventListener("click",()=>{this.value*=this.inputValue}),c.append(n," "),n=document.createElement("button"),n.innerText="/=",n.addEventListener("click",()=>{this.value/=this.inputValue}),c.append(n," "),n=document.createElement("button"),n.innerText="%=",n.addEventListener("click",()=>{this.value%=this.inputValue}),c.append(n," "),n=document.createElement("button"),n.innerText="^=",n.addEventListener("click",()=>{this.value^=this.inputValue}),c.append(n," "),n=document.createElement("button"),n.innerText="&=",n.addEventListener("click",()=>{this.value&=this.inputValue}),c.append(n," "),n=document.createElement("button"),n.innerText="|=",n.addEventListener("click",()=>{this.value|=this.inputValue}),c.append(n," ")}c.appendChild(this.#o),this.#o.value="2";const l=document.createElement("div");{let n=document.createElement("button");n.innerText="NaN",n.addEventListener("click",()=>this.value=NaN),l.append("= ",n),n=document.createElement("button"),n.innerText="-Infinity",n.addEventListener("click",()=>this.value=-1/0),l.append(" ",n),n=document.createElement("button"),n.innerText="Min Safe Integer",n.addEventListener("click",()=>this.value=Number.MIN_SAFE_INTEGER),l.append(" ",n),n=document.createElement("button"),n.innerText="Min Value",n.addEventListener("click",()=>this.value=Number.MIN_VALUE),l.append(" ",n),n=document.createElement("button"),n.innerText="Epsilon",n.addEventListener("click",()=>this.value=Number.EPSILON),l.append(" ",n),n=document.createElement("button"),n.innerText="Max Safe Integer",n.addEventListener("click",()=>this.value=Number.MAX_SAFE_INTEGER),l.append(" ",n),n=document.createElement("button"),n.innerText="Max Value",n.addEventListener("click",()=>this.value=Number.MAX_VALUE),l.append(" ",n),n=document.createElement("button"),n.innerText="Infinity",n.addEventListener("click",()=>this.value=1/0),l.append(" ",n)}const d=document.createElement("div");d.style.display="flex",d.style.gap="0.25em",d.style.padding="0.25em 0",R(d,"<button>1/x</button>",HTMLButtonElement).addEventListener("click",()=>this.value=1/this.value),R(d,"<button>32 Bits</button>",HTMLButtonElement).addEventListener("click",()=>{this.value=T.toFloat(this.value)}),this.#i.appendChild(u),this.#i.appendChild(a),this.#i.appendChild(m),this.#i.appendChild(this.#t),this.#i.appendChild(c),this.#i.appendChild(l),this.#i.appendChild(d),this.#i.classList.add("top"),this.#f()}#f(){for(const[a,u]of w.zip(this.bits,this.#d))u.innerText=a;function o(a){return a.toString()}if(this.#u.innerText=o(this.value),this.exponentBits.length!=11)throw new Error("wtf");const h=this.exponent;this.#h.innerText=h.toLocaleString();{const a=this.bits.substring(12);if(a.length!=52)throw new Error("wtf");this.#t.innerText="";const u=1023,m=1075;if(h==T.EXPONENT_COUNT-1)this.#t.innerText="Infinity or NaN";else if(this.#t.appendChild(this.#m).innerText=this.bits[0]=="0"?"+":"-",h==0){const L="0"+a;this.#s.innerText="0",M(this.#t,'<span data-digit="x">0</span>'),this.#t.appendChild(this.#e),M(this.#t,'<span data-digit="x">0…0</span>'),this.#r.forEach((v,c)=>{const l=L[c];this.#t.appendChild(v).innerText=l,v.style.fontWeight=""})}else{const L="1"+a;if(this.#s.innerText="1",h>m){const v=h-m;this.#r.forEach((l,d)=>{const n=L[d];this.#t.appendChild(l).innerText=n,l.style.fontWeight=""});const c=v>3?"0…0":"0".repeat(v);M(this.#t,`<span data-digit="x">${c}</span>`),this.#t.appendChild(this.#e)}else if(h>=u){const v=h-u;let c=NaN;this.#r.forEach((l,d)=>{const n=L[d];this.#t.appendChild(l).innerText=n,n=="1"&&(c=d),d==v&&(this.#t.appendChild(this.#e),c=d)}),w.assertFinite(c),this.#r.forEach((l,d)=>{const g=d>c?"100":"";l.style.fontWeight=g})}else{const v=u-h;M(this.#t,'<span data-digit="x">0</span>'),this.#t.appendChild(this.#e);const c=v>3?"0…0":"0".repeat(v-1);M(this.#t,`<span data-digit="x">${c}</span>`);let l=NaN;this.#r.forEach((d,n)=>{const g=L[n];this.#t.appendChild(d).innerText=g,g=="1"&&(l=n),d.style.fontWeight=""}),w.assertFinite(l),this.#r.forEach((d,n)=>{const b=n>l?"100":"";d.style.fontWeight=b})}}}}get value(){return this.#a}set value(o){this.#a=o,this.#l=T.toBinary(o),this.#f()}get bits(){return this.#l}set bits(o){const f=T.fromBinary(o);if(f===void 0)throw new Error("invalid");this.value=f,o!=this.bits&&console.info(o,this.bits)}get top(){return this.#i}}window.DoubleViewer=T;const A=new T(3.5);et.getById("main",HTMLHeadingElement).insertAdjacentElement("afterend",A.top);const nt=new Set("+-.1234567890");window.addEventListener("keypress",i=>{nt.has(i.key)&&document.activeElement!=A.inputElement&&(A.inputElement.focus(),A.inputElement.select())});A.inputElement.addEventListener("keypress",i=>{i.key=="Enter"&&(A.value=A.inputValue)});
