var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Constant Variables
var canvasSize = 500;
var squareSide = 50;
var numSquaresX = 10;
var numSquaresY = 10;
var numMines = 15;
var directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

// Calculated Variables
var grid, gridSize;

// Variable Variables
var revealModeOn = true;
var gameOver = false;
var flaggedSquares = 0;

// Constructor for Square objects
var Square = function(index, position){
    this.hasMine = false;
    this.revealed = false;
    this.flagged = false;
    this.index = index;
    this.position = position;
    this.N = this.NE = this.E = this.SE = this.S = this.SW = this.W = this.NW = -1;
};

Square.prototype.setNeighbor = function(neighbor, direction){
    this[direction] = neighbor;
};

function setupGrid(){
    // First, get the input from the fields
    var inSizeX = document.getElementById('gridSize').value;
    // Check if the grid size 
    if(isNaN(inSizeX)) {
        inSizeX = 10;
    } else {
        inSizeX = Math.floor(inSizeX);
    }

    numSquaresX = numSquaresY = inSizeX;
    squareSide = canvasSize / numSquaresX;

    // This loop should draw all the vertical lines
    for(var x = 0; x <= numSquaresX; x++) {
        ctx.moveTo(x * squareSide, 0);
        ctx.lineTo(x * squareSide, numSquaresY * squareSide);
        ctx.stroke();
    }
    // This loop should draw all the horizontal lines
    for(var y = 0; y <= numSquaresY; y++) {
        ctx.moveTo(0, y * squareSide);
        ctx.lineTo(numSquaresX * squareSide, y * squareSide);
        ctx.stroke();
    }

    // Setup the click listener
    var boundOnClick = onClick.bind(this, canvas);
    document.addEventListener("click", boundOnClick, false);
}

(function(){
    document.getElementById('drawToggle').onclick = drawModeChanged;
    document.getElementById('startNewGame').onclick = startNewGame;
})();

// SETUP GAME
function setupGame(){
    gameOver = false;
    flaggedSquares = 0;

    gridSize = numSquaresX * numSquaresY;
    numMines = document.getElementById('numOfMines').value;
    if(isNaN(numMines)){
        numMines = 15;
    } else {
        numMines = Math.floor(numMines);
    }
    var minesToPlace = numMines;

    var blankColor = '#C0C0C0';

    grid = [];
    for(var index = 0; index < gridSize; index++) {
        var coords = getCoordsFromIndex(index);
        var square = new Square(index, coords);
        // Set neighbors for the new square
        // Logic outline:  If the x coord is > 0, then there should be a neighbor to the west
        // That neighbor will be the one at index - 1
        if(coords.x > 0) {
            var wNeighbor = grid[index-1];
            square.setNeighbor(wNeighbor, 'W');
            wNeighbor.setNeighbor(square, 'E');
            // If Y is > 0, X and Y > 0 and we have a northwest neighbor
            if(coords.y > 0) {
                // That neighbor is at index-gridSizeX
                var nwNeighbor = grid[index-numSquaresX-1];
                square.setNeighbor(nwNeighbor, 'NW');
                nwNeighbor.setNeighbor(square, 'SE');
            } 
        }
        // Set North neighbors if y > 0
        if(coords.y > 0) {
            var nNeighbor = grid[index-numSquaresX];
            square.setNeighbor(nNeighbor, 'N');
            nNeighbor.setNeighbor(square, 'S');
            // If Y > 0, then we may have a NE neighbor, but only if we aren't at gridSizeX index
            if(coords.x < numSquaresX) {
                var neNeighbor = grid[index-numSquaresX + 1];
                square.setNeighbor(neNeighbor, 'NE');
                neNeighbor.setNeighbor(square, 'SW');
            }
        }

        grid.push(square);
        colorSquare(coords, blankColor);
    }

    if(minesToPlace > gridSize) {
        minesToPlace = gridSize;
    }

    var loopCount = 0;
    placeMines(minesToPlace);
}

function placeMines(minesToPlace) {
    var loopCount = 0;
    while(minesToPlace > 0 && loopCount < 50) {
        var indexToMine = Math.floor(Math.random()*gridSize);
        if(grid[indexToMine].hasMine === false) {
            grid[indexToMine].hasMine = true;
            minesToPlace--;
        }
        loopCount++;
    }
    console.log(minesToPlace + " mines left to place");
}

