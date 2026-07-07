'use strict';

// very minimalist 3D state
var sensors = {}; // the 'sensors' state

sensors.text = "WebGL: Most sensors 3D drawing";
sensors.title = "sensors 3D";

// arrow pointing up
sensors.makearrowmaster = function() {
	const arrowmaster = new Tree2("arrow");
	let atree = buildcylinderxz("mid",.05,.75,"maptestnck.png","diffusespecp");
	arrowmaster.linkchild(atree);
	atree = buildconexz("head",.075,.25,"maptestnck.png","diffusespecp");
	atree.trans = [0, .75, 0];
	arrowmaster.linkchild(atree);
	return arrowmaster;
}

// load these before init
sensors.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
};

sensors.toggleStats = function() {
		sensors.terminal.doShow(!sensors.terminal.getShow());
}

sensors.init = function() {
	logger("entering webgl sensors 3D\n");

	// build root
	sensors.roottree = new Tree2("sensors root tree");

	// build a planexy (a square)
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","diffusespecp");
	//var plane = buildplanexy("aplane",1,1,"maptestnck.png","tex");
	var plane = buildplanexy("aplane", 1, 1, "maptestnck.png", "texDoubleSided", 1, 1, 8, 8);
	plane.mod.flags |= modelflagenums.DOUBLESIDED;
	plane.trans = [0, 0, 1];
	sensors.roottree.linkchild(plane);

	sensors.sphere = buildsphere("asphere", 1 / 16, "maptestnck.png", "texc");
	sensors.sphere.mod.mat.color = [.5, .5, 0, 1];
	sensors.sphere.trans = [0, 0, 0];
	sensors.roottree.linkchild(sensors.sphere);

	sensors.arrow = sensors.makearrowmaster();
	sensors.arrow.trans = [0, 0, 1];
	sensors.arrow.scale = [1, 1, 1];
	sensors.roottree.linkchild(sensors.arrow);
	sensors.arrowDir = [0, 1, 0];

	// build terminal
		const termParams1 = {
		cols: 60,
		rows: 24,
		offx: 8,
		offy: 8,
		scale: 1.2
	};
	setbutsname('sensors');
	makeabut("toggle stats", sensors.toggleStats);
	sensors.terminal = new Terminal(sensors.roottree, [.1, 0, 0, 1], null, termParams1);
	sensors.terminal.print("1\n12\n123\n1234\n12345\n123456\n1234567\n");

	sensors.terminal.print("SECURE = " + window.isSecureContext);
	sensors.terminal.doShow(false);

	mainvp = defaultviewport();
	mainvp.clearcolor = [0,.25,.5,1];

	// sensor api remove and moved to bottom

	requestDevicePermissions();

	sensors.terminal.print("done requestDevicePermissions");

	// UI debprint menu
	debprint.addlist("arrow",[
		"sensors.arrowDir"
	]);

};

sensors.proc = function() {
	// proc
	// use sphere as a cursor
	//sensors.sphere.trans = [input.fmx, input.fmy, 0];
	// update arrow
	//sensors.arrowDir[0] = input.fmx;
	//sensors.arrowDir[1] = input.fmy;
	sensors.sphere.trans = [input.fmx, input.fmy, 1];
	//sensors.terminal.print(JSON.stringify([input.fmx, input.fmy, 1]));
	// update arrow);
	const quat = dir2quat(sensors.arrowDir);
	sensors.arrow.qrot = quat;
	const len = vec3.length(sensors.arrowDir);
	sensors.arrow.scale[1] = len;
	sensors.roottree.proc(); // probably does nothing
	doflycam(mainvp); // modify the trs of mainvp using flycam
	
	// draw
	beginscene(mainvp);
	sensors.roottree.draw();
};

sensors.exit = function() {
	// show current usage before cleanup
	clearbuts('sensors');
	sensors.terminal = null;
	sensors.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	sensors.roottree.glfree();

    // remove div with all the buttons upon exit
	document.body.removeChild(sensors.div);
	sensors.div = null;

	// remove some event listeners
    window.removeEventListener('deviceorientation', deviceOrientation);
    window.removeEventListener('devicemotion', deviceMotion);

	
	// show usage after cleanup
	logrc();
	sensors.roottree = null;
	logger("exiting webgl sensors 3D\n");

	debprint.removelist("arrow");
};




