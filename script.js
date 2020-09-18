if (document.cookie != 'visited=true') {
	alert('Double-click the scene to disable vertical scrolling and hover on the black part to access the Debug Area!');
	document.cookie = 'visited=true';
}

var c = 0;
var aiPos = 0;
var walls = 0;
var avoided = 0;
var crash = 0;
var spd;

var topDebug = document.getElementById('topDebug');
var start = document.getElementById('start');
var stop = document.getElementById('stop');
var stepsDone = document.getElementById('stepsDone');

var road = document.getElementById('road');
var ai = document.getElementById('ai');
var two = document.getElementById('two');
var wall = document.getElementById('wall');
var l1 = document.getElementById('l1');
var l2 = document.getElementById('l2');
var l3 = document.getElementById('l3');

const AI_MTOP = '50px';
const WALL_WIDTH = '50';
// const L1_WIDTH = '100%';
const L2_WIDTH = '600';
// const L3_WIDTH = '100%';
const WALL_RIGHT = wall.style.right;
const L1_RIGHT = l1.style.right;
const L2_RIGHT = l2.style.right;
const L3_RIGHT = l3.style.right;

function tick() {
	c++;
	stepsDone.value = c;
	moveWall(); // Move wall according to the AI's experience
	moveLines(); // Move lines
	checkCollision(); // Check if the wall is detected by the sensors and/or has hit the car
	experience(); // Gain experience with the results
	// obs();
}

var tickInterval;

function runSim(state, speed) {
	spd = 1/speed + 's';
	if (state == 1) {// Run simulation
		start.style.display = 'none';
		stop.style.display = 'inline-flex';
		if (c > 0) runSim(0);
		else {
			// Call the 'tick' function every (20/speed) tick(s)
			tickInterval = setInterval(tick, 20/speed);
			// Change the transition speed according to the AI speed
			ai.style.transition = 'all ' + 1/speed + 's ease-out';
		}
	} else {// Stop simulation
		// Display the 'start' button
		start.style.display = 'inline-flex';
		// Hide the 'stop' button
		stop.style.display = 'none';
		// Clear it, if not the simulation will just be paused
		clearInterval(tickInterval);
		// Restore default values
		c = 0;
		stepsDone.value = c;
		wall.style.left = null;
		wall.style.right = WALL_RIGHT;
		l1.style.left = null;
		l1.style.right = L1_RIGHT;
		l2.style.left = null;
		l2.style.right = L2_RIGHT;
		l3.style.left = null;
		l3.style.right = L3_RIGHT;
		ai.style.marginTop = AI_MTOP;
		aiPos = 0;
		walls = 0;
		crash = 0;
		avoided = 0;
	}
}

function moveWall() {
	var getWallX = wall.offsetLeft;
	var getWallY = wall.offsetTop;
	var getAIX = two.offsetLeft+500;
	var getAIY = ai.offsetTop;
	var successRate = Math.floor((avoided/(avoided+crash)*100));

	topDebug.innerHTML = '&nbsp;Steps ['+c+']<br>&nbsp;Wall XY('+getWallX+','+getWallY+')<br>&nbsp;AI XY('+getAIX+','+getAIY+')<br>&nbsp;Walls passed: '+walls+' Avoided: '+avoided+' Crash: '+crash+' Success Rate: '+successRate+'%';

	if (getWallX <= -WALL_WIDTH) walls++;
	else {
		getWallX -= 20;
		wall.style.left = getWallX + 'px';
	}
}

function moveLines() {

	// var getSideX1 = l1.offsetLeft;
	var getSideX2 = l2.offsetLeft;
	// var getSideX3 = l3.offsetLeft;

	if (getSideX2 <= -L2_WIDTH) {
		l2.style.left = null;
		l2.style.right = L2_RIGHT;
	} else {
		getSideX2 -= 15;
		l2.style.left = getSideX2 + 'px';
	}
}

function moveCar(direction) { // Up or down
	// Auto correct
	if (aiPos < 50) aiPos = 50;
	if (aiPos > 200) aiPos = 200;

	if (direction == 'down') aiPos += 10;
	else aiPos -= 10;

	ai.style.marginTop = aiPos + 'px';
}


function checkCollision() {
	var getWallX = wall.offsetLeft;
	var getAIX = two.offsetLeft+500;
	var getWallY = wall.offsetTop+100;
	var getAIY = ai.offsetTop;

	if (getWallX < getAIX && getAIY >= getWallY-100 && getAIY < getWallY|| getWallX < getAIX && getWallY-100 > getAIY && getWallY-100 < getAIY+50) {
		// Change color to red
		change(two, 'red');
		// If the wall hits our car
		if (getWallX < 100) {
			// Increment the 'crash' value
			crash++;
			// Animate the crash
			ai.style.animation = 'spin '+spd+' 1 linear, blink 0.2s 8 linear alternate';
		}
	} else {
		// Change back to white
		change(two, 'white');
		// If the wall passes by our car
		if(getWallX < 100) {
			// Increment the 'avoided' value
			avoided++;
			// Animate the idleness
			ai.style.animation = 'idle 3s infinite ease';
		}
	}
}

