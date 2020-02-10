// undo a perspective correct gpu, make texturing non perspective correct for old times sake
uniform sampler2D uSampler0;
uniform mediump float alphacutoff;      
     
varying mediump vec2 vTextureCoord;

//#define PERS
#define NOPERS

#ifdef PERS
void main(void) {
	gl_FragColor = texture2D(uSampler0,vTextureCoord,-1.0);
	if (gl_FragColor.a < alphacutoff)
		discard;
}
#endif

#ifdef NOPERS
void main(void) {
	// during interpolation
	// gl_FragCoord.w = [1/view0.z + t(1/view1.z - 1/view0.z)]
	// vTextureCoord = [uv0/view0.z + t(uv1/view1.z - uv0/view0.z)]/gl_FragCoord.w
	// undo division by gl_FragCoord.w
	highp vec2 uvs2 = vTextureCoord * gl_FragCoord.w;
	gl_FragColor = texture2D(uSampler0,uvs2,-1.0);
	if (gl_FragColor.a < alphacutoff)
		discard;
}
#endif

