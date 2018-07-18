var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
//ctx.fillStyle = "#FF0000";
//ctx.fillRect(0,0,150,75);
//Draw a grid 30x20 squares
(function(){
    var squareSide = 20;
    var numSquaresX = 25;
    var numSquaresY = 25;

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

    document.addEventListener("click", onClick, false);
})();

var onClick = function(event) {
    console.log("Click at " + event.x + ", " + event.y);
}