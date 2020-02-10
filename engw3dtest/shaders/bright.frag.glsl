precision highp float;

uniform sampler2D uSampler0;
//uniform mediump float alphacutoff;
uniform mediump float bright;
     
varying mediump vec2 vTextureCoord;

void main(void) {

	gl_FragColor = texture2D(uSampler0,vTextureCoord,-1.0) * vec4(bright,bright,bright,1.0);
    //gl_FragColor = vec4(1.,0.,0.,1.);

	//if (gl_FragColor.a < alphacutoff)
	//	discard;
}
