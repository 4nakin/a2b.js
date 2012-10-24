'use strict';
/** @namespace */
var A2B	= A2B 		|| {};

var ATTRACT_MODE = 1;
var MAINMENU_MODE = 2;
var LEVEL_INTRO_MODE = 3;
var LEVEL_RUNNING_MODE = 4;
var LEVEL_COMPLETE_MODE = 5;
var GAME_OVER_MODE = 6;
var GAME_COMPLETE_MODE = 7;
var ENTER_HIGHSCORE_MODE = 8;
var DISPLAY_CREDITS = 9;
var DISPLAY_HIGHSCORES = 10;

var mouse;


A2B.Game	= function(displayGraphicStats,displayGameStats)
{
	this._displayGraphicStats=displayGraphicStats;
	this._displayGameStats=displayGameStats;
	
	this._renderer=this.initRenderer();
	this._scene=this.initScene();
	this._camera=this.initCamera();
	this._cameraControls=this.initCameraControls();
	this._projector=this.initProjector();

	this.initWindowResize();
	this.initScreenshotCapability();
	this.initFullscreenCapability();
	mouse = this.initMouseMoveListener();

	this.materials = A2B.initMaterials();
	var woodMaterial = this.materials['wood'];
	this._player = new A2B.Player(woodMaterial);
	this._currentEventListener = null;

	// position camera
	this.getCamera().lookAt( this.getScene().position );
	// add camera to scene
	this.getScene().add(this.getCamera());

	if(this._displayGraphicStats)
	{
		// graphic stats
		this._graphicStats = this.initGraphicStats();
	}

	if(this._displayGameStats)
	{
		// game stats
		this._gameStats = this.initGameStats();
	}

}

/*
 * Adds player to a different location dependant on level (only one level now..)
 */
A2B.Game.prototype.addPlayerToScene = function(currentScene,levelNumber) {
	currentScene.add(this._player.getMesh());
}



A2B.Game.prototype.addWebUI = function()
{

	return;

	// this adds the WebUI components of the game, ie. the non-webGL stuff
	// on game start display window over screen with info.
	var webUIDiv, background = [[16, 16, 48], [0, 255, 255]];
    webUIDiv = document.createElement("div");
    webUIDiv.style.cursor = "pointer";
    webUIDiv.style.width = "100px";
    webUIDiv.style.opacity = "0.9";
    webUIDiv.style.zIndex = "10001";
    innerDiv = document.createElement("div");
    innerDiv.style.textAlign = 
    "left";
    innerDiv.style.lineHeight = "1.2em";
    innerDiv.style.backgroundColor = "rgb(0,0,0)";
    innerDiv.style.padding = "0 0 3px 3px";
    innerDiv.innerHTML = "info!";
    
    webUIDiv.appendChild(innerDiv);

    webUIDiv.style.position = 'absolute';
	webUIDiv.style.top = '0px';
	webUIDiv.style.zIndex = 500;
	document.getElementById( 'viewport' ).appendChild( webUIDiv );
    
}



/*
 * change current mode
 */
A2B.Game.prototype.changeMode = function(newMode)
{
	// teardown previous mode
	if (this._currentMode != undefined)
	{
		this.teardownMode();
	} 
	// set up new mode
	this._currentMode = newMode;
	this.setupMode();
}

/*
 * clear all objects from a scene, iterate through child objects
 */
A2B.Game.prototype.clearSceneObjects = function(sceneObject)
{
 	var children = sceneObject.children;
    	for(var i = children.length-1;i>=0;i--){
        	var child = children[i];
        	this.clearSceneObjects(child);
        	sceneObject.remove(child);
    };
}


A2B.Game.prototype.getCamera	= function()
{
	return this._camera;
}

A2B.Game.prototype.getCameraControls	= function()
{
	return this._cameraControls;
}

A2B.Game.prototype.getGameStats	= function()
{
	return this._gameStats;
}

A2B.Game.prototype.getGraphicStats	= function()
{
	return this._graphicStats;
}


A2B.Game.prototype.getLives	= function()
{
	return this._lives;
}

A2B.Game.prototype.getMousePosition	= function()
{
	return mouse;
}

A2B.Game.prototype.getPlayer	= function()
{
	return this._player;
}

A2B.Game.prototype.getProjector	= function()
{
	return this._projector;
}

A2B.Game.prototype.getRenderer	= function()
{
	return this._renderer;
}

A2B.Game.prototype.getScene	= function()
{
	return this._scene;
}

A2B.Game.prototype.getScore	= function()
{
	return this._score;
}

