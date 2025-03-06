class PlayArea {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    // Remove grass color, grass details, and pebbles arrays
  }
  
  setBounds(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  
  display() {
    // Empty display method - no background, grass, or pebbles
    // This method is kept empty but maintained for compatibility
    // in case other parts of the code call it
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
    // No need to regenerate visual elements
  }
}