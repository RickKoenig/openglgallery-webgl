var mclick = [0,0,0];
var maparea = null;
var rawwheeldelta = 0;
var havemousedown = false; // don't use mouseenter until a mousedown happens
var infullscreen = null;
var lastinside = [0,0,0];

function getxcode(e) {
	if (infullscreen)
		return e.clientX;
	else
		return e.clientX - e.currentTarget.offsetLeft;
}

function getycode(e) {
	if (infullscreen)
		return e.clientY;
	else
		return e.clientY - e.currentTarget.offsetTop;
}

// event mouse down
function bmoused(e) {
	havemousedown = true;
	maparea.focus(); // get keyboard working on maparea
	mbutcur[e.button] = 1;
	mbuthold[e.button] = 1;
	inputevents += "(Mdown[" + e.button + "] " + getxcode(e) + " " + getycode(e) + ") ";
	e.preventDefault();
}

// event mouse up
function bmouseu(e) {
	mbuthold[e.button] = 0;
	inputevents += "(Mup[" + e.button + "] " + getxcode(e) + " " + getycode(e) + ") ";
	++mclick[e.button];
	e.preventDefault();
}

// event mouse over
function bmouseov(e) {
	//inputevents += "(Mover " + getxcode(e) + " " + getycode(e) + ") ";
}

// event mouse exit
function bmouseou(e) {
	//mbuthold[e.button] = 0;
	lastinside[0] = mbutcur[0];
	lastinside[1] = mbutcur[1];
	lastinside[2] = mbutcur[2];
	inputevents += "(Mout " + getxcode(e) + " " + getycode(e) + ") ";
}


// event mouse enter
function bmouseenter(e) {
	//return; // don't know the status of buttons re-entering area
	//if (!havemousedown)
	//	return;
	maparea.focus(); // get keyboard working on maparea
	//mbutcur[e.button] = 1;
	//mbuthold[e.button] = 1;
	mbutcur[0] = lastinside[0];
	mbutcur[1] = lastinside[1];
	mbutcur[2] = lastinside[2];
	inputevents += "(Min[" + e.button + "] " + getxcode(e) + " " + getycode(e) + ") ";
}

// event mouse move
function bmousem(e) {
	if (e.layerX == null) {
		input.mx = getxcode(e); // doesn't work with scrollbars
		input.my = getycode(e);
	} else {
		input.mx = e.layerX; // works with scrollbars
		input.my = e.layerY;
	}
	if (input.mx < 0)
		input.mx = 0;
	if (input.my < 0)
		input.my = 0;
	if (typeof glc === 'undefined') {
		return;
	}
	if (input.mx >= glc.clientWidth)
		input.mx = glc.clientWidth - 1;
	if (input.my >= glc.clientHeight)
		input.my = glc.clientHeight - 1;
	input.fmx= 2*input.mx/glc.clientWidth - 1;
	input.fmy = -2*input.my/glc.clientHeight + 1; // flip y
	if (gl.asp === undefined) // incase there is no webgl context
		return;
	if (gl.asp > 1) {
		input.fmx *= gl.asp;
	} else {
		input.fmy /= gl.asp;
	}
}

// event mouse click, doesn't seem to work if you click on an image on the map, and you click on it, implement with bmoused and bmouseu
function bmousec(e) {
	inputevents += "(Mclick[" + e.button + "] " + getxcode(e) + " " + getycode(e) + ") ";
	// ++mclick;
}

// event mouse wheel changed
function bmousewheel(e) {
	//rawwheeldelta = 0;
	if (e.wheelDelta) {
		rawwheeldelta += e.wheelDelta/120;
	} else if (e.detail) { /** Mozilla case. */
                /** In Mozilla, sign of delta is different than in IE.
                 * Also, delta is multiple of 3.
                 */
 		rawwheeldelta += -e.detail/3;
	}
/*	// sometimes the screen locks up, roll the mouse wheel to unfreeze (chrome)
	if (mainproc) {
		curfps = 0;
		setframerate(mainproc,fpswanted);
	} */
	if (e.preventDefault)
        e.preventDefault();
}

function btouchstart(e)
{
	logger("touchstart\n");
	input.mx = Math.floor(e.touches[0].pageX);
	input.my = Math.floor(e.touches[0].pageY);
	mbutcur[0] = 1;
	mbuthold[0] = 1;
	if (e.preventDefault)
		e.preventDefault();
}

function btouchmove(e)
{
	logger("touchmove\n");
	input.mx = Math.floor(e.touches[0].pageX);
	input.my = Math.floor(e.touches[0].pageY);
	mbutcur[0] = 1;
	mbuthold[0] = 1;
	if (e.preventDefault)
		e.preventDefault();
}

function btouchend(e)
{
	logger("touchend\n");
	mbutcur[0] = 0;
	mbuthold[0] = 0;
	if (e.preventDefault)
		e.preventDefault();
}

function mapinit() {
	maparea = document.getElementById('drawarea');
	if (!maparea)
		maparea = document.getElementById('mycanvas2');
	if (isMobile) {
		maparea.ontouchstart = btouchstart;
		maparea.ontouchmove = btouchmove;
		maparea.ontouchend = btouchend;
	} else {
		maparea.onclick = bmousec;
		maparea.onmousedown = bmoused;
		maparea.onmouseup = bmouseu;
		maparea.onmousemove = bmousem;
		maparea.onmouseover = bmouseov;
		maparea.onmouseout = bmouseou;
		maparea.onmouseenter = bmouseenter;
		maparea.onmousewheel = bmousewheel;
		maparea.addEventListener('DOMMouseScroll', bmousewheel, false);
		//window.addEventListener('DOMMouseScroll', bmousewheel, false);
		//document.onmousewheel = wheel;
		//document.onmousewheel = wheel;
	}
}

function mapproc()
{
	// mouse clicks in current frame
	
	input.mclick[0] = mclick[0];
	input.mclick[1] = mclick[1];
	input.mclick[2] = mclick[2];
	mclick[0] = mclick[1] = mclick[2] = 0;
	// mouse button: 1 down, 0 up
	input.mbut[0] = mbutcur[0]; // allow for nudges
	input.mbut[1] = mbutcur[1]; // allow for nudges
	input.mbut[2] = mbutcur[2]; // allow for nudges
	input.lmbut[0] = mbutlast[0]; // allow for nudges
	input.lmbut[1] = mbutlast[1]; // allow for nudges
	input.lmbut[2] = mbutlast[2]; // allow for nudges
	mbutlast[0] = mbutcur[0];
	mbutlast[1] = mbutcur[1];
	mbutlast[2] = mbutcur[2];
	mbutcur[0] = mbuthold[0];
	mbutcur[1] = mbuthold[1];
	mbutcur[2] = mbuthold[2];
	input.wheelDelta = rawwheeldelta;
	if (rawwheeldelta)
		input.wheelPos += rawwheeldelta;
	rawwheeldelta = 0;
	input.dmx = input.mx - input.lmx;
	input.dmy = input.my - input.lmy;
	input.lmx = input.mx;
	input.lmy = input.my;
}
