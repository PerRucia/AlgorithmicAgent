let myPet;
let myBorder;
let feed;
let backgrounds;
let interactHandler;
let currency;
let lastPlaytimeReward = 0;
let house;
let shop;
let inventory;
let gameStorage;

// Global flag for showing the backgrounds menu
let backgroundMenuVisible = false;

// Global flag for checking for game over
let gameOver = false;

// Save button properties
let saveButtonSize = 40;
let saveButtonPadding = 10;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Force 60 FPS
  frameRate(60);

  // Initialize storage system
  gameStorage = new GameStorage();

  // Request device orientation permission on devices that require it (e.g., iOS)
  if (typeof DeviceOrientationEvent !== 'undefined' && 
    typeof DeviceOrientationEvent.requestPermission === 'function') {
    
    // Try to request permission immediately
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === "granted") {
          console.log("Gyroscope permission granted.");
        } else {
          console.log("Gyroscope permission denied.");
        }
      })
      .catch(error => {
        console.error("Gyroscope permission error:", error);
        
        // If failed (likely needs user gesture), create a temporary permission dialog
        let permissionDialog = createDiv("This app needs access to device motion. Tap anywhere to continue.");
        permissionDialog.position(0, 0);
        permissionDialog.style("width", "100%");
        permissionDialog.style("height", "100%");
        permissionDialog.style("background-color", "rgba(0, 0, 0, 0.8)");
        permissionDialog.style("color", "white");
        permissionDialog.style("text-align", "center");
        permissionDialog.style("padding-top", "40%");
        permissionDialog.style("font-size", "18px");
        permissionDialog.style("position", "absolute");
        permissionDialog.style("z-index", "1000");
        
        permissionDialog.mousePressed(() => {
          DeviceOrientationEvent.requestPermission()
            .then(response => {
              if (response === "granted") {
                console.log("Gyroscope permission granted.");
              } else {
                console.log("Gyroscope permission denied.");
              }
              permissionDialog.remove();
            });
        });
      });
  }
  
  // Create currency with initial balance
  currency = new Currency(900);

  // Create inventory
  inventory = new Inventory();
  
  // Setup currency callbacks if needed
  currency.setOnBalanceChangeCallback((balance, amount, type, reason) => {
    console.log(`Currency ${type}: ${amount} (${reason}). New balance: ${balance}`);
  });
  
  // Create backgrounds manager
  backgrounds = new Backgrounds();
  
  // Create and set up the border (bottom panel)
  myBorder = new Border();
  myBorder.setThickness(min(width, height) * 0.1);
  
  // Get playable area
  let playArea = myBorder.getPlayableArea();

  // Create feed and position it in the bottom left
  feed = new Feed();
  feed.foodServings = 5; 

  // Create shop
  shop = new Shop();
  shop.setReferences(inventory, currency);

  // Create pet at the center of the playable area
  myPet = new Pet(playArea.width / 2, playArea.height / 2);
  myPet.setBoundaries(0, 0, playArea.width, playArea.height);
  
  // Create house and position it in the bottom right
  house = new House();
  house.setPosition(playArea);
  house.setPet(myPet);
  
  // Initialize interaction handler
  interactHandler = new InteractHandler();
  interactHandler.setReferences(myPet, myBorder, playArea, house);
  
  // Set up interaction callbacks
  setupInteractionCallbacks();
  
  // Try to load saved game data
  loadGameData();
}

function loadGameData() {
  if (gameStorage.hasSavedGame()) {
    const savedData = gameStorage.loadGame();
    
    if (savedData) {
      // Load pet data
      if (savedData.pet) {
        myPet.health = savedData.pet.health;
        myPet.energy = savedData.pet.energy;
        myPet.happiness = savedData.pet.happiness;
        myPet.lastFed = savedData.pet.lastFed;
        myPet.color = savedData.pet.color;
      }
      
      // Load currency data
      if (savedData.currency) {
        currency.resetBalance(savedData.currency.balance);
      }
      
      // Load inventory data
      if (savedData.inventory && savedData.inventory.items) {
        inventory.items = savedData.inventory.items;
      }
      
      // Load background theme
      if (savedData.backgrounds && savedData.backgrounds.currentTheme) {
        backgrounds.setTheme(savedData.backgrounds.currentTheme);
      }
      
      // Load shop data (purchased backgrounds)
      if (savedData.shop && savedData.shop.backgroundItems) {
        shop.backgroundItems = savedData.shop.backgroundItems;
      }
      
      console.log("Game data loaded successfully!");
    }
  }
}

