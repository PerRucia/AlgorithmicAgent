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

// Settings button properties
let settingsButtonSize = 40;
let settingsButtonPadding = 10;

// Global flag for showing the settings menu
let settingsMenuVisible = false;

// Global flag for showing the instructions dialog
let instructionsDialogVisible = false;

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
  
  // Draw settings button in top-right corner
  drawSettingsButton();
  
  // If the instructions dialog should be visible, draw it
  if (instructionsDialogVisible) {
    displayInstructionsDialog();
  }
  // If the settings menu should be visible, draw it
  else if (settingsMenuVisible) {
    drawSettingsMenu();
  }
  // If the backgrounds menu should be visible, draw it on top.
  else if (backgroundMenuVisible) {
    drawBackgroundMenu();
  }
  else if (shop.visible) {
    shop.display();
  }
  else if (inventory.visible) {
    inventory.display();
  }
}

// Draw settings button in top-right corner (gear icon)
function drawSettingsButton() {
  const btnX = width - settingsButtonSize - settingsButtonPadding;
  const btnY = settingsButtonPadding;
  
  push();
  // Button background
  fill(50, 100, 200);
  stroke(255);
  strokeWeight(2);
  rect(btnX, btnY, settingsButtonSize, settingsButtonSize, 5);
  
  // Draw gear icon
  fill(255);
  noStroke();
  
  // Draw gear center
  const centerX = btnX + settingsButtonSize / 2;
  const centerY = btnY + settingsButtonSize / 2;
  const outerRadius = settingsButtonSize * 0.35;
  const innerRadius = settingsButtonSize * 0.2;
  
  // Draw center circle
  ellipse(centerX, centerY, innerRadius * 2);
  
  // Draw gear teeth
  const teethCount = 8;
  for (let i = 0; i < teethCount; i++) {
    const angle = TWO_PI * i / teethCount;
    const tipX = centerX + cos(angle) * outerRadius;
    const tipY = centerY + sin(angle) * outerRadius;
    const baseX1 = centerX + cos(angle - 0.2) * innerRadius;
    const baseY1 = centerY + sin(angle - 0.2) * innerRadius;
    const baseX2 = centerX + cos(angle + 0.2) * innerRadius;
    const baseY2 = centerY + sin(angle + 0.2) * innerRadius;
    
    // Draw each tooth as a triangle
    triangle(tipX, tipY, baseX1, baseY1, baseX2, baseY2);
  }
  pop();
}

// Check if settings button was clicked
function isSettingsButtonPressed(x, y) {
  const btnX = width - settingsButtonSize - settingsButtonPadding;
  const btnY = settingsButtonPadding;
  
  return (x > btnX && x < btnX + settingsButtonSize && 
          y > btnY && y < btnY + settingsButtonSize);
}

// Draw settings menu with options
function drawSettingsMenu() {
  push();
  // Semi-transparent dark overlay covering the whole screen
  fill(0, 150);
  noStroke();
  rect(0, 0, width, height);
  
  // Menu panel dimensions
  const menuWidth = min(width * 0.8, 400);
  const buttonHeight = 40;
  const spacing = 15;
  const buttonsCount = 4;
  const menuHeight = buttonHeight * buttonsCount + spacing * (buttonsCount + 2);
  
  // Menu position
  const menuX = width / 2 - menuWidth / 2;
  const menuY = height / 2 - menuHeight / 2;
  
  // Draw menu background
  fill(240);
  stroke(50);
  strokeWeight(2);
  rect(menuX, menuY - spacing, menuWidth, menuHeight, 10);
  
  // Title
  textAlign(CENTER, TOP);
  fill(50, 80, 150);
  noStroke();
  textSize(24);
  text("Settings", width / 2, menuY - spacing * 0.25);
  
  // Draw menu buttons
  const buttonOptions = [
    { label: "Save Game", color: color(50, 150, 50) },
    { label: "Clear Save", color: color(200, 100, 50) },
    { label: "Start New Game", color: color(70, 120, 200) },
    { label: "Instructions", color: color(150, 50, 150) }
  ];
  
  for (let i = 0; i < buttonOptions.length; i++) {
    const btnY = menuY + spacing * (i + 1.5) + buttonHeight * i;
    const btnWidth = menuWidth * 0.8;
    const btnX = width / 2 - btnWidth / 2;
    
    // Button background
    fill(buttonOptions[i].color);
    stroke(30);
    strokeWeight(2);
    rect(btnX, btnY, btnWidth, buttonHeight, 8);
    
    // Button text
    textAlign(CENTER, CENTER);
    fill(255);
    noStroke();
    textSize(20);
    text(buttonOptions[i].label, btnX + btnWidth / 2, btnY + buttonHeight / 2);
  }
  pop();
}

