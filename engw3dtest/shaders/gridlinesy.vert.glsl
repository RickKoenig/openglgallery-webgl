#version 300 es
// webgl 2.0

uniform mat4 mvMatrixUniform;
uniform mat4 pMatrixUniform;

in vec3 vertexPositionAttribute;
in vec2 textureCoordAttribute;

out mediump vec2 vTextureCoord;
out highp vec3 vertex;

void main() {
	vertex = vec3(vertexPositionAttribute) * 10.0;
	gl_Position = pMatrixUniform * (mvMatrixUniform * vec4(vertexPositionAttribute, 1.0));
	vTextureCoord = textureCoordAttribute;
}

// webgl 1.0
// TODO: load common, 1.0, 2.0 shaders depending on webgl version
#if 0
uniform mat4 mvMatrixUniform;
uniform mat4 pMatrixUniform;

attribute vec3 vertexPositionAttribute;
attribute vec2 textureCoordAttribute;

varying mediump vec2 vTextureCoord;
varying highp vec3 vertex;

void main() {
	vertex = vec3(vertexPositionAttribute) * 10.0;
	gl_Position = pMatrixUniform * (mvMatrixUniform * vec4(vertexPositionAttribute, 1.0));
	vTextureCoord = textureCoordAttribute;
}
#endif
