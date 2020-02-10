// do in eye space
uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform highp vec3 elightdir;
uniform mediump float alphacutoff;      
     
varying highp vec2 vTextureCoord;
varying highp vec3 enorm;
   
void main(void) {
	//highp float bright = clamp(-1.0 * dot(normalize(enorm),elightdir),0.0,.75) + .25;
	//highp float bright = .5;
	highp float bright = step(0.0,dot(normalize(enorm),elightdir));
	gl_FragColor = (1.0 - bright)*texture2D(uSampler0,vTextureCoord,-1.0) + bright*texture2D(uSampler1,vTextureCoord,-1.0);
//	gl_FragColor.rgb = texture2D(uSampler0,vTextureCoord,-1.0).rgb;
//	gl_FragColor.a = texture2D(uSampler1,vTextureCoord,-1.0).a;
//	gl_FragColor.r = 1.0;
	if (gl_FragColor.a < alphacutoff)
		discard;
}
