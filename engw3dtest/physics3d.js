// 3d physics mostly with blocks
var physics3d = {};


physics3d.text = "WebGL: 3d physics";

physics3d.title = "physics3d";

physics3d.curscene = 0;

physics3d.viewPos;// = new float[3];
physics3d.viewRot;// = new float[3];

physics3d.framenum;

physics3d.NCORNERS = 8;
physics3d.FIRSTMESHOBJ = 1;
physics3d.scenearea;

physics3d.ho // helper objects
physics3d.showVector = false;


physics3d.resetScene = function() {
	logger("in resetScene " + physics3d.curscene + "\n");
	changestate("physics3d");
};

physics3d.nextScene = function() {
	++physics3d.curscene;
	if (physics3d.curscene == physics3d.numscenes)
		physics3d.curscene = 0;
	logger("in nextScene " + physics3d.curscene + "\n");
	changestate("physics3d");
};

physics3d.showVectors = function() {
	physics3d.showVector = !physics3d.showVector;
};

physics3d.prevScene = function() {
	--physics3d.curscene;
	if (physics3d.curscene < 0)
		physics3d.curscene = physics3d.numscenes - 1;
	logger("in prevScene " + physics3d.curscene + "\n");
	changestate("physics3d");
};

physics3d.numscenes = 0;

    // phyobjects
/*
    class objstate {
        VEC pos = new VEC(),rot = new VEC(),momentum = new VEC(),angmomentum = new VEC(); // angmom cm
        VEC vel = new VEC(),rotvel = new VEC();	// always derived from above

        void copy(objstate rhs) {
            pos.copy(rhs.pos);
            rot.copy(rhs.rot);
            momentum.copy(rhs.momentum);
            angmomentum.copy(rhs.angmomentum);
            vel.copy(rhs.vel);
            rotvel.copy(rhs.rotvel);
        }

    }

    class nb {
        //int nnb;
        int visited;
        ArrayList<Integer> nbs = new ArrayList<>();
        //int nnballoced;
    }

    class nbf {
        //int nnbf;
//	int visited;
        ArrayList<Integer> nbfs = new ArrayList<>();
        //int nnbfalloced;
    }

    class phyobject {
        // object
        int kind; // box1, cyl1, sph1, look in objects.txt, right now box1 is special
        VEC scale = new VEC();
        // gen object
        // 8 box points
        VEC[] pnts = new VEC[NCORNERS]; // local bbox 8 points
        VEC[] rpnts = new VEC[NCORNERS]; // world bbox 8 points
        // mesh points if kind>=3
        boolean haswf; // object has current world verts
        int nwpnts;
        int nwfaces;
        VEC[] wpnts; // malloced world verts
        nb[] nbs; // neighboring verts
        nbf[] nbfs; // neighboring faces
        FACE[] lfaces; // handy ptr
        VEC[] lpnts; // handy ptr
        //ArrayList<contact> contacts; // indexed by the other object
        // pos
        objstate s0 = new objstate(),st = new objstate(); // motion: s0 -> st, collisions st->st
        float transenergy;
        float potenergy;
        float rotenergy;
        // parameters
        float mass;
        float elast;
        float frict;
        // generated parameters
        VEC moivec = new VEC();	// try out principal axis
        boolean norot,notrans;
// reference to root node of object
        Tree t;

        phyobject() {
            //logger("phyobject constructor");
            int i;
            for (i=0;i<NCORNERS;++i) {
                pnts[i] = new VEC();
                rpnts[i] = new VEC();
            }
            for (i=0;i<MAXBOX2BOX;++i) {
                resv[i] = new VEC();
            }
            for (i=0;i<MAXBOX2BOX/2;++i) {
                v[i] = new VEC();
                vc[i] = new VEC();
            }
        }
    }
*/
function objstate() {
	this.pos = new VEC();
	this.rot = new VEC()
	this.momentum = new VEC();
	this.angmomentum = new VEC(); // angmom cm
	this.vel = new VEC()
	this.rotvel = new VEC();	// always derived from above
}

objstate.prototype.copy = function(rhs) {
	this.pos.copy(rhs.pos);
	this.rot.copy(rhs.rot);
	this.momentum.copy(rhs.momentum);
	this.angmomentum.copy(rhs.angmomentum);
	this.vel.copy(rhs.vel);
	this.rotvel.copy(rhs.rotvel);
};

// for now these will be global
function phyobject() {
	var i;
	this.scale = new VEC();
	this.pnts = []; // local bbox 8 points
	this.rpnts = []; // world bbox 8 points
	for (i=0;i<physics3d.NCORNERS;++i) {
		this.pnts[i] = new VEC();
		this.rpnts[i] = new VEC();
	}
	this.wpnts = []; // malloced world verts
	this.nbs = []; // neighboring verts
	this.nbfs = []; // neighboring faces
	this.lfaces = []; // handy ptr
	this.lpnts = []; // handy ptr
	this.s0 = new objstate();
	this.st = new objstate();
	this.moivec = new VEC();
}

physics3d.ascene;
physics3d.nextvert = [1,2,0];

physics3d.roottree = null;
physics3d.footballfield = null;

physics3d.PHY_OBJ = {OBJ_BOX:0,OBJ_CYL:1,OBJ_SPH:2};
physics3d.MAX3DBOX = 100; // int // TODO get it from other module
physics3d.MAXPHYOBJECTS = physics3d.MAX3DBOX; // int // 100
physics3d.phyobjects = []; //phyobject[] phyobjects = new phyobject[MAXPHYOBJECTS];
physics3d.totangmomentum = new VEC();
physics3d.totangcmmomentum = new VEC();
physics3d.totangorgmomentum = new VEC();
physics3d.totmomentum = new VEC();
physics3d.tottransenergy = 0;
physics3d.totrotenergy = 0;
physics3d.totpotenergy = 0;
physics3d.totenergy = 0; // float
physics3d.littlegee = 10.0; //9.8f; // float

    // for debprint
physics3d.nphyobjects = 0; // int
physics3d.curphyobjectnum = 0; // int
physics3d.lastcurphyobjectnum = 0; // int

physics3d.MAXWORLDOBJECTS = 10;
physics3d.moisqs = [ // make this match MAXWORLDOBJECTS
            new VEC(1.0/12.0,1.0/12.0,1.0/12.0),
            new VEC(1.0/16.0,1.0/12.0,1.0/16.0),
            new VEC(1.0/20.0,1.0/20.0,1.0/20.0),
            new VEC(),
            new VEC(),
            new VEC(),
            new VEC(),
            new VEC(),
            new VEC(),
            new VEC()
    ];

physics3d.numworldobjects = 0;
physics3d.objkindstr = new Array(physics3d.MAXWORLDOBJECTS);
physics3d.worldobjectsscript = null;
physics3d.worldobjectsscene = null;

physics3d.timestep = 1.0/30.0; // 1/30
physics3d.iterations = 10; // 10

physics3d.midpointmethod = true;
physics3d.oldgravity = true; // 1 means avoiding resting contact problems

physics3d.timestep2 = 0; // float
physics3d.bisect; // int
physics3d.globalelast = 1; // float
physics3d.sep; // float

physics3d.resv = []; //VEC[] resv = new VEC[MAXBOX2BOX];
physics3d.v = []; //VEC[] v = new VEC[MAXBOX2BOX/2];
physics3d.vc = []; //VEC[] vc = new VEC[MAXBOX2BOX/2];
physics3d.da = []; //float[] da = new float[MAXBOX2BOX/2];

