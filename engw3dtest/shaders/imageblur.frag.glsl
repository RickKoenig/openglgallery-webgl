uniform sampler2D uSampler0;
uniform highp vec4 color;      
uniform mediump float alphacutoff;      
uniform highp vec2 coord; // this is where to blur
     
varying highp vec2 vTextureCoord;

void main(void) {
	highp vec2 d2 = vTextureCoord - coord;
	d2 *= d2;
	highp vec4 c;
	if (d2.x + d2.y < .01) {
		c = vec4(0.0,0.0,0.0,1.0);
		for (int i=-3;i<=3;++i) {
			for (int j=-3;j<=3;++j) {
				highp vec2 off = vec2(float(i)*.01,float(j)*.01);
				c+= texture2D(uSampler0,vTextureCoord + off);
			}
		}
		highp float f = 1.0/(7.0*7.0);
		gl_FragColor = c * f;
	} else {
		//c = color;
		gl_FragColor = texture2D(uSampler0,vTextureCoord);// * c;
	}
}
