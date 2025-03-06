let myPet;
let myBorder;
let backgrounds;
let interactHandler;
let currency; // Add currency variable
let lastPlaytimeReward = 0; // Track when we last gave playtime reward

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Force 60 FPS
  frameRate(60);
  
  // Create currency with initial balance
  currency = new Currency(100);
  
  // Setup currency callbacks if needed
  currency.setOnBalanceChangeCallback((balance, amount, type, reason) => {
    // You could add visual effects here when currency changes
    console.log(`Currency ${type}: ${amount} (${reason}). New balance: ${balance}`);
  });
  
  // Create backgrounds manager
  backgrounds = new Backgrounds();
  
  // Create and set up the border (bottom panel)
  myBorder = new Border();
  myBorder.setThickness(min(width, height) * 0.1);
  
  // Create pet at the center of the playable area
  let playArea = myBorder.getPlayableArea();
  myPet = new Pet(playArea.width / 2, playArea.height / 2);
  myPet.setBoundaries(0, 0, playArea.width, playArea.height);
  
  // Initialize interaction handler
  interactHandler = new InteractHandler();
  interactHandler.setReferences(myPet, myBorder, playArea);
  
  // Set up interaction callbacks
  setupInteractionCallbacks();
  
  // Award initial login bonus
  currency.awardDailyBonus(100);
}

function setupInteractionCallbacks() {
  interactHandler.setCallbacks({
    onPetInteract: (x, y) => {
      console.log("Pet interaction detected!");
      
      // Award a small coin bonus for interacting with pet
      currency.awardInteractionBonus(5);
    },
    onBorderInteract: (x, y) => {
      console.log("Border interaction detected");
    },
    onDoubleTap: (x, y) => {
      // If double tapped on pet, change its color
      let d = dist(x, y, myPet.x, myPet.y);
      if (d < myPet.size/2) {
        myPet.changeColor();
        
        // Add some colorful hearts
        myPet.addColorfulHeart();
        
        // Schedule more colorful hearts
        const currentTime = millis();
        myPet.heartSchedule.push(
          { time: currentTime + 100, colorful: true },
          { time: currentTime + 200, colorful: true },
          { time: currentTime + 300, colorful: true }
        );
        
        // Award a bonus for making the pet happy
        currency.addCoins(10, "made pet happy");
      }
    },
    onDrag: (x, y, dx, dy) => {
      // If dragging near pet, make it follow the drag
      let d = dist(x, y, myPet.x, myPet.y);
      if (d < myPet.size) {
        myPet.x = constrain(x, myPet.minX, myPet.maxX);
        myPet.y = constrain(y, myPet.minY, myPet.maxY);
        // Update target position to current position
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
  
  // Update pet
  myPet.update();
  
  // Draw pet
  myPet.display();
  
  // Display the border
  myBorder.display();
  
  // Check for playtime rewards (every minute)
  const currentTime = millis();
  if (currentTime - lastPlaytimeReward > 60000) { // 1 minute
    currency.awardPlaytimeBonus(1);
    lastPlaytimeReward = currentTime;
  }
}

function mousePressed() {
  interactHandler.handleMousePressed(mouseX, mouseY);
  return false; // Prevent default
}

function touchStarted() {
  if (touches.length > 0) {
    interactHandler.handleTouchStart(touches[0].x, touches[0].y);
  }
  return false; // Prevent default
}

function touchMoved() {
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

// Handle window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Update border
  myBorder.resize();
  
  // Update pet boundaries
  let playArea = myBorder.getPlayableArea();
  myPet.setBoundaries(0, 0, playArea.width, playArea.height);
  myPet.constrainPosition();
  
  // Update backgrounds
  backgrounds.resize();
}