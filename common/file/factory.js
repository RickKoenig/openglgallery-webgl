// factory system
// build hierarchy of family of classes from a script
var factory = {};
factory.newclass_from_script = function(fact,s) {
	var single = false; // test
	var scripter = true;
	var simple = false; // test
	if (single) {
		// single object
		var classname = s.read(); // type of class
		var name = s.read(); // instance name
		var x = Number(s.read());
		var y = Number(s.read());
		var w = Number(s.read());
		var h = Number(s.read());
		var cls = fact[classname]; // constructor
		if (!cls)
			return null; // class not found
		var ret = new cls(name,x,y,w,h);
	}
	if (scripter) {
		var classname = s.read(); // type of class
		var cls = fact[classname]; // constructor
		if (!cls || !classname.length) {
			alert("class '" + classname + "' not found")
			return null; // class not found
		}
		var ret = new cls(s);
		idname = s.read();
		if (!idname || !idname.length)
			return ret;
		else if (idname != "{") {
			s.backup(); /// no children
			return ret;
		}
		//return ret; // no children
		while(true) {
			idname = s.read();
			if (!idname || !idname.length)
				return ret;
			if (idname == "}")
				return ret;
			s.backup();
			var retc = factory.newclass_from_script(fact,s);
			ret.linkchild(retc);
		}
		return null;
	}
	if (simple) {
		var ret = new uiclass.uitree2drect("a uitree script",10,20,100,200); // very simple
		ret.seto2p(100,60);
	}
	return ret;
};
