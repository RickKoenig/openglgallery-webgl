#version 300 es

uniform mat4 mvMatrixUniform;
uniform mat4 pMatrixUniform;

in vec3 vertexPositionAttribute;
in vec2 textureCoordAttribute;

out mediump vec2 vTextureCoord;

void main() {
	gl_Position = pMatrixUniform * (mvMatrixUniform * vec4(vertexPositionAttribute * 1.2, 1.0));
	vTextureCoord = textureCoordAttribute;
}