function requestDevicePermissions() {
	sensors.div = document.createElement('div');
	document.body.appendChild(sensors.div); // make div for the buttons
	/*
	// test some buttons
	{
		sensors.terminal.print("add requestOrientationPermission TEST button 1");
		const button = document.createElement('button');
		button.innerText = "Enable Orientation 1";
		button.style.position = 'absolute';
		button.style.top = '400px';
		button.style.left = '20px';
		button.style.width = '100px';
		button.style.height = '50px';
		//button.style.transform = 'translate(100px, 100px)';
		sensors.div.appendChild(button);
	}
	{
		sensors.terminal.print("add requestOrientationPermission TEST button 2");
		const button = document.createElement('button');
		button.innerText = "Enable Orientation 2";
		button.style.position = 'absolute';
		button.style.top = '500px';
		button.style.left = '20px';
		button.style.width = '100px';
		button.style.height = '50px';
		//button.style.transform = 'translate(100px, 100px)';
		sensors.div.appendChild(button);
	}
		*/


	// if permission API exists
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function' 
	  && window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
		sensors.terminal.print("found requestPermission API");


       	const requestOrientationPermission = () => {
			//try {
			sensors.terminal.print("entering requestOrientationPermission");
           	DeviceOrientationEvent.requestPermission().then(permissionState => {
				sensors.terminal.print("permissionState = " + permissionState);
               	if (permissionState === 'granted') {
                   	window.addEventListener('deviceorientation', function(event) {
                        _processGyroscopeData(event.alpha, event.beta, event.gamma, event.absolute);
                    });
               } else {
					sensors.terminal.print("add requestOrientationPermission button");
                   	const button = document.createElement('button');
                   	button.innerText = "Enable Orientation 2";
					button.style.position = 'absolute';
					button.style.top = '400px';
					button.style.left = '20px';
					button.style.width = '100px';
					button.style.height = '50px';
					//button.style.transform = 'translate(100px, 100px)';
                    sensors.div.appendChild(button);

                    button.addEventListener('click', () => {
                        requestOrientationPermission();
                        //requestMotionPermission();
                        sensors.div.removeChild(button); // Remove button after requesting permissions
                    });
                }
            //}).catch(e => {
			//	sensors.terminal.print("Error requesting deviceorientation permission: " + e.name + ": " + e.message);
            });
        };
		requestOrientationPermission();


        /*const requestMotionPermission = () => {
            DeviceMotionEvent.requestPermission().then(response => {
                if (response === 'granted') {
                    window.addEventListener('devicemotion', function(event) {
                        _processAccelerometerData(event.acceleration.x, event.acceleration.y, event.acceleration.z);
                        if (event.accelerationIncludingGravity) {
                            _processAccelerometerDataGravity(
                                event.accelerationIncludingGravity.x,
                                event.accelerationIncludingGravity.y,
                                event.accelerationIncludingGravity.z
                            );
                        }
                        if (event.rotationRate) {
                            _processRotationRateData(
                                event.rotationRate.alpha,
                                event.rotationRate.beta,
                                event.rotationRate.gamma
                            );
                        }
                        window.addEventListener('deviceorientation', function(event) {
                            _processGyroscopeData(event.alpha, event.beta, event.gamma, event.absolute);
                        });
                    });
                    sensors.terminal.print("DeviceMotionEvent permission granted.");
                } else {
                     sensors.terminal.print("DeviceMotionEvent permission denied.");
                }
            }).catch(err => {
                sensors.terminal.print("Error requesting DeviceMotionEvent permission:", err);
            });
        }; */

		//requestMotionPermission();
		//requestOrientationPermission();
/*
        requestOrientationPermission();
		sensors.terminal.print("add requestMotionPermission button");
        const button = document.createElement('button');
        button.innerText = "Enable Orientation 3";
        button.style.position = 'absolute';
        button.style.top = '100%';
        button.style.left = '100%';
        button.style.transform = 'translate(50%, 50%)';
        sensors.div.appendChild(button);

        button.addEventListener('click', () => {
            requestOrientationPermission();
            requestMotionPermission();
            sensors.div.removeChild(button); // Remove button after requesting permissions
        });*/
    } else {
		sensors.terminal.print("NOT found requestPermission API");
        // Automatically start listeners on non-iOS 13+ devices
        sensors.terminal.print("DeviceOrientationEvent listener added automatically.");
        window.addEventListener('deviceorientation', deviceOrientation);
        sensors.terminal.print("DeviceMotionEvent listener added automatically.");
        window.addEventListener('devicemotion', deviceMotion);
    }
}