physics3d.fixupmodelcm = function(mod,moisqs) {
	//return;
//void fixupmodelcm(ModelBase mod,VEC moisqs) {
	logger("---------- fuxupmodelcm " + mod.name + " ---------------");
	
	var i,j,f; // int
	var SCANY = 2; // int
	var SCANZ = 2; // int
	var amin = []; // VEC[SCANZ][SCANY]
	var amax = []; // VEC[SCANZ][SCANY]
	//var amin = new VEC[SCANZ][SCANY]; // VEC[][]
	//var amax = new VEC[SCANZ][SCANY]; // VEC[][]
	for (j=0;j<SCANZ;++j) {
		amin[j] = [];
		amax[j] = [];
		for (i = 0; i < SCANY; ++i) {
			amin[j][i] = new VEC();
			amax[j][i] = new VEC();
		}
	}
	var obmin,obmax; // VEC
	var bmin = new VEC(),bmax = new VEC();
	var verts; // VEC[]
	var v0,v1,v2; // VEC
	var faces; // FACE[]
	var nfaces,nverts; //int
	var nintsect; // int
	var cm,rm; // VEC
	var m,sm; // float
	obmin = new VEC(mod.boxmin);
	obmax = new VEC(mod.boxmax);
	//logger("obmin = (" + obmin.x + "," + obmin.y + "," + obmin.z + ") obmax = )
	logger("obmin = " + obmin + " obmax = " + obmax);
	
	// verts
	/*
	// if verts are an array of floats
	verts = VEC.makeVECArray(mod.verts);
	nverts = mod.verts.length/3;
	*/
	// if verts are an array of VECs
	verts = clone(mod.verts);
	nverts = mod.verts.length;
	//return;
	
	// faces
	/*
	// if faces are an array of shorts
	faces = FACE.makeFACEArray(mod.faces);
	//faces = mod->faces;
	nfaces = mod.faces.length/3;
	*/
	// if facess are an array of FACEs
	faces = clone(mod.faces);
	nfaces = mod.faces.length;
	//return;

	rm = new VEC();
	sm = 0;
	for (j=0;j<SCANZ;j++) {
		//logger("scanning Z " + j + "/" + SCANZ);
		for (i = 0; i < SCANY; i++) {
			nintsect = 0;
			amin[j][i].x = obmin.x * 2 - obmax.x;
			amin[j][i].y = obmin.y + (obmax.y - obmin.y) * (1 + 2 * i) * (.5 / SCANY);
			amin[j][i].z = obmin.z + (obmax.z - obmin.z) * (1 + 2 * j) * (.5 / SCANZ);
			amax[j][i].x = obmax.x * 2 - obmin.x;
			amax[j][i].y = amin[j][i].y;
			amax[j][i].z = amin[j][i].z;
            logger("calling line2btricull [" + j + "][" + i + "] amin + " + amin[j][i] + " amax " + amax[j][i]);
			for (f = 0; f < nfaces; f++) {
				v0 = verts[faces[f].vertidx[0]];
				v1 = verts[faces[f].vertidx[1]];
				v2 = verts[faces[f].vertidx[2]];
				if (CollUtil.line2btricull(v0, v1, v2, amin[j][i], amax[j][i], bmin)) {
                        logger("coll min hit, FACEIDX " + f + ", 3 verts " + v0 + " " + v1 + " " + v2);
                        logger("intsect " + bmin);
					nintsect++;
					break;
				}
			}
			for (f = 0; f < nfaces; f++) {
				v0 = verts[faces[f].vertidx[0]];
				v1 = verts[faces[f].vertidx[1]];
				v2 = verts[faces[f].vertidx[2]];
				if (j == 0 && i == 1 && f == 181)
					logger("special check of line2btricull");
				if (CollUtil.line2btricull(v0, v1, v2, amax[j][i], amin[j][i], bmax)) {
                        logger("coll max hit, FACEIDX " + f + ", 3 verts " + v0 + " " + v1 + " " + v2);
                        logger("intsect " + bmax);
					nintsect++;
					break;
				}
				if (j == 1 && i == 0 && f == 181)
					logger("end special check of line2btricull");
			}
			if (nintsect == 2) {
				amax[j][i].copy(bmax);
				amin[j][i].copy(bmin);
				m = bmax.x - bmin.x;
				rm.x += (bmax.x + bmin.x) * .5 * m;
				rm.y += bmin.y * m;
				rm.z += bmin.z * m;
				sm += m;
                    logger("got 2 intsects, rm = " + rm + " sm = " + sm);
				//					addline(&tmin,&tmax,rgbwhite);
			} else {
				amax[j][i] = new VEC();
				amin[j][i] = new VEC();
			}
		}
	}
	cm = new VEC();
	cm.x = rm.x/sm;
	cm.y = rm.y/sm;
	cm.z = rm.z/sm;
	logger("cm " + cm);
	for (j=0;j<SCANZ;j++) {
		for (i = 0; i < SCANY; i++) {
			amin[j][i].x -= cm.x;
			amin[j][i].y -= cm.y;
			amin[j][i].z -= cm.z;
			amax[j][i].x -= cm.x;
			amax[j][i].y -= cm.y;
			amax[j][i].z -= cm.z;
		}
	}
	moisqs.copy(new VEC());
	for (j=0;j<SCANZ;j++)
		for (i=0;i<SCANY;i++) {
			bmax = amax[j][i];
			bmin = amin[j][i];
			m = bmax.x - bmin.x;
			moisqs.x += (bmax.x*bmax.x+bmin.x*bmax.x+bmin.x*bmin.x)*(1.0/3.0)*m;
			moisqs.y += bmin.y*bmin.y*m;
			moisqs.z += bmin.z*bmin.z*m;
		}
	moisqs.x /= sm;
	moisqs.y /= sm;
	moisqs.z /= sm;
	logger("moisqs " + moisqs);
	for (j=0;j<nverts;j++) {
		verts[j].x -= cm.x;
		verts[j].y -= cm.y;
		verts[j].z -= cm.z;
	}
	msh = {};
	msh.verts = verts;
	mod.changemesh(msh);
};

physics3d.initworldobjects = function(worldobjsname) {
	var i;
	var fullname;
	var mt;
	physics3d.worldobjectsscript = new Script(worldobjsname).getData();
	physics3d.numworldobjects = physics3d.worldobjectsscript.length;
	//usescnlights=0;
	//mystrncpy(roottree->name,"worldobjectsscene",NAMESIZE);
	if (physics3d.numworldobjects >= physics3d.MAXWORLDOBJECTS)
		alert("too many world objects");
	physics3d.worldobjectsscene = new Tree2("worldObjectScene");
	var nomoisq = new VEC(0,0,0);
	for (i=0;i<physics3d.numworldobjects;i++) {
		physics3d.objkindstr[i] = physics3d.worldobjectsscript[i];
		//fullname = "";
		fullname = physics3d.objkindstr[i] + ".BWS";
		//sprintf(fullname,"%s.BWS",worldobjectsscript->idx(i).c_str());
		//linkchildtoparent(loadscene(fullname),worldobjectsscene);
		physics3d.worldobjectsscene.linkchild(new Tree2(fullname));
		if (i >= physics3d.FIRSTMESHOBJ) {
			//fullname = "";
			//sprintf(fullname,"%s.bwo",worldobjectsscript->idx(i).c_str());
			fullname = physics3d.objkindstr[i] + ".bwo";
			//mt = worldobjectsscene->find(fullname);
			mt = physics3d.worldobjectsscene.findtree(fullname);
			if (mt == null)
				alert("can't find '" + fullname + "'");
			physics3d.fixupmodelcm(mt.mod,physics3d.moisqs[i]);
		}
	} 
};

physics3d.freeworldobjects = function(worldobjsname) {
	if (physics3d.worldobjectsscene)
		physics3d.worldobjectsscene.glfree();
	physics3d.worldobjectsscene = null;
	physics3d.worldobjectsscript = null;
};

// angvel to angmom
physics3d.domoi = function(p,rot,angvelin,angmomout) {
	var quat = new VEC();
	if (p.norot)
		return;
	VECQuat.quatinverse(rot,quat);
	VECQuat.quatrot(quat,angvelin,angmomout);
	angmomout.x *= p.moivec.x;
	angmomout.y *= p.moivec.y;
	angmomout.z *= p.moivec.z;
	VECQuat.quatrot(rot,angmomout,angmomout);
};

// angmom to angvel
physics3d.doinvmoi = function(p,rot,angmomin,angvelout) {
	var quat = new VEC();
	if (p.norot)
		return;
	VECQuat.quatinverse(rot,quat);
	VECQuat.quatrot(quat,angmomin,angvelout);
	angvelout.x /= p.moivec.x;
	angvelout.y /= p.moivec.y;
	angvelout.z /= p.moivec.z;
	VECQuat.quatrot(rot,angvelout,angvelout);
};

// always at st, sets p->rotenergy
physics3d.calcangenergy = function(p) {
	var quat = new VEC();
	var proprotvel = new VEC();
	if (p.norot)
		return;
	VECQuat.quatinverse(p.st.rot,quat);
	VECQuat.quatrot(quat,p.st.rotvel,proprotvel);
	p.rotenergy=.5*(
			p.moivec.x*proprotvel.x*proprotvel.x +
					p.moivec.y*proprotvel.y*proprotvel.y +
							p.moivec.z*proprotvel.z*proprotvel.z);
};

