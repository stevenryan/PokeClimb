var game;
// Store values as variables to be accessed in the game
var gameOptions = {

    // width of the game, height will scale
    gameWidth: 800,
    // Where active floor starts and space between them in pixels
    floorStart: 1 / 8 * 5,
    floorGap: 250,

    // Player properties
    playerGravity: 10000,
    playerSpeed: 450,
    climbSpeed: 450,
    playerJump: 1800,

    // speed of arrows, in pixels per second
    arrowSpeed: 1000,

    /*  we do not want a coin to appear on each floor, so coinRatio is a variable with a positive number.
        when a floor is created, a random integer number between 0 and coinRatio is generated, and
        the coin will appear ony if the random number is greater than zero.
        basically the probability for a coin to appear is coinRatio(coinRatio+1), or 2/3 in this case  */
    coinRatio: 2,

    // monster speed, in pixels per second
    monsterSpeed: 250,

    /*  following the same concept applied to coinRatio, doubleSpikeRatio determines whether we have
        to put two spikes on the same floor. The probability is doubleSpikeRatio(doubleSpikeRatio+1)  */
    doubleSpikeRatio: 1,

    // you can customize up to the color of the sky thanks to skyColor, which accepts the hexadecimal RGB value
    skyColor: 0x89d7fb,

    /*  the radius, in pixel, of a "safe area" which is an area where no obstacles can be placed. I use it
        to prevent spikes to be created too close to a ladder, or too close to other spikes, and so on  */
    safeRadius: 180,

    /*  the name of the variable where to save game information into local storage. It's a string.
        changing the string will also reset game information  */
    localStorageName: "PokeClimb",

    // version of the game. Just in case you need to display it somewhere
    versionNumber: "1.0",

    // relative path where to store sprites
    spritesPath: "assets/sprites/",

    // relative path where to store fonts
    fontsPath: "assets/fonts/",

    // relative path where to store setBounds
    soundPath: "assets/sounds/"
}

// window.onload is executed immediately after the page has been loaded, so it's the first function to be executed
window.onload = function() {

    // windowWidth variable gets the width in pixels of the browser window viewport
    var windowWidth = window.innerWidth;

    // windowHeight variable gets the height in pixels of the browser window viewport
    var windowHeight = window.innerHeight;

    // if windowWidth is greater than windowHeight we are playing in landscape mode
    if(windowWidth > windowHeight){

        /*  in this case we set windowHeight at about two times windowWidth.
            this is the average portrait mode aspect ratio used by most mobile devices  */
        windowHeight = windowWidth * 1.8;
    }

    /*  now it's time to calculate game height.
        it's all a matter of aspect ratio
        we want the game to fill the full height of the window while keeping
        width to 800, so we are going to multiply windowHeight by the ratio between
        gameOptions.gameWidth and windowWidth.
        example with an iPhone 7 (750x1334)
        windowWidth = 750
        windowHeight = 1334
        gameOptions.gameWidth = 800 (fixed value)
        gameHeight = 1334 * 800 / 750 = 1423
        750x1334 has the same aspect ratio as 800x1423  */
    var gameHeight = windowHeight * gameOptions.gameWidth / windowWidth;

    /*  now it's time to create the game itself with a new Phaser.Game instance.
        the two arguments are respectively the width and the height of the game.  */
    game = new Phaser.Game(gameOptions.gameWidth, gameHeight);

    /*  here we define states.
        basically, if you divide a game into "blocks", such as splash screen, main menu, the game itself and so on,
        each of these “blocks” can be developed as a state.
        nothing you can’t do with just plain coding, but if you consider states management flushes the memory,
        releases resources, removes listeners and manages garbage collection, you will definitively want to use them in your games.

        this is how we create a state: the first argument is the key, or the name given to the state,
        and the second argument is the function itself.

        creation of "BootGame" state  */
    game.state.add("BootGame", bootGame);

    // creation of "PreloadGame" state
    game.state.add("PreloadGame", preloadGame);

    // creation of "PlayGame" state
    game.state.add("PlayGame", playGame);

    /*  this is how we execute a state.
        the argument is the key of the state to execute  */
    game.state.start("BootGame");
}

/*  bootGame is the first state to be called, and it basically boots the game
    setting background color and scale mode  */
var bootGame = function(game){}
bootGame.prototype = {

    /*  create method is automatically executed once the state has been created.
        it's executed only once  */
    create: function(){

        // assigning a background color to the game
        game.stage.backgroundColor = gameOptions.skyColor;

        // we'll execute next lines only if the game is not running on a desktop
        if(!Phaser.Device.desktop){
            /*  we want the game to run only in portrait mode, so we need something
                to force the game to run in only one orientation.
                forceOrientation method enables generation of incorrect orientation signals
                which we can handle to warn players they are playing in the wrong orientation  */
            game.scale.forceOrientation(false, true);

            // this function is executed when the game enters in an incorrect orientation
            game.scale.enterIncorrectOrientation.add(function(){

                // pausing the game. a paused game doesn't update any of its subsystems
                game.paused = true;

                // hiding the canvas
                document.querySelector("canvas").style.display = "none";

                // showing the div with the "wrong orientation" message
                document.getElementById("wrongorientation").style.display = "block";
            })

            // this function is executed when the game enters in an correct orientation
            game.scale.leaveIncorrectOrientation.add(function(){

                // resuming the game
                game.paused = false;

                // showing the canvas
                document.querySelector("canvas").style.display = "block";

                // hiding the div with the "wrong orientation" message
                document.getElementById("wrongorientation").style.display = "none";
            })
        }

        /*  setting scale mode to cover the larger area of the window while
            keeping display ratio and show all the content.
            we know we are covering the entire area of a portrait device thanks to the
            way we set game width and height  */
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        // centering the canvas horizontally and vertically
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        // prevent the game to pause if it loses focus.
        game.stage.disableVisibilityChange = true;

        // now start "PreloadGame" state
        game.state.start("PreloadGame");
    }
}

// in preloadGame we will preload all game assets
var preloadGame = function(game){}
preloadGame.prototype = {

    // preload method is automatically executed at preload time, before "create" method
    preload: function(){

        /*  this is how we load an image.
            the first argument is the key, the second is the path to the image
            open "assets/sprites" folder to see all images
            in next line we are assigning "floor" key to "assets/sprites/floor.png" image  */
        game.load.image("floor", gameOptions.spritesPath + "floor.png");
        game.load.image("ladder", gameOptions.spritesPath + "vine.png");
        game.load.image("coinparticle", gameOptions.spritesPath + "coinparticle.png");
        game.load.image("cloud", gameOptions.spritesPath + "cloud.png");
        // game.load.image("arrow", gameOptions.spritesPath + "arrow.png");
        game.load.image("tap", gameOptions.spritesPath + "pikachu.gif");

        /*  time to load the sound effects.
            it's the same concept applied to images, with the key/path couple of arguments  */
        game.load.audio("coinsound", gameOptions.soundPath + "coin.mp3");
        game.load.audio("jumpsound", gameOptions.soundPath + "jump.mp3");
        game.load.audio("hurtsound", gameOptions.soundPath + "hurt.mp3");

        /*  a sprite sheet is something more complex than an image, as it's
            a set of images placed into a grid, where each grid item represents a frame.
            the first two arguments remain the same as seen with load.image, while the
            3rd and 4th arguments represent grid width and height.
            open "assets/sprites" folder to see all images
            in next line we are assigning "hero" key to a sprite sheet located at
            "assets/sprites/floor.png" where each frame is inside a 24x48 grid  */
        game.load.spritesheet("hero", gameOptions.spritesPath + "player-walk-climb.png", 26, 48);
        game.load.spritesheet("coin", gameOptions.spritesPath + "coin.png", 48, 48);
        game.load.spritesheet("fire", gameOptions.spritesPath + "rapidash.png", 32, 58);
        game.load.spritesheet("bulbasaur", gameOptions.spritesPath + "bulbasaur.png", 40, 40);
        game.load.spritesheet("spike", gameOptions.spritesPath + "grimer.png", 39, 20);
        game.load.spritesheet("monster", gameOptions.spritesPath + "dugtrio-monster.png", 40, 40);
        game.load.spritesheet("spikedmonster", gameOptions.spritesPath + "rhydon-monster.png", 40, 50);
        game.load.spritesheet("arrow", gameOptions.spritesPath + "shell.png", 21, 20);

        /*  you can also use bitmap font to create your own font with effects applied to it
            or just use fonts which aren't the old boring arial, verdana, etc.
            as with all load operations the first parameter is the key
            next is the bitmap font file itself, usually a png image
            finally is the path to the fnt file that goes with the font.
            You can create your bitmap fonts with the free online tool Littera - http://kvazars.com/littera/  */
        game.load.bitmapFont("font", gameOptions.fontsPath + "font.png", gameOptions.fontsPath + "font.fnt");
        game.load.bitmapFont("font2", gameOptions.fontsPath + "font2.png", gameOptions.fontsPath + "font2.fnt");
    },

    // create method is automatically executed once the state has been created.
    create: function(){

        // now start "PlayGame" state
        game.state.start("PlayGame");
    }
}

