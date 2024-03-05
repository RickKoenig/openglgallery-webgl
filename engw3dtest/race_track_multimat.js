'use strict';

function raceGetMultiMat() {
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

    // build multi model
    var multimodel = Model2.createmodel("trackmultimaterial");
    if (multimodel.refcount == 1) {
        multimodel.setmesh(multimesh);
        multimodel.addmat("tex","take0016.jpg",2,4);
        multimodel.addmat("tex","maptestnck.png",2,4);
        multimodel.commit();
    }
    const multiTree = new Tree2("trackmultimaterial");
    multiTree.setmodel(multimodel);
    return multiTree;
}