function requestDevicePermissionsOld() {
	sensors.div = document.createElement('div');
	document.body.appendChild(sensors.div); // make div for the buttons
	// test some buttons
	{
		sensors.terminal.print("add requestOrientationPermission TEST button 1");
		const button = document.createElement('button');
		button.innerText = "Enable Orientation 1";
		button.style.position = 'absolute';
		button.style.top = '400px';
		button.style.left = '20px';
		button.style.width = '100px';
		button.style.height = '50px';
		//button.style.transform = 'translate(100px, 100px)';
		sensors.div.appendChild(button);
	}
	{
		sensors.terminal.print("add requestOrientationPermission TEST button 2");
		const button = document.createElement('button');
		button.innerText = "Enable Orientation 2";
		button.style.position = 'absolute';
		button.style.top = '500px';
		button.style.left = '20px';
		button.style.width = '100px';
		button.style.height = '50px';
		//button.style.transform = 'translate(100px, 100px)';
		sensors.div.appendChild(button);
	}


	// if permission API exists
    if (typeof DeviceOrientationEvent.requestPermission === 'function' 
	  && typeof DeviceMotionEvent.requestPermission === 'function') {
		sensors.terminal.print("found requestPermission API");


       	const requestOrientationPermission = () => {
           	DeviceOrientationEvent.requestPermission().then(permissionState => {
               	if (permissionState === 'granted') {
                   	window.addEventListener('deviceorientation', function(event) {
                        _processGyroscopeData(event.alpha, event.beta, event.gamma, event.absolute);
                    });
               	} else {
					sensors.terminal.print("add requestOrientationPermission button");
                   	const button = document.createElement('button');
                   	button.innerText = "Enable Orientation 2";
                    //button.style.position = 'absolute';
                    button.style.top = '100%';
                    button.style.left = '100%';
                    button.style.transform = 'translate(50%, 50%)';
                    sensors.div.appendChild(button);

                    button.addEventListener('click', () => {
                        requestOrientationPermission();
                        requestMotionPermission();
                        sensors.div.removeChild(button); // Remove button after requesting permissions
                    });
                }
            }).catch(err => {
                sensors.terminal.print("Error requesting deviceorientation permission:", err);
            });
        };

		
/*      const requestOrientationAbsolutePermission = () => {
            DeviceOrientationEvent.requestPermission(true).then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientationabsolute', function(event) {
                         _processGyroscopeData(event.alpha, event.beta, event.gamma, event.absolute);
                    });
                } else {
                    sensors.terminal.print("deviceorientationabsolute permission denied.");
                }
            }).catch(err => {
                sensors.terminal.print("Error requesting deviceorientationabsolute permission:", err);
            });
        };
*/
/*
        const requestMotionPermission = () => {
            DeviceMotionEvent.requestPermission().then(response => {
                if (response === 'granted') {
                    window.addEventListener('devicemotion', function(event) {
                        _processAccelerometerData(event.acceleration.x, event.acceleration.y, event.acceleration.z);
                        if (event.accelerationIncludingGravity) {
                            _processAccelerometerDataGravity(
                                event.accelerationIncludingGravity.x,
                                event.accelerationIncludingGravity.y,
                                event.accelerationIncludingGravity.z
                            );
                        }
                        if (event.rotationRate) {
                            _processRotationRateData(
                                event.rotationRate.alpha,
                                event.rotationRate.beta,
                                event.rotationRate.gamma
                            );
                        }
                        window.addEventListener('deviceorientation', function(event) {
                            _processGyroscopeData(event.alpha, event.beta, event.gamma, event.absolute);
                        });
                    });
                    sensors.terminal.print("DeviceMotionEvent permission granted.");
                } else {
                     sensors.terminal.print("DeviceMotionEvent permission denied.");
                }
            }).catch(err => {
                sensors.terminal.print("Error requesting DeviceMotionEvent permission:", err);
            });
        };*/

        requestOrientationPermission();
		sensors.terminal.print("add requestMotionPermission button");
        const button = document.createElement('button');
        button.innerText = "Enable Orientation 3";
        button.style.position = 'absolute';
        button.style.top = '100%';
        button.style.left = '100%';
        button.style.transform = 'translate(50%, 50%)';
        sensors.div.appendChild(button);

        button.addEventListener('click', () => {
            requestOrientationPermission();
            requestMotionPermission();
            sensors.div.removeChild(button); // Remove button after requesting permissions
        });
    } else {
		sensors.terminal.print("NOT found requestPermission API");
        // Automatically start listeners on non-iOS 13+ devices
        sensors.terminal.print("DeviceOrientationEvent listener added automatically.");
        window.addEventListener('deviceorientation', deviceOrientation);
        sensors.terminal.print("DeviceMotionEvent listener added automatically.");
        window.addEventListener('devicemotion', deviceMotion);
    }
}



