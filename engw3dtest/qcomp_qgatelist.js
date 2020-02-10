/*
	name,		used for enums in qcomp.qtype, ex. qcomp.qtype.CNOTT == 1, mostly code
	fullname, 	used for png files, pretty names, and names inside a .qcmp file
	curpart,	0 thru numparts - 1
	numparts,	numqubits for this gate
	
*/
// return a matrix that, for now only 1 qubit control and target, yielding a 2 qubit gate
//qcomp.controlgate = function(kind) {
//	return null;
//};

qcomp.buildtoffoli = function(nqb) {
	var ret = qcomp.QMat.qmatqu(nqb);
	var dim = 1<<nqb;
	var lst  = dim - 1;
	var lst2 = dim - 2;
	var retele = ret.ele;
	retele[lst ][lst ] = 0;
	retele[lst ][lst2] = 1;
	retele[lst2][lst ] = 1;
	retele[lst2][lst2] = 0;
	return retele;
};

qcomp.qgateinfo = [
	// 1 qubit
	{name:"PASSTHRU",fullname:"NONE"},
	{name:"HADAMARD",fullname:"HADAMARD",
		gatemat:[
			[qcomp.SR2O2, qcomp.SR2O2],
			[qcomp.SR2O2,-qcomp.SR2O2]
		]
	},
	{name:"NOT",fullname:"NOT (PX)",
		gatemat:[
			[0,1],
			[1,0]
		]
	},
	{name:"PX",fullname:"PX (NOT)",
		gatemat:[
			[0,1],
			[1,0]
		]
	},
	{name:"PY",fullname:"PY",
		gatemat:[
			[0,[0,-1]],
			[[0,1],0]
		]
	},
	{name:"PZ",fullname:"PZ",
		gatemat:[
			[1, 0],
			[0,-1]
		]
	},

	// from Q experience
	{name:"PZO2",fullname:"S",
		gatemat:[
			[1, 0],
			[0, [0,1]]
		]
	},  // S  gate,  sqrt(PZ) ,  PI/2
	{name:"PZMO2",fullname:"St",
		gatemat:[
			[1, 0],
			[0, [0,-1]]
		]
	}, // St gate, -sqrt(PZ) , -PI/2
	{name:"PZO4",fullname:"T",
		gatemat:[
			[1, 0],
			[0, [qcomp.SR2O2,qcomp.SR2O2]]
		]
	},  // T  gate,  sqrt(S ) ,  PI/4
	{name:"PZMO4",fullname:"Tt",
		gatemat:[
			[1, 0],
			[0, [qcomp.SR2O2,-qcomp.SR2O2]]
		]
	}, // Tt gate, -sqrt(St) , -PI/4
	
	{name:"SNOTTO",fullname:"SNOT TWOAK",
		gatemat:[
			[qcomp.SR2O2,-qcomp.SR2O2],
			[qcomp.SR2O2, qcomp.SR2O2]
		]
	},
	{name:"SNOTWP",fullname:"SNOT WIKIPEDIA",
		gatemat:[
			[[.5,.5],[.5,-.5]],
			[[.5,-.5],[.5,.5]]
		]
	},
	// help make a W 3 qubit state
	{name:"PG",fullname:"G1Over3",
		gatemat:[
			[qcomp.SR2D3, -qcomp.SR1D3],
			[qcomp.SR1D3,qcomp.SR2D3]
		]
	},
	// help make a W 3 qubit state (inverse)
	{name:"PMG",fullname:"GM1Over3",
		gatemat:[
			[qcomp.SR2D3, qcomp.SR1D3],
			[-qcomp.SR1D3,qcomp.SR2D3]
		]
	},
	
	{name:"SPLITTER",fullname:"SPLITTER",
		gatemat:[
			[qcomp.SR2O2,[0,qcomp.SR2O2]],
			[[0,qcomp.SR2O2],qcomp.SR2O2]
		]
	},
	{name:"MIRROR",fullname:"MIRROR",
		gatemat:[
			[[0,1],0],
			[0,[0,1]]
		]
	},
	
	// pretty up the matrices
	{name:"P45",fullname:"P 45",
		gatemat:[
			[[qcomp.SR2O2,qcomp.SR2O2], 0],
			[0, [qcomp.SR2O2,qcomp.SR2O2]]
		]
	},
	{name:"PM45",fullname:"P -45",
		gatemat:[
			[[qcomp.SR2O2,-qcomp.SR2O2], 0],
			[0, [qcomp.SR2O2,-qcomp.SR2O2]]
		]
	},
	{name:"P30",fullname:"P 30",
		gatemat:[
			[[qcomp.SR3O2,.5],0],
			[0,[qcomp.SR3O2,.5]]
		]
	},
	{name:"PM30",fullname:"P -30",
		gatemat:[
			[[qcomp.SR3O2,-.5],0],
			[0,[qcomp.SR3O2,-.5]]
		]
	},
	{name:"M0",fullname:"M0",
		gatemat:[
			[1,0],
			[0,0]
		]
	},
	{name:"M1",fullname:"M1",
		gatemat:[
			[0,0],
			[0,1]
		]
	},

	// 2 qubits
	{name:"SWAPT",fullname:"SWAP TOP",curpart:0,numparts:2,// top half
		gatemat:[
			[1,0,0,0],
			[0,0,1,0],
			[0,1,0,0],
			[0,0,0,1],
		]
	}, 
	{name:"SWAPB",fullname:"SWAP BOTTOM",curpart:1,numparts:2}, // bottom half
	{name:"CNOTT",fullname:"CNOT TOP",curpart:0,numparts:2/*,gatemat:qcomp.controlgate(qcomp.qtype.NOT)*/},
	{name:"CNOTB",fullname:"CNOT BOTTOM",curpart:1,numparts:2},
	{name:"CZT",fullname:"CZ TOP",curpart:0,numparts:2/*,gatemat:qcomp.controlgate(qcomp.qtype.CZ)*/},
	{name:"CZB",fullname:"CZ BOTTOM",curpart:1,numparts:2},
	{name:"CYT",fullname:"CY TOP",curpart:0,numparts:2},
	{name:"CYB",fullname:"CY BOTTOM",curpart:1,numparts:2},
	{name:"CHT",fullname:"CH TOP",curpart:0,numparts:2},
	{name:"CHB",fullname:"CH BOTTOM",curpart:1,numparts:2},
	
	{name:"CST",fullname:"CS TOP",curpart:0,numparts:2},
	{name:"CSB",fullname:"CS BOTTOM",curpart:1,numparts:2},
	{name:"CStT",fullname:"CSt TOP",curpart:0,numparts:2},
	{name:"CStB",fullname:"CSt BOTTOM",curpart:1,numparts:2},
	
	{name:"CTT",fullname:"CT TOP",curpart:0,numparts:2},
	{name:"CTB",fullname:"CT BOTTOM",curpart:1,numparts:2},
	{name:"CTtT",fullname:"CTt TOP",curpart:0,numparts:2},
	{name:"CTtB",fullname:"CTt BOTTOM",curpart:1,numparts:2},
	
	{name:"CP45T",fullname:"CP 45 TOP",curpart:0,numparts:2},
	{name:"CP45B",fullname:"CP 45 BOTTOM",curpart:1,numparts:2},
	{name:"CPM45T",fullname:"CP -45 TOP",curpart:0,numparts:2},
	{name:"CPM45B",fullname:"CP -45 BOTTOM",curpart:1,numparts:2},
	{name:"CP30T",fullname:"CP 30 TOP",curpart:0,numparts:2},
	{name:"CP30B",fullname:"CP 30 BOTTOM",curpart:1,numparts:2},
	{name:"CPM30T",fullname:"CP -30 TOP",curpart:0,numparts:2},
	{name:"CPM30B",fullname:"CP -30 BOTTOM",curpart:1,numparts:2},
	{name:"DECT",fullname:"DEC TOP",curpart:0,numparts:2,
		gatemat:[
			[0,1,0,0],
			[0,0,1,0],
			[0,0,0,1],
			[1,0,0,0],
		]
	},
	{name:"DECB",fullname:"DEC BOTTOM",curpart:1,numparts:2},
	// 3 qubits
	{name:"FREDKINT",fullname:"FREDKIN TOP",curpart:0,numparts:3,
		gatemat:[
			[1,0,0,0,0,0,0,0],
			[0,1,0,0,0,0,0,0],
			[0,0,1,0,0,0,0,0],
			[0,0,0,1,0,0,0,0],
			[0,0,0,0,1,0,0,0],
			[0,0,0,0,0,0,1,0],
			[0,0,0,0,0,1,0,0],
			[0,0,0,0,0,0,0,1]
		]
	},
	{name:"FREDKINM",fullname:"FREDKIN MIDDLE",curpart:1,numparts:3},
	{name:"FREDKINB",fullname:"FREDKIN BOTTOM",curpart:2,numparts:3},
	{name:"TOFFOLIT",fullname:"TOFFOLI TOP",curpart:0,numparts:3,
		gatemat:qcomp.buildtoffoli(3)
	},
	{name:"TOFFOLIM",fullname:"TOFFOLI MIDDLE",curpart:1,numparts:3},
	{name:"TOFFOLIB",fullname:"TOFFOLI BOTTOM",curpart:2,numparts:3},
	// 4 qubits
	{name:"TOFFOLI4C0",fullname:"TOFFOLI 4C0",curpart:0,numparts:4,
		gatemat:qcomp.buildtoffoli(4)
	},
	{name:"TOFFOLI4C1",fullname:"TOFFOLI 4C1",curpart:1,numparts:4},
	{name:"TOFFOLI4C2",fullname:"TOFFOLI 4C2",curpart:2,numparts:4},
	{name:"TOFFOLI4T",fullname:"TOFFOLI 4T",curpart:3,numparts:4},
	// 5 qubits
	{name:"TOFFOLI5C0",fullname:"TOFFOLI 5C0",curpart:0,numparts:5,
		gatemat:qcomp.buildtoffoli(5)
	},
	{name:"TOFFOLI5C1",fullname:"TOFFOLI 5C1",curpart:1,numparts:5},
	{name:"TOFFOLI5C2",fullname:"TOFFOLI 5C2",curpart:2,numparts:5},
	{name:"TOFFOLI5C3",fullname:"TOFFOLI 5C3",curpart:3,numparts:5},
	{name:"TOFFOLI5T",fullname:"TOFFOLI 5T",curpart:4,numparts:5},
	// 6 qubits
	{name:"TOFFOLI6C0",fullname:"TOFFOLI 6C0",curpart:0,numparts:6,
		gatemat:qcomp.buildtoffoli(6)
	},
	{name:"TOFFOLI6C1",fullname:"TOFFOLI 6C1",curpart:1,numparts:6},
	{name:"TOFFOLI6C2",fullname:"TOFFOLI 6C2",curpart:2,numparts:6},
	{name:"TOFFOLI6C3",fullname:"TOFFOLI 6C3",curpart:3,numparts:6},
	{name:"TOFFOLI6C4",fullname:"TOFFOLI 6C4",curpart:4,numparts:6},
	{name:"TOFFOLI6T",fullname:"TOFFOLI 6T",curpart:5,numparts:6},

	// done
	//{name:"QTYPEENUM"}
];

