var onerps = {};

onerps.frame = 0; // simple onerps.frame counter

// instructions and info
onerps.title = "One RevPS";
onerps.text = "WebGL: This has a way of measuring time deltas.\n";
onerps.procDelay = 10; // milli seconds

onerps.load = function() {
	preloadimg("../common/sptpics/font3_new.png");
	preloadtime(250,false); // test loading screen by just waiting around a bit
};

// make n copies of str and return it
onerps.repstr = function(str,i) {
	var ret = "";
	while(i > 0) {
		ret += str;
		--i;
	}
	return ret;
};

// build a pretty node
onerps.boxify = function(str) {
	var oret = {};
	var j;
	var lines = str.split('\n');
	// remove empty strings at the end
	j = lines.length;
	while(j > 0) {
		if (lines[j-1].length > 0)
			break;
		--j;
	}
	lines.splice(j,lines.length - j);
	var hit = lines.length;
	// find longest string
	var wid = 0;
	for (j=0;j<hit;++j) {
		if (lines[j].length > wid)
			wid = lines[j].length;
	}
	// make every string a long string
	for (j=0;j<hit;++j) {
		lines[j] += repstr(" ",wid - lines[j].length);
	}
	var ret = "";
	// now add a fancy border
	ret = String.fromCharCode(22); // top left
	ret += repstr(String.fromCharCode(9),wid); // top
	ret += String.fromCharCode(21); // top right
	ret += '\n';
	for (j=0;j<hit;++j) {
		ret += String.fromCharCode(8);
		ret += lines[j];
		ret += String.fromCharCode(8);
		ret += '\n';
	}	
	ret += String.fromCharCode(23); // bot left
	ret += repstr(String.fromCharCode(9),wid); // bot
	ret += String.fromCharCode(20); // bot right
	ret += '\n';
	oret.str = ret;
	oret.wid = wid;
	oret.hit = hit;
	return oret;
};
	
// pass in a node, get back a engw 'Tree2' for display
onerps.buildnumberblock = function(n) {
// size of font
	var fwid = 24;
	var fhit = 48;
    var fnode = new ModelFont("fnode","font3_new.png","tex",fwid,fhit,100,100,true);
    fnode.setfudge(true); // fudge because we might me scaling this and want it to look right, no perfection, slightly bigger
	var tnode = new Tree2("numbers");
	tnode.setmodel(fnode); // set tnode's model to fnode
	if (!n)
		n = "---";
	var str2boxobj = boxify("type" + " : " + "id" + "\n" + n);
	var str2box = str2boxobj.str;
    fnode.print(str2box);
    tnode.wid = fwid*(str2boxobj.wid + 2);
    tnode.hit = fhit*(str2boxobj.hit + 2);
    return tnode;
};

onerps.makenodearrow = function() {
// root of arrow
	var arrowroot = new Tree2("nodearrow");
// cylinder part of arrow
	var atree = buildcylinderxz("mid",.01875,.75,"maptestnck.png","diffusespecp");
	atree.trans = [0,0,0];
	atree.rot = [0,0,-Math.PI/2];
	arrowroot.linkchild(atree);
// cone part of arrow
	atree = buildconexz("head",.0375,.25,"maptestnck.png","diffusespecp");
	atree.trans = [.75,0,0];
	atree.rot = [0,0,-Math.PI/2];
	arrowroot.linkchild(atree); 
	return arrowroot;
};

onerps.init = function() {
	logger("entering webgl onerps\n");
	onerps.frame = 0;
// now build trees	
	onerps.roottree = new Tree2("root");
// build numbers
	onerps.nodetree = onerps.buildnumberblock(" 2  3  5  7\n11 13 17 19");
	onerps.depth = glc.clientHeight/2;
	onerps.nodetree.trans = [-glc.clientWidth/2,onerps.depth,onerps.depth]; // place at the upper left
	onerps.roottree.linkchild(onerps.nodetree);
// build an arrow
	onerps.marrow = makenodearrow(); // an arrow
	onerps.marrow.trans = [0,0,1];
	onerps.marrow.scale = [.65,2,2];
	//marrow.rotvel = [0,0,-Math.PI*2];
	onerps.marrow.rot = [0,0,Math.PI*.5];
	onerps.roottree.linkchild(onerps.marrow);
// flycam
	mainvp.trans = [0,0,0];
	mainvp.rot = [0,0,0];
	onerps.oldclearcolor = mainvp.clearcolor;
	mainvp.clearcolor = [.2,.2,.2];
// UI debprint menu
	debprint.addlist("onerps test variables",[
		"onerps.procDelay",
	]);

};

onerps.proc = function() {
// update number box
	var cnt = (onerps.frame < 10 ? " " : "") + onerps.frame; // 2 characters
	onerps.nodetree.mod.print(boxify(cnt).str);
// update arrow
	var ang = Math.PI*.5 - onerps.frame*Math.PI/30;
	var d2 = onerps.depth * .75;
	onerps.nodetree.trans = [d2*Math.cos(ang) - 50,d2*Math.sin(ang) + 50,onerps.depth];
// update anims if any
	onerps.roottree.proc();
// update arrow	
	++onerps.frame;
	if (onerps.frame >= 60)
		onerps.frame -= 60;
	onerps.marrow.rot = [0,0,ang];
// fly around UI
	doflycam(mainvp);  // modify the trs of the vp
// draw everything
	beginscene(mainvp);
	onerps.roottree.draw();
	// test proc load with busyWait
	busyWait(onerps.procDelay); // milli seconds
};

onerps.exit = function() {
// show everything before free (openGL resources and tree)
	logger("exiting webgl onerps\n");
	onerps.roottree.log();
	logrc();
// free openGL resources
	onerps.roottree.glfree();
	logger("after roottree glfree\n");
	logrc();
	onerps.roottree = null;
// restore previous viewport background color
	mainvp.clearcolor = onerps.oldclearcolor;
	debprint.removelist("onerps test variables");
};
