uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform highp vec3 elightdir;
uniform mediump float alphacutoff;
uniform mediump float specpow;
uniform highp vec4 color;      
    
varying mediump vec2 vTextureCoord;
varying highp vec4 vShadowCoord;
varying highp vec3 enorm;
varying highp vec3 halfv;

void main(void) {
	bool inshadow = false;
	highp vec3 enormn = normalize(enorm);
	highp float diffdot = dot(enormn,elightdir);
	highp float bright = clamp(1.0 * diffdot,0.0,.75) + .25;
	//highp float bright = 0.0;
// specular
	highp float specdot = dot(enormn,normalize(halfv));
	highp float specbright = 0.0;
	if (diffdot > 0.0 && specdot > 0.0) {
		specbright = pow(specdot,specpow);
	} else {
		inshadow = true;
	}
	highp vec4 sc = vShadowCoord;
	//highp vec4 sc = vec4(.5,.5,.5,0.0) + vShadowCoord;
	//sc.xyz = sc.xyz * 5.5;
	//highp vec4 sc = ShadowCoord;
    if (sc.x >= 0.0 && sc.y >= 0.0 && sc.x < sc.w && sc.y < sc.w) {
		//if (texture2DProj( uSampler1, sc.xyw ).r  <  sc.z/sc.w)
		if ((1.0 - texture2DProj( uSampler1, sc.xyw ).r) * sc.w <  sc.z) {
	    	inshadow = true;
	    }
	   }
/*	if (texture2DProj( uSampler1, sc.xyw ).r  <  1.0)
	   	inshadow = true; */
    mediump vec4 fc = texture2D(uSampler0,vTextureCoord,-1.0)*color;
	if (fc.a < alphacutoff)
		discard;
	if (!inshadow) {
		fc.rgb *= bright;
		fc.rgb += specbright;
		//gl_FragColor.r = 1.0;
	    gl_FragColor.rgb = fc.rgb;
	    //gl_FragColor.rgba = fc.rgba * vec4(visibility);
	    gl_FragColor.a = fc.a;
	} else {
		gl_FragColor.rgb = fc.rgb * .25;
	    gl_FragColor.a = fc.a;
	}
	//gl_FragColor - vec4(0.0,1.0,0.0,1.0);
}
