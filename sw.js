// Guía La Palma: funciona sin cobertura con lo ya visto.
const V='lp-v2';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(new Request(u,{mode:u.startsWith('http')?'cors':'same-origin'})))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>!k.startsWith(V)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function trim(name,max){const c=await caches.open(name);const ks=await c.keys();for(let i=0;i<ks.length-max;i++)await c.delete(ks[i])}
async function netFirst(req,name){const c=await caches.open(name);try{const r=await fetch(req);if(r&&r.ok)c.put(req,r.clone());return r}catch(e){const m=await c.match(req,{ignoreSearch:false});if(m)return m;throw e}}
async function cacheFirst(req,name,max){const c=await caches.open(name);const m=await c.match(req);if(m)return m;const r=await fetch(req);if(r&&(r.ok||r.type==='opaque')){c.put(req,r.clone());if(max)trim(name,max)}return r}
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);
 if(u.origin===location.origin){e.respondWith(netFirst(req,V).catch(()=>caches.match('./index.html')));return}
 if(u.hostname.endsWith('tile.openstreetmap.org')){e.respondWith(cacheFirst(req,V+'-tiles',600));return}
 if(u.hostname==='api.open-meteo.com'||u.hostname==='router.project-osrm.org'||u.hostname==='routing.openstreetmap.de'){e.respondWith(netFirst(req,V+'-data'));return}
 if(u.hostname==='unpkg.com'||u.hostname.includes('fonts.g')){e.respondWith(cacheFirst(req,V));return}
});
