uniform sampler2D uSampler0;
uniform highp float bright;      
uniform highp float phase; 
uniform highp float amp; 
uniform highp float freq;
uniform mediump float alphacutoff;      
     
varying highp vec2 vTextureCoord;

void main(void) {
	//gl_FragColor = vec4(0,1,0,1);
	highp vec2 uv;
	uv.x = vTextureCoord.x;
	uv.y = vTextureCoord.y + amp*sin(freq*2.0*3.14159*vTextureCoord.x+phase);
	gl_FragColor = texture2D(uSampler0, uv,-1.0) * vec4(1,1,1,bright*.5+.5);
	if (gl_FragColor.a < alphacutoff)
		discard;
}
