import{a as p,t as b}from"../chunks/disclose-version.B8QbxXjI.js";import"../chunks/legacy.CrZcupGR.js";import{a7 as X,af as Z,ag as tt,a9 as et,s as f,c,r as t,$ as s,ae as M,f as $,a8 as g,ac as at,ab as st}from"../chunks/runtime.DZJACTxD.js";import{s as w}from"../chunks/render.iUWC1tG-.js";import{e as x,i as y}from"../chunks/each.CivPtcBz.js";import{s as k}from"../chunks/attributes.CF6vsAEu.js";import{i as rt}from"../chunks/lifecycle.BzJg6XKv.js";import{s as ot,a as K}from"../chunks/store.B5jiF3DM.js";import{o as lt}from"../chunks/index-client.DsC2H4KM.js";import{f as dt,s as N,a as ct,b as nt,c as it}from"../chunks/flash-cards.DEslqNEc.js";var vt=b(' <a class="uppercase"> </a>',1),ft=b('<tr><td class="svelte-4di4we"> </td><td class="svelte-4di4we"></td></tr>'),ut=b(' <a class="uppercase"> </a>',1),ht=b('<tr><td class="svelte-4di4we"> </td><td class="svelte-4di4we"></td></tr>'),_t=b(' <a class="uppercase"> </a>',1),mt=b('<tr><td class="font-mono whitespace-nowrap svelte-4di4we"> </td><td class="svelte-4di4we"></td></tr>'),pt=b(' <a class="uppercase"> </a>',1),bt=b('<tr><td class="font-mono whitespace-nowrap svelte-4di4we"> </td><td class="svelte-4di4we"></td></tr>'),gt=b('<div><div class="grid summary-grid grid-cols-1 items-start justify-items-center content-center justify-center gap-2 lg:m-0 mx-auto svelte-4di4we"><table class="block summary-tables lg:max-w-lg svelte-4di4we"><thead><tr><th class="text-left svelte-4di4we">Confidence</th><th class="text-left svelte-4di4we">Letter Pairs</th></tr></thead><tbody></tbody></table> <table class="block summary-tables lg:max-w-lg svelte-4di4we"><thead><tr><th class="text-left whitespace-nowrap svelte-4di4we">Last Reviewed</th><th class="text-left svelte-4di4we">Letter Pairs</th></tr></thead><tbody></tbody></table> <table class="block summary-tables lg:max-w-lg svelte-4di4we"><thead><tr><th class="text-left svelte-4di4we">Insert</th><th class="text-left svelte-4di4we">Letter Pairs</th></tr></thead><tbody></tbody></table> <table class="block summary-tables lg:max-w-lg svelte-4di4we"><thead><tr><th class="text-left svelte-4di4we">Setup</th><th class="text-left svelte-4di4we">Letter Pairs</th></tr></thead><tbody></tbody></table></div></div>');function jt(Q,Y){X(Y,!1);const E=ot(),H=()=>K(nt,"$flashCardStore",E),q=()=>K(ct,"$flashCardStoreStatus",E),m=at(),B=5*60*1e3,C=60*60*1e3,O=24*C,R=7*O,A=4*R,G=d=>{const e=Date.now()-d;return e>A?"> 1 Month":e>R?"< 1 Month":e>O?"< 1 Week":e>C?"< 1 Day":"< 1 Hour"},T=d=>{switch(d){case"> 1 Month":return A+1;case"< 1 Month":return R+1;case"< 1 Week":return O+1;case"< 1 Day":return C+1;default:return 0}},J=d=>{const e={},r={},o={},u={},n={};for(let _=0;_<d.length;_++){const a=d[_];if(a.letterPair[0]===a.letterPair[1]||!a.commutator)continue;const{insert:h,interchange:i,setup:v}=it(a.commutator);if(!h)continue;e[h]||(e[h]=[]),e[h].push(a.letterPair),r[i]||(r[i]=[]),r[i].push(a.letterPair),o[v]||(o[v]=[]),o[v].push(a.letterPair),u[a.confidence]||(u[a.confidence]=[]),u[a.confidence].push(a.letterPair);const l=G(a.lastQuizUnix*1e3);n[l]||(n[l]=[]),n[l].push(a.letterPair)}return{inserts:e,interchanges:r,setups:o,confidence:u,ageRanges:n}};lt(()=>{Date.now()-q().fetchEndMs>B&&dt()}),Z(()=>H(),()=>{st(m,J(Object.values(H())))}),tt(),rt();var j=gt(),V=c(j),D=c(V),I=f(c(D));x(I,5,()=>Object.keys(s(m).confidence).toSorted((d,e)=>parseInt(d)-parseInt(e)),y,(d,e)=>{var r=ft(),o=c(r),u=c(o,!0);t(o);var n=f(o);x(n,5,()=>s(m).confidence[s(e)].toSorted(),y,(_,a,h)=>{M();var i=vt(),v=$(i,!0);v.nodeValue=h>0?", ":"";var l=f(v),S=c(l,!0);t(l),g(()=>{k(l,"href",`/flash-cards/edit?lp=${s(a)}`),w(S,s(a))}),p(_,i)}),t(n),t(r),g(()=>w(u,s(e))),p(d,r)}),t(I),t(D);var L=f(D,2),W=f(c(L));x(W,5,()=>Object.keys(s(m).ageRanges).toSorted((d,e)=>T(e)-T(d)),y,(d,e)=>{var r=ht(),o=c(r),u=c(o,!0);t(o);var n=f(o);x(n,5,()=>s(m).ageRanges[s(e)].toSorted(),y,(_,a,h)=>{M();var i=ut(),v=$(i,!0);v.nodeValue=h>0?", ":"";var l=f(v),S=c(l,!0);t(l),g(()=>{k(l,"href",`/flash-cards/edit?lp=${s(a)}`),w(S,s(a))}),p(_,i)}),t(n),t(r),g(()=>w(u,s(e))),p(d,r)}),t(W),t(L);var P=f(L,2),U=f(c(P));x(U,5,()=>Object.keys(s(m).inserts).toSorted(N),y,(d,e)=>{var r=mt(),o=c(r),u=c(o,!0);t(o);var n=f(o);x(n,5,()=>s(m).inserts[s(e)].toSorted(),y,(_,a,h)=>{M();var i=_t(),v=$(i,!0);v.nodeValue=h>0?", ":"";var l=f(v),S=c(l,!0);t(l),g(()=>{k(l,"href",`/flash-cards/edit?lp=${s(a)}`),w(S,s(a))}),p(_,i)}),t(n),t(r),g(()=>w(u,s(e))),p(d,r)}),t(U),t(P);var z=f(P,2),F=f(c(z));x(F,5,()=>Object.keys(s(m).setups).toSorted(N),y,(d,e)=>{var r=bt(),o=c(r),u=c(o,!0);t(o);var n=f(o);x(n,5,()=>s(m).setups[s(e)].toSorted(),y,(_,a,h)=>{M();var i=pt(),v=$(i,!0);v.nodeValue=h>0?", ":"";var l=f(v),S=c(l,!0);t(l),g(()=>{k(l,"href",`/flash-cards/edit?lp=${s(a)}`),w(S,s(a))}),p(_,i)}),t(n),t(r),g(()=>w(u,s(e))),p(d,r)}),t(F),t(z),t(V),t(j),p(Q,j),et()}export{jt as component};