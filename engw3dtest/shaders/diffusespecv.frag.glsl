// do in eye space
uniform sampler2D uSampler0;
uniform mediump float alphacutoff;      
     
varying highp vec2 vTextureCoord;
varying highp float bright;
varying highp float specbright;

void main(void) {
	gl_FragColor = texture2D(uSampler0,vTextureCoord,-1.0);
	gl_FragColor.xyz *= bright;
	gl_FragColor.xyz += specbright;
	
	if (gl_FragColor.a < alphacutoff)
		discard;
}
