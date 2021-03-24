uniform sampler2D uSampler0;
uniform mediump float alphacutoff;      
     
varying mediump vec2 vTextureCoord;

void main(void) {
	lowp vec4 texColor = texture2D(uSampler0,vTextureCoord,-1.0);
	if (texColor.a < alphacutoff)
		discard;
	lowp float ff = float(gl_FrontFacing);
	lowp float ffm = 2.0 * ff - 1.0;
	lowp float ffb = 1.0 - ff;
	gl_FragColor = vec4(texColor.xyz * ffm + ffb, texColor.a);
}
