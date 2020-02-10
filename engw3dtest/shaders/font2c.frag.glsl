uniform sampler2D uSampler0;
uniform mediump vec4 fcolor;      
uniform mediump vec4 bcolor;      
uniform mediump float alphacutoff;      
     
varying mediump vec2 vTextureCoord;

void main(void) {
	mediump vec4 tx = texture2D(uSampler0,vTextureCoord,-1.0);
	// gl_FragColor = fcolor;
	// gl_FragColor = bcolor;
	//.yz = vec2(0.0,0.0);
	gl_FragColor = mix(bcolor,fcolor,tx.g);
	if (gl_FragColor.a < alphacutoff)
		discard;
}
