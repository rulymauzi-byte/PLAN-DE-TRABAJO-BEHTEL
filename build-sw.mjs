import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
const root='dist';const walk=directory=>fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
const files=walk(root).filter(file=>!['config.json','sw.js','demo-plan.json'].includes(path.basename(file))&&!path.relative(root,file).split(path.sep).includes('data')).map(file=>path.relative(root,file).split(path.sep).join('/'));
const digest=createHash('sha256');for(const file of files)digest.update(fs.readFileSync(path.join(root,file)));const version=digest.digest('hex').slice(0,14);
const worker=String.raw`
const PREFIX='mauzi-'+encodeURIComponent(self.registration.scope)+'-';const CACHE=PREFIX+'__VERSION__';const FILES=__FILES__;
const local=file=>new URL(file,self.registration.scope).href;
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(local))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 if(request.mode==='navigate'){event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;}).catch(()=>caches.match(request).then(cached=>cached||caches.match(local(url.pathname.endsWith('editor.html')?'editor.html':'index.html')))));return;}
 if(url.pathname.includes('/data/')){event.respondWith(fetch(request,{cache:'no-store'}).catch(()=>new Response('{"error":"Sin conexión"}',{status:503,headers:{'Content-Type':'application/json'}})));return;}
 if(url.pathname.endsWith('/config.json')){event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;}).catch(()=>caches.match(request)));return;}
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));
});
self.addEventListener('push',event=>{event.waitUntil((async()=>{let payload={};try{payload=event.data.json();}catch{}const data=payload.data||payload.notification||payload;
 let url=local('./');try{const target=new URL(data.url||url);if(target.origin===self.location.origin&&target.href.startsWith(self.registration.scope))url=target.href;}catch{}
 await self.registration.showNotification(data.title||'Mauzi Plan',{body:data.body||'Tiene una actividad de Iglesia Bethel.',icon:local('icons/icon-192.png'),badge:local('icons/icon-192.png'),tag:data.tag||'mauzi-plan',data:{url},vibrate:[180,80,180],silent:false});})());});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const url=event.notification.data?.url||local('./');const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of windows){if(client.url.startsWith(self.registration.scope)){await client.navigate(url);return client.focus();}}return self.clients.openWindow(url);})());});
`;
fs.writeFileSync(path.join(root,'sw.js'),worker.replace('__VERSION__',version).replace('__FILES__',JSON.stringify(files)));
console.log('PWA preparada con '+files.length+' archivos locales.');
