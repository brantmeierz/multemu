//First code called when extension is launched
chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('index.html', {
		id:"Z80EmuId",
		outerBounds: {
			width: 800,
			height: 600,
			left: 100,
			top: 100
		}//,
		//state: "fullscreen"
	});
});