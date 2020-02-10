uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform mediump float alphacutoff;      
     
varying highp vec2 vTextureCoord;
precision highp float;

void main(void) {
	float blend = vTextureCoord.s;
	blend = 2.0 * (blend - .5) + .5;
	blend = clamp(blend,0.0,1.0);
	gl_FragColor = (1.0 - blend)*texture2D(uSampler0,vTextureCoord,-1.0) + blend*texture2D(uSampler1,vTextureCoord,-1.0);
	if (gl_FragColor.a < alphacutoff)
		discard;
}
