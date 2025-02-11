import{b as m,d as T,c as D,a as W}from"./Bq-Zfy3o.js";import{b as j,h as $,w as E,a as I,e as U,a5 as q,aD as F,aC as K,y as J,$ as M,d as Q,af as V,f as X,ag as Z}from"./B5m7kkuG.js";import{p as ee}from"./BHczGMHn.js";function re(c,l,o,d,R){var h=c,f="",g;j(()=>{if(f===(f=l()??"")){$&&E();return}g!==void 0&&(Q(g),g=void 0),f!==""&&(g=I(()=>{if($){U.data;for(var b=E(),k=b;b!==null&&(b.nodeType!==8||b.data!=="");)k=b,b=q(b);if(b===null)throw F(),K;m(U,k),h=J(b);return}var y=f+"",C=T(y);m(M(C),C.lastChild),h.before(C)}))})}const S=_(0,0,255),A=_(255,153,51),z=_(0,220,0),N=_(255,0,0),P=_(255,255,255),H=_(255,255,0),x="#555555",p=50,v=p/2,G=10,u={COLOUR_GREY:x,COLOUR_BLUE:S,COLOUR_GREEN:z,COLOUR_ORANGE:A,COLOUR_RED:N,COLOUR_WHITE:P,COLOUR_YELLOW:H},te={a:x,b:x,c:x},e="u",r="l",t="f",n="r",s="b",a="d";function _(c,l,o){return`#${c.toString(16).padStart(2,"0")}${l.toString(16).padStart(2,"0")}${o.toString(16).padStart(2,"0")}`}function L(c){switch(c==null?void 0:c.toLowerCase()){case e:return P;case r:return A;case t:return z;case n:return N;case s:return S;case a:return H;default:return x}}function ne([c,...l]){const o=[c||"?","?","?"];if(!c||l.length!==2)return o;const d=l.sort().join("").toLowerCase();switch(c.toLowerCase()){case e:switch(d){case"fl":return[e,r,t];case"fr":return[e,t,n];case"br":return[e,n,s];case"bl":return[e,s,r];default:return o}case r:switch(d){case"fu":return[r,t,e];case"df":return[r,a,t];case"bd":return[r,s,a];case"bu":return[r,e,s];default:return o}case t:switch(d){case"lu":return[t,e,r];case"ru":return[t,n,e];case"dr":return[t,a,n];case"dl":return[t,r,a];default:return o}case n:switch(d){case"fu":return[n,e,t];case"bu":return[n,s,e];case"bd":return[n,a,s];case"df":return[n,t,a];default:return o}case s:switch(d){case"ru":return[s,e,n];case"lu":return[s,r,e];case"dl":return[s,a,r];case"dr":return[s,n,a];default:return o}case a:switch(d){case"fl":return[a,t,r];case"fr":return[a,n,t];case"br":return[a,s,n];case"bl":return[a,r,s];default:return o}default:return o}}function i(c){const[l,o,d]=ne(c);return{a:L(l),b:L(o),c:L(d)}}function Y(c){switch(c==null?void 0:c.toLowerCase()){case"a":return i([e,s,r]);case"b":return i([e,s,n]);case"c":return i([e,t,n]);case"d":return i([e,r,t]);case"e":return i([r,e,s]);case"f":return i([r,t,e]);case"g":return i([r,a,t]);case"h":return i([r,a,s]);case"i":return i([t,e,r]);case"j":return i([t,n,e]);case"k":return i([t,a,n]);case"l":return i([t,r,a]);case"m":return i([n,e,t]);case"n":return i([n,s,e]);case"o":return i([n,a,s]);case"p":return i([n,t,a]);case"q":return i([s,e,n]);case"r":return i([s,r,e]);case"s":return i([s,a,r]);case"t":return i([s,n,a]);case"u":return i([a,t,r]);case"v":return i([a,n,t]);case"w":return i([a,s,n]);case"x":return i([a,r,s]);default:return{...te}}}function se({pieceAsticker1:c,pieceAsticker2:l,pieceAsticker3:o,pieceBsticker1:d,pieceBsticker2:R,pieceBsticker3:h}){return`
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
	`.replaceAll(/[\t\n]/g,"").replaceAll(/: +/g,":")}function oe(c,l){V(l,!0);let o=u.COLOUR_GREY,d=u.COLOUR_GREY,R=u.COLOUR_GREY,h=u.COLOUR_GREY,f=u.COLOUR_GREY,g=u.COLOUR_GREY,b=ee(l,"letterPair",3,"");function k(B){const w=B.split("");if(o=u.COLOUR_GREY,d=u.COLOUR_GREY,R=u.COLOUR_GREY,h=u.COLOUR_GREY,f=u.COLOUR_GREY,g=u.COLOUR_GREY,w.length>=1){const O=Y(w[0]);o=O.a,d=O.b,R=O.c}if(w.length>=2){const O=Y(w[1]);h=O.a,f=O.b,g=O.c}return se({pieceAsticker1:o,pieceAsticker2:d,pieceAsticker3:R,pieceBsticker1:h,pieceBsticker2:f,pieceBsticker3:g})}var y=D(),C=X(y);re(C,()=>k(b())),W(c,y),Z()}export{oe as C,u as a,Y as g,se as m};
