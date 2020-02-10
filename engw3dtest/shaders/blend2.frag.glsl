uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform mediump float alphacutoff;      
     
varying highp vec2 vTextureCoord;
precision highp float;

void main(void) {
	vec4 v0 = texture2D(uSampler0,vTextureCoord,-1.0);
	vec4 v1 = texture2D(uSampler1,vTextureCoord,-1.0);
	gl_FragColor = (v0 + v1) * .5;
	if (gl_FragColor.a < alphacutoff)
		discard;
}
