// albert's socks, plus possible 3 socks in a column
// state 5b
var state5b = {};
// drawer enums: 0 closed, 1 closed locked out, 2 empty, 3 sock
state5b.resetdrawers = function() {
	state5b.drawers = [[0,0,0],[0,0,0],[0,0,0]];
//	state5b.drawers = [[0,1,2],[3,0,0],[0,0,0]];
	state5b.cntr = 0;
	state5b.done = false;
//	logger_str = "resetdrawers = ";
};

/* info about the drawers
// 0 no drawers open, 1 one drawer open HV, 2 two drawers open H, 3 two drawers open V, 4 three drawers open H, 5 three drawers open V
// returns object with 
{
	nopen; // number of open drawers
	dir; // 1 horz, 2 vert, 0 both
	nsocks; // number of socks in open drawers
}
*/
state5b.drawersinfo = function() {
	var ret = {};
	ret.dir = 0;
	// if at least 3 drawers are empty or sock
	var dop = 0;
	var ns = 0;
	var i,j;
	var nh = [0,0,0];
	var nv = [0,0,0];
	for (j=0;j<3;++j) {
		for (i=0;i<3;++i) {
			var dv = state5b.drawers[j][i];
			if (dv >= 2) {
				++dop;
				++nh[j];
				++nv[i];
			}
			if (dv == 3)
				++ns;
		}
	}
	for (i=0;i<3;++i) {
		if (nh[i] >= 2)
			ret.dir = 1;
		if (nv[i] >= 2)
			ret.dir = 2;
	}
	ret.nopen = dop;
	ret.nsocks = ns;
	return ret;
};

// return 2 or 3
state5b.sockprob = function(p) {
	logger(" (sockprob = " + p.toFixed(4) + ")");
	return Math.random() < p ? 3 : 2;
};

// event
state5b.clickdrawer = function(x,y) {
	var v = state5b.drawers[y][x];
	if (v == 0) { // closed, not locked
		v = 2; // empty, add probable sock later
		state5b.drawers[y][x] = v; // mark as empty for drawsinfo
		di = state5b.drawersinfo();
		switch (di.nopen) {
		case 1: // one drawer opened
		case 2: // 2nd drawer opened
			v = state5b.sockprob(1/2);
//			break;
			//v = 3;
			//if (di.dir == 1) { // H
				//v = 3;
				//if (di.nsocks == 0) {
					v = state5b.sockprob(1/2);
				//} else { // di.nsocks == 1
				//	v = state5b.sockprob(1/2);
				//}
			/*} else { // di.dir == 2 // V
				//v = 3;
				if (di.nsocks == 0) {
					v = state5b.sockprob(1/2);
				} else { // di.nsocks == 1
					v = state5b.sockprob(0);
				}
			}*/
			break;
		case 3: // final drawer opened
			//v = 3;
			if (di.dir == 1) { // H
				//v = 3;
				if (di.nsocks == 0) {
					v = state5b.sockprob(0);
				} else if (di.nsocks == 1) {
					v = state5b.sockprob(1);
				} else { // di.nsocks == 2
					v = state5b.sockprob(0);
				}
			} else { // di.dir == 2 // V
				//v = 3;
				if (di.nsocks == 0) {
					v = state5b.sockprob(1);
				} else if (di.nsocks == 1) {
					v = state5b.sockprob(0);
				} else { // di.nsocks == 2 // can happen
					v = state5b.sockprob(1);
				}
			}
			state5b.done = true;
			break;
		} 
		state5b.drawers[y][x] = v; // drop in the sock
		// lock all drawers not in same row and column of pick
		var i,j;
		for (j=0;j<3;++j) {
			for (i=0;i<3;++i) {
				if (i!=x && j!=y && state5b.drawers[j][i]==0)
					state5b.drawers[j][i] = 1; // lock
			}
		}
	}
};
	
state5b.noesc = true;
//var noesc5 = true; // disable escapehtml
state5b.text = '2D: Albert\'s socks simulation modified, more vertial socks, could use some better art. <br>' +
			'Another example of quantum weirdness. <br>' +
			'Rows always produce an even number of socks. <br>' +
			'Columns always produce and odd number of socks.<br>' +
			'Click <a href="http://motls.blogspot.com/2012/11/quantum-casino-less-than-zero-chance.html" target="_blank"> here</a> ' +
			'for a better explanation.';

state5b.title = "Albert's socks 2";

state5b.init = function() {
	//state5 = {};
	//state5b.test = "this";
	state5b.resetdrawers();
	setbutsname('user');
	var pa = makeaprintarea();
	//state5b.test = undefined;
	//delete state5b.test;
	printareadraw(pa,"Albert's socks\nopen drawers horizontally or vertically");
};

state5b.proc = function() {
	var n = 30;
	if (state5b.done) { // game over show result for n ticks then start over
		++state5b.cntr;
		if (state5b.cntr == n) {
			state5b.resetdrawers();
		}
	}
	if (input.mclick[0] || input.mclick[1] || input.mclick[2]) { // which drawer was clicked upon
		var vx = input.mx/viewx;
		var vy = input.my/viewy;
		var divx = .3;
		var divy = .3;
		var idxx = Math.floor(vx/divx);
		var idxy = Math.floor(vy/divy);
		var idxxm = vx%divx;
		var idxym = vy%divy;
		if (idxxm > .1 && idxym > .1) {
			if (idxx >=0 && idxx <=2 && idxy >=0 && idxy <= 2) {
				state5b.clickdrawer(idxx,idxy);
			}
		}
	}
	sprite_setsize(viewx,viewy);
	sprite_draw(0,0,"take0014.jpg"); // background
	sprite_setsize(viewx/5,viewy/5);
	var i,j;
	for (j=0;j<3;++j) {
		for (i=0;i<3;++i) {
			switch(state5b.drawers[j][i]) {
			case 0: // unlocked drawer
				sprite_draw(viewx*(3*i+1)/10,viewy*(3*j+1)/10,"take0015.jpg");
				break;
			case 1: // locked drawer
				sprite_setopac(.5);
				sprite_draw(viewx*(3*i+1)/10,viewy*(3*j+1)/10,"take0015.jpg");
				sprite_setopac(1);
				break;
			case 2: // empty
				break;
			case 3: // sock
				sprite_draw(viewx*(3*i+1)/10,viewy*(3*j+1)/10,"xpar.png");
				break;
			}
		}
	}
};

state5b.exit = function() {
	clearbuts('user');
	//state5 = null;
};
