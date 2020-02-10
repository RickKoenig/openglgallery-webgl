// do in world space since envmap is in world space
uniform samplerCube uSampler0;
uniform mediump float alphacutoff;      
uniform mediump vec4 color;      
    
varying highp vec3 wnorm;

void main(void) {
	mediump vec3 multi = 4.*wnorm;
	multi = fract(multi);
	multi = step(.5,multi);
	//if (multi > .5) {
	//	gl_FragColor = vec4(1.,0.,0.,1.);
	//} else {
		gl_FragColor = textureCube(uSampler0,wnorm) * color * vec4(multi,1.);
	//}
	if (gl_FragColor.a < alphacutoff)
		discard;
}
