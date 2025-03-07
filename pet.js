class Pet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    // Base size will be adjusted based on play area dimensions
    this.baseSize = 80;
    this.size = this.baseSize; // Initial size, will be adjusted in setBoundaries
    
    // Size scaling factors
    this.minSizeFactor = 0.5; // Minimum size as a fraction of baseSize
    this.maxSizeFactor = 1.5; // Maximum size as a fraction of baseSize
    this.sizeFactor = 1.0;    // Current size factor, will adjust based on play area

    // Initialize colors after p5 is ready
    this.initializeColors();

    // Keep the wobble/bounce effect
    this.wobble = 0;
    this.wobbleSpeed = 0.05;
    this.wobbleRange = 2; // a small vertical bounce

    // Blinking logic
    this.blinkTimer = 0;
    this.isBlinking = false;
    
    this.targetX = x; // Keep the target at the initial position
    this.targetY = y;
    
    // Keep boundary properties for constraining after window resize
    this.minX = 0;
    this.maxX = width;
    this.minY = 0;
    this.maxY = height;
    
    // Squish effect properties
    this.squishX = 1; // horizontal scale
    this.squishY = 1; // vertical scale
    this.isSquished = false;
    this.squishTimer = 0;
    
    // Heart particles array
    this.hearts = [];
    
    // Scheduled heart timers (instead of setTimeout)
    this.heartSchedule = [];
    
    // Add new meters for pet status
    this.health = 100;  // Health meter (0 to 100)
    this.energy = 100;  // Energy meter (0 to 100)
    this.hunger = 0;    // Hunger meter (0 to 100, where low means not hungry)
    this.mood = 100;    // Mood meter (0 to 100)
    this.isDead = false;

  }
  
  // Update setBoundaries to scale pet based on play area dimensions
  setBoundaries(minX, minY, maxX, maxY) {
    // Store the boundaries
    this.minX = minX + this.size/2;
    this.maxX = maxX - this.size/2;
    this.minY = minY + this.size/2;
    this.maxY = maxY - this.size/2;
    
    // Calculate play area dimensions
    const playAreaWidth = maxX - minX;
    const playAreaHeight = maxY - minY;
    
    // Calculate appropriate size based on play area
    // Use the smaller dimension to ensure pet fits in both dimensions
    const smallerDimension = min(playAreaWidth, playAreaHeight);
    
    // Scale the pet to be about 1/5 of the smaller dimension
    // but constrained between minSizeFactor and maxSizeFactor of baseSize
    const idealSizeFactor = smallerDimension / (this.baseSize * 5);
    this.sizeFactor = constrain(idealSizeFactor, this.minSizeFactor, this.maxSizeFactor);
    
    // Update pet size
    this.size = this.baseSize * this.sizeFactor;
    
    // Update the wobble range based on new size
    this.wobbleRange = this.size * 0.02; // 2% of pet size
    
    // Recalculate boundaries with new size
    this.minX = minX + this.size/2;
    this.maxX = maxX - this.size/2;
    this.minY = minY + this.size/2;
    this.maxY = maxY - this.size/2;
    
    console.log(`Pet size updated: ${this.size}px (factor: ${this.sizeFactor.toFixed(2)})`);
  }
  
  constrainPosition() {
    // Recenter the pet in the middle of the play area
    this.x = (this.minX + this.maxX) / 2;
    this.y = (this.minY + this.maxY) / 2;
    this.targetX = this.x;
    this.targetY = this.y;
  }
  
  display() {
    // Do not draw the pet if it's resting in the house.
    if (typeof house !== 'undefined' && house.isPetResting() && house.occupiedBy === this) {
      return;
    }
    
    // Draw floating hearts first
    this.displayHearts();
    
    push();
    translate(this.x, this.y);

    let bounce = sin(this.wobble) * this.wobbleRange;
    translate(0, bounce);

    // Apply squish effect
    scale(this.squishX, this.squishY);
    
    noStroke();
    fill(this.getColor());

    // -- Draw Ears --
    ellipse(-this.size * 0.25, -this.size * 0.55, this.size * 0.3, this.size * 0.3);
    ellipse(this.size * 0.25, -this.size * 0.55, this.size * 0.3, this.size * 0.3);

    // -- Draw Body --
    ellipse(0, 0, this.size, this.size * 0.8);

    // -- Draw Face --
    if (this.isDead) {
      // Draw X eyes when pet is dead
      stroke(0);
      strokeWeight(3 * this.sizeFactor);
      
      // Left X eye
      line(-this.size * 0.25, -this.size * 0.15, -this.size * 0.15, -this.size * 0.05);
      line(-this.size * 0.15, -this.size * 0.15, -this.size * 0.25, -this.size * 0.05);
      
      // Right X eye
      line(this.size * 0.15, -this.size * 0.15, this.size * 0.25, -this.size * 0.05);
      line(this.size * 0.25, -this.size * 0.15, this.size * 0.15, -this.size * 0.05);
      
      noStroke();
      
      // Draw a flat line for the mouth
      stroke(0);
      strokeWeight(3 * this.sizeFactor);
      line(-this.size * 0.15, this.size * 0.2, this.size * 0.15, this.size * 0.2);
      noStroke();
    } 
    else if (!this.isBlinking) {
      fill(255);
      ellipse(-this.size * 0.2, -this.size * 0.1, this.size * 0.2, this.size * 0.2);
      ellipse(this.size * 0.2, -this.size * 0.1, this.size * 0.2, this.size * 0.2);

      fill(0);
      ellipse(-this.size * 0.2, -this.size * 0.1, this.size * 0.1, this.size * 0.1);
      ellipse(this.size * 0.2, -this.size * 0.1, this.size * 0.1, this.size * 0.1);
    } else {
      stroke(0);
      strokeWeight(3);
      line(-this.size * 0.25, -this.size * 0.1, -this.size * 0.15, -this.size * 0.1);
      line(this.size * 0.15, -this.size * 0.1, this.size * 0.25, -this.size * 0.1);
      noStroke();
    }

    // Draw mouth (only if not dead)
    if (!this.isDead) {
      // Draw mouth: check for extreme status values
      if (this.energy === 0 || this.mood === 0 || this.hunger === 100) {
        // Extreme values: draw a frown
        fill(0);
        // Draw an inverted arc (frown) lower on the face
        arc(0, this.size * 0.25, this.size * 0.3, this.size * 0.2, PI, TWO_PI);
      } else {
        // Normal: draw a smile
        fill(0);
        arc(0, this.size * 0.1, this.size * 0.3, this.size * 0.2, 0, PI);
        fill(255, 150, 150);
        arc(0, this.size * 0.1, this.size * 0.2, this.size * 0.1, 0, PI);
      }
    }

    pop();
  }
  
  displayHearts() {
    // Display all active heart particles
    for (let i = 0; i < this.hearts.length; i++) {
      let heart = this.hearts[i];
      
      push();
      translate(heart.x, heart.y);
      
      // Scale heart size based on pet size
      scale(heart.scale * this.sizeFactor);
      
      // Make hearts fade out over time
      let alpha = map(heart.lifespan, 0, heart.maxLife, 0, 255);
      let heartColor = heart.color || color(255, 100, 150); // Use heart's color or default
      fill(red(heartColor), green(heartColor), blue(heartColor), alpha);
      noStroke();
      
      // Draw heart shape
      beginShape();
      // Left curve
      vertex(0, 0);
      bezierVertex(-5, -5, -10, 0, 0, 10);
      // Right curve
      vertex(0, 10);
      bezierVertex(10, 0, 5, -5, 0, 0);
      endShape(CLOSE);
      
      pop();
      
      // Update heart position - scale speed with pet size
      heart.y -= heart.speed * this.sizeFactor;
      heart.lifespan--;
      
      // Add a little side-to-side movement using sin
      heart.x += sin(heart.lifespan * 0.1) * 0.5 * this.sizeFactor;
    }
    
    // Remove hearts that are no longer visible
    this.hearts = this.hearts.filter(heart => heart.lifespan > 0);
  }
  
  addHeart(useCurrentColor = false) {
    // Create a new heart particle - scale position offsets with pet size
    this.hearts.push({
      x: this.x + random(-this.size/4, this.size/4),
      y: this.y - this.size/3, // Start a bit above the pet
      speed: random(0.8, 1.5),
      scale: random(0.5, 1),
      lifespan: 60,
      maxLife: 60,
      color: useCurrentColor ? this.color : color(255, 100, 150) // Use pet color or default heart color
    });
  }
  
  addColorfulHeart() {
    // Create a new heart particle with current pet color
    this.hearts.push({
      x: this.x + random(-this.size/4, this.size/4),
      y: this.y - this.size/3,
      speed: random(0.8, 1.5),
      scale: random(0.5, 1),
      lifespan: 60,
      maxLife: 60,
      color: this.color // Use pet's current color
    });
  }
  
  startSquish() {
    this.isSquished = true;
    this.squishTimer = 0;
    // Start with a flatter, wider squish
    this.squishX = 1.3;
    this.squishY = 0.7;
  }
  
  updateSquish() {
    if (this.isSquished) {
      this.squishTimer++;
      
      if (this.squishTimer <= 10) {
        // Squish phase (flatten)
        this.squishX = lerp(this.squishX, 1.3, 0.3);
        this.squishY = lerp(this.squishY, 0.7, 0.3);
      } else {
        // Rebound phase (bounce back)
        this.squishX = lerp(this.squishX, 1, 0.2);
        this.squishY = lerp(this.squishY, 1, 0.2);
        
        // End squish when almost back to normal
        if (abs(this.squishX - 1) < 0.05 && abs(this.squishY - 1) < 0.05) {
          this.squishX = 1;
          this.squishY = 1;
          this.isSquished = false;
        }
      }
    }
  }
  
  // New method to initialize colors safely
  initializeColors() {
    try {
      // Store RGB values instead of p5.Color objects
      this.colorValues = [
        [255, 192, 203], // Pink (default)
        [255, 255, 150], // Yellow
        [255, 165, 0],   // Orange
        [100, 149, 237], // Blue
        [147, 112, 219], // Purple
        [255, 99, 71]    // Red
      ];
      
      // Set default color index
      this.colorIndex = 0;
      
      // We'll create p5.Color objects on demand in getColor()
    } catch (error) {
      console.error("Error initializing pet colors:", error);
    }
  }
  
  // Method to get current color as valid p5.Color object
  getColor() {
    try {
      const rgb = this.colorValues[this.colorIndex];
      return color(rgb[0], rgb[1], rgb[2]);
    } catch (error) {
      console.error("Error getting pet color:", error);
      return color(255); // Default to white if there's an error
    }
  }

  // Change color on double tap/click
  changeColor() {
    // Cycle to next color in sequence
    this.colorIndex = (this.colorIndex + 1) % this.colorOptions.length;
    this.color = this.colorOptions[this.colorIndex];
    
    // Create a color change animation effect
    this.startSquish(); // Quick squish animation to indicate change
    
    // Add some hearts with the new color
    this.addColorfulHeart();
    
    // Schedule more colorful hearts
    const currentTime = millis();
    this.heartSchedule.push(
      { time: currentTime + 100, colorful: true },
      { time: currentTime + 200, colorful: true },
      { time: currentTime + 300, colorful: true }
    );
  }
  
  update() {
    // Existing update logic: wobble, blinking, squish, etc.
    this.wobble += this.wobbleSpeed;
    
    this.blinkTimer++;
    if (this.blinkTimer > 120 && !this.isBlinking) {
      this.isBlinking = true;
      this.blinkTimer = 0;
    } else if (this.isBlinking && this.blinkTimer > 10) {
      this.isBlinking = false;
      this.blinkTimer = 0;
    }
    
    this.updateSquish();
    
    // --- Energy, Mood, and Hunger Update Logic ---
    // Decay rates for the various meters
    let healthDecayRate = 0.04;
    let energyDecayRate = 0.05;
    let hungerIncreaseRate = 0.1;
    let moodDecayRate = 0.1;

    // Bonuses based on background theme
    let healthBonus = 1.0;
    let energyBonus = 1.0;
    let hungerBonus = 1.0;
    let moodBonus = 1.0;

    if (backgrounds.currentTheme === "night") {
      // Halves energy decay rate
      energyBonus = 0.5;
    } else if (backgrounds.currentTheme === "space") {
      // Halves mood decay rate
      moodBonus = 0.5;
    } else if (backgrounds.currentTheme === "underwater") {
      // Halves health decay rate
      healthBonus = 0.5;
    }

    if (typeof house !== 'undefined' && house.isPetResting() && house.occupiedBy === this) {
      // Pet is resting: restore energy only, leave mood and hunger unchanged.
      this.energy = min(100, this.energy + 0.25);
      if (this.energy >= 100) {
        house.petLeave(); // Automatically leave when energy is full.
        console.log("Energy restored; pet is leaving the house.");
        // Reposition pet at its default active target.
        this.x = this.targetX;
        this.y = this.targetY;
      }
    } else {
      // Pet is active: update all meters.
      this.energy = max(0, this.energy - energyDecayRate * energyBonus);
      
      // Mood decays normally, but if energy is 0 it decays twice as fast.
      if (this.energy === 0) {
        this.mood = max(0, this.mood - moodDecayRate * moodBonus * 2);
      } else {
        this.mood = max(0, this.mood - moodDecayRate * moodBonus);
      }
      
      // Hunger increases slowly (0 = full, 100 = starving)
      this.hunger = min(100, this.hunger + hungerIncreaseRate * hungerBonus);
    }
    
    // Process scheduled heart additions...
    const currentTime = millis();
    for (let i = this.heartSchedule.length - 1; i >= 0; i--) {
      if (currentTime >= this.heartSchedule[i].time) {
        if (this.heartSchedule[i].colorful) {
          this.addColorfulHeart();
        } else {
          this.addHeart();
        }
        this.heartSchedule.splice(i, 1);
      }
    }
    
    // --- Health Decay Logic ---
    let decayCount = 0;
    if (this.energy === 0) decayCount++;
    if (this.mood === 0) decayCount++;
    if (this.hunger === 100) decayCount++;
    this.health = max(0, this.health - healthDecayRate * decayCount * healthBonus);

    // Check if pet's health has reached 0.
    if (this.health <= 0 && !this.isDead) {
      this.die();
    }

    // --- Auto-Feed Logic ---
    // When hunger goes above 75, move near the feed table and feed, if not already feeding.
    if (this.hunger > 75 && feed.foodServings > 0) {
      this.autoFeed();
    }

    // --- Gyroscope-Based Movement ---
    // If device tilt values (rotationX and rotationY) are available, move pet slowly
    if (!this.isDead && typeof rotationX === 'number' && typeof rotationY === 'number') {
      // Map device tilt to movement directions.
      // Adjust the map range and multiplier (0.5) as needed for the desired sensitivity.
      let tiltX = map(rotationY, -90, 90, -1, 1);
      let tiltY = map(rotationX, -90, 90, -1, 1);

      let tiltSensitivity = 1.0; // Adjust this value to make the pet more or less sensitive to tilt.
      
      // Update pet position while keeping within boundaries.
      this.x = constrain(this.x + tiltX * tiltSensitivity, this.minX, this.maxX);
      this.y = constrain(this.y + tiltY * tiltSensitivity, this.minY, this.maxY);
    }
  }
  
  // New method: autoFeed
  autoFeed() {
    feed.eat();
    // Show a text box in the center of the screen, a little bit off the top, for 3 sec that says "Pet is eating!"
    let feedText = createDiv("Pet is eating!");
    feedText.position(width / 2, height * 0.1);
    feedText.style("font-size", "24px");
    feedText.style("font-family", "sans-serif");
    feedText.style("color", "#000");
    feedText.style("background-color", "rgba(255, 255, 255, 0.8)");
    feedText.style("padding", "10px");
    feedText.style("border-radius", "10px");
    feedText.style("position", "absolute");
    feedText.style("transform", "translateX(-50%)");
    feedText.style("z-index", "1");
    setTimeout(() => {
      feedText.remove();
    }, 2000);

    // Reset hunger to 0 after feeding
    this.hunger = 0;
    currency.addCoins(5, "Feed pet");
  }

  die() {
    this.isDead = true;
    // Set a global flag so other input handlers (e.g., in Border) can ignore inputs.
    gameOver = true;
    
    // Create a full-screen overlay to darken the screen and show the death message.
    let deathOverlay = createDiv("Your pet has died!<br>Try again?");
    deathOverlay.position(0, 0);
    deathOverlay.style("width", "100%");
    deathOverlay.style("height", "100%");
    deathOverlay.style("background-color", "rgba(0, 0, 0, 0.8)");
    deathOverlay.style("color", "white");
    deathOverlay.style("font-size", "36px");
    deathOverlay.style("display", "flex");
    deathOverlay.style("justify-content", "center");
    deathOverlay.style("align-items", "center");
    deathOverlay.style("text-align", "center");
    deathOverlay.style("z-index", "10000");
    deathOverlay.style("flex-direction", "column"); // Stack elements vertically
    // This overlay captures all pointer events.
    deathOverlay.style("pointer-events", "auto");
    
    // Create a reset button
    let resetButton = createButton("Reset Game");
    resetButton.parent(deathOverlay);
    resetButton.style("font-size", "24px");
    resetButton.style("padding", "12px 30px");
    resetButton.style("margin-top", "30px");
    resetButton.style("background-color", "#4CAF50");
    resetButton.style("color", "white");
    resetButton.style("border", "none");
    resetButton.style("border-radius", "8px");
    resetButton.style("cursor", "pointer");
    resetButton.style("transition", "background-color 0.3s");
    
    // Hover effect
    resetButton.mouseOver(() => {
      resetButton.style("background-color", "#45a049");
    });
    
    resetButton.mouseOut(() => {
      resetButton.style("background-color", "#4CAF50");
    });
    
    // Add both mouse and touch events to reset the game
    resetButton.mousePressed(() => {
      this.resetGame(deathOverlay);
    });

    // Add touch event listeners for mobile devices
    resetButton.elt.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent default touch behavior
      this.resetGame(deathOverlay);
    }, { passive: false });
  }

  resetGame(deathOverlay) {
    // Reset pet's stats
    this.health = 100;
    this.energy = 100;
    this.hunger = 0;
    this.mood = 100;
    this.isDead = false;
    
    // Reset game state
    gameOver = false;
    
    // Reset currency to starting amount
    currency.resetBalance(900);
    
    // Reset inventory (clear purchased items)
    inventory.reset();

    // Reset shop (close shop and reset prices)
    shop.reset();

    // Reset backgrounds to default theme
    backgrounds.setTheme("day");
    
    // Reset pet position to center of play area
    let playArea = myBorder.getPlayableArea();
    this.x = playArea.width / 2;
    this.y = playArea.height / 2;
    this.targetX = this.x;
    this.targetY = this.y;
    
    // Make sure pet is not in house
    if (house.isPetResting() && house.occupiedBy === this) {
      house.petLeave();
    }
    
    // Reset to default background theme
    backgrounds.setTheme("default");
    
    // Reset feed
    feed.foodServings = 5;
    
    // Remove the death overlay
    deathOverlay.remove();
    
    console.log("Game reset!");
  }
  
  // Update the interact method to account for scaled size
  interact(mouseX, mouseY) {
    // Prevent interaction if pet's energy is zero
    if (this.energy === 0) {
      console.log("Cannot interact: pet’s energy is depleted.");
      return false;
    }
    
    // Also ignore interaction if pet is resting in the house.
    if (typeof house !== 'undefined' && house.isPetResting() && house.occupiedBy === this) {
      return false;
    }
    
    // Hit detection using scaled size:
    let d = dist(mouseX, mouseY, this.x, this.y);
    if (d < this.size * 0.5) {
      console.log("Pet interacted with!");
      
      // Trigger squish effect and add a heart.
      this.startSquish();
      this.addHeart();
      
      // Schedule additional hearts.
      const currentTime = millis();
      this.heartSchedule.push(
        { time: currentTime + 100, colorful: false },
        { time: currentTime + 200, colorful: false }
      );
      
      // Spend a little energy and restore a bit of mood.
      this.energy = max(0, this.energy - 3);
      this.mood = min(100, this.mood + 20);
      
      return true;
    }
    return false;
  }
}