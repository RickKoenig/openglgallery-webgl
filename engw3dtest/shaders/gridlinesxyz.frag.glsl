#extension GL_OES_standard_derivatives : enable

uniform highp float heightOffset;

varying mediump vec2 vTextureCoord;
varying highp vec3 vertex;

void main() {
  // Pick a coordinate to visualize in a grid
  highp vec3 coord = vertex.xyz + vec3(0.0, heightOffset, 0.0);

  // Compute anti-aliased world-space grid lines
  highp vec3 grid = abs(fract(coord - 0.5) - 0.5) / (fwidth(coord) + .00001);
  highp float line = min(min(grid.x, grid.y), grid.z);

  // Just visualize the grid lines directly
  gl_FragColor = vec4(vec3(1.0 - min(line, 1.0)), 1.0);
}