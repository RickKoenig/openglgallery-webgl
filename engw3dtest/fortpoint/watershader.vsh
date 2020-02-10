//-----------------------------------------------------------------------------
// c0-3		- local to projection space transform
// c4-7		- local to world space
// c8		- tex scroll1
// c9		- tex scroll2
//-----------------------------------------------------------------------------

vs_2_0

def c31, 1.0, -1.0, 0.0, 1.0

dcl_position v0
dcl_texcoord v1
dcl_normal v2

// Transform position
m4x4 r0, v0, c0
mov oPos, r0

// Scroll tex coord
mad r0, v1, c8.w, c8
mov oT0.xy, r0

// Scroll tex coord2
mad r0, v1, c9.w, c9
mov oT1.xy, r0

// World space position

//m4x4 r1, v0, c4
dp4 r1.x, v0, c4
dp4 r1.y, v0, c6
dp4 r1.z, v0, c5
dp4 r1.w, v0, c7

mov oT2, r1
