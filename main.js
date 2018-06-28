var game;
var gameOptions ={
  // Width of the game, Height scales to screen
  gameWidth: 800,

  // Where the active floor starts and the spacing between them
  floorStart: 1 / 8 * 5,
  floorGap: 250,

  // Player attributes
  playerGravity: 10000,
  playerSpeed: 450,
  climbSpeed: 450,
  playerJump: 1800,

  // Enemy, Obstacle, and Item Instance attributes
  shellSpeed: 1000,
  // Integer that affects probabilty of coin spawn
  // coinRatio(conRatio+1) == 2/3
  coinRatio: 2
  enemySpeed: 250,
  // Same as coin ratio, but for two digletts
  grimerRatio: 1,
  // Prevents spikes from spawning too close to each other or to the ladder
  skyColor: 0x89d7fb,
  safeRadius: 184,

  // Saves game info in local storage, if the string is reset, so is the data
  localStorageName: "poke-climb",
  // Version number in case it is needed to be displayed
  versionNumber: "1.0",

  // Asset Paths
  spritesPath: "assets/sprites/",
  fontsPath: "assets/fonts/",
  soundPath: "assets/sounds/",
}

//window.onload is the first function to be executed, immediately after the page is loaded
window.onload = function(){
  //gets width and height in pixels of the viewport
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;

  //sets window height to ~2x width which is the average portrait mode
  if(windowWidth > windowHeight){
    windowHeight = windowWidth * 1.8;
  }

  // Set the game to be the full height of the window while keeping the width 800
  // Multiply windowHeight by the ratio between gameOptions.gameWidth and windowWidth
  var gameHeight = windowHeight * gameOptions.gameWidth / windowWidth;

  // Create a new game instance with the width and height variables
  game = new Phaser.Game(gameOptions.gameWidth, gameHeight);

  // Define stats (splash screen, menu, game itself, game over, etc)
  game.state.add("BootGame", bootGame);
  game.state.add("PreloadGame", preloadGame);
  game.state.add("PlayGame"), playGame);

  // Execute states by calling them
  game.state.start("BootGame");
}

// Sets the background and scales the game
var bootGame = function(game){}
bootGame.prototype = {

  // Automatically executed once the state is created, this function only executes once
  create: function(){

    game.stage.backgroundColor = gameOptions.skyColor;
    if(!Phaser.Device.desktop){
      // Only allow the game to be run in Portrait Mode
      // forceOrientation method can be used to generate incorrect orientation signals
      game.scale.forceOrientation(false,true);
      game.scale.enterIncorrectOrientation.add(function(){

        // Pauses the game and shows the error message
        game.paused = true;
        document.querySelector("canvas").style.display = "none";
        document.getElementById("wrongorientation").style.display = "block";
      })

      // Return function for when the game is back in Portrait mode
      game.scale.leaveIncorrectOrientation.add(function(){

        game.paused = false;
        document.querySelector("canvas").style.display = "block";
        document.getElementById("wrongorientation").style.display = "none";
      })
    }

    // Set scale Mode to cover the larger area of a window
    // Or the entire scree of a portrait device while
    // keeping the ratio and showing all content
    game.scale.scaleMode = Phaser.ScaleManage.SHOW_ALL;

    // Centering the canvas
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    // Prevent the game to pause if it loses focus.
    game.stage.disableVisibilityChange = true;

    // Start "PreloadGame" state
    game.state.start("PreloadGame");
  }
}