function onClick (canvas, event) {
    if(!gameOver) {
        var coords = getMousePosRelativeToCanvas(canvas, event);
        var gridCoords = getGridCoordFromCanvasPosition(coords);
        var colorClear = '#ffffff';
        var colorMine = '#ff0000';
        console.log('click');
        // First, check if the click is on the grid
        if(gridCoords.x !== -1) {
            // If we are on the grid, we can get the square
            var square = getSquareFromCoords(gridCoords);
            // If we are in reveal mode, reveal the square if it is not revealed or flagged
            if(revealModeOn && !square.revealed && !square.flagged) {  
                if(!checkForMine(gridCoords)){
                    square.revealed = true;
                    colorSquare(gridCoords, colorClear);
                    var numMinesAround = checkNeighborsForMines(gridCoords);
                    if(numMinesAround > 0) {
                        drawTextAtCoords(numMinesAround, gridCoords);
                    }
                } else {
                    colorSquare(gridCoords, colorMine);
                    gameOver = true;
                }
            } else {
                square.flagged = !square.flagged;
                // Draw/remove flag at flagged square
            }
        }
    }
}


function getMousePosRelativeToCanvas (canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.x - rect.left,
        y: event.y - rect.top,
        toString: (function(){
            var string = this.x + ", " + this.y;
            return string;
        })
    };
}

function getGridCoordFromCanvasPosition (position) {
    var calcx, calcy;
    calcx = Math.floor(position.x / squareSide);
    calcy = Math.floor(position.y / squareSide);

    if( calcx < 0 || calcx >= numSquaresX || calcy < 0 || calcy >= numSquaresY) {
        return {
            x: -1,
            y: -1,
            toString: (function(){
                return 'out of bounds';
            })
        };
    } else {
        return {
            x: calcx,
            y: calcy,
            toString: (function(){
                var string = this.x + ", " + this.y;
                return string;
            })
        };
    }
}

function returnRandomColor(gridPosition) {
    var startX, startY, endX, endY;
    var color;
    if(revealModeOn){
        color = getRandomColor();
    } else {
        color = '#ffffff'
    }
    return color;
}

function colorSquare(gridPosition, color){
    ctx.fillStyle = color;

    // If we want to leave the lines behind, our x and y for the fill need +1 and -2 for the fill start and end respectively
    startX = gridPosition.x * squareSide + 1;
    startY = gridPosition.y * squareSide + 1;
    endX = squareSide - 2;
    endY = squareSide - 2;

    ctx.fillRect(startX, startY, endX, endY); 
}

// Cribbed from jagadesha on Medium
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for(var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function drawModeChanged() {
    var buttonString;
    revealModeOn = !revealModeOn;
    if(revealModeOn) {
        // set the text of the button to reveal mode
        buttonString = 'Reveal Mode';
    } else {
        // set the text of the button to flag mode
        buttonString = 'Flag Mode';
    }

    document.getElementById('drawToggle').textContent = buttonString;
}

function checkForMine(coords) {
    var index = getIndexFromCoords(coords);

    if(grid[index].hasMine) {
        return true;
    } else {
        return false;
    }
}

function checkForMineWithIndex(index){
    if(index < 0 || index > gridSize) {
        return false;
    }

    if(grid[index]) {
        return true;
    } else {
        return false;
    }
}

// Given a set of coordinates, returns how many mines are around that set of coordinates
// If it's greater than 0, then a later function will write that number as text in the square
function checkNeighborsForMines(coords) {
    var square = getSquareFromCoords(coords);

    var numberOfNeighborsWithMines = 0;

    directions.forEach(function(direction) {
        console.log(direction);
        var neighbor = square[direction];
        console.log(direction + ' neighbor is ' + neighbor);
        if(neighbor !== -1 && neighbor.hasMine) {
            numberOfNeighborsWithMines++;
        }
    });
    console.log('Number of neighbors with mines = ' + numberOfNeighborsWithMines);
    return numberOfNeighborsWithMines;
}

function getCoordsFromIndex(index) {
    var coordx = index % numSquaresX;
    var coordy = Math.floor(index / numSquaresX);

    return {
        x: coordx,
        y: coordy
    };
}

function getIndexFromCoords(coords) {
    return (coords.x + coords.y * numSquaresX);
}

function getOppositeDirection(direction) {
    var directionsIndex = directions.indexOf(direction);
    console.log(directionsIndex);
    if (directionsIndex >= 0 && directionsIndex < 4) {
        var oppositeIndex = directionsIndex + 4;
        return directions[oppositeIndex];
    } else if (directionsIndex >= 4) {
        var oppositeIndex = directionsIndex - 4;
        return directions[oppositeIndex];
    } else {
        return -1;
    }
}

function getSquareFromCoords(coords) {
    var index = getIndexFromCoords(coords);
    return grid[index];
}

function drawTextAtCoords(text, coords) {
    ctx.textAlign='center';
    ctx.fillStyle = '#000000';
    // We could put a switch in here to make the text a different color for different values of mines
    ctx.font = Math.floor(squareSide / 2) + 'pt Arial';

    var positionx = coords.x * squareSide + 0.5 * squareSide;
    var positiony = coords.y * squareSide + 0.75 * squareSide;

    ctx.fillText(text, positionx, positiony);
}

function startNewGame() {
    setupGrid();
    setupGame();
}

startNewGame();