// do in eye space
uniform sampler2D uSampler0;
uniform highp vec3 elightdir;
uniform mediump float alphacutoff;
uniform mediump float specpow;
     
varying highp vec2 vTextureCoord;
varying highp vec3 enorm;
varying highp vec3 halfv;

void main(void) {
//	highp float specpow = 32.0;
// dot for diffuse
	highp vec3 enormn = normalize(enorm);
	highp float diffdot = dot(enormn,elightdir);
	highp float bright = clamp(1.0 * diffdot,0.0,.75) + .25;
	//highp float bright = 0.0;
// specular
	highp float specdot = dot(enormn,normalize(halfv));
	highp float specbright = 0.0;
	if (diffdot > 0.0 && specdot > 0.0) {
		specbright = pow(specdot,specpow);
		/*highp float s2 = specdot*specdot;
		highp float s4 = s2*s2;
		highp float s8 = s4*s4;
		highp float s16 = s8*s8;
		specbright = s16*s16; // fixed spec pow of 32, pow doesn't work past exp of 8.0 !?
		*/
	}
	gl_FragColor = texture2D(uSampler0,vTextureCoord,-1.0);
	gl_FragColor.rgb *= bright;
	gl_FragColor.rgb += specbright;
	//gl_FragColor.r = 1.0;
	if (gl_FragColor.a < alphacutoff)
		discard;
}
