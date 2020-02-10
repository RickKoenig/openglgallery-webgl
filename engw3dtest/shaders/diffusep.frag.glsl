// do in eye space
uniform sampler2D uSampler0;
uniform highp vec3 elightdir;
uniform mediump float alphacutoff;      
     
varying highp vec2 vTextureCoord;
varying highp vec3 enorm;

void main(void) {
	gl_FragColor = texture2D(uSampler0,vTextureCoord,-1.0);
	highp float bright = clamp(-1.0 * dot(normalize(enorm),elightdir),0.0,.75) + .25;
	gl_FragColor.xyz *= bright;
	//gl_FragColor.g += .25;
	if (gl_FragColor.a < alphacutoff)
		discard;
}
