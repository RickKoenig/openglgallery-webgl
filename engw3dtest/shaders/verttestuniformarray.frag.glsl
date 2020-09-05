#version 300 es

uniform sampler2D uSampler0;
uniform mediump float alphacutoff;  
uniform mediump vec4 matColor;    
     
in mediump vec2 vTextureCoord;

out lowp vec4 color;

void main(void) {
	color = matColor * texture(uSampler0,vTextureCoord,-1.0);
	if (color.a < alphacutoff)
		discard;
}