qcomp.qtype = makeEnum(qcomp.qgateinfo);

// build 2 qubit gates from control and 1 qubit gates
// src dest
qcomp.buildcontroldata = [
	[qcomp.qtype.NOT,qcomp.qtype.CNOTT],
	[qcomp.qtype.PZ,qcomp.qtype.CZT],
	
	[qcomp.qtype.PY,qcomp.qtype.CYT],
	[qcomp.qtype.HADAMARD,qcomp.qtype.CHT],
	[qcomp.qtype.P45,qcomp.qtype.CP45T],
	[qcomp.qtype.PM45,qcomp.qtype.CPM45T],
	[qcomp.qtype.P30,qcomp.qtype.CP30T],
	[qcomp.qtype.PM30,qcomp.qtype.CPM30T],
	
	
	[qcomp.qtype.PZO2,qcomp.qtype.CST],
	[qcomp.qtype.PZMO2,qcomp.qtype.CStT],
	[qcomp.qtype.PZO4,qcomp.qtype.CTT],
	[qcomp.qtype.PZMO4,qcomp.qtype.CTtT],
];

// extend 1 qubit gates to 2 qubit gates with a control
qcomp.buildcontrolgates = function() {
	var i;
	for (i=0;i<qcomp.buildcontroldata.length;++i) {
		var src = qcomp.buildcontroldata[i][0];
		var qmsrcele = qcomp.qgateinfo[src].gatemat;
		var qmdest = qcomp.QMat.qmatqu(2);
		var qmdestele = qmdest.ele;
		qmdestele[2][2] = qmsrcele[0][0];
		qmdestele[2][3] = qmsrcele[0][1];
		qmdestele[3][2] = qmsrcele[1][0];
		qmdestele[3][3] = qmsrcele[1][1];
		var dst = qcomp.buildcontroldata[i][1];
		qcomp.qgateinfo[dst].gatemat = qmdest.ele;
	}
};

