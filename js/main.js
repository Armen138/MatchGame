/*jshint newcap:false, nonew:true */
/*global console */
require(["game",
        "canvas",
        "resources",
        "menu",        
        "gamepad",
        "play",
        "gui/modal",
        "gui/element",
        "gui/label",
        "gui/badge"
        ],
    function(
            game,
            Canvas,
            Resources,
            Menu,
            gamePad,
            play,
            Modal,
            Element,
            Label,
            Badge
            ) {
    "use strict";
    //Canvas.size(window.innerWidth, window.innerHeight);

     var screenSize = { width: 324,
                     height: 454};
    // if(navigator.isCocoonJS) {
    //     console.log("resizing canvas to fit android");
    //     if(screenSize.width > 960 && screenSize.width > screenSize.height) {
    //         var ratio = 960 / screenSize.width;
    //         screenSize.width = 960;
    //         screenSize.height *= ratio;
    //     } else {
    //         if(screenSize.height > 960 && screenSize.width < screenSize.height) {
    //             var ratio = 960 / screenSize.height;
    //             screenSize.height = 960;
    //             screenSize.width *= ratio;
    //         }                             
    //     }        
    // } else {
    //     console.log("capping canvas at 960x960");
    //     if(screenSize.width > 960) {
    //         screenSize.width = 960;
    //     }
    //     if(screenSize.height > 960) {
    //         screenSize.height = 960;
    //     }
    // }
    Canvas.size(screenSize);
    Canvas.clear("black");

    var playerStats = {};

    if(localStorage.playerStats) {
        playerStats = JSON.parse(localStorage.playerStats);
    }

    Resources.on("load", function() {
        console.log("loaded");
        game.run();
    });

    Resources.load({
        "grass": "images/grass.png",
        "dirt": "images/dirt.png",
        "grid": "images/grid.png",
        "bricks": "images/bricks.png"
    });

    var levels = [ "intro", "level1", "level2" ];
    var currentLevel = 0;
    var winScreen = Modal({ width: 400, height: 360 });
    winScreen.add(Label("Level Complete"));
    var retry = Label("replay", { position: {X: 40, Y: 320}, fontSize: 22});
    var cntinue = Label("continue", { position: {X: 360, Y: 320}, fontSize: 22});
    retry.on("click", function() {
        Resources.select.play();
        play.respawn();
        game.state = play;
    });
    cntinue.on("click", function() {
        console.log("continue ...");
        Resources.select.play();
        currentLevel++;
        if(currentLevel >= levels.length) {
            currentLevel = 0;
        }
        play.level = levels[currentLevel];
        play.respawn();
        game.state = play;
    });

    var badges = {
        ghost: Badge({
            position: { X: 30, Y: 80 },
            size: { width: 48, height: 48 },
            image: Resources.badge,
            title: "Ghost",
            description: "Finished level without being seen"
        }),
        pacifist: Badge({
            position: { X: 30, Y: 160 },
            size: { width: 48, height: 48 },
            image: Resources.rose,
            title: "Pacifist",
            description: "Finished level without killing anyone"
        }),
        butcher: Badge({
            position: { X: 30, Y: 240 },
            size: { width: 48, height: 48 },
            image: Resources.grimreaper,
            title: "Butcher",
            description: "Killed them all."
        })        
    };

    winScreen.add(retry);
    winScreen.add(cntinue);
    winScreen.add(badges.ghost);
    winScreen.add(badges.pacifist);
    winScreen.add(badges.butcher);
    var gameover = Menu(Canvas.element, [
            {
                label: "Restart",
                action: function() {
                    play.reset();
                    game.state = play;
                }
            },
            {
                label: "Menu",
                action: function() {
                    game.state = home;
                }
            }
        ], Resources.gameover);

    var winner = Menu(Canvas.element, [
            {
                label: "Restart",
                action: function() {
                    play.reset();
                    game.state = play;
                }
            },
            {
                label: "Menu",
                action: function() {
                    game.state = home;
                }
            }
        ], Resources.winner);

    var paused = Menu(Canvas.element, [
            {
                label: "Resume",
                action: function() {
                    //Resources.select.play();
                    //play.getWorld().pausetime = paused.lifetime;
                    game.state = play;
                }
            },
            {
                label: "Menu",
                action: function() {
                    //Resources.select.play();
                    game.state = home;
                }
            }
        ]);
    var home = Menu(Canvas.element, [
            {
                label: "Play",
                action: function() {
                    game.state = play;                    
                }
            },
            {
                label: "Credits",
                action: function() {
                   // Resources.select.play();
                    // document.getElementById("credits").style.display = "block";
                    console.log("show credits");
                }
            }
        ], Resources.logo);

    window.addEventListener("blur", function() {
        if(game.state == play) {
            game.state = paused;
        }
    });

    // play.on("win", function(e) {
    //     badges.ghost.active = false;
    //     badges.pacifist.active = false;
    //     badges.butcher.active = false;
    //     for(var i = 0; i < e.badges.length; i++) {
    //         badges[e.badges[i]].active = true;
    //     }
    //     Resources.levelcomplete.play();
    //     game.state = winScreen;
    // });

    // gamePad.on("axis", function(e) {
    //     if(e.which === 1) {
    //         if(e.action === "engage") {
    //             if(e.value < 0) {
    //                 down[keys.DOWN] = false;
    //                 down[keys.UP] = true;
    //             } else {
    //                 down[keys.UP] = false;
    //                 down[keys.DOWN] = true;
    //             }
    //         } else {
    //             down[keys.UP] = false;
    //             down[keys.DOWN] = false;
    //         }
    //     }
    //     if(e.which === 0) {
    //         if(e.action === "engage") {
    //             if(e.value < 0) {
    //                 down[keys.RIGHT] = false;
    //                 down[keys.LEFT] = true;
    //             } else {
    //                 down[keys.LEFT] = false;
    //                 down[keys.RIGHT] = true;
    //             }
    //         } else {
    //             down[keys.LEFT] = false;
    //             down[keys.RIGHT] = false;
    //         }
    //     }
    // });
    // gamePad.on("button", function(e) {
    //     if(e.action === "down") {
    //         if(e.which === 0) {
    //             down[keys.SPACE] = true;
    //         }
    //     }
    //     if(e.action === "up") {
    //         if(e.which === 0) {
    //             down[keys.SPACE] = false;
    //         }
    //     }
    // });
    game.paused = paused;
    game.state = home;
});