// in playGame you can find the game itself
var playGame = function(game){}
playGame.prototype = {

    /*  create method is automatically executed once the state has been created.
        we will use to set up the game and wait for player interaction  */
    create: function(){

        /*  using a ternary operator to save into savedData variable the object inside local storage, or new object with both "score" and "coins" values to zero.
            basically we check if localStorage.getItem(gameOptions.localStorageName) is null (no saved data)
            in this case savedData will become the object {score : 0, coins: 0}
            if localStorage.getItem(gameOptions.localStorageName) is NOT null, savedData will become the object created by
            decoding the JSON string saved  */
        this.savedData = localStorage.getItem(gameOptions.localStorageName) == null ? {score : 0, coins: 0} : JSON.parse(localStorage.getItem(gameOptions.localStorageName));

        /*  each game starts with some default properties such as the score at zero, the lives at three
            and so on, which are defined in this case by setDefaultProperties method  */
        this.setDefaultProperties();

        // this method will add audio to the game
        this.addAudio();

        /*  we are using ARCADE physics in this game.
            the physics engine will handle collisions, overlaps, velocities and motions  */
        game.physics.startSystem(Phaser.Physics.ARCADE);

        /*  we have to define world bounds.
            a game has only one world: the abstract place in which all game objects live.
            world is not bound by stage limits and can be any size.
            "setBounds" updates the size of this world, and the four arguments are respectively:
            x coordintate of the top left most corner of the world, in pixels.
            y coordintate of the top left most corner of the world.
            width of the game world in pixels.
            height of the game world in pixels  */
        game.world.setBounds(0, - 3 * gameOptions.floorGap, game.width, game.height + 3 * gameOptions.floorGap);

        /*  this method will create the groups required by the game
            a group is a container for display objects including sprites and images.
            we will also use groups to check for collisions  */
        this.defineGroups();

        // this method will create a particle emitter to be used when the player collects a coin
        this.createParticles();

        // this method will create a fixed overlay where we'll place the score
        this.createOverlay();

        // this method will create the menu
        this.createMenu();

        // this method will define the tweens to be used in game
        this.defineTweens();

        // this method will draw the level
        this.drawLevel();

        /*  this is a listener which waits for a pointer - mouse or finger - to be pressed down
            then fire the callback function this.handkeTap.
            the "this" in the second argument is the context used in the function.  */
        game.input.onDown.add(this.handleTap, this);
    },

    // method to set default properties
    setDefaultProperties: function(){
        // this property will let us know if it's game over. It starts with "false" value because the game is not over yet
        this.gameOver = false;

        /*  we use reachedfloor to keep track of the floor reached by the player.
            first floor is zero because it's the floor the player is running on during the splash screen  */
        this.reachedfloor = 0;

        // collectedCoins counts the coins the player collects. Starts at zero. No coins.
        this.collectedCoins = 0;

        // flag to determine if the player can jump
        this.canJump = true;

        // flag to determine if the player is climbing a ladder
        this.isClimbing = false;

        /*  to save resources, this game uses object pooling.
            object pooling is a technique which stores a collection of a particular object that an application will create
            and keeps on hand for those situations where creating each instance is expensive.
            once a graphic asset does not need anymore
        */

        // the empty array for floor pooling
        this.floorPool = [];

        // the empty array for ladder pooling
        this.ladderPool = [];
        this.bulbasaurPool = [];

        // the empty array for coin pooling
        this.coinPool = [];

        // the empty array for spike pooling
        this.spikePool = [];

        // the empty array for fire pooling
        this.firePool = [];

        // the empty array for arrow pooling
        this.arrowPool = [];

        // the empty array for monster pooling
        this.monsterPool = [];

        // the empty array for spiked monster pooling
        this.spikedMonsterPool = [];
    },

    // this method will define the sound effects used in the game
    addAudio: function(){

        /*  this is how we add an audio resource to the game, the argument is the key
            we assigned to the sound during preload  */
        this.coinSound = game.add.audio("coinsound");
        this.hurtSound = game.add.audio("hurtsound");
        this.jumpSound = game.add.audio("jumpsound");
    },

    // this method will define the groups used in the game
    defineGroups: function(){

        /*  as you can see, with game.add.group() you will add a group
            gameGroup is the main group, and will contain children groups  */
        this.gameGroup = game.add.group();

        // group which will contain all floors
        this.floorGroup = game.add.group();

        // floorGroup is a child of gameGroup
        this.gameGroup.add(this.floorGroup);

        // group which will contain all ladders, child of gameGroup
        this.ladderGroup = game.add.group();
        this.bulbasaurGroup = game.add.group();
        this.gameGroup.add(this.ladderGroup);
        this.gameGroup.add(this.bulbasaurGroup);

        // group which will contain all coins, child of gameGroup
        this.coinGroup = game.add.group();
        this.gameGroup.add(this.coinGroup);

        // group which will contain all flames, monsters and spikes, child of gameGroup
        this.deadlyGroup = game.add.group();
        this.gameGroup.add(this.deadlyGroup);

        // group which will contain all arrows, child of gameGroup
        this.arrowGroup = game.add.group();
        this.gameGroup.add(this.arrowGroup);

        // group which will contain overlay information
        this.overlayGroup = game.add.group();

        // group which will contain the menu
        this.menuGroup = game.add.group();
    },

    // method to create a particle emitter
    createParticles: function(){
        /*  an emitter is a lightweight particle emitter that uses ARCADE physics.
            it can be used for one-time explosions or for continuous effects like rain and fire.
            all it really does is launch Particle objects out at set intervals,
            and fixes their positions and velocities accordingly.
            the three arguments represent respectively:
            * the x coordinate within the emitter that the particles are emitted from.
            * the y coordinate within the Emitter that the particles are emitted from.
            * the total number of particles in this emitter.  */
        this.emitter = game.add.emitter(0, 0, 80);

        // telling the emitter we will be using the image with "coinparticle" key
        this.emitter.makeParticles("coinparticle");

        /*  each particle will have a randomly generated alpha (transparency) from 0.4 to 0.6
            remember 0 = completely transparent; 1 = completely opaque  */
        this.emitter.setAlpha(0.4, 0.6);

        /*  each particle will have a randomly generated x and y scale between 0.4 and 0.6
            the first two arguments define minimum and maximum of x scale
            the second two arguments refer to y scale  */
        this.emitter.setScale(0.4, 0.6, 0.4, 0.6);

        // the emitter is added to gameGroup group
        this.gameGroup.add(this.emitter);
    },

    // method to create the overlay
    createOverlay: function(){

        /*  this is how we add a sprite to the game.
            the three arguments are:
            * the x position
            * the y position
            * the key of the image  */
        // var cloud = game.add.sprite(0, game.height, "cloud");
        //
        // /*  the anchor sets the origin point of the texture.
        //     the default is 0,0 this means the texture's origin is the top left.
        //     setting than anchor to 0.5,0.5 means the textures origin is centered.
        //     setting the anchor to 1,1 would mean the textures origin points will be the bottom right corner.
        //     in this case the anchor is set to the bottom left corner
        // */
        // cloud.anchor.set(0, 1);
        //
        // /*  we are applying the cloud a tint color with the same color as the background color.
        //     since the cloud is a vertical gradient from transparent to opaque white, after the tint
        //     it will be a gradient from transapret to opaque sky color.
        //     this will give the "fade out" effect of the floor disappearing to the bottom of the screen  */
        // cloud.tint = gameOptions.skyColor;
        //
        // // adding the cloud to overlayGroup
        // this.overlayGroup.add(cloud);

        /*  this is how we add a bitmap text to the game, let's have a look at the arguments:
            * the x coordinate
            * the y coordinate
            * the key of the font used
            * the string to write
            * the font size
            in this case we are showing the best score
        */
        var highScoreText = game.add.bitmapText(game.width - 10, game.height - 10, "font", "Best Score: " + this.savedData.score.toString(), 30);

        // bitmap texts can also have their registration point set
        highScoreText.anchor.set(1, 1);

        // scoreText is also added to overlayGroup
        this.overlayGroup.add(highScoreText);

        // same concept applies to the bitmap text which shows the amount of coins collected
        var coinsText = game.add.bitmapText(game.width / 2, game.height - 10, "font", "Coins: " + this.savedData.coins.toString(), 30);
        coinsText.anchor.set(0.5, 1);
        this.overlayGroup.add(coinsText);

        /*  same concept applies to the bitmap text which shows the score.
            this time the bitmapText is bound to a property than to a local variable
            because we are goint to update it inside other methods  */
        this.scoreText = game.add.bitmapText(10, game.height - 10, "font", "Score: 0", 30);
        this.scoreText.anchor.set(0, 1);
        this.overlayGroup.add(this.scoreText);
    },

    // method to create the menu
    createMenu: function(){

        // adding "tap" image, setting its registration point and adding it to "menuGroup" group
        var tap = game.add.sprite(game.width / 2, game.height - 150, "tap");
        tap.anchor.set(0.5);
        tap.width = 150;
        tap.height = 120;
        this.menuGroup.add(tap);

        /*  let's meet the tween.
            a wween allows you to alter one or more properties of a target object over a defined period of time.
            this can be used for things such as alpha fading sprites, scaling them or give them a motion
            tapTween is a new tween applied to "tap" image.
            it brings the alpha to zero as you can see into the first argument of "to" method
            200 is the amount of milliseconds
            Phaser.Easing.Cubic.InOut is the easing
            true (the first one) means the tween starts immediately
            0 is the delay in milliseconds before tween starts (no delay in this case)
            -1 is the amount of times the tween must be played. -1 means infinite times
            true (the second one) sets the yoyo effect, it means the tween will be played forward and backward  */
        var tapTween = game.add.tween(tap).to({
            alpha: 0
        }, 200, Phaser.Easing.Cubic.InOut, true, 0, -1, true);

        // adding a bitmap text with in-game instructions ("tap to jump"), setting its anchor and add it to menuGroup group
        var tapText = game.add.bitmapText(game.width / 2, tap.y - 120, "font", "tap to jump", 45);
        tapText.anchor.set(0.5);
        this.menuGroup.add(tapText);

        // adding a bitmap text with game title, setting its anchor and add it to menuGroup group
        var titleText = game.add.bitmapText(game.width / 2, tap.y - 200, "font2", "POKeCLIMB", 75);
        titleText.anchor.set(0.5);
        this.menuGroup.add(titleText);
    },

    // method to define the tween which scrolls the level as the player climbs the ladders
    defineTweens: function(){

        // we keep a counter to reming us how many tweens we have to go, starting at zero
        this.tweensToGo = 0;

        /*  this is a simple tween, simpler than the one seen in "createMenu" method, where we scroll down
            the entire gameGroup by gameOptions.floorGap pixels actually moving it down by a floor
            in 500 milliseconds  */
        this.scrollTween = game.add.tween(this.gameGroup);
        this.scrollTween.to({
            y: gameOptions.floorGap
        }, 500, Phaser.Easing.Cubic.Out);

        // this is another tween feature: we can add a callback function to be executed when the tween is complete
        this.scrollTween.onComplete.add(function(){

            /*  before we start looking at the code, let me clarify something about this endless runner.
                actually the player is not climbing, but it's the whole level to scroll down and resposition
                in the same original y coordinate.
                this way the player has the feeling as if the hero was climbing the tower while it's the whole
                world to move down and reposition, just like when you walk up in an escalator moving down at
                your same speed.

                that said, we reposition gameGroup to its initial position   */
            this.gameGroup.y = 0;

            // now we loop through all gameGroup children executing the function having "item" argument = the child of the group
            this.gameGroup.forEach(function(item){

                /*  you can see from "defineGroups" method that gameGroup children are all groups.
                    the lenght of a group is the number of its children, so we are basically checking
                    if the group has children, so if its length is greater than zero...  */
                if(item.length > 0){

                    // we loop through all the children of the child. Now "subItem" is the child of the child
                    item.forEach(function(subItem) {

                        /*  we update its y position adding "floorGap" to it.
                            let's make a small recap:
                            * during the tween we moved gameGroup down by floorGap pixels
                            * at the end of the tween we moved gameGroup back to its default y position (zero), that is up by floorGap pixels
                            * finally we move down each gameGroup child by floorGap pixels
                            the final result is we have all gameGroups children in the same position as if gameGroup would have moved,
                            but with gameGroup at its starting position.
                            This fakes the infinite scrolling effect  */
                        subItem.y += gameOptions.floorGap;

                        /*  now we check if the item y coordinate is greater than the game height, that is it left the screen to the bottom
                            and we have to remove it  */
                        if(subItem.y > game.height){

                            /*  different things to do according to item key (the key we gave to the image at preload time)
                                each of the methods you'll see here will remove in some way - we'll see how - the item  */
                            switch(subItem.key){
                                case "floor":

                                    // removing the floor
                                    this.killfloor(subItem);
                                    break;
                                case "ladder":

                                    // removing the ladder
                                    this.killLadder(subItem);
                                    break;

                                case "bulbasaur":
                                    this.killBulbasaur(subItem);
                                    break;

                                case "coin":

                                    // removing the coin
                                    this.killCoin(subItem);
                                    break;
                                case "spike":

                                    // removing the spike
                                    this.killSpike(subItem);
                                    break;
                                case "fire":

                                    // removing the fire
                                    this.killFire(subItem);
                                    break;
                                case "arrow":

                                    // removing the arrow
                                    this.killArrow(subItem);
                                    break;
                                case "monster":

                                    // removing the monster
                                    this.killMonster(subItem);
                                    break;
                                case "spikedmonster":

                                    // removing the spiked monster
                                    this.killSpikedMonster(subItem);
                                    break;
                            }
                        }
                    }, this);
                }
                else{

                    // if the item has length equal to zero, that is has not children, move it down by "floorGap"
                    item.y += gameOptions.floorGap;
                }
            }, this);

            // this method will populate the floor with enemies
            this.populatefloor(true);

            // if we have more tweens to go...
            if(this.tweensToGo > 0){

                // decrease tweens to go...
                this.tweensToGo --;

                // ...and start the tween
                this.scrollTween.start();
            }
        }, this);
    },

    // method to draw the level, that is the entire game with all floors
    drawLevel: function(){

        // creation of a local variable which keep tracks of current floor
        var currentfloor = 0;

        /*  we are keeping track of the vertical coordinate of highest floor placed so far.
            since we just started to place floors, the first floor is placed at floorStart  */
        this.highestfloorY = game.height * gameOptions.floorStart;

        /*  this loop will keep on placing floors above the starting floor.
            each floor will be placed floorGap pixels above the previous
            floor until we reach - 2 * gameOptions.floorGap height, that is we placed
            two floors higher than the very top of the canvas  */

        while(this.highestfloorY > - 2 * gameOptions.floorGap){

                /*  populatefloor method will populate the floor with coins, ladders and enemies.
                    it features a Boolean argument which is true if currentfloor is bigger than zero (it's not the first floor),
                    false otherwise  */
                this.populatefloor(currentfloor > 0);

                // at this time we added a floor, so it's time to update highestfloorY value
                this.highestfloorY -= gameOptions.floorGap;

                // increasing currentfloor counter
                currentfloor ++;
        }

        /*  we have to add floorGap to highestfloorY because a few lines before
            we updated the value of highestfloorY because we were going to add another floor,
            but once the condition of the while loop is not satisfied anymore, we
            find ourselves with an highestfloorY value which does not reflect aymore the
            actual position of the highest floor, and that's why we update it now  */
        this.highestfloorY += gameOptions.floorGap;

        // this method will add the hero to the game
        this.addHero();
    },

    // method to populate a floor, with a Boolean argument telling us if we also have to add stuff
    populatefloor: function(addStuff){

        // first, we call addfloor method which will add the floor itself
        this.addfloor();

        /*  this is where addStuff comes into play.
            at the moment we only added the floor, do we have to add other stuff?
            if addStuff is true, that means the floor we are currently processing
            is not the first floor, then
            proceed adding more stuff to the floor  */
        if(addStuff){

            /*  when you randomly add stuff and enemies to a game, one of the biggest problems
                you will face is your level could be too hard or even impossible to play.
                this is why I am using a safeZone array to define safe zones in which cannot be
                placed enemies, like ladder surroundings.
                this is the best way to create an empty array or reset an existing array to an empty one  */
            this.safeZone = [];
            this.safeZone.length = 0;

            /*  addLadder method will add a ladder. Ladder should always be the first thing
                to be added to each floor in order to keep the level easily playable  */
            this.addLadder();

            /*  this method will add a coin.
                there is an optional argument which can be null (coin will be randomly placed)
                or a Point (coin will be placed at a given coordinate).
                in this case we want the coin to be randomly placed  */
            this.addCoin(null);

            /*  each floor can have 1 or 2 deadly items, I found it to be a good compromise
                between randomness and gameplay but you are feel to populate the floors in
                any other way.
                integerInRange method returns a random integer between the to arguments, both included  */
            var deadlyItems = game.rnd.integerInRange(1, 2)

            // loop executed deadlyItems times
            for(var i = 0; i < deadlyItems; i++){

                /*  randomly selecting the deadly stuff to add, again you are free to populate floors
                    in any other way, use as reference:
                    * 0: spike
                    * 1: fire
                    * 2: arrow
                    * 3: monster which can be killed and transformed into a coin
                    * 4: monster which cannot be killed  */
                var stuffToAdd = game.rnd.integerInRange(0, 4);

                // which deadly item are we going to add?
                switch(stuffToAdd){
                    case 0:

                        // addSpike method  will add a spike
                        this.addSpike();
                        break;
                    case 1:

                        // addFire method will add the fire
                        this.addFire();
                        break;
                    case 2:

                        // addArrow method will add an arrow
                        this.addArrow();
                        break;
                    case 3:

                        // addMonster method will add a killable monster
                        this.addMonster();
                        break;
                    case 4:

                        // addSpikedMonster method will add a monster which can't be killed
                        this.addSpikedMonster();
                        break;
                }
            }
        }
    },

    // method to add a floor
    addfloor: function(){

        // first, we see if we already have a floor sprite in the pool
        if(this.floorPool.length > 0){

            // if we find a floor in the pool, let's remove it from the pool
            var floor = this.floorPool.pop();

            // placing the floor at the vertical highest floor position allowed in the game
            floor.y = this.highestfloorY;

            // make the floor revive, setting its "alive", "exists" and "visible" properties all set to true
            floor.revive();
        }

        // this is the case we did not find any floor in the pool
        else{

            // adding the floor sprite
            var floor = game.add.sprite(0, this.highestfloorY, "floor");

            // adding floor sprite to floor group
            this.floorGroup.add(floor);

            // enabling ARCADE physics to the floor
            game.physics.enable(floor, Phaser.Physics.ARCADE);

            /*  setting floor body to immovable.
                an immovable Body will not receive any impacts from other bodies  */
            floor.body.immovable = true;

            /*  setting the checkCollision properties to control which directions collision is processed for the floor.
                in this case collision on the bottom side is not processed, turning the body into a "cloud".
                you can pass it from bottom to top but it won't let you fall when you walk over it  */
            floor.body.checkCollision.down = false;
        }
    },

    // method to add a ladder
    addLadder: function(){

        // ladderXPosition is the random horizontal placement of the ladder, with a 50 pixels margin from game borders
        var ladderXPosition = game.rnd.integerInRange(50, game.width - 50);

        // first, we see if we already have a ladder sprite in the pool
        if(this.ladderPool.length > 0 && this.bulbasaurPool.length > 0){

            // if we find a floor in the pool, let's remove it from the pool
            var ladder = this.ladderPool.pop();
            var bulbasaur = this.bulbasaurPool.pop();

            // placing the ladder at horizontal ladderXPosition
            ladder.x = ladderXPosition;
            bulbasaur.x = ladderXPosition;

            // placing the ladder at the vertical highest floor position allowed in the game
            ladder.y = this.highestfloorY;
            bulbasaur.y = this.highestfloorY;

            // make the ladder revive, setting its "alive", "exists" and "visible" properties all set to true
            ladder.revive();
            bulbasaur.revive();
        }

        // this is the case we did not find any ladder in the pool
        else{

            // adding the ladder sprite
            var ladder = game.add.sprite(ladderXPosition, this.highestfloorY, "ladder");
            var bulbasaur = game.add.sprite(ladderXPosition, this.highestfloorY, "bulbasaur");
            var bulbasaurIdle = bulbasaur.animations.add("idle");

            bulbasaur.animations.play("idle", 2, true);
            bulbasaur.anchor.set(0.5, 1);

            // adding ladder to ladder group
            this.ladderGroup.add(ladder);
            this.bulbasaurGroup.add(bulbasaur);

            // changing ladder registration point to horizontal:center and vertical:top
            ladder.anchor.set(0.5, 0);

            // enabling ARCADE physics to the floor
            game.physics.enable(ladder, Phaser.Physics.ARCADE);
            game.physics.enable(bulbasaur, Phaser.Physics.ARCADE);

            // setting ladder's body as immovable
            ladder.body.immovable = true;
            bulbasaur.body.immovable = true;
        }

        /*  placing a ladder also means we have to prevent obstacles to be placed too close to it,
            or the player sprite could climb a ladder just to find itself over a spike, with no
            change to avoid it.
            this is where safeZone array comes into play, let's add an object which defines
            where to start and where to end  */
        this.safeZone .push({
            start: ladderXPosition - gameOptions.safeRadius,
            end: ladderXPosition + gameOptions.safeRadius
        });
    },

    // method to add an arrow
    addArrow: function(){

        /*  arrowX can take two values:
            * 0 if the arrow will be placed on the left side
            * 1 is the arrow will be placed on the right side  */
        var arrowX = game.rnd.integerInRange(0, 1);

        // arrowY is the vertical position where to place the arrow
        var arrowY = this.highestfloorY - 20;

        // first, we see if we already have an arrow sprite in the pool
        if(this.arrowPool.length > 0){

            // if we find an arrow in the pool, let's remove it from the pool
            var arrow = this.arrowPool.pop();

            /*  if you recycled an arrow from the pool, probably it has been fired.
                this means it has a velocity.
                the best way to prevent old velocity values to interfere with new placement
                is to call reset method which resets all body values (velocity, acceleration, rotation, etc)
                and places it into its new position  */
            arrow.reset(game.width * arrowX, arrowY);

            // custom property to tell us if the arrow is firing, initially set to false
            arrow.isFiring = false;

            /*  this line will just flip the arrow horizontally if it's on the right side of the game.
                you can flip horizontally a sprite by setting its x scale to -1  */
            arrow.scale.x = 1 - 2 * arrowX;

            // make the arrow revive, setting its "alive", "exists" and "visible" properties all set to true
            arrow.revive();
        }

        // this is the case we did not find any arrow in the pool
        else{

            // adding the ladder sprite
            var arrow = game.add.sprite(game.width * arrowX, arrowY, "arrow");
            var arrowSpin = arrow.animations.add("spin", [0, 3]);

            // custom property to tell us if the arrow is firing, initially set to false
            arrow.isFiring = false;

            // setting arrow registration point to center both horizontally and vertically
            arrow.anchor.set(0.5);

            /*  this line will just flip the arrow horizontally if it's on the right side of the game.
                you can flip horizontally a sprite by setting its x scale to -1  */
            arrow.scale.x = 1 - 2 * arrowX;

            // enabling ARCADE physics to the arrow
            game.physics.enable(arrow, Phaser.Physics.ARCADE);

            // setting arrow's body as immovable
            arrow.body.immovable = true;

            // adding arrow to arrow group
            this.arrowGroup.add(arrow);
        }
    },

    // method to add a monster
    addMonster: function(){

        // monsterX is the random horizontal placement of the monster, with a 50 pixels margin from game borders
        var monsterX = game.rnd.integerInRange(50, game.width - 50);

        // monsterY is the vertical position where to place the monster
        var monsterY = this.highestfloorY - 20;

        // first, we see if we already have a monster sprite in the pool
        if(this.monsterPool.length > 0){

            // if we find a monster in the pool, let's remove it from the pool
            var monster = this.monsterPool.pop();

            // setting monster x coordinate
            monster.x = monsterX;

            // setting monster y coordinate
            monster.y = monsterY;

            // make the monster revive, setting its "alive", "exists" and "visible" properties all set to true
            monster.revive();
        }

        // this is the case we did not find any monster in the pool
        else{

            // adding the monster sprite
            var monster = game.add.sprite(monsterX, monsterY, "monster");
            var monsterWalk = monster.animations.add("walk", [0, 1]);
            var monsterDead = monster.animations.add("dead", [3]);

            monster.animations.play("walk", 2, true);
            // setting monster registration point to center both horizontally and vertically
            monster.anchor.set(0.5);

            // enabling ARCADE physics to the monster
            game.physics.enable(monster, Phaser.Physics.ARCADE);

            // setting monster's body as immovable
            monster.body.immovable = true;

            /*  an ARCADE physics body can be set to collide against the world bounds automatically
                and rebound back into the world if collideWorldBounds property is set to true  */
            monster.body.collideWorldBounds = true;

            // setting the velocity of the monster, in pixels per second.
            monster.body.velocity.x = -gameOptions.monsterSpeed;

            /*  we need to detect when the monster collides with the world bounds.
                this is why we are creating a Phaser signal which is basically a trigger which
                can fire callback functions like the one you are about to see  */
            monster.body.onWorldBounds = new Phaser.Signal();

            /*  here is the callback function, called when a collision against world bounds happens,
                passing five arguments: sprite, up, down, left, right
                where "sprite" is a reference to the sprite which collided, and the other arguments
                are Boolean variables indicating on which side of the world the sprite collided  */
            monster.body.onWorldBounds.add(function(sprite, up, down, left, right){

                // collision against the left bound of the game
                if(left){

                    // adjusting the velocity so that the sprite moves to the right
                    sprite.body.velocity.x = gameOptions.monsterSpeed;

                    // do not horizontally flip the sprite (the original image is with the sprite looking to the right)
                    sprite.scale.x = -1;
                }

                // collision against the right bound of the game
                if(right){

                    // adjusting the velocity so that the sprite moves to the left
                    sprite.body.velocity.x = -gameOptions.monsterSpeed;

                    // horizontally flip the sprite (the original image is with the sprite looking to the right)
                    sprite.scale.x = 1;
                }
            });

            // adding monster to the group of deadly objects
            this.deadlyGroup.add(monster);
        }
    },

    // method to add a spiked monster
    addSpikedMonster: function(){

        // monsterX is the random horizontal placement of the spiked monster, with a 50 pixels margin from game borders
        var monsterX = game.rnd.integerInRange(50, game.width - 50);

        // monsterY is the vertical position where to place the spiked monster
        var monsterY = this.highestfloorY - 25;

        // first, we see if we already have a spiked monster sprite in the pool
        if(this.spikedMonsterPool.length > 0){

            // if we find a spiked monster in the pool, let's remove it from the pool
            var monster = this.spikedMonsterPool.pop();

            // setting spiked monster x coordinate
            monster.x = monsterX;

            // setting spiked monster y coordinate
            monster.y = monsterY;

            // make the spiked monster revive, setting its "alive", "exists" and "visible" properties all set to true
            monster.revive();
        }

        // this is the case we did not find any spiked monster in the pool
        else{

            // adding the spiked monster sprite
            var monster = game.add.sprite(monsterX, monsterY, "spikedmonster");
            var monsterWalk = monster.animations.add("walk", [0, 1]);

            monster.animations.play("walk", 4, true);

            // setting spiked monster registration point to center both horizontally and vertically
            monster.anchor.set(0.5);

            // enabling ARCADE physics to the spiked monster
            game.physics.enable(monster, Phaser.Physics.ARCADE);

            // setting spiked monster's body as immovable
            monster.body.immovable = true;

            /*  an ARCADE physics body can be set to collide against the world bounds automatically
                and rebound back into the world if collideWorldBounds property is set to true  */
            monster.body.collideWorldBounds = true;

            // setting the velocity of the spiked monster, in pixels per second.
            monster.body.velocity.x = -gameOptions.monsterSpeed;

            /*  we need to detect when the spiked monster collides with the world bounds.
                this is why we are creating a Phaser signal which is basically a trigger which
                can fire callback functions like the one you are about to see  */
            monster.body.onWorldBounds = new Phaser.Signal();

            /*  here is the callback function, called when a collision against world bounds happens,
                passing five arguments: sprite, up, down, left, right
                where "sprite" is a reference to the sprite which collided, and the other arguments
                are Booleans indicating on which side of the world the sprite collided  */
            monster.body.onWorldBounds.add(function(sprite, up, down, left, right){

                // collision against the left bound of the game
                if(left){

                    // adjusting the velocity so that the sprite moves to the right
                    sprite.body.velocity.x = gameOptions.monsterSpeed;

                    // do not horizontally flip the sprite (the original image is with the sprite looking to the right)
                    sprite.scale.x = -1;
                }

                // collision against the right bound of the game
                if(right){

                    // adjusting the velocity so that the sprite moves to the left
                    sprite.body.velocity.x = -gameOptions.monsterSpeed;

                    // horizontally flip the sprite (the original image is with the sprite looking to the right)
                    sprite.scale.x = 1;
                }
            });

            // adding spiked monster to the group of deadly objects
            this.deadlyGroup.add(monster);
        }
    },

    // method to add a coin
    addCoin: function(creationPoint){

        /*  coins won't appear on every floor.
            to have a coin appear on a floor:
            - a random integer between 0 and coinRatio (both included) must be greater than zero
            OR
            - creationPoint must be different than null  */
        if(game.rnd.integerInRange(0, gameOptions.coinRatio) != 0 || creationPoint != null){

            // coinX is the random horizontal placement of the coin, with a 50 pixels margin from game borders
            var coinX = game.rnd.integerInRange(50, game.width - 50);

            // coinY is the vertical position where to place the coin, it should appear in the middle height of a floor
            var coinY = this.highestfloorY - gameOptions.floorGap / 2;

            // if creation point is not null, that is we have a given coordinate where to place the coin...
            if(creationPoint != null){

                // overwrite coinX
                coinX = creationPoint.x;

                // overwrite coinY
                coinY = creationPoint.y;
            }

            // first, we see if we already have a coin sprite in the pool
            if(this.coinPool.length > 0){

                // if we find a coin in the pool, let's remove it from the pool
                var coin = this.coinPool.pop();

                // setting coin x coordinate
                coin.x = coinX;

                // setting coin y coordinate
                coin.y = coinY;

                // make the coin revive, setting its "alive", "exists" and "visible" properties all set to true
                coin.revive();
            }

            // this is the case we did not find any coin in the pool
            else{

                // adding the coin sprite
                var coin = game.add.sprite(coinX, coinY, "coin");

                /*  here comes into play Phaser animation manager.
                    "animations.add" Adds a new animation under the given key ("rotate" in this case).
                    now an animation has been create and it's ready to be played  */
                var coinAnimation = coin.animations.add("rotate");

                /*  this is how we play an animation.
                    the three arguments represent:
                    * the name of the animation to be played
                    * the framerate to play the animation at, measured in frames per second
                    * a Boolean value which tells us if the animation should be looped  */
                coin.animations.play("rotate", 15, true);

                // setting coin registration point to center both horizontally and vertically
                coin.anchor.set(0.5);

                // enabling ARCADE physics to the coin
                game.physics.enable(coin, Phaser.Physics.ARCADE);

                // setting coin's body as immovable
                coin.body.immovable = true;

                // adding the coin to the group of coins
                this.coinGroup.add(coin);
            }
        }
    },

    // method to add a spike
    addSpike: function(){

        // normally we are placing one spike
        var spikes = 1;

        // but if a random integer number between zero and doubleSpikeRatio (both included) is equal to zero...
        if(game.rnd.integerInRange(0, gameOptions.doubleSpikeRatio) == 0){

            // we will be placing two spikes
            spikes = 2;
        }

        // exectuing this loop "spikes" times
        for(var i = 1; i <= spikes; i++){

            /*  spikeXPosition can be a position which is considered safe (remember, we are trying to prevent
                the creation of impossible floors) or false if we can't find a safe position in a reasonable
                amount of retries
                findSafePosition method does this job  */
            var spikeXPosition = this.findSafePosition();

            // setting spike y coordinate
            var spikeYPosition = this.highestfloorY - 20;

            // if we have a safe position where to place the spike...
            if(spikeXPosition){

                // first, we see if we already have a spike sprite in the pool
                if(this.spikePool.length > 0){

                    // if we find a spike in the pool, let's remove it from the pool
                    var spike = this.spikePool.pop();

                    // setting spike x coordinate
                    spike.x = spikeXPosition;

                    // setting spike y coordinate
                    spike.y = spikeYPosition;

                    // make the spike revive, setting its "alive", "exists" and "visible" properties all set to true
                    spike.revive();
                }

                // this is the case we did not find any spike in the pool
                else{

                    // adding the spike sprite
                    var spike = game.add.sprite(spikeXPosition, spikeYPosition, "spike");
                    var spikeRotate = spike.animations.add("rotate");

                    /*  this is how we play an animation.
                        the three arguments represent:
                        * the name of the animation to be played
                        * the framerate to play the animation at, measured in frames per second
                        * a Boolean value which tells us if the animation should be looped  */
                    spike.animations.play("rotate", 7, true);

                    // changing spike registration point to horizontal:center and vertical:top
                    spike.anchor.set(0.5, 0);

                    // enabling ARCADE physics to the spike
                    game.physics.enable(spike, Phaser.Physics.ARCADE);

                    // setting spike's body as immovable
                    spike.body.immovable = true;

                    // adding the spike to the group of deadly objects
                    this.deadlyGroup.add(spike);
                }
            }
        }
    },

    // method to add fire
    addFire: function(){
        // normally we are placing one fireplace
        var firePlaces = 1;

        // but if a random integer number between zero and doubleSpikeRatio (both included) is equal to zero...
        if(game.rnd.integerInRange(0, gameOptions.doubleSpikeRatio) == 0){

            // we will be placing two fires
            firePlaces = 2;
        }

        // exectuing this loop "firePlaces" times
        for(var i = 1; i <= firePlaces; i++){

            /*  fireXPosition can be a position which is considered safe (remember, we are trying to prevent
                the creation of impossible floors) or false if we can't find a safe position in a reasonable
                amount of retries
                findSafePosition method does this job  */
            var fireXPosition = this.findSafePosition();

            // setting fire y coordinate
            var fireYPosition = this.highestfloorY - 58;

            // if we have a safe position where to place the fire...
            if(fireXPosition){

                // first, we see if we already have a fire sprite in the pool
                if(this.firePool.length > 0){

                    // if we find a fire in the pool, let's remove it from the pool
                    var fire = this.firePool.pop();

                    // setting fire x coordinate
                    fire.x = fireXPosition;

                    // setting fire  y coordinate
                    fire.y = fireYPosition;

                    // make the fire revive, setting its "alive", "exists" and "visible" properties all set to true
                    fire.revive();
                }

                // this is the case we did not find any fire in the pool
                else{

                    // adding the fire sprite
                    var fire = game.add.sprite(fireXPosition, fireYPosition, "fire");

                    /*  here comes into play Phaser animation manager.
                        "animations.add" Adds a new animation under the given key ("burn" in this case).
                        now an animation has been create and it's ready to be played  */
                    var fireAnimation = fire.animations.add("burn");

                    /*  this is how we play an animation.
                        the three arguments represent:
                        * the name of the animation to be played
                        * the framerate to play the animation at, measured in frames per second
                        * a Boolean value which tells us if the animation should be looped  */
                    fire.animations.play("burn", 5, true);

                    // changing fire registration point to horizontal:center and vertical:top
                    fire.anchor.set(0.5, 0);

                    // enabling ARCADE physics to the fire
                    game.physics.enable(fire, Phaser.Physics.ARCADE);

                    // setting fire's body as immovable
                    fire.body.immovable = true;

                    // adding the fire to the group of deadly objects
                    this.deadlyGroup.add(fire);
                }
            }
        }
    },

    // method to find a safe position where to place a spike or a fire
    findSafePosition: function(){

        /*  we count how many attempts we are making to find a safe position,
            to prevent infinite loops or excessive time to generate a floor  */
        var attempts = 0;

        // ok let's start finding the safe position
        do{

            // updating the amount of attempts
            attempts ++;

            // tossing a random position, with a 150 pixels margin from game borders
            var posX = game.rnd.integerInRange(150, game.width - 150);

        /*  we exit the loop when:
            * posX is in a safe position, determined by isSafe method
            * it's the 10th attempt. we can say that if we did not find a safe position
              within 10 attempts then never mind, it probably does not exist  */
        } while(!this.isSafe(posX) && attempts < 10);

        // did we find a safe position?
        if(this.isSafe(posX)){

            // adding the new range to safeZone array
            this.safeZone.push({
                start: posX - gameOptions.safeRadius,
                end: posX + gameOptions.safeRadius
            });

            // return the position itself
            return posX;
        }

        // if we did not find a safe position, return false
        return false;
    },

    // method to check if a position is safe, the argument is the x coordinate
    isSafe: function(n){

        // looping through all safeZone array items
        for(var i = 0; i < this.safeZone.length; i++){

            // if the x coordinate is inside a safeZone item interval...
            if(n > this.safeZone[i].start && n < this.safeZone[i].end){

                // ... then it's not a safe zone, return false
                return false;
            }
        }

        /*  if we looped through all safeZone array it means the x coordinate
            is not inside any interval of safeZone array, return true  */
        return true;
    },

    // method to add the hero
    addHero: function(){

        // adding the hero sprite
        this.hero = game.add.sprite(game.width / 2, game.height * gameOptions.floorStart - 48, "hero");

        /*  this is the method to add an animation to a sprite like you have already
            seen when you created the animation of the coin and the fire.
            now, the same sprite (the hero) can have more animations, that's why
            there's a second argument which is the array of frames to be used in the animation.
            in this case "walk" animation only takes frames 0 and 1 of the sprite sheet  */
        this.hero.animations.add("walk", [0, 3]);

        // following the same concept, "climb" animation uses frames 2 and 3
        this.hero.animations.add("climb", [4, 5]);

        // start playing "walk" animation, at 15 frames per second, in loop mode
        this.hero.animations.play("walk", 15, true);

        // adding the hero to game group
        this.gameGroup.add(this.hero);

        // setting hero registration point to horizontal: center and vertical: top
        this.hero.anchor.set(0.5, 0);

        // enabling ARCADE physics for the hero
        game.physics.enable(this.hero, Phaser.Physics.ARCADE);

        // the hero will collide on world bounds
        this.hero.body.collideWorldBounds = true;

        /*  this is how we apply a local gravity to a body.
            the hero is the only sprite in game with a gravity  */
        this.hero.body.gravity.y = gameOptions.playerGravity;

        // setting the velocity of the hero, in pixels per second
        this.hero.body.velocity.x = -gameOptions.playerSpeed;

        /*  we need to detect when the hero collides with the world bounds.
            this is why we are creating a Phaser signal which is basically a trigger which
            can fire callback functions like the one you are about to see  */
        this.hero.body.onWorldBounds = new Phaser.Signal();

        /*  here is the callback function, called when a collision against world bounds happens,
            passing five arguments: sprite, up, down, left, right
            where "sprite" is a reference to the sprite which collided, and the other arguments
            are Boolean variables indicating on which side of the world the sprite collided  */
        this.hero.body.onWorldBounds.add(function(sprite, up, down, left, right){

            // collision against the left bound of the game
            if(left){

                // adjusting the velocity so that the sprite moves to the right
                this.hero.body.velocity.x = gameOptions.playerSpeed;

                // horizontally flip the sprite (original is facing left)
                this.hero.scale.x = -1;
            }

            // collision against the right bound of the game
            if(right){

                // adjusting the velocity so that the sprite moves to the left
                this.hero.body.velocity.x = -gameOptions.playerSpeed;

                 // Don't flip the sprite
                this.hero.scale.x = 1;
            }

            // collision against the bottom bound of the game
            if(down){

                /* the setItem() method of the Storage interface, when passed a key name and value,
                    will add that key to the storage, or update that key's value if it already exists.
                    basically we are updating the best score and the total amount of coins gathered  */
                localStorage.setItem(gameOptions.localStorageName,JSON.stringify({

                        // score takes the highest value between currently saved score and the amount of floors climbed
                        score: Math.max(this.reachedfloor, this.savedData.score),

                        // collected coins are added to previoulsy saved coins
                        coins: this.collectedCoins + this.savedData.coins
                }));

                // and finally the game restarts. yes, when you touch the bottom bound of the game it's game over
                game.state.start("PlayGame");
            }
        }, this)
    },

    // this method handles player input
    handleTap: function(){

        // if menu is still in the game...
        if(this.menuGroup != null){

            // then remove it
            this.menuGroup.destroy();
        }

        /*  the hero can jump when:
            * the hero is not already jumping
            AND
            * the hero is not climbing a ladder
            AND
            * it's not game over  */
        if(this.canJump && !this.isClimbing && !this.gameOver){

            /*  applying a vertical velocity to the hero.
                this would make the hero move up forever, but thanks to
                gravity, it will act just like a jump  */
            this.hero.body.velocity.y = -gameOptions.playerJump;

            // playing jump sound
            this.jumpSound.play();

            // the hero now is jumping so at the moment it cannot jump again
            this.canJump = false;
        }
    },

    // update method is atuomatically executed at each frame
    update: function(){

        // if it's not game over...
        if(!this.gameOver){

            // method to fire an arrow
            this.fireArrow();

            // method to check for hero Vs floor collision
            this.checkfloorCollision();

            // method to check for hero Vs ladder collision
            this.checkLadderCollision();

            // method to check for hero Vs coin collision
            this.checkCoinCollision();

            // method to chech for hero Vs deadly enemies collision
            this.checkDeadlyCollision();

            // method to check for hero Vs arrow collision
            this.checkArrowCollision();
        }
    },

    // this method will fire an arrow
    fireArrow(){

        // now we loop through all arrowGroup children executing the function having "item" argument = the arrow child of the group
        this.arrowGroup.forEach(function(item){

            // we check if the arrow has about the same vertical position as the hero
            if(Math.abs(item.y - this.hero.y) < 10){

                // is the arrow already firing?
                if(!item.isFiring){

                    /*  if the arrow is not firing, we add a timer.
                        a timer is a way to create and manage timer events that wait for a specific duration and then run a callback.
                        this is how we add a simple timer event:
                        the first argument is the delay to wait - in milliseconds - before the event is fired
                        the second argument is the callback function to be executed  */
                    game.time.events.add(game.rnd.integerInRange(500, 1500), function(){

                        // giving arrow body a x velocity keeping an eye on arrow scale which changes according to arrow direction
                        item.animations.animations.play("spin", 4, true);
                        item.body.velocity.x = gameOptions.arrowSpeed * item.scale.x;
                    }, this);

                    // ok, now the arrow is firing
                    item.isFiring = true;
                }
                return;
            }
        }, this)
    },

    // this method checks for collision between hero and floors
    checkfloorCollision: function(){

        /*  collide method checks for collision between two game objects, defined in the first and second parameter.
            as you can see, you can perform collision checking between a sprite and a group.
            the 3rd argument is a an optional callback function that is called when the objects collide.
            there's also another callback function - in this case set to null - which lets you perform
            additional checks against the two objects if they overlap, executing the function in the 3rd argument
            only if the callback returns true.
            we wont' use this feature in the game, so basically this function means:
            "execute the callback function when the hero collides with floorGroup"  */
        game.physics.arcade.collide(this.hero, this.floorGroup, function(){

            // if the hero collided with a floor, it can jump again
            this.canJump = true;
        }, null, this);
    },

    // this method checks for collision between hero and ladders
    checkLadderCollision: function(){

        // if the hero is not climbing...
        if(!this.isClimbing){

            /*  with the same concepts applied on collide method,
                overlap method checks for overlap between two game objects.
                arguments work in the same way as collide method, just have a look at
                callback function arguments: they are the two objects which caused the
                function to be fired  */
            game.physics.arcade.overlap(this.hero, this.ladderGroup, function(player, ladder){

                /*  checking if the hero is within a 10 pixels radius from the ladder,
                    we will climb it if it's true  */
                if(Math.abs(player.x - ladder.x) < 10){

                    // saving the ladder we are going to climb into ladderToClimb property
                    this.ladderToClimb = ladder;

                    // stop moving the hero horizontally
                    this.hero.body.velocity.x = 0;

                    // moving the hero vertically, up at climbSpeed pixels/second
                    this.hero.body.velocity.y = -gameOptions.climbSpeed;

                    // stop applying gravity to the hero, to avoid climb speed to decrease
                    this.hero.body.gravity.y = 0;

                    // the hero is climbing
                    this.isClimbing = true;

                    // playing "climb" animation, at 15 frames per second in loop mode
                    this.hero.animations.play("climb", 15, true);


                    /*  there's something to say about these lines, as they are very important to make
                        the game run smoothly.
                        each time the player climbs a ladder, the whole world scrolls down to fake the
                        "endless running" feeling: you aren't climbing, it's the whole world which scrolls down.
                        we scroll the world with a tween. a tween takes time. what if you clikb a ladder,
                        the world scrolls with a tween BUT before the tween ends the hero climbs another ladder?
                        we have to keep track of how many tweens we have to go.
                        the first thing to check is: is there a scrollTween instance already running?  */
                    if(this.scrollTween.isRunning){

                        // in this case don't do anything, just update tweensToGo
                        this.tweensToGo ++;
                    }
                    else{

                        // if we don't have scrollTween already running, then start it
                        this.scrollTween.start();
                    }
                }
            }, null, this);
        }

        // this is the case the hero is already climbing
        else{

            // we are checking hero y position to see if the hero completely climbed the stair
            if(this.hero.y < this.ladderToClimb.y - 40){

                // restoring player gravity
                this.hero.body.gravity.y = gameOptions.playerGravity;

                // restoring player horizontal speed
                this.hero.body.velocity.x = -gameOptions.playerSpeed * this.hero.scale.x;

                // setting player vertical speed to zero - no more climbing
                this.hero.body.velocity.y = 0;

                // the hero is not climbing now
                this.isClimbing = false;

                // let's start play "walk" animation again
                this.hero.animations.play("walk", 15, true);

                // updating reachedfloor property as we climbed one more floor
                this.reachedfloor ++;

                // updating text property of a bitmap text will update the text it shows
                this.scoreText.text = this.reachedfloor.toString();
            }
        }
    },

    // this method checks for collision between hero and coins
    checkCoinCollision: function(){

        /*  with the same concepts applied on collide method,
            overlap method checks for overlap between two game objects.
            arguments work in the same way as collide method, just have a look at
            callback function arguments: they are the two objects which caused the
            function to be fired  */
        game.physics.arcade.overlap(this.hero, this.coinGroup, function(player, coin){

            // placing particle emitter in the same x coordinate of the coin
            this.emitter.x = coin.x;

            // placing particle emitter in the same y coordinate of the coin
            this.emitter.y = coin.y;

            /*  this is how we tell a particle emitter to start, let's have a look
                at the arguments:
                * Boolean variable to tell the emitter whether the particles
                  should all burst out at once (true) or at the frequency given (false).
                  setting it to true will create an explosion
                * how long each particle lives once emitted, in milliseconds
                * how often to emit a particle, not used in case of explosion
                * how many particles to launch  */
            this.emitter.start(true, 1000, null, 20);

            // increasing the amount of collected coins
            this.collectedCoins ++;

            // calling killCoin method which will remove the coin
            this.killCoin(coin);

            // playing coin sound
            this.coinSound.play();
        }, null, this);
    },

    // this method checks for collision between hero and arrows
    checkArrowCollision: function(){

        /*  with the same concepts applied on collide method,
            overlap method checks for overlap between two game objects.
            arguments work in the same way as collide method, just have a look at
            callback function arguments: they are the two objects which caused the
            function to be fired  */
        game.physics.arcade.overlap(this.hero, this.arrowGroup, function(hero, arrow){

            /*  we dont' want an arrow to be always deadly, but only once it has been fired.
                an arrow is fired when its x velocity is greater than zero, so this is the
                check we are going to perform before killing the hero  */
            if(arrow.body.velocity.x != 0){

                /*  the hero has been hit by an arrow, it's game over, managed by
                    prepareToGameOver method  */
                this.prepareToGameOver();
            }
        }, null, this);
    },

    // this method checks for collision between hero and deadly objects
    checkDeadlyCollision: function(){

        /*  collide method checks for collision between two game objects, defined in the first and second parameter.
            as you can see, you can perform collision checking between a sprite and a group.
            the 3rd argument is a an optional callback function that is called when the objects collide.
            there's also another callback function - in this case set to null - which lets you perform
            additional checks against the two objects if they overlap, executing the function in the 3rd argument
            only if the callback returns true.
            we wont' use this feature in the game, so basically this function means:
            "execute the callback function when the hero collides with any object in deadlyGroup".
            the two arguments represent the objects which fired the callback  */
        game.physics.arcade.collide(this.hero, this.deadlyGroup, function(hero, deadly){

            /*  a collision against a deadly object immediately leads to game over unless it's
                against a killable monster. we can determine which kind of object collided with
                the hero by looking at its key property  */
            if(deadly.key != "monster"){

                /*  the hero has been hit by something deadly, it's game over, managed by
                    prepareToGameOver method  */
                this.prepareToGameOver();
            }

            /*  this is the case the hero collided with a killable monster.
                let's see if the monster can be killed  */
            else{

                /*  ARCADE body objects are populated with Boolean values when the body collides with another.
                    these Bookean values are up, down, left and right and are placed inside touching property.
                    true means the collision happened on that side.
                    in this case we want the deadly body to be touched up and the hero to be touched down,
                    this means the hero jumped on enemy's head  */
                if(deadly.body.touching.up && hero.body.touching.down){

                    // making the player jump again, making it bounce over enemy's head
                    this.hero.body.velocity.y = -gameOptions.playerJump;

                    // playing jump sound
                    this.jumpSound.play();
                    // we are adding a coin at monster's position to reward the hero which bravely killed a monster
                    this.addCoin(deadly.position);

                    // removing the monster
                    this.killMonster(deadly);
                }
                else{

                    /*  the hero did not jump on monster's head, it's game over, managed by
                        prepareToGameOver method  */
                    this.prepareToGameOver();
                }
            }
        }, null, this);
    },

    // this method is called when the game is over
    prepareToGameOver: function(){

        // yes, it's game over
        this.gameOver = true;

        // playing hurt sound. losing a game hurts.
        this.hurtSound.play();

        // applying a random horizontal velocity to the player
        this.hero.body.velocity.x =  game.rnd.integerInRange(-20, 20);

        /*  making the player jump. this way the player will jump in a random direction
            giving emphasis to the death  */
        this.hero.body.velocity.y = -gameOptions.playerJump;

        /*  setting player gravity to its default value, just in case death happened
            on a ladder, where the player has no gravity  */
        this.hero.body.gravity.y = gameOptions.playerGravity;
    },

    // method to remove a floor
    killfloor: function(floor){

        /*  kill methos kills a a game objects, setting its "alive", "exists" and "visible" properties to false.
            killing a game object is a way to quickly recycle it in an object pool, like we are going to do  */
        floor.kill();

        // inserting floor sprite into floor pool by adding it into floorPool array
        this.floorPool.push(floor);
    },

    // method to remove a ladder
    killLadder: function(ladder){

        // killing the ladder
        ladder.kill();

        // inserting ladder sprite into ladder pool by adding it into ladderPool array
        this.ladderPool.push(ladder);
    },

    // method to remove a coin
    killCoin: function(coin){

        // killing the coin
        coin.kill();

        // inserting coin sprite into coin pool by adding it into coinPool array
        this.coinPool.push(coin);
    },

    // method to remove a spike
    killSpike: function(spike){

        // killing the spike
        spike.kill();

        // inserting spike sprite into spike pool by adding it into spikePool array
        this.spikePool.push(spike);
    },

    // method to remove a fire
    killFire: function(fire){

        // killing the fire
        fire.kill();

        // inserting fire sprite into fire pool by adding it into firePool array
        this.firePool.push(fire);
    },

    // method to remove an arrow
    killArrow: function(arrow){

        // killing the arrow
        arrow.kill();

        // inserting arrow sprite into arrow pool by adding it into arrowPool array
        this.arrowPool.push(arrow);
    },

    // method to remove a monster
    killMonster: function(monster){

        // killing the monster
        monster.kill();

        // inserting monster sprite into monster pool by adding it into monsterPool array
        this.monsterPool.push(monster);
    },

    // method to remove a spiked monster
    killSpikedMonster: function(spikedMonster){

        // killing the spiked monster
        spikedMonster.kill();

        // inserting spiked monster sprite into spiked monster pool by adding it into spikedMonsterPool array
        this.spikedMonsterPool.push(spikedMonster);
    }
}
