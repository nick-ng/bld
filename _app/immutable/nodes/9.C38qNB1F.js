import{c as Mt,a as y,t as j}from"../chunks/disclose-version.B8QbxXjI.js";import"../chunks/legacy.CrZcupGR.js";import{a7 as Y,af as X,ag as Z,f as Ot,$ as t,a9 as tt,ac as b,ab as e,a0 as de,c as r,r as a,ae as Q,a8 as I,s as n,u as Tt,aK as ce,aa as At}from"../chunks/runtime.DZJACTxD.js";import{i as H}from"../chunks/if.DQBGKmmp.js";import{i as et}from"../chunks/lifecycle.BzJg6XKv.js";import{s as yt,a as B,d as fe,b as ue}from"../chunks/store.B5jiF3DM.js";import{p as me}from"../chunks/stores.Dr8N-BjA.js";import{e as E}from"../chunks/events.Ub1lZ4ps.js";import{e as Wt,i as Ht}from"../chunks/each.CivPtcBz.js";import{s as L,r as F,a as K}from"../chunks/attributes.CF6vsAEu.js";import{b as G,a as qt,c as ve}from"../chunks/input.Bi5EyNp6.js";import{o as Bt}from"../chunks/index-client.DsC2H4KM.js";import{g as Kt}from"../chunks/entry.DEQ-zinE.js";import{s as V}from"../chunks/render.iUWC1tG-.js";import{p as J}from"../chunks/props.BcXfgcJ5.js";import{g as pe,i as bt,d as zt,b as xt,l as he,a as ge,u as _e,e as be,j as xe,p as ye,h as we,k as Se}from"../chunks/flash-cards.DEslqNEc.js";import{F as Dt}from"../chunks/constants.9kFhJWVb.js";import{b as Ce}from"../chunks/this.CThV2HMQ.js";import{I as ke,q as Rt}from"../chunks/image.BqVVA2TQ.js";import{C as Pe}from"../chunks/corners.B22wlIRl.js";var Ie=j('<div class="bg-gray-500 text-center no-underline p-0 border border-gray-500 cursor-not-allowed hidden lg:block"><div class="text-gray-500 uppercase p-0 mb-1 leading-none"> </div> <div class="h-2 px-0.5 pb-0.5"></div></div>'),je=j('<div class="rounded-full block flex-1"></div>'),$e=j('<a class="relative block bg-white text-center no-underline border p-0 border-gray-800"><div class="uppercase p-0 mb-1 leading-none"> </div> <div class="h-2 flex flex-row justify-center gap-0.5 px-0.5 pb-0.5"></div></a>');function Fe(q,S){Y(S,!1);const C=yt(),m=()=>B(xt,"$flashCardStore",C),v=b();let d=J(S,"letterPair",8,""),f=J(S,"hideNonOP",8,!0),k=J(S,"hideNon3Style",8,!0);const P=(p,h)=>{const s=h[p];return[!(s!=null&&s.memo)&&"#ff0000ff",!(s!=null&&s.commutator)&&"#00aa00ff",!(s!=null&&s.image)&&"#0000ffff"]};X(()=>(de(d()),bt),()=>{e(v,!zt(d())&&!bt(d()))}),Z(),et();var l=Mt(),w=Ot(l);{var $=p=>{var h=Ie(),s=r(h),x=r(s,!0);a(s),Q(2),a(h),I(()=>V(x,d())),y(p,h)},N=p=>{var h=$e(),s=r(h),x=r(s,!0);a(s);var z=n(s,2);Wt(z,5,()=>P(d(),m()),Ht,(U,o)=>{var _=je();I(()=>L(_,"style",`background-color: ${t(o)||"#ffffff00"};}`)),y(U,_)}),a(z),a(h),I(()=>{L(h,"href",`/flash-cards/edit?lp=${d()}`),V(x,d())}),y(p,h)};H(w,p=>{pe(d())||t(v)||k()&&!bt(d())||f()&&!zt(d())?p($):p(N,!1)})}y(q,l),tt()}var Ee=j('<div class="lg:w-min m-auto"><div class="flex flex-row justify-between items-end"><a href="/flash-cards">Back</a> <h1>Edit Flash Cards</h1> <div></div></div> <div class="flex flex-row gap-2"><form class="mb-1"><label class="block">Filter: <input type="text" autocomplete="off"></label></form> <label>Hide Non-3-Style Pairs: <input type="checkbox"></label> <label>Hide Non-OP Pairs: <input type="checkbox"></label></div> <div class="letterPairGrid svelte-oi5x1"></div></div>');function Le(q,S){Y(S,!1);let C=[],m=b(""),v=b(!1),d=b(!1),f=b(!1);const k=97;for(let o=0;o<24;o++)for(let _=0;_<24;_++){const R=String.fromCodePoint(k+o),D=String.fromCodePoint(k+_);C.push(`${R}${D}`)}const P=(o,..._)=>{if(!o)return;const R=_.map(D=>D?"t":"f").join("");localStorage.setItem(Dt,R)};Bt(()=>{const o=localStorage.getItem(Dt);o&&(e(v,o[0]==="t"),e(d,o[1]==="t")),e(f,!0)}),X(()=>(t(f),t(v),t(d)),()=>{P(t(f),t(v),t(d))}),Z(),et();var l=Ee(),w=n(r(l),2),$=r(w),N=r($),p=n(r(N));F(p),a(N),a($);var h=n($,2),s=n(r(h));F(s),a(h);var x=n(h,2),z=n(r(x));F(z),a(x),a(w);var U=n(w,2);Wt(U,5,()=>C.filter(o=>t(m).trim()?o.startsWith(t(m)):!0),Ht,(o,_)=>{Fe(o,{get letterPair(){return t(_)},get hideNon3Style(){return t(v)},get hideNonOP(){return t(d)}})}),a(U),a(l),G(p,()=>t(m),o=>e(m,o)),E("submit",$,o=>{o.preventDefault();const _=t(m).trim().toLowerCase();_.length===2&&C.includes(_)&&Kt(`/flash-cards/edit/${_}`)}),qt(s,()=>t(v),o=>e(v,o)),qt(z,()=>t(d),o=>e(d,o)),y(q,l),tt()}var Ne=j('<div class="text-center"> </div>'),Ue=j('<div>Emoji</div> <div class="line-through">Image</div>',1),Te=j('<div>Image</div> <div class="line-through">Emoji</div>',1),Ae=j('<input class="w-full" type="text" autocomplete="off" name="emoji">'),qe=j('<input class="max-w-64" type="file" name="image" alt="Choose Image" accept="image/*">'),ze=j('<form><input type="hidden" name="lastQuizUnix"> <input type="hidden" name="confidence"> <table class="flash-card-editor border-separate border-spacing-x-0.5 mx-auto svelte-84dch2"><tbody><tr><td class="text-right svelte-84dch2">Memo</td><td class="svelte-84dch2"><input class="w-full" type="text" autocomplete="off" name="memo"></td></tr><tr><td class="text-right svelte-84dch2"><a target="pux_blddb_corner_comm">Commutator</a></td><td class="svelte-84dch2"><input class="w-full" type="text" autocomplete="off" name="commutator"></td></tr><tr><td class="text-right svelte-84dch2"><button type="button" class="button-default ml-auto"><!></button></td><td class="svelte-84dch2"><input type="hidden" name="imageUrl"> <!> <label class="mx-auto mt-0.5 block"><!></label></td></tr><tr><td class="text-right svelte-84dch2">Tags</td><td class="svelte-84dch2"><input class="w-full" type="text" autocomplete="off" name="tags"></td></tr></tbody></table> <div class="w-full flex flex-row justify-between mt-1 gap-8"><a class="button-default flex-grow text-center">Back</a> <button class="flex-grow" type="button">Reset</button> <button class="flex-grow">Save</button></div></form>'),De=j('<div class="max-w-prose mx-auto"><a>Back</a> <h2 class="uppercase text-center"> </h2> <div class="text-center mb-1"><!></div> <!></div>');function Re(q,S){Y(S,!1);const C=yt(),m=()=>B(xt,"$flashCardStore",C),v=()=>B(Rt,"$quizStore",C),d=()=>B(ge,"$flashCardStoreStatus",C);let f=J(S,"letterPair",8,""),k=b(),P=b(null),l=b(!1),w=b(""),$=b(""),N=b(""),p=b(""),h=b(""),s=b(""),x=b(!1);const z=()=>{switch(Se()){case"win":return"Win + . or Win + ;";case"mac":return"Control + Command + Space";default:return"Enter an Emoji"}},U=(g,i)=>g[i]||we(i),o=g=>{if(!t(l)){const i=U(g,f());e(w,i.memo),e($,i.commutator),e(N,i.tags),e(s,i.image),i.image.endsWith(".emoji")?(e(x,!0),e(p,i.image.replace(/\.emoji$/,""))):e(h,i.image)}},_=(g,i)=>i.endsWith(".emoji")?i:g&&g.length>0?window.URL.createObjectURL(g[0]):i,R=()=>{o(m()),t(P)&&(ce(P,t(P).value=""),e(k,null))};Bt(()=>{const g=new AbortController;let i=!1;return(async()=>(await he(f(),g.signal),i=!0))(),()=>{i||g.abort()}}),X(()=>m(),()=>{o(m())}),Z(),et();var D=De(),wt=r(D),at=n(wt,2),Qt=r(at,!0);a(at);var rt=n(at,2),Gt=r(rt);Pe(Gt,{get letterPair(){return f()}}),a(rt);var Jt=n(rt,2);{var Vt=g=>{var i=Ne(),M=r(i,!0);I(()=>V(M,_e(d().message))),a(i),y(g,i)},Yt=g=>{var i=ze(),M=r(i);F(M),I(()=>K(M,U(m(),f()).lastQuizUnix));var st=n(M,2);F(st),I(()=>K(st,U(m(),f()).confidence));var ot=n(st,2),St=r(ot),it=r(St),Ct=n(r(it)),lt=r(Ct);F(lt),a(Ct),a(it);var nt=n(it),dt=r(nt),Xt=r(dt);a(dt);var kt=n(dt),ct=r(kt);F(ct),a(kt),a(nt);var ft=n(nt),ut=r(ft),mt=r(ut),Zt=r(mt);{var te=c=>{var u=Ue();Q(2),y(c,u)},ee=c=>{var u=Te();Q(2),y(c,u)};H(Zt,c=>{t(x)?c(te):c(ee,!1)})}a(mt),a(ut);var Pt=n(ut),vt=r(Pt);F(vt);var It=n(vt,2);{var ae=c=>{var u=Ae();F(u),I(()=>L(u,"placeholder",z())),I(()=>{L(u,"id",`${f()}-image`),K(u,t(p))}),E("input",u,T=>{e(l,!0),e(p,T.currentTarget.value),e(s,`${t(p)}.emoji`)}),y(c,u)},re=c=>{var u=qe();Ce(u,T=>e(P,T),()=>t(P)),I(()=>L(u,"id",`${f()}-image`)),ve(u,()=>t(k),T=>e(k,T)),E("change",u,()=>{e(l,!0)}),y(c,u)};H(It,c=>{t(x)?c(ae):c(re,!1)})}var pt=n(It,2),se=r(pt),oe=At(()=>_(t(k),t(s))),ie=At(()=>`${f().toUpperCase()} visualisation`);ke(se,{get imageUri(){return t(oe)},get alt(){return t(ie)}}),a(pt),a(Pt),a(ft);var jt=n(ft),$t=n(r(jt)),ht=r($t);F(ht),a($t),a(jt),a(St),a(ot);var Ft=n(ot,2),Et=r(Ft),le=n(Et,2);Q(2),a(Ft),a(i),I(()=>{L(Xt,"href",`https://blddb.net/corner.html?letter-pair=c${f()}`),K(vt,t(s)),L(pt,"for",`${f()}-image`),L(Et,"href",v().length>0?"/quiz":"/flash-cards/edit")}),G(lt,()=>t(w),c=>e(w,c)),E("change",lt,()=>{e(l,!0)}),G(ct,()=>t($),c=>e($,c)),E("change",ct,()=>{e(l,!0)}),E("click",mt,()=>{e(l,!0),t(x)?(e(x,!1),e(s,t(h))):(e(x,!0),e(s,`${t(p)}.emoji`))}),G(ht,()=>t(N),c=>e(N,c)),E("change",ht,()=>{e(l,!0)}),E("click",le,()=>{t(l)&&(e(l,!1),R())}),E("submit",i,async c=>{c.preventDefault(),e(l,!1);const u=new FormData,T=[...c.currentTarget];for(let O=0;O<T.length;O++){const A=T[O];if(A instanceof HTMLInputElement){const W=A.getAttribute("name"),ne=A.getAttribute("type");if(!W||!ne)continue;switch(A.getAttribute("type")){case"file":{const _t=A.files;if(!_t)break;const Ut=_t[_t.length-1];if(!Ut)break;u.set(W,Ut);break}default:u.set(W,A.value)}}}const Lt=await be(xe("flash-cards",f()),{method:"PUT",body:u});if(!Lt)return;const Nt=await Lt.json(),gt=ye(Nt);if(gt.isValid){const{data:O}=gt;fe(xt,Tt(m)[gt.data.letterPair]={...O,fetchedAtMs:Date.now()},Tt(m));const A=v().length>0?"/quiz":"/flash-cards/edit";ue(Rt,v().filter(W=>W!=f())),Kt(A)}else console.error("wrong",Nt)}),y(g,i)};H(Jt,g=>{d().status!=="loaded"?g(Vt):g(Yt,!1)})}a(D),I(()=>{L(wt,"href",v().length>0?"/quiz":"/flash-cards/edit"),V(Qt,f())}),y(q,D),tt()}function la(q,S){Y(S,!1);const C=yt(),m=()=>B(me,"$page",C),v=b();X(()=>m(),()=>{e(v,m().url.searchParams.get("lp"))}),Z(),et();var d=Mt(),f=Ot(d);{var k=l=>{Re(l,{get letterPair(){return t(v)}})},P=l=>{Le(l,{})};H(f,l=>{var w;((w=t(v))==null?void 0:w.length)==2?l(k):l(P,!1)})}y(q,d),tt()}export{la as component};