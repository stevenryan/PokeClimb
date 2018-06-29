var game;

// Stored game values so the gameplay can be easily changed
var gameOptions = {

    // Width of the game in pixels. Height will scale
    gameWidth: 800,

    // Where the first floor is placed, and the spacing between them in pixels
    floorStart: 1 / 8 * 5,
    floorGap: 250,

    // local player gravity managed by ARCADE physics. Does not actually use any unit of measurement
    playerGravity: 10000,

    // player speeds, in pixels per second
    playerSpeed: 450,
    climbSpeed: 450,
    // jump force applied to the player
    playerJump: 1800,

    // speed of arrows, in pixels per second
    arrowSpeed: 800,

    // Value used in the addCoin method
    // Makes the chance of a coin spawning on a floor 2/3
    coinRatio: 2,

    // enemy speed in pixels per second
    monsterSpeed: 250,

    // Value used in addSpike method
    // If a spike spawns, it can spawn 1 or 2 instances on one platform
    doubleSpikeRatio: 1,

    // sky color accepts the hexadecimal RGB value
    skyColor: 0x89d7fb,

    // Prevents spikes from spawning too close to each other or to the vines
    safeRadius: 190,

    // Local storage name for high scores and coins, resets with string change
    localStorageName: "ladderzGame",
    // Version Number if wanted for display
    versionNumber: "1.0",

    // relative paths for assets
    spritesPath: "assets/sprites/",
    fontsPath: "assets/fonts/",
    soundPath: "assets/sounds/"
}

// window.onload loads immediately after page load
window.onload = function() {

    // width and height in pixels of the browser window viewport
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    // if windowWidth is greater than windowHeight we are playing in landscape mode, that's bad
    if(windowWidth > windowHeight){

        // Set height to ~2x width, which is standard for most devices portrait modes
        windowHeight = windowWidth * 1.8;
    }

    // Calculate height to fill the height of the window, but never go more than 800px width
    var gameHeight = windowHeight * gameOptions.gameWidth / windowWidth;

    // After width and height is calculated, it creates a new Phaser Game instance
    game = new Phaser.Game(gameOptions.gameWidth, gameHeight);

    // States are blocks within the game (ex: splash screen, menu screen, the game itself, game over, etc)
    game.state.add("BootGame", bootGame);
    game.state.add("PreloadGame", preloadGame);
    game.state.add("PlayGame", playGame);

    // Execute a state by calling its given key name
    game.state.start("BootGame");
}

// Sets the background color and scale mode
var bootGame = function(game){}
bootGame.prototype = {

    // Create execute only once
    create: function(){

        // assigning a background color to the game
        game.stage.backgroundColor = gameOptions.skyColor;

        // Execute next lines if the game is running on a desktop
        if(!Phaser.Device.desktop){
            // forceOrientation method enables generation of incorrect orientation signals
            game.scale.forceOrientation(false, true);
            // Executed when the game enters in an incorrect orientation
            game.scale.enterIncorrectOrientation.add(function(){

                // Pause the game and its subsystems, hide the canvase, show error message
                game.paused = true;
                document.querySelector("canvas").style.display = "none";
                document.getElementById("wrongorientation").style.display = "block";
            })

            // Executed when the game enters in an correct orientation
            game.scale.leaveIncorrectOrientation.add(function(){

                // Resume the game
                game.paused = false;
                document.querySelector("canvas").style.display = "block";
                document.getElementById("wrongorientation").style.display = "none";
            })
        }

        // Set scale mode to cover as large as an area as it can
        // While keeping the ratio and showing all content
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        // centering the canvas horizontally and vertically
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        // prevent the game to pause if it loses focus.
        game.stage.disableVisibilityChange = true;

        // Start "PreloadGame" state
        game.state.start("PreloadGame");
    }
}

