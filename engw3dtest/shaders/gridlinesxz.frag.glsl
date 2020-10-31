#version 300 es
#extension GL_OES_standard_derivatives : enable

//uniform sampler2D uSampler0;
//uniform mediump float alphacutoff;      
     
//varying highp vec3 vertex;
/*
void main(void) {
	gl_FragColor = vec4(1.0, 0.0, fract(vertex.y + .0001), 1.0); //texture2D(uSampler0,vTextureCoord,-1.0) + vec4(1.0,0.0,0.0,1.0);
	if (gl_FragColor.a < alphacutoff)
		discard;
}
*/
uniform highp float heightOffset;

in mediump vec2 vTextureCoord;
in highp vec3 vertex;

out lowp vec4 color;

void main() {
// Pick a coordinate to visualize in a grid
  highp vec2 coord = vertex.xz;

  // Compute anti-aliased world-space grid lines
  highp vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  highp float line = min(grid.x, grid.y);

  // Just visualize the grid lines directly
  color = vec4(vec3(1.0 - min(line, 1.0)), 1.0);
}


/*
uniform sampler2D uSampler0;
uniform mediump float alphacutoff;      
     
in mediump vec2 vTextureCoord;
in highp vec3 vertex;

out lowp vec4 color;

void main(void) {
	color = texture(uSampler0,vTextureCoord,-1.0) + vec4(.25, 0.0, 0.0, 1.0);
	if (color.a < alphacutoff)
		discard;
}
*/