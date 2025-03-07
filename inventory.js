class Inventory {
  constructor() {
    // Two categories: food and backgrounds
    this.items = {
      food: [],
      backgrounds: []
    };
    // Add the default day background.
    this.items.backgrounds.push({ id: "day", name: "Day", description: "A bright sunny day." });
    // Add a default apple food item (unlimited by default).
    this.items.food.push({
      id: "apple",
      name: "Apple",
      description: "A healthy apple to keep your pet happy.",
      servings: 1,
      quantity: "∞"
    });
    // For inventory menu overlay.
    this.selectedCategory = "food";
    this.visible = false;
  }

  // Add an item to the inventory.
  // category must be "food" or "backgrounds"
  addItem(category, item) {
    const cat = category.toLowerCase();
    if (this.items[cat] !== undefined) {
      // Look for an existing item in this category.
      let existing = this.items[cat].find(i => i.id === item.id);
      if (existing) {
        // If the item already exists and it's not the default apple,
        // then update its quantity.
        if (existing.quantity !== "Unlimited") {
          existing.quantity = (existing.quantity || 1) + 1;
        }
      } else {
        // Add new item with a starting quantity.
        // For food items other than apple, quantity starts at 1.
        let newItem = { ...item, quantity: item.id === "apple" ? "Unlimited" : 1 };
        this.items[cat].push(newItem);
      }
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
      // Also display quantity under the item name if item is a food item, otherw
      let itemDisplay = item.name
      if (item.quantity !== undefined) {
        itemDisplay += `\n(${item.quantity})`;
      }
      text(`${itemDisplay}`, xi + iconSize / 2, yi + iconSize / 2);
      
      col++;
      if (col >= iconsPerRow) {
        col = 0;
        row++;
      }
    }

    // If the food use confirmation dialog is active, display it on top.
    if (this.useDialogVisible && this.selectedFoodForUse) {
      this.displayUseDialog();
    }
    
    pop();
  }

  // New method: display the use confirmation dialog.
  displayUseDialog() {
    // Define dialog dimensions.
    const dialogWidth = 300;
    const dialogHeight = 200;
    const dx = width / 2 - dialogWidth / 2;
    const dy = height / 2 - dialogHeight / 2;
    
    push();
    // Dialog background.
    fill(240);
    stroke(0);
    strokeWeight(2);
    rect(dx, dy, dialogWidth, dialogHeight, 10);
    
    // Dialog text with word wrapping.
    fill(0);
    noStroke();
    textSize(18);
    textAlign(CENTER, TOP);
    textWrap(WORD);
    const message = `Are you sure you want to use ${this.selectedFoodForUse.name}? You have ${this.selectedFoodForUse.quantity} remaining.`;
    text(message, dx + 20, dy + 20, dialogWidth - 40, dialogHeight - 70);
    
    // Draw Confirm and Cancel buttons.
    // Confirm Button.
    const btnWidth = 100, btnHeight = 40;
    const confirmX = dx + 20;
    const btnY = dy + dialogHeight - btnHeight - 20;
    fill(0, 150, 0);
    stroke(0);
    rect(confirmX, btnY, btnWidth, btnHeight, 5);
    fill(255);
    noStroke();
    textSize(16);
    textAlign(CENTER, CENTER);
    text("Confirm", confirmX + btnWidth / 2, btnY + btnHeight / 2);
    
    // Cancel Button.
    const cancelX = dx + dialogWidth - btnWidth - 20;
    fill(200, 0, 0);
    stroke(0);
    rect(cancelX, btnY, btnWidth, btnHeight, 5);
    fill(255);
    noStroke();
    text("Cancel", cancelX + btnWidth / 2, btnY + btnHeight / 2);
    
    pop();
  }

  // This method is called when the confirm button is pressed.
  confirmUseFood() {
    // Save the object name before using it.
    let usedItemName = this.selectedFoodForUse.name;
    
    if (this.selectedFoodForUse.id === "medicine") {
      // Special use for medicine: restore pet's health to full.
      myPet.health = 100;
      console.log("Medicine used! Health restored to full.");
      
      // Process quantity decrement for medicine.
      if (this.selectedFoodForUse.quantity !== "∞") {
        this.selectedFoodForUse.quantity--;
        if (this.selectedFoodForUse.quantity <= 0) {
          this.items.food = this.items.food.filter(i => i !== this.selectedFoodForUse);
        }
      }
      
      // Show a special confirmation dialog.
      let confirmDialog = createDiv(`${usedItemName} used! Health restored!`);
      confirmDialog.position(width / 2, height / 2);
      confirmDialog.style("font-size", "24px");
      confirmDialog.style("background-color", "rgba(240,240,240,0.9)");
      confirmDialog.style("padding", "20px");
      confirmDialog.style("border", "2px solid #000");
      confirmDialog.style("border-radius", "10px");
      confirmDialog.style("position", "absolute");
      confirmDialog.style("top", "50%");
      confirmDialog.style("left", "50%");
      confirmDialog.style("transform", "translate(-50%, -50%)");
      confirmDialog.style("z-index", "1000");
      
      // Remove the dialog after 1.5 seconds or on click
      confirmDialog.mousePressed(() => {
        confirmDialog.remove();
      });
      setTimeout(() => {
        confirmDialog.remove();
      }, 1500);
      
    } else {
      // Default: Place the food item on the feed table.
      feed.placeFood({ name: usedItemName });
      
      // If the item is not unlimited, deduct one quantity.
      if (this.selectedFoodForUse.quantity !== "∞") {
        this.selectedFoodForUse.quantity--;
        if (this.selectedFoodForUse.quantity <= 0) {
          this.items.food = this.items.food.filter(i => i !== this.selectedFoodForUse);
        }
      }
      
      // Create a confirmation dialog box with the message "<object> used!".
      let confirmDialog = createDiv(`${usedItemName} used!`);
      confirmDialog.position(width / 2, height / 2);
      confirmDialog.style("font-size", "24px");
      confirmDialog.style("background-color", "rgba(240,240,240,0.9)");
      confirmDialog.style("padding", "20px");
      confirmDialog.style("border", "2px solid #000");
      confirmDialog.style("border-radius", "10px");
      confirmDialog.style("position", "absolute");
      confirmDialog.style("top", "50%");
      confirmDialog.style("left", "50%");
      confirmDialog.style("transform", "translate(-50%, -50%)");
      confirmDialog.style("z-index", "1000");
      
      // Remove the dialog after 1.5 seconds or when clicked/tapped.
      confirmDialog.mousePressed(() => {
        confirmDialog.remove();
      });
      setTimeout(() => {
        confirmDialog.remove();
      }, 1500);
    }
    
    // Hide the use dialog and clear the selected item.
    this.useDialogVisible = false;
    this.selectedFoodForUse = null;
  }

  // Toggle the inventory menu visibility.
  toggleVisibility() {
    this.visible = !this.visible;
  }

  // Add this method to the Inventory class
  reset() {
    // Two categories: food and backgrounds
    this.items = {
      food: [],
      backgrounds: []
    };
    // Add the default day background.
    this.items.backgrounds.push({ id: "day", name: "Day", description: "A bright sunny day." });
    // Add a default apple food item (unlimited by default).
    this.items.food.push({
      id: "apple",
      name: "Apple",
      description: "A healthy apple to keep your pet happy.",
      servings: 1,
      quantity: "∞"
    });
    // For inventory menu overlay.
    this.selectedCategory = "food";
    this.visible = false;
    console.log("Inventory reset to default state");
  }
  
  // Handle taps while the inventory menu is visible.
  // Returns true if the tap was on a tab.
  handleMousePressed(x, y) {
    // If the use confirmation dialog is visible, handle its buttons.
    if (this.useDialogVisible) {
      // Define dialog dimensions (must match displayUseDialog)
      const dialogWidth = 300;
      const dialogHeight = 200;
      const dx = width / 2 - dialogWidth / 2;
      const dy = height / 2 - dialogHeight / 2;
      const btnWidth = 100, btnHeight = 40;
      const btnY = dy + dialogHeight - btnHeight - 20;
      const confirmX = dx + 20;
      const cancelX = dx + dialogWidth - btnWidth - 20;
      
      // Check if tap is on the Confirm button.
      if (x > confirmX && x < confirmX + btnWidth &&
          y > btnY && y < btnY + btnHeight) {
        this.confirmUseFood();
        return true;
      }
      // Check if tap is on the Cancel button.
      if (x > cancelX && x < cancelX + btnWidth &&
          y > btnY && y < btnY + btnHeight) {
        this.useDialogVisible = false;
        this.selectedFoodForUse = null;
        return true;
      }
      // While dialog is visible, other taps are ignored.
      return true;
    }
    
    // Define menu dimensions (should match display())
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
      this.visible = false;
      return true;
    }
    
    // If in the Food tab, check if a food item button was tapped.
    if (this.selectedCategory === "food") {
      const iconSize = 80;
      const spacing = 20;
      const iconsPerRow = floor((menuWidth - spacing) / (iconSize + spacing));
      let row = 0, col = 0;
      let startX = x0 + spacing;
      let startYIcons = y0 + 60 + tabHeight + spacing;
      let items = this.getItems("food");
      
      for (let i = 0; i < items.length; i++) {
        let xi = startX + col * (iconSize + spacing);
        let yi = startYIcons + row * (iconSize + spacing);
        if (x > xi && x < xi + iconSize &&
            y > yi && y < yi + iconSize) {
          // Set the selected food item and show the confirmation dialog.
          this.selectedFoodForUse = items[i];
          this.useDialogVisible = true;
          return true;
        }
        col++;
        if (col >= iconsPerRow) {
          col = 0;
          row++;
        }
      }
    }
    
    // Taps inside the inventory menu that don't hit a button.
    if (x < x0 || x > x0 + menuWidth || y < y0 || y > y0 + menuHeight) {
      return false; // Let caller close the menu.
    }
    
    return false;
  }
}