var lastWallCount = 0;
var lastAvoided = 0;
var lastCrash = 0;
var tryzone = '0';
Succ = ['000', '001', '010', '011', '100', '101', '110', '111'];
var pos = 0;
var neg = 0;

function experience() {
	var aizone;
	var wallzone;

	// Get wall and AI zones
	var getWallY = wall.offsetTop;
	var getAIY = ai.offsetTop;

	var getWallCenter = (getWallY-100)+50;

	if (getWallCenter <= 150) {
		// Zone 0
		document.getElementById('t_wall_zone').innerHTML = '0';
		wallzone = '0';
	} else {
		// Zone 1
		document.getElementById('t_wall_zone').innerHTML = '1';
		wallzone = '1';
	}

	var getAICenter = (getAIY-100)+25;

	if (getAICenter <= 150) {
		// Zone 0
		document.getElementById('t_ai_zone').innerHTML = '0';
		aizone = '0';
	} else {
		// Zone 1
		document.getElementById('t_ai_zone').innerHTML = '1';
		aizone = '1';
	}

	// Trying
	document.getElementById('t_trying').innerHTML = tryzone;

	// Read from experience 'database'
	var buildvar = aizone+wallzone+tryzone;
	var experienceDB = document.getElementById('succ_'+buildvar).innerHTML;

	// Read from 'DB' and decide
	if (tryzone == '0') {
		buildvarOther = aizone+wallzone+'1';
		experienceDBOther = document.getElementById('succ_'+buildvarOther).innerHTML;
		if (parseInt(experienceDBOther) > parseInt(experienceDB)+parseInt(10)) {
			buildvar = buildvarOther;
			experienceDB = document.getElementById('succ_'+buildvar).innerHTML;
			tryzone = '1';
		}

	}

	if (tryzone == '1') {
		buildvarOther = aizone+wallzone+'0';
		experienceDBOther = document.getElementById('succ_'+buildvarOther).innerHTML;
		if (parseInt(experienceDBOther) > parseInt(experienceDB)+parseInt(10)) {
			buildvar = buildvarOther;
			experienceDB = document.getElementById('succ_'+buildvar).innerHTML;
			tryzone = '0';
		}

	}

	// Move AI
	if (tryzone == '0') { moveCar('up'); } else { moveCar('down'); }
	// Update DB only when wall is leftmost
	if (lastWallCount != walls) {
		// Do update
		if (lastAvoided != avoided) {
			experienceDB = parseInt(experienceDB)+parseInt(1);
			document.getElementById('succ_'+buildvar).innerHTML = experienceDB;
			lastAvoided = avoided;
		}

		if (lastCrash != crash) {
			experienceDB = parseInt(experienceDB)-parseInt(1);
			document.getElementById('succ_'+buildvar).innerHTML = experienceDB;
			lastCrash = crash;
		}

		lastWallCount = walls;
		tryzone = Math.floor(Math.random() * 2); // Randomly between 0 and 1

		// Randomize wall position
		var randomWallYPos = Math.floor(Math.random() * (200 + 1) + 0);
		wall.style.marginTop = randomWallYPos+'px';
		wall.style.left = null;
		wall.style.right = WALL_RIGHT;
	}

	for (var i = 0; i < Succ.length; i++) {
		if (parseInt(document.getElementById('succ_'+Succ[i]).innerHTML) >= 0)
			pos += parseInt(document.getElementById('succ_'+Succ[i]).innerHTML);
		else neg += -parseInt(document.getElementById('succ_'+Succ[i]).innerHTML);
	}
	document.getElementById('t_exp_success').innerHTML = Math.floor((pos/(pos+neg)*100))+'%';
}

ai.addEventListener('mouseover', function(e) {
	e.preventDefault();
	change(ai, 'red');
});

ai.addEventListener('mouseout', function(e) {
	e.preventDefault();
	change(ai, 'black');
});

function change(id, color) { id.style.backgroundColor = color; }

document.getElementsByTagName('html')[0].addEventListener('dblclick', function(e) {
	e.preventDefault();
	var html = document.getElementsByTagName('html')[0];
	if (html.style.overflowY == 'hidden') {
		html.style.height = 'auto';
		html.style.overflowY = 'scroll';
	} else {
		html.style.height = '100%';
		html.style.overflowY = 'hidden';
	}
});
