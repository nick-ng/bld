import"./NZTpNUN0.js";import{t as j,G as m,a6 as E,j as D,aZ as W,ad as U,av as F,aF as I,a_ as M,a$ as q,a8 as G,am as K,a7 as Z,ae as L,p as J,o as Q,a as V,b as X,c as ee}from"./BXsdZoRn.js";import{p as re}from"./CTUXWtyS.js";function te(l,d,c=!1,o=!1,v=!1){var f=l,O="";j(()=>{var p=D;if(O===(O=d()??"")){m&&E();return}if(p.nodes_start!==null&&(W(p.nodes_start,p.nodes_end),p.nodes_start=p.nodes_end=null),O!==""){if(m){U.data;for(var b=E(),w=b;b!==null&&(b.nodeType!==F||b.data!=="");)w=b,b=I(b);if(b===null)throw M(),q;G(U,w),f=K(b);return}var _=O+"";c?_=`<svg>${_}</svg>`:o&&(_=`<math>${_}</math>`);var h=Z(_);if((c||o)&&(h=L(h)),G(L(h),h.lastChild),c||o)for(;L(h);)f.before(L(h));else f.before(h)}})}const N=x(0,0,255),A=x(255,153,51),z=x(0,220,0),P=x(255,0,0),H=x(255,255,255),T=x(255,255,0),k="#555555",g=50,C=g/2,Y=10,u={COLOUR_GREY:k,COLOUR_BLUE:N,COLOUR_GREEN:z,COLOUR_ORANGE:A,COLOUR_RED:P,COLOUR_WHITE:H,COLOUR_YELLOW:T},se={a:k,b:k,c:k},e="u",r="l",t="f",s="r",a="b",n="d";function x(l,d,c){return`#${l.toString(16).padStart(2,"0")}${d.toString(16).padStart(2,"0")}${c.toString(16).padStart(2,"0")}`}function $(l){switch(l?.toLowerCase()){case e:return H;case r:return A;case t:return z;case s:return P;case a:return N;case n:return T;default:return k}}function ae([l,...d]){const c=[l||"?","?","?"];if(!l||d.length!==2)return c;const o=d.sort().join("").toLowerCase();switch(l.toLowerCase()){case e:switch(o){case"fl":return[e,r,t];case"fr":return[e,t,s];case"br":return[e,s,a];case"bl":return[e,a,r];default:return c}case r:switch(o){case"fu":return[r,t,e];case"df":return[r,n,t];case"bd":return[r,a,n];case"bu":return[r,e,a];default:return c}case t:switch(o){case"lu":return[t,e,r];case"ru":return[t,s,e];case"dr":return[t,n,s];case"dl":return[t,r,n];default:return c}case s:switch(o){case"fu":return[s,e,t];case"bu":return[s,a,e];case"bd":return[s,n,a];case"df":return[s,t,n];default:return c}case a:switch(o){case"ru":return[a,e,s];case"lu":return[a,r,e];case"dl":return[a,n,r];case"dr":return[a,s,n];default:return c}case n:switch(o){case"fl":return[n,t,r];case"fr":return[n,s,t];case"br":return[n,a,s];case"bl":return[n,r,a];default:return c}default:return c}}function i(l){const[d,c,o]=ae(l);return{a:$(d),b:$(c),c:$(o)}}function S(l){switch(l?.toLowerCase()){case"a":return i([e,a,r]);case"b":return i([e,a,s]);case"c":return i([e,t,s]);case"d":return i([e,r,t]);case"e":return i([r,e,a]);case"f":return i([r,t,e]);case"g":return i([r,n,t]);case"h":return i([r,n,a]);case"i":return i([t,e,r]);case"j":return i([t,s,e]);case"k":return i([t,n,s]);case"l":return i([t,r,n]);case"m":return i([s,e,t]);case"n":return i([s,a,e]);case"o":return i([s,n,a]);case"p":return i([s,t,n]);case"q":return i([a,e,s]);case"r":return i([a,r,e]);case"s":return i([a,n,r]);case"t":return i([a,s,n]);case"u":return i([n,t,r]);case"v":return i([n,s,t]);case"w":return i([n,a,s]);case"x":return i([n,r,a]);default:return{...se}}}function ne({pieceAsticker1:l,pieceAsticker2:d,pieceAsticker3:c,pieceBsticker1:o,pieceBsticker2:v,pieceBsticker3:f}){return`
	<div>
		<div style="line-height: 0">
			<div style="margin: 0;padding: 0;">
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${d};
				width:${C}px;
				height:${g}px;"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${l};
				width:${g}px;
				height:${g}px;
				"></div>
				<div style="display: inline-block; width:${Y}px"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${o};
				width:${g}px;
				height:${g}px;
				"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${f};
				width:${C}px;
				height:${g}px;"></div>
			</div>
			<div style="">
				<div style="display: inline-block;width:${C}px;"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${c};
				width:${g}px;
				height:${C}px;"></div>
				<div style="display: inline-block; width:${Y}px"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${v};
				width:${g}px;
				height:${C}px;"></div>
				<div style="display:inline-block;width:${C}px;"></div>
			</div>
	</div>
	`.replaceAll(/[\t\n]/g,"").replaceAll(/: +/g,":")}function le(l,d){J(d,!0);let c=u.COLOUR_GREY,o=u.COLOUR_GREY,v=u.COLOUR_GREY,f=u.COLOUR_GREY,O=u.COLOUR_GREY,p=u.COLOUR_GREY,b=re(d,"letterPair",3,"");function w(B){const y=B.split("");if(c=u.COLOUR_GREY,o=u.COLOUR_GREY,v=u.COLOUR_GREY,f=u.COLOUR_GREY,O=u.COLOUR_GREY,p=u.COLOUR_GREY,y.length>=1){const R=S(y[0]);c=R.a,o=R.b,v=R.c}if(y.length>=2){const R=S(y[1]);f=R.a,O=R.b,p=R.c}return ne({pieceAsticker1:c,pieceAsticker2:o,pieceAsticker3:v,pieceBsticker1:f,pieceBsticker2:O,pieceBsticker3:p})}var _=Q(),h=V(_);te(h,()=>w(b())),X(l,_),ee()}export{le as C,u as a,S as g,ne as m};
