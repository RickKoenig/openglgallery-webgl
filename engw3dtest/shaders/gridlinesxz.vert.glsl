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
