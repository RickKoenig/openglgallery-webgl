'use strict';

var race_track = {};

race_track.text = "WebGL: Track constructor and builder";
race_track.title = "race_track";

// trees
race_track.roottree;
race_track.multiTree;
race_track.datatexTree;
race_track.turnTree;
// data texture
race_track.datatex; // data texture

race_track.debvars = {
	testarr:[3,4,[5,7],6],
	testobj:{"hi":40,"ho":[50,99]},
};

race_track.mapUVs = function(mesh) {
    mesh.uvs = [];
    for (let i = 0; i < mesh.verts.length; i += 3) {
        const x = mesh.verts[i];
        const y = mesh.verts[i + 1];
        const u = .5 * x + .5;
        const v = -.5 * y + .5;
        mesh.uvs.push(u);
        mesh.uvs.push(v);
    }
};

// load these before init
race_track.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadimg("../common/sptpics/take0016.jpg");
};

race_track.init = function() {
	logger("entering webgl race_track\n");
	// ui
	setbutsname('race_track_buts');
    // tree root
    race_track.roottree = new Tree2("root");
    race_track.roottree.trans = [0,0,3];

    // data texture tree
    race_track.datatexTree = raceGetDataTex();
    race_track.roottree.linkchild(race_track.datatexTree);

    // multi material
    race_track.multiTree = raceGetMultiMat();    
    race_track.roottree.linkchild(race_track.multiTree);
    // make a copy of multi model
    var multi2 = race_track.multiTree.newdup();
    multi2.trans = [3.2,1,0];
    race_track.roottree.linkchild(multi2);

    // make track 'multiTurn'
    race_track.turnTree = raceGetTurn();
    race_track.roottree.linkchild(race_track.turnTree);
	
    // camera viewport
	mainvp = defaultviewport();	
	mainvp.clearcolor = [.125,.5,.75,1];

    // add a test debprint
	debprint.addlist("race_track_debug",["race_track.debvars"]);
};

race_track.proc = function() {
	// proc
	doflycam(mainvp); // modify the trs of vp using flycam
	// draw
	beginscene(mainvp);
	race_track.roottree.draw();
};

race_track.exit = function() {
    // ui
	debprint.removelist("race_track_debug");
	clearbuts('race_track_buts');
	// show current usage
	race_track.roottree.log();
	logrc();
	// show usage after cleanup
	race_track.roottree.glfree();
	logger("after roottree glfree\n");
	logrc();
	race_track.roottree = null;
	logger("exiting webgl race_track\n");
};
