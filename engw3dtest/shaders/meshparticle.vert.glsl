#version 300 es

const float M_PI = 3.1415926;
const float shrinkage = .85;

uniform mat4 mvMatrixUniform;
uniform mat4 pMatrixUniform;
uniform int numCols;
uniform int numRows;

// user defined uniforms go here

//#define STOCK
//#define SINE
#define TUBE

in vec3 vertexPositionAttribute; // assume quad is -1,-1 to +1,+1

out vec2 vPos; // 0,0 to 1,1

// user defined surface function(s)
#ifdef STOCK
vec3 surfaceStock(vec2 uv) {
	return vec3(uv, 0.0);
}
#endif

#ifdef SINE
vec3 surfaceSine(vec2 uv) {
	vec3 ret = vec3(uv, 0.0); // expand to -1,-1 to 1,1
	ret.y += sin(uv.x * 2.0 * M_PI) * .1; // amplitude of sine wave
	//vec2 outPos = vPos * 2.0 - 1.0;
	return ret;
}
#endif

#ifdef TUBE
vec3 surfaceTube(vec2 uv) {
	// TODO: maybe move these to uniforms
	const float angStart = 0.0;
	const float angEnd = 360.0;
	const float tubeNear = 0.0;
	const float tubeFar = 10.0;
	const float tubeRadius = 1.0;
	
	float rad = radians(mix(angEnd, angStart, uv.y));
	float zDist = mix(tubeNear, tubeFar, uv.x);
	
	return vec3(cos(rad), sin(rad), zDist);
}
#endif

void main() {
	int row = gl_InstanceID / numCols;
	int col = gl_InstanceID % numCols;
	vPos = vertexPositionAttribute.xy * shrinkage;
	vPos *= vec2(.5 / float(numCols), .5 / float(numRows));
	vec2 foffset = vec2(float(col) / float(numCols), float(row) / float(numRows));
	vPos += foffset + vec2(.5 / float(numCols), .5 / float(numRows));

#ifdef STOCK
	vec3 outPos = surfaceStock(vPos);
#endif
#ifdef SINE
	vec3 outPos = surfaceSine(vPos);
#endif
#ifdef TUBE
	vec3 outPos = surfaceTube(vPos);
#endif

#if defined(STOCK) || defined(SINE)
	// convert from 0,0 +1,+1 to -1,-1 +1,+1 but not for TUBE
	outPos.xy *= 2.0;
	outPos.xy -= 1.0;
#endif

	gl_Position = pMatrixUniform * mvMatrixUniform * vec4(outPos, 1.0);
}
