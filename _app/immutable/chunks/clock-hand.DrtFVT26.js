import{a as v,t as b}from"./disclose-version.B8QbxXjI.js";import"./legacy.CrZcupGR.js";import{a7 as h,a8 as _,a9 as w,ab as M,c as m,r as u,ac as $,$ as I}from"./runtime.DZJACTxD.js";import{i as C}from"./if.DQBGKmmp.js";import{s as H}from"./attributes.CF6vsAEu.js";import{i as S}from"./lifecycle.BzJg6XKv.js";import{p as f}from"./props.BcXfgcJ5.js";import{o as D}from"./index-client.DsC2H4KM.js";var Q=b('<table><tbody><tr><td class="svelte-166yxx8"></td><td class="svelte-166yxx8"></td></tr><tr><td class="svelte-166yxx8"></td><td class="svelte-166yxx8"></td></tr></tbody></table>'),F=b('<div class="clock svelte-166yxx8"><div class="hand svelte-166yxx8"><!></div></div>');function J(p,r){h(r,!1);let n=f(r,"isMinutes",8,!1),g=f(r,"showQuartermarkers",8,!1);const i=()=>{const t=new Date;return t.getHours()%12+t.getMinutes()/60+t.getSeconds()/3600},c=()=>{const t=new Date;return t.getMinutes()+t.getSeconds()/60},s="#ccc";let e=n()?c()/60:i()/12,a=null,d=$(`background: conic-gradient(${s} 0%, ${s} ${e*100}%, black ${e*100}%), black 100%;`);D(()=>(a&&clearInterval(a),a=setInterval(()=>{e=n()?c()/60:i()/12,M(d,`background: conic-gradient(${s} 0%, ${s} ${e*100}%, black ${e*100}%), black 100%;`)},997),()=>{a&&clearInterval(a)})),S();var o=F(),l=m(o),x=m(l);{var k=t=>{var y=Q();v(t,y)};C(x,t=>{g()&&t(k)})}u(l),u(o),_(()=>H(l,"style",I(d))),v(p,o),w()}export{J as C};