import{A as ee,b as ae,B as Q,h as C,t as M,p as re,l as Y,H as ne,q as F,v as b,c as H,w as U,a as W,x as fe,I as g,C as z,D as ie,F as G,G as k,J,K as L,L as le,M as se,N as ue,d as te,O as ve,P as de,Q as _e,R as ce,S as oe,T as K,V as he,W as Ee,X as pe}from"./0KXg1TLN.js";function me(l,e){return e}function Ae(l,e,a,u){for(var v=[],_=e.length,t=0;t<_;t++)le(e[t].e,v,!0);var c=_>0&&v.length===0&&a!==null;if(c){var A=a.parentNode;se(A),A.append(a),u.clear(),m(l,e[0].prev,e[_-1].next)}ue(v,()=>{for(var h=0;h<_;h++){var d=e[h];c||(u.delete(d.k),m(l,d.prev,d.next)),te(d.e,!c)}})}function Ce(l,e,a,u,v,_=null){var t=l,c={flags:e,items:new Map,first:null},A=(e&Q)!==0;if(A){var h=l;t=C?M(ve(h)):h.appendChild(ee())}C&&re();var d=null,w=!1,f=de(()=>{var s=a();return pe(s)?s:s==null?[]:z(s)});ae(()=>{var s=Y(f),r=s.length;if(w&&r===0)return;w=r===0;let I=!1;if(C){var E=t.data===ne;E!==(r===0)&&(t=F(),M(t),b(!1),I=!0)}if(C){for(var p=null,T,o=0;o<r;o++){if(H.nodeType===8&&H.data===_e){t=H,I=!0,b(!1);break}var n=s[o],i=u(n,o);T=Z(H,c,p,null,n,i,o,v,e,a),c.items.set(i,T),p=T}r>0&&M(F())}C||Te(s,c,t,v,e,u,a),_!==null&&(r===0?d?U(d):d=W(()=>_(t)):d!==null&&fe(d,()=>{d=null})),I&&b(!0),Y(f)}),C&&(t=H)}function Te(l,e,a,u,v,_,t){var y,q,V,B;var c=(v&ce)!==0,A=(v&(k|L))!==0,h=l.length,d=e.items,w=e.first,f=w,s,r=null,I,E=[],p=[],T,o,n,i;if(c)for(i=0;i<h;i+=1)T=l[i],o=_(T,i),n=d.get(o),n!==void 0&&((y=n.a)==null||y.measure(),(I??(I=new Set)).add(n));for(i=0;i<h;i+=1){if(T=l[i],o=_(T,i),n=d.get(o),n===void 0){var $=f?f.e.nodes_start:a;r=Z($,e,r,r===null?e.first:r.next,T,o,i,u,v,t),d.set(o,r),E=[],p=[],f=r.next;continue}if(A&&Ie(n,T,i,v),n.e.f&g&&(U(n.e),c&&((q=n.a)==null||q.unfix(),(I??(I=new Set)).delete(n))),n!==f){if(s!==void 0&&s.has(n)){if(E.length<p.length){var R=p[0],x;r=R.prev;var O=E[0],S=E[E.length-1];for(x=0;x<E.length;x+=1)P(E[x],R,a);for(x=0;x<p.length;x+=1)s.delete(p[x]);m(e,O.prev,S.next),m(e,r,O),m(e,S,R),f=R,r=S,i-=1,E=[],p=[]}else s.delete(n),P(n,f,a),m(e,n.prev,n.next),m(e,n,r===null?e.first:r.next),m(e,r,n),r=n;continue}for(E=[],p=[];f!==null&&f.k!==o;)f.e.f&g||(s??(s=new Set)).add(f),p.push(f),f=f.next;if(f===null)continue;n=f}E.push(n),r=n,f=n.next}if(f!==null||s!==void 0){for(var N=s===void 0?[]:z(s);f!==null;)f.e.f&g||N.push(f),f=f.next;var D=N.length;if(D>0){var j=v&Q&&h===0?a:null;if(c){for(i=0;i<D;i+=1)(V=N[i].a)==null||V.measure();for(i=0;i<D;i+=1)(B=N[i].a)==null||B.fix()}Ae(e,N,j,d)}}c&&ie(()=>{var X;if(I!==void 0)for(n of I)(X=n.a)==null||X.apply()}),G.first=e.first&&e.first.e,G.last=r&&r.e}function Ie(l,e,a,u){u&k&&J(l.v,e),u&L?J(l.i,a):l.i=a}function Z(l,e,a,u,v,_,t,c,A,h){var d=(A&k)!==0,w=(A&he)===0,f=d?w?oe(v):K(v):v,s=A&L?K(t):t,r={i:s,v:f,k:_,a:null,e:null,prev:a,next:u};try{return r.e=W(()=>c(l,f,s,h),C),r.e.prev=a&&a.e,r.e.next=u&&u.e,a===null?e.first=r:(a.next=r,a.e.next=r.e),u!==null&&(u.prev=r,u.e.prev=r.e),r}finally{}}function P(l,e,a){for(var u=l.next?l.next.e.nodes_start:a,v=e?e.e.nodes_start:a,_=l.e.nodes_start;_!==u;){var t=Ee(_);v.before(_),_=t}}function m(l,e,a){e===null?l.first=a:(e.next=a,e.e.next=a&&a.e),a!==null&&(a.prev=e,a.e.prev=e&&e.e)}export{Ce as e,me as i};
