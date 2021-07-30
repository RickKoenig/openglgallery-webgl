#version 300 es

#define PI 3.1415926

uniform mat4 mvMatrixUniform;
uniform mat4 pMatrixUniform;

//in vec3 vertexPositionAttribute;
//in vec2 textureCoordAttribute;

out mediump vec2 vTextureCoord;

void main() {
	float ang = float(gl_VertexID) * PI / 4.0; // 0 to 2*PI
	vec2 pos = vec2(cos(ang), sin(ang)) * 300.0;
	pos.x += float(gl_InstanceID) * 600.0;
	gl_Position = pMatrixUniform * mvMatrixUniform * vec4(pos, 0.0, 1.0);
	vTextureCoord = vec2(pos.x/250.0, -pos.y/250.0); // textureCoordAttribute;
}
