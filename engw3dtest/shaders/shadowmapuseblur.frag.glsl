uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform highp vec3 elightdir;
uniform mediump float alphacutoff;
uniform mediump float specpow;
     
varying mediump vec2 vTextureCoord;
varying highp vec4 vShadowCoord;
varying highp vec3 enorm;
varying highp vec3 halfv;

void main(void) {
	highp vec2 poissonDisk[8];
	poissonDisk[0] = vec2( -0.94201624, -0.39906216 );
	poissonDisk[1] =  vec2( 0.94558609, -0.76890725 );
	poissonDisk[2] =  vec2( -0.094184101, -0.92938870 );
	poissonDisk[3] =  vec2( 0.34495938, 0.29387760 );
	poissonDisk[4] = vec2( 0.94201624, 0.39906216 );
	poissonDisk[5] =  vec2( -0.94558609, 0.76890725 );
	poissonDisk[6] =  vec2( 0.094184101, 0.92938870 );
	poissonDisk[7] =  vec2( -0.34495938, -0.29387760 );
	highp float texres = 1.0/2048.0; // how far apart to sample
	mediump float inTheLight = 1.0;
// diffuse and ambient
	highp vec3 enormn = normalize(enorm);
	highp float diffusedot = dot(enormn,elightdir);
	highp float diffusebright = clamp(diffusedot,0.0,.75) + .25;
// specular
	highp float specdot = dot(enormn,normalize(halfv));
	highp float specbright = 0.0;
	if (diffusedot > 0.0 && specdot > 0.0) {
		specbright = pow(specdot,specpow);
		highp vec4 sc = vShadowCoord; // texture index in homogeneous coords (x,y,w)
		if (sc.x >= 0.0 && sc.y >= 0.0 && sc.x < sc.w && sc.y < sc.w) {
	// compare shadowmap against screen z, using .r from shadowmap
			highp vec2 tidx = sc.xy/sc.w; 
			for (int i=0;i<8;i++){
				highp float smp = texture2D( uSampler1, tidx + poissonDisk[i]*texres ).r;
				if ((1.0 - smp) * sc.w <  sc.z) { 
					inTheLight -= 0.1; // a little brighter the .125
				}
			} 
		} else {
			inTheLight = 1.0; // not on shadowmap
		}
	} else {
		inTheLight = 0.0; // not facing light
	}
	//inTheLight = true;
	// fetch main texture color
    mediump vec4 fc = texture2D(uSampler0,vTextureCoord,-1.0);
	if (fc.a < alphacutoff)
		discard;
	mediump vec3 dark = fc.rgb * .25;
	mediump vec3 bright = fc.rgb * diffusebright + specbright*.125;
	gl_FragColor.rgb = mix(dark,bright,inTheLight);
	
    gl_FragColor.a = fc.a;
}
