import{s as H,n as y}from"./scheduler.BSCSRSYS.js";import{S as N,i as B,H as T,x as $,y as W,g as j,d as q}from"./index.BBmDRcov.js";const E=x(0,0,255),G=x(255,153,51),Y=x(0,220,0),S=x(255,0,0),P=x(255,255,255),z=x(255,255,0),f="#555555",h=50,O=h/2,U=10,b={COLOUR_GREY:f,COLOUR_BLUE:E,COLOUR_GREEN:Y,COLOUR_ORANGE:G,COLOUR_RED:S,COLOUR_WHITE:P,COLOUR_YELLOW:z},D={a:f,b:f,c:f},e="u",r="l",t="f",n="r",s="b",i="d";function x(a,u,o){return`#${a.toString(16).padStart(2,"0")}${u.toString(16).padStart(2,"0")}${o.toString(16).padStart(2,"0")}`}function w(a){switch(a==null?void 0:a.toLowerCase()){case e:return P;case r:return G;case t:return Y;case n:return S;case s:return E;case i:return z;default:return f}}function F([a,...u]){const o=[a||"?","?","?"];if(!a||u.length!==2)return o;const l=u.sort().join("").toLowerCase();switch(a.toLowerCase()){case e:switch(l){case"fl":return[e,r,t];case"fr":return[e,t,n];case"br":return[e,n,s];case"bl":return[e,s,r];default:return o}case r:switch(l){case"fu":return[r,t,e];case"df":return[r,i,t];case"bd":return[r,s,i];case"bu":return[r,e,s];default:return o}case t:switch(l){case"lu":return[t,e,r];case"ru":return[t,n,e];case"dr":return[t,i,n];case"dl":return[t,r,i];default:return o}case n:switch(l){case"fu":return[n,e,t];case"bu":return[n,s,e];case"bd":return[n,i,s];case"df":return[n,t,i];default:return o}case s:switch(l){case"ru":return[s,e,n];case"lu":return[s,r,e];case"dl":return[s,i,r];case"dr":return[s,n,i];default:return o}case i:switch(l){case"fl":return[i,t,r];case"fr":return[i,n,t];case"br":return[i,s,n];case"bl":return[i,r,s];default:return o}default:return o}}function c(a){const[u,o,l]=F(a);return{a:w(u),b:w(o),c:w(l)}}function m(a){switch(a==null?void 0:a.toLowerCase()){case"a":return c([e,s,r]);case"b":return c([e,s,n]);case"c":return c([e,t,n]);case"d":return c([e,r,t]);case"e":return c([r,e,s]);case"f":return c([r,t,e]);case"g":return c([r,i,t]);case"h":return c([r,i,s]);case"i":return c([t,e,r]);case"j":return c([t,n,e]);case"k":return c([t,i,n]);case"l":return c([t,r,i]);case"m":return c([n,e,t]);case"n":return c([n,s,e]);case"o":return c([n,i,s]);case"p":return c([n,t,i]);case"q":return c([s,e,n]);case"r":return c([s,r,e]);case"s":return c([s,i,r]);case"t":return c([s,n,i]);case"u":return c([i,t,r]);case"v":return c([i,n,t]);case"w":return c([i,s,n]);case"x":return c([i,r,s]);default:return{...D}}}function I({pieceAsticker1:a,pieceAsticker2:u,pieceAsticker3:o,pieceBsticker1:l,pieceBsticker2:d,pieceBsticker3:p}){return`
	<div>
		<div style="line-height: 0">
			<div style="margin: 0;padding: 0;">
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${u};
				width:${O}px;
				height:${h}px;"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${a};
				width:${h}px;
				height:${h}px;
				"></div>
				<div style="display: inline-block; width:${U}px"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${l};
				width:${h}px;
				height:${h}px;
				"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${p};
				width:${O}px;
				height:${h}px;"></div>
			</div>
			<div style="">
				<div style="display: inline-block;width:${O}px;"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${o};
				width:${h}px;
				height:${O}px;"></div>
				<div style="display: inline-block; width:${U}px"></div>
				<div style="display: inline-block;
				box-sizing: border-box;border: solid 1px black;
				background-color:${d};
				width:${h}px;
				height:${O}px;"></div>
				<div style="display:inline-block;width:${O}px;"></div>
			</div>
	</div>
	`.replaceAll(/[\t\n]/g,"").replaceAll(/: +/g,":")}function K(a){let u,o=a[1](a[0])+"",l;return{c(){u=new T(!1),l=$(),this.h()},l(d){u=W(d,!1),l=$(),this.h()},h(){u.a=l},m(d,p){u.m(o,d,p),j(d,l,p)},p(d,[p]){p&1&&o!==(o=d[1](d[0])+"")&&u.p(o)},i:y,o:y,d(d){d&&(q(l),u.d())}}}function J(a,u,o){let l=b.COLOUR_GREY,d=b.COLOUR_GREY,p=b.COLOUR_GREY,k=b.COLOUR_GREY,v=b.COLOUR_GREY,_=b.COLOUR_GREY,{letterPair:L=""}=u;function A(R){const C=R.split("");if(l=b.COLOUR_GREY,d=b.COLOUR_GREY,p=b.COLOUR_GREY,k=b.COLOUR_GREY,v=b.COLOUR_GREY,_=b.COLOUR_GREY,C.length>=1){const g=m(C[0]);l=g.a,d=g.b,p=g.c}if(C.length>=2){const g=m(C[1]);k=g.a,v=g.b,_=g.c}return I({pieceAsticker1:l,pieceAsticker2:d,pieceAsticker3:p,pieceBsticker1:k,pieceBsticker2:v,pieceBsticker3:_})}return a.$$set=R=>{"letterPair"in R&&o(0,L=R.letterPair)},[L,A]}class V extends N{constructor(u){super(),B(this,u,J,K,H,{letterPair:0})}}export{V as C,b as a,m as g,I as m};
