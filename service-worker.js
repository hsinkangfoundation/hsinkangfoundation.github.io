const CACHE_VERSION="senior-plate-20260808-v1";
const CORE_CACHE=`${CACHE_VERSION}-core`;
const RUNTIME_CACHE=`${CACHE_VERSION}-runtime`;
const CORE_ASSETS=[
  "./",
  "./index.html",
  "./site.webmanifest",
  "./assets/site-foundation.css?v=20260808",
  "./assets/site-base.css?v=20260808",
  "./assets/site-overrides.css?v=20260808",
  "./assets/hkfce-logo.svg",
  "./assets/four-seasons-plate-visual.webp",
  "./assets/meal-table-bg-v2.webp",
  "./assets/app-icon-192.png",
  "./assets/app-icon-512.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CORE_CACHE).then(cache=>cache.addAll(CORE_ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>!key.startsWith(CACHE_VERSION)).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);

  if(request.mode==="navigate"){
    event.respondWith(fetch(request).then(response=>{
      const copy=response.clone();
      caches.open(RUNTIME_CACHE).then(cache=>cache.put("./index.html",copy));
      return response;
    }).catch(()=>caches.match("./index.html")));
    return;
  }

  if(url.origin!==self.location.origin)return;
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(RUNTIME_CACHE).then(cache=>cache.put(request,copy))}
    return response;
  })));
});
