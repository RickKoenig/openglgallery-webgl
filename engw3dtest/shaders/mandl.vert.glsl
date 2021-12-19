#version 300 es
// webgl 2.0

uniform mat4 mvMatrixUniform;
uniform mat4 pMatrixUniform;

in vec3 vertexPositionAttribute;

out highp vec2 pos;

void main() {
	gl_Position = pMatrixUniform * (mvMatrixUniform * vec4(vertexPositionAttribute, 1.0));
	pos = vec2(vertexPositionAttribute.xy); // to [(-2,-2) to (+2,+2)]
}