A2B.Game.prototype.initCamera = function() {

	var	camera = new THREE.PerspectiveCamera(
			35,
			window.innerWidth / window.innerHeight,
			1,
			1000
		);

	camera.position.set( 0, 50, 120 );
	
	return camera;	
};

A2B.Game.prototype.initCameraControls = function() {

	var	cameraControls	= new THREE.TrackballControls(this.getCamera());
		
	cameraControls.target.set(0,0,0);

	return cameraControls;	
};

A2B.Game.prototype.initFullscreenCapability = function() {

	// allow 'f' to go fullscreen where this feature is supported
	if( THREEx.FullScreen.available() ){
		THREEx.FullScreen.bindKey();		
		document.getElementById('inlineDoc').innerHTML	+= "- <i>f</i> for fullscreen";
	}

};



A2B.Game.prototype.initGameStats = function() {

	var	gameStats = new GameStats();
	gameStats.domElement.style.position = 'absolute';
	gameStats.domElement.style.top = '0px';
	gameStats.domElement.style.right = '0px';
	gameStats.domElement.style.zIndex = 100;
	document.getElementById( 'viewport' ).appendChild( gameStats.domElement );

	return gameStats;	

};

A2B.Game.prototype.initGraphicStats = function() {

	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	document.getElementById( 'viewport' ).appendChild( stats.domElement );

	return stats;	

};

A2B.Game.prototype.initMouseMoveListener = function() {

	var mouse = { x: 0, y: 0 };
	this.getRenderer().domElement.addEventListener( 'mousemove', this.setMousePosition );

	return mouse;
};


A2B.Game.prototype.initProjector = function() {

	var projector = new THREE.Projector;
		
	return projector;

}

A2B.Game.prototype.initRenderer = function() {

	var renderer = new THREE.WebGLRenderer({
					antialias		: true,	// to get smoother output
					preserveDrawingBuffer	: true	// to allow screenshot
				});
	renderer.setClearColorHex( 0xBBBBBB, 1 );

	renderer.setSize( window.innerWidth, window.innerHeight );
	// ground does not appear with shadows enabled?
	// can we check card capabilities?

	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	document.getElementById( 'viewport' ).appendChild( renderer.domElement );
	
	return renderer;	
};

A2B.Game.prototype.initScene = function() {

	var	scene = new Physijs.Scene;
	scene.setGravity({ x: 0, y: -20, z: 0 });	

	return scene;
}


A2B.Game.prototype.initScreenshotCapability = function() {

	// allow 'p' to make screenshot
	THREEx.Screenshot.bindKey(this.getRenderer());
	
};


A2B.Game.prototype.initWindowResize = function() {

	// transparently support window resize
	THREEx.WindowResize.bind(this.getRenderer(),this.getCamera());
	
};


/**
 * Bind a keys for running level
 */
 A2B.Game.prototype.levelRunningBindKeys	= function(opts){
 	opts		= opts		|| {};
 	var upKey	= opts.charCode	|| 'w'.charCodeAt(0);
 	var downKey	= opts.charCode	|| 's'.charCodeAt(0);
 	var leftKey	= opts.charCode	|| 'a'.charCodeAt(0);
 	var rightKey	= opts.charCode	|| 'd'.charCodeAt(0);
 	var dblclick	= opts.dblclick !== undefined ? opts.dblclick : false;
 	var element	= opts.element

	// callback to handle keypress
	var __bind	= function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	var onKeyPress	= __bind(function(event){
		// return now if the KeyPress isnt for the proper charCode
		switch(event.which)
		{
			case downKey:
				this._player.moveBackwards(this._camera.position);
				break;
			case upKey:
				this._player.moveForwards(this._camera.position);
				break;
			case leftKey:
				this._player.moveLeft(this._camera.position);
				break;
			case rightKey:
				this._player.moveRight(this._camera.position);
				break;

		}
				return;

	}, this);
		

	// listen to keypress
	// NOTE: for firefox it seems mandatory to listen to document directly
	document.addEventListener('keypress', onKeyPress, false);

	return {
		unbind	: function(){
			document.removeEventListener('keypress', onKeyPress, false);
		}
	};
}



/*
 * Initialise object in scene for current level
 */