//qcomp.qgateinfo;

qcomp.buildcontrolgates();

// makes above like
/*
{
	PASSTHRU:0,
	HADAMARD:1, etc..
	TOFFOLI6T:59, // last gate for awhile, (60 gate pieces)
	QTYPEENUM:60 // maybe no more, use qcomp.qgateinfo.length instead
};
*/
/*
qcomp.qgfilenames = [
	// 1 qubit gates
	"NONE",
	"HADAMARD",
	"SPLITTER",
	"MIRROR",
	
	"SNOT TWOAK",
	"SNOT WIKIPEDIA",
	"NOT (PX)",
	"PX (NOT)",
	"PY",
	"PZ",
	
	// from Q experience
	"S",
	"St",
	"T",
	"Tt",
	// help make a W 3 qubit state
	"G1Over3",

	// pretty up the matrices
	"P 45",
	"P -45",
	"P 30",
	"P -30",

	// 2 qubit gates
	"SWAP TOP",
	"SWAP BOTTOM",
	"CNOT TOP",
	"CNOT BOTTOM",
	"CZ TOP",
	"CZ BOTTOM",
	"CY TOP",
	"CY BOTTOM",
	"CH TOP",
	"CH BOTTOM",
	"CP 45 TOP",
	"CP 45 BOTTOM",
	"CP -45 TOP",
	"CP -45 BOTTOM",
	"CP 30 TOP",
	"CP 30 BOTTOM",
	"CP -30 TOP",
	"CP -30 BOTTOM",
	"DEC TOP",
	"DEC BOTTOM",
	// 3 qubit gates
	"FREDKIN TOP",
	"FREDKIN MIDDLE",
	"FREDKIN BOTTOM",
	"TOFFOLI TOP",
	"TOFFOLI MIDDLE",
	"TOFFOLI BOTTOM",
	// 4 qubit gates
	"TOFFOLI 4C0",
	"TOFFOLI 4C1",
	"TOFFOLI 4C2",
	"TOFFOLI 4T",
	// 5 qubit gates
	"TOFFOLI 5C0",
	"TOFFOLI 5C1",
	"TOFFOLI 5C2",
	"TOFFOLI 5C3",
	"TOFFOLI 5T",
	// 6 qubit gates
	"TOFFOLI 6C0",
	"TOFFOLI 6C1",
	"TOFFOLI 6C2",
	"TOFFOLI 6C3",
	"TOFFOLI 6C4",
	"TOFFOLI 6T", 
];
*/
