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
        var drop = false;
        var offset = {X:0,Y:0};
        var die = false;
        var slide = 0;
        var alpha = 1.0;
        var piece = {
            type: type || Math.random() * 3 | 0,
            update: function(d) {
                var items = pieces.getItems();
                if(items[x][y+1] && items[x][y+1].dead) {
                    items[x][y] = items[x][y + 1];
                    y++;                    
                    items[x][y] = piece;
                    piece.Y = y;
                    drop = true;
                    offset.Y += 32;
                }
                // var deadline = true;
                // if(x > 1 && items[x - 1][y].dead) {                    
                //     var dir = -1;
                //     // if(x > items.length / 2) {
                //     //     dir = -1;
                //     // }
                //     for(var yl = 0; yl < items[0].length; yl++) {
                //         if(!items[x + dir][yl].dead) {
                //             deadline = false;
                //             break;
                //         }
                //     }
                //     if(deadline) {
                //         // items[x][y] = items[x + dir][y];
                //         x += dir;
                //         // items[x][y] = piece;
                //         // piece.X = x;
                //         slide = true;
                //         offset.X = -32;
                //     }
                // }

                if(slide !== 0) {
                    offset.X += slide;
                    if ((slide > 0 && offset.X > 0) ||
                        (slide < 0 && offset.X < 0))  {
                        offset.X = 0;
                        slide = 0;
                        //items[x - dir][y] = items[x][y];
                        // piece.X = x;
                        // items[x + 1][y] = items[x][y];
                        // items[x][y] = piece;
                    }
                }
                if(drop) {
                    offset.Y -= d / 5;
                    if(offset.Y < 0) {
                        offset.Y = 0;
                        drop = false;
                    }
                }
                if(die) {
                    alpha -= d / 200.0;
                    if(alpha < 0) {
                        alpha = 0;
                        piece.dead = true;
                        die = false;
                    }
                }
            },
            draw: function(d) {
                if(!piece.dead) {
                    piece.update(d);
                    var texCoords = pieceByIndex(piece.type);
                    Canvas.context.globalAlpha = alpha;
                    Canvas.context.drawImage(Resources.bricks, texCoords.X, texCoords.Y, 32, 32, x*32 - offset.X, y*32 - offset.Y, 32, 32);                                            
                    Canvas.context.globalAlpha = 1.0;
                }
            },
            slide: function(direction) {   
                var items = pieces.getItems();
                slide = direction;
                offset.X -= (32 * direction);
                items[x][y] = items[x - direction][y];
                x -= direction;
                items[x][y] = piece;
                piece.X = x;
            },
            die: function() {
                die = true;
                // piece.dead = true;
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
                if (items[pf.X] && 
                    items[pf.X][pf.Y] && 
                    !items[pf.X][pf.Y].dead &&
                    !have(f, items[pf.X][pf.Y]) && 
                    items[pf.X][pf.Y].type === items[p.X][p.Y].type) {
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
            draw: function(d) {
                Canvas.context.save();
                Canvas.context.translate(gridOffset.X, gridOffset.Y);
                for(var x = 0; x < 9; x++) {
                    for(var y = 0; y < 9; y++) {
                        if(items[x][y]) {
                            items[x][y].draw(d);
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
                    items[targets[i].X][targets[i].Y].die();// = null;
                }
            },
            getItems: function() {
                return items;                
            },
            update: function() {   
                // console.log("drop");
                for(var x = 1; x < 8; x++) {
                    var deadline = true;
                    for(var y = 0; y < 9; y++) {
                        if(!items[x][y].dead) {
                            deadline = false;
                            break;
                        }
                    }
                    if(deadline) {
                        var d = 1;
                        if(x < 5) {
                            d = -1;
                        }                        
                        for(var i = 0; i < 9; i++) {
                            if(/*(x + d > 0 && x + d < 9) &&*/
                                !items[x + d][i].dead) {
                                items[x + d][i].slide(d);
                            }
                        }
                    } 
                }             
            }
        };
        return p;
    }());
    var then = Date.now();
    var play = {
        init: function() {

        },
        run: function() {
            var now = Date.now();
            var d = now - then;
            pieces.update();
            Canvas.context.drawImage(Resources.dirt, 0, 0);
            // Canvas.context.drawImage(Resources.grid, 0, 0);
            pieces.draw(d);
            Canvas.context.drawImage(Resources.grass, 0, 0);
            then = now;
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
                    pieces.pop(matched);
                }
            }
        }
    };
    Events.attach(play);
    return play;
});