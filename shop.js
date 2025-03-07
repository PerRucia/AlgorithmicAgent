class Shop {
  constructor() {
    // Shop is initially hidden.
    this.visible = false;
    
    // Define the three categories.
    this.categories = ["Food", "Decorations", "Themes"];
    this.selectedCategory = this.categories[0]; // default selected category
  }
  
  // Toggle shop visibility.
  toggleVisibility() {
    this.visible = !this.visible;
  }
  
  // Display the shop overlay if visible.
  display() {
    if (!this.visible) return;
    
    push();
    // Draw a semi-transparent dark overlay.
    fill(0, 150);
    noStroke();
    rect(0, 0, width, height);
    
    // Define shop panel dimensions (almost full screen).
    const xPos = width * 0.05;
    const yPos = height * 0.05;
    const panelWidth = width * 0.9;
    const panelHeight = height * 0.9;
    
    // Draw the shop panel background with a light colour.
    fill(245, 245, 255);  
    stroke(50);
    strokeWeight(2);
    rect(xPos, yPos, panelWidth, panelHeight, 10);
    
    // Draw the header title with a contrasting colour.
    fill(30, 30, 120);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(28);
    text("SHOP", xPos + panelWidth / 2, yPos + 15);
    
    // Draw the close button in the top-right corner.
    const btnSize = 30;
    fill(220, 50, 50);
    noStroke();
    rect(xPos + panelWidth - btnSize - 10, yPos + 10, btnSize, btnSize, 5);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("X", xPos + panelWidth - btnSize / 2 - 10, yPos + 10 + btnSize / 2);
    
    // Draw the category tabs at the top of the shop panel.
    const tabHeight = 40;
    const tabWidth = panelWidth / this.categories.length;
    for (let i = 0; i < this.categories.length; i++) {
      let tabX = xPos + i * tabWidth;
      let tabY = yPos + 60; // position tabs below header
      
      // Use a different fill for the selected tab.
      if (this.categories[i] === this.selectedCategory) {
        fill(100, 150, 250);
      } else {
        fill(180, 200, 250);
      }
      stroke(50);
      rect(tabX, tabY, tabWidth, tabHeight);
      
      // Draw the tab label.
      fill(20, 20, 80);
      textAlign(CENTER, CENTER);
      textSize(20);
      text(this.categories[i], tabX + tabWidth / 2, tabY + tabHeight / 2);
    }
    
    pop();
  }
  
  // Handle mouse/touch presses when the shop menu is visible.
  // Returns true if the event was handled.
  handleMousePressed(x, y) {
    if (!this.visible) return false;
    
    // Define the same panel dimensions as in display().
    const xPos = width * 0.05;
    const yPos = height * 0.05;
    const panelWidth = width * 0.9;
    const panelHeight = height * 0.9;
    const btnSize = 30;
    
    // Check if the close button was tapped.
    const closeX = xPos + panelWidth - btnSize - 10;
    const closeY = yPos + 10;
    if (x > closeX && x < closeX + btnSize && y > closeY && y < closeY + btnSize) {
      this.visible = false;
      return true;
    }
    
    // Check if one of the tab buttons was tapped.
    const tabHeight = 40;
    const tabWidth = panelWidth / this.categories.length;
    let tabY = yPos + 60; // tab area y position
    for (let i = 0; i < this.categories.length; i++) {
      let tabX = xPos + i * tabWidth;
      if (x > tabX && x < tabX + tabWidth && y > tabY && y < tabY + tabHeight) {
        // Update selected category.
        this.selectedCategory = this.categories[i];
        return true;
      }
    }
    
    // Leave shop open if click is outside.
    return false;
  }
}