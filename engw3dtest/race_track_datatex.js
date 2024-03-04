'use strict';

function raceGetDataTex() {	// start build a datatexture procedurally
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
    const dataTex = DataTexture.createtexture("trackdatatex",texX,texY,texdataarr32);
    const dataTree = buildplanexy("dataTexPlane",1,1,"trackdatatex","tex");
    dataTex.glfree();
    return dataTree;
}
