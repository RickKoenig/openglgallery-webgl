uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform sampler2D uSampler2;
uniform sampler2D uSampler3;
uniform sampler2D uSampler4;
uniform sampler2D uSampler5;
uniform sampler2D uSampler6;
uniform sampler2D uSampler7;
uniform sampler2D uSampler8;
uniform sampler2D uSampler9;
uniform sampler2D uSampler10;
uniform sampler2D uSampler11;
uniform sampler2D uSampler12;
uniform sampler2D uSampler13;
uniform sampler2D uSampler14;
uniform sampler2D uSampler15;

uniform mediump float alphacutoff;      
     
varying highp vec2 vTextureCoord;
precision highp float;

const float weight = 1.0/16.0;

void main(void) {
	vec4 v0 = texture2D(uSampler0,vTextureCoord,-1.0);
	vec4 v1 = texture2D(uSampler1,vTextureCoord,-1.0);
	vec4 v2 = texture2D(uSampler2,vTextureCoord,-1.0);
	vec4 v3 = texture2D(uSampler3,vTextureCoord,-1.0);
	vec4 v4 = texture2D(uSampler4,vTextureCoord,-1.0);
	vec4 v5 = texture2D(uSampler5,vTextureCoord,-1.0);
	vec4 v6 = texture2D(uSampler6,vTextureCoord,-1.0);
	vec4 v7 = texture2D(uSampler7,vTextureCoord,-1.0);
	vec4 v8 = texture2D(uSampler8,vTextureCoord,-1.0);
	vec4 v9 = texture2D(uSampler9,vTextureCoord,-1.0);
	vec4 v10 = texture2D(uSampler10,vTextureCoord,-1.0);
	vec4 v11 = texture2D(uSampler11,vTextureCoord,-1.0);
	vec4 v12 = texture2D(uSampler12,vTextureCoord,-1.0);
	vec4 v13 = texture2D(uSampler13,vTextureCoord,-1.0);
	vec4 v14 = texture2D(uSampler14,vTextureCoord,-1.0);
	vec4 v15 = texture2D(uSampler15,vTextureCoord,-1.0);
	gl_FragColor = 
		(v0 + v1 + v2 + v3 +
		 v4 + v5 + v6 + v7 +
		 v8 + v9 + v10 + v11 +
		 v12 + v13 + v14 + v15) * weight;
	if (gl_FragColor.a < alphacutoff)
		discard;
}
