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

// Global flag for showing the backgrounds menu
let backgroundMenuVisible = false;

// Global flag for checking for game over
let gameOver = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Force 60 FPS
  frameRate(60);
  
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
    onDoubleTap: (x, y) => {
      // Check if double-tapped on pet (change color)
      let d = dist(x, y, myPet.x, myPet.y);
      if (d < myPet.size / 2) {
        myPet.changeColor();
        
        // Add some colorful hearts and award a bonus
        const currentTime = millis();
        myPet.heartSchedule.push(
          { time: currentTime + 100, colorful: true },
          { time: currentTime + 200, colorful: true },
          { time: currentTime + 300, colorful: true }
        );
        currency.addCoins(10, "made pet happy");
      }
      // Otherwise check if house was double-tapped to toggle resting state
      else if (house.contains(x, y)) {
        if (house.isPetResting()) {
          // If pet is resting, make it leave and return to default position.
          house.petLeave();
          myPet.x = myPet.targetX;
          myPet.y = myPet.targetY;
          console.log("House tapped: pet is leaving the house.");
        } else {
          // If pet is active, send it to rest in the house.
          const restingPos = house.petEnter(myPet);
          myPet.x = restingPos.x;
          myPet.y = restingPos.y;
          console.log("House tapped: pet is entering the house to rest.");
          currency.addCoins(15, "pet is resting");
        }
      }
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

function mousePressed() {
  if (gameOver) {
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