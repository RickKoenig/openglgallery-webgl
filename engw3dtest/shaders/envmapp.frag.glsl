// do in world space since envmap is in world space
uniform samplerCube uSampler0;
uniform mediump float alphacutoff;      
     
varying highp vec3 wvert;
varying highp vec3 wnorm;

void main(void) {
	highp vec3 wnormn = normalize(wnorm);
	highp vec3 wvertn = normalize(wvert);
	highp vec3 woutvec = wvertn - 2.0*dot(wvertn,wnormn) * wnormn;
	gl_FragColor = textureCube(uSampler0,woutvec);
	if (gl_FragColor.a < alphacutoff)
		discard;
}
