class Inventory {
    constructor() {
      // Two categories: food and backgrounds
      this.items = {
        food: [],
        backgrounds: []
      };
      // Add the default day background.
      this.items.backgrounds.push({ id: "day", name: "Day", description: "A bright sunny day." });
      // For inventory menu overlay.
      this.selectedCategory = "food";
      this.visible = false;
    }

  // Add an item to the inventory.
  // category must be "food" or "backgrounds"
  addItem(category, item) {
    const cat = category.toLowerCase();
    if (this.items[cat] !== undefined) {
      this.items[cat].push(item);
      console.log(`Added ${item.name} to inventory under ${category}`);
    } else {
      console.log(`Invalid inventory category: ${category}`);
    }
  }

  // Get the list of items in a given category.
  getItems(category) {
    return this.items[category.toLowerCase()] || [];
  }
  
  // Display inventory menu overlay (identical layout to shop.js).
  display() {
    push();
    // Draw semi-transparent full-screen overlay.
    fill(0, 150);
    noStroke();
    rect(0, 0, width, height);
    
    // Define inventory menu dimensions (similar to shop.js).
    const menuWidth = width * 0.9;
    const menuHeight = height * 0.9;
    const x0 = width / 2 - menuWidth / 2;
    const y0 = height / 2 - menuHeight / 2;
    
    // Draw the menu panel.
    fill(245, 245, 255);
    stroke(50);
    strokeWeight(2);
    rect(x0, y0, menuWidth, menuHeight, 10);
    
    // Header title.
    fill(30, 30, 120);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(28);
    text("Inventory", x0 + menuWidth / 2, y0 + 15);
    
    // Close button.
    const btnSize = 30;
    fill(220, 50, 50);
    noStroke();
    rect(x0 + menuWidth - btnSize - 10, y0 + 10, btnSize, btnSize, 5);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("X", x0 + menuWidth - btnSize / 2 - 10, y0 + 10 + btnSize / 2);
    
    // Category tabs.
    const tabHeight = 40;
    const tabWidth = menuWidth / 2;
    
    // Food tab.
    if (this.selectedCategory === "food") {
      fill(100, 150, 250);
    } else {
      fill(180, 200, 250);
    }
    stroke(50);
    rect(x0, y0 + 60, tabWidth, tabHeight);
    
    // Backgrounds tab.
    if (this.selectedCategory === "backgrounds") {
      fill(100, 150, 250);
    } else {
      fill(180, 200, 250);
    }
    stroke(50);
    rect(x0 + tabWidth, y0 + 60, tabWidth, tabHeight);
    
    // Tab labels.
    fill(20, 20, 80);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Food", x0 + tabWidth / 2, y0 + 60 + tabHeight / 2);
    text("Backgrounds", x0 + tabWidth + tabWidth / 2, y0 + 60 + tabHeight / 2);
    
    // Display purchased items in the selected category.
    let items = this.getItems(this.selectedCategory);
    const iconSize = 80;
    const spacing = 20;
    const iconsPerRow = floor((menuWidth - spacing) / (iconSize + spacing));
    let row = 0, col = 0;
    let startX = x0 + spacing;
    let startYIcons = y0 + 60 + tabHeight + spacing;
    
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let xi = startX + col * (iconSize + spacing);
      let yi = startYIcons + row * (iconSize + spacing);
      
      // Draw item placeholder.
      fill(180);
      stroke(0);
      rect(xi, yi, iconSize, iconSize, 5);
      fill(0);
      noStroke();
      textSize(16);
      textAlign(CENTER, CENTER);
      text(item.name, xi + iconSize / 2, yi + iconSize / 2);
      
      col++;
      if (col >= iconsPerRow) {
        col = 0;
        row++;
      }
    }
    
    pop();
  }

  // Toggle the inventory menu visibility.
  toggleVisibility() {
    this.visible = !this.visible;
  }
  
  // Handle taps while the inventory menu is visible.
  // Returns true if the tap was on a tab.
  handleMousePressed(x, y) {
    // Define menu dimensions (should match display()).
    const menuWidth = width * 0.9;
    const menuHeight = height * 0.9;
    const x0 = width / 2 - menuWidth / 2;
    const y0 = height / 2 - menuHeight / 2;
    const tabHeight = 40;
    const tabWidth = menuWidth / 2;
    
    // Check if tap is on the Food tab.
    if (x > x0 && x < x0 + tabWidth && y > y0 + 60 && y < y0 + 60 + tabHeight) {
      this.selectedCategory = "food";
      return true;
    }
    // Check if tap is on the Backgrounds tab.
    if (x > x0 + tabWidth && x < x0 + menuWidth && y > y0 + 60 && y < y0 + 60 + tabHeight) {
      this.selectedCategory = "backgrounds";
      return true;
    }
    
    // Check if tap is on the close button.
    const btnSize = 30;
    if (x > x0 + menuWidth - btnSize - 10 &&
        x < x0 + menuWidth - 10 &&
        y > y0 + 10 &&
        y < y0 + 10 + btnSize) {
      // Close the inventory menu.
      this.visible = false;
      return true;
    }
    
    // If tap is outside the menu, return false for the caller to close the menu.
    if (x < x0 || x > x0 + menuWidth || y < y0 || y > y0 + menuHeight) {
      return false;
    }
    
    return false; // Other taps inside the menu can be handled as needed.
  }
}