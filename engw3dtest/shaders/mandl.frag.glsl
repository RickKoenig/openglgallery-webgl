#version 300 es

precision highp float;

uniform float palettePos;

in highp vec2 pos; // -2, -2 in lower left to +2, +2 in upper right

out lowp vec4 color;

//#define testPalette

vec4 getColor(int i)
{
#ifdef testPalette
	const vec4 colorTab[8] = vec4[] (
		vec4(0.0, 0.0, 1.0, 1.0),
		vec4(0.0, 1.0, 0.0, 1.0),
		vec4(0.0, 1.0, 1.0, 1.0),
		vec4(1.0, 0.0, 0.0, 1.0),
		vec4(1.0, 0.0, 1.0, 1.0),
		vec4(1.0, 1.0, 0.0, 1.0),
		vec4(1.0, 1.0, 1.0, 1.0),
		vec4(0.0, 0.0, 0.0, 1.0)
	);
	if (i < 8) {
		return colorTab[i];
	}
#endif
	float r,g,b;
	float f = float(i);
	if (i < 64) {
		r = 2.0 * f;
		g = 64.0;
		b = 128.0;
	} else if (i < 128) {
		r = (((f - 64.0) * 128.0) / 126.0) + 128.0;
		g = 32.0;
		b = 128.0;
	} else if (i < 256) {
		r = (((f - 128.0) * 62.0) / 127.0) + 193.0;
		g = 0.0;
		b = 128.0;
	} else if (i < 512) {
		r = 255.0;
		g = (((f - 256.0) * 62.0) / 255.0) + 1.0;
		b = 128.0;
	} else if (i < 1024) {
		r = 255.0;
		g = (((f - 512.0) * 63.0) / 511.0) + 64.0;
		b = 128.0;
	} else if (i < 2048) {
		r = 255.0;
		g = (((f - 1024.0) * 63.0) / 1023.0) + 128.0;
		b = 128.0;
	} else if (i < 4096) {
		r = 255.0;
		g = (((f - 2048.0) * 63.0) / 2047.0) + 192.0;
		b = 128.0;
	} else { // >= 4095
		r = 0.0;
		g = 0.0;
		b = 0.0;
	}
	return vec4(r / 255.0, g / 255.0, b / 255.0, 1.0);
}

void main() 
{
	// draw the color palette if visible
	if (palettePos > .00001) { // don't draw edge cases
		float palShow = -2.0 + .125 * palettePos;
		// display the color palette
		if (pos.x < palShow) {
			int colorIndex = int ((2.0 - pos.y) * (1024.0 + 1.0));
			color = getColor(colorIndex);
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
#if 0
	// test big circle
	color = vec4(.5,.5,.5,1.0);
	if (dot(pos, pos) > 4.0) {
		color = getColor(0);
		return;
	}
	// test smaller offset circle
	vec2 off = pos - vec2(.8, .2);
	if (dot(off, off) <= .25) {
		color = getColor(2);
		return;
	}
#endif	
	color = getColor(depth);
}
