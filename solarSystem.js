// horizon system ids
var camera, scene, renderer;
var texture = new THREE.TextureLoader().load( '/static/eave/data/circle5.png' );
planetsIds = [
    10, //sun
    199, //mercury
    299, //venus
    399, //earth
    499, //mars

    599, //saturn
    699, //jupiter
    799, //uranus
    899, //neptune
]
planetNames = [
    'sun',
    'mercury',
    'venus',
    'earth',
    'mars',

    'saturn',
    'jupiter',
    'uranus',
    'nepture'
]
//rgb
planetColors = [
    [0.9,0.9,0.4],
    [0.9,0.6,0.3],
    [0.8,0.3,0.8],
    [0.3,0.7,0.9],
    [0.9,0.3,0.7],

    [0.6,0.6,0.5],
    [0.8,0.5,0.4],
    [0.3,0.7,0.8],
    [0.2,0.6,0.9]
]
let quat180y = new THREE.Quaternion().setFromEuler(new THREE.Euler( 0, Math.PI, 0, 'XYZ' ))
let clock = new THREE.Clock();
let rotateSpeed = 2

// grab labelling code

planetaryObjs = {}
planetTags = []
requestLocation = (planet, startDate = '2022-01-01', endDate = '2022-01-02')=>{
    // cors proxy !!NEVER USE AN EXTERNAL CORS PROXY WITH PRIVATE DATA.
    return fetch(`https://salty-fjord-76866.herokuapp.com/https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=%27${
        planet}%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTOR%27&CENTER=%2710%27&START_TIME=%27${
        startDate}%27&STOP_TIME=%27${
        endDate}%27&STEP_SIZE=%271%20d%27
    `,{
        method:'GET',
        mode:'cors',  
        headers: {
            'X-Requested-With':'XMLHttpRequest',
            'Content-Type': 'text/plain',
        }}
    ).then(x=>x.json()).then(x=>{
        stringVec = x.result.split('$$EOE')[0].split('$$SOE')[1].split('\n')
        let posVecs
        posVecs = []
        for(let i=2; i<stringVec.length; i+=4){
            let string = stringVec[i].split('=')
            posVecs.push([parseFloat(string[1]),parseFloat(string[2]),parseFloat(string[3])])
        }
        planetaryObjs[planet] = posVecs
        return posVecs
    }) 
}
let northAngle = 0
let accelVec;
startGps = (freq = 5000)=> {
    console.log('starting GPS')
    navigator.geolocation.watchPosition( 
        position => {
            longitude = position.coords.longitude;
            latitude = position.coords.latitude
        }, error => {
            alert(`GPS listen error: code ${error}`);
        }, {
            enableHighAccuracy: true,
            maximumAge: freq
        }
    );
}