function deviceOrientation(event) {
    _processGyroscopeData(event.alpha, event.beta, event.gamma, event.absolute);
}

function deviceMotion(event) {
	_processAccelerometerData(event.acceleration.x, event.acceleration.y, event.acceleration.z);
}

function _processAccelerometerData(x, y, z) {
	sensors.terminal.print("ACCEL " + x + " " + y + " " + z);
}

function _processGyroscopeData(alpha, beta, gamma, absolute) {
	sensors.terminal.print("GYRO " + alpha + " " + beta + " " + gamma + " " + absolute);
}

function _processRotationRateData(alpha, beta, gamma) {
	sensors.terminal.print("ROTRATE " + alpha + " " + beta + " " + gamma);
}

function _processAccelerometerDataGravity(x, y, z) {
	sensors.terminal.print("GRAV " + x + " " + y + " " + z);
}

	/*
	// Magnetometer
	if ('Magnetometer' in window) {
		const magnetometer = new Magnetometer();
		magnetometer.onreading = () => {
			sensors.terminal.print(`Magnetic field: x=${magnetometer.x}, y=${magnetometer.y}, z=${magnetometer.z}`);
		};
		magnetometer.onerror = (event) => {
			sensors.terminal.print("ONERROR" + event.error.name + ", " + event.error.message);
		};
		magnetometer.start();
	} else {
		sensors.terminal.print('Magnetometer API not supported in this browser.');
	}

	try {
		sensors.magSensor = new Magnetometer({ frequency: 60 });
		sensors.magSensor.addEventListener("reading", (e) => {
			sensors.terminal.print(`Magnetic field along the X-axis ${sensors.magSensor.x}`);
			sensors.terminal.print(`Magnetic field along the Y-axis ${sensors.magSensor.y}`);
			sensors.terminal.print(`Magnetic field along the Z-axis ${sensors.magSensor.z}`);
		});
		sensors.magSensor.start();
		sensors.terminal.print("Magnetometer setup without exceptions");
	} catch(e) {
		sensors.terminal.print(e.name + ": " + e.message);
	}

	// AbsoluteOrientationSensor
	try {
		const options = { frequency: 60, referenceFrame: "device" };
		const absSensor = new AbsoluteOrientationSensor(options);
		absSensor.addEventListener("reading", () => {
			// model is a Three.js object instantiated elsewhere.
			//model.quaternion.fromArray(absSensor.quaternion).inverse();
			sensors.terminal.print("reading AbsoluteOrientationSensor");
		});
		absSensor.addEventListener("error", (event) => {
			if (event.error.name === "NotReadableError") {
				sensors.terminal.print("AbsoluteOrientationSensor is not available for reading.");
			}
		});
		absSensor.start();
		sensors.terminal.print("AbsoluteOrientationSensor setup without exceptions");
	} catch(e) {
		sensors.terminal.print(e.name + ": " + e.message);
	}

	// GravitySensor
	try {
		let gravitySensor = new GravitySensor({ frequency: 60 });
		gravitySensor.addEventListener("reading", (e) => {
			sensors.terminal.print(`Gravity along the X-axis ${gravitySensor.x}`);
			sensors.terminal.print(`Gravity along the Y-axis ${gravitySensor.y}`);
			sensors.terminal.print(`Gravity along the Z-axis ${gravitySensor.z}`);
		});
		gravitySensor.addEventListener("error", (event) => {
			if (event.error.name === "NotReadableError") {
				sensors.terminal.print("GravitySensor is not available for reading.");
			}
		});
		gravitySensor.start();
		sensors.terminal.print("GravitySensor setup without exceptions");
		sensors.terminal.print(JSON.stringify([gravitySensor.x, gravitySensor.y, gravitySensor.z]));
	} catch(e) {
		sensors.terminal.print(e.name + ": " + e.message);
	}
	*/
