uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform sampler2D uSampler2;
uniform sampler2D uSampler3;

uniform mediump float alphacutoff;      
uniform highp vec2 resolution;
     
#define BLENDY // if defined don't try to do vertical pixelation

precision highp float;
const float numViews = 4.0;
//#define PASSTHRU

#ifdef PASSTHRU

void main(void) {
	vec2 vTextureCoord = gl_FragCoord.xy / resolution;
	gl_FragColor = texture2D(uSampler0,vTextureCoord,-1.0);
	//gl_FragColor.r = 1.0;
}

#else

void main(void) {
#ifdef BLENDY
	vec2 vTextureCoord = gl_FragCoord.xy / resolution;
#else
	vec2 vTextureCoord;
	vTextureCoord.x = gl_FragCoord.x / resolution.x;
	float newY = floor(gl_FragCoord.y/numViews)*numViews + .5;
	vTextureCoord.y = newY / resolution.y;
#endif
	int index = int(mod(gl_FragCoord.x,float(numViews)));
	if (index == 0) {
		gl_FragColor = texture2D(uSampler0,vTextureCoord,-1.0);
	} else if (index == 1) {
		gl_FragColor = texture2D(uSampler1,vTextureCoord,-1.0);
	} else if (index == 2) {
		gl_FragColor = texture2D(uSampler2,vTextureCoord,-1.0);
	} else if (index == 3) {
		gl_FragColor = texture2D(uSampler3,vTextureCoord,-1.0);
	}
	//if (gl_FragColor.a < alphacutoff)
	//	discard;
}
#endif

