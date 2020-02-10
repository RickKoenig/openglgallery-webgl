// quick tests of javascript

// play with prototypes

// monkey patch IE
if (Function.prototype.name === undefined && Object.defineProperty !== undefined) {
    Object.defineProperty(Function.prototype, 'name', {
        get: function() {
            var funcNameRegex = /function\s+(.{1,})\s*\(/;
            var results = (funcNameRegex).exec((this).toString());
            return (results && results.length > 1) ? results[1] : "";
        },
        set: function(value) {}
    });
}
// inherit() returns a newly created object that inherits properties from the
// prototype object p. It uses the ECMAScript 5 function Object.create() if
// it is defined, and otherwise falls back to an older technique.
function inherit(p) {
	if (p == null) throw TypeError(); // p must be a non-null object
	if (Object.create) // If Object.create() is defined...
		return Object.create(p); // then just use it.
	var t = typeof p; // Otherwise do some more type checking
	if (t !== "object" && t !== "function") throw TypeError();
	function f() {}; // Define a dummy constructor function.
	f.prototype = p; // Set its prototype property to p.
	return new f(); // Use f() to create an "heir" of p.
}

/////////// Animal
// all animals have mass
function Animal(mass) {
	this.mass = mass;
}
Animal.prototype.living = true; // by default, all animals are living
Animal.prototype.desc = function() {
	return "mass " + this.mass + " living " + this.living + " type " + this.constructor.name;
};
Animal.prototype.move = function() {
	return "moving";
};
Animal.prototype.sound = function() {
	return "sounding";
};
Animal.prototype.show = function(name) {
	logger("$$$$$$$$\n");
	logger("instance name " + name + "\n");
	logger("desc = " + this.desc() + "\n");
	logger("move = " + this.move() + "\n");
	logger("sound = " + this.sound() + "\n");
};

/////////// Bird
function Bird(mass) {
	Animal.apply(this,arguments);
};
Bird.prototype = inherit(Animal.prototype); // Subclass inherits from superclass
Bird.prototype.constructor = Bird;
Bird.prototype.move = function() {
	return "flying";
};
Bird.prototype.sound = function() {
	return "bird sound";
};

/////////// Dog
function Dog(mass) {
	Animal.apply(this,arguments);
};
Dog.prototype = inherit(Animal.prototype); // Subclass inherits from superclass
Dog.prototype.constructor = Dog;
Dog.prototype.move = function() {
	return "walking";
};
Dog.prototype.sound = function() {
	return "woof woof";
};

/////////// DeadDog
function DeadDog(mass) {
	this.living = false; // override the prototype for animal
	Dog.apply(this,arguments);
};
DeadDog.prototype = inherit(Dog.prototype); // Subclass inherits from superclass
DeadDog.prototype.constructor = DeadDog;
DeadDog.prototype.sound = function() {
//	if (!this.__proto__)
//		return "no proto";
//	return "If he wasn't dead, he'd go " + this.__proto__.__proto__.sound();
	return "if he wasn't dead, he'd go " + Dog.prototype.sound.call(this);
};

// end play with prototypes

// main function of scratchtest
function scratchtest() {
	logger("scratchtest begin\n=========\n");
// play with prototypes
	logger("Animal\n");
	
	var small = new Animal(10);
	small.show("small");
	
	var big = new Animal(100);
	big.living = false; // override the prototype
	big.show("big");
	
	var bigbird = new Bird(200);
	bigbird.show("bigbird");
	
	var adog = new Dog(75);
	adog.show("adog");
	
	var adeaddog = new DeadDog(76);
	adeaddog.show("adeaddog");
/*	
	logger(">> small\n");
	logger("desc = " + small.desc() + "\n");
	logger("move = " + small.move() + "\n");
	
	logger(">> big\n");
	logger("desc = " + big.desc() + "\n");
	logger("move = " + big.move() + "\n");
	
	logger(">> bigbird\n");
	logger("desc = " + bigbird.desc() + "\n");
	logger("move = " + bigbird.move() + "\n");
*/	
	
// end play with prototypes
	logger("=========\nscratchtest end\n");
}