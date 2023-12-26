var caveexplorer = {};

// TODO make these more local

var roottree; // tree
var nodetree;
var marrow; // arrow master

var ftest; // models

var frame; // simple frame counter

var nodeurlstr = "nodes 0";

// list of nodes
// child or children are used to build hierarchy
var anodes0 = [
	{id:'xxx', type:'searchhead', children:['xxx0'], strinfo:" 2  3  5  7\n11 13 17 19"},
	{id:'xxx0', type:'indexer', children:['xxx1'], strinfo:"Fee Fi\nFo Fum\n\n\n"},
	{id:'xxx1', type:'peer', children:['xxx2','xxx3'], strinfo:"hi"},
	{id:'xxx2', type:'forwarder' , children:['xxx2a','xxx2b']/*, strinfo:"hi\n\nho" */}, // no strinfo
	{id:'xxx3', type:'forwarder' , children:['xxx3a','xxx3b'], strinfo:"I am\nxxx3" },
	{id:'xxx2a', type:'forwarder' /*, strinfo:"hi\n\nho" */}, // no strinfo
	{id:'xxx2b', type:'forwarder' , strinfo:"I am\nxxx2b" },
	{id:'xxx3a', type:'forwarder' /*, strinfo:"hi\n\nho" */}, // no strinfo
	{id:'xxx3b', type:'forwarder' , strinfo:"I am\nxxx3b" },
];
var anodes1 = [
	{id:'yyyy', type:'searchhead', children:['xxx0','xxx1','xxx2','xxx3'], strinfo:"prime numbers"},
	{id:'xxx0', type:'indexer', strinfo:"Fee\nFi Fo\nFum\n\n\n"},
	{id:'xxx1', type:'peer',  strinfo:"hi"},
	{id:'xxx2', type:'forwarder', children:['xxx3a','xxx3b']  /*, strinfo:"missing" */}, // no strinfo
	{id:'xxx3', type:'forwarder' , strinfo:"I\nam\nxxx3" },
	{id:'xxx3a', type:'forwarder' /*, strinfo:"hi\n\nho" */}, // no strinfo
	{id:'xxx3b', type:'forwarder' , strinfo:"I\nam\nxxx3b" },
];
var anodes2 = [
	{id:'zzzz', type:'searchhead', children:['xxx0a','xxx1a'], strinfo:" 2  3  5  7\n11 13 17 19"},
	{id:'xxx0a', type:'indexer', children:['xxx2a'], strinfo:"Fee"},
	{id:'xxx1a', type:'indexer', children:['xxx2b'], strinfo:"Fi"},
	{id:'xxx2a', type:'indexer', strinfo:"Fo"},
	{id:'xxx2b', type:'indexer', strinfo:"Fum"},
];
var anodes3 = [
	{id:'wwww', type:'searchhead', children:['xxx0'], strinfo:" 2  3  5  7\n11 13 17 19"},
	{id:'xxx0', type:'indexer', children:['xxx1','newa'], strinfo:"Fee\nFi Fo\nFum\n\n\n"},
	{id:'xxx1', type:'peer', children:['xxx2','xxx3'], strinfo:"hi"},
	{id:'xxx2', type:'forwarder' , children:['xxx2a','xxx2b']/*, strinfo:"hi\n\nho" */}, // no strinfo
	{id:'xxx3', type:'forwarder' , children:['xxx3a','xxx3b'], strinfo:"I am\nxxx3" },
	{id:'xxx2a', type:'forwarder' /*, strinfo:"hi\n\nho" */}, // no strinfo
	{id:'xxx2b', type:'forwarder' , strinfo:"I am\nxxx2b" },
	{id:'xxx3a', type:'forwarder' /*, strinfo:"hi\n\nho" */}, // no strinfo
	{id:'xxx3b', type:'forwarder' , strinfo:"I am\nxxx3b" },
	{id:'newa', type:'peer' , children:['newb','newc'],strinfo:"new peer 1" },
	{id:'newb', type:'peer' , strinfo:"new peer 2" },
	{id:'newc', type:'peer' , strinfo:"new peer 3" },
];
//var anodeidx = 0;

var nodeslist = [anodes0,anodes1,anodes2,anodes3];

// build up a hierarchy of children

// this might be slow for large node arrays, O(n^2)
// might be better to just pass in a more hierarchical JSON structure that reflects the whole node structure

// instructions and info
caveexplorer.title = "Cave Explorer";
caveexplorer.text = "WebGL: This has a way of exploring a tree node structure.\n";

caveexplorer.load = function() {
	preloadimg("../common/sptpics/font3_new.png");
	preloadimg("fortpoint/Asphalt.png");
	preloadtime(250,false); // test loading screen by just waiting around a bit
};

// test JSON to string
caveexplorer.testvar = {
	s1:5,
	s2:7,
};

// make n copies of str and return it
function repstr(str,i) {
	var ret = "";
	while(i > 0) {
		ret += str;
		--i;
	}
	return ret;
}
	