// request all locations
newDate = new Date()
startDateStr= `${newDate.getFullYear()}-${newDate.getUTCMonth()+1}-${newDate.getUTCDate()}`
endDateStr= `${newDate.getFullYear()}-${newDate.getUTCMonth()+1}-${newDate.getUTCDate()+1}`
// To do revise (starts at january 1st 2000)
rotationICRFToEarthAngle = (Math.PI*2*(newDate.getUTCHours()+newDate.getUTCMinutes()/60)-12)/24
latitude = 50.4452
longitude = -104.6189
//   angle between x and magnetic north
scale = 149597870.7*5 //5 au = 1 meter
// test alignment after each transformation
//this won't actually work (setTimeout are not the objects in the list not a list of promises.
allRequests = Promise.all(planetsIds.map((x,i)=>new Promise(res=>setTimeout(()=>res('finishedWaiting'),200*i)).then(prom=>requestLocation(x, startDateStr, endDateStr))))
allRequests.then(x=>{
    let locations = Object.values(planetaryObjs).map(x=>new THREE.Vector3(...x[0].map(x=>x/scale)))
    // apply translations to earth STEP1 
    console.log(JSON.stringify(locations.map(x=>x.clone().toArray())))
    // is this doing what I think it is?
    rotationICRFToEarth = new THREE.Matrix4().makeRotationAxis ( new THREE.Vector3(0,0,1), -rotationICRFToEarthAngle )
    console.log(rotationICRFToEarth)
    locations.forEach(vec=>{vec.applyMatrix4(rotationICRFToEarth)})
    console.log(locations.map(x=>x.clone()))
    var light;
    var measures = []
    var accelMeasures = []
    var room = {}; // so that 'room.visible' does cause a crash
    function init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.001, 10 );
	    camera.position.x = -1
	    renderer = new THREE.WebGLRenderer( { antialias: true } );
	    renderer.setPixelRatio( window.devicePixelRatio );
    	renderer.setSize( window.innerWidth, window.innerHeight );
    	renderer.xr.enabled = true;
    	// renderer.gammaOutput = true;
    	document.body.appendChild( renderer.domElement );
    	window.addEventListener( 'resize', onWindowResize, false );
    }
    function setupSensors(){
	    let magSensor = new Magnetometer({frequency: 10});
        let finalTransforms = ()=>{
            // apply latitude and longitude  STEP3
            let phi = Math.PI*(90-latitude)/180
            let theta = Math.PI*(longitude+180)/180
            console.log(phi)
            console.log(theta)
            longRot = new THREE.Matrix4().makeRotationAxis ( new THREE.Vector3(0,0,1), -theta )
            latRot = new THREE.Matrix4().makeRotationAxis ( new THREE.Vector3(0,1,0), -phi )
            
            locations.forEach(vec=>vec.applyMatrix4(latRot).applyMatrix4(longRot))
            console.log(locations.map(x=>x.clone()))
            console.log(JSON.stringify(locations.map(x=>x.clone().toArray())))
            // translate earth raduis upwards (is this unnecessary)
            // Magnetic Rotation time delay issue? no there shouldn't be?
            
            // console.log(locations.map(x=>x.clone()))

            // There could be a translation upwards of 6000km (earths raduis?) Does it matter?
            console.log(northAngle)
            magneticRotation = new THREE.Matrix4().makeRotationAxis ( new THREE.Vector3(0,1,0), -northAngle )

            // swap axis
            locations.forEach(vec=> {
                let tmp = vec.y;
                vec,x = -vec.x
                vec.y = vec.z;
                vec.z = -tmp;
            } )
            console.log(JSON.stringify(locations.map(x=>x.clone().toArray())))
            locations.forEach(vec=>vec.applyMatrix4(magneticRotation))
            console.log(locations.map(x=>x.clone()))
            light = new THREE.PointLight( 0xffffff, 1 );
	        light.distance = 2;
	        var particles = locations.length-1;
	        var geometry = new THREE.BufferGeometry();
	        var positions = new Float32Array( particles * 3 );
	        var colors = new Float32Array( particles * 3 );
	        var sizes = new Float32Array( particles );
	        for ( var i = 0, i3 = 0; i < particles; i ++, i3 += 3 ) {
		        positions[ i3 + 0 ] = locations[ i ].x;
		        positions[ i3 + 1 ] = locations[ i ].y;
		        positions[ i3 + 2 ] = locations[ i ].z;
	        	colors[ i3 + 0 ] = planetColors[ i ][ 0 ];
	        	colors[ i3 + 1 ] = planetColors[ i ][ 1 ];
	        	colors[ i3 + 2 ] = planetColors[ i ][ 2 ];
	        	sizes[ i ] = 0.05;
                planetTag = new TextCanvas({
                    string: planetNames[i],
                    fontsize: 300,
                    loc1:[locations[ i ].x,
                        locations[ i ].y,
                        locations[ i ].z],
                    loc2:[0.1,0.1,0.1],
                    geotype: {'canvasDepth':0.0, 'canvasHeight':0.25, 'scaleCanvas':0.1}
                    })
                planetTag.update()
                scene.add(planetTag.plane)
                planetTags.push(planetTag)
	        }
	        geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	        geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	        geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
	        var baseColor = new THREE.Color(0xffffff );
	        // Sprites
	        var uniforms = {
	        	color:     { value: baseColor },
	        	tex:   { value: texture }
	        };
	        var shaderMaterial = new THREE.ShaderMaterial( {
	        	uniforms:       uniforms,
	        	vertexShader:  document.getElementById( 'vertexshader' ).textContent,
	        	fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
	        	depthTest:   true,
	        	transparent:   true,
	        	opacity: 0.5,
	        	depthWrite: true,
	        });
	        var particleSystem = new THREE.Points( geometry, shaderMaterial );
	        scene.add( particleSystem );
        }
        magSensor.addEventListener('reading', e => {//y is north
             // save point
            let localMeasure= new THREE.Vector3(
               magSensor.x,
               magSensor.y,
               magSensor.z
            )
            var targetQuaternion = camera.quaternion.clone().normalize()
            let magField = localMeasure.applyQuaternion(targetQuaternion)
            if(measures.length==77){//calibrate for background magnetic field
	        	let average = [0,0,0]
	        	for(let i=25; i<=75; i++){
	        		  average[0]+=measures[i].x
	        		  average[1]+=measures[i].y
	        		  average[2]+=measures[i].z
	        	}
	        	magneticNorth = new THREE.Vector3(average[0]/50,average[1]/50,average[2]/50)
                // console.log(magneticNorth.clone())
                // console.log(accelVec.clone())
                // magneticNorth.cross(accelVec).cross(accelVec).negate()
                console.log(magneticNorth.clone())
                northAngle = Math.atan2(magneticNorth.x,-magneticNorth.z)
                finalTransforms()
                magSensor.stop()
	        }
            measures.push(magField)
            
        });
        // acl.start();
        magSensor.start();
        startGps();//might not work...
        
    }
    function onWindowResize() {
    	camera.aspect = window.innerWidth / window.innerHeight;
    	camera.updateProjectionMatrix();
    	renderer.setSize( window.innerWidth, window.innerHeight );
    }
    function AR(){
    	var currentSession = null;
    	function onSessionStarted( session ) {
    		session.addEventListener( 'end', onSessionEnded );
    		renderer.xr.setSession( session );
            setupSensors()
    		button.style.display = 'none';
    		button.textContent = 'EXIT AR';
    		currentSession = session;
    	}
    	function onSessionEnded( /*event*/ ) {
    		currentSession.removeEventListener( 'end', onSessionEnded );
    		renderer.xr.setSession( null );
    		button.textContent = 'ENTER AR' ;
    		currentSession = null;
    	}
    	if ( currentSession === null ) {
    		var sessionInit = getXRSessionInit( 'immersive-ar', {
    			mode: 'immersive-ar',
    			referenceSpaceType: 'local', // 'local-floor'
    			sessionInit: {
    				optionalFeatures: ['dom-overlay', 'dom-overlay-for-handheld-ar'],
    				domOverlay: {root: document.body}
    			}
    		});
    		navigator.xr.requestSession( 'immersive-ar', sessionInit ).then( onSessionStarted );
    	} else {
    		currentSession.end();
    	}
    	renderer.xr.addEventListener('sessionstart',
    		function(ev) {
    			console.log('sessionstart', ev);
    			document.body.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    			renderer.domElement.style.display = 'none';
    		});
    	renderer.xr.addEventListener('sessionend',
    		function(ev) {
    			console.log('sessionend', ev);
    			document.body.style.backgroundColor = '';
    			renderer.domElement.style.display = '';
    		});
    }

    function getXRSessionInit( mode, options) {
    	if ( options && options.referenceSpaceType ) {
    		renderer.xr.setReferenceSpaceType( options.referenceSpaceType );
    	}
    	var space = (options || {}).referenceSpaceType || 'local-floor';
    	var sessionInit = (options && options.sessionInit) || {};

    	// Nothing to do for default features.
    	if ( space == 'viewer' )
    		return sessionInit;
    	if ( space == 'local' && mode.startsWith('immersive' ) )
    		return sessionInit;

    	// If the user already specified the space as an optional or required feature, don't do anything.
    	if ( sessionInit.optionalFeatures && sessionInit.optionalFeatures.includes(space) )
    		return sessionInit;
    	if ( sessionInit.requiredFeatures && sessionInit.requiredFeatures.includes(space) )
    		return sessionInit;

    	var newInit = Object.assign( {}, sessionInit );
    	newInit.requiredFeatures = [ space ];
    	if ( sessionInit.requiredFeatures ) {
    		newInit.requiredFeatures = newInit.requiredFeatures.concat( sessionInit.requiredFeatures );
    	}
    	return newInit;
    }

    function animate() {
    	renderer.setAnimationLoop( render );
    }

    function render() {
		var delta = clock.getDelta();
		var step = rotateSpeed * delta < 1 ? rotateSpeed * delta : 1;
        var targetQuaternion = camera.quaternion.clone().multiply( quat180y)
		for(let io=0;io<planetTags.length;io++){
			if ( !planetTags[io].plane.quaternion.equals( targetQuaternion ) ) {
				planetTags[io].plane.quaternion.slerp( targetQuaternion, step );
			}
		}
    	renderer.render( scene, camera );
        
    }

    init();
    animate();

    var button = document.createElement( 'button' );
    button.id = 'ArButton'
    button.textContent = 'ENTER AR' ;
    button.style.cssText+= `position: absolute;top:80%;left:40%;width:20%;height:1rem;`;

    document.body.appendChild(button)
    document.getElementById('ArButton').addEventListener('click',x=>AR())


    // orientate local RF
})
