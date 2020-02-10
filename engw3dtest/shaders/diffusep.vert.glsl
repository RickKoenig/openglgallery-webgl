// do in eye space
attribute vec3 vertexPositionAttribute;
attribute vec2 textureCoordAttribute;
attribute vec3 normalAttribute;

uniform mat4 mvMatrixUniform;
uniform mat4 pMatrixUniform;

varying highp vec2 vTextureCoord;
varying highp vec3 enorm;

void main(void) {
	gl_Position = pMatrixUniform * (mvMatrixUniform * vec4(vertexPositionAttribute, 1.0));
	enorm = (mvMatrixUniform * vec4(normalAttribute,0.0)).xyz;
	//enorm = normalize(enorm);
	vTextureCoord = textureCoordAttribute;
}