A2B.Game.prototype.levelRunningInitScene = function(currentScene,levelNumber) {
		// init level
		/* for now EVERYTHING is level 1 */

		// add ground for scene
		///////////////////
		// Create Ground //
		///////////////////

		var ground_material = this.materials["rock"];

		var floor = new Physijs.BoxMesh(
			new THREE.CubeGeometry(100, 1, 100),
			ground_material,
			0 // mass
			);
		floor.receiveShadow = true;
		currentScene.add( floor );
		
		
		////////////////////////
		// Create Brick walls //
		////////////////////////

		// ground is 100 X 1000
		// build an inner wall

		var brick_material = this.materials["brick"];

		// front wall
		for ( var i = 0; i < 18; i++ ) {
			var brick = new Physijs.BoxMesh(
				new THREE.CubeGeometry( 4.5, 4.5, 4.5 ),
				brick_material,5000
				);
			brick.position.set(
				-45 +(i * 5) , 5+i ,45
				);
			brick.rotation.set(0,0,0);

			brick.castShadow = true;
			brick.receiveShadow = true;

			currentScene.add( brick );
			//bricks.push( brick );
		}

		// right wall
		for ( var i = 0; i < 18; i++ ) {
			var brick = new Physijs.BoxMesh(
				new THREE.CubeGeometry( 4.5, 4.5, 4.5 ),
				brick_material,5000
				);
			brick.position.set(
				45 , 5+i ,45 -(i * 5)
				);
			brick.rotation.set(0,0,0);

			brick.castShadow = true;
			brick.receiveShadow = true;
			currentScene.add( brick );
			//bricks.push( brick );
		}

		// left wall
		for ( var i = 0; i < 18; i++ ) {
			var brick = new Physijs.BoxMesh(
				new THREE.CubeGeometry( 4.5, 4.5, 4.5 ),
				brick_material,5000
				);
			brick.position.set(
				-45 , 5+i ,-45 +(i * 5)
				);
			brick.rotation.set(0,0,0);

			brick.castShadow = true;
			brick.receiveShadow = true;
			currentScene.add( brick );
			//bricks.push( brick );
		}



		// back wall
		for ( var i = 0; i < 18; i++ ) {
			var brick = new Physijs.BoxMesh(
				new THREE.CubeGeometry( 4.5, 4.5, 4.5 ),
				brick_material,5000
				);
			brick.position.set(
				+45 -(i * 5) , 5+i ,-45
				);
			brick.rotation.set(0,0,0);

			brick.castShadow = true;
			brick.receiveShadow = true;
			currentScene.add( brick );
			//bricks.push( brick );
		}


		////////////////////////
		// Create Start Block //
		////////////////////////

		var blockA_material = this.materials["blockA"];

		var	startBlock = new Physijs.BoxMesh(
			new THREE.CubeGeometry( 10, 0.1, 10 ),
			blockA_material,500
			);
		startBlock.name="startBlock";
		startBlock.position.set(
			35,
			5,
			35
			);
		startBlock.rotation.set(0,0,0);
		startBlock.castShadow = false;
		startBlock.receiveShadow = true;
		currentScene.add( startBlock );

		var blockA_material = this.materials["blockA"];


		////////////////////////
		// Create End Block //
		////////////////////////

		var blockB_material = this.materials["blockB"];

		var	endBlock = new Physijs.BoxMesh(
			new THREE.CubeGeometry( 10, 0.1, 10 ),
			blockB_material,500
			);
		endBlock.position.set(
			-35,
			5,
			-35
			);
		endBlock.name="endBlock";

		endBlock.rotation.set(0,0,0);
		endBlock.castShadow = false;
		endBlock.receiveShadow = true;

		currentScene.add( endBlock );


		var wood_material = this.materials["wood"];


	// add directional light to scene
	var dirLight = A2B.getDirectionalLight();
	dirLight.position.set( 20, 40, -15 );
	dirLight.target.position.copy( currentScene.position );

	currentScene.add( dirLight );

	// add spotlight to scene
	var spotLight = A2B.getSpotLight();
	spotLight.position.set( 20, 40, -15 );
	spotLight.target.position.copy( currentScene.position );
	//currentScene.add( spotLight );

};

/**
 * Bind a keys for main menu
 */
 A2B.Game.prototype.mainMenuModeBindKeys	= function(opts){
 	opts		= opts		|| {};
 	var goKey	= opts.charCode	|| 'g'.charCodeAt(0);
 	var element	= opts.element

	// callback to handle keypress
	var __bind	= function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	var onKeyPress	= __bind(function(event){
		// return now if the KeyPress isnt for the proper charCode
		switch(event.which)
		{
			case goKey:
				// if here game should start
				this.changeMode(LEVEL_RUNNING_MODE);
				break;

		}
				return;

	}, this);
		

	// listen to keypress
	// NOTE: for firefox it seems mandatory to listen to document directly
	document.addEventListener('keypress', onKeyPress, false);
	
	return {
		unbind	: function(){
			document.removeEventListener('keypress', onKeyPress, false);
		}
	};
}

