#if 1
uniform sampler2D uSampler0;
uniform mediump float alphacutoff;      
     
varying mediump vec2 vTextureCoord;

void main(void) {
	mediump float a = texture2D(uSampler0,vTextureCoord,-1.0).a;
	if (a < alphacutoff)
		discard;
	mediump float w = 1.0 - gl_FragCoord.z;
//	w = .5;
//	w -= .01;
	gl_FragColor = vec4(w,w,w,1.0);
//	gl_FragColor.r = 1.0;
//	gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}
#else
//uniform sampler2D uSampler0;
uniform mediump float alphacutoff;      
     
//varying mediump vec2 vTextureCoord;

void main(void) {
	//mediump float a = texture2D(uSampler0,vTextureCoord,-1.0).a;
	//if (a < alphacutoff)
	//	discard;
	mediump float w = gl_FragCoord.z;
//	w = .5;
	gl_FragColor = vec4(w,w,w,1.0);
//	gl_FragColor.r = 1.0;
//	gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}
#endif





/*
// Main fx

// All the Global variables from every fx
shared texture g_MeshTexture;				// Color texture for mesh
shared float4x4 g_mWorldViewProjection;		// World * View * Projection matrix 'o2c'
shared float4 g_material_color;				// material color

// Texture samplers
sampler MeshTextureSampler = 
sampler_state
{
    Texture = <g_MeshTexture>;
    MipFilter = LINEAR;
    MinFilter = LINEAR;
    MagFilter = LINEAR;
};

// Vertex Shader
struct VS_OUTPUT
{
    float4 Position		: POSITION;   // vertex position 
    float2 TextureUV	: TEXCOORD0;  // vertex texture coords 
    float2 zeedub		: TEXCOORD1;  // position zw
};
VS_OUTPUT RenderSceneVS( float4 vPos : POSITION, 
                         float2 vTexCoord0 : TEXCOORD0 )
{
    VS_OUTPUT Output;
// Transform the position from object space to homogeneous projection space
    Output.Position = mul(vPos, g_mWorldViewProjection);
// Just copy the texture coordinate through
    Output.TextureUV = vTexCoord0; 
    Output.zeedub = Output.Position.zw;
    return Output;    
}

// Pixel Shader
struct PS_OUTPUT
{
    float4 RGBColor : COLOR0;  // Pixel color    
};
PS_OUTPUT RenderScenePS( VS_OUTPUT In ) 
{ 
    PS_OUTPUT Output;
    float4 gt0 = tex2D(MeshTextureSampler,In.TextureUV);
    float k = gt0.w - g_material_color.w;
    clip(k);
    float tz = In.zeedub.x / In.zeedub.y;
    Output.RGBColor = tz;
//    Output.RGBColor = 0.0;
    return Output;
}

technique RenderScene
{
    pass P0
    {          
        VertexShader = compile vs_2_0 RenderSceneVS();
        PixelShader  = compile ps_2_0 RenderScenePS(); 
    }
}
*/
