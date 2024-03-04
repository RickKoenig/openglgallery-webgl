'use strict';

function raceGetTurn() {
    const turnMeshMulti = {
        "verts": [
            // inner fan
            -1, -1, 0,
            -1, -1/3, 0,
            -2/3, -1/2, 0,
            -1/2, -2/3, 0,
            -1/3, -1, 0,
            // middle strip
            1/3, -1, 0,
            -1/3, -1, 0,
            0, -1/3, 0,
            -1/2, -2/3, 0,
            -1/3, 0, 0,
            -2/3, -1/2, 0,
            -1, 1/3, 0,
            -1, -1/3, 0,
            // outer fan
            1, 1, 0,
            1, -1, 0,
            1/3, -1, 0,
            0, -1/3, 0,
            -1/3, 0, 0,
            -1, 1/3, 0,
            -1, 1, 0,
        ]
    };
    const turnmodelmulti = Model2.createmodel("track_multiTurn");
    if (turnmodelmulti.refcount == 1) {
        race_track.mapUVs(turnMeshMulti);
        turnmodelmulti.setmesh(turnMeshMulti);
        turnmodelmulti.addmat("tex", "panel.jpg", 0, 5, modelflagenums.FAN);
        turnmodelmulti.addmat("tex", "maptestnck.png", 0, 8,modelflagenums.STRIP);
        turnmodelmulti.addmat("tex", "panel.jpg", 0, 7, modelflagenums.FAN);
        turnmodelmulti.commit();
    }
    const turnTree = new Tree2("track_turnMulti");
    turnTree.setmodel(turnmodelmulti);
    turnTree.trans = [-3,-2,0];
    turnTree.scale = [.5,.5,1];
    return turnTree;
}

/*
	case PCE_TURN:
// 4 corners
		copy(baseverts,baseverts+4,wverts);
// start of turn on bottom
		wverts[4].x=PIECESIZE*rightside;
		wverts[4].y=0;
		wverts[4].z=0;
		wverts[4+PRES].x=PIECESIZE*leftside;
		wverts[4+PRES].y=0;
		wverts[4+PRES].z=0;
// middle of turn up and to the left
		for (i=1;i<PRES-1;i++) {
			wverts[4+i].x=(PIECESIZE*rightside)*cosf(PI*.5f*float(i)/(PRES-1));
			wverts[4+i].y=0;
			wverts[4+i].z=(PIECESIZE*rightside)*sinf(PI*.5f*float(i)/(PRES-1));
			wverts[4+PRES+i].x=(PIECESIZE*leftside)*cosf(PI*.5f*float(i)/(PRES-1));
			wverts[4+PRES+i].y=0;
			wverts[4+PRES+i].z=(PIECESIZE*leftside)*sinf(PI*.5f*float(i)/(PRES-1));
		}
// end of turn at the left
		wverts[4+PRES-1].x=0;
		wverts[4+PRES-1].y=0;
		wverts[4+PRES-1].z=PIECESIZE*rightside;
		wverts[4+2*PRES-1].x=0;
		wverts[4+2*PRES-1].y=0;
		wverts[4+2*PRES-1].z=PIECESIZE*leftside;
		rotpiece(wverts,PRES*2+4,p->rot);
		for (i=0;i<PRES*2+4;i++) {
			wuvs[i].u=wverts[i].x*(1.0f/PIECESIZE);
			wuvs[i].v=1-wverts[i].z*(1.0f/PIECESIZE);
		}
		copy(wverts,wverts+2*PRES+4,wverts+2*PRES+4);
		copy(wuvs,wuvs+2*PRES+4,wuvs+2*PRES+4);
		for (i=2*PRES+4;i<2*(2*PRES+4);++i)
			wverts[i].y=height*pieceheight;
// register verts and uvs with the model
		m->copyverts(wverts,2*(2*PRES+4));
		m->copyuvs0(wuvs,2*(2*PRES+4));
// register faces for backgnd
// backgnd
		if (height==0.0f) {
			m->addmatn("tex",SMAT_HASTEX|SMAT_HASWBUFF|SMAT_CALCLIGHTS,
				basetexnames[bt],0,30,PRES-1+PRES-1+2,2*PRES+4);
// build inner fan
			for (i=0;i<PRES-1;i++)
				m->addface(0,i+4+1,i+4);
// build outer fan
			for (i=0;i<PRES-1;i++)
				m->addface(3,PRES+i+4,PRES+i+4+1);
			m->addface(4+PRES,3,1);
			m->addface(4+2*PRES-1,2,3);
		} else {
			m->addmatn("tex",SMAT_HASTEX|SMAT_HASWBUFF|SMAT_CALCLIGHTS,
				basetexnames[bt],0,30,2,2*PRES+4);
			m->addface(0,2,1);
			m->addface(1,2,3);
		}
// track
		m->addmatn("tex",SMAT_HASTEX|SMAT_HASWBUFF|SMAT_CALCLIGHTS,
			"4pl_tile01.jpg",0,30,2*(PRES-1+PRES-1),2*PRES+4);
		for (i=0;i<PRES-1;i++) {
			m->addface(4+i+4+2*PRES,4+PRES+1+i+4+2*PRES,4+PRES+i+4+2*PRES,true);
			m->addface(4+i+4+2*PRES,4+1+i+4+2*PRES,4+PRES+1+i+4+2*PRES,true);
		}
		break;
*/
