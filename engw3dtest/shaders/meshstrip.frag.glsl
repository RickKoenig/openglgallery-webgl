#version 300 es

uniform sampler2D uSampler0;
uniform mediump float alphacutoff; 
uniform mediump vec4 mcolor;
uniform highp int numRows;
uniform highp int numCols;
     
in mediump vec2 vPos; // 0,0 to 1,1

out lowp vec4 color;

void main(void) {
#if 1
	color = texture(uSampler0,vPos,-1.0) * mcolor;
#else
	color = texture(uSampler0,vPos * vec2(numCols, numRows), -1.0) * mcolor;
#endif
	if (color.a < alphacutoff)
		discard;
}
