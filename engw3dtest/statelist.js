// added interleave
// use 'G' to make groups
var statelist = [
	"G GAMES",
	nim, // nim game
	chomp, // chomp game
	stoidCommand, // here we go with stoid command

	"G NETWORK",
	multiplayer, // test out multiplayer stuff
	race_lobby, // more refined multiplayer stuff
	race_lobby_standalone,
	race_sentgo,
	race_gameState,
	race_gameState_standalone,

	"G PHYSICS",
	pendu1, // pendu1, swing 1 pendulum around
	pendu2, // pendu2, coupled pendulums
	pendu3, // pendu3, many coupled pendulums
	physics2d, // 2d physics
	physics3d, // 3d physics, main
	qcomp, // future of computing (quantum)

	"G SIMULATION",
	arrows, // arrows
	lorenz, // Lorenz attractor

	"G MATH",
	menger, // Menger sponge
	mandl, // the Mandelbrot set
	neural6, // use deep learning to recognize hand written digits

	"G SHADOWMAPPING",
	solarTest, // Solar Test
	shadowMapping, // shadow mapping, Fixed !!!
	shadowMappingMerge, // shadow mapping merge, Fixed!!

	"G SHADERS",
	camblur, // camera bluring shaders, etc.
	shaderTest, // shader test, lighting
	vertexShadersV1, // play with vertex shaders

	"G ENGINE",
	basic, // one 3d square, planexy
	test3d, // simple 3d tests
	modelWebgl, // test webgl, model level, webgl level
	modelWebglFortpoint, // more webgl Model and Model2, some bwo's and a floor of fortpoint, model level
	fortpoint, // more webgl Tree2, the whole fortpoint scene, tree level
	prehistoric, // more webgl Tree2, prehistoric
	ghostcity, // another .bws of ghost city race track
	many, // many, tree level, test web sockets
	renderTargets, // scratch, test render targets
	surfacePatch, // surface patch
	lissajousCurves3D, // 3d Lissajous curves

	"G FONTS",
	testTerminal, // refactor Terminal class
	fontTest, // multi texture, tree level, font test
	scratchfont, // test font again

	"G MISCELLANEOUS",
	scratch, // anything goes
	pinch, // pinch zoom
	uitest, // 3d ui start
	uitesto, // 3d ui beginnings
	caveexplorer, // explore tree nodes;
	cubemaptest, // test cube maps
	onerps, // measure latency between cameras
	storagetest, // test localstorage
	test2d, // some sprite work
	sensors, // sensors like gravity magnetic etc.
	basic4textures, // one 3d square, planexy 4 different textures
	framebuffer4, // test 4 textures using framebuffers as textures, pratice state for the multi view system, currently working!!
	lattice2d, // draw with 1 view a test scene to be used by lattice3d
	lattice3d, // draw with 4 views, testing interlaceAPI's system, an API to help switch between 1 view and multi view
	gridlines, // play with fwidth etc.
	bargraph, // draw some bargraphs different ways
	tubedots, // patterns inside a tube
];

// convert statelist to groups
console.log("STATELIST size BEFORE parse groups = " + statelist.length);
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
console.log("STATELIST size AFTER parse groups = " + statelist.length);

var startstate = solarTest;
