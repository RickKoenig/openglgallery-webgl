uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform highp float blend;      
uniform mediump float alphacutoff;      
     
varying highp vec2 vTextureCoord;
varying highp vec2 vTextureCoord2;

void main(void) {
	gl_FragColor = (1.0 - blend)*texture2D(uSampler0,vTextureCoord,-1.0) + blend*texture2D(uSampler1,vTextureCoord2,-1.0);
	if (gl_FragColor.a < alphacutoff)
		discard;
}
