#version 300 es

precision highp float;

#define M_PI 3.1415926535897932384626433832795

uniform float palettePos; // for showing palette 0 to 1
uniform float paletteCycleOffset; // [0 to 1)
uniform float paletteRepeat;
uniform float paletteAmp;
uniform float paletteFreq;

in vec2 pos; // -2, -2 in lower left to +2, +2 in upper right

out lowp vec4 color;

const float segments = 7.0;
const int iSegments = int(segments);
const vec4 colors[iSegments + 1] = vec4[iSegments + 1] (
	vec4(0.0, .25, .5, 1.0), // 0
	vec4(.75, .25, .5, 1.0), // 1
	vec4(.75, .75, .5, 1.0), // 2
	vec4(.25, .75, .5, 1.0), // 3
	vec4(.25, .25, .75, 1.0), // 4
	vec4(.5, .25, 1.0, 1.0), // 5
	vec4(.75, .5, .75, 1.0), // 6
	vec4(1.0, .75, .5, 1.0) // 7
);

// index runs from 0.0 to 1.0 in segments each one twice the size of the previous segment
vec4 getColor4(float index)
{
	if (index >= 1.0) { // in the set, return black
		return vec4(0.0);
	}
	float small = exp2(segments - 1.0);
	float logIndex; // 0.0 to segments
	float firstSegment = small * index;
	if (firstSegment >= 1.0) {
		logIndex = log2(index) + segments; // 1.0 to segments
	} else {
		logIndex = firstSegment; // do linear on first part 0.0 to 1.0
	}
	// logIndex runs from [0 to segments)
	logIndex *= paletteRepeat;
	logIndex += paletteCycleOffset * segments;
	logIndex = mod(logIndex, segments);
	float modLogIndex = fract(logIndex);
	int intLogIndex = int(logIndex);
	vec4 col = mix(colors[intLogIndex], colors[intLogIndex + 1], modLogIndex);
	float intensity = mix(1.0, cos(logIndex / segments * paletteFreq * (2.0 * M_PI)), paletteAmp * .25);
	//paletteAmp;
	//paletteFreq;
	col.rgb *= intensity;
	return col;
}

void main() 
{
	// draw the color palette if visible
	if (palettePos > .000001) { // don't draw edge cases
		float palShow = -2.0 + .125 * palettePos;
		// display the color palette
		if (pos.x < palShow) {
			const float eps = .005;
			float colorIndex = (2.0 + eps - pos.y) * .25;
			color = getColor4(colorIndex);
			return;
		}
	}

	const int maxDepth = 4096;
	int depth = 0;
	vec2 z; // complex number
	for (depth = 0; depth < maxDepth; ++depth) {
		// calc the new z from the old z, z^2 + c => z
		vec2 temp;
		temp.x = z.x *z.x - z.y * z.y;
		temp.y = 2.0 * z.x * z.y;
		z = temp + pos;
		// see if out of bounds
		float mag2 = dot(z, z);
		if (mag2 > 4.0)
			break;
	}
	color = getColor4(float(depth) / float(maxDepth));
}
