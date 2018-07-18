var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Variables
var squareSide = 20;
var numSquaresX = 25;
var numSquaresY = 25;

//ctx.fillStyle = "#FF0000";
//ctx.fillRect(0,0,150,75);
//Draw a grid 30x20 squares
(function(){
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
    console.log('Grid drawn');
    var boundOnClick = onClick.bind(this, canvas);
    document.addEventListener("click", boundOnClick, false);
})();

function onClick (canvas, event) {
    var coords = getMousePosRelativeToCanvas(canvas, event);
    var gridCoords = getGridCoordFromCanvasPosition(coords);
    colorClickedSquare(gridCoords);
    console.log("Click at " + event.x + ", " + event.y);
    console.log("That translates to " + coords.toString());
    console.log("That translates to a grid position of " + gridCoords.toString());
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

    if( calcx < 0 || calcx > numSquaresX || calcy < 0 || calcy > numSquaresY) {
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

function colorClickedSquare(gridPosition) {
    var startX, startY, endX, endY;
    var color = getRandomColor();
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