var preloadGame = function(game){}
preloadGame.prototype = {

  // Preload runs automatically before the create methods
  preload: function(){

    // Loading assets = type("variable name", file path + file name)
    // spritesPath was a variable declared in the beginning to store the path to the sprites folder
    game.load.image("platform", gameOptions.spritesPath + "platform.png");
    game.load.image("vine", gameOptions.spritesPath + "vine.png");
    game.load.image("coinparticle", gameOptions.spritesPath + "coinparticle.png");
    // game.load.image("cloud", gameOptions.spritesPath + "cloud.png");
    game.load.image("tap", gameOptions.spritesPath + "tap.png");

    game.load.spritesheet("player", gameOptions.spritesPath + "player-walk-climb.png", 26, 48);
    game.load.spritesheet("coin", gameOptions.spritesPath + "coin.png", 48, 48);
    game.load.spritesheet("bulbasaur", gameOptions.spritesPath + "bulbasaur-idle.png", 40, 40);
    game.load.spritesheet("rapidash", gameOptions.spritesPath + "rapidash-fire.png", 32, 58);
    game.load.spritesheet("grimer", gameOptions.spritesPath + "grimer-spike.png", 39, 20);
    game.load.spritesheet("dugtrio", gameOptions.spritesPath + "dugtrio-mon1.png", 40, 40);
    game.load.spritesheet("rhydon", gameOptions.spritesPath + "rhydon-mon2.png", 40, 40);
    game.load.spritesheet("wartortle", gameOptions.spritesPath + "wartortle-idle.png", 38, 40);
    game.load.spritesheet("shell", gameOptions.spritesPath + "wartortle-shell.png", 21, 20);

    game.load.audio("coinsound", gameOptions.soundPath + "coin.mp3");
    game.load.audio("jumpsound", gameOptions.soundPath + "jump.mp3");
    game.load.audio("hurtsound", gameOptions.soundPath + "hurt.mp3");
    game.load.audio("themeMusic", gameOptions.soundPath + "Pokemon-Opening.mp3");

    game.load.bitmapFont("font", gameOptions.fontsPath + "font.png", gameOptions.fontsPath + "font.fnt");
    game.load.bitmapFont("font2", gameOptions.fontsPath + "font2.png", gameOptions.fontsPath + "font2.fnt");
  }

  // create method executes once all the assets are loaded and the state is created
  create: function(){
    // start "PlayGame" state
    game.state.start("PlayGame");
  }
}

var playGame = function(game){}
playGame.prototype = {

  create: function(){

    // Checks the local storage savedData for coins and score
    // If empty, it creates a new object
    this.savedData = localStorage.getItem(gameOptions.localStorageName) == null ? {score : 0, coins: 0} : JSON.parse(localStorage.getItem(gameOptions.localStorageName));

    // Set default properties (ex: lives = 3, score = 0) for when a new game starts
    this.setDefaultProperties();

    // Add audio to the game
    this.addAudio();

    // ARCADE physics will handle collision, overlaps, velocities and motions
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Define world bounds (set the size of the 'world', where the games objects will live)
    // x coordintate of the top left most corner of the world, in pixels.
    // y coordintate of the top left most corner of the world.
    // width of the game world in pixels.
    // height of the game world in pixels.
    game.world.setBounds(0, - 3 * gameOptions.floorGame, game.width, game.height + 3 * gameOptions.floorGap);

    // Create groups required by the game to display opbjects and check for collisions
    this.defineGroups();

    // Creates a fixed overlay for particles to show when the player collects coins
    this.createParticles();
    this.createOverlay();

    // Creates the menu screen
    this.createMenu();

    // Defines the tweens to be used in the game
    this.defineTweens();

    // Draws the level
    this.drawLevel();

    // This listener waits for a pointer (finger or mouse) to be pressed
    // Fires the callback function this.handleTap.
    game.input.onDown.add(this.handleTap, this);
  },

  // Method that creates the default properties
  setDefaultProperties: function(){
    // The game over value always starts with false, until the player gets hit
    this.gameOver = false;

    // reachedFloor keeps track of the floor the player reaches
    this.reachedFloor = 0;

    // Counts the coins the player collects
    this.collectedCoints = 0;

    // Checks to see if the player can jump
    this.canJump = true;

    // Checks to see if the player is on a ladder
    this.isClimbing = false;

    // Object pooling stores a collection of opbjects
    // Creating every instance once a graphic asset isn't needed anymore can get expensive
    this.platformPool = [];
    this.vinePool = [];
    this.coinPool = [];
    this.grimerPool = [];
    this.rapidashPool = [];
    this.wartortlePool =[];
    this.shellPool = [];
    this.dugtrioPool = [];
    this.rhydonPool = [];
  },

  addAudio: function(){
    // Adds the audio resource using the key assigned in the Preload function
    this.coinSound = game.add.audio("coinsound");
    this.hurtSound = game.add.audio("hurtsound");
    this.jumpSound = game.add.audio("jumpsound");
    this.jumpSound = game.add.audio("themeMusic");
  }

  // Define the groups in the game
  defineGroups: function(){
    // gameGroup is added to the main group and will contain the children gameGroups
    this.gameGroup = game.add.group();
    this.platformGroup = game.add.group();
    this.vineGroup = game.add.group();
    this.coinGroup = game.add.group();
    this.enemyGroup = game.add.group();
    this.shellGroup = game.add.group();
    this.backgroundEnemies = game.add.group();

    // platformGroup, vineGroup, coinGroup, etc are children of gameGroup
    this.gameGroup.add(this.platformGroup);
    this.gameGroup.add(this.vineGroup);
    this.gameGroup.add(this.coinGroup);
    this.gameGroup.add(this.enemyGroup);
    this.gameGroup.add(this.shellGroup);
    this.gameGroup.add(this.backgroundEnemies);

    // Group contains overlay information
    this.overlayGroup = game.add.group();
    // Group contains the menu
    this.menuGroup = game.add.group();
  },

  // Method to create particles
  createParticles: function(){
    // Emitters use arcade physics, they can be used for one-time explosions
    // or continuous effects like fire or rain.
    // Launches particles at set intervals
    // Takes the x & y coordinate for where to shoot out from, and how many particles
    this.emitter = game.add.emitter(0, 0, 80);

    // Tells the emitter what image to use which we assigned in the beginning
    this.emitter.makeParticles("coinparticle");

    // Each particle will have a random transparancy within the given range (0 being transparant, 1 being completely opaque)
    this.emitter.setAlpha(0.4, 0.6);
    // Each particle will have a randomly generated x and y scale
    // .setScale(min,max, rangeStart, rangeEnd);
    this.emitter.setScale(0.4, 0.6, 0.4, 0.6);
    // Also add the emitter to the gameGroup
    this.gameGroup.add(this.emitter);
  },

  // Creates the overlay
  createOverlay: function(){

    // // Adding sprites: (x-position, y-position, var name of image)
    // var cloud = game.add.sprite(0, game.height, "cloud");
    //
    // // Setting anchors: default is (0, 0) which is the top left corner
    // // (0.5, 0.5) is the center of the sprite
    // // (1, 1) is the bottom right corner
    // // Here, (0, 1), is the bottom left corner
    // cloud.anchor.set(0, 1);
    //
    // // Tinting the cloud with the same color as the background to make it seem more far away
    // cloud.tint = gameOptions.skyColor;
    //
    // // Add the cloud to the overlayGroup
    // this.overlayGroup.add(cloud);

    // Adding bitmap text
    // bitmapText(x-coordinate, y-coordinate, "font var", "String to display", fontsize);
    // Doing this to display the high score, score, and coins
    var highScoreText = game.add.bitmapText(game.width - 10, game.height - 10, "font", "Best Score: " + this.savedData.score.toString(), 30);
    coinsText.anchor.set(1, 1);
    this.overlayGroup.add(highScoreText);
    var coinsText = game.add.bitmapText(game.width / 2, game.height / 2, "font", "Coins: " + this.savedData.coins.toString(), 30);
    coinsText.anchor.set(0.5, 1);
    this.overlayGroup.add(coinsText)
    this.scoreText = game.add.bitmapText(10, game.height - 10, "font", "Score: 0", 30);
    this.scoreText.anchor.set(0, 1);
    this.overlayGroup.add(this.scoreText);
  },

  // Creates the menu
  createMenu: function(){
    // Add the tap image to the menuGroup
    var tap = game.add.sprite(game.width / 2, game.height - 150, "tap");
    tap.anchor.set(0.5);
    this.menuGroup.add(tap);

    // Tweens allow you to alter properties of an object over a period of time (ex: fading, scaling, color, etc)
    // Phaser.Easing.Cubic.InOut is the easing
    // True is saying it starts immediately, 0 is the delay (in milliseconds), -1 is the amount of times play (-1 is infinite), true is the yo-yo affect (plays forward and backwards)
    var tapTween = game.add.tween(tap).to({
        alpha: 0
    }, 200, Phaser.Easing.Cubic.InOut, true, 0, -1, true);

    // Add bitmap text for the instructions ("Tap to Jump")
    var tapText = game.add.bitmapText(game.width / 2, tap.y - 120, "font", "tap to jump", 45);
    tapText.anchor.set(0.5);
    this.menuGroup.add(tapText);

    // Add bitmap text for the title, set the anchor, and add it to the menuGroup
    var titleText = game.add.bitmapText(game.width / 2, tap.y - 200, "font2", "PokeClimb", 90);
    titleText.anchor.set(0.5);
    this.menuGroup.add(titleText);
  },

  defineTweens: function(){

    // Counter to remind us how many tweens we have to go
    this.tweensToGo = 0;

    // This tween scrolls down the entire gameGroup by gameOptions.floorGap pixels
    // Moves the level down in 500 milliseconds
    this.scrollTween = game.add.tween(this.gameGroup);
    this.scrollTween.to({
      y: gameOptions.floorGap
    }, 500, Phaser.Easing.Cubic.Out);

    // Callback function for when the tween is complete
    this.scrollTween.onComplete.add(function(){

      // Player isn't really climbing, the levels move down
      // Repositions the gameGroup to its initial position
      this.gameGroup.y = 0;
      this.gameGroup.forEach(function(item){
        // Checks to see if the group has children
        if(item.length > 0){
          // Loop through the children ("subItem") of the child
          item.forEach(function(subItem){
            // Update their y-position by adding "floorGap" pixels to it
            subItem.y += gameOptions.floorGap;
            // If their coordinate is greater than the game height, delete it
            if(subItem.y > game.Height){
              // Different actions for different assets
              switch(subItem.key){

                case "platform":
                  this.killPlatform(subItem);
                  break;
                case "vine":
                  this.killVine(subItem);
                  break;
                case "coin":
                  this.killCoin(subItem);
                  break;
                case "grimer":
                  this.killGrimer(subItem);
                  break;
                case "rapidash":
                  this.killRapidash(subItem);
                  break;
                case "shell":
                  this.killShell(subItem);
                  break;
                case "wartortle":
                  this.killWartortle(subItem);
                  break;
                case "dugtrio":
                  this.killDugtrio(subItem);
                  break;
                case "rhydon":
                  this.killRhydon(subItem);
                  break;
              }
            }
          }, this);
        }
        else{
          // If the item has no children, move it down by floorGap
          item.y += gameOptions.floorGap;
        }
      }, this);

      // Populate the platforms with enemies
      this.populatePlatform(true);

      // If we have more tweens to do, decrease them and start
      if(this.tweensToGo > 0){
        this.tweensToGo --;
        this.scrollTween.start();
      }
    }, this);
  },

  // Draw the level (all the floors on the screen)
  drawLevel: function(){

    // Define a local variable to keep track of what floor the player is on
    var currentFloor = 0;

    // Keep track of the highest floor placed
    this.highestFloorY = game.height * gameOptions.floorStart;
    // Keep placing floors floorGap pixels above the current floor until you're too high on the canvas
    while(this.highestFloorY > - 2 * gameOptions.floorGap){
      // populateFloor will generate enemies, coins, and obstacles as long as currentFloor > 0
      this.populatePlatform(currentFloor > 0);
      this.highestFloorY -= gameOptions.floorGap;
      currentFloor ++;
  }

  // Update the value of highestFloorY outside of the while lopo, after the platforms positions change
  this.highestFloorY += gameOptions.floorGap;

  // Add the player sprite
  this.addPlayer();
},

populatePlatform: function(addStuff){

  // Call the method that adds levels above itself
  this.addPlatform();

  // If addStuff is true, the current floor isn't 0 and it proceed to populate the platforms
  if(addStuff){
    // Define safe zones to prevent the game randomly placing enemies too difficult
    this.safeZone = [];
    this.safeZone.length = 0;

    // Adds a vine/ladder to each level
    this.addVine();
    // Adds a coin; (null) generates a random coordinate. Can be given points instead if you want to place it in a specific spot
    this.addCoin(null);

    // Levels can have 1 or 2 enemies/obstacles
    var enemyObstacles = game.rnd.intergerInRange(1,2)
    // Loop executed enemyObstacles times
    for(var i=0; i<enemyObstacles; i++){
      // Randomly add an enemy or obstacle
      // 0: grimer, 1: rapidash, 2: wartortle/shell, 3: dugtrio, 4: rhydon
      var stuffToAdd = game.rnd.integerInRange(0, 4);

      switch(stuffToAdd){
        case 0:
          this.addGrimer();
          break;
        case 1:
          this.addRapidash();
          break;
        case 2:
          this.addWartortle();
          break;
        case 3:
          this.addDugtrio();
          break;
        case 4:
          this.addRhydon();
          break;
        }
      }
    }
  },

  // Adds a floor
  addPlatform: function(){

    // Check if there's already a floor sprite in the object pool
    if(this.platformPool.length >0){
      // Subtract a platform instance from the pool
      var platform = this.platformPool.pop();
      // Place it at the vertically highest position allowed
      platform.y = this.highestFloorY;
      // Revive the floor, setting its "alive", "exists", and "visible" properties true
      platform.revive();
    }
    // If theres nothing in the pool, add to it
    else{
      var platform = game.add.sprite(0, this.highestFloorY, "platform");
      // Add it to the group and enable ARCADE physics
      this.platformGroup.add(platform);
      game.physics.enable(platform, Phaser.Physics.ARCADE);

      // Make platforms immovable (cannot receive impact from other objects)
      platform.body.immovable = true;
      // Check for collisions only from the top
      // allowing the player to pass through it when climbing but can't fall through it once above it
      platform.body.checkCollision.down = false;
    }
  },

  // Adds vines/ladders
  addVine: function(){

    // Randomly generates horizonal placement
    var vineXPosition = game.rnd.integerInRange(50, game.width - 50);
    // Same process as generating platforms, first check the pool. If nothing, add to it
    if(this.vinePool.length > 0){
      var vine = this.vinePool.pop();
      vine.x = vineXPosition;
      vine.y = this.highestFloorY;
      vine.revive();
    }

    else{
      var vine = game.add.sprite(vineXPosition, this.highestFloorY, "vine");
      // Add it to the group, set its anchor, enable ARCADE physics
      this.vineGroup.add(vine);
      vine.anchor.set(0.5, 0);
      game.physics.enable(vine, Phaser.Physics.ARCADE);
      vine.body.immovable = true;
    }

    // Don't let obstacles spawn too close to a vine
    // It would make it impossible for the player to dodge
    this.safeZone .push({
      start: vineXPosition - gameOptions.safeRadius,
      end: vineXPosition + gameOptions.safeRadius
    });
  },

  // Add Wartortles that fire shells
  addShell: function(){

    // shellX can have two vales,
    // 0 to spawn on the left, 1 to spawn on the right
    var shellX = game.rnd.integerInRange(0, 1);

    // vertical position to spawn wartortle's shell
    var shellY = this.highestFloorY - 20;

    // Again with the pool checking and adding
    if(this.shellPool.length > 0){
      var shell = this.shellPool.pop();
      // Reset velocity and position values of newly spawned shells
      shell.reset(game.width * shellX, shellY);

      // Custom property if the shell is firing
      shell.isFiring = false;

      // Flips the shell sprites depending on which side it spawned
      shell.scale.x = 1 - 2 * shellX;
      shell.revive();
    }
    else{

      var shell = game.add.sprite(game.width * shellX, shellY, "shell");
      shell.isFiring = false;
      shell.anchor.set(0.5);
      shell.scale.x = 1 - 2 * arrowX;
      game.physics.enable(shell, Phaser.Physics.ARCADE);
      shell.body.immovable = true;
      this.shellGroup.add(shell);
    }
  },

  addDugtrio: function(){

    // dugtrioX gets the random horizonal placement
    var dugtrioX = game.rnd.integerInRange(50, game.width - 50);

    // dugtrioY is the vertical position on the floor
    var dugtrioY = this.highestFloorY - 20;

    // Check the dugtrioPool
    if(this.dugtrioPool.length > 0){
      var dugtrio = this.dugtrioPool.pop();
      dugtrio.x = dugtrioX;
      dugtrio.y = dugtrioY;
      dugtrio.revive();
    }

    // Adding sprites to the pool
    else{
      var dugtrio = game.add.sprite(dugtrioX, dugtrioY, "dugtrio");
      var dugtrioAnimation = dugtrio.animations.add("walk", [0, 1]);
      var dugtrioJumped = dugtrio.animations.add("jumped", [2]);
      // .play("name of animations", which frames on the sheet to use)
      this.dugtrio.animations.play("walk", 15, true);
      dugtrio.anchor.set(0.5);
      game.physics.enable(dugtrio, Phaser.Physics.ARCADE);
      dugtrio.body.immovable = true;
      dugtrio.body.collideWorldBounds = true;
      dugtrio.body.velocity.x = gameOptions.monsterSpeed;

      // Detect when dugtrio collides with the wolrd bounds
      dugtrio.body.onWorldBounds = new Phaser.Signal();
      dugtrio.body.onWorldBounds.add(function(sprite, up, down, left, right){

        // Collision against the left world bound
        if(left){

          sprite.body.velocity.x = gameOptions.enemySpeed;
          // Flip the sprites
          sprite.scale.x = -1;
        }

        if(right){
          sprite.body.velocity.x = -gameOptions.enemySpeed;
          // Keep the sprite facing it's original direction (left)
          sprite.scale.x = 1;
        }
      });

      // Add to the enemy group
      this.enemyGroup.add(dugtrio);
    }
  },

  addRhydon: function(){
    // Generate X & Y placement for rhydon enemy
    var rhydonX = game.rnd.integerInRange(50, game.width - 50);
    var rhydonY = this.highestFloorY - 25;

    if(this.rhydonPool.length > 0){
      var rhydon = this.rhydonPool.pop();
      rhydon.x = rhydonX;
      rhydon.y = rhydonY;
      rhydon.revive();
    }

    else{
      var rhydon = game.add.sprite(rhydonX, rhydonY, "rhydon");
      var rhydonAnimation = rhydon.animations.add("walk");
      // .play("name of animations", frames per second, loop(true or false))
      rhydon.animations.play("walk", 15, true);
      rhydon.anchor.set(0.5);
      game.physics.enable(rhydon, Phaser.Physics.ARCADE);
      rhydon.body.immovable = true;

      rhydon.body.collideWorldBounds = true;
      rhydon.body.velocity.x = gameOptions.enemySpeed;

      rhydon.body.onWorldBounds = new Phaser.Signal();
      rhydon.body.onWorldBounds.add(function(sprite, up, down, left, right){

        if(left){

          sprite.body.velocity.x = gameOptions.enemySpeed;
          sprite.scale.x = -1;
        }

        if(right){

          sprite.body.velocity.x = -gameOptions.enemySpeed;
          sprite.scale.x = 1;
        }
      });

      this.enemyGroup.add(rhydon);
    }

    addCoin: function(creationPoint){

      // Coins wont appear on every platform
      if(game.rnd.integerInRange(0, gameOptions.coinRatio) != 0 || creationPoint != null){
        // randomly generate X coordinates
        var coinX = game.rnd.integerInRange(50, game.width - 50);
        // y coordinate is always in the middle of platforms (making the player jump for it)
        var coinY = this.highestFloorY - gameOptions.floorGap / 2;
        // If the creationPoint is not null, coordinates are ready to spawn a coin
        if(creationPoint != null){
          // Overite the X & Y variables
          coinX = creationPoint.x;
          coinY = creationPoint.y;
        }

        // Check the pool and add sprites
        if(this.coinPool.length > 0){

          var coin = this.coinPool.pop();
          coin.x = coinX;
          coin.y = coinY;
          coin.revive();
        }

        else{
          var coin = game.add.sprite(coinX, coinY, "coin");
          // Adding animations
          var coinAnimation = coin.animations.add("rotate");
          // .play("name of animations", frames per second, loop(true or false))
          coin.animations.play("rotate", 15, true);
          coin.anchor.set(0.5);
          game.physics.enable(coin, Phaser.Physics.ARCADE);
          coin.body.immovable = true;
          this.coinGroup.add(coin);
        }
      }
    },

    addGrimer: function(){
      // Only one grimer per platform unless grimerRatio occurs
      var grimerPlaces = 1;
      if(game.rnd.integerInRange(0, gameOptions.grimerRatio) == 0){
        grimerPlaces = 2;
      }

      for(var i = 1; i <= grimerPlaces; i++){
        // X position can't be in a safeZone of a ladder
        var grimerXPosition = this.findSafePosition();
        var grimerYPosition = this.highestFloorY - 20;

        if(grimerXPosition){
          if(this.grimerPool.length > 0){
            var grimer = this.grimerPool.pop();
            grimer.x = grimerXPosition;
            grimer.y = grimerYPosition;
            grimer.revive();
          }

          else{
            var grimer = game.add.sprite(grimerXPosition, grimerYPosition, "grimer");
            var grimerAnimation = grimer.animations.add("rotate");
            grimer.animations.play("rotate", 15, true);
            grimer.anchor.set(0.5, 0);
            game.physics.enable(grimer, Phaser.Physics.ARCADE);
            grimer.body.immovable = true;
            this.enemyGroup.add(grimer);
          }
        }
      }
    },

    addRapidash: function(){
      // Only 1 rapidash per platform unless grimerRatio is true
      var rapidashPlaces = 1;
      if(game.rnd.integerInRange(0, gameOptions.grimerRatio) == 0){
        rapidashPlaces = 2;
      }

      for(var i = 1; i <= rapidashPlaces; i++){
        // Generate X, Y coordinates
        var rapidashXPosition = this.findSafePosition();
        var rapidashYPosition = this.highestFloorY - 58;

        // Check pool or add sprites once coordinates are generated
        if(rapidashXPosition){
          if(this.rapidashPool.length > 0){
            var rapidash = this.rapidashPool.pop();
            rapidash.x = rapidashXPosition;
            rapidash.y = rapidashYPosition;
            rapidash.revive();
          }

          else{
            var rapidash = game.add.sprite(rapidashXPosition, rapidashYPosition, "rapidash");
            var rapidashAnimation = rapidash.animations.add("burn");
            rapidash.animations.play("burn", 15, true);
            rapidash.anchor.set(0.5, 0);
            game.physics.enable(rapidash, Phaser.Physics.ARCADE);
            rapidash.body.immovable = true;
            this.enemyGroup.add(rapidash);
          }
        }
      }
    },

    findSafePosition: function(){
      // Count attempts for when looking for a safe position
      var attempts = 0;
      do{
        attempts++;
        // 150px margin from world bounds
        var posX = game.rnd.integerInRange(150, game.width - 150);
        // If no safe positions are found within 10 tries, it probably doesn't exist
      } while(!this.isSafe(posX) && attempts < 10);

      if(this.isSafe(posX)){
        // Add the new safe range to the safeZone array
        this.safeZone.push({
          start: posX - gameOptions.safeRadius,
          end: posX + gameOptions.safeRadius
        });
        return posX;
      }
      // Return false if no safe zones were found
      return false;
    },

    isSafe: function(n){

      // Loop through all the safeZone array items
      for(var i = 0; i < this.safeZone.length; i++){
        // If the x coordinate was found in the array return true, if not, return false
        if(n > this.safeZone[i].start && n < this.safeZone[i].end){
          return false;
        }
      }
      return true;
    },

    addPlayer: function(){

      // Adding the player sprite
      this.player = game.add.sprite(game.width / 2, game.height * gameOptions.floorGap - 48, "player");
      // Adding separate walk and climb animations
      this.player.animations.add("walk", [0, 3]);
      this.player.animations.add("climb", [4, 5]);

      // Making it loop through the walk frames
      this.player.animations.play("walk", 15, true);

      // Add player to gameGroup, anchor it, enable ARCADE physics
      this.gameGroup.add(this.player);
      this.player.anchor.set(0.5, 0);
      game.physics.enable(this.player, Phaser.Physics.ARCADE);

      // Allow player to collide with world bounds, apply gravity, and set its speed
      this.player.body.collideWorldBounds = true;
      this.player.body.gravity.y = gameOptions.playerGravity;
      this.player.body.velocity.x = gameOptions.playerSpeed;

      // Reverse its direction when colliding with world bounds
      this.player.body.onWorldBounds = new Phaser.Signal();
      this.player.body.onWorldBounds.add(function(sprite, up, down, left, right){

        if(left){

          this.player.body.velocity.x = gameOptions.playerSpeed;
          this.player.scale.x = -1;
        }

        if(right){

          this.player.body.velocity.x = -gameOptions.playerSpeed;
          this.player.scale.x = 1;
        }

        // Collision against the bottom bound of the game
        if(down){

          // Sets a key-value or update it if it exists. This updates the high score and coins collected
          localStorage.setItem(gameOptions.localStorageName,JSON.stringify({
            score: Math.max(this.reachedFloor, this.savedData.score),
            coins: this.collectedCoins + this.savedData.coins
          }));

          // restart the game after losing and updating
          game.state.start("PlayGame");
        }
      }, this)
    },

    handleTap: function(){

      // If the menu is still in the game
      if(this.menuGroup != null){

        // Remove it
        this.menuGroup.destroy();
      }

      // The hero can jump when it's not already jumping and when you're not on a ladder
      if(this.canJump && !this.isClimbing && !this.gameOver){
        // Apply vertical velocity
        this.player.body.velocity.y = -gameOptions.playerJump;
        // Play jump audio
        this.jumpSound.play();
        // Cannot jump if currently jumping
        this.canJump = false;
      }
    },

    // Update method fires every frame
    update: function(){
      if(!this.gameOver){
        // Methods that do whats in their name
        this.fireShell();
        this.checkFloorCollision();
        this.checkLadderCollision();
        this.checkCoinCollision();
        this.checkEnemyCollision();
        this.checkShellCollision();
      }
    },

    fireShell(){

      // Loop through all the shellGroup children that have subItems
      this.shellGroup.forEach(function(item){
        // Check for similar vertical position
        if(Math.abs(item.y - this.player.y) < 10){
          // Check if the shell is firing
          if(!item.isFiring){
            // Delay to firing shell, and when to execute the callback function
            game.time.events.add(game.rnd.integerInRange(500, 1500), function(){
              item.body.velocity.x = gameOptions.shellSpeed * item.scale.x;
            }, this);
            // Arrow is firing
            item.isFiring = true;
          }
          return;
        }
      }, this)
    },

    // Check for collision between platform and player
    checkFloorCollision: function(){
      // Check if player is on a vine
      if(!this.isClimbing){

        game.physics.arcade.overlap(this.player, this.vineGroup, function(player, vine){
          // If close enough, the player will climb that vine
          if(Math.abs(player.x - vine.x) < 10){
            this.vineToClimb = vine;
            // Stop moving the player horizontally, turn off the gravity, play the climb animation
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = -gameOptions.climbSpeed;
            this.player.body.gravity.y = 0;
            this.isClimbing = true;
            this.player.animations.play("climb", 15, true);

            // Move the level down
            if(this.scrollTween.isRunning){
              this.tweensToGo ++;
            }
            else{
              this.scrollTween.start();
            }
          }
        }, null, this);
      }
      // If the hero is already climbing
      else{
        if(this.player.y < this.ladderToClimb.y - 40){
          // Restore all the player attributes you turned off during the climb
          this.player.body.gravity.y = gameOptions.playerGravity;
          this.player.body.velocity.x = gameOptions.playerSpeed * this.player.scale.x;
          this.player.body.vlocity.y = 0;
          this.isClimbing = false;
          this.player.animations.play("walk", 15, true);

          // Add to the reachedFloor
          this.reachedFloor ++;
          this.scoreText.text = this.reachedFloor.toString();
        }
      }
    },

    checkCoinCollision: function(){
      // Same collision methods as with ladders but adding the particle emitter
      game.physics.arcade.overlap(this.hero, this.coinGroup, function(player, coin){

        // Place the emitter at the same coordinates of the coin
        this.emitter.x = coin.x;
        this.emitter.y = coin.y;

        // 1: burst out all at once(true) or at a frequency
        // 2: How long a particle lasts in milliseconds
        // 3: How often to emit a particle (null is all at once for explosions)
        // 4: How many particles to launch)
        this.emitter.start(true, 1000, null, 20);

        // Update coins collected
        this.collectedCoins ++;
        // Destroy the coin
        this.killCoin(coin);
        // Play the coin sound
        this.coinSound.play();
      }, null, this);
    },

    checkShellCollision: function(){

        game.physics.arcade.overlap(this.player, this.shellGroup, function(player, shell){

          // A shell isn't always deadly. Only when collision occurs after it fires
          if(shell.body.velocity.x != 0){
            this.prepareToGameOver();
          }
        }, null, this);
    },

    checkEnemyCollision: function(){
      // We want dugtrios to be able to be jumped on and spawn coins
      // Any other collision with enemies / deadly objects will result in game over
      game.physics.arcade.collide(this.player, this.enemyGroup, function(player, enemy){
        if(enemy.key != "dugtrio"){
          this.prepareToGameOver();
        }
        else{
          // If the bottom of the player touches the top of dugtrio's head
          if(enemy.body.touching.up && player.bofy.touching.down){
            this.player.body.velocity.y = -gameOptions.playerJump;
            this.jumpSound.play();
            this.addCoin(enemy.position);
            // Remove dugtrio
            this.killMonster(enemy);
          }
          else{
            // If player collides anywhere else besides the head
            this.prepareToGameOver();
          }
        }
      }, null, this);
    },

    prepareToGameOver: function(){
      // Games over, ya lost
      this.gameOver = true;
      // It hurts, I know
      this.hurtSound.play();
      this.player.body.velocity.x = game.rnd.integerInRange(-20, 20);
      // Player 'jumps' and falls to the bottom of the screen hitting the kill floor and restarting the game
      this.player.body.velocity.y = -gameOptions.playerJump;
      this.player.body.gravity.y = gameOptions.playerGravity;
    },

    killPlatform: function(platform){
      // Kill and insert another sprite into the pool
    platform.kill();
      this.platformPool.push(platform);
    },

    killVine: function(vine){
      vine.kill();
      this.vinePool.push(vine);
    },

    killCoin: function(coin){
      coin.kill();
      this.coinPool.push(coin);
    },

    killGrimer: function(grimer){
      grimer.kill();
      this.grimerPool.push(grimer);
    },

    killRapidash: function(rapidash){
      rapidash.kill();
      this.rapidashPool.push(rapidash);
    },

    killShell: function(shell){
      shell.kill();
      this.shellPool.push(shell);
    },

    killDugtrio: function(dugtrio){
      dugtrio.kill();
      this.dugtrioPool.push(dugtrio);
    },

    killRhydon: function(rhydon){
      rhydon.kill();
      this.rhydonPool.push(rhydon);
    }
  }
}