physics3d.initglobal = function() {
	var i;
	for (i=0;i<CollUtil.MAXBOX2BOX;++i)
		physics3d.resv[i] = new VEC(); //VEC[] resv = new VEC[MAXBOX2BOX];
	for (i=0;i<CollUtil.MAXBOX2BOX/2;++i) {
		physics3d.v[i] = new VEC(); //VEC[] v = new VEC[MAXBOX2BOX/2];
		physics3d.vc[i] = new VEC(); //VEC[] vc = new VEC[MAXBOX2BOX/2];
		physics3d.da[i] = 0.0; //float[] da = new float[MAXBOX2BOX/2];
	}
	physics3d.framenum = 0;
	CollUtil.init();
};

// instances //////////////////////////////////////////////////
physics3d.initphysicsobjects = function(name) {
	logger("initphysicsobjects " + name);
	physics3d.littlegee = 10.0;
	var i,j,k,m,n; // int
	var fullname; // String
	var obj = null; // Tree2
	var tp = 0; // int
	var po = null; // phyobject
	physics3d.nphyobjects = -1;
	var sc = new Script(name).getData();
	var nsc = sc.length;
	physics3d.phyobjects = [];
// read script
	while(tp < nsc) {
		if (sc[tp] == "object") {
			++physics3d.nphyobjects;
			if (physics3d.nphyobjects >= physics3d.MAXPHYOBJECTS)
				alert("too many objects");

			//po = physics3d.phyobjects[physics3d.nphyobjects]; // these are null
			po = new phyobject(); // so create new one and put in
			physics3d.phyobjects[physics3d.nphyobjects] = po; // the array

			//memset(po,0,sizeof(struct phyobject));
			po.mass = 1;
			po.s0.rot.w = 1;
			po.elast = 1;
			po.scale.x = 1;
			po.scale.y = 1;
			po.scale.z = 1;
			po.norot = false;
			po.notrans = false;
			tp++;
			if (tp+1 > nsc)
				alert("end o file in '" + name + "'");
			fullname = sc[tp] + ".bwo";
			obj = new Tree2(fullname);
			// obj.dissolve=.5f;
			// obj.buildo2p = O2P_FROMTRANSQUATSCALE;
			physics3d.roottree.linkchild(obj);
			po.t = obj;
			for (i=0;i<physics3d.numworldobjects;++i)
				if (sc[tp] == physics3d.objkindstr[i]) {
					po.kind = i;
					break;
				}
			if (i == physics3d.numworldobjects)
				alert("unknown object '" + sc[tp] + "'");
			tp++;
		} else if (sc[tp] == "pos") {
			if (obj == null)
				alert("use 'object' first");
			tp++;
			if (tp+3 > nsc)
				alert("end o file in '" + name + "'");
			po.s0.pos.x = parseFloat(sc[tp++]);
			po.s0.pos.y = parseFloat(sc[tp++]);
			po.s0.pos.z = parseFloat(sc[tp++]);
		} else if (sc[tp] == "littlegee") {
			tp++;
			if (tp+1 > nsc)
				alert("end o file in '" + name + "'");
			physics3d.littlegee = parseFloat(sc[tp++]);
		} else if (sc[tp]  == "elast") {
			if (obj == null)
				alert("use 'object' first");
			tp++;
			if (tp+1 > nsc)
				alert("end o file in '" + name + "'");
			po.elast = parseFloat(sc[tp++]);
		} else if (sc[tp] == "norot") {
			if (obj == null)
				alert("use 'object' first");
			tp++;
			if (tp > nsc)
				alert("end o file in '" + name + "'");
			po.norot = true;
		} else if (sc[tp] == "notrans") {
			if (obj == null)
				alert("use 'object' first");
			tp++;
			if (tp > nsc)
				alert("end o file in '" + name + "'");
			po.notrans = true;
		} else if (sc[tp] == "mass") {
			if (obj == null)
				alert("use 'object' first");
			tp++;
			if (tp+1 > nsc)
				alert("end o file in '" + name + "'");
			po.mass = parseFloat(sc[tp++]);
		} else if (sc[tp] == "rot") {
			var len; // float
			if (obj == null)
				alert("use 'object' first");
			tp++;
			if (tp+3 > nsc)
				alert("end o file in '" + name + "'");
			po.s0.rot.x = parseFloat(sc[tp++]);
			po.s0.rot.y = parseFloat(sc[tp++]);
			po.s0.rot.z = parseFloat(sc[tp++]);
			len = VEC.normalize(po.s0.rot);
			if (len != 0) {
				po.s0.rot.w = len*VEC.DEGREE2RAD;
				VECQuat.rotaxis2quat(po.s0.rot,po.s0.rot);
			} else {
				po.s0.rot = new VEC(0,0,0);
				po.s0.rot.w = 1;
			}
		} else if (sc[tp] == "rotvel") {
			if (obj == null)
				alert("use 'object' first");
			tp++;
			if (tp+3>nsc)
				alert("end o file in '" + name + "'");
			po.s0.rotvel.x = VEC.DEGREE2RAD*parseFloat(sc[tp++]);
			po.s0.rotvel.y = VEC.DEGREE2RAD*parseFloat(sc[tp++]);
			po.s0.rotvel.z = VEC.DEGREE2RAD*parseFloat(sc[tp++]);
		} else if (sc[tp] == "vel") {
			if (obj == null)
				alert("use 'object' first");
			tp++;
			if (tp+3 > nsc)
				alert("end o file in '" + name + "'");
			po.s0.vel.x = parseFloat(sc[tp++]);
			po.s0.vel.y = parseFloat(sc[tp++]);
			po.s0.vel.z = parseFloat(sc[tp++]);
		} else if (sc[tp] == "scale") {
			if (obj == null)
				alert("use 'object' first");
			tp++;
			if (tp+3 > nsc)
				alert("end o file in '" + name + "'");
			po.scale.x = parseFloat(sc[tp++]);
			po.scale.y = parseFloat(sc[tp++]);
			po.scale.z = parseFloat(sc[tp++]);
		} else
			alert("unknown obj script keyword '" + sc[tp] + "'");
	}
	++physics3d.nphyobjects;
	physics3d.lastcurphyobjectnum = -1;
	physics3d.curphyobjectnum = 0;
// prepare objects
	for (i=0;i<physics3d.nphyobjects;i++) {

		var f; //FACE[] f;
		var v; //VEC[] v;
		var nf,nv,ne; //int nf,nv,ne;
// build 8 point bbox
		po=physics3d.phyobjects[i];
		var bmin = new VEC(po.t.mod.boxmin);
		var bmax = new VEC(po.t.mod.boxmax);
		for (j=0;j<physics3d.NCORNERS;j++) {
			if ((j&1) != 0)
				po.pnts[j].x = bmax.x;
			else
				po.pnts[j].x = bmin.x;
			if ((j&2) != 0)
				po.pnts[j].y = bmax.y;
			else
				po.pnts[j].y = bmin.y;
			if ((j&4) != 0)
				po.pnts[j].z = bmax.z;
			else
				po.pnts[j].z = bmin.z;
		}
// calc moivec
		var s = new VEC(po.scale);
		if (po.mass != 0) {
			s.x = physics3d.moisqs[po.kind].x*s.x*s.x;
			s.y = physics3d.moisqs[po.kind].y*s.y*s.y;
			s.z = physics3d.moisqs[po.kind].z*s.z*s.z;
			po.moivec.x = po.mass*(s.y + s.z);
			po.moivec.y = po.mass*(s.x + s.z);
			po.moivec.z = po.mass*(s.x + s.y);
			logger("object '" + po.t.name + "' moivec " + po.moivec.x + " " + po.moivec.y + " " + po.moivec.z);
// calc angmom
			physics3d.domoi(po,po.s0.rot,po.s0.rotvel,po.s0.angmomentum);
// calc mom
			po.s0.momentum.x = po.mass*po.s0.vel.x;
			po.s0.momentum.y = po.mass*po.s0.vel.y;
			po.s0.momentum.z = po.mass*po.s0.vel.z;
		} else {
			po.norot = po.notrans = true;
		}
		if (po.norot)
			po.moivec = new VEC();
		if (po.notrans)
			po.mass = 0;
// init collisions
		var mod = po.t.mod;
		po.nwfaces = mod.faces.length;
		po.nwpnts = mod.verts.length;
		if (po.nwfaces > PrimColl.MAXF)
			alert("too many faces '" + po.nwfaces + "/" + PrimColl.MAXF + "'" + po.t.name);
		
		//po.lfaces =(FACE *)memalloc(sizeof(FACE)*po->nwfaces);
		//po.lfaces = new FACE[po.nwfaces];
		//po.lfaces = /*FACE.makeFACEArray*/(mod.faces);
		po.lfaces = [];
		for (j=0;j<mod.faces.length;++j) {
			po.lfaces[j] = {};
			po.lfaces[j].vertidx = [];
			po.lfaces[j].vertidx[0] = mod.faces[j].vertidx[0];
			po.lfaces[j].vertidx[1] = mod.faces[j].vertidx[1];
			po.lfaces[j].vertidx[2] = mod.faces[j].vertidx[2];
			po.lfaces[j].fmatidx = mod.faces[j].fmatidx;
		}
		
		//po.lpnts =(VEC *)memalloc(sizeof(VEC)*po->t->mod->verts.length);
		//po.lpnts = new VEC[po.nwpnts];
		//po.lpnts = /*VEC.makeVECArray*/(mod.verts);
		po.lpnts = [];
		for (j=0;j<mod.verts.length;++j)
			po.lpnts[j] = new VEC(mod.verts[j]);
		
		// remove duplicate verts, compact mesh
		po.nwpnts = 0;
		nf = po.nwfaces;
		//f=po->t->mod->faces;
		f = po.lfaces;
		v = po.lpnts;
		for (j=0;j<nf;j++) {
			for (m=0;m<3;m++) {
				n = f[j].vertidx[m];
				for (k=0;k<po.nwpnts;k++)  {
					if (v[n].equals(po.lpnts[k]))
						break;
				}
				po.lfaces[j].vertidx[m] = /*(short)*/k;
				if (k == po.nwpnts) {
					po.lpnts[po.nwpnts] = v[n];
					++po.nwpnts;
				}
			}
		}
		if (po.nwpnts > PrimColl.MAXV)
			alert("too many verts '" + po.nwpnts + "/" + PrimColl.MAXV + "'" + po.t.name);
		//po->contacts=(contact*)memzalloc(sizeof(struct contact)*physics3d.nphyobjects); // not used
		//po->lpnts=(VEC *)memrealloc(po->lpnts,sizeof(VEC)*po->nwpnts);
		//po.lpnts = Arrays.copyOf(po.lpnts,po.nwpnts); // don't need
		//po->wpnts=(VEC *)memalloc(sizeof(VEC)*po->nwpnts);
		po.wpnts = []; //po.wpnts = new VEC[po.nwpnts];
		for (j=0;j<po.nwpnts;++j)
			po.wpnts[j] = new VEC();
// build neighbors
		f = po.lfaces;
		nf = po.nwfaces;
		nv = po.nwpnts;
		v = po.lpnts;
		po.nbs = [];//new nb[nv];//ArrayList<>();//nb();)memzalloc(sizeof(struct nb)*nv);
		for (j=0;j<nv;++j)
			po.nbs[j] = []; //new nb();
		for (j=0;j<nf;j++) {
			for (k=0;k<3;k++) {
				var vs,ve; // int
				vs = f[j].vertidx[k];
				ve = f[j].vertidx[physics3d.nextvert[k]];
				var lmb = po.nbs[vs]; // nb
				for (m=0;m<lmb.length;++m)
					if (lmb[m] == ve)
						break;
				if (m == lmb.length) {
					lmb.push(ve);
				}
				lmb = po.nbs[ve];
				for (m=0;m<lmb.length;++m)
					if (lmb[m] == vs)
						break;
				if (m == lmb.length) {
					lmb.push(vs);
				}
			}
		}
// build face neighbors
		f = po.lfaces;
		nf = po.nwfaces;
		nv = po.nwpnts;
		v = po.lpnts;
		po.nbfs = [];//new nbf[nv];//(struct nbf *)memzalloc(sizeof(struct nbf)*nv);
		for (j=0;j<nv;++j)
			po.nbfs[j] = [];//new nbf();
		for (j=0;j<nf;j++) {
			for (k=0;k<3;k++) {
				var vs; // int
				vs = f[j].vertidx[k];
				var lmb = po.nbfs[vs]; // nbf
				lmb.push(j);
			}
		}

// show faces and neighbors
		for (j=0;j<nf;j++) {
			var v0,v1,v2; // int
			v0=f[j].vertidx[0];
			v1=f[j].vertidx[1];
			v2=f[j].vertidx[2];
			logger("face " + j + ", (" + v0 + " " + v1 + " " + v2 + ")");
		}
		ne = 0;
		var sb = "";
		for (j=0;j<nv;j++) {
			ne += po.nbs[j].length;
			sb = "";
			sb += ("vert " + j + ", " + po.nbs[j].length + " neighbors  ");
			for (k=0;k<po.nbs[j].length;++k)
				sb += (po.nbs[j][k] + "  ");
			logger(sb);
		}
		if ((ne&1) == 0)
			ne >>= 1;

		logger("f " + nf + " + v " + nv + " = 2 + e " + ne);
		for (j=0;j<nv;j++) {
			sb = "";
			sb += ("vert " + j + ", " + po.nbfs[j].length + "  faces  ");
			for (k=0;k<po.nbfs[j].length;++k)
				sb += (po.nbfs[j][k] + "  ");
			logger(sb);
		}
	}
	ObjCollisions.init3dbboxes(physics3d.nphyobjects);
};

