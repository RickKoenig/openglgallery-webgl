// undo a perspective correct gpu, make texturing non perspective correct for old times sake
attribute vec3 vertexPositionAttribute;
attribute vec2 textureCoordAttribute;

uniform mat4 mvMatrixUniform;
uniform mat4 pMatrixUniform;

varying mediump vec2 vTextureCoord;

//#define PERS
#define NOPERS

#ifdef PERS
void main(void) {
	gl_Position = pMatrixUniform * (mvMatrixUniform * vec4(vertexPositionAttribute, 1.0));
	vTextureCoord = textureCoordAttribute * 10.0;
}
#endif

#ifdef NOPERS
void main(void) {
	gl_Position = pMatrixUniform * (mvMatrixUniform * vec4(vertexPositionAttribute, 1.0));
	// gl_Position.w is the view.z
	// during interpolation the endpoints are multiplied by 1/gl_Position.w, undo this
	vTextureCoord = textureCoordAttribute * gl_Position.w * 10.0;
}
#endif
