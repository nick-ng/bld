import{b as m,d as j,c as D,a as M}from"./XvHQbEkk.js";import{t as W,h as E,a9 as U,w as I,aK as K,k as G,C as q,e as F,aL as J,aM as Q,j as V,g as L,p as X,f as Z,a as ee}from"./CEnJTs3f.js";import{p as re}from"./GZiHUdng.js";function te(l,d,c=!1,o=!1,_=!1){var f=l,g="";W(()=>{var O=I;if(g===(g=d()??"")){E&&U();return}if(O.nodes!==null&&(K(O.nodes.start,O.nodes.end),O.nodes=null),g!==""){if(E){G.data;for(var b=U(),w=b;b!==null&&(b.nodeType!==q||b.data!=="");)w=b,b=F(b);if(b===null)throw J(),Q;m(G,w),f=V(b);return}var R=g+"";c?R=`<svg>${R}</svg>`:o&&(R=`<math>${R}</math>`);var p=j(R);if((c||o)&&(p=L(p)),m(L(p),p.lastChild),c||o)for(;L(p);)f.before(L(p));else f.before(p)}})}const N=x(0,0,255),A=x(255,153,51),z=x(0,220,0),P=x(255,0,0),H=x(255,255,255),T=x(255,255,0),k="#555555",h=50,C=h/2,Y=10,u={COLOUR_GREY:k,COLOUR_BLUE:N,COLOUR_GREEN:z,COLOUR_ORANGE:A,COLOUR_RED:P,COLOUR_WHITE:H,COLOUR_YELLOW:T},se={a:k,b:k,c:k},e="u",r="l",t="f",s="r",n="b",a="d";function x(l,d,c){return`#${l.toString(16).padStart(2,"0")}${d.toString(16).padStart(2,"0")}${c.toString(16).padStart(2,"0")}`}function $(l){switch(l?.toLowerCase()){case e:return H;case r:return A;case t:return z;case s:return P;case n:return N;case a:return T;default:return k}}function ne([l,...d]){const c=[l||"?","?","?"];if(!l||d.length!==2)return c;const o=d.sort().join("").toLowerCase();switch(l.toLowerCase()){case e:switch(o){case"fl":return[e,r,t];case"fr":return[e,t,s];case"br":return[e,s,n];case"bl":return[e,n,r];default:return c}case r:switch(o){case"fu":return[r,t,e];case"df":return[r,a,t];case"bd":return[r,n,a];case"bu":return[r,e,n];default:return c}case t:switch(o){case"lu":return[t,e,r];case"ru":return[t,s,e];case"dr":return[t,a,s];case"dl":return[t,r,a];default:return c}case s:switch(o){case"fu":return[s,e,t];case"bu":return[s,n,e];case"bd":return[s,a,n];case"df":return[s,t,a];default:return c}case n:switch(o){case"ru":return[n,e,s];case"lu":return[n,r,e];case"dl":return[n,a,r];case"dr":return[n,s,a];default:return c}case a:switch(o){case"fl":return[a,t,r];case"fr":return[a,s,t];case"br":return[a,n,s];case"bl":return[a,r,n];default:return c}default:return c}}function i(l){const[d,c,o]=ne(l);return{a:$(d),b:$(c),c:$(o)}}function S(l){switch(l?.toLowerCase()){case"a":return i([e,n,r]);case"b":return i([e,n,s]);case"c":return i([e,t,s]);case"d":return i([e,r,t]);case"e":return i([r,e,n]);case"f":return i([r,t,e]);case"g":return i([r,a,t]);case"h":return i([r,a,n]);case"i":return i([t,e,r]);case"j":return i([t,s,e]);case"k":return i([t,a,s]);case"l":return i([t,r,a]);case"m":return i([s,e,t]);case"n":return i([s,n,e]);case"o":return i([s,a,n]);case"p":return i([s,t,a]);case"q":return i([n,e,s]);case"r":return i([n,r,e]);case"s":return i([n,a,r]);case"t":return i([n,s,a]);case"u":return i([a,t,r]);case"v":return i([a,s,t]);case"w":return i([a,n,s]);case"x":return i([a,r,n]);default:return{...se}}}function ae({pieceAsticker1:l,pieceAsticker2:d,pieceAsticker3:c,pieceBsticker1:o,pieceBsticker2:_,pieceBsticker3:f}){return`
	<div>
		<div style="line-height: 0">
			<div style="margin: 0;padding: 0;">
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${d};
				width:${C}px;
				height:${h}px;"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${l};
				width:${h}px;
				height:${h}px;
				"></div>
				<div style="display: inline-block; width:${Y}px"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${o};
				width:${h}px;
				height:${h}px;
				"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${f};
				width:${C}px;
				height:${h}px;"></div>
			</div>
			<div style="">
				<div style="display: inline-block;width:${C}px;"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${c};
				width:${h}px;
				height:${C}px;"></div>
				<div style="display: inline-block; width:${Y}px"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${_};
				width:${h}px;
				height:${C}px;"></div>
				<div style="display:inline-block;width:${C}px;"></div>
			</div>
	</div>
	`.replaceAll(/[\t\n]/g,"").replaceAll(/: +/g,":")}function le(l,d){X(d,!0);let c=u.COLOUR_GREY,o=u.COLOUR_GREY,_=u.COLOUR_GREY,f=u.COLOUR_GREY,g=u.COLOUR_GREY,O=u.COLOUR_GREY,b=re(d,"letterPair",3,"");function w(B){const y=B.split("");if(c=u.COLOUR_GREY,o=u.COLOUR_GREY,_=u.COLOUR_GREY,f=u.COLOUR_GREY,g=u.COLOUR_GREY,O=u.COLOUR_GREY,y.length>=1){const v=S(y[0]);c=v.a,o=v.b,_=v.c}if(y.length>=2){const v=S(y[1]);f=v.a,g=v.b,O=v.c}return ae({pieceAsticker1:c,pieceAsticker2:o,pieceAsticker3:_,pieceBsticker1:f,pieceBsticker2:g,pieceBsticker3:O})}var R=D(),p=Z(R);te(p,()=>w(b())),M(l,R),ee()}export{le as C,u as a,S as g,ae as m};