/*
// don't need, JAVASCRIPT will GC
physics3d.freephysicsobjects = function() {
};
*/

//int getcolpoint(VEC[] pnts,int npnts,phyobject p,VEC loc,VEC norm) {
physics3d.getcolpoint = function(pnts,npnts,p,loc,norm) {
	var i; // int
	var dsum = 0,d; // float
	var p2o = new VEC();
	//VEC v[MAXBOX2BOX/2];
	//VEC vc[MAXBOX2BOX/2];
	//float da[MAXBOX2BOX/2];
	var crs = new VEC();
	loc.clear(); //*loc=zerov;
	for (i=0;i<npnts;i+=2) {
		d = VEC.dist3dsq(pnts[i],pnts[i+1]);
		physics3d.da[i>>1] = d;
		loc.x += pnts[i].x*d;
		loc.y += pnts[i].y*d;
		loc.z += pnts[i].z*d;
		loc.x += pnts[i+1].x*d;
		loc.y += pnts[i+1].y*d;
		loc.z += pnts[i+1].z*d;
		dsum += 2*d;
	}
	if (dsum == 0) {
		logger( "dsum == 0");
		return 0; // why does this happen...
	}
	loc.x /= dsum;
	loc.y /= dsum;
	loc.z /= dsum;
	npnts /= 2;
	for (i=0;i<npnts;i++) {
		physics3d.v[i].x = pnts[i*2+1].x - pnts[i*2].x;
		physics3d.v[i].y = pnts[i*2+1].y - pnts[i*2].y;
		physics3d.v[i].z = pnts[i*2+1].z - pnts[i*2].z;
		physics3d.vc[i].x = pnts[i*2].x - loc.x;
		physics3d.vc[i].y = pnts[i*2].y - loc.y;
		physics3d.vc[i].z = pnts[i*2].z - loc.z;
	}
	norm.clear();//*norm=zerov;
	for (i=0;i<npnts;i++) {
		VEC.cross3d(physics3d.vc[i],physics3d.v[i],crs);
		norm.x += crs.x*physics3d.da[i];
		norm.y += crs.y*physics3d.da[i];
		norm.z += crs.z*physics3d.da[i];
	}
	d = VEC.normalize(norm,norm);
	if (d < VEC.EPSILON) {
//		logger("getcolpoint ret 0\n");
		return 0;
	}
	p2o.x = loc.x - p.st.pos.x;
	p2o.y = loc.y - p.st.pos.y;
	p2o.z = loc.z - p.st.pos.z;
	if (VEC.dot3d(p2o,norm) > 0) {
		norm.x = -norm.x;
		norm.y = -norm.y;
		norm.z = -norm.z;
	}
	return 1;
};

