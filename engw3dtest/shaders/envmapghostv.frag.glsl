// do in world space since envmap is in world space
// draw what the skybox draws
uniform samplerCube uSampler0;
uniform mediump float alphacutoff;      
     
varying highp vec3 woutvec;

void main(void) {
	highp vec3 wov = woutvec;
	//if (wov.z < 0.0)
	//	wov.z = 0.0;
	gl_FragColor = textureCube(uSampler0,wov);
	gl_FragColor.xyz *= .5;
	//gl_FragColor.r = 1.0;
	if (gl_FragColor.a < alphacutoff)
		discard;
}
