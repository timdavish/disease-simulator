
// Author: Tim Davis
// demo js file
// This file contains the javascript code that handles events on the page

// Use strict mode
"use strict";

// module pattern
(function() {
	
	// global constants
	var GRID_WIDTH = 50;
	var GRID_HEIGHT = 50;
	var TILE_WIDTH = 15;
	var TILE_HEIGHT = 15;
	
	var infectionChance = .7;
	var infectionSpeed = 500;
	var infectionLethality = 4;
	
	// timers
	var timer = null;
	
	// initialization function for event handling
	window.onload = function() {
		resetGridAndTiles();
		
		document.getElementById("speed").onchange = changeSpeed;
		document.getElementById("chance").onchange = changeChance;
		
		//document.getElementById("reset").onclick = resetGridAndTiles;
	};
	
	// reset the grid, and add tiles
	function resetGridAndTiles() {
		clearInterval(timer);

		setGrid();
		createTiles();
	}
	
	// create the grid
	function setGrid() {
		var grid = document.getElementById("tilearea");
		
		grid.style.height = GRID_HEIGHT * TILE_HEIGHT + "px";
		grid.style.width = GRID_WIDTH * TILE_WIDTH + "px";
	}
	
	// create all tiles
	function createTiles() {
		for (var row = 0; row < GRID_HEIGHT; row++) {
			for (var col = 0; col < GRID_WIDTH; col++) {
				
				// create tile and give it basic properties
				var tile = document.createElement("div");
				tile.className = "tile";
				tile.id = "tile_" + row + "_" + col;
				
				// give it a position
				var posX = col * TILE_WIDTH;
				var posY = row * TILE_HEIGHT;
				setPos(tile, posX, posY);
				
				// give it event handlers
				tile.onclick = startInfect;
				tile.oncontextmenu = addIntervention;
				
				// place it in the tilearea
				document.getElementById("tilearea").appendChild(tile);
			}
		}
	}
	
	// sets a tile's position
	function setPos(tile, x, y) {
		tile.style.left = x + "px";
		tile.style.top = y + "px";
	}
	
	// handles clicking on a tile
	function startInfect() {
		infectTile(this);
	}
	
	// handles infecting a tile
	function infectTile(tile) {
		// set the tile's class to infected
		var classInfected = "tileInfected";
		tile.className = classInfected;
		
		// get the tile's neighbors
		var pos = tile.id.split("_");
		var tileRow = parseInt(pos[1]);
		var tileCol = parseInt(pos[2]);
		var neighbors = getNeighbors(tileRow, tileCol);
		
		// infect neighbors
		timer = setTimeout(infectNeighbors, infectionSpeed, tile, neighbors);
	}
	
	// handles infected an infected tile's neighbors
	function infectNeighbors(tile, neighbors) {
		for (var i = 0; i < neighbors.length; i++) {
			var neighborData = neighbors[i].split("_");
			
			var index = neighborData[0];
			var row = Math.floor(parseInt(index) / GRID_WIDTH);
			var col = parseInt(index) % GRID_WIDTH;
			
			var neighborId = "tile_" + row + "_" + col;
			var neighborTile = document.getElementById(neighborId);
			
			var chance = Math.random();
			var infectionMultiplier = neighborData[1];
			
			// only infect this neighbor if it:
				// isn't infected
				// isn't dead
				// isn't interventioned
				// the chance is successful
			if (neighborTile.className != "tileInfected" && neighborTile.className != "tileDead"
					&& neighborTile.className != "tileIntervention"
					&& chance <= infectionChance * infectionMultiplier) {
				infectTile(neighborTile);
			}
		}
		
		killTile(tile);
	}
	
	// turns a tile into a dead tile
	function killTile(tile) {
		var classDead = "tileDead";
		tile.className = classDead;
	}
	
	// turns a tile into an intervention tile
	function addIntervention() {
		var classIntervention = "tileIntervention";
		this.className = classIntervention;
		return false;
	}
	
	// handles changing the rate of infection
	function changeSpeed() {
		infectionSpeed = this.value;
	}
	
	// handles changing the chance of infection
	function changeChance() {
		infectionChance = this.value;
	}
	
	// gets a tile's neighbors' indices
	function getNeighbors(row, col) {
		var neighbors = [];
		
		if (row > 0) {
			// add tile above
			neighbors.push(GRID_WIDTH * (row  - 1) + col + "_" + 1);
			
			// add tile above and left
			if (col > 0) {
				neighbors.push(GRID_WIDTH * (row - 1) + col - 1 + "_" + .4);
			}
			
			// add tile above and right
			if (col < GRID_WIDTH - 1) {
				neighbors.push(GRID_WIDTH * (row - 1) + col + 1 + "_" + .4);
			}
		}
		if (col > 0) {
			// add tile left
			neighbors.push(GRID_WIDTH * row + col - 1 + "_" + 1);
		}
		if (col < GRID_WIDTH - 1) {
			// add tile right
			neighbors.push(GRID_WIDTH * row + col + 1 + "_" + 1);
		}
		if (row < GRID_HEIGHT - 1) {
			// add tile below
			neighbors.push(GRID_WIDTH * (row + 1) + col + "_" + 1);
			
			// add tile below and left
			if (col > 0) {
				neighbors.push(GRID_WIDTH * (row + 1) + col - 1 + "_" + .4);
			}
			
			// add tile below and right
			if (col < GRID_WIDTH - 1) {
				neighbors.push(GRID_WIDTH * (row + 1) + col + 1 + "_" + .4);
			}
		}
		
		return neighbors;
	}
	
	/*
	class Tile {
		var infected;
		var row;
		var col;
		
		constructor(row, col) {
			var tileNum = (row * GRID_WIDTH) + col + 1;
			
			// create tile and give it basic properties
			this.className = "tile";
			this.id = "tile_" + row + "_" + col;
			this.innerHTML = tileNum;
			
			// set its state
			this.infected = false;
			this.row = row;
			this.col = col;
			
			// give it a position
			this.style.left = col * TILE_WIDTH;
			this.style.top = row * TILE_HEIGHT;
		}
		
	}*/
})();
