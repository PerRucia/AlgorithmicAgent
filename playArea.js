class PlayArea {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.grassColor = color(180, 230, 160); // Light green for grass
    this.grassDetails = []; // Will store grass blade positions
    this.pebbles = []; // Will store pebble positions and sizes
    this.numGrassBlades = 80;
    this.numPebbles = 12;
  }
  
  setBounds(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    // Generate grass and pebbles when area is set or resized
    this.generateGrass();
    this.generatePebbles();
  }
  
  generateGrass() {
    this.grassDetails = [];
    for (let i = 0; i < this.numGrassBlades; i++) {
      this.grassDetails.push({
        x: this.x + random(this.width),
        y: this.y + random(this.height),
        height: random(10, 25),
        width: random(2, 5),
        curve: random(-5, 5),
        colorVar: random(-20, 20)
      });
    }
  }
  
  generatePebbles() {
    this.pebbles = [];
    for (let i = 0; i < this.numPebbles; i++) {
      this.pebbles.push({
        x: this.x + random(this.width),
        y: this.y + random(this.height),
        size: random(5, 15),
        color: color(200 + random(-30, 30), 200 + random(-30, 30), 200 + random(-30, 30))
      });
    }
  }
  
  display() {
    // Draw background
    noStroke();
    fill(this.grassColor);
    rect(this.x, this.y, this.width, this.height);
    
    // Draw pebbles (underneath grass)
    for (let pebble of this.pebbles) {
      fill(pebble.color);
      ellipse(pebble.x, pebble.y, pebble.size, pebble.size * 0.8);
    }
    
    // Draw grass blades
    for (let grass of this.grassDetails) {
      push();
      translate(grass.x, grass.y);
      
      // Slightly varied green for each blade
      fill(100 + grass.colorVar, 200 + grass.colorVar, 100 + grass.colorVar/2);
      noStroke();
      
      // Draw a grass blade as a curved rectangle
      beginShape();
      vertex(-grass.width/2, 0);
      bezierVertex(
        -grass.width/2 + grass.curve, -grass.height/2,
        grass.width/2 + grass.curve, -grass.height/2,
        grass.width/2, -grass.height
      );
      vertex(grass.width/2, -grass.height);
      vertex(-grass.width/2, -grass.height);
      endShape(CLOSE);
      pop();
    }
  }
  
  // Check if a point is within the play area
  contains(x, y) {
    return (x > this.x && x < this.x + this.width &&
            y > this.y && y < this.y + this.height);
  }
  
  // Get play area dimensions - useful for pet movement constraints
  getDimensions() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
  
  // Update appearance on window resize
  resize(x, y, width, height) {
    this.setBounds(x, y, width, height);
  }
}