/* Стара адреса ariadna-map.github.io: прибираємо офлайн-копію старої карти і відкриваємо нову адресу. 23.11.2026 */
self.addEventListener("install",function(e){self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.map(function(n){return caches.delete(n)}))}).then(function(){return self.registration.unregister()}).then(function(){return self.clients.matchAll({type:"window"})}).then(function(cs){cs.forEach(function(c){c.navigate(c.url)})}))});
