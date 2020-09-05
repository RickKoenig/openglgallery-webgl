// added interleave
var statelist = [
	test3d, // simple 3d tests
	caveexplorer, // explore tree nodes;
	camblur, // camera bluring shaders, etc.
	state4, // test webgl, model level, webgl level
	state6, // more webgl Model and Model2, some bwo's and a floor of fortpoint, model level
	state7, // more webgl Tree2, the whole fortpoint scene, tree level
	state7p, // more webgl Tree2, prehistoric
	ghostcity, // another .bws of ghost city race track
	state8, // many, tree level
	state9, // scratch, test render targets
	state10, // multi texture, tree level, font test
	state11, // shader test, lighting
	state12, // surface patch
	state13, // 3d Lissajous curves
	state14, // pendu1, swing 1 pendulum around
	state15, // pendu2, coupled pendulums
	state16, // pendu3, many coupled pendulums
	state17, // arrows
	state18, // Menger sponge
	state19, // Lorenz attractor, Fixed!!!
	state20, // shadow mapping, Fixed !!!
	state21, // shadow mapping merge, Fixed!!
	scratch, // anything goes
	cubemaptest, // test cube maps
	onerps, // measure latency between cameras
	uitesto, // 3d ui beginnings
	uitest, // 3d ui start
	physics3d, // 3d physics, main
	physics2d, // 2d physics
	storagetest, // test localstorage
	scratchfont, // test font again
	test2d, // some sprite work
	basic, // one 3d square, planexy
	basic4textures, // one 3d square, planexy 4 different textures
	qcomp, // future of computing (quantum)
	solarTest, // Solar Test
	stoidCommand, // here we go with stoid command
	pinch, // pinch zoom
	framebuffer4, // test 4 textures using framebuffers as textures, pratice state for the multi view system, currently working!!
	lattice2d, // draw with 1 view a test scene to be used by lattice3d
	lattice3d, // draw with 4 views, testing interlaceAPI's system, an API to help switch between 1 view and multi view
	vertexShadersV1, // play with vertex shaders
];

var startstate = vertexShadersV1;
