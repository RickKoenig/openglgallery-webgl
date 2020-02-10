uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform highp vec4 color;      
uniform mediump float blend;      
uniform mediump float alphacutoff;      
     
varying highp vec2 vTextureCoord;

void main(void) {
	gl_FragColor = (1.0 - blend)*texture2D(uSampler0,vTextureCoord,-1.0) + blend*texture2D(uSampler1,vTextureCoord,-1.0);
	gl_FragColor *= color;
	if (gl_FragColor.a < alphacutoff)
		discard;
}
