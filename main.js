SCG.start = function(){

	if(!SCG.canvasBg){

		SCG.canvasBg = appendDomElement(
			document.body, 
			'canvas',
			{ 
				width : SCG.viewfield.width,
				height: SCG.viewfield.height,
				id: SCG.canvasBgId,
				css: {
					'z-index': 0,
					'position': 'absolute'
				}
			}
		);

		SCG.contextBg = SCG.canvasBg.getContext('2d');
		SCG.contexts['contextBg'] = SCG.contextBg;
	}

	if(!SCG.canvas)
	{
		SCG.canvas = appendDomElement(
			document.body, 
			'canvas',
			{ 
				width : SCG.viewfield.width,
				height: SCG.viewfield.height,
				id: SCG.canvasId,
				css: {
					'z-index': 1,
					'position': 'absolute'
				}
			}
		);

		SCG.context = SCG.canvas.getContext('2d');
		SCG.contexts['context'] = SCG.context;

	}

	if(!SCG.canvasUI){

		SCG.canvasUI = appendDomElement(
			document.body, 
			'canvas',
			{ 
				width : SCG.viewfield.width,
				height: SCG.viewfield.height,
				id: SCG.canvasUIId,
				css: {
					'z-index': 2,
					'position': 'absolute'
				}
			}
		);

		SCG.contextUI = SCG.canvasUI.getContext('2d');
		SCG.contexts['contextUI'] = SCG.contextUI;
	}

	SCG.initializer(function(){
		if(SCG.space == undefined)
		{
			SCG.space = {
				width: SCG.viewfield.default.width,
				height: SCG.viewfield.default.height
			}
		}

		SCG.viewfield.current = new Box(new Vector2,new Vector2(SCG.viewfield.width,SCG.viewfield.height));		

		SCG.customInitialization();

		SCG.gameControls.orientationChangeEventInit();

		SCG.UI.invalidate();

		if(SCG.audio){
			SCG.audio.init();	
		}
	
		SCG.animate();
	});
}

SCG.preMainWork = function(){}

SCG.afterMainWork = function(){}

SCG.animate = function() {
    SCG.draw();
    requestAnimationFrame( SCG.animate );   
}

SCG.draw = function(){
	if(SCG.scenes.activeScene == undefined || SCG.scenes.activeScene.go == undefined){
		throw 'Active scene corrupted!';
	}

	var now = new Date;

	SCG.gameLogics.doPauseWork(now);

	//SCG.gameControls.mousestate.doClickCheck();

	var as = SCG.scenes.activeScene;

	if(as.preMainWork && isFunction(as.preMainWork)){
		as.preMainWork();	
	}
	
	SCG.gameControls.camera.update(now);

	
	if(as.unshift.length > 0){
		for(var ui=0;ui<as.unshift.length;ui++){
			as.go.unshift(as.unshift[ui]);
		}
		as.unshift = [];
	}
	var i = as.go.length;
	while (i--) {
		as.go[i].update(now);
		as.go[i].render();

		if(SCG.frameCounter && as.go[i].renderPosition!=undefined){
			SCG.frameCounter.visibleCount++;
		}

		if(!as.go[i].alive){
			var deleted = as.go.splice(i,1);
		}
	}

	if(as.afterMainWork && isFunction(as.afterMainWork)){
		as.afterMainWork();	
	}

	if(SCG.gameLogics.isPausedStep)
	{
		SCG.gameLogics.isPausedStep =false;
	}

	if(SCG.frameCounter){
		SCG.frameCounter.doWork(now);
	}

	if(SCG.audio){
		SCG.audio.update(now);	
	}
}
