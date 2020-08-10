//to listen install event
self.addEventListener('install',event => {
    //console.log('Service Worker is installed',event);
});

//to listen activate event
self.addEventListener('activate',event => {
    //console.log('Service Worker is activated',event);
});

//fetch event
self.addEventListener('fetch',event => {
    // console.log('fetch',event);
});