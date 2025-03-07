// Add seenTutorialFlag to track if the user has already seen the tutorial
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
let seenTutorialFlag = false;

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

// Add tutorial variables
let tutorialActive = false;
let tutorialStep = 0;
let tutorialSteps = [];
let skipTutorialButton;
let nextTutorialButton;
let prevTutorialButton;

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
  myPet.pause()
  
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
  
  // If no saved game exists and tutorial hasn't been seen, start tutorial
  if (!gameStorage.hasSavedGame() && !seenTutorialFlag) {
    startTutorial();
  }
  
  // Initialize tutorial steps
  initTutorialSteps();
}

function initTutorialSteps() {
  tutorialSteps = [
    {
      title: "Welcome!",
      text: "Welcome to your virtual pet game! This tutorial will show you the basics of taking care of your pet.",
      highlight: null, // No specific element to highlight
      position: "center"
    },
    {
      title: "Meet Your Pet",
      text: "This is your pet! Tap or click on it to interact. Your pet needs attention to stay happy.",
      highlight: "pet",
      position: "top"
    },
    {
      title: "Status Panel",
      text: "This panel shows your pet's health, energy, hunger and mood. Keep an eye on these stats to keep your pet healthy!",
      highlight: "status",
      position: "left"
    },
    {
      title: "Feed Your Pet",
      text: "Your pet gets hungry over time. The feed table in the bottom left contains food. Your pet will eat automatically when hungry.",
      highlight: "feed",
      position: "bottom"
    },
    {
      title: "Pet's House",
      text: "This is your pet's house. When your pet gets tired, tap the house to let them rest and recover energy.",
      highlight: "house",
      position: "right"
    },
    {
      title: "Shop",
      text: "Buy items for your pet in the Shop using coins you earn by interacting with your pet.",
      highlight: "shop",
      position: "bottom"
    },
    {
      title: "Inventory",
      text: "Access your purchased items in the Inventory. Use food items to feed your pet.",
      highlight: "inventory",
      position: "bottom"
    },
    {
      title: "Backgrounds",
      text: "Change your pet's environment with different background themes you can purchase in the shop.",
      highlight: "backgrounds",
      position: "bottom"
    },
    {
      title: "Settings",
      text: "Access game settings, save your progress, and more by tapping the gear icon in the top-right corner.",
      highlight: "settings",
      position: "top-right"
    },
    {
      title: "Ready to Play!",
      text: "You're all set! Remember to save your game regularly and take good care of your pet!",
      highlight: null,
      position: "center"
    }
  ];
}

function startTutorial() {
  tutorialActive = true;
  tutorialStep = 0;
  
  // Create tutorial navigation buttons
  createTutorialButtons();
}

function endTutorial() {
  tutorialActive = false;
  tutorialStep = 0;
  seenTutorialFlag = true; // Mark tutorial as seen
  
  // Remove tutorial buttons if they exist
  if (skipTutorialButton) {
    skipTutorialButton.remove();
    skipTutorialButton = null;
  }
  
  if (nextTutorialButton) {
    nextTutorialButton.remove();
    nextTutorialButton = null;
  }
  
  if (prevTutorialButton) {
    prevTutorialButton.remove();
    prevTutorialButton = null;
  }
  myPet.resume();
}

