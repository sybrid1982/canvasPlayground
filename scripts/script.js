var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
//ctx.fillStyle = "#FF0000";
//ctx.fillRect(0,0,150,75);
//Draw a grid 30x20 squares
(function(){
    var squareSide = 20;
    var numSquaresX = 25;
    var numSquaresY = 25;

    for(var x = 0; x <= numSquaresX; x++) {
        ctx.moveTo(x * squareSide, 0);
        ctx.lineTo(x * squareSide, numSquaresY * squareSide);
        ctx.stroke();
    }
    for(var y = 0; y <= numSquaresY; y++) {
        ctx.moveTo(0, y * squareSide);
        ctx.lineTo(numSquaresX * squareSide, y * squareSide);
        ctx.stroke();
    }
})();