function saveGameData() {
  const gameData = {
    pet: myPet,
    currency: currency,
    inventory: inventory,
    backgrounds: backgrounds,
    shop: shop
  };
  
  const success = gameStorage.saveGame(gameData);
  
  if (success) {
    // Show a temporary save confirmation message
    let saveMsg = createDiv("Game Saved!");
    saveMsg.position(width/2, height/2);
    saveMsg.style('background-color', 'rgba(50, 200, 50, 0.8)');
    saveMsg.style('color', 'white');
    saveMsg.style('padding', '10px 20px');
    saveMsg.style('border-radius', '5px');
    saveMsg.style('font-size', '20px');
    saveMsg.style('position', 'absolute');
    saveMsg.style('transform', 'translate(-50%, -50%)');
    saveMsg.style('z-index', '1000');
    
    // Remove the message after 1.5 seconds
    setTimeout(() => {
      saveMsg.remove();
    }, 1500);
  }
}

function setupInteractionCallbacks() {
  interactHandler.setCallbacks({
    onPetInteract: (x, y) => {
      console.log("Pet interaction detected!");
      // Award a small coin bonus for interacting with pet
      currency.awardInteractionBonus(1);
    },
    onBorderInteract: (x, y) => {
      console.log("Border interaction detected");
    },
    onDrag: (x, y, dx, dy) => {
      // If dragging near the pet (active), make it follow the drag.
      let d = dist(x, y, myPet.x, myPet.y);
      if (d < myPet.size) {
        myPet.x = constrain(x, myPet.minX, myPet.maxX);
        myPet.y = constrain(y, myPet.minY, myPet.maxY);
        myPet.targetX = myPet.x;
        myPet.targetY = myPet.y;
      }
    }
  });
}

function draw() {
  // Get playable area
  let playArea = myBorder.getPlayableArea();
  
  // Draw the current background theme
  backgrounds.draw(playArea);
  
  // Draw the food table (Feed) in the bottom left of the playable area.
  feed.display(playArea);
  
  // Draw the house (should appear on top of the background)
  house.display(playArea);
  
  // Show house hover effects as before…
  if (house.contains(mouseX, mouseY)) {
    house.setHover(true);
    cursor(HAND);
  } else {
    house.setHover(false);
    cursor(ARROW);
  }
  
  // Update and draw pet if not resting
  myPet.update();
  myPet.display();
  
  // Display the border
  myBorder.display();
  
  // Draw save button in top-right corner
  drawSaveButton();
  
  // If the backgrounds menu should be visible, draw it on top.
  if (backgroundMenuVisible) {
    drawBackgroundMenu();
  }
  else if (shop.visible) {
    shop.display();
  }
  else if (inventory.visible) {
    inventory.display();
  }
}

// Draw save button in top-right corner
function drawSaveButton() {
  const btnX = width - saveButtonSize - saveButtonPadding;
  const btnY = saveButtonPadding;
  
  push();
  // Button background
  fill(50, 100, 200);
  stroke(255);
  strokeWeight(2);
  rect(btnX, btnY, saveButtonSize, saveButtonSize, 5);
  
  // Save icon (floppy disk symbol)
  fill(255);
  noStroke();
  // Outer shape of floppy
  rect(btnX + saveButtonSize * 0.2, btnY + saveButtonSize * 0.2, 
       saveButtonSize * 0.6, saveButtonSize * 0.6, 2);
  // Inner rectangle
  fill(50, 100, 200);
  rect(btnX + saveButtonSize * 0.3, btnY + saveButtonSize * 0.3, 
       saveButtonSize * 0.4, saveButtonSize * 0.2);
  pop();
}

// Check if save button was clicked
function isSaveButtonPressed(x, y) {
  const btnX = width - saveButtonSize - saveButtonPadding;
  const btnY = saveButtonPadding;
  
  return (x > btnX && x < btnX + saveButtonSize && 
          y > btnY && y < btnY + saveButtonSize);
}

