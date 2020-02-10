uniform samplerCube uSampler0;
uniform mediump float alphacutoff;      
     
varying highp vec3 vNormalCoord;

void main(void) {
	gl_FragColor = textureCube(uSampler0,vNormalCoord);
	if (gl_FragColor.a < alphacutoff)
		discard;
}