// Display instructions dialog
function displayInstructionsDialog() {
  push();
  // Semi-transparent dark overlay covering the whole screen
  fill(0, 150);
  noStroke();
  rect(0, 0, width, height);
  
  // Dialog dimensions
  const dialogWidth = min(width * 0.9, 500);
  const dialogHeight = min(height * 0.8, 600);
  
  // Dialog position
  const dialogX = width / 2 - dialogWidth / 2;
  const dialogY = height / 2 - dialogHeight / 2;
  
  // Draw dialog background
  fill(245, 245, 255);
  stroke(50);
  strokeWeight(2);
  rect(dialogX, dialogY, dialogWidth, dialogHeight, 10);
  
  // Title
  textAlign(CENTER, TOP);
  fill(50, 80, 150);
  noStroke();
  textSize(28);
  text("Game Instructions", width / 2, dialogY + 20);
  
  // Close button
  const closeButtonSize = 30;
  fill(220, 50, 50);
  noStroke();
  rect(dialogX + dialogWidth - closeButtonSize - 15, dialogY + 15, closeButtonSize, closeButtonSize, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  text("X", dialogX + dialogWidth - closeButtonSize/2 - 15, dialogY + 15 + closeButtonSize/2);
  
  // Instructions text
  fill(60, 60, 80);
  textAlign(LEFT, TOP);
  textSize(18);
  textWrap(WORD);
  
  const margin = 30;
  const instructionsText = 
    "Welcome to the Algorithmic Agent pet game! Here's how to play:\n\n" +
    "• Pet Care: Keep your pet happy and healthy by feeding it regularly.\n\n" +
    "• Interactions: Touch/click your pet to interact with it.\n\n" +
    "• House: Your pet can rest in its house. Tap the house to make your pet enter or leave.\n\n" +
    "• Shop: Buy food and accessories for your pet with coins you earn.\n\n" +
    "• Inventory: Use items you've purchased from the inventory menu.\n\n" +
    "• Backgrounds: Change the environment by purchasing and selecting different backgrounds.\n\n" +
    "• Settings: Save your game progress or start a new game using the gear icon.\n\n" +
    "Remember to save your game regularly to keep your progress!";
  
  text(instructionsText, dialogX + margin, dialogY + 70, dialogWidth - margin*2);
  
  pop();
}

function handleInstructionsDialogClick(x, y) {
  // Dialog dimensions (must match the ones in displayInstructionsDialog)
  const dialogWidth = min(width * 0.9, 500);
  const dialogHeight = min(height * 0.8, 600);
  
  // Dialog position
  const dialogX = width / 2 - dialogWidth / 2;
  const dialogY = height / 2 - dialogHeight / 2;
  
  // Close button
  const closeButtonSize = 30;
  const closeX = dialogX + dialogWidth - closeButtonSize - 15;
  const closeY = dialogY + 15;
  
  // Check if clicking the close button
  if (x > closeX && x < closeX + closeButtonSize && 
      y > closeY && y < closeY + closeButtonSize) {
    instructionsDialogVisible = false;
    return true;
  }
  
  // Close dialog when clicking outside
  if (x < dialogX || x > dialogX + dialogWidth || 
      y < dialogY || y > dialogY + dialogHeight) {
    instructionsDialogVisible = false;
    return true;
  }
  
  return true; // Indicate that the click was handled
}

// Check if any settings menu button was pressed and handle it
function checkSettingsMenuButtons(x, y) {
  if (!settingsMenuVisible) return false;
  
  const menuWidth = min(width * 0.8, 400);
  const buttonHeight = 40;
  const spacing = 15;
  const buttonsCount = 4;
  const menuHeight = buttonHeight * buttonsCount + spacing * (buttonsCount + 2);
  
  const menuX = width / 2 - menuWidth / 2;
  const menuY = height / 2 - menuHeight / 2;
  
  const btnWidth = menuWidth * 0.8;
  const btnX = width / 2 - btnWidth / 2;
  
  for (let i = 0; i < 4; i++) { // Updated from 3 to 4
    const btnY = menuY + spacing * (i + 1.5) + buttonHeight * i;
    
    if (x > btnX && x < btnX + btnWidth && 
        y > btnY && y < btnY + buttonHeight) {
      
      switch(i) {
        case 0: // Save Game
          saveGameData();
          break;
        case 1: // Clear Save
          if (confirm("Are you sure you want to delete your saved game?")) {
            gameStorage.clearSavedGame();
            // Show confirmation message
            let msg = createDiv("Saved game deleted!");
            msg.position(width/2, height/2);
            msg.style('background-color', 'rgba(200, 50, 50, 0.8)');
            msg.style('color', 'white');
            msg.style('padding', '10px 20px');
            msg.style('border-radius', '5px');
            msg.style('font-size', '20px');
            msg.style('position', 'absolute');
            msg.style('transform', 'translate(-50%, -50%)');
            msg.style('z-index', '1000');
            setTimeout(() => msg.remove(), 1500);
          }
          break;
        case 2: // Start New Game
          if (confirm("Are you sure you want to start a new game? This will reset your current progress.")) {
            // Reset game state
            currency.resetBalance(900);
            inventory.reset();
            shop.reset();
            myPet = new Pet(width/2, height/2);
            let playArea = myBorder.getPlayableArea();
            myPet.setBoundaries(0, 0, playArea.width, playArea.height);
            house.setPet(myPet);
            interactHandler.setReferences(myPet, myBorder, playArea, house);
            
            // Show confirmation message
            let msg = createDiv("New game started!");
            msg.position(width/2, height/2);
            msg.style('background-color', 'rgba(70, 120, 200, 0.8)');
            msg.style('color', 'white');
            msg.style('padding', '10px 20px');
            msg.style('border-radius', '5px');
            msg.style('font-size', '20px');
            msg.style('position', 'absolute');
            msg.style('transform', 'translate(-50%, -50%)');
            msg.style('z-index', '1000');
            setTimeout(() => msg.remove(), 1500);
          }
          break;
        case 3: // Instructions
          instructionsDialogVisible = true;
          break;
      }
      
      // Close the settings menu after action
      settingsMenuVisible = false;
      return true;
    }
  }
  
  // Check if click is outside the menu to close it
  if (x < menuX || x > menuX + menuWidth || 
      y < menuY || y > menuY + menuHeight) {
    settingsMenuVisible = false;
    return true;
  }
  
  return false;
}

function mousePressed() {
  if (gameOver) {
    return false;
  }
  
  // Check if instructions dialog is visible and handle clicks
  if (instructionsDialogVisible) {
    handleInstructionsDialogClick(mouseX, mouseY);
    return false;
  }
  
  // Check if settings button was pressed
  if (isSettingsButtonPressed(mouseX, mouseY)) {
    settingsMenuVisible = !settingsMenuVisible;
    return false;
  }
  
  // Check if any settings menu button was pressed
  if (settingsMenuVisible) {
    checkSettingsMenuButtons(mouseX, mouseY);
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