import{b as L,d as T,c as W,a as j}from"./disclose-version.VjivRe6y.js";import"./legacy.J5ub6O2J.js";import{g as D,h as $,b as E,k as I,v as U,V as q,aB as F,aA as K,n as M,N as V,M as J,p as Q,f as X,a as Z}from"./runtime.ChD48HxL.js";import{i as ee}from"./lifecycle.Ci8djLyD.js";import{p as re}from"./props.KtYOXTs9.js";function te(c,l,o,d,R){var h=c,f="",g;D(()=>{if(f===(f=l()??"")){$&&E();return}g!==void 0&&(J(g),g=void 0),f!==""&&(g=I(()=>{if($){U.data;for(var b=E(),C=b;b!==null&&(b.nodeType!==8||b.data!=="");)C=b,b=q(b);if(b===null)throw F(),K;L(U,C),h=M(b);return}var y=f+"",k=T(y);L(V(k),k.lastChild),h.before(k)}))})}const S=_(0,0,255),A=_(255,153,51),N=_(0,220,0),z=_(255,0,0),P=_(255,255,255),B=_(255,255,0),x="#555555",p=50,v=p/2,G=10,u={COLOUR_GREY:x,COLOUR_BLUE:S,COLOUR_GREEN:N,COLOUR_ORANGE:A,COLOUR_RED:z,COLOUR_WHITE:P,COLOUR_YELLOW:B},ne={a:x,b:x,c:x},e="u",r="l",t="f",n="r",s="b",i="d";function _(c,l,o){return`#${c.toString(16).padStart(2,"0")}${l.toString(16).padStart(2,"0")}${o.toString(16).padStart(2,"0")}`}function m(c){switch(c==null?void 0:c.toLowerCase()){case e:return P;case r:return A;case t:return N;case n:return z;case s:return S;case i:return B;default:return x}}function se([c,...l]){const o=[c||"?","?","?"];if(!c||l.length!==2)return o;const d=l.sort().join("").toLowerCase();switch(c.toLowerCase()){case e:switch(d){case"fl":return[e,r,t];case"fr":return[e,t,n];case"br":return[e,n,s];case"bl":return[e,s,r];default:return o}case r:switch(d){case"fu":return[r,t,e];case"df":return[r,i,t];case"bd":return[r,s,i];case"bu":return[r,e,s];default:return o}case t:switch(d){case"lu":return[t,e,r];case"ru":return[t,n,e];case"dr":return[t,i,n];case"dl":return[t,r,i];default:return o}case n:switch(d){case"fu":return[n,e,t];case"bu":return[n,s,e];case"bd":return[n,i,s];case"df":return[n,t,i];default:return o}case s:switch(d){case"ru":return[s,e,n];case"lu":return[s,r,e];case"dl":return[s,i,r];case"dr":return[s,n,i];default:return o}case i:switch(d){case"fl":return[i,t,r];case"fr":return[i,n,t];case"br":return[i,s,n];case"bl":return[i,r,s];default:return o}default:return o}}function a(c){const[l,o,d]=se(c);return{a:m(l),b:m(o),c:m(d)}}function Y(c){switch(c==null?void 0:c.toLowerCase()){case"a":return a([e,s,r]);case"b":return a([e,s,n]);case"c":return a([e,t,n]);case"d":return a([e,r,t]);case"e":return a([r,e,s]);case"f":return a([r,t,e]);case"g":return a([r,i,t]);case"h":return a([r,i,s]);case"i":return a([t,e,r]);case"j":return a([t,n,e]);case"k":return a([t,i,n]);case"l":return a([t,r,i]);case"m":return a([n,e,t]);case"n":return a([n,s,e]);case"o":return a([n,i,s]);case"p":return a([n,t,i]);case"q":return a([s,e,n]);case"r":return a([s,r,e]);case"s":return a([s,i,r]);case"t":return a([s,n,i]);case"u":return a([i,t,r]);case"v":return a([i,n,t]);case"w":return a([i,s,n]);case"x":return a([i,r,s]);default:return{...ne}}}function ie({pieceAsticker1:c,pieceAsticker2:l,pieceAsticker3:o,pieceBsticker1:d,pieceBsticker2:R,pieceBsticker3:h}){return`
	<div>
		<div style="line-height: 0">
			<div style="margin: 0;padding: 0;">
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${l};
				width:${v}px;
				height:${p}px;"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${c};
				width:${p}px;
				height:${p}px;
				"></div>
				<div style="display: inline-block; width:${G}px"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${d};
				width:${p}px;
				height:${p}px;
				"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${h};
				width:${v}px;
				height:${p}px;"></div>
			</div>
			<div style="">
				<div style="display: inline-block;width:${v}px;"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${o};
				width:${p}px;
				height:${v}px;"></div>
				<div style="display: inline-block; width:${G}px"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${R};
				width:${p}px;
				height:${v}px;"></div>
				<div style="display:inline-block;width:${v}px;"></div>
			</div>
	</div>
	`.replaceAll(/[\t\n]/g,"").replaceAll(/: +/g,":")}function ue(c,l){Q(l,!1);let o=u.COLOUR_GREY,d=u.COLOUR_GREY,R=u.COLOUR_GREY,h=u.COLOUR_GREY,f=u.COLOUR_GREY,g=u.COLOUR_GREY,b=re(l,"letterPair",8,"");function C(H){const w=H.split("");if(o=u.COLOUR_GREY,d=u.COLOUR_GREY,R=u.COLOUR_GREY,h=u.COLOUR_GREY,f=u.COLOUR_GREY,g=u.COLOUR_GREY,w.length>=1){const O=Y(w[0]);o=O.a,d=O.b,R=O.c}if(w.length>=2){const O=Y(w[1]);h=O.a,f=O.b,g=O.c}return ie({pieceAsticker1:o,pieceAsticker2:d,pieceAsticker3:R,pieceBsticker1:h,pieceBsticker2:f,pieceBsticker3:g})}ee();var y=W(),k=X(y);te(k,()=>C(b())),j(c,y),Z()}export{ue as C,u as a,Y as g,ie as m};