// build a pretty node
function boxify(str) {
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
	/*	// no border
	for (j=0;j<hit;++j) {
		ret += lines[j];
		ret += '\n';
	} */
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
}
	
// pass in a node, get back a engw 'Tree2' for display
function buildanodece(n) {
	var fwid = 6;
	var fhit = 12;
    var fnode = new ModelFont("fnode","font3_new.png","tex",fwid,fhit,100,100,true);
    fnode.setfudge(true); // fudge because we might me scaling this and want it to look right, no perfection
	var tnode = new Tree2(n.id);
	tnode.setmodel(fnode);
	if (!n.strinfo)
		n.strinfo = "---";
	var str2boxobj = boxify(n.type + " : " + n.id + "\n" + n.strinfo);
	var str2box = str2boxobj.str;
    fnode.print(str2box);
    tnode.wid = fwid*(str2boxobj.wid + 2);
    tnode.hit = fhit*(str2boxobj.hit + 2);
    return tnode;
}

function makenodearrow() {
	var arrowmaster = new Tree2("nodearrow");
	// a modelpart
	
/*	atree = buildconexz("tail",.375,.5,"maptestnck.png","diffusespecp");
	atree.trans = [-.5,0,0];
	atree.rot = [0,0,-Math.PI/2];
	arrowmaster.linkchild(atree); */
	
	atree = buildcylinderxz("mid",.01875,.75,"maptestnck.png","diffusespecp");
	atree.trans = [0,0,0];
	atree.rot = [0,0,-Math.PI/2];
	arrowmaster.linkchild(atree);
	
	atree = buildconexz("head",.0375,.25,"maptestnck.png","diffusespecp");
	atree.trans = [.75,0,0];
	atree.rot = [0,0,-Math.PI/2];
	arrowmaster.linkchild(atree); 
	
	return arrowmaster;
}

function narrow(p0,p1) {
	var ret = marrow.newdup();
	//var p1 = [0,0];
	var delta = [p1[0]-p0[0],p1[1]-p0[1]];
	ret.trans = [p0[0],p0[1],glc.clientHeight/2];
	ret.rot = [0,0,Math.atan2(delta[1],delta[0])];
	var sc = vec2.length(delta);
	ret.scale = [sc,150,150];
	return ret;
}
	
var gcdix = 0;
var childcnt;
function childidx1(nd) {
	var i;
	nd.cidxy = gcdix;
	if (!childcnt[gcdix])
		childcnt[gcdix] = 0;
	nd.cidxx = childcnt[gcdix];
	++childcnt[gcdix];
	
	++gcdix;
	for (i=0;i<nd.sib.length;++i) {
		childidx1(nd.sib[i]);
	}
	--gcdix;
}

function childidx2(nd) {
	var i;
	var tnode = buildanodece(nd);
	tnode.trans = [
		nd.cidxx*120 - childcnt[nd.cidxy]*60,
		glc.clientHeight/2 - nd.cidxy*80,
		glc.clientHeight/2
	];
	nodetree.linkchild(tnode);
	nd.tnode = tnode;
	
	++gcdix;
	for (i=0;i<nd.sib.length;++i) {
		childidx2(nd.sib[i]);
	}
	--gcdix;
	
	// 2d, we are a child, find parent, and connect the arrows
	if (nd.cidxy > 0) {
		var pt = nd.parent.tnode;
		var p0 = [pt.trans[0]+pt.wid/2,pt.trans[1]-pt.hit];
		var p1 = [tnode.trans[0]+tnode.wid/2,tnode.trans[1]];
		var carrow = narrow(p0,p1);
		nodetree.linkchild(carrow); 
	}

}

// build hiearchical structure given id's and child id's
// sibling objects are an array of 'sib'
function buildnodesce(nds,offset) {
	if (nodetree) {
		nodetree.unlinkchild();
		nodetree.glfree();
	}
	nodetree = new Tree2("nodetree");
	if (!offset)
		offset = 0;
	var i,j,k;
	for (i=offset;i<nds.length;++i) { // run through the node array
		nds[i].sib = [];
		if (nds[i].children) {
			for (k=0;k<nds[i].children.length;++k) { // look at all the children
				var s1 = nds[i].children[k];
				for (j=i+1;j<nds.length;++j) { // now run through all nodes below this current one to see if it matches one of the children
					var s2 = nds[j].id;
					if (s1 == s2) {
						nds[i].sib.push(nds[j]);
						nds[j].parent = nds[i]; // add a parent member
					}			
				}
			}
		}
	}
	childcnt = [];
	childidx1(nds[offset]);
	childidx2(nds[offset]);
	roottree.linkchild(nodetree);
}

var cavetext;
var cavesel;

function upfunctext(e) {
	if (e.lastKey == 13) // '\n'
		getnodetree();
}
	
