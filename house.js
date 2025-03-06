class House {
  constructor() {
    // Position will be set in resize()
    this.x = 0;
    this.y = 0;
    this.width = 120;
    this.height = 100;
    this.baseSize = 300; // Reference size to scale with screen
    
    // Style properties
    this.roofColor = color(170, 90, 60);
    this.wallColor = color(215, 190, 140);
    this.doorColor = color(120, 80, 40);
    this.windowColor = color(180, 230, 250);
    
    // Features
    this.hasChimney = true;
    this.smoke = [];
    this.maxSmoke = 10;
    
    // Comfort effect (when pet is at the house)
    this.comfortParticles = [];
    this.maxComfortParticles = 15;
    
    // Interaction state
    this.isHovered = false;
    this.occupiedBy = null; // Reference to pet when it's resting
    
    // Initialize smoke particles
    this.initSmoke();
    
    // Size factor for responsive scaling
    this.sizeFactor = 1.0;
  }
  
  // Initialize smoke particles coming from chimney
  initSmoke() {
    this.smoke = [];
    for (let i = 0; i < this.maxSmoke; i++) {
      this.smoke.push({
        x: 0, // Will be set in updateSmoke()
        y: 0, // Will be set in updateSmoke()
        size: random(10, 20),
        opacity: random(30, 80),
        speed: random(0.2, 0.5),
        offset: random(0, 100),
        drift: random(-0.2, 0.2)
      });
    }
  }
  
  // Initialize comfort particles (hearts, stars, zzz) when pet is resting
  initComfortParticles() {
    this.comfortParticles = [];
    for (let i = 0; i < this.maxComfortParticles; i++) {
      this.comfortParticles.push({
        x: 0, // Will be set relative to pet position
        y: 0, // Will be set relative to pet position
        type: random() < 0.3 ? 'zzz' : (random() < 0.5 ? 'heart' : 'star'),
        size: random(8, 16),
        opacity: random(150, 255),
        speed: random(0.3, 0.8),
        life: random(60, 120),
        maxLife: 120,
        angle: random(TWO_PI)
      });
    }
  }
  
  // Set house position based on playable area
  setPosition(playableArea) {
    // Calculate proper size based on playable area
    const smallerDimension = min(playableArea.width, playableArea.height);
    this.sizeFactor = smallerDimension / 1000; // Scale relative to a 1000px reference
    this.sizeFactor = constrain(this.sizeFactor, 0.6, 1.3);
    
    this.width = this.baseSize * this.sizeFactor;
    this.height = (this.baseSize * 0.8) * this.sizeFactor;
    
    // Position in bottom right with some padding
    const rightPadding = playableArea.width * 0.08;
    const bottomOffset = playableArea.height * 0.8; // Match floor height from backgrounds.js
    
    this.x = playableArea.width - this.width/2 - rightPadding;
    this.y = bottomOffset;
    
    // Re-init particles with new position
    this.initSmoke();
  }
  
  // Draw the house
  display(playableArea) {
    push();
    
    // Ground shadow (oval)
    noStroke();
    fill(0, 0, 0, 30);
    ellipse(this.x, this.y + this.height/2, this.width * 1.1, this.height/3);
    
    // Update and draw chimney smoke
    this.updateSmoke();
    this.drawSmoke();
    
    // Draw house structure
    this.drawHouse();
    
    // Draw comfort particles if pet is resting
    if (this.occupiedBy) {
      this.updateComfortParticles();
      this.drawComfortParticles();
    }
    
    pop();
  }
  
  // Draw the main house structure
  drawHouse() {
    const houseWidth = this.width;
    const houseHeight = this.height;
    const roofHeight = houseHeight * 0.4;
    const wallHeight = houseHeight * 0.6;
    
    // House center position
    const x = this.x;
    const y = this.y - wallHeight/2;
    
    // Draw walls
    fill(this.wallColor);
    if (this.isHovered || this.occupiedBy) {
      // Add subtle glow when hovered or occupied
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = 'rgba(255, 255, 150, 0.5)';
    }
    
    rect(x - houseWidth/2, y, houseWidth, wallHeight, 5);
    drawingContext.shadowBlur = 0;
    
    // Draw roof (triangle)
    fill(this.roofColor);
    triangle(
      x - houseWidth/2 - houseWidth*0.1, y,
      x + houseWidth/2 + houseWidth*0.1, y,
      x, y - roofHeight
    );
    
    // Draw door
    fill(this.doorColor);
    const doorWidth = houseWidth * 0.25;
    const doorHeight = wallHeight * 0.7;
    rect(x - doorWidth/2, y + wallHeight - doorHeight, doorWidth, doorHeight, 3, 3, 0, 0);
    
    // Door handle
    fill(220, 200, 100);
    ellipse(x + doorWidth*0.2, y + wallHeight - doorHeight/2, doorWidth*0.15, doorWidth*0.15);
    
    // Draw windows
    fill(this.windowColor);
    const windowSize = houseWidth * 0.2;
    
    // Left window
    rect(x - houseWidth*0.3, y + wallHeight*0.3, windowSize, windowSize, 3);
    line(x - houseWidth*0.3, y + wallHeight*0.3, x - houseWidth*0.3, y + wallHeight*0.3 + windowSize);
    line(x - houseWidth*0.3 - windowSize/2, y + wallHeight*0.3 + windowSize/2, 
         x - houseWidth*0.3 + windowSize/2, y + wallHeight*0.3 + windowSize/2);
    
    // Right window
    rect(x + houseWidth*0.15, y + wallHeight*0.3, windowSize, windowSize, 3);
    line(x + houseWidth*0.15, y + wallHeight*0.3, x + houseWidth*0.15, y + wallHeight*0.3 + windowSize);
    line(x + houseWidth*0.15 - windowSize/2, y + wallHeight*0.3 + windowSize/2, 
         x + houseWidth*0.15 + windowSize/2, y + wallHeight*0.3 + windowSize/2);
    
    // Draw chimney if enabled
    if (this.hasChimney) {
      fill(this.roofColor);
      const chimneyWidth = houseWidth * 0.12;
      const chimneyHeight = roofHeight * 0.8;
      const chimneyX = x + houseWidth * 0.2;
      const chimneyY = y - roofHeight * 0.4;
      
      // Calculate roof intersection point
      const roofSlope = roofHeight / (houseWidth/2 + houseWidth*0.1);
      const distFromCenter = chimneyX - x;
      const roofY = y - roofSlope * (houseWidth/2 + houseWidth*0.1 - abs(distFromCenter));
      
      rect(chimneyX - chimneyWidth/2, roofY - chimneyHeight, chimneyWidth, chimneyHeight, 2);
      
      // Chimney top
      fill(this.roofColor * 0.8);
      rect(chimneyX - chimneyWidth/2 - 2, roofY - chimneyHeight - 5, chimneyWidth + 4, 5, 1);
      
      // Store chimney top position for smoke
      this.chimneyTopX = chimneyX;
      this.chimneyTopY = roofY - chimneyHeight - 5;
    }
  }
  
  // Update smoke particles position
  updateSmoke() {
    for (let i = 0; i < this.smoke.length; i++) {
      // Base position at chimney top
      if (!this.smoke[i].initialized) {
        this.smoke[i].x = this.chimneyTopX;
        this.smoke[i].y = this.chimneyTopY;
        this.smoke[i].initialized = true;
      }
      
      // Move smoke upward
      this.smoke[i].y -= this.smoke[i].speed;
      
      // Add slight horizontal drift using sin
      this.smoke[i].x += sin(frameCount * 0.02 + this.smoke[i].offset) * this.smoke[i].drift;
      
      // Gradually increase size and reduce opacity
      this.smoke[i].size += 0.05;
      this.smoke[i].opacity -= 0.2;
      
      // Reset smoke particle if it's faded out
      if (this.smoke[i].opacity <= 0) {
        this.smoke[i].x = this.chimneyTopX;
        this.smoke[i].y = this.chimneyTopY;
        this.smoke[i].size = random(10, 20) * this.sizeFactor;
        this.smoke[i].opacity = random(30, 80);
      }
    }
  }
  
  // Draw smoke particles
  drawSmoke() {
    noStroke();
    for (let i = 0; i < this.smoke.length; i++) {
      fill(255, 255, 255, this.smoke[i].opacity);
      ellipse(this.smoke[i].x, this.smoke[i].y, 
              this.smoke[i].size * this.sizeFactor, 
              this.smoke[i].size * 0.8 * this.sizeFactor);
    }
  }
  
  // Update comfort particles when pet is resting
  updateComfortParticles() {
    if (!this.occupiedBy) return;
    
    for (let i = 0; i < this.comfortParticles.length; i++) {
      let p = this.comfortParticles[i];
      
      // If new particle, initialize position around pet
      if (!p.initialized) {
        const angle = random(PI - PI/4, TWO_PI - PI/4); // Mostly upward
        const dist = this.occupiedBy.size * 0.6;
        p.x = this.occupiedBy.x + cos(angle) * dist;
        p.y = this.occupiedBy.y + sin(angle) * dist;
        p.initialized = true;
      }
      
      // Move particle upward
      p.y -= p.speed;
      
      // Add slight horizontal movement
      p.x += sin(frameCount * 0.05 + p.angle) * 0.3;
      
      // Decrease life
      p.life--;
      
      // Reset particle if it's expired
      if (p.life <= 0) {
        const angle = random(PI - PI/4, TWO_PI - PI/4);
        const dist = this.occupiedBy.size * 0.6;
        p.x = this.occupiedBy.x + cos(angle) * dist;
        p.y = this.occupiedBy.y + sin(angle) * dist;
        p.life = p.maxLife;
        p.type = random() < 0.3 ? 'zzz' : (random() < 0.5 ? 'heart' : 'star');
      }
    }
  }
  
  // Draw comfort particles (hearts, stars, zzz)
  drawComfortParticles() {
    for (let i = 0; i < this.comfortParticles.length; i++) {
      let p = this.comfortParticles[i];
      
      // Skip if not initialized
      if (!p.initialized) continue;
      
      // Calculate fade
      const alpha = map(p.life, 0, p.maxLife, 0, p.opacity);
      
      push();
      translate(p.x, p.y);
      
      if (p.type === 'zzz') {
        // Draw Z characters for sleep
        fill(255, 255, 255, alpha);
        noStroke();
        textSize(p.size * this.sizeFactor);
        textAlign(CENTER, CENTER);
        text("z", 0, 0);
      } 
      else if (p.type === 'heart') {
        // Draw heart
        fill(255, 100, 150, alpha);
        noStroke();
        scale(p.size * this.sizeFactor * 0.05);
        beginShape();
        vertex(0, 0);
        bezierVertex(-10, -8, -20, 0, 0, 10);
        bezierVertex(20, 0, 10, -8, 0, 0);
        endShape();
      }
      else if (p.type === 'star') {
        // Draw star
        fill(255, 255, 150, alpha);
        noStroke();
        const starSize = p.size * this.sizeFactor;
        const angle = TWO_PI / 10;
        const halfAngle = angle/2.0;
        const radius = starSize / 2;
        const innerRadius = radius * 0.4;
        
        beginShape();
        for (let a = 0; a < TWO_PI; a += angle) {
          let sx = cos(a) * radius;
          let sy = sin(a) * radius;
          vertex(sx, sy);
          sx = cos(a + halfAngle) * innerRadius;
          sy = sin(a + halfAngle) * innerRadius;
          vertex(sx, sy);
        }
        endShape(CLOSE);
      }
      pop();
    }
  }
  
  // Check if point is over house
  contains(x, y) {
    // Check within rectangular bounds (approximation)
    const houseTop = this.y - this.height;
    return (
      x > this.x - this.width/2 - this.width*0.1 &&
      x < this.x + this.width/2 + this.width*0.1 &&
      y > houseTop &&
      y < this.y + this.height/2
    );
  }
  
  // Set hover state
  setHover(isHovered) {
    this.isHovered = isHovered;
  }
  
  // Set pet as resting in the house
  petEnter(pet) {
    this.occupiedBy = pet;
    this.initComfortParticles();
    console.log("Pet is now resting in the house");
    
    // Return the pet's resting position (in front of door)
    return {
      x: this.x,
      y: this.y
    };
  }
  
  // Pet leaves the house
  petLeave() {
    this.occupiedBy = null;
    console.log("Pet has left the house");
  }
  
  // Check if pet is resting
  isPetResting() {
    return this.occupiedBy !== null;
  }
  
  // Handle resize
  resize(playableArea) {
    this.setPosition(playableArea);
  }
}