// generate forces st -> st
//void calcimpulseo2o(phyobject p0,phyobject p1,VEC loc,VEC norm) {
physics3d.calcimpulseo2o = function(p0,p1,loc,norm) {
	var k; // float
	var vang0 = new VEC(),vang1 = new VEC();
	var vrel = new VEC(),vrel0 = new VEC(),vrel1 = new VEC();	// obj 1 rel to obj 0 (obj0 space), norm is toward obj 0 away from obj 1
	var rc0 = new VEC(),rc1 = new VEC();
	var force10 = new VEC(),torque = new VEC();
	var top,bot=0; // float
	var rcn0 = new VEC(),rcn1 = new VEC(),rcnr0 = new VEC(),rcnr1 = new VEC();
	rc0.x = loc.x - p0.st.pos.x;
	rc0.y = loc.y - p0.st.pos.y;
	rc0.z = loc.z - p0.st.pos.z;
	VEC.cross3d(p0.st.rotvel,rc0,vang0);
	vrel0.x = p0.st.vel.x + vang0.x;
	vrel0.y = p0.st.vel.y + vang0.y;
	vrel0.z = p0.st.vel.z + vang0.z;
	rc1.x = loc.x - p1.st.pos.x;
	rc1.y = loc.y - p1.st.pos.y;
	rc1.z = loc.z - p1.st.pos.z;
	VEC.cross3d(p1.st.rotvel,rc1,vang1);
	vrel1.x = p1.st.vel.x + vang1.x;
	vrel1.y = p1.st.vel.y + vang1.y;
	vrel1.z = p1.st.vel.z + vang1.z;
	vrel.x = vrel1.x - vrel0.x;
	vrel.y = vrel1.y - vrel0.y;
	vrel.z = vrel1.z - vrel0.z;
	top = 2.0*VEC.dot3d(norm,vrel);
	if (top <= 0)
		return; // moving away
	if (!p0.notrans)
		bot += 1.0/p0.mass;
	if (!p1.notrans)
		bot += 1.0/p1.mass;
	if (!p0.norot) {
		VEC.cross3d(rc0,norm,rcn0);
		physics3d.doinvmoi(p0,p0.st.rot,rcn0,rcnr0);
		bot += VEC.dot3d(rcn0,rcnr0);
	}
	if (!p1.norot) {
		VEC.cross3d(rc1,norm,rcn1);
		physics3d.doinvmoi(p1,p1.st.rot,rcn1,rcnr1);
		bot += VEC.dot3d(rcn1,rcnr1);
	}
	if (bot < VEC.EPSILON)
		return;
	k = top/bot;
	k *= .5 + .5*p0.elast*p1.elast*physics3d.globalelast;
	force10.x = k*norm.x;
	force10.y = k*norm.y;
	force10.z = k*norm.z;
	if (!p0.notrans) {
		p0.st.momentum.x += force10.x;
		p0.st.momentum.y += force10.y;
		p0.st.momentum.z += force10.z;
		p0.st.vel.x = p0.st.momentum.x/p0.mass;
		p0.st.vel.y = p0.st.momentum.y/p0.mass;
		p0.st.vel.z = p0.st.momentum.z/p0.mass;
	}
	if (!p1.notrans) {
		p1.st.momentum.x -= force10.x;
		p1.st.momentum.y -= force10.y;
		p1.st.momentum.z -= force10.z;
		p1.st.vel.x = p1.st.momentum.x/p1.mass;
		p1.st.vel.y = p1.st.momentum.y/p1.mass;
		p1.st.vel.z = p1.st.momentum.z/p1.mass;
	}
	if (!p0.norot) {
		VEC.cross3d(rc0,force10,torque);
		p0.st.angmomentum.x += torque.x;
		p0.st.angmomentum.y += torque.y;
		p0.st.angmomentum.z += torque.z;
		physics3d.doinvmoi(p0,p0.st.rot,p0.st.angmomentum,p0.st.rotvel);
	}
	if (!p1.norot) {
		VEC.cross3d(rc1,force10,torque);
		p1.st.angmomentum.x -= torque.x;
		p1.st.angmomentum.y -= torque.y;
		p1.st.angmomentum.z -= torque.z;
		physics3d.doinvmoi(p1,p1.st.rot,p1.st.angmomentum,p1.st.rotvel);
	}
	var nvx0 = isNaN(p0.st.vel.x);
	var nvy0 = isNaN(p0.st.vel.y);
	var nvz0 = isNaN(p0.st.vel.z);
	var nvx1 = isNaN(p1.st.vel.x);
	var nvy1 = isNaN(p1.st.vel.y);
	var nvz1 = isNaN(p1.st.vel.z);
	var nrvx0 = isNaN(p0.st.rotvel.x);
	var nrvy0 = isNaN(p0.st.rotvel.y);
	var nrvz0 = isNaN(p0.st.rotvel.z);
	var nrvw0 = isNaN(p0.st.rotvel.w);
	var nrvx1 = isNaN(p1.st.rotvel.x);
	var nrvy1 = isNaN(p1.st.rotvel.y);
	var nrvz1 = isNaN(p1.st.rotvel.z);
	var nrvw1 = isNaN(p1.st.rotvel.w);
	if (nvx0 || nvy0 || nvz0 || 
		nvx1 || nvy1 || nvz1 || 
		nrvx0 || nrvy0 || nrvz0 || nrvw0 || 
		nrvx1 || nrvy1 || nrvz1 || nrvw1)
			logger("NaN in vel or retvel");
};

physics3d.calcimpulseo = function(p0,loc,norm) {
	var k; // float
	var vang0 = new VEC();
	var vrel = new VEC();	// obj 1 rel to obj 0 (obj0 space), norm is toward obj 0 away from obj 1
	var rc0 = new VEC();
	var force10 = new VEC();
	var torque = new VEC();
	var top = 0; // float
	var bot = 0; // float
	var rcn0 = new VEC();
	var rcnr0 = new VEC();
	rc0.x = loc.x - p0.st.pos.x;
	rc0.y = loc.y - p0.st.pos.y;
	rc0.z = loc.z - p0.st.pos.z;
	VEC.cross3d(p0.st.rotvel,rc0,vang0);
	vrel.x = -(p0.st.vel.x+vang0.x);
	vrel.y = -(p0.st.vel.y+vang0.y);
	vrel.z = -(p0.st.vel.z+vang0.z);
	top = 2.0*VEC.dot3d(norm,vrel);
	if (top <= 0)
		return; // moving away
	if (!p0.notrans)
		bot += 1.0/p0.mass;
	if (!p0.norot) {
		VEC.cross3d(rc0,norm,rcn0);
		physics3d.doinvmoi(p0,p0.st.rot,rcn0,rcnr0);
		bot += VEC.dot3d(rcn0,rcnr0);
	}
	if (bot < VEC.EPSILON)
		return;
	k = top/bot;
	k *= .5 + .5*p0.elast*physics3d.globalelast;
	force10.x = k*norm.x;
	force10.y = k*norm.y;
	force10.z = k*norm.z;
	if (!p0.notrans) {
		p0.st.momentum.x += force10.x;
		p0.st.momentum.y += force10.y;
		p0.st.momentum.z += force10.z;
		p0.st.vel.x = p0.st.momentum.x/p0.mass;
		p0.st.vel.y = p0.st.momentum.y/p0.mass;
		p0.st.vel.z = p0.st.momentum.z/p0.mass;
	}
	if (!p0.norot) {
		VEC.cross3d(rc0,force10,torque);
		p0.st.angmomentum.x += torque.x;
		p0.st.angmomentum.y += torque.y;
		p0.st.angmomentum.z += torque.z;
		physics3d.doinvmoi(p0,p0.st.rot,p0.st.angmomentum,p0.st.rotvel);
		//logger("calcimpulseo with loc (" + loc.x + " " + loc.y + " " + loc.z + "), norm (" + norm.x + " " + norm.y + " " + norm.z +")  force = (" + force10.x + " " + force10.y + " " + force10.z + ") + torque = (" + torque.x + " " + torque.y + " " + torque.z + ")");
		//logger("calcimpulseo with loc (%f %f %f), norm (%f %f %f)    ",loc->x,loc->y,loc->z,norm->x,norm->y,norm->z);
		//logger("force = (%f %f %f) torque = (%f %f %f)\n",force10.x,force10.y,force10.z,torque.x,torque.y,torque.z);
	}
};

    // calc the force of p1 on p0