function getnodetree() {
	frame = 0;	
	nodeurlstr = cavetext.value;
	//goAjaxText("../engw3dtest/shaders/basic.ps",resptree);
	goAjaxText(cavetext.value,resptree);
}

/*function resptree(txt,txtname) {
	nodeurlstr = txt;
	
}
*/
function selectnodes(sel) {
	nodeurlstr = "nodes " + sel.selectedIndex;
	//buildnodes(anodes,sel.selectedIndex);
	//buildnodes(nodeslist[sel.selectedIndex]);
	buildnodesce(nodeslist[sel.selectedIndex],0);

};
	

caveexplorer.init = function() {
	var fwid = 8;
	var fhit = 16;
	//scratchtest(); // anything goes, currently experiment with __proto__ and prototype
	logger("entering webgl caveexplorer\n");
	
	frame = 0;
	
	// ui
	setbutsname('cave');
	levelarea = makeaprintarea('Node select: ');
	// less,more,reset for pendu1
	//cavetext = makeatext('URL','Enter URL',upfunctext);
	//cavetext = makeatext('URL','../engw3dtest/shaders/basic.ps',upfunctext);
	cavesel = makeaselect(['example0','example1','example2','example3'],selectnodes);

	//makeabut("Get node tree!",getnodetree);
	//makeabut("higher level",morelevel);
	//if (myform)
	//	sellev = makeaselect(["Level 0","Level 1","Level 2","Level 3","Level 4"],selectlevel);

// now build trees	
	roottree = new Tree2("root");

    // build test font and tree
    ftest = new ModelFont("ftest","font3_new.png","tex",fwid,fhit,100,100,true);
    //testfont.setfudge(true); // keep raw for checkerboard, perfection
	var ttest = new Tree2("ttest");
	var depth = glc.clientHeight/2;
	//ttest.trans = [-depth,-32*4,depth];
	//ttest.trans = [-glc.clientWidth/2,-depth+3*fhit,depth]; // place at lower left, 3 rows
	ttest.trans = [-glc.clientWidth/2,depth,depth]; // place at lower left, 3 rows
	ttest.setmodel(ftest);
	roottree.linkchild(ttest);
	
	// build an master arrow
	marrow = makenodearrow(); // master
	
/*	// copy
	//var p0 = [-glc.clientWidth/2 + tnode1.wid,glc.clientHeight/2 - tnode1.hit];
	//var p1 = [glc.clientWidth/2 - tnode2.wid,-glc.clientHeight/2 + tnode2.hit];
	var p0 = [-glc.clientWidth/2,glc.clientHeight/2];
	var p1 = [glc.clientWidth/2,-glc.clientHeight/2];
	var carrow = narrow(p0,p1);
	roottree.linkchild(carrow); */
	
	
	// build the hierarchical object, populate nodetree
	// this is it, build a nodetree from anodes!
	buildnodesce(anodes0,0);
	
/*	// build node font and tree
	var tnode1 = buildanodece(anodes[anodeidx]);
	tnode1.trans = [-glc.clientWidth/2,depth,depth]; // place at the upper left
	roottree.linkchild(tnode1);
	
	// build another node
	var tnode2 = buildanodece(anodes[(anodeidx+1)%anodes.length]);
	tnode2.trans = [glc.clientWidth/2 - tnode2.wid,-depth + tnode2.hit,depth]; // place at the lower right
	//tnode2.trans = [0,0,depth]; // place near the center
	roottree.linkchild(tnode2);
*/	
/*	// build a test cone
	acone = buildconexz("atail",1,1,"maptestnck.png","tex");
	acone.trans = [0,0,5];
	roottree.linkchild(acone); */
	
	// flycam
	mainvp.trans = [0,0,0]; 
	mainvp.rot = [0,0,0];
	
	// debprint
	var fml = [
//		{name:"caveexplorer",key:"testvar",obj:caveexplorer},
		"caveexplorer.testvar",
	];
	debprint.addlist("testvar from caveexplorer",fml);
	
	
    // advance to next node when state restarts
/*    ++anodeidx;
	if (anodeidx >= anodes.length) {
		anodeidx = 0;
	} */
};

caveexplorer.proc = function() {
	
    var str = nodeurlstr + "\ncount " + frame + " mouse (" + input.mx + "," + input.my + ")";
    //str += "\ncaveexplorer.testvar " + JSON.stringify(caveexplorer.testvar) + "\nCount " + String.fromCharCode(0x7f) + " = " + frame;
	ftest.print(str);

	roottree.proc();
	//++frame;

	doflycam(mainvp);  // modify the trs of the vp
	beginscene(mainvp);
	roottree.draw();
};

caveexplorer.exit = function() {
	debprint.removelist("testvar from caveexplorer");
	roottree.log();
	logrc();
	logger("after roottree glfree\n");
	marrow.glfree(); // free master arrow
	roottree.glfree();
	nodetree = null;
	logrc();
	roottree = null;
	clearbuts('cave');
	logger("exiting webgl caveexplorer\n");
};
