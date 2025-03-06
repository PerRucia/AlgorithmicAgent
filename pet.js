class Pet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    // Base size will be adjusted based on play area dimensions
    this.baseSize = 100;
    this.size = this.baseSize; // Initial size, will be adjusted in setBoundaries
    
    // Size scaling factors
    this.minSizeFactor = 0.5; // Minimum size as a fraction of baseSize
    this.maxSizeFactor = 1.5; // Maximum size as a fraction of baseSize
    this.sizeFactor = 1.0;    // Current size factor, will adjust based on play area

    // Predefined color sequence
    this.colorOptions = [
      color(255, 192, 203), // Pink (default)
      color(255, 255, 150), // Yellow
      color(255, 165, 0),   // Orange
      color(100, 149, 237), // Blue
      color(147, 112, 219), // Purple
      color(255, 99, 71)    // Red
    ];

    // Set initial color to pink and track current color index
    this.colorIndex = 0;
    this.color = this.colorOptions[this.colorIndex];

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
    // Draw floating hearts first (so they appear behind the pet)
    this.displayHearts();
    
    // Keep existing display code
    push();
    translate(this.x, this.y);

    let bounce = sin(this.wobble) * this.wobbleRange;
    translate(0, bounce);

    // Apply squish effect
    scale(this.squishX, this.squishY);
    
    noStroke();
    fill(this.color);

    // -- Draw Ears --
    ellipse(-this.size * 0.25, -this.size * 0.55, this.size * 0.3, this.size * 0.3);
    ellipse(this.size * 0.25, -this.size * 0.55, this.size * 0.3, this.size * 0.3);

    // -- Draw Body --
    ellipse(0, 0, this.size, this.size * 0.8);

    // -- Face --
    if (!this.isBlinking) {
      // White sclera
      fill(255);
      ellipse(-this.size * 0.2, -this.size * 0.1, this.size * 0.2, this.size * 0.2);
      ellipse(this.size * 0.2, -this.size * 0.1, this.size * 0.2, this.size * 0.2);

      // Pupils
      fill(0);
      ellipse(-this.size * 0.2, -this.size * 0.1, this.size * 0.1, this.size * 0.1);
      ellipse(this.size * 0.2, -this.size * 0.1, this.size * 0.1, this.size * 0.1);
    } else {
      // Closed eyes: small horizontal lines
      stroke(0);
      strokeWeight(3);
      line(-this.size * 0.25, -this.size * 0.1, -this.size * 0.15, -this.size * 0.1);
      line(this.size * 0.15, -this.size * 0.1, this.size * 0.25, -this.size * 0.1);
      noStroke();
    }

    // Cheeks
    fill(255, 150, 150, 100);
    ellipse(-this.size * 0.3, this.size * 0.05, this.size * 0.15, this.size * 0.1);
    ellipse(this.size * 0.3, this.size * 0.05, this.size * 0.15, this.size * 0.1);

    // Mouth
    fill(0);
    arc(0, this.size * 0.1, this.size * 0.3, this.size * 0.2, 0, PI);
    fill(255, 150, 150);
    arc(0, this.size * 0.1, this.size * 0.2, this.size * 0.1, 0, PI);

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
    // Keep subtle wobble or bounce
    this.wobble += this.wobbleSpeed;
  
    // Keep blinking logic
    this.blinkTimer++;
    if (this.blinkTimer > 120 && !this.isBlinking) {
      this.isBlinking = true;
      this.blinkTimer = 0;
    } 
    else if (this.isBlinking && this.blinkTimer > 10) {
      this.isBlinking = false;
      this.blinkTimer = 0;
    }
    
    // Update squish animation if active
    this.updateSquish();
    
    // Process scheduled heart additions
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
  }
  
  // Update the interact method to account for scaled size
  interact(mouseX, mouseY) {
    // Check if mouse is over the pet, use scaled size for hit detection
    let d = dist(mouseX, mouseY, this.x, this.y);
    if (d < this.size * 0.5) {
      console.log("Pet interacted with!");
      
      // Start squish effect
      this.startSquish();
      
      // Add a floating heart
      this.addHeart();
      
      // Schedule more hearts (instead of setTimeout)
      const currentTime = millis();
      this.heartSchedule.push(
        { time: currentTime + 100, colorful: false },
        { time: currentTime + 200, colorful: false }
      );
      
      return true;
    }
    return false;
  }
}