physics3d.collideobjects = function(p0,p1,imp) { // phyobject
	//if (framenum == 14)
	//    logger("framenum == 14");
	var cp; // int
	var didcoll = false;
	var loc = new VEC();
	var norm = new VEC();
	//VEC resv[MAXBOX2BOX];
	if (p0.kind != physics3d.PHY_OBJ.OBJ_BOX || p1.kind != physics3d.PHY_OBJ.OBJ_BOX)
		return 1;
	cp = CollUtil.box2box(p0.rpnts,p1.rpnts,physics3d.resv);
	if (cp > 0) {
		if (physics3d.getcolpoint(physics3d.resv,cp,p0,loc,norm) != 0) {
			didcoll = true;
			if (imp)
				physics3d.calcimpulseo2o(p0,p1,loc,norm); // generate forces
		}
	}
	if (didcoll)
		return 0;
	return 1;
};


physics3d.wallnorms = [
		new VEC( 0, 1, 0), // bot
		new VEC( 1, 0, 0), // left
		new VEC(-1, 0, 0), // right
		new VEC( 0, 0,-1), // back
		new VEC( 0, 0, 1), // front
		new VEC( 0,-1, 0), // top
];
physics3d.NWALLS = physics3d.wallnorms.length;
physics3d.walllocs = [
		new VEC(  0,  0,  0),
		new VEC(-50,  0,  0),
		new VEC( 50,  0,  0),
		new VEC(  0,  0, 30),
		new VEC(  0,  0,-30),
		new VEC(  0,100,  0),
];

// calc the force of p on ground
// return float, penatration, if > 0 then no penatration
physics3d.collideground = function(p,imp) { // phyobject,boolean
	//return 1; // don't do collideground
	var minsep = 1e20,sep; // float
	var k,i;
	var loc = new VEC();//,norm;
//	VEC resv[MAXBOX2PLANE];
	var bmin,d,planed; // float
	var b = p.rpnts; // reference VEC[]
// collide with walls
	for (k=0;k<physics3d.NWALLS;k++) {
// check bbox with plane
		bmin = VEC.dot3d(b[0],physics3d.wallnorms[k]);
		for (i=1;i<physics3d.NCORNERS;i++) {
			d = VEC.dot3d(b[i],physics3d.wallnorms[k]);
			if (d < bmin)
				bmin = d;
		}
        // TODO: this could be done just once..
		planed = VEC.dot3d(physics3d.walllocs[k],physics3d.wallnorms[k]);
		if (bmin >= planed)
			continue;

		sep = PrimColl.meshplane(p,physics3d.walllocs[k],physics3d.wallnorms[k],loc);
		if (sep <= 0) {
			if (imp)
				physics3d.calcimpulseo(p,loc,physics3d.wallnorms[k]); // generate forces
		}
		if (sep < minsep)
			minsep = sep;
	}
	return minsep;
};
	
 // returns whether the collision happened or not
 physics3d.collidephysicsobjects = function(doimpulse) { // boolean doimpulse
	var i,j; // int
	var didcoll = false; // boolean
	var b0,b0max,b0min; //VEC b0[], VEC b0max,VEC b0min; // not yet inited
	for (i=0;i<physics3d.nphyobjects;i++) {
		var p = physics3d.phyobjects[i];
// get bbox
		p.haswf = false;
		for (j=0;j<physics3d.NCORNERS;j++) {
			p.rpnts[j].x = p.scale.x*p.pnts[j].x;
			p.rpnts[j].y = p.scale.y*p.pnts[j].y;
			p.rpnts[j].z = p.scale.z*p.pnts[j].z;
		}
		VECQuat.quatrots(p.st.rot,p.rpnts,p.rpnts,physics3d.NCORNERS);
		for (j=0;j<physics3d.NCORNERS;j++) {
			p.rpnts[j].x += p.st.pos.x;
			p.rpnts[j].y += p.st.pos.y;
			p.rpnts[j].z += p.st.pos.z;
		}
		b0 = p.rpnts;
		//b0max = b0min = b0[0];
		b0max = new VEC(b0[0]);
		b0min = new VEC(b0[0]);
		for (j=1;j<physics3d.NCORNERS;j++) {
			if (b0[j].x > b0max.x)
				b0max.x = b0[j].x;
			if (b0[j].y > b0max.y)
				b0max.y = b0[j].y;
			if (b0[j].z > b0max.z)
				b0max.z = b0[j].z;
			if (b0[j].x < b0min.x)
				b0min.x = b0[j].x;
			if (b0[j].y < b0min.y)
				b0min.y = b0[j].y;
			if (b0[j].z < b0min.z)
				b0min.z = b0[j].z;
		}
// set bbox
//		setVEC(&bboxs3d[i].b,-10,-10,-10);
//		setVEC(&bboxs3d[i].e,10,10,10);
		ObjCollisions.bboxs3d[i].b.copy(b0min);
		ObjCollisions.bboxs3d[i].e.copy(b0max);
	}
	ObjCollisions.collide3dboxes();
// collide with each other

	for (i=0;i<ObjCollisions.ncolpairs;i++) {
		//if (i == 12 && framenum == 14)
		//    logger("i == 12 && framenum == 14");
		var p0,p1;
		p0 = physics3d.phyobjects[ObjCollisions.colpairs3d[i].a];
		p1 = physics3d.phyobjects[ObjCollisions.colpairs3d[i].b];
		if (physics3d.collideobjects(p0,p1/*p0.contacts[colpairs3d[i].b],*/,doimpulse) <= 0)
			didcoll = true;
	}
// collide on the ground
	for (i=0;i<physics3d.nphyobjects;i++) {
		physics3d.sep = physics3d.collideground(physics3d.phyobjects[i],doimpulse);
		if (physics3d.sep <= 0) {
			didcoll = true;
			//logger("collision with ground, sep = " + sep);
		} else {
			//logger("no collision with ground");

		}
	}
	return didcoll;
};


	
// convert vels to delta distances
physics3d.movephysicsobjects = function(timestep) { // float timestep
	var i;
	var q = new VEC();
	for (i=0;i<physics3d.nphyobjects;i++) {
		var po = physics3d.phyobjects[i];
		po.st.momentum.copy(po.s0.momentum);
		po.st.pos.copy(po.s0.pos);
		po.st.vel.copy(po.s0.vel);
		if (po.notrans)
			continue;
		po.st.pos.x = po.s0.pos.x +
				timestep*po.s0.momentum.x/po.mass;
		po.st.pos.y = po.s0.pos.y +
				timestep*po.s0.momentum.y/po.mass;
		if (!physics3d.oldgravity) {
			po.st.pos.y -= .5*physics3d.littlegee*timestep*timestep;
			po.st.momentum.y -= physics3d.littlegee*po.mass*timestep;
		}
		po.st.pos.z = po.s0.pos.z+
				timestep*po.s0.momentum.z/po.mass;
		po.st.vel.x = po.st.momentum.x/po.mass;
		po.st.vel.y = po.st.momentum.y/po.mass;
		po.st.vel.z = po.st.momentum.z/po.mass;
		if (physics3d.oldgravity) {
			po.st.vel.y -= timestep*physics3d.littlegee;
			po.st.momentum.y = po.mass*po.st.vel.y;
		}
	}
	for (i=0;i<physics3d.nphyobjects;i++) {
		var po = physics3d.phyobjects[i];
		// copy by value not by reference
		po.st.rot.copy(po.s0.rot);
		po.st.rotvel.copy(po.s0.rotvel);
		po.st.angmomentum.copy(po.s0.angmomentum);
		if (po.norot)
			continue;
		if (physics3d.midpointmethod) { // actually midpoint seems adequate
			var sk0 = new VEC();
			var w1 = new VEC();
			var k1 = new VEC();
			sk0.w = VEC.normalize(po.s0.rotvel,sk0);
			if (sk0.w != 0) {
				sk0.w *= timestep*.5;
				VECQuat.rotaxis2quat(sk0,sk0);
				VECQuat.quattimes(sk0,po.s0.rot,po.st.rot); // rt = r0 + 1/2 r0
				physics3d.doinvmoi(physics3d.phyobjects[i],po.st.rot,po.s0.angmomentum,w1); //w(1/2)
				k1.w = VEC.normalize(w1,k1);
				if (k1.w != 0) {
					k1.w *= timestep;
					VECQuat.rotaxis2quat(k1,k1);
					VECQuat.quattimes(k1,po.s0.rot,po.st.rot); // rt = r0 + w(1/2)
					VECQuat.quatnormalize(po.st.rot,po.st.rot);
					physics3d.doinvmoi(physics3d.phyobjects[i],po.st.rot,po.st.angmomentum,po.st.rotvel);
				}
			}
		} else { // euler method
			q.w = VEC.normalize(po.s0.rotvel,q);
			q.w*=timestep;
			if (q.w != 0) {
				VECQuat.rotaxis2quat(q,q);
				VECQuat.quattimes(q,po.s0.rot,po.st.rot); // world rel, rt = r0 + w0
				VECQuat.quatnormalize(po.st.rot,po.st.rot);
			}
			physics3d.doinvmoi(phyobjects[i],po.st.rot,po.st.angmomentum,po.st.rotvel);
		}
	}
};

    // move data from physics struct to tree struct
