/*
Author: Tim Davis
disease js file
This file contains the javascript code that handles events on the disease page
*/

/*
TODO: Center simulation div in window?
TODO: check if clearing cell with 2nd click is good
*/

// strict mode
"use strict";

// module pattern
(function() {

    // grid constants
    var GRID_WIDTH = 25;
    var GRID_HEIGHT = 25;

    // cell constants
    var CELL_WIDTH = 27;
    var CELL_HEIGHT = 27;
    var CELL_BORDER = 1;

    // cell classes: CELL = white, CELL_INFECTED = red, CELL_IMMUNE = blue
    var CELL = "cell", CELL_INFECTED = "cell infected",
        CELL_IMMUNE = "cell immune", CELL_INTERVENTION = "cell intervention";

    // global variables
    var cells = [], state = []; // state: 0=uninfected, 1-2=infected, 3=immune, 4=intervention
    var running = false;
    var stepLength = 500;
    var timer;

    // counters
    var dayCount;
    var susceptibleCount;
    var infectedCount;
    var interventionCount;
    var recoveredCount;

    // initialization function for event handling
    window.onload = function() {
        // initialize the grid
        resetConstructGrid();

        // set up button handlers
        $("buttonRun").onclick = run;
        $("buttonStep").onclick = step;
        $("buttonReset").onclick = resetConstructGrid;
        $("buttonInfect").onclick = handleInfectButton;
        $("buttonInterventions").onclick = handleInterventionsButton;
    };

    // construct/reset the grid & simulation
    function resetConstructGrid() {
        // grab the grid
        var grid = $("grid");

        // clear the grid
        grid.innerHTML = "";

        // set the grid's dimensions
        grid.style.width = GRID_WIDTH * CELL_WIDTH + "px";
        grid.style.height = GRID_HEIGHT * CELL_HEIGHT + "px";

        // reset cells and state arrays
        cells = [];
        state = [];

        // populate the grid with cells
        createCells();

        // reset and update counters
        dayCount = infectedCount = interventionCount = recoveredCount = 0;
        susceptibleCount = GRID_WIDTH * GRID_HEIGHT;
        updateCounters();

        // reset and start the graph
        clearGraph();
        updateGraph();
    }

    // create cells and populate the grid with them, initialize cell state
    function createCells() {
        for (var row = 0; row < GRID_HEIGHT; row++) {
            cells[row] = [];
            state[row] = [];
            for (var col = 0; col < GRID_WIDTH; col++) {

                // create the cell, give it basic properties
                var cell = document.createElement("div");
                cell.className = CELL;
                cell.id = row + "_" + col + "_cell"; // contains cell's position

                // set its dimensions
                setDimensions(cell);

                // set its position
                setPosition(cell, col, row);

                // set its event handlers
                cell.onclick = cellClick;
                cell.onmouseover = cellMouseOver;
                cell.onmouseout = cellMouseOut;

                // place it in the grid
                $("grid").appendChild(cell);

                // place it in the cells array, initialize cell state array
                cells[row][col] = cell;
                state[row][col] = 0;
            }
        }
    }

    // sets a cell's dimensions, accounting for cell border width
    function setDimensions(cell) {
        cell.style.width = CELL_WIDTH - (2 * CELL_BORDER) + "px";
        cell.style.height = CELL_HEIGHT - (2 * CELL_BORDER) + "px";
    }

    // sets a cell's position
    function setPosition(cell, col, row) {
        var posX = col * CELL_WIDTH;
        var posY = row * CELL_HEIGHT;

        cell.style.left = posX + "px";
        cell.style.top = posY + "px";
    }

    // handles running and stopping
    function run() {
        running = !running;
        this.className = running ? "active" : "inactive";
        if (running) {
            timer = setInterval(function() { step(); }, stepLength);
            $("buttonRun").innerHTML = "Stop";
        } else {
            clearInterval(timer);
            $("buttonRun").innerHTML = "Run";
        }

        // disable step functionality while running
        $("buttonStep").disabled = running;
        $("buttonReset").disabled = running;
    }

    // handles taking a time step
    function step() {
        var algorithmTime, guiTime;

        // algorithm
        algorithmTime = (new Date().getTime());
        calcNextGenState();
        algorithmTime = (new Date().getTime()) - algorithmTime;
        $("algorithmTime").innerHTML = algorithmTime;

        // gui
        guiTime = (new Date().getTime());
        updateCells();
        guiTime = (new Date().getTime()) - guiTime;
        $("guiTime").innerHTML = guiTime;

        // counter
        dayCount++;
        updateCounters();

        // graph
        updateGraph();
    }

    // handles the add infections button
    function handleInfectButton() {
        var buttonInfect = this;
        var buttonInterventions = $("buttonInterventions");

        buttonInfect.disabled = true;
        buttonInfect.className = "active";
        buttonInterventions.disabled = false;
        buttonInterventions.className = "inactive";
        //$("info").innerHTML = "Clicking will infect cells";
    }

    // handles the interventions button
    function handleInterventionsButton() {
        var buttonInfect = $("buttonInfect");
        var buttonInterventions = this;

        buttonInfect.disabled = false;
        buttonInfect.className = "inactive";
        buttonInterventions.disabled = true;
        buttonInterventions.className = "active";
        //$("info").innerHTML = "Clicking will add interventions";
    }

    // calculates next generation's state
    function calcNextGenState() {
        cells.forEach(function(cellRow, row) {
            cellRow.forEach(function(cell, col) {
                // check if the cell is infected
                if (cell.className === CELL_INFECTED) {
                    // increase the current cell's "age"
                    state[row][col]++;

                    // find the next infection location
                    var newPos = findNextInfection(row, col);
                    var newRow = newPos.newRow, newCol = newPos.newCol;
										//var num = newPos.num; // testing

                    // validate new location
                    if (isValidLocation(newRow, newCol)) {
                        // make sure new location hasn't been affected
                        if (state[newRow][newCol] === 0) {
                            // infect the new location
                            state[newRow][newCol] = 1;
                            infectedCount++;
														//cells[newRow][newCol].innerHTML = num; // testing
                        }
                    }
                }
            });
        });
    }

    // updates the cells from state array
    function updateCells() {
        susceptibleCount = infectedCount = recoveredCount = interventionCount = 0;
        //update cells
        for (var row = 0; row < GRID_HEIGHT; row++) {
            for (var col = 0; col < GRID_WIDTH; col++) {
                var cellState = state[row][col];
                if (cellState === 0) {
                    cells[row][col].className = CELL;
                    susceptibleCount++;
                } else if (cellState === 3) {
                    cells[row][col].className = CELL_IMMUNE;
                    recoveredCount++;
                } else if (cellState === 4) {
                    cells[row][col].className = CELL_INTERVENTION;
                    interventionCount++;
                } else {
                    cells[row][col].className = CELL_INFECTED;
                    infectedCount++;
                }
            }
        }
    }

    // updates the html counters with current counters
    function updateCounters() {
      $("dayCount").innerHTML = dayCount;
      $("susceptibleCount").innerHTML = susceptibleCount;
      $("interventionCount").innerHTML = interventionCount;
      $("infectedCount").innerHTML = infectedCount;
      $("recoveredCount").innerHTML = recoveredCount;
    }

    // handles a cell being clicked
    function cellClick() {
        // infect or place intervention based on buttons
        var infect = $("buttonInfect").disabled;

        // get location
        var pos = this.id.split("_"), row = parseInt(pos[0]), col = parseInt(pos[1]);

        // determine new state
        var stateType = infect ?
          ((state[row][col] == 1) ? 0 : 1) : ((state[row][col] == 4) ? 0 : 4);

        // update state
        state[row][col] = stateType;

        // update cells
        updateCells();

        // update counters
        updateCounters();
    }

    // handles a cell being moused over
    function cellMouseOver() {
      //this.className = this.className + " infectHover";
    }

    // handles a cell being moused out
    function cellMouseOut() {
      /*
      var parts = this.className.split(" ");
      var newClass = parts[0];
      if (parts.length > 2) {
        newClass = newClass + " " + parts[1];
      }
      this.className = newClass;
      */
    }

    // randomly generates the next location to infect
    function findNextInfection(newRow, newCol) {
        var num = Math.floor(Math.random() * 10000);

        // 2 rows higher (0-639)
        if (num >= 0 && num <= 95) {
            newRow -= 2;
            newCol -= 2;
        } else if (num >= 96 && num <= 235) {
            newRow -= 2;
            newCol -= 1;
        } else if (num >= 236 && num <= 403) {
            newRow -= 2;
        } else if (num >= 404 && num <= 543) {
            newRow -= 2;
            newCol += 1;
        } else if (num >= 544 && num <= 639) {
            newRow -= 2;
            newCol += 2;
        }

        // 1 row higher (640-2602)
        else if (num >= 640 && num <= 779) {
            newRow -= 1;
            newCol -= 2;
        } else if (num >= 780 && num <= 1258) {
            newRow -= 1;
            newCol -= 1;
        } else if (num >= 1259 && num <= 1983) {
            newRow -= 1;
        } else if (num >= 1984 && num <= 2462) {
            newRow -= 1;
            newCol += 1;
        } else if (num >= 2463 && num <= 2602) {
            newRow -= 1;
            newCol += 2;
        }

        // same row (2603 - 7396)
        else if (num >= 2603 && num <= 2770) {
            newCol -= 2;
        } else if (num >= 2771 && num <= 3495) {
            newCol -= 1;
        } else if (num >= 3496 && num <= 6503) {
            // num is 2784-7215
            // nothing new will get infected
        } else if (num >= 6504 && num <= 7228) {
            newCol += 1;
        } else if (num >= 7229 && num <= 7396) {
            newCol += 2;
        }

        // 1 row lower (7397-9359)
        else if (num >= 7397 && num <= 7536) {
            newRow += 1;
            newCol -= 2;
        } else if (num >= 7537 && num <= 8015) {
            newRow += 1;
            newCol -= 1;
        } else if (num >= 8016 && num <= 8740) {
            newRow += 1;
        } else if (num >= 8741 && num <= 9219) {
            newRow += 1;
            newCol += 1;
        } else if (num >= 9220 && num <= 9359) {
            newRow += 1;
            newCol += 2;
        }

        // 2 rows lower (9360-9999)
        else if (num >= 9360 && num <= 9455) {
            newRow += 2;
            newCol -= 2;
        } else if (num >= 9456 && num <= 9595) {
            newRow += 2;
            newCol -= 1;
        } else if (num >= 9596 && num <= 9763) {
            newRow += 2;
        } else if (num >= 9764 && num <= 9903) {
            newRow += 2;
            newCol += 1;
        } else if (num >= 9904 && num <= 9999) {
            newRow += 2;
            newCol += 2;
        }

        else {
          alert("Error finding next generation number!");
        }

        return {
            newRow: newRow,
            newCol: newCol,
						num: num
        };
    }

    // ensures a given location is within the grid boundaries
    function isValidLocation(row, col) {
        return row >= 0 && row < GRID_HEIGHT
            && col >= 0 && col < GRID_WIDTH;
    }

    // factors out getting element by id
    function $(id) {
        return document.getElementById(id);
    }

})();