A2B.Game.prototype.mainMenuModeInitScene = function(currentScene) {

		// add ground for scene
		var ground_material = this.materials["rock"];

		var floor = new Physijs.BoxMesh(
			new THREE.CubeGeometry(100, 1, 100),
			ground_material,
			0 // mass
			);
		floor.receiveShadow = true;
		currentScene.add( floor );

		var wood_material = this.materials["wood"];

		var fontProps = A2B.initFontProps();
		// create A2B title mesh
		var a2bMesh = A2B.createTextMesh("A2B",wood_material,fontProps);
		// scale
		a2bMesh.scale = new THREE.Vector3(0.2,0.2,0.2);
		// position
		a2bMesh.position = new THREE.Vector3(-15,5,10);
		a2bMesh.rotation = new THREE.Vector3(A2B.degreesToRadians(-30),0,0);
		a2bMesh.castShadow = true;
		a2bMesh.receiveShadow = true;
		currentScene.add( a2bMesh );

		// create by Telecoda mesh
		var fontProps = A2B.initFontProps();
		fontProps.bend= false;
		fontProps.size=25;
		var telecodaMesh = A2B.createTextMesh("by Telecoda",wood_material,fontProps);
		// scale
		telecodaMesh.scale = new THREE.Vector3(0.2,0.2,0.2);
		// position
		telecodaMesh.position = new THREE.Vector3(-15,5,30);
		telecodaMesh.rotation = new THREE.Vector3(A2B.degreesToRadians(-60),0,0);
		telecodaMesh.castShadow = true;
		telecodaMesh.receiveShadow = true;
		currentScene.add( telecodaMesh );

		// create by start mesh
		var start_material = this.materials["brick"];

		var fontProps = A2B.initFontProps();
		fontProps.bend= false;
		fontProps.size=25;
		var startMesh = A2B.createTextMesh("Start Game!",start_material,fontProps);
		// scale
		startMesh.scale = new THREE.Vector3(0.2,0.2,0.2);
		// position
		startMesh.position = new THREE.Vector3(-15,5,50);
		startMesh.rotation = new THREE.Vector3(A2B.degreesToRadians(-90),0,0);
		startMesh.material.color.setHex(0x0000ff);

		startMesh.castShadow = true;
		startMesh.receiveShadow = true;
		currentScene.add( startMesh );

		//var mc = THREE.CollisionUtils.MeshColliderWBox(startMesh);
		//THREE.Collisions.colliders.push( mc );
	

		
		//var text = new Physijs.Mesh(text_geo
		//	,
		//	wood_material,
		//	0 // mass
		//	);
		
	

	// add directional light to scene
	var dirLight = A2B.getDirectionalLight();
	dirLight.position.set( 20, 40, 25 );
	dirLight.target.position.copy( currentScene.position );

	currentScene.add( dirLight );

	

};




/*
 This function will initialise the scene and controls for the current mode
 */
A2B.Game.prototype.setupMode = function()
{
	switch(this._currentMode)
	{
		case MAINMENU_MODE:
			this.mainMenuModeInitScene(this._scene);
			this._currentEventListener = this.mainMenuModeBindKeys();
			break;
		case LEVEL_RUNNING_MODE:
			this.levelRunningInitScene(this._scene,this._level);
			this._currentEventListener =this.levelRunningBindKeys(this._renderer);
			this._playerMesh = this.addPlayerToScene(this._scene,this._level);
			break;

	}
	/*
	this.initLevel(this._level,this._scene);
	this._playerMesh = this.addPlayerToScene(this._level,this._scene);
	this.bindKeys(this._renderer);
*/

}

A2B.Game.prototype.setMousePosition = function( evt ) {
		// Find where mouse cursor intersects the ground plane
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

};

A2B.Game.prototype.startGame = function()
{
		// to store the current state
	this._level=1;
	this._lives=3;
	this._score=0;

	this.changeMode(MAINMENU_MODE);
	//this.changeMode(LEVEL_RUNNING_MODE);

}

/*
 This function will tidys up anything for current mode
 */
A2B.Game.prototype.teardownMode = function()
{
	this._currentEventListener.unbind();
	//this._scene.remove();
	this.clearSceneObjects(this._scene);

	switch(this._currentMode)
	{
		case MAINMENU_MODE:
			//this.mainMenuModeUnbindKeys();
			break;
		case LEVEL_RUNNING_MODE:
			//this.levelRunningUnbindKeys();
			break;

	}
}