// Preload all game assets
var preloadGame = function(game){}
preloadGame.prototype = {

    // Executed at preload time, before "create" method
    preload: function(){

        // Loading Assets
        // .type(image, audio, spritesheet, etc)("Key Name", File Path);
        game.load.image("floor", gameOptions.spritesPath + "platform.png");
        game.load.image("ladder", gameOptions.spritesPath + "vine.png");
        game.load.image("coinparticle", gameOptions.spritesPath + "coinparticle.png");
        game.load.image("cloud", gameOptions.spritesPath + "cloud.png");
        // game.load.image("arrow", gameOptions.spritesPath + "arrow.png");
        game.load.image("tap", gameOptions.spritesPath + "pikachu.gif");
        game.load.image('mountains-back', gameOptions.spritesPath + 'mountains-back.png');
        game.load.image('mountains-mid1', gameOptions.spritesPath + 'mountains-mid1.png');
        game.load.image('mountains-mid2', gameOptions.spritesPath + 'mountains-mid2.png');

        // Loads sound effects
        game.load.audio("coinsound", gameOptions.soundPath + "coin.mp3");
        game.load.audio("jumpsound", gameOptions.soundPath + "jump.mp3");
        game.load.audio("hurtsound", gameOptions.soundPath + "hurt.mp3");

        // Spritesheets take the width & height of a frame after the file path
        game.load.spritesheet("hero", gameOptions.spritesPath + "player.png", 26, 48);
        game.load.spritesheet("coin", gameOptions.spritesPath + "coin.png", 48, 48);
        game.load.spritesheet("fire", gameOptions.spritesPath + "rapidash.png", 32, 58);
        game.load.spritesheet("bulbasaur", gameOptions.spritesPath + "bulbasaur-idle.png", 40, 40);
        game.load.spritesheet("spike", gameOptions.spritesPath + "grimer.png", 39, 20);
        game.load.spritesheet("monster", gameOptions.spritesPath + "dugtrio-monster.png", 40, 40);
        game.load.spritesheet("spikedmonster", gameOptions.spritesPath + "rhydon-monster.png", 40, 50);
        game.load.spritesheet("arrow", gameOptions.spritesPath + "shell-arrow.png", 60, 25);
        game.load.spritesheet("wartortle", gameOptions.spritesPath + "wartortle.png", 38, 40);

        // You can create your bitmap fonts with the free online tool Littera - http://kvazars.com/littera/  */
        game.load.bitmapFont("font", gameOptions.fontsPath + "font.png", gameOptions.fontsPath + "font.fnt");
        game.load.bitmapFont("font2", gameOptions.fontsPath + "font2.png", gameOptions.fontsPath + "font2.fnt");
    },

    // create method is automatically executed once the state has been created.
    create: function(){

        // Start "PlayGame" state
        game.state.start("PlayGame");
    }
}

