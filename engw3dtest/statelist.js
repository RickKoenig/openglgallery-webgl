// added interleave
// use 'G' to make groups
var statelist = [
	"G one",
	camblur, // camera bluring shaders, etc.
	test3d, // simple 3d tests
	caveexplorer, // explore tree nodes;
	modelWebgl, // test webgl, model level, webgl level

	"G two",
	modelWebglFortpoint, // more webgl Model and Model2, some bwo's and a floor of fortpoint, model level
	fortpoint, // more webgl Tree2, the whole fortpoint scene, tree level
	prehistoric, // more webgl Tree2, prehistoric
	ghostcity, // another .bws of ghost city race track

	"G three",
	many, // many, tree level, test web sockets
	multiplayer, // test out multiplayer stuff

	"G four",
	testTerminal, // refactor Terminal class
	race_lobby, // more refined multiplayer stuff
	race_lobby_standalone,
	race_sentgo,
	race_gameState,
	race_gameState_standalone,
	
	renderTargets, // scratch, test render targets
	fontTest, // multi texture, tree level, font test
	shaderTest, // shader test, lighting
	surfacePatch, // surface patch
	lissajousCurves3D, // 3d Lissajous curves
	pendu1, // pendu1, swing 1 pendulum around
	pendu2, // pendu2, coupled pendulums
	pendu3, // pendu3, many coupled pendulums
	arrows, // arrows
	menger, // Menger sponge
	lorenz, // Lorenz attractor, Fixed!!!
	shadowMapping, // shadow mapping, Fixed !!!
	shadowMappingMerge, // shadow mapping merge, Fixed!!
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
	sensors, // sensors like gravity magnetic etc.
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
	gridlines, // play with fwidth etc.
	bargraph, // draw some bargraphs different ways
	tubedots, // patterns inside a tube
	nim, // nim game
	chomp, // chomp game
	mandl, // the Mandelbrot set
	neural6, // use deep learning to recognize hand written digits
];
console.log("STATELIST size = " + statelist.length);
var stateGroups = [];
// remove 'G' from statelist, and make an array of group idices
for (let i = 0; i < statelist.length; ) {
	const sl = statelist[i];
	if (typeof sl === 'string') {
		let grp = statelist[i].split(" ");
		if (grp[0] === 'G') {
			statelist.splice(i, 1);
			const g = {"name": grp[1], "index": i};
			stateGroups.push(g);
		}
	} else {
		++i;
	}
}
console.log("STATE GROUPS = " + stateGroups);

var startstate = solarTest;