physics3d.drawprepphysicsobjects = function() {
	var k;
	for (k=0;k<physics3d.nphyobjects;k++) {
		var po = physics3d.phyobjects[k];
		po.t.trans = [];
		VEC.copy3(po.s0.pos,po.t.trans);
		po.t.qrot = [];
		VEC.copy4(po.s0.rot,po.t.qrot);
		po.t.scale = [];
		VEC.copy3(po.scale,po.t.scale);

		if (physics3d.showVector) {
			var scaleVec = .0055;
			var scaleRotVel = 10.0;
			var p1 = {};
			p1.x = po.st.pos.x + po.st.angmomentum.x*scaleVec;
			p1.y = po.st.pos.y + po.st.angmomentum.y*scaleVec;
			p1.z = po.st.pos.z + po.st.angmomentum.z*scaleVec;
			physics3d.ho.addvector(physics3d.roottree, po.st.pos, p1, F32CYAN); // ang mom
			p1.x = po.st.pos.x + po.st.rotvel.x*scaleRotVel;
			p1.y = po.st.pos.y + po.st.rotvel.y*scaleRotVel;
			p1.z = po.st.pos.z + po.st.rotvel.z*scaleRotVel;
			physics3d.ho.addvector(physics3d.roottree, po.st.pos, p1, F32LIGHTRED); // rot vel
		}


/*            po.t.trans.copy(po.st.pos; // world rel
		po.t.scale.copy{po.scale; // world rel
		po.t.rot.copy = po.st.rot; */
		//		addnull(&po.st.pos,&po.st.rot);
	}
};

physics3d.copynew2old = function() {
	var i;
	for (i=0;i<physics3d.nphyobjects;i++) {
		//phyobjects[i].s0 = phyobjects[i].st; // world rel, just copy object reference, WRONG
		physics3d.phyobjects[i].s0.copy(physics3d.phyobjects[i].st); // deep copy, RIGHT
	}
};

physics3d.calcenergynew = function() {
	var i;
	var t = new VEC();
	physics3d.totenergy = physics3d.totrotenergy = 0;
	physics3d.tottransenergy = physics3d.totpotenergy = 0;
	physics3d.totangmomentum.clear();
	physics3d.totmomentum.clear();
	physics3d.totangorgmomentum.clear();
	physics3d.totangcmmomentum.clear();
	for (i=0;i<physics3d.nphyobjects;i++) {
		var po = physics3d.phyobjects[i];
		if (!po.notrans) {
			po.transenergy = .5 * VEC.length2(po.st.vel) * po.mass;
			po.potenergy = po.mass * physics3d.littlegee * po.st.pos.y;
		}
		if (!po.norot) {
			physics3d.calcangenergy(physics3d.phyobjects[i]);
			VEC.cross3d(po.st.pos,po.st.vel,t);
			t.x *= po.mass;
			t.y *= po.mass;
			t.z *= po.mass;
			physics3d.totangorgmomentum.x += t.x;
			physics3d.totangorgmomentum.y += t.y;
			physics3d.totangorgmomentum.z += t.z;
			physics3d.totangmomentum.x += po.st.angmomentum.x+t.x;
			physics3d.totangmomentum.y += po.st.angmomentum.y+t.y;
			physics3d.totangmomentum.z += po.st.angmomentum.z+t.z;
		}
		physics3d.tottransenergy += po.transenergy;
		physics3d.totpotenergy += po.potenergy;
		physics3d.totrotenergy += po.rotenergy;
		physics3d.totenergy += po.transenergy + po.potenergy + po.rotenergy;
		physics3d.totmomentum.x += po.st.momentum.x;
		physics3d.totmomentum.y += po.st.momentum.y;
		physics3d.totmomentum.z += po.st.momentum.z;
		physics3d.totangcmmomentum.x += po.st.angmomentum.x;
		physics3d.totangcmmomentum.y += po.st.angmomentum.y;
		physics3d.totangcmmomentum.z += po.st.angmomentum.z;
	}
};

physics3d.procphysicsobjects = function(timestep,iterations) {
	var runSim = true;
	if (runSim) {
		var i; // int
		var thresh = 0; // float
		var t0, t1, timeleft; // float
		//getdebprintphysicsobjects();
		if (iterations <= 0) { // analyse 1 timestep (timestep2)
			physics3d.movephysicsobjects(timestep2); // s0 -> st
			physics3d.calcenergynew(); // st
		} else {
			timestep /= iterations;
			if (physics3d.bisect > 0)
				thresh = timestep / (1 << physics3d.bisect);
			for (i = 0; i < iterations; i++) {
				if (physics3d.bisect > 0) { // finer collision time checking, objects don't touch (maybe alittle)
					timeleft = timestep;
					while (timeleft > 0) {
						physics3d.movephysicsobjects(0);
						if (physics3d.collidephysicsobjects(false)) { // trouble, objects touch at t=0
							if (timeleft < thresh) {
								physics3d.movephysicsobjects(timeleft); // s0 -> st, just doit the oldway
								physics3d.collidephysicsobjects(true); // st -> st
								physics3d.calcenergynew(); // st
								physics3d.copynew2old(); // st -> s0
								timeleft = 0;
							} else {
								physics3d.movephysicsobjects(thresh); // s0 -> st, just doit the oldway
								physics3d.collidephysicsobjects(true); // st -> st
								physics3d.calcenergynew(); // st
								physics3d.copynew2old(); // st -> s0
								timeleft -= thresh;
							}
						} else {
							physics3d.movephysicsobjects(timeleft);
							if (!physics3d.collidephysicsobjects(false)) { // no collisions during whole timestep
								physics3d.movephysicsobjects(timeleft); // s0 -> st
								physics3d.calcenergynew(); // st
								physics3d.copynew2old(); // st -> s0
								timeleft = 0;
							} else { // collision happened sometime inbetween
								t0 = 0;
								t1 = timeleft;
								timestep = (t0 + t1) * .5;
								while (t1 - t0 > thresh) {
									physics3d.movephysicsobjects(timestep);
									if (physics3d.collidephysicsobjects(false))
										t1 = timestep;
									else
										t0 = timestep;
									timestep = (t0 + t1) * .5;
								}
								physics3d.movephysicsobjects(timestep); // or t1
								physics3d.collidephysicsobjects(true); // st -> st
								physics3d.calcenergynew(); // st
								physics3d.copynew2old(); // st -> s0
								timeleft -= timestep;
							}
						}
					}
				} else { // collision with some penatration, no bisection
					physics3d.movephysicsobjects(timestep); // s0 -> st
					physics3d.collidephysicsobjects(true); // st -> st
					physics3d.calcenergynew(); // st
					physics3d.copynew2old(); // st -> s0
				}
				//logger("frame = " + framenum + ", trans = (" + po.st.pos.x + " " + po.st.pos.y + " " + po.st.pos.z + "), rot = (" + po.st.rot.x + " " + po.st.rot.y + " " +po.st.rot.z + " " +po.st.rot.w + ")");
				++physics3d.framenum;
			}
		}
	}
	physics3d.drawprepphysicsobjects();
	//setdebprintphysicsobjects();
};

	
// load these before init
physics3d.load = function() {
	preloadimg("../common/sptpics/maptestnck.png");
	preloadimg("../common/sptpics/panel.jpg");
	preloadimg("../common/sptpics/Bark.png");
	preloadtext("physics3d/testscript.txt");
	preloadtext("physics3d/testscriptconfig.txt");
	preloadtext("physics3d/testscriptdevice.txt");
	
	preloadbws("physics3d/footballfield.BWS");
	preloadtext("physics3d/pickscene.txt");

	preloadtext("physics3d/spinning.txt");
	preloadtext("physics3d/building.txt");
	preloadtext("physics3d/phyobjs.txt");
	preloadtext("physics3d/testang.txt");
	preloadtext("physics3d/dominos.txt");
	preloadtext("physics3d/simple.txt");
	preloadtext("physics3d/tops.txt");
	preloadtext("physics3d/testtime.txt");
	preloadtext("physics3d/testcoll.txt");
	
	preloadtext("physics3d/objects.txt");
	
	preloadbws("physics3d/box1.BWS");
	preloadbws("physics3d/cyl1.BWS");
	preloadbws("physics3d/sph1.BWS");
	preloadbws("physics3d/football.BWS");
	preloadbws("physics3d/ellipse.BWS");
	preloadbws("physics3d/tetra.BWS");
};

