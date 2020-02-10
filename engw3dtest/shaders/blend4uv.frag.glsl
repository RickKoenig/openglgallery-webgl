uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform sampler2D uSampler2;
uniform sampler2D uSampler3;

uniform mediump float alphacutoff;      
     
varying highp vec2 vTextureCoord;
precision highp float;

void main(void) {
	vec2 blend = vTextureCoord;
	blend = 2.0 * (blend - .5) + .5;
	blend = clamp(blend,0.0,1.0);
	vec4 v0 = texture2D(uSampler0,vTextureCoord,-1.0);
	vec4 v1 = texture2D(uSampler1,vTextureCoord,-1.0);
	vec4 v2 = texture2D(uSampler2,vTextureCoord,-1.0);
	vec4 v3 = texture2D(uSampler3,vTextureCoord,-1.0);
	float b00 = (1.0 - blend.s)*(1.0 - blend.t);
	float b01 = blend.s*(1.0 - blend.t);
	float b10 = (1.0 - blend.s)*blend.t;
	float b11 = blend.s*blend.t;
	gl_FragColor = 
		b00*v0 +
		b01*v1 +
		b10*v2 +
		b11*v3;
	if (gl_FragColor.a < alphacutoff)
		discard;
}
