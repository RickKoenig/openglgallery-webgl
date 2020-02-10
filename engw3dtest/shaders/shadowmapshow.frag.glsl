uniform sampler2D uSampler0;
uniform mediump float alphacutoff;      
     
varying mediump vec2 vTextureCoord;
	mediump float fact = .25;
#if 0
void main(void) {
	gl_FragColor = texture2D(uSampler0,vTextureCoord,-1.0);
	//if (g)
	gl_FragColor.rgb = vec3(1.0 - (1.0 - gl_FragColor.r)*fact);
	gl_FragColor.a = 1.;
	//if (gl_FragColor.r < 1.0)
	//	gl_FragColor.r = 0.0;
	//if (gl_FragColor.a < alphacutoff)
	//	discard;
}
#else
void main(void) {
	gl_FragColor = texture2D(uSampler0,vTextureCoord,-1.0)* fact;
}
#endif