import{b as L,d as T,c as j,a as W}from"./disclose-version.B8QbxXjI.js";import"./legacy.CrZcupGR.js";import{d as D,h as $,a as E,m as I,J as K,n as U,R as q,aB as F,aA as J,j as M,K as Q,a7 as V,f as X,a9 as Z}from"./runtime.DZJACTxD.js";import{i as ee}from"./lifecycle.BzJg6XKv.js";import{p as re}from"./props.BcXfgcJ5.js";function te(c,l,o,d,R){var h=c,f="",g;D(()=>{if(f===(f=l()??"")){$&&E();return}g!==void 0&&(K(g),g=void 0),f!==""&&(g=I(()=>{if($){U.data;for(var b=E(),k=b;b!==null&&(b.nodeType!==8||b.data!=="");)k=b,b=q(b);if(b===null)throw F(),J;L(U,k),h=M(b);return}var y=f+"",x=T(y);L(Q(x),x.lastChild),h.before(x)}))})}const S=_(0,0,255),A=_(255,153,51),z=_(0,220,0),N=_(255,0,0),P=_(255,255,255),B=_(255,255,0),C="#555555",p=50,v=p/2,G=10,u={COLOUR_GREY:C,COLOUR_BLUE:S,COLOUR_GREEN:z,COLOUR_ORANGE:A,COLOUR_RED:N,COLOUR_WHITE:P,COLOUR_YELLOW:B},ne={a:C,b:C,c:C},e="u",r="l",t="f",n="r",s="b",i="d";function _(c,l,o){return`#${c.toString(16).padStart(2,"0")}${l.toString(16).padStart(2,"0")}${o.toString(16).padStart(2,"0")}`}function w(c){switch(c==null?void 0:c.toLowerCase()){case e:return P;case r:return A;case t:return z;case n:return N;case s:return S;case i:return B;default:return C}}function se([c,...l]){const o=[c||"?","?","?"];if(!c||l.length!==2)return o;const d=l.sort().join("").toLowerCase();switch(c.toLowerCase()){case e:switch(d){case"fl":return[e,r,t];case"fr":return[e,t,n];case"br":return[e,n,s];case"bl":return[e,s,r];default:return o}case r:switch(d){case"fu":return[r,t,e];case"df":return[r,i,t];case"bd":return[r,s,i];case"bu":return[r,e,s];default:return o}case t:switch(d){case"lu":return[t,e,r];case"ru":return[t,n,e];case"dr":return[t,i,n];case"dl":return[t,r,i];default:return o}case n:switch(d){case"fu":return[n,e,t];case"bu":return[n,s,e];case"bd":return[n,i,s];case"df":return[n,t,i];default:return o}case s:switch(d){case"ru":return[s,e,n];case"lu":return[s,r,e];case"dl":return[s,i,r];case"dr":return[s,n,i];default:return o}case i:switch(d){case"fl":return[i,t,r];case"fr":return[i,n,t];case"br":return[i,s,n];case"bl":return[i,r,s];default:return o}default:return o}}function a(c){const[l,o,d]=se(c);return{a:w(l),b:w(o),c:w(d)}}function Y(c){switch(c==null?void 0:c.toLowerCase()){case"a":return a([e,s,r]);case"b":return a([e,s,n]);case"c":return a([e,t,n]);case"d":return a([e,r,t]);case"e":return a([r,e,s]);case"f":return a([r,t,e]);case"g":return a([r,i,t]);case"h":return a([r,i,s]);case"i":return a([t,e,r]);case"j":return a([t,n,e]);case"k":return a([t,i,n]);case"l":return a([t,r,i]);case"m":return a([n,e,t]);case"n":return a([n,s,e]);case"o":return a([n,i,s]);case"p":return a([n,t,i]);case"q":return a([s,e,n]);case"r":return a([s,r,e]);case"s":return a([s,i,r]);case"t":return a([s,n,i]);case"u":return a([i,t,r]);case"v":return a([i,n,t]);case"w":return a([i,s,n]);case"x":return a([i,r,s]);default:return{...ne}}}function ie({pieceAsticker1:c,pieceAsticker2:l,pieceAsticker3:o,pieceBsticker1:d,pieceBsticker2:R,pieceBsticker3:h}){return`
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
	`.replaceAll(/[\t\n]/g,"").replaceAll(/: +/g,":")}function ue(c,l){V(l,!1);let o=u.COLOUR_GREY,d=u.COLOUR_GREY,R=u.COLOUR_GREY,h=u.COLOUR_GREY,f=u.COLOUR_GREY,g=u.COLOUR_GREY,b=re(l,"letterPair",8,"");function k(H){const m=H.split("");if(o=u.COLOUR_GREY,d=u.COLOUR_GREY,R=u.COLOUR_GREY,h=u.COLOUR_GREY,f=u.COLOUR_GREY,g=u.COLOUR_GREY,m.length>=1){const O=Y(m[0]);o=O.a,d=O.b,R=O.c}if(m.length>=2){const O=Y(m[1]);h=O.a,f=O.b,g=O.c}return ie({pieceAsticker1:o,pieceAsticker2:d,pieceAsticker3:R,pieceBsticker1:h,pieceBsticker2:f,pieceBsticker3:g})}ee();var y=j(),x=X(y);te(x,()=>k(b())),W(c,y),Z()}export{ue as C,u as a,Y as g,ie as m};
