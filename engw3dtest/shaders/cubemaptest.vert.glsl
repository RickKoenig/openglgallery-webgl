// do in world space since envmap is in world space
attribute vec3 vertexPositionAttribute;
attribute vec3 normalAttribute;

uniform mat4 mvMatrixUniform;
uniform mat4 pMatrixUniform;
uniform mat4 v2wMatrix;

varying highp vec3 wnorm;

void main(void) {
	gl_Position = pMatrixUniform * (mvMatrixUniform * vec4(vertexPositionAttribute, 1.0));
	wnorm.xy = vertexPositionAttribute.xy;
	wnorm.z = 1.0;
}
