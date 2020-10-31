#version 300 es

in highp vec3 vertex;

out lowp vec4 color;

void main() {
  // Pick a coordinate to visualize in a grid
  highp float coord = length(vertex.xz);

  // Compute anti-aliased world-space grid lines
  highp float line = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);

  // Just visualize the grid lines directly
  color = vec4(vec3(1.0 - min(line, 1.0)), 1.0);
}