function konamicode(){
	var konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
	var index = 0;

	var saved_keydown = function(e){
		var keyCode = e.keyCode;
		if(index == konamiSequence.length - 1 && keyCode == konamiSequence[index]){
			console.log("website under construction. fun games coming soon.")
			window.location.href = "https://la-oey.github.io/konami.html"
		}
		else if(keyCode == konamiSequence[index]){
			index += 1;
		} else{
			index = 0;
			document.onkeydown = null;
			setTimeout(function(){
				document.onkeydown = saved_keydown;
			}, 3000);
		}
	}
	document.onkeydown = saved_keydown;
}