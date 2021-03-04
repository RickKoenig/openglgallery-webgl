attribute vec3 vertexPositionAttribute;
attribute vec2 textureCoordAttribute;

uniform mat4 mvMatrixUniform;
uniform mat4 pMatrixUniform;
uniform vec2 tile;
uniform float v0;
uniform float v1;
uniform float value; // 0 to 1, the bargraph value

varying mediump vec2 vTextureCoord;

//#define CROP_SCALE
//#define CROP_REVEAL_TOP
//#define CROP_REVEAL_BOTTOM
#define OVERDRAW_REVEAL_BOTTOM

void main(void) {
	// make pos run from (0,1) to (1,-1)
	vec3 pos = vec3(textureCoordAttribute * vec2(1.0, -2.0) + vec2(0.0, 1.0), 0.0);
	// t runs from 0 to 1 (input)
	float t = pos.x;
	vec2 uv = textureCoordAttribute;
	
	// (output)
#ifdef CROP_SCALE
	uv.x = v0 + t * (v1 - v0);
	pos.x = t * value;
#endif
	
#ifdef CROP_REVEAL_TOP
	uv.x = v0 + t * (v1 - v0) * value;
	pos.x = t * value;
#endif

#ifdef CROP_REVEAL_BOTTOM
	uv.x = v1 + (1.0 - t) * (v0 - v1) * value;
	pos.x = t * value;
#endif

#ifdef OVERDRAW_REVEAL_BOTTOM
	float valueP = value + .00001;
	float nt = t * (1.0 - (1.0 - v1)/(valueP * (v0 - v1)));
	uv.x = v1 + (1.0 - nt) * (v0 - v1) * valueP;
	pos.x = nt * valueP;
#endif
	//uv.x = 1.0 - uv.x;

	gl_Position = pMatrixUniform * (mvMatrixUniform * vec4(pos, 1.0));
	vTextureCoord = uv * tile;
}

