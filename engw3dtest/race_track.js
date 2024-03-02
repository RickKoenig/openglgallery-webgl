'use strict';

var race_track = {};

race_track.text = "WebGL: Track constructor and builder";
race_track.title = "race_track";

race_track.roottree;
race_track.multi;
race_track.dtree;
race_track.datatex; // data texture

race_track.debvars = {
	testarr:[3,4,[5,7],6],
	testobj:{"hi":40,"ho":[50,99]},
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

	// start build a datatexture procedurally
    var texX = 128;
    var texY = 128;
    var invTexX = 1/texX; // step
    var invTexY = 1/texY;
    var im = 2*invTexX;
    var ib = invTexX - 1;
    var jm = 2*invTexY;
    var jb = invTexY - 1;
    var texdataarr32 = new Uint32Array(texX*texY); // ABGR
    var i,j,k4=0;
    for (j=0;j<texY;++j) {
        var jo = j&1;
        var jf = j*jm + jb;
        for (i=0;i<texX;++i,++k4) {
            var io = i&1;
            var ief = i*im + ib;
            // plus some BLUE 96 or 0x60
            if (io ^ jo) { // checkerboard ODD
                if (ief*ief + jf*jf < 1) { // inside circle
                    texdataarr32[k4] = 0xff60ffff; // GREEN + RED
                } else { // outside circle
                    texdataarr32[k4] = 0xff6000ff; // BLACK + RED
                }
            } else { // checkerboard EVEN
                if (ief*ief + jf*jf < 1) { // inside circle
                    texdataarr32[k4] = 0xff60ff00; // GREEN
                } else { // outside circle
                    texdataarr32[k4] = 0xff600000; // BLACK
                }
            }
        }
    }
    race_track.datatex = DataTexture.createtexture("datatex",texX,texY,texdataarr32);
	// end build a datatexture procedurally
	
    // draw the one with the data texture
    race_track.dtree = buildplanexy("dataTexPlane",1,1,"datatex","tex");
    race_track.roottree.linkchild(race_track.dtree);

    // test multi material 'Model2' with mesh data
    var multimesh = {
        "verts": [ // centered
        // front (POSZ) switched
            -1, 1,0,
             1, 1,0,
            -1,-1,0,
             1,-1,0,

            -1,-1,0,
             1,-1,0,
            -1,-3,0,
             1,-3,0,
        ],
        "uvs": [
        // front
            0,0,
            1,0,
            0,1,
            1,1,

            .375,.375,
            .625,.375,
            .375,.625,
            .625,.625,
        ],
        "faces": [	
        // front
            0, 1, 2,
            3, 2, 1,
            
            4, 5, 6,
            7, 6, 5,
        ]
    };
    
    var multimodel = Model2.createmodel("multimaterial");
    race_track.frame = 0;
    if (multimodel.refcount == 1) {
        multimodel.setmesh(multimesh);
        multimodel.addmat("tex","take0016.jpg",2,4);
        multimodel.addmat("tex","maptestnck.png",2,4);
        multimodel.commit();
    }

    race_track.multi = new Tree2("multimaterial");
    race_track.multi.setmodel(multimodel);

    race_track.multi.trans = [-1.6,1,0];
    race_track.multi.scale = [.5,.5,1];
    race_track.roottree.linkchild(race_track.multi);

    var multi2 = race_track.multi.newdup();
    multi2.trans = [-2.8,1,0];
    race_track.roottree.linkchild(multi2);
	
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
	if (race_track.datatex) {
		race_track.datatex.glfree();
		race_track.datatex = null;
	}
	race_track.bm32 = null;
	debprint.removelist("race_track_debug");
	// show current usage
	race_track.roottree.log();
	logrc();
	logger("after roottree glfree\n");
	race_track.roottree.glfree();
	
	// show usage after cleanup
	logrc();
	race_track.roottree = null;
	logger("exiting webgl race_track\n");
	clearbuts('race_track_buts');
};
