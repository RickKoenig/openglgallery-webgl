uniform sampler2D uSampler0;
uniform highp vec4 color;      
uniform mediump float alphacutoff;      
     
varying highp vec2 vTextureCoord;

void main(void) {
	gl_FragColor = texture2D(uSampler0,vTextureCoord) * color;
	if (gl_FragColor.a < alphacutoff)
		discard;
}
