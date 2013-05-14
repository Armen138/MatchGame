/*jshint newcap:false, nonew:true */
/*global console, alert */
define("play", [
        "canvas",
        "resources",
        "keys",
        "events"        
    ],function(Canvas,
            Resources,
            keys,
            Events) {
    "use strict";
    var gridOffset = {X: 20, Y: 152};
    function pieceByIndex(idx) {
        var texSize = {
            width: Resources.bricks.width / 32,
            height: Resources.bricks.height / 32
        };
        var texCoords = {
            X: (idx % texSize.width) * 32, 
            Y: (idx / texSize.width | 0) * 32
        };
        return texCoords;
    }
    var Piece = function(x, y, type) {
        var piece = {
            type: type || Math.random() * 3 | 0,
            draw: function(x, y) {
                piece.X = x;
                piece.Y = y;
                var texCoords = pieceByIndex(piece.type);
                Canvas.context.drawImage(Resources.bricks, texCoords.X, texCoords.Y, 32, 32, x*32, y*32, 32, 32);
            },
            X: x,
            Y: y
        };
        return piece;
    }
    var pieces = (function() {
        var items = [];
        for(var x = 0; x < 9; x++) {
            items[x] = [];
            for(var y = 0; y < 9; y++) {
                items[x][y] = Piece(x, y);
            }
        }
       function have(array, item) {
            for(var i = 0; i < array.length; i++) {
                if(array[i] === item) {
                    return true;
                }
            }
            return false;
        }

        function friends(p, f) {
            f.push(items[p.X][p.Y]);
            var neighbors = [
                {X: -1, Y: 0},
                {X: 1, Y: 0}, 
                {X: 0, Y: -1},
                {X: 0, Y: 1}
            ];
            for(var i = 0; i < neighbors.length; i++) {
                var pf = {
                    X: p.X + neighbors[i].X,
                    Y: p.Y + neighbors[i].Y
                };
                if(items[pf.X] && items[pf.X][pf.Y] && !have(f, items[pf.X][pf.Y]) && items[pf.X][pf.Y].type === items[p.X][p.Y].type) {
                    friends(pf, f);
                }
            }
            return f;
        }
        function above(x, y) {
            for(var i = y - 1; i >= 0; --i) {
                if(items[x][i]) {
                    return items[x][i];
                }
            }
            return null;
        }                   
        var p = {
            draw: function() {
                Canvas.context.save();
                Canvas.context.translate(gridOffset.X, gridOffset.Y);
                for(var x = 0; x < 9; x++) {
                    for(var y = 0; y < 9; y++) {
                        if(items[x][y]) {
                            items[x][y].draw(x, y);
                        }                        
                    }
                }                
                Canvas.context.restore();
            },
            match: function(position) {
                if(items[position.X][position.Y]) {
                    return friends(position, []);
                }
                return null;
            },
            pop: function(targets) {
                for(var i = 0; i < targets.length; i++) {
                    items[targets[i].X][targets[i].Y] = null;
                }
            },
            drop: function() {                
                var to = 0;
                for(var x = 0; x < 9; x++) {
                    for(var y = 8; y >= 0; y--) {
                        if(items[x][y] !== null &&  items[x][y + 1] === null) {
                            to = y + 1;
                            for(var i = y + 1; i < 9; i++) {
                                if(items[x][i] !== null) {
                                    to = i - 1;
                                    break;
                                }
                            };
                            if(items[x][y]) {
                                console.log(x + "," + y + "::" + items[x][y].type);
                            }
                            items[x][to] = items[x][y];
                            items[x][y] = null; //Piece(x, y, 18);
                            // console.log(items[x][y] === items[x][y + 1]);
                        }
                    }
                }
            }
        };
        return p;
    }());
    var play = {
        init: function() {

        },
        run: function() {
            Canvas.context.drawImage(Resources.dirt, 0, 0);
            Canvas.context.drawImage(Resources.grid, 0, 0);
            pieces.draw();
            Canvas.context.drawImage(Resources.grass, 0, 0);

        },
        clear: function(cb) {
            cb();
        },
        click: function(mouse) {
            if (mouse.X > gridOffset.X &&
                mouse.X < gridOffset.X + 288 &&
                mouse.Y > gridOffset.Y &&
                mouse.Y < gridOffset.Y + 288) {
                var brick = {
                    X: (mouse.X - gridOffset.X) / 32 | 0,
                    Y: (mouse.Y - gridOffset.Y) / 32 | 0
                };
                var matched = pieces.match(brick);
                if(matched && matched.length > 1) {
                    // for(var i = 0; i < matched.length; i++) {
                        pieces.pop(matched);
                        console.log("drop");
                        pieces.drop();
                    // }                    
                }
            }
        }
    };
    Events.attach(play);
    return play;
});