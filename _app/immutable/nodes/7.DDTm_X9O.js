import{a as O,t as x}from"../chunks/disclose-version.B8QbxXjI.js";import"../chunks/legacy.CrZcupGR.js";import{i as ke,aH as me,t as be,d as fe,h as ae,a as we,p as he,m as ge,U as Oe,n as Ae,a7 as xe,af as ye,ag as Be,a8 as h,a9 as Re,s as o,$ as e,c as r,ab as a,r as i,ac as _}from"../chunks/runtime.DZJACTxD.js";import{s as g}from"../chunks/render.iUWC1tG-.js";import{e as B,i as R}from"../chunks/each.CivPtcBz.js";import{r as Le,s as L,a as Ce}from"../chunks/attributes.CF6vsAEu.js";import{s as Ue}from"../chunks/class.CmXS8vo5.js";import{e as A}from"../chunks/events.Ub1lZ4ps.js";import{r as Ee}from"../chunks/misc.U-p1_yF6.js";import{b as $e}from"../chunks/input.Bi5EyNp6.js";import{b as Se}from"../chunks/this.CThV2HMQ.js";import{i as Ge}from"../chunks/lifecycle.BzJg6XKv.js";import{o as Ye}from"../chunks/index-client.DsC2H4KM.js";import{C as Pe,m as y,a as p,g as re}from"../chunks/corners.B22wlIRl.js";function Te($,S,n){ae&&we();var f=$,v=Oe,l,d=ke()?me:be;fe(()=>{d(v,v=S())&&(l&&he(l),l=ge(()=>n(f)))}),ae&&(f=Ae)}var He=x("<div> </div>"),Ie=x('<button class="button-default svelte-9wtseo"> </button>'),Me=x('<button class="button-default svelte-9wtseo"> </button>'),De=x('<button class="button-default svelte-9wtseo"> </button>'),qe=x('<button class="button-default svelte-9wtseo"> </button>'),Ne=x('<button class="button-default svelte-9wtseo"> </button>'),je=x('<button class="button-default svelte-9wtseo"> </button>'),ze=x('<div class="corner-drawer w-prose mx-auto svelte-9wtseo"><div class="mx-4 text-center uppercase svelte-9wtseo"><span class="svelte-9wtseo"> </span> <br class="svelte-9wtseo"> <!></div> <form class="svelte-9wtseo"><label class="svelte-9wtseo"><span class="svelte-9wtseo">Corner Letter Pair</span> <input class="uppercase svelte-9wtseo" type="text" autocomplete="off"></label> <button type="submit" class="svelte-9wtseo"> </button></form> <!> <details class="svelte-9wtseo"><summary class="svelte-9wtseo">Piece Colour Picker</summary> <div class="flex flex-col gap-1 svelte-9wtseo"><div class="border-default p-2 svelte-9wtseo"><h3 class="svelte-9wtseo">Piece A</h3> <div class="svelte-9wtseo"><h4 class="svelte-9wtseo">Sticker 1</h4> <!></div> <div class="svelte-9wtseo"><h4 class="svelte-9wtseo">Sticker 2</h4> <!></div> <div class="svelte-9wtseo"><h4 class="svelte-9wtseo">Sticker 3</h4> <!></div></div> <div class="border-default p-2 svelte-9wtseo"><h3 class="svelte-9wtseo">Piece B</h3> <div class="svelte-9wtseo"><h4 class="svelte-9wtseo">Sticker 1</h4> <!></div> <div class="svelte-9wtseo"><h4 class="svelte-9wtseo">Sticker 2</h4> <!></div> <div class="svelte-9wtseo"><h4 class="svelte-9wtseo">Sticker 3</h4> <!></div></div></div></details> <div class="svelte-9wtseo"><button class="svelte-9wtseo">Copy HTML</button> <details class="svelte-9wtseo"><summary class="svelte-9wtseo">Show HTML</summary> <textarea class="svelte-9wtseo"></textarea></details></div></div>');function ct($,S){xe(S,!1);const n=_(),f=Object.values(p);let v=_(p.COLOUR_GREY),l=_(p.COLOUR_GREY),d=_(p.COLOUR_GREY),k=_(p.COLOUR_GREY),m=_(p.COLOUR_GREY),b=_(p.COLOUR_GREY),C=_(null),w=_(""),G=_("a"),U=_(0);function ie(c){const s=c.split("");if(a(v,p.COLOUR_GREY),a(l,p.COLOUR_GREY),a(d,p.COLOUR_GREY),a(k,p.COLOUR_GREY),a(m,p.COLOUR_GREY),a(b,p.COLOUR_GREY),s.length>=1){const t=re(s[0]);a(v,t.a),a(l,t.b),a(d,t.c)}if(s.length>=2){const t=re(s[1]);a(k,t.a),a(m,t.b),a(b,t.c)}return y({pieceAsticker1:e(v),pieceAsticker2:e(l),pieceAsticker3:e(d),pieceBsticker1:e(k),pieceBsticker2:e(m),pieceBsticker3:e(b)})}function Y(c){c&&c.key!=="Enter"||e(C)&&e(C).select()}Ye(()=>(Y(),document.addEventListener("keyup",Y),()=>{document.removeEventListener("keyup",Y)})),ye(()=>e(w),()=>{a(n,ie(e(w)))}),Be(),Ge();var P=ze(),T=r(P),H=r(T),ce=r(H,!0);i(H);var oe=o(H,4);Pe(oe,{get letterPair(){return e(w)}}),i(T);var E=o(T,2),I=r(E),M=o(r(I),2);Le(M),Se(M,c=>a(C,c),()=>e(C)),i(I);var Z=o(I,2),le=r(Z);h(()=>g(le,`Copy${(e(w).length>=2?` ${e(w).slice(0,2).toUpperCase()} + HTML`:"")??""}`)),i(Z),i(E);var J=o(E,2);Te(J,()=>e(U),c=>{var s=He(),t=r(s,!0);i(s),h(()=>{Ue(s,`${`message ${e(U)?"":"opacity-0"}`??""} svelte-9wtseo`),g(t,e(G))}),O(c,s)});var D=o(J,2),K=o(r(D),2),q=r(K),N=o(r(q),2),ve=o(r(N),2);B(ve,1,()=>f,R,(c,s)=>{var t=Ie(),u=r(t,!0);i(t),h(()=>{L(t,"style",`background-color: ${e(s)}`),g(u,e(s))}),A("click",t,()=>{a(v,e(s)),a(n,y({pieceAsticker1:e(v),pieceAsticker2:e(l),pieceAsticker3:e(d),pieceBsticker1:e(k),pieceBsticker2:e(m),pieceBsticker3:e(b)}))}),O(c,t)}),i(N);var j=o(N,2),pe=o(r(j),2);B(pe,1,()=>f,R,(c,s)=>{var t=Me(),u=r(t,!0);i(t),h(()=>{L(t,"style",`background-color: ${e(s)}`),g(u,e(s))}),A("click",t,()=>{a(l,e(s)),a(n,y({pieceAsticker1:e(v),pieceAsticker2:e(l),pieceAsticker3:e(d),pieceBsticker1:e(k),pieceBsticker2:e(m),pieceBsticker3:e(b)}))}),O(c,t)}),i(j);var Q=o(j,2),ne=o(r(Q),2);B(ne,1,()=>f,R,(c,s)=>{var t=De(),u=r(t,!0);i(t),h(()=>{L(t,"style",`background-color: ${e(s)}`),g(u,e(s))}),A("click",t,()=>{a(d,e(s)),a(n,y({pieceAsticker1:e(v),pieceAsticker2:e(l),pieceAsticker3:e(d),pieceBsticker1:e(k),pieceBsticker2:e(m),pieceBsticker3:e(b)}))}),O(c,t)}),i(Q),i(q);var V=o(q,2),z=o(r(V),2),de=o(r(z),2);B(de,1,()=>f,R,(c,s)=>{var t=qe(),u=r(t,!0);i(t),h(()=>{L(t,"style",`background-color: ${e(s)}`),g(u,e(s))}),A("click",t,()=>{a(k,e(s)),a(n,y({pieceAsticker1:e(v),pieceAsticker2:e(l),pieceAsticker3:e(d),pieceBsticker1:e(k),pieceBsticker2:e(m),pieceBsticker3:e(b)}))}),O(c,t)}),i(z);var F=o(z,2),ue=o(r(F),2);B(ue,1,()=>f,R,(c,s)=>{var t=Ne(),u=r(t,!0);i(t),h(()=>{L(t,"style",`background-color: ${e(s)}`),g(u,e(s))}),A("click",t,()=>{a(m,e(s)),a(n,y({pieceAsticker1:e(v),pieceAsticker2:e(l),pieceAsticker3:e(d),pieceBsticker1:e(k),pieceBsticker2:e(m),pieceBsticker3:e(b)}))}),O(c,t)}),i(F);var W=o(F,2),_e=o(r(W),2);B(_e,1,()=>f,R,(c,s)=>{var t=je(),u=r(t,!0);i(t),h(()=>{L(t,"style",`background-color: ${e(s)}`),g(u,e(s))}),A("click",t,()=>{a(b,e(s)),a(n,y({pieceAsticker1:e(v),pieceAsticker2:e(l),pieceAsticker3:e(d),pieceBsticker1:e(k),pieceBsticker2:e(m),pieceBsticker3:e(b)}))}),O(c,t)}),i(W),i(V),i(K),i(D);var X=o(D,2),ee=r(X),te=o(ee,2),se=o(r(te),2);Ee(se),i(te),i(X),i(P),h(()=>{g(ce,e(w)),Ce(se,`${e(n)}`)}),$e(M,()=>e(w),c=>a(w,c)),A("submit",E,c=>{c.preventDefault(),navigator.clipboard.writeText(`${e(w).slice(0,2).toUpperCase()}<br />${e(n)}`),a(G,"HTML coppied to clipboard"),a(U,Date.now())}),A("click",ee,()=>{navigator.clipboard.writeText(`${e(n)}`),a(G,"HTML coppied to clipboard"),a(U,Date.now())}),O($,P),Re()}export{ct as component};