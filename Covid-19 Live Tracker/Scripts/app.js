if('serviceWorker' in navigator)
{
    navigator.serviceWorker.register('./service-worker.js')
    .then((reg) => console.log('service worker is registered',reg))
    .catch((err) => console.log('service worker is not registered',err));
}

// Detects if device is on iOS 
const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test( userAgent );
}
// Detects if device is in standalone mode
const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

// Checks if should display install popup notification:
if (isIos() && !isInStandaloneMode()) {
    //this.setState({ showInstallMessage: true });
}

setTimeout(function(){
	location=''
},300*1000);
