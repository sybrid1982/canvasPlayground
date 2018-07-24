"use strict";
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let GameSession = function() {
    // Constant variables
    const canvasSize = 500;
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    let flagIMG = setupFlagImage();
    const blankColor = '#C0C0C0';


    // Calculated variables
    let grid, gridSize;

    // letiable variables
    let revealModeOn = true;
    let gameOver = false;
    let revealedSquares = 0;
    let squareSide = 50;
    let numSquaresX = 10;
    let numSquaresY = 10;
    let numMines = 15;

    // Constructor for Square objects
    let Square = function(index, position){
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
        let inSizeX = document.getElementById('gridSize').value;
        // Check if the grid size 
        if(isNaN(inSizeX)) {
            inSizeX = 10;
        } else {
            inSizeX = Math.floor(inSizeX);
        }

        numSquaresX = numSquaresY = inSizeX;
        squareSide = canvasSize / numSquaresX;

        // This loop should draw all the vertical lines
        for(let x = 0; x <= numSquaresX; x++) {
            ctx.moveTo(x * squareSide, 0);
            ctx.lineTo(x * squareSide, numSquaresY * squareSide);
            ctx.stroke();
        }
        // This loop should draw all the horizontal lines
        for(let y = 0; y <= numSquaresY; y++) {
            ctx.moveTo(0, y * squareSide);
            ctx.lineTo(numSquaresX * squareSide, y * squareSide);
            ctx.stroke();
        }

    }

    (function(){
        document.getElementById('drawToggle').onclick = toggleRevealMode;
    })();

    // SETUP GAME
    function setupGame(){
        gameOver = false;
        if(!revealModeOn) {
            toggleRevealMode();
        }

        gridSize = numSquaresX * numSquaresY;
        numMines = document.getElementById('numOfMines').value;
        if(isNaN(numMines)){
            numMines = 15;
        } else {
            numMines = Math.floor(numMines);
        }
        let minesToPlace = numMines;

        if(grid && grid.length > 0) {
            // Destroy the old grid to make sure we don't have a bunch of crap
            for(let oldIndex = grid.length; oldIndex > 0; oldIndex--) {
                grid[oldIndex] = null;
            }
        }

        grid = [];
        for(let index = 0; index < gridSize; index++) {
            let coords = getCoordsFromIndex(index);
            let square = new Square(index, coords);
            // Set neighbors for the new square
            // Logic outline:  If the x coord is > 0, then there should be a neighbor to the west
            // That neighbor will be the one at index - 1
            setNeighbors(coords, square, index);

            grid.push(square);
            colorSquare(coords, blankColor);
        }

        if(minesToPlace > gridSize) {
            minesToPlace = gridSize;
        }

        placeMines(minesToPlace);

        function setNeighbors(coords, square, index) {
            if (coords.x > 0) {
                let wNeighbor = grid[index - 1];
                square.setNeighbor(wNeighbor, 'W');
                wNeighbor.setNeighbor(square, 'E');
                // If Y is > 0, X and Y > 0 and we have a northwest neighbor
                if (coords.y > 0) {
                    // That neighbor is at index-gridSizeX
                    let nwNeighbor = grid[index - numSquaresX - 1];
                    square.setNeighbor(nwNeighbor, 'NW');
                    nwNeighbor.setNeighbor(square, 'SE');
                }
            }
            // Set North neighbors if y > 0
            if (coords.y > 0) {
                let nNeighbor = grid[index - numSquaresX];
                square.setNeighbor(nNeighbor, 'N');
                nNeighbor.setNeighbor(square, 'S');
                // If Y > 0, then we may have a NE neighbor, but only if we aren't at gridSizeX index
                if (coords.x < numSquaresX - 1) {
                    let neNeighbor = grid[index - numSquaresX + 1];
                    square.setNeighbor(neNeighbor, 'NE');
                    neNeighbor.setNeighbor(square, 'SW');
                }
            }
        }
    }

    function placeMines(minesToPlace) {
        let loopCount = 0;
        while(minesToPlace > 0 && loopCount < 50) {
            let indexToMine = Math.floor(Math.random()*gridSize);
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
            let coords = getMousePosRelativeToCanvas(canvas, event);
            let gridCoords = getGridCoordFromCanvasPosition(coords);
            let colorClear = '#ffffff';
            let colorMine = '#ff0000';

            // First, check if the click is on the grid
            if(gridCoords.x !== -1) {
                // If we are on the grid, we can get the square
                let square = getSquareFromCoords(gridCoords);
                // console.log(`${gridCoords} square revealed is ${square.revealed} and flagged is ${square.flagged}`);
                // directions.forEach(function(direction) {
                //     console.log(`${direction} neighbor is ${getCoordsFromIndex(square[direction].index).toString()}`);
                // });
                // If we are in reveal mode, reveal the square if it is not revealed or flagged
                if(revealModeOn && !square.revealed && !square.flagged) {  
                    revealSquare(gridCoords, square, colorClear, colorMine);
                } else if(!revealModeOn && !square.revealed) {
                    square.flagged = !square.flagged;
                    // Draw/remove flag at flagged square
                    if(square.flagged) {
                        drawFlag(gridCoords);
                    } else {
                        colorSquare(gridCoords, blankColor);
                    }
                }
            }
        }

        function revealSquare(gridCoords, square, colorClear, colorMine) {
            if (!checkForMine(gridCoords)) {
                square.revealed = true;
                revealedSquares++;
                colorSquare(gridCoords, colorClear);
                if(gridSize - numMines === revealedSquares) {
                    console.log('You win!');
                }
                let numMinesAround = checkNeighborsForMines(gridCoords);
                if (numMinesAround > 0) {
                    drawTextAtCoords(numMinesAround, gridCoords);
                }
            }
            else {
                colorSquare(gridCoords, colorMine);
                gameOver = true;
            }
        }
    }


    function getMousePosRelativeToCanvas (canvas, event) {
        let rect = canvas.getBoundingClientRect();
        return {
            x: event.x - rect.left,
            y: event.y - rect.top,
            toString: (function(){
                let string = this.x + ", " + this.y;
                return string;
            })
        };
    }

    function getGridCoordFromCanvasPosition (position) {
        let calcx, calcy;
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
                    let string = this.x + ", " + this.y;
                    return string;
                })
            };
        }
    }

    // Left behind because it's cool, but no longer used
    // function returnRandomColor(gridPosition) {
    //     let startX, startY, endX, endY;
    //     let color;
    //     if(revealModeOn){
    //         color = getRandomColor();
    //     } else {
    //         color = '#ffffff'
    //     }
    //     return color;
    // }

    function colorSquare(gridPosition, color){
        ctx.fillStyle = color;

        // If we want to leave the lines behind, our x and y for the fill need +1 and -2 for the fill start and end respectively
        let startX = gridPosition.x * squareSide + 1;
        let startY = gridPosition.y * squareSide + 1;
        let endX = squareSide - 2;
        let endY = squareSide - 2;

        ctx.fillRect(startX, startY, endX, endY); 
    }

    // Cribbed from jagadesha on Medium
    function getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for(let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function toggleRevealMode() {
        let buttonString;
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
        let index = getIndexFromCoords(coords);

        if(grid[index].hasMine) {
            return true;
        } else {
            return false;
        }
    }

    // No longer needed
    /*
    function checkForMineWithIndex(index){
        if(index < 0 || index > gridSize) {
            return false;
        }

        if(grid[index]) {
            return true;
        } else {
            return false;
        }
    } */

    // Given a set of coordinates, returns how many mines are around that set of coordinates
    // If it's greater than 0, then a later function will write that number as text in the square
    function checkNeighborsForMines(coords) {
        let square = getSquareFromCoords(coords);

        let numberOfNeighborsWithMines = 0;

        directions.forEach(function(direction) {
            // console.log(direction);
            let neighbor = square[direction];
            // console.log(`${direction} neighbor is ${neighbor}`);
            if(neighbor !== -1 && neighbor.hasMine) {
                numberOfNeighborsWithMines++;
            }
        });
        // console.log('Number of neighbors with mines = ' + numberOfNeighborsWithMines);
        return numberOfNeighborsWithMines;
    }

    function getCoordsFromIndex(index) {
        let coordx = index % numSquaresX;
        let coordy = Math.floor(index / numSquaresX);

        return {
            x: coordx,
            y: coordy,
            toString: function() {
                return `${coordx}, ${coordy}`
            }
        };
    }

    function getIndexFromCoords(coords) {
        return (coords.x + coords.y * numSquaresX);
    }

    /* This function is no longer called, but it finds the
     * opposite direction to a passed function */
    
    // function getOppositeDirection(direction) {
    //     let directionsIndex = directions.indexOf(direction);
    //     console.log(directionsIndex);
    //     if (directionsIndex >= 0 && directionsIndex < 4) {
    //         let oppositeIndex = directionsIndex + 4;
    //         return directions[oppositeIndex];
    //     } else if (directionsIndex >= 4) {
    //         let oppositeIndex = directionsIndex - 4;
    //         return directions[oppositeIndex];
    //     } else {
    //         return -1;
    //     }
    // }

    function getSquareFromCoords(coords) {
        let index = getIndexFromCoords(coords);
        return grid[index];
    }

    function drawTextAtCoords(text, coords) {
        ctx.textAlign='center';
        // We could put a switch in here to make the text a different color for different values of mines
        ctx.font = Math.floor(squareSide / 2) + 'pt Arial';
        let color = '#000000';
        
        // Set the color for the text
        // 1 will be black, 2 blue, 3 yellow, and 4+ red
        switch(text) {
            case 1: 
                color = '#000000';
                break;
            case 2:
                color = '#0000ff';
                break;
            case 3:
                color = '#ffff00';
                break;
            default:
                color = '#ff0000';
                break;
        }

        let positionx = coords.x * squareSide + 0.5 * squareSide;
        let positiony = coords.y * squareSide + 0.75 * squareSide;

        ctx.fillStyle = color;
        ctx.fillText(text, positionx, positiony);
    }

    // Takes hexcode colors and linearlly interpolates between
    // them to get a new color.
    function lerpColor(colorA, colorB, lerpAmount) {
        let colorAClean = colorCleaner(colorA);
        let colorBClean = colorCleaner(colorB);


    }

    function colorCleaner(color) {
        let colorInternal = color;
        if(color[0] = '#') {
            let temp = '';
            for(let i = 1; i <= 7; i++) {
                temp += color[i];
            }
            colorInternal = temp;
        }
        return colorInternal;
    }

    function startNewGame() {
        setupGrid();
        setupGame();
    }

    // FLAG DRAWING FUNCTIONS
    // Load the flag from the source image
    function setupFlagImage() {
        let flag_image = new Image();
        flag_image.src = "../Images/simple-flag-two-color.jpg";
        return flag_image;
    }
    // Draw the flag at game board coordinates
    function drawFlag(coords){
        let positionx = coords.x * squareSide + 0.1 * squareSide;
        let positiony = coords.y * squareSide + 0.1 * squareSide;
        console.log("DrawFlag called");
        ctx.drawImage(flagIMG, positionx, positiony, squareSide * .8, squareSide * .8);
    }
    // END FLAG DRAWING FUNCTIONS
    startNewGame();

    return {
        onClick: function() {        // Setup the click listener
            onClick(canvas, event);
        }
    }
}

let gameManager = function(){
    let gameSessionObj;

    let startNewGame = function(){
        if(gameSessionObj != null) {
            document.removeEventListener("click", gameSessionObj.onClick, false);
            gameSessionObj = null;
        }

        gameSessionObj = GameSession();
        document.addEventListener("click", gameSessionObj.onClick, false);
    }

    document.getElementById('startNewGame').onclick = startNewGame;
    startNewGame();
}();