function createTutorialButtons() {
  // Calculate responsive dimensions
  const buttonWidth = min(width * 0.2, 150); // Fixed button width based on screen size
  const buttonHeight = min(height * 0.05, 40);
  const buttonPadding = min(width, height) * 0.01;
  const bottomMargin = height * 0.08;
  const buttonFontSize = max(12, min(width, height) * 0.018) + "px";
  
  // Calculate positions to ensure equal spacing
  const totalWidth = buttonWidth * 3 + buttonWidth; // 3 buttons plus spacing
  const startX = (width - totalWidth) / 2;
  
  // Previous button
  prevTutorialButton = createButton("← Back");
  prevTutorialButton.position(startX, height - bottomMargin);
  prevTutorialButton.size(buttonWidth, buttonHeight);
  prevTutorialButton.mousePressed(() => {
    tutorialStep = max(tutorialStep - 1, 0);
    // Restore next button functionality if moved back from last step
    if (tutorialStep < tutorialSteps.length - 1) {
      nextTutorialButton.html("Next →");
      nextTutorialButton.mousePressed(() => {
        tutorialStep = min(tutorialStep + 1, tutorialSteps.length - 1);
        if (tutorialStep === tutorialSteps.length - 1) {
          nextTutorialButton.html("Finish");
          nextTutorialButton.mousePressed(endTutorial);
        }
      });
    }
  });
  prevTutorialButton.style("background-color", "#555555");
  prevTutorialButton.style("color", "white");
  prevTutorialButton.style("border", "none");
  prevTutorialButton.style("padding", buttonPadding + "px");
  prevTutorialButton.style("border-radius", "4px");
  prevTutorialButton.style("cursor", "pointer");
  prevTutorialButton.style("font-size", buttonFontSize);
  prevTutorialButton.style("text-align", "center");
  
  // Next button
  nextTutorialButton = createButton("Next →");
  nextTutorialButton.position(startX + buttonWidth * 1.5, height - bottomMargin);
  nextTutorialButton.size(buttonWidth, buttonHeight);
  nextTutorialButton.mousePressed(() => {
    tutorialStep = min(tutorialStep + 1, tutorialSteps.length - 1);
    // If last step, change button text
    if (tutorialStep === tutorialSteps.length - 1) {
      nextTutorialButton.html("Finish");
      nextTutorialButton.mousePressed(endTutorial);
    }
  });
  nextTutorialButton.style("background-color", "#4CAF50");
  nextTutorialButton.style("color", "white");
  nextTutorialButton.style("border", "none");
  nextTutorialButton.style("padding", buttonPadding + "px");
  nextTutorialButton.style("border-radius", "4px");
  nextTutorialButton.style("cursor", "pointer");
  nextTutorialButton.style("font-size", buttonFontSize);
  nextTutorialButton.style("text-align", "center");
  
  // Skip button
  skipTutorialButton = createButton("Skip Tutorial");
  skipTutorialButton.position(startX + buttonWidth * 3, height - bottomMargin);
  skipTutorialButton.size(buttonWidth, buttonHeight);
  skipTutorialButton.mousePressed(endTutorial);
  skipTutorialButton.style("background-color", "#ff5555");
  skipTutorialButton.style("color", "white");
  skipTutorialButton.style("border", "none");
  skipTutorialButton.style("padding", buttonPadding + "px");
  skipTutorialButton.style("border-radius", "4px");
  skipTutorialButton.style("cursor", "pointer");
  skipTutorialButton.style("font-size", buttonFontSize);
  skipTutorialButton.style("text-align", "center");
  
  // Hide previous button on first step
  if (tutorialStep === 0) {
    prevTutorialButton.style("visibility", "hidden");
  }
}

function updateTutorialButtonsVisibility() {
  if (!tutorialActive) return;
  
  // Show/hide previous button based on current step
  if (tutorialStep === 0) {
    prevTutorialButton.style("visibility", "hidden");
  } else {
    prevTutorialButton.style("visibility", "visible");
  }
  
  // Update next button text on last step
  if (tutorialStep === tutorialSteps.length - 1) {
    nextTutorialButton.html("Finish");
  } else {
    nextTutorialButton.html("Next →");
  }
}

