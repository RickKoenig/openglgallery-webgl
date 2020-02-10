uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform mediump float alphacutoff;      
     
varying highp vec2 vTextureCoord;
precision highp float;

void main(void) {
	vec4 pix0 = texture2D(uSampler0,vTextureCoord,-1.0);
	vec4 pix1 = texture2D(uSampler1,vTextureCoord,-1.0);
	float redVal = (pix0.r + pix0.g + pix0.b)/3.0;
	float blueVal = (pix1.r + pix1.g + pix1.b)/3.0;
	//float alphaVal = 1.0; // proper for red blue
	float alphaVal = (pix0.a + pix1.a)/2.0; // punch a hole in the frame buffer alpha to show what's behind
	gl_FragColor = vec4(redVal,.2,blueVal,alphaVal);
}
