#version 300 es

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
