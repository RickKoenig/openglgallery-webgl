uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform sampler2D uSampler2;
uniform sampler2D uSampler3;

uniform mediump float alphacutoff;      
     
varying mediump vec2 vTextureCoord;
precision highp float;

// assumes wrap mode on texture2D
void main(void) {
	vec2 uv = vTextureCoord * 2.0;
	if (vTextureCoord.y < .5) {
		if (vTextureCoord.x < .5) {
			gl_FragColor = texture2D(uSampler0,uv);
		} else {
			gl_FragColor = texture2D(uSampler1,uv);
		}
	} else {
		if (vTextureCoord.x < .5) {
			gl_FragColor = texture2D(uSampler2,uv);
		} else {
			gl_FragColor = texture2D(uSampler3,uv);
		}
	}
	//gl_FragColor = texture2D(uSampler0,vTextureCoord,-1.0);
	//gl_FragColor.r = 1.0;
	if (gl_FragColor.a < alphacutoff)
		discard;
}
