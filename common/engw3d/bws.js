//var maxchild = 7;
//var maxchild = 70;
var maxchild = 8000;
//var specificname = "fortpointL3"; // just load this bwo
var specificname;

var dolightmap = 1; // 0 no, 1 yes, 2 just show the lightmap, not the mix, test

var globallmname; // set by bws, read by bwo, current lightmap texname

//var bwsinlightmap; // skip some image load error alerts in ajaxManager when loading a lightmap texture


function preloadbws(bwsname,nowait) {
	var t = preloadedbin[bwsname];
	if (t)
		return;
	goAjaxBin(bwsname,resppreloadbws,nowait);
}

// preload bwo's
function resppreloadbws(bws,bwsname,nowait) {
	var cc = 0;
	if (!bws) {
		if (isloaded() && !nowait) {
			if (loaddonefunc) {
				loaddonefunc();
			}
		}
		return;
	}
	var s = spliturl(bwsname);
	var key = geturlfrompathnameext("",s.name,s.ext);
	//logger("in resppreloadbws read\n");
	preloadedbin[key] = bws;
	var uc = new unchunker(bws);
	var chi;
	while(chi = uc.getchunkheader()) {
		var objname;
		if (chi.ct==uc.chunktypeenum.KID_CHUNK) {	// don't skip subchunk data
			if (chi.cn==uc.chunknameenum.UID_OBJECT) {
				//logger("ignoring data size of chunk " + uc.getchunkname_strs(chi.cn) + " " + uc.getchunktype_strs(chi.ct) + ", entering chunk\n");
			} else {
				//logger("skipping chunks other than UID_OBJECT " + uc.getchunkname_strs(chi.cn) + " " + uc.getchunktype_strs(chi.ct) + ", skipping chunk\n");
				uc.skipdata();
			}
			continue;
		}
		switch(chi.cn) {
		case uc.chunknameenum.UID_NAME:
			//logger("processing bwo" + chi.numele + " " + uc.getchunkname_strs(chi.cn) + " " + uc.getchunktype_strs(chi.ct) + "\n");
			var bwoname = uc.readI8v();
			var bwonamesplit = spliturl(bwoname);
			objname = bwoname;
			//logger("   bwoname = '" + bwoname + "'\n");
			var relbwoname = geturlfrompathnameext(s.path,bwonamesplit.name,bwonamesplit.ext); // use path of bwoname
			//preloadbwo(relbwoname,nowait);
			//logger("   relbwoname = '" + relbwoname + "'\n");
			break;
		case uc.chunknameenum.UID_USERPROP:
			var auserprop = uc.readI8v();
			//logger("   userprop = '" + auserprop + "'\n");
			var props = auserprop.split(" ");
			var i,n = props.length;
			for (i=0;i<n;++i) {
				if (props[i] == "lightmap" && i<n-1 && dolightmap) {
					var lmname = props[i+1];
					logger("   lightmap is '" + lmname + "'\n");
					var relimg = geturlfrompathnameext(s.path,lmname,"png"); // use path of bwoname
					bwsinlightmap = true;
					preloadimg(relimg,nowait);
					bwsinlightmap = false;
				}
			}
			break;
		case uc.chunknameenum.UID_KIND:
			var kind = uc.readI32();
			//logger("bws:preloadbwo   kind = '" + kind + "'\n");
			//logger("   bwoname = '" + objname + "'\n");
			if (kind == 1 || kind == 2) { // geom or helper
			//if (true) {
				var bwosplit = spliturl(objname);
				var relbwoname = geturlfrompathnameext(s.path,bwosplit.name,"bwo"); // use path of bwoname
				if (cc < maxchild) {
					if (!specificname || bwosplit.name == specificname)
						preloadbwo(relbwoname,nowait);
				}
				++cc;
			}
			break;
		default:
			//logger("DATA " + uc.getchunkname_strs(chi.cn) + " " + uc.getchunktype_strs(chi.ct) + ": SKIPPING\n");
			uc.skipdata();
			break;
		}
	}
	//logger("done resppreloadbws!\n");
	if (isloaded() && !nowait) {
		if (loaddonefunc) {
			loaddonefunc();
		}
	}
}

// convert sparse array to full array
function fillblankssamp(smp) {
	var i;
	var n = smp.length;
	var v = undefined;
	for (i=0;i<n;++i) {
		if (smp[i] !== undefined) {
			v = smp[i];
		} else {
			smp[i] = v;
		}
	}
}