function displayTutorial() {
  if (!tutorialActive || tutorialSteps.length === 0) return;
  
  // Get current step data
  const step = tutorialSteps[tutorialStep];
  
  // Draw semi-transparent overlay
  fill(0, 150);
  noStroke();
  rect(0, 0, width, height);

  // Opacity for highlighted elements
  let opacity = 120;
  
  // Create cutout/highlight for the relevant element
  drawingContext.globalCompositeOperation = 'destination-out';
  
  // Highlight the appropriate element based on the current step
  if (step.highlight) {
    switch(step.highlight) {
      case "pet":
        // Highlight pet with a semi-transparent circle
        if (myPet) {
          fill(255, 120);
          noStroke();
          ellipse(myPet.x, myPet.y, myPet.size * 1.5);
        }
        break;
      case "status":
        // Highlight status panel with semi-transparency
        fill(255, 120);
        noStroke();
        rect(0, height - myBorder.panelHeight, myBorder.statusSectionWidth, myBorder.panelHeight, 10);
        break;
      case "feed":
        // Calculate feed position
        let playArea = myBorder.getPlayableArea();
        let feedX = playArea.x + playArea.width * 0.1;
        let feedY = playArea.y + playArea.height * 0.8;
        let feedWidth = playArea.width * feed.tableScale;
        let feedHeight = feedWidth * 0.3;
        
        // Highlight feed table with semi-transparency
        fill(255, 120);
        noStroke();
        rect(feedX - 20, feedY - 20, feedWidth + 40, feedHeight + 40, 10);
        break;
      case "house":
        // Highlight house with semi-transparency
        if (house) {
          fill(255, 120);
          noStroke();
          let housePos = house.getPosition();
          rectMode(CENTER);
          rect(housePos.x, housePos.y * 0.90, house.width * 1.4, house.height * 1.4, 10);
          rectMode(CORNER);
        }
        break;
      case "shop":
        // Find shop button with semi-transparency
        for (let button of myBorder.buttons) {
          if (button.type === "shop") {
            fill(255, 120);
            noStroke();
            ellipse(button.x, button.y, button.width * 1.5);
            break;
          }
        }
        break;
      case "inventory":
        // Find inventory button with semi-transparency
        for (let button of myBorder.buttons) {
          if (button.type === "inventory") {
            fill(255, 120);
            noStroke();
            ellipse(button.x, button.y, button.width * 1.5);
            break;
          }
        }
        break;
      case "backgrounds":
        // Find backgrounds button with semi-transparency
        for (let button of myBorder.buttons) {
          if (button.type === "backgrounds") {
            fill(255, 120);
            noStroke();
            ellipse(button.x, button.y, button.width * 1.5);
            break;
          }
        }
        break;
      case "settings":
        // Highlight settings gear with semi-transparency
        fill(255, 120);
        noStroke();
        ellipse(width - settingsButtonSize/2 - settingsButtonPadding, 
                settingsButtonSize/2 + settingsButtonPadding, 
                settingsButtonSize * 1.5);
        break;
      default:
        break;
    }
  }
  
  // Reset composite operation
  drawingContext.globalCompositeOperation = 'source-over';
  
  // Draw tutorial dialog
  let dialogWidth = min(width * 0.8, 500);
  let dialogHeight = 180;
  let dialogX = width / 2 - dialogWidth / 2;
  let dialogY;
  
  // Position dialog based on position property
  switch (step.position) {
    case "top":
      dialogY = 50;
      break;
    case "bottom":
      dialogY = height - dialogHeight - 100;
      break;
    case "left":
      dialogY = height / 2 - dialogHeight / 2;
      break;
    case "right":
      dialogY = height / 2 - dialogHeight / 2;
      break;
    case "top-right":
      dialogY = 50;
      dialogX = width - dialogWidth - 20;
      break;
    default: // center
      dialogY = height / 2 - dialogHeight / 2;
      break;
  }
  
  // Draw semi-transparent dialog box
  fill(255, 250, 240, 230);
  stroke(60, 100, 150, 200);
  strokeWeight(2);
  rect(dialogX, dialogY, dialogWidth, dialogHeight, 15);
  
  // Draw title
  noStroke();
  fill(60, 100, 150);
  textSize(22);
  textAlign(CENTER, TOP);
  text(step.title, dialogX + dialogWidth / 2, dialogY + 20);
  
  // Draw divider line
  stroke(200, 200, 200, 200);
  strokeWeight(1);
  line(dialogX + 20, dialogY + 55, dialogX + dialogWidth - 20, dialogY + 55);
  
  // Draw text
  fill(60, 60, 80);
  noStroke();
  textSize(18);
  textAlign(LEFT, TOP);
  textWrap(WORD);
  text(step.text, dialogX + 30, dialogY + 70, dialogWidth - 60);
  
  // Update navigation buttons visibility
  updateTutorialButtonsVisibility();
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

      // Load tutorial flag
      if (savedData.hasOwnProperty('seenTutorial')) {
        seenTutorialFlag = savedData.seenTutorial;
      } else {
        seenTutorialFlag = true; // Assume already seen for existing saves
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
    shop: shop,
    seenTutorial: seenTutorialFlag // Save tutorial flag
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
  
  // If tutorial is active, display it on top of everything
  if (tutorialActive) {
    displayTutorial();
    return; // Skip other UI elements when tutorial is active
  }
  
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
  const buttonsCount = 3; // Reduced from 4 to 3
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
  
  // Draw menu buttons - removed Instructions button
  const buttonOptions = [
    { label: "Save Game", color: color(50, 150, 50) },
    { label: "Clear Save", color: color(200, 100, 50) },
    { label: "Start New Game", color: color(70, 120, 200) }
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
  const buttonsCount = 3; // Reduced from 4 to 3
  const menuHeight = buttonHeight * buttonsCount + spacing * (buttonsCount + 2);
  
  const menuX = width / 2 - menuWidth / 2;
  const menuY = height / 2 - menuHeight / 2;
  
  const btnWidth = menuWidth * 0.8;
  const btnX = width / 2 - btnWidth / 2;
  
  for (let i = 0; i < 3; i++) { // Loop through 3 buttons
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
            let playArea = myBorder.getPlayableArea();
            myPet = new Pet(playArea.width / 2, playArea.height / 2);
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
            setTimeout(() => {
              msg.remove();
              // Only start tutorial if it hasn't been seen before
              if (!seenTutorialFlag) {
                startTutorial();
              }
            }, 1500);
          }
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
  // During tutorial, only handle tutorial navigation buttons
  if (tutorialActive) {
    // Button handling is managed by the p5 buttons
    return false;
  }
  
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
  
  // Reposition tutorial buttons if active
  if (tutorialActive) {
    if (skipTutorialButton) {
      skipTutorialButton.position(width - 120, height - 50);
    }
    if (nextTutorialButton) {
      nextTutorialButton.position(width/2 + 50, height - 50);
    }
    if (prevTutorialButton) {
      prevTutorialButton.position(width/2 - 100, height - 50);
    }
  }
}