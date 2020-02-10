uniform sampler2D uSampler0;
uniform sampler2D uSampler1;
uniform mediump float alphacutoff;      
     
varying highp vec2 vTextureCoord;
varying highp vec2 vTextureCoord2;

void main(void) {
	mediump float mip = -.04;//.95;
//	gl_FragColor = texture2D(uSampler0,vTextureCoord,mip);
//	gl_FragColor = texture2D(uSampler0,vTextureCoord,mip) * texture2D(uSampler1,vTextureCoord2,mip);
	gl_FragColor = texture2D(uSampler0,vTextureCoord,mip) * (texture2D(uSampler1,vTextureCoord2,mip) * vec4(3.0,3.0,3.0,1.0)) + vec4(.25,.25,.25,0.0);
	if (gl_FragColor.a < alphacutoff)
		discard;
	//gl_FragColor.a = 1.0;
}