function loadbws(rt) {
	var i;
	var cc = 0;
	var bwsname = rt.name;
	//logger("in load bws with tree name '" + bwsname + "'\n");
	var bws = preloadedbin[bwsname];
	if (!bws) {
		return;
	}
	var uc = new unchunker(bws);
	var chi;
	var nodes = [];
	var node = {};
	while(chi = uc.getchunkheader()) {
		if (maxchild && cc >= maxchild)
			break;
		var objname;
		if (chi.ct==uc.chunktypeenum.KID_CHUNK) {	// don't skip subchunk data
			if (chi.cn==uc.chunknameenum.UID_OBJECT) {
				//logger("ignoring data size of chunk " + uc.getchunkname_strs(chi.cn) + " " + uc.getchunktype_strs(chi.ct) + ", entering chunk\n");
			} else {
				//logger("skipping chunks other than UID_OBJECT " + uc.getchunkname_strs(chi.cn) + " " + uc.getchunktype_strs(chi.ct) + ", skipping chunk\n");
				uc.skipdata();
			}
			continue;
		}
		switch(chi.cn) {
		case uc.chunknameenum.UID_NAME:
			node = {};
			//logger("processing bwo" + chi.numele + " " + uc.getchunkname_strs(chi.cn) + " " + uc.getchunktype_strs(chi.ct) + "\n");
			node.name = uc.readI8v() + ".bwo";
			break;
		case uc.chunknameenum.UID_USERPROP:
			var auserprop = uc.readI8v();
			//logger("   userprop = '" + auserprop + "'\n");
			var props = auserprop.split(" ");
			var i,n = props.length;
			for (i=0;i<n;++i) {
				if (props[i] == "lightmap" && i<n-1 && dolightmap) {
					var lmname = props[i+1];
					logger("   lightmap is '" + lmname + "'\n");
					var relimg = geturlfrompathnameext("",lmname,"png");
					var img = preloadedimages[relimg];
					if (!img.err || dolightmap == 2)
						node.lmname = relimg; // don't want maptest as a lightmap, but use it when favorlightmap
				}
			}
			break;
		case uc.chunknameenum.UID_ID:
			node.id = uc.readI32();
			break;
		case uc.chunknameenum.UID_PID:
			node.pid = uc.readI32();
			break;
		case uc.chunknameenum.UID_KIND:
			node.kind = uc.readI32();
			break;
			
		case uc.chunknameenum.UID_MATRIX:
			//node.matrix = [];
			//for (i=0;i<4;++i)
			//	node.matrix.push(uc.readVC3());
			//var m43 = uc.;
			//node.kind = uc.readI32();
			//uc.skipdata();
			node.o2pmat4 = uc.readmat4();//mat4.create();
			break;
			
		case uc.chunknameenum.UID_POS:
			var res = uc.readVC3();;
			node.trans = [res.x,res.y,res.z];
			break;
		case uc.chunknameenum.UID_ROT_QUAT:
			var res = uc.readVC4();;
			node.qrot = [res.x,res.y,res.z,res.w];
			break;
		case uc.chunknameenum.UID_SCALE:
			var res = uc.readVC3();
			node.scale = [res.x,res.y,res.z];
			break;
			
		case uc.chunknameenum.UID_POS_SAMP:
			if (!node.possamp)
				node.possamp = [];
			var res = uc.readPOS_LIN();
//			node.possamp.push([res.x,res.y,res.z]);
			node.possamp[res.time] = [res.x,res.y,res.z];
			break;
		case uc.chunknameenum.UID_ROT_SAMP:
			if (!node.qrotsamp)
				node.qrotsamp = [];
			var res = uc.readROT_LIN();
//			node.qrotsamp.push([res.x,res.y,res.z,res.w]);
			node.qrotsamp[res.time] = [res.x,res.y,res.z,res.w];
			break;
		default:
			uc.skipdata();
			break;
		}
		if (chi.ct == uc.chunktypeenum.KID_ENDCHUNK) {
			//logger("bws ENDCHUNK\n");
			if ((node.kind == 1 || node.kind == 2)&& (!specificname || node.name == specificname + ".bwo")) { // geom
				if (dolightmap > 0)
					globallmname = node.lmname; // broadcast this to bwo reader
				var cld = new Tree2(node.name);
			} else if (node.kind == 4) { // amblight
				var cld = new Tree2("amblight");
				cld.name = node.name;
				cld.flags = treeflagenums.AMBLIGHT;
				addlight(cld);
			} else if (node.kind == 7) { // dirlight
				var cld = new Tree2("dirlight");
				cld.name = node.name;
				cld.flags = treeflagenums.DIRLIGHT;
				addlight(cld);
			} else { // not a geom, don't attempt to load any .bwo's
				var cld = new Tree2("");
				cld.name = node.name;
			}
			if (node.name.startsWith("chk"))
				cld.flags |= treeflagenums.DONTDRAW;
			globallmname = null;
			if (node.possamp || node.qrotsamp) { // only use the trans,rot,scale if we have samples too, else use the o2pmat4 instead
				cld.trans = node.trans;
				cld.qrot = node.qrot;
				cld.scale = node.scale;
				if (node.possamp)
					fillblankssamp(node.possamp);
				if (node.qrotsamp)
					fillblankssamp(node.qrotsamp);
			}
			cld.possamp = node.possamp;
			cld.qrotsamp = node.qrotsamp;
			cld.o2pmat4 = node.o2pmat4;
			if (node.pid >= 0)
				nodes[node.pid].t.linkchild(cld);
			else
				rt.linkchild(cld);
			node.t = cld;
			nodes.push(node);
			++cc;
			//uc.skipdata();
		}
	}
	//logger("done loadbws!\n");
}
