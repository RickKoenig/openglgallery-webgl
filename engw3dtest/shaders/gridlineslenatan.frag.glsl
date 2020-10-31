#version 300 es
// License: CC0 (http://creativecommons.org/publicdomain/zero/1.0/)

in highp vec3 vertex;

out lowp vec4 color;

void main() {
  // Pick a coordinate to visualize in a grid
  const highp float pi = 3.141592653589793;
  const highp float scale = 10.0;
  highp vec2 coord = vec2(length(vertex.xz), atan(vertex.x, vertex.z) * scale / pi);

  // Handling the wrap-around is tricky in this case. The function atan()
  // is not continuous and jumps when it wraps from -pi to pi. The screen-
  // space partial derivative will be huge along that boundary. To avoid
  // this, compute another coordinate that places the jump at a different
  // place, then use the coordinate where the jump is farther away.
  //
  // When doing this, make sure to always evaluate both fwidth() calls even
  // though we only use one. All fragment shader threads in the thread group
  // actually share a single instruction pointer, so threads that diverge
  // down different conditional branches actually cause both branches to be
  // serialized one after the other. Calling fwidth() from a thread next to
  // an inactive thread ends up reading inactive registers with old values
  // in them and you get an undefined value.
  // 
  // The conditional uses +/-scale/2 since coord.y has a range of +/-scale.
  // The jump is at +/-scale for coord and at 0 for wrapped.
  highp vec2 wrapped = vec2(coord.x, fract(coord.y / (2.0 * scale)) * (2.0 * scale));
  highp vec2 coordWidth = fwidth(coord);
  highp vec2 wrappedWidth = fwidth(wrapped);
  highp vec2 width = coord.y < -scale * 0.5 || coord.y > scale * 0.5 ? wrappedWidth : coordWidth;

  // Compute anti-aliased world-space grid lines
  highp vec2 grid = abs(fract(coord - 0.5) - 0.5) / width;
  highp float line = min(grid.x, grid.y);

  // Just visualize the grid lines directly
  color = vec4(vec3(1.0 - min(line, 1.0)), 1.0);
}