function mousePressed() {
  if (gameOver) {
    return false;
  }
  
  // Check if save button was pressed
  if (isSaveButtonPressed(mouseX, mouseY)) {
    saveGameData();
    return false;
  }
  
  if (backgroundMenuVisible) {
    let themeKeys = Object.keys(backgrounds.themes);
    let buttonW = width * 0.3;
    let buttonH = 40;
    let startY = height / 2 - 50;
    
    // Check the inventory to see which backgrounds are unlocked.
    let unlockedBackgrounds = inventory.getItems("backgrounds");
    
    for (let i = 0; i < themeKeys.length; i++) {
      let btnX = width / 2 - buttonW / 2;
      let btnY = startY + i * (buttonH + 10);
      if (
        mouseX > btnX && mouseX < btnX + buttonW &&
        mouseY > btnY && mouseY < btnY + buttonH
      ) {
        // Check if the background is unlocked by looking into the inventory.
        let unlocked = false;
        for (let j = 0; j < unlockedBackgrounds.length; j++) {
          if (unlockedBackgrounds[j].id === themeKeys[i]) {
            unlocked = true;
            break;
          }
        }
        if (!unlocked) {
          console.log(`Theme "${themeKeys[i]}" is locked.`);
        } else {
          backgrounds.setTheme(themeKeys[i]);
          console.log(`Background set to: ${themeKeys[i]}`);
          backgroundMenuVisible = false;
        }
        return false;
      }
    }
    // If click outside buttons, close the menu.
    backgroundMenuVisible = false;
    return false;
  } 
  else if (shop.visible) {
    shop.handleMousePressed(mouseX, mouseY);
    return false;
  }
  else if (inventory.visible) {
    inventory.handleMousePressed(mouseX, mouseY);
    return false;
  }
  interactHandler.handleMousePressed(mouseX, mouseY);
  return false; // Prevent default behavior
}

function touchStarted() {
  // Call mousePressed() when touch starts
  mousePressed();
}

function touchMoved() {
  if (gameOver) {
    return false;
  }
  if (touches.length > 0) {
    interactHandler.handleTouchMove(touches[0].x, touches[0].y);
  }
  return false; // Prevent default
}

function touchEnded() {
  if (touches.length > 0) {
    interactHandler.handleTouchEnd(touches[0].x, touches[0].y);
  }
  return false; // Prevent default
}

// Draw the overlay menu for background themes.
function drawBackgroundMenu() {
    push();
    // Draw semi-transparent overlay
    fill(0, 150);
    noStroke();
    rect(0, 0, width, height);
    
    // Title
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Select Background Theme", width / 2, height / 2 - 100);
    
    // Get available themes from the backgrounds object.
    let themeKeys = Object.keys(backgrounds.themes);
    let buttonW = width * 0.3;
    let buttonH = 40;
    let startY = height / 2 - 50;
    
    // Get the user's unlocked background themes from inventory.
    let unlockedBackgrounds = inventory.getItems("backgrounds"); // array of backgrounds
    
    for (let i = 0; i < themeKeys.length; i++) {
      let btnX = width / 2 - buttonW / 2;
      let btnY = startY + i * (buttonH + 10);
      
      // Draw button base
      fill(200);
      rect(btnX, btnY, buttonW, buttonH, 5);
      
      // Check if this theme is unlocked:
      let unlocked = false;
      for (let j = 0; j < unlockedBackgrounds.length; j++) {
        if (unlockedBackgrounds[j].id === themeKeys[i]) {
          unlocked = true;
          break;
        }
      }
      
      if (!unlocked) {
        // Overlay with grey and lock symbol if not unlocked.
        fill(120, 120, 120, 150);
        rect(btnX, btnY, buttonW, buttonH, 5);
        
        fill(255);
        textSize(30);
        text("🔒", width / 2, btnY + buttonH / 2);
      } else {
        fill(0);
        textSize(20);
        text(themeKeys[i], width / 2, btnY + buttonH / 2);
      }
    }
    pop();
  }

// Update the windowResized function to include house resizing
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Update border
  myBorder.resize();
  
  // Update pet boundaries
  let playArea = myBorder.getPlayableArea();
  myPet.setBoundaries(0, 0, playArea.width, playArea.height);
  myPet.constrainPosition();
  
  // Update house position
  house.resize(playArea);
  
  // Update backgrounds
  backgrounds.resize();
}