var playGame = function(game){}
playGame.prototype = {

    // Set up the game and wait for player interaction
    create: function(){

        // Creates a storage object or updates an existing one for the high score and coins collected
        this.savedData = localStorage.getItem(gameOptions.localStorageName) == null ? {score : 0, coins: 0} : JSON.parse(localStorage.getItem(gameOptions.localStorageName));

        // Sets the default properties (ex lives = 3, score = 0, timer, etc)
        this.setDefaultProperties();
        // Add audio to the game
        this.addAudio();

        // ARCADE Physics will handle collisions, overlaps, velocities and motions
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Defining World Bounds takes 4 arguments
        // x & y coordinate of the top left corner of the world
        // width & height of the world
        game.world.setBounds(0, - 3 * gameOptions.floorGap, game.width, game.height + 3 * gameOptions.floorGap);

        // Parallax Background
        this.mountainsBack = this.game.add.tileSprite(0,
            this.game.height - this.game.cache.getImage('mountains-back').height,
            this.game.width,
            this.game.cache.getImage('mountains-back').height,
            'mountains-back'
        );

        this.mountainsMid1 = this.game.add.tileSprite(0,
            this.game.height - this.game.cache.getImage('mountains-mid1').height,
            this.game.width,
            this.game.cache.getImage('mountains-mid1').height,
            'mountains-mid1'
        );

        this.mountainsMid2 = this.game.add.tileSprite(0,
            this.game.height - this.game.cache.getImage('mountains-mid2').height,
            this.game.width,
            this.game.cache.getImage('mountains-mid2').height,
            'mountains-mid2'
        );
        // Creating groups to display objects and check for collisions
        this.defineGroups();
        // Particle emitter for when coins are collected
        this.createParticles();
        // Fixed overlay for the score and coins
        this.createOverlay();
        // Create the menu
        this.createMenu();
        // Define the tweens to be used in game
        this.defineTweens();
        // Draw the level
        this.drawLevel();

        // Waits for input, a pointer from a mouse or finger, before firing the callback function
        game.input.onDown.add(this.handleTap, this);
    },

    // Set default properties
    setDefaultProperties: function(){
        // When the game starts, the gameOver value is always false
        this.gameOver = false;
        // Keep track of the player's reachedFloor to be able to update the high score
        this.reachedFloor = 0;
        // collectedCoins always starts at 0, but updates the total coins in local storage
        this.collectedCoins = 0;
        // Determine if the player can jump
        this.canJump = true;
        // Determine if the player is climbing a ladder
        this.isClimbing = false;

        // Object pooling stores a collection of objects to use
        // Rather than creating new instances every time
        this.floorPool = [];
        this.ladderPool = [];
        this.bulbasaurPool = [];
        this.wartortlePool = [];
        this.coinPool = [];
        this.spikePool = [];
        this.firePool = [];
        this.arrowPool = [];
        this.monsterPool = [];
        this.spikedMonsterPool = [];
    },

    // Define the sound effects used in the game
    addAudio: function(){
        // Use the Key names created in Preload
        this.coinSound = game.add.audio("coinsound");
        this.hurtSound = game.add.audio("hurtsound");
        this.jumpSound = game.add.audio("jumpsound");
    },

    // Define the groups used in the game
    defineGroups: function(){

        // gameGroup will contain many children groups
        this.gameGroup = game.add.group();

        // group which will contain all floors
        this.floorGroup = game.add.group();
        this.gameGroup.add(this.floorGroup);

        // groups for vines and bulbasaurs
        this.ladderGroup = game.add.group();
        this.bulbasaurGroup = game.add.group();
        this.gameGroup.add(this.ladderGroup);
        this.gameGroup.add(this.bulbasaurGroup);

        // group for coins
        this.coinGroup = game.add.group();
        this.gameGroup.add(this.coinGroup);

        // group for all deadly objects (rapidash, grimers, dugtrios, rhydons)
        this.deadlyGroup = game.add.group();
        this.gameGroup.add(this.deadlyGroup);

        // group which will contain all arrows
        this.arrowGroup = game.add.group();
        this.wartortleGroup = game.add.group();
        this.gameGroup.add(this.arrowGroup);
        this.gameGroup.add(this.wartortleGroup);

        // groups for overlay and menu
        this.overlayGroup = game.add.group();
        this.menuGroup = game.add.group();
    },

    // Create a particle emitter
    createParticles: function(){
      // lightweight particles that use ARCADE Physics, takes 3 arguments
      // x and y coordinates for where the particles are emitted from.
      // the total number of particles in this emitter
        this.emitter = game.add.emitter(0, 0, 80);

        // Tells the emitter what image to use as particles
        this.emitter.makeParticles("coinparticle");

        // Randomly generated alpha (transparency) from 0.4 to 0.6
        // 0 = completely transparent; 1 = completely opaque
        this.emitter.setAlpha(0.4, 0.6);

        // Randomly generate the particle's scale. (min, max, rangeStart, rangeEnd)
        this.emitter.setScale(0.4, 0.6, 0.4, 0.6);

        // Add emitter to gameGroup group
        this.gameGroup.add(this.emitter);
    },

    // Create the overlay
    createOverlay: function(){

        // Adding Sprites takes 3 arguments
        // (x-position, y-position, key name)
        var cloud = game.add.sprite(0, game.height, "cloud");

        // Anchor Setting, default is (0, 0), the top left corner
        // (0.5, 0.5) is the center, (1, 1) is the bottom right corner
        cloud.anchor.set(0, 1);

        // cloud.png is a verticle gradient from transparent to opaque
        // Tinting it the sky color makes it seem as objects fade as the pass the bottom bound
        cloud.tint = gameOptions.skyColor;
        // Add the cloud to overlayGroup
        this.overlayGroup.add(cloud);

        // Adding Bitmap Text takes 5 arguments:
        // the x & y coordinates
        // font's key name
        // what the string says
        // font size
        var highScoreText = game.add.bitmapText(game.width - 10, game.height - 10, "font", "Best Score: " + this.savedData.score.toString(), 30);
        // Set the bitmap text's registration points
        highScoreText.anchor.set(1, 1);
        // Add scoreText to overlayGroup
        this.overlayGroup.add(highScoreText);

        // Do the same for the coins collected Text
        var coinsText = game.add.bitmapText(game.width / 2, game.height - 10, "font", "Coins: " + this.savedData.coins.toString(), 30);
        coinsText.anchor.set(0.5, 1);
        this.overlayGroup.add(coinsText);

        // Do the same for score text
        this.scoreText = game.add.bitmapText(10, game.height - 10, "font", "Score: 0", 30);
        this.scoreText.anchor.set(0, 1);
        this.overlayGroup.add(this.scoreText);
    },

    // Create the menu
    createMenu: function(){

        // add Pikachu image, set its registration point and add it to "menuGroup" group
        var tap = game.add.sprite(game.width / 2, game.height - 150, "tap");
        tap.anchor.set(0.5);
        tap.width = 150;
        tap.height = 150;
        this.menuGroup.add(tap);
        // Tweens alter properties of a target over a period of time (fading, scaling, motion, etc)
        // Set the Alpha(transparency) to 0
        // Phaser.Easing.Cubic.InOut is easing, true starts immediately, 0 means no delay
        // -1(infinitely) is how many times it plays, true is for the yoyo effect, plays forward and backwards in one loop
        var tapTween = game.add.tween(tap).to({
            alpha: 0
        }, 200, Phaser.Easing.Cubic.InOut, true, 0, -1, true);

        // Add bitmap text with "tap to jump", set its anchor and add it to menuGroup
        var tapText = game.add.bitmapText(game.width / 2, tap.y - 120, "font", "tap to jump", 45);
        tapText.anchor.set(0.5);
        this.menuGroup.add(tapText);

        // Add bitmap text with game title, set its anchor and add it to menuGroup
        var titleText = game.add.bitmapText(game.width / 2, tap.y - 200, "font2", "POKeCLIMB", 70);
        titleText.anchor.set(0.5);
        this.menuGroup.add(titleText);
    },

    // Define the tween which scrolls the level as the player climbs the vines
    defineTweens: function(){

        // Keep a counter to see how many tweens are left to do
        this.tweensToGo = 0;

        // Tween to move the entire gameGroup down by floorGap pixels
        this.scrollTween = game.add.tween(this.gameGroup);
        this.scrollTween.to({
            y: gameOptions.floorGap
        }, 500, Phaser.Easing.Cubic.Out);

        // Callback function for when the tween is completed
        this.scrollTween.onComplete.add(function(){

            // Reposition the gameGroup's initial position
            // The player isn't actually moving up, everything else is moving down
            this.gameGroup.y = 0;

            // Loop through all gameGroup children executing the function having "item" or child argument
            this.gameGroup.forEach(function(item){

                // Check if the children groups have children (subItems)
                if(item.length > 0){

                    // Loop through all subItems
                    item.forEach(function(subItem) {

                        // Update y position by adding floorGap
                        subItem.y += gameOptions.floorGap;

                        // If y position is greater than the game.height, remove the subItem
                        if(subItem.y > game.height){

                            switch(subItem.key){
                              // Different cases for different keys
                                case "floor":
                                    this.killFloor(subItem);
                                    break;

                                case "ladder":
                                    this.killLadder(subItem);
                                    break;

                                case "bulbasaur":
                                    this.killBulbasaur(subItem);
                                    break;

                                case "coin":
                                    this.killCoin(subItem);
                                    break;

                                case "spike":
                                    this.killSpike(subItem);
                                    break;

                                case "fire":
                                    this.killFire(subItem);
                                    break;

                                case "arrow":
                                    this.killArrow(subItem);
                                    break;

                                case "wartortle":
                                    this.killWartortle(subItem);
                                    break;

                                case "monster":
                                    this.killMonster(subItem);
                                    break;

                                case "spikedmonster":
                                    this.killSpikedMonster(subItem);
                                    break;
                            }
                        }
                    }, this);
                }
                else{

                    // If the item length is zero, it has no children. Move it down by floorGap
                    item.y += gameOptions.floorGap;
                }
            }, this);

            // Populate the floor with enemies
            this.populateFloor(true);

            // Check if there are more tweens to do
            if(this.tweensToGo > 0){
                // Decrease tweens
                this.tweensToGo --;
                // And start tween
                this.scrollTween.start();
            }
        }, this);
    },

    // Draw the level, the entire game with all floors
    drawLevel: function(){

        // Local variable which keep tracks of current floor
        var currentFloor = 0;

        // Keep track of the coordinate of the highest floor reached
        this.highestFloorY = game.height * gameOptions.floorStart;

        // Loop keeps adding floors above the starting floor
        // Stops when you have two floors above the top world bound of the canvas
        while(this.highestFloorY > - 2 * gameOptions.floorGap){

                // If the floor isn't the starting floor(0), it will be populated with other assets
                this.populateFloor(currentFloor > 0);

                // When a floor is added, update highestFloorY value
                this.highestFloorY -= gameOptions.floorGap;

                // Increasing currentFloor counter
                currentFloor ++;
        }
        // Add floorGap to highestFloorY to make it reflect the new floor's position
        this.highestFloorY += gameOptions.floorGap;

        // Add the player to the game
        this.addHero();
    },

    // Populate a floor, with a Boolean argument telling us if we also have to add stuff
    populateFloor: function(addStuff){
        // Add the platform itself
        this.addFloor();

        // If true, then you're no longer on the starting floor. Add things!!
        if(addStuff){

            // Define safeZones in which you can randomly place enemies and not make the game impossible
            this.safeZone = [];
            this.safeZone.length = 0;

            // Add a ladder. Ladder should always be the first thing to be added to a floor
            this.addLadder();

            // Add a coin, optional argument
            // can be a given coordinate, or null, which means randomly placed
            this.addCoin(null);

            // Each floor can have 1 or 2 deadly items
            var deadlyItems = game.rnd.integerInRange(1, 2)

            // Loop to select from deadlyItems times
            for(var i = 0; i < deadlyItems; i++){
                // 0: grimer(spike)
                // 1: fire(rapidash)
                // 2: arrow(wartortle shell)
                // 3: monster(dugtrio)
                // 4: spikedMonster(rhydon)
                var stuffToAdd = game.rnd.integerInRange(0, 4);
                // Randomly get a number from 0 - 4, inclusive
                switch(stuffToAdd){

                    case 0:
                        this.addSpike();
                        break;

                    case 1:
                        this.addFire();
                        break;

                    case 2:
                        this.addArrow();
                        break;

                    case 3:
                        this.addMonster();
                        break;

                    case 4:
                        this.addSpikedMonster();
                        break;
                }
            }
        }
    },

    // Add a floor
    addFloor: function(){

        // First, check if there's a floor sprite in the pool
        if(this.floorPool.length > 0){
            // If there is, remove it
            var floor = this.floorPool.pop();
            // Place the floor at the vertical highest floor position allowed
            floor.y = this.highestFloorY;
            // Revive sets its "alive", "exists" and "visible" properties all set to true
            floor.revive();
        }

        // If the pool is empty, add a sprite
        else{
            // Add the floor sprite
            var floor = game.add.sprite(0, this.highestFloorY, "floor");
            // Add floor sprite to floor group
            this.floorGroup.add(floor);
            // enabling ARCADE physics to the floor
            game.physics.enable(floor, Phaser.Physics.ARCADE);
            // Setting the body to be immovable makes it unaffected by other forces
            floor.body.immovable = true;
            // Setting the down collision false, allows the player to climb through the bottom
            // But not fall through the top
            floor.body.checkCollision.down = false;
        }
    },

    // Add a ladder
    addLadder: function(){
        // Random horizontal placement of the ladder, with a 50 pixels margin from game borders
        var ladderXPosition = game.rnd.integerInRange(50, game.width - 50);
        // Check for a ladder sprite in the pool
        if(this.ladderPool.length > 0){
            // Remove it from the pool and a bulbasaur sprite because it's using vine whip
            var ladder = this.ladderPool.pop();
            var bulbasaur = this.bulbasaurPool.pop();
            // place them at horizontal ladderXPosition
            ladder.x = ladderXPosition;
            bulbasaur.x = ladderXPosition;
            // place the ladder at the vertical highest floor position allowed in the game
            ladder.y = this.highestFloorY;
            bulbasaur.y = this.highestFloorY;
            // Revive sets its "alive", "exists" and "visible" properties all set to true
            ladder.revive();
            bulbasaur.revive();
        }

        // If pool is empty
        else{
            // Add vine and bulbasaur sprites to the pool
            var ladder = game.add.sprite(ladderXPosition, this.highestFloorY, "ladder");
            var bulbasaur = game.add.sprite(ladderXPosition, this.highestFloorY, "bulbasaur");
            var bulbasaurIdle = bulbasaur.animations.add("idle");
            // Bulbasaur's idle animation and registration point is middle bottom
            bulbasaur.animations.play("idle", 2, true);
            bulbasaur.anchor.set(0.5, 1);
            // Add them to their respective groups
            this.ladderGroup.add(ladder);
            this.bulbasaurGroup.add(bulbasaur);

            // Ladder's registration point is middle top
            ladder.anchor.set(0.5, 0);
            // enabling ARCADE physics to the floor
            game.physics.enable(ladder, Phaser.Physics.ARCADE);
            game.physics.enable(bulbasaur, Phaser.Physics.ARCADE);
            // setting ladder's and bulbasaur's body as immovable
            ladder.body.immovable = true;
            bulbasaur.body.immovable = true;
        }

        // Prevent spikes from spawning too close to the top of ladders
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
        var arrowY = this.highestFloorY;

        // first, we see if we already have an arrow sprite in the pool
        if(this.arrowPool.length > 0 && this.wartortlePool.length > 0){

            // if we find an arrow in the pool, let's remove it from the pool
            var arrow = this.arrowPool.pop();
            var wartortle = this.wartortlePool.pop();
            wartortle.x = arrowX;
            wartortle.y = this.highestFloorY
            // Reset the shell's velocity when recycled from the pool
            // Otherwise each arrow instance would interfere with each other
            arrow.reset(game.width * arrowX, arrowY);

            // custom property to tell us if the arrow is firing, initially set to false
            arrow.isFiring = false;

            /*  this line will just flip the arrow horizontally if it's on the right side of the game.
                you can flip horizontally a sprite by setting its x scale to -1  */
            arrow.scale.x = 1 - 2 * arrowX;
            wartortle.scale.x = 1 - 2 * arrowX;

            // make the arrow revive, setting its "alive", "exists" and "visible" properties all set to true
            arrow.revive();
            wartortle.revive();
        }

        // this is the case we did not find any arrow in the pool
        else{

            // Add the arrow sprite
            var arrow = game.add.sprite(game.width * arrowX, arrowY, "arrow");
            var wartortle = game.add.sprite(game.width * arrowX, arrowY, "wartortle");
            var arrowSpin = arrow.animations.add("spin");
            var wartortleIdle = wartortle.animations.add("idle");
            wartortle.animations.play("idle", 4, true);
            arrow.animations.play("spin", 3, true);

            // custom property to tell us if the arrow is firing, initially set to false
            arrow.isFiring = false;

            // setting arrow registration point to center both horizontally and vertically
            arrow.anchor.set(0.75, 1);
            wartortle.anchor.set(0.5, 1);

            /*  this line will just flip the arrow horizontally if it's on the right side of the game.
                you can flip horizontally a sprite by setting its x scale to -1  */
            arrow.scale.x = 1 - 2 * arrowX;
            wartortle.scale.x = 1 - 2 * arrowX;

            // enabling ARCADE physics to the arrow
            game.physics.enable(arrow, Phaser.Physics.ARCADE);
            game.physics.enable(wartortle, Phaser.Physics.ARCADE);

            // setting arrow's body as immovable
            arrow.body.immovable = true;

            // adding arrow to arrow group
            this.arrowGroup.add(arrow);
            this.wartortleGroup.add(wartortle);
        }
    },

    // method to add a monster
    addMonster: function(){

        // monsterX is the random horizontal placement of the monster, with a 50 pixels margin from game borders
        var monsterX = game.rnd.integerInRange(50, game.width - 50);

        // monsterY is the vertical position where to place the monster
        var monsterY = this.highestFloorY - 20;

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
            var monsterDead = monster.animations.add("dead", [2]);

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
        var monsterY = this.highestFloorY - 25;

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

            monster.animations.play("walk", 2, true);

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
            var coinY = this.highestFloorY - gameOptions.floorGap / 2;

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
            var spikeYPosition = this.highestFloorY - 20;

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

                    // Adding Animations
                    // .play("name", framerate, true or false if it loops)
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
            var fireYPosition = this.highestFloorY - 58;

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
                    fire.animations.play("burn", 6, true);

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
        this.hero.animations.play("walk", 6, true);

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

                // do not horizontally flip the sprite (the original image is with the sprite looking to the right)
                this.hero.scale.x = -1;
            }

            // collision against the right bound of the game
            if(right){

                // adjusting the velocity so that the sprite moves to the left
                this.hero.body.velocity.x = -gameOptions.playerSpeed;

                 // horizontally flip the sprite (the original image is with the sprite looking to the right)
                this.hero.scale.x = 1;
            }

            // collision against the bottom bound of the game
            if(down){

                /* the setItem() method of the Storage interface, when passed a key name and value,
                    will add that key to the storage, or update that key's value if it already exists.
                    basically we are updating the best score and the total amount of coins gathered  */
                localStorage.setItem(gameOptions.localStorageName,JSON.stringify({

                        // score takes the highest value between currently saved score and the amount of floors climbed
                        score: Math.max(this.reachedFloor, this.savedData.score),

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
            this.mountainsBack.tilePosition.x -= 0.05;
            this.mountainsMid1.tilePosition.x -= 0.3;
            this.mountainsMid2.tilePosition.x -= 0.75;

            // method to fire an arrow
            this.fireArrow();

            // method to check for hero Vs floor collision
            this.checkFloorCollision();

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
    checkFloorCollision: function(){

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
                    this.hero.body.velocity.y = - gameOptions.climbSpeed;

                    // stop applying gravity to the hero, to avoid climb speed to decrease
                    this.hero.body.gravity.y = 0;

                    // the hero is climbing
                    this.isClimbing = true;

                    // playing "climb" animation, at 15 frames per second in loop mode
                    this.hero.animations.play("climb", 6, true);


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

                // updating reachedFloor property as we climbed one more floor
                this.reachedFloor ++;

                // updating text property of a bitmap text will update the text it shows
                this.scoreText.text = this.reachedFloor.toString();
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
    killFloor: function(floor){

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

    killBulbasaur: function(bulbasaur){
      bulbasaur.kill();
      this.bulbasaurPool.push(bulbasaur);
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

    killWartortle: function(wartortle){
        wartortle.kill();
        this.wartortlePool.push(wartortle)
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
