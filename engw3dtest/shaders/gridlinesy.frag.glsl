#version 300 es
// webgl 2.0

uniform highp float heightOffset;

in mediump vec2 vTextureCoord;
in highp vec3 vertex;

out lowp vec4 color;

void main() {
  // Pick a coordinate to visualize in a grid
  highp float coord = vertex.y + heightOffset;

  // Compute anti-aliased world-space grid lines
  highp float line = abs(fract(coord - 0.5) - 0.5) / (fwidth(coord) + .00001);

  // Just visualize the grid lines directly
  color = vec4(vec3(1.0 - min(line, 1.0)), 1.0);
}

// webgl 1.0
// TODO: load common, 1.0, 2.0 shaders depending on webgl version
#if 0
#extension GL_OES_standard_derivatives : enable

uniform highp float heightOffset;

varying mediump vec2 vTextureCoord;
varying highp vec3 vertex;

void main() {
  // Pick a coordinate to visualize in a grid
  highp float coord = vertex.y + heightOffset;

  // Compute anti-aliased world-space grid lines
  highp float line = abs(fract(coord - 0.5) - 0.5) / (fwidth(coord) + .00001);

  // Just visualize the grid lines directly
  gl_FragColor = vec4(vec3(1.0 - min(line, 1.0)), 1.0);
}

#endif
