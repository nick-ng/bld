import"./CWj6FrbW.js";import{t as j,G as E,V as m,j as D,aE as W,a5 as U,ah as F,av as I,aF as M,aG as q,a8 as G,$ as K,a7 as V,aa as L,p as J,ad as Q,a as X,b as Z,c as ee}from"./B-tJBvbI.js";import{p as re}from"./7RwpnUMX.js";function te(o,d,c=!1,l=!1,v=!1){var p=o,O="";j(()=>{var f=D;if(O===(O=d()??"")){E&&m();return}if(f.nodes_start!==null&&(W(f.nodes_start,f.nodes_end),f.nodes_start=f.nodes_end=null),O!==""){if(E){U.data;for(var b=m(),w=b;b!==null&&(b.nodeType!==F||b.data!=="");)w=b,b=I(b);if(b===null)throw M(),q;G(U,w),p=K(b);return}var _=O+"";c?_=`<svg>${_}</svg>`:l&&(_=`<math>${_}</math>`);var h=V(_);if((c||l)&&(h=L(h)),G(L(h),h.lastChild),c||l)for(;L(h);)p.before(L(h));else p.before(h)}})}const N=x(0,0,255),A=x(255,153,51),z=x(0,220,0),P=x(255,0,0),H=x(255,255,255),T=x(255,255,0),k="#555555",g=50,C=g/2,Y=10,u={COLOUR_GREY:k,COLOUR_BLUE:N,COLOUR_GREEN:z,COLOUR_ORANGE:A,COLOUR_RED:P,COLOUR_WHITE:H,COLOUR_YELLOW:T},se={a:k,b:k,c:k},e="u",r="l",t="f",s="r",n="b",a="d";function x(o,d,c){return`#${o.toString(16).padStart(2,"0")}${d.toString(16).padStart(2,"0")}${c.toString(16).padStart(2,"0")}`}function $(o){switch(o==null?void 0:o.toLowerCase()){case e:return H;case r:return A;case t:return z;case s:return P;case n:return N;case a:return T;default:return k}}function ne([o,...d]){const c=[o||"?","?","?"];if(!o||d.length!==2)return c;const l=d.sort().join("").toLowerCase();switch(o.toLowerCase()){case e:switch(l){case"fl":return[e,r,t];case"fr":return[e,t,s];case"br":return[e,s,n];case"bl":return[e,n,r];default:return c}case r:switch(l){case"fu":return[r,t,e];case"df":return[r,a,t];case"bd":return[r,n,a];case"bu":return[r,e,n];default:return c}case t:switch(l){case"lu":return[t,e,r];case"ru":return[t,s,e];case"dr":return[t,a,s];case"dl":return[t,r,a];default:return c}case s:switch(l){case"fu":return[s,e,t];case"bu":return[s,n,e];case"bd":return[s,a,n];case"df":return[s,t,a];default:return c}case n:switch(l){case"ru":return[n,e,s];case"lu":return[n,r,e];case"dl":return[n,a,r];case"dr":return[n,s,a];default:return c}case a:switch(l){case"fl":return[a,t,r];case"fr":return[a,s,t];case"br":return[a,n,s];case"bl":return[a,r,n];default:return c}default:return c}}function i(o){const[d,c,l]=ne(o);return{a:$(d),b:$(c),c:$(l)}}function S(o){switch(o==null?void 0:o.toLowerCase()){case"a":return i([e,n,r]);case"b":return i([e,n,s]);case"c":return i([e,t,s]);case"d":return i([e,r,t]);case"e":return i([r,e,n]);case"f":return i([r,t,e]);case"g":return i([r,a,t]);case"h":return i([r,a,n]);case"i":return i([t,e,r]);case"j":return i([t,s,e]);case"k":return i([t,a,s]);case"l":return i([t,r,a]);case"m":return i([s,e,t]);case"n":return i([s,n,e]);case"o":return i([s,a,n]);case"p":return i([s,t,a]);case"q":return i([n,e,s]);case"r":return i([n,r,e]);case"s":return i([n,a,r]);case"t":return i([n,s,a]);case"u":return i([a,t,r]);case"v":return i([a,s,t]);case"w":return i([a,n,s]);case"x":return i([a,r,n]);default:return{...se}}}function ae({pieceAsticker1:o,pieceAsticker2:d,pieceAsticker3:c,pieceBsticker1:l,pieceBsticker2:v,pieceBsticker3:p}){return`
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
				background-color:${o};
				width:${g}px;
				height:${g}px;
				"></div>
				<div style="display: inline-block; width:${Y}px"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${l};
				width:${g}px;
				height:${g}px;
				"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${p};
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
	`.replaceAll(/[\t\n]/g,"").replaceAll(/: +/g,":")}function le(o,d){J(d,!0);let c=u.COLOUR_GREY,l=u.COLOUR_GREY,v=u.COLOUR_GREY,p=u.COLOUR_GREY,O=u.COLOUR_GREY,f=u.COLOUR_GREY,b=re(d,"letterPair",3,"");function w(B){const y=B.split("");if(c=u.COLOUR_GREY,l=u.COLOUR_GREY,v=u.COLOUR_GREY,p=u.COLOUR_GREY,O=u.COLOUR_GREY,f=u.COLOUR_GREY,y.length>=1){const R=S(y[0]);c=R.a,l=R.b,v=R.c}if(y.length>=2){const R=S(y[1]);p=R.a,O=R.b,f=R.c}return ae({pieceAsticker1:c,pieceAsticker2:l,pieceAsticker3:v,pieceBsticker1:p,pieceBsticker2:O,pieceBsticker3:f})}var _=Q(),h=X(_);te(h,()=>w(b())),Z(o,_),ee()}export{le as C,u as a,S as g,ae as m};