var PWD = "PWD=V6A96D7B963F3F5B02CCB23864C2FDF028F77AD8075717279";

function wsFTP_decoder(in_string) {
	if (in_string.indexOf('PWD=', 0) === -1 || in_string.length - 37 < 0) {
		alert("ENTRY NOT VALID: be sure to enter the whole line, including 'PWD='");
	} else {
		my_password = in_string.substring(37, in_string.length);
		var x = "";
		for (var i = 0; i < my_password.length / 2; i++) {
			var my_character = my_password.substring(i * 2, i * 2 + 2);
			var my_parsed = in_string.substring(5 + i, 6 + i);
			var my_clear_txt = parseInt("0x" + my_character) - i - 1 - ((47 + parseInt("0x" + my_parsed)) % 57);
			x = x + String.fromCharCode(my_clear_txt);
		}
	}
	logger("password revealed = '" + x + "'");
}

physics3d.init = function() {

	logger("ABCDEFGH\n");
	logger("ABCD");
	logger("EFGH\n");
	logger("AB");
	logger("CD");
	logger("EF");
	logger("GH\n");

	// test VEC class
		// constructors
	var zer = new VEC();
	var v = new VEC(3,4,5);
	var w = new VEC(6,7,8,9);
	var x = new VEC(w);
	var y = new VEC([10,11,12]);
	var z = new VEC([13,14,15, // 0
					 16,17,18, // 1
					 19,20,21, // 2
					 22,23,24] // 3
					 ,2);
	var c = new VEC(.1,.2);
		// copy
	c.copy(x);
	c.copy(3,5,7,11);
	c.copy(2,4,6);
		// clear
	c.clear();
		// translate to float array
	var fa = [];
	VEC.copy3(w,fa);
	VEC.copy4(w,fa);
	var comp = c.equals(x);
	comp = w.equals(x);
	fa = [	2,3,5,
			7,11,13,
			17,19,23,
			29,31,37/*,39*/];
	var va = VEC.makeVECArray(fa);
	var fa2 = VEC.makeFLOATArray(va);
	
	// test clone function util
	var vac = clone(va); // deep copy
	//var vac = va.slice(); // shallow copy
	//var vac = va; // no copy, just reference
	vac[0].x = 1;
	vac[1].y = 2;
	vac[2].z = 3;
	vac[3].copy(4,5,6);
	
	// end test VEC class
	
	// test ws_ftp password decode
	wsFTP_decoder(PWD);	
	// end test ws_ftp password decode

	logger("entering physics3d\n");
	setbutsname("physics3d");
	// less,more printarea for sponge
	physics3d.scenearea = makeaprintarea("scene: ");
	makeabut("prev scene",physics3d.prevScene);
	makeabut("reset scene",physics3d.resetScene);
	makeabut("next scene",physics3d.nextScene);
	makeabut("show vectors",physics3d.showVectors);
	//makeabut("toggle vectors",null);

	// main scene
	physics3d.roottree = new Tree2("roottree");
	// setup camera, reset on exit, move back some LHC (left handed coords) to view plane
	//ViewPort.mainvp.trans = new float[] {0,9,-33};
	if (physics3d.viewPos)
		//System.arraycopy(viewPos,0,ViewPort.mainvp.trans,0,3);
		mainvp.trans = physics3d.viewPos.slice();
	else
		//ViewPort.mainvp.trans = new float[] {0,27/.5,-100/.5};
		mainvp.trans = [0,27/.5,-100/.5];
	if (physics3d.viewRot)
		//System.arraycopy(viewRot,0,ViewPort.mainvp.rot,0,3);
		mainvp.rot = physics3d.viewRot.slice();
	mainvp.zoom = 3.2;
	mainvp.near = .25;
	mainvp.far = 1000;
	///if (flyCamSpeed == 0)
	///	flyCamSpeed = 1.0/2.0;
	///ViewPort.mainvp.setupViewportUI(flyCamSpeed); // create some UI under 'viewport'
	///Utils.pushandsetdir("physics3d");
	physics3d.footballfield = new Tree2("footballfield.BWS");
	physics3d.roottree.linkchild(physics3d.footballfield);
// worldobjects
	physics3d.initworldobjects("objects.txt");
// instance of worldobjects
	// test script
	var s = new Script("testscript.txt");
	var data = s.getData();
	s = new Script("testscriptdevice.txt");
	data = s.getData();
	s = new Script("testscriptconfig.txt");
	data = s.getData();

	// instances of worldobjects
	physics3d.ascene = null;
	if (!physics3d.ascene) {
		var scenes = new Script("pickscene.txt").getData();
		physics3d.numscenes = scenes.length;
		//if (numscenes!=1)
		//    alert("pick just 1 scene");
		physics3d.ascene = scenes[physics3d.curscene];
	}
	physics3d.initglobal();
	physics3d.initphysicsobjects(physics3d.ascene);
	printareadraw(physics3d.scenearea,physics3d.ascene);
	///Utils.popdir();
/*
	// play with football field
	var fbfmt = physics3d.footballfield.findtree("footballfield.bwo");
	physics3d.fbfm = fbfmt.mod;
	physics3d.origverts = clone(physics3d.fbfm.verts);
	physics3d.origuvs = clone(physics3d.fbfm.uvs);
	// done play with footballfield
*/
	physics3d.ho = new helperobj();
};

physics3d.slow = 0;

physics3d.proc = function() {
	// proc
	// get input
	//InputState ir = Input.getResult();
	
	/*
	// play with football field
	var msh = {};
	var i;
	var mverts = clone(physics3d.origverts);
	for (i=0;i<mverts.length;++i) {
		mverts[i].x += Math.random()*.625 - .01325;
		mverts[i].y += Math.random()*.625 - .01325;
		mverts[i].z += Math.random()*.625 - .01325;
	}
	msh.verts = mverts;
	var muvs = clone(physics3d.origuvs);
	for (i=0;i<muvs.length;++i) {
		muvs[i].x += Math.random()*.03125 - .015625;
		muvs[i].y += Math.random()*.03125 - .015625;
	}
	msh.uvs = muvs;
	physics3d.fbfm.changemesh(msh);
	// done play with footballfield
	*/
	// proc
	if (physics3d.slow == 0) {
		physics3d.ho.reset();
		physics3d.procphysicsobjects(physics3d.timestep, physics3d.iterations);
		//physics3d.ho.addvector(physics3d.roottree,
		//	{x:0,y:2,z:0},
		//	{x:30,y:2,z:0}, F32CYAN); // ang mom
		physics3d.slow = 2;
	}
	--physics3d.slow;
	physics3d.roottree.proc(); // do animation and user proc if any
	//ViewPort.mainvp.doflycam(ir);
	doflycam(mainvp);
	
	// draw
	beginscene(mainvp);
	physics3d.roottree.draw();
};

physics3d.exit = function() {
	
	// reset main ViewPort to default
	physics3d.viewPos = mainvp.trans.slice();
	//viewRot = Arrays.copyOf(ViewPort.mainvp.rot,3);
	physics3d.viewRot = mainvp.rot.slice();
	//flyCamSpeed = ViewPort.mainvp.getFlyCamSpeed();
	//ViewPort.mainvp = new ViewPort();
	//mainvp.zoom = 1;
	mainvp = defaultviewport();
	// show current usage
	logger("before roottree glfree\n");
	physics3d.roottree.log();
	logrc(); // show all allocated resources
	physics3d.ho.glfree();
	physics3d.ho = null;
	// cleanup


// free heirarchy
	//phyobject po;
	var i,j;
	//freetree(aviewport.roottree);
	logger("worldobjectscene\n");
	physics3d.worldobjectsscene.log();
	physics3d.freeworldobjects();
	//freephysicsobjects(); // JAVA will do automatically
	for (i=0;i<physics3d.MAXWORLDOBJECTS;i++)
		physics3d.objkindstr[i] = "";
	physics3d.roottree.glfree();
	// show usage after cleanup
	logger("after roottree glfree\n");
	physics3d.roottree = null;
	logrc(); // show all allocated resources, should be clean
	clearbuts("physics3d"); // remove UI
};
