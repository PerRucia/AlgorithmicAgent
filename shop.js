class Shop {
  constructor() {
    // Shop is initially hidden.
    this.visible = false;
    this.inventory = null;
    this.currency = null;
    
    // Only two categories: Food and Backgrounds
    this.categories = ["Food", "Backgrounds"];
    this.selectedCategory = this.categories[0]; // default selected is "Food"

    // Food category items (unlimited stock).
    this.foodItems = [
      { id: 'burger', name: 'Burger', description: 'A juicy burger.\n\nWorth 7 servings.', price: 32, servings: 7 },
      { id: 'pizza', name: 'Pizza', description: 'A cheesy pizza.\n\nWorth 10 servings.', price: 40, servings: 10 },
      { id: 'fries', name: 'Fries', description: 'Crispy golden fries.\n\nWorth 5 servings.', price: 25, servings: 5 },
      { id: 'soda', name: 'Soda', description: 'A refreshing soda.\n\nWorth 3 servings.', price: 20, servings: 3 },
      { id: 'medicine', name: 'Medicine', description: 'Restores your pet to full health', price: 100, servings: 1 }
    ];

    // For the Backgrounds category, add purchasable background items.
    // Each background costs 1000 coins and can only be purchased once.
    this.backgroundItems = [
      { id: 'night', name: 'Night', description: 'A peaceful starry night background.', price: 100, stock: 1 },
      { id: 'space', name: 'Space', description: 'A deep space exploration background.', price: 100, stock: 1 },
      { id: 'underwater', name: 'Underwater', description: 'A calming underwater scene.', price: 100, stock: 1 }
    ];
    
    // Detail window for item info.
    this.detailWindowVisible = false;
    this.selectedItem = null;
    
    // Purchase dialog properties.
    this.purchaseDialogVisible = false;
    this.purchaseDialogMessage = "";
  }

  // Set references to other game objects.
  setReferences(inventory, currency) {
    this.inventory = inventory;
    this.currency = currency;
  }
  
  // Toggle shop visibility.
  toggleVisibility() {
    this.visible = !this.visible;
    if (!this.visible) {
      this.detailWindowVisible = false;
      this.selectedItem = null;
      this.purchaseDialogVisible = false;
    }
  }
  
  // Display the shop overlay.
  display() {
    if (!this.visible) return;
    
    push();
    // Draw a semi-transparent dark overlay.
    fill(0, 150);
    noStroke();
    rect(0, 0, width, height);
    
    // Define shop panel dimensions.
    const xPos = width * 0.05;
    const yPos = height * 0.05;
    const panelWidth = width * 0.9;
    const panelHeight = height * 0.9;
    
    // Draw the shop panel.
    fill(245, 245, 255);
    stroke(50);
    strokeWeight(2);
    rect(xPos, yPos, panelWidth, panelHeight, 10);
    
    // Header title.
    fill(30, 30, 120);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(28);
    text("SHOP", xPos + panelWidth / 2, yPos + 15);
    
    // Close button.
    const btnSize = 30;
    fill(220, 50, 50);
    noStroke();
    rect(xPos + panelWidth - btnSize - 10, yPos + 10, btnSize, btnSize, 5);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("X", xPos + panelWidth - btnSize / 2 - 10, yPos + 10 + btnSize / 2);
    
    // Category tabs.
    const tabHeight = 40;
    const tabWidth = panelWidth / this.categories.length;
    for (let i = 0; i < this.categories.length; i++) {
      let tabX = xPos + i * tabWidth;
      let tabY = yPos + 60;
      if (this.categories[i] === this.selectedCategory) {
        fill(100, 150, 250);
      } else {
        fill(180, 200, 250);
      }
      stroke(50);
      rect(tabX, tabY, tabWidth, tabHeight);
      
      fill(20, 20, 80);
      textAlign(CENTER, CENTER);
      textSize(20);
      text(this.categories[i], tabX + tabWidth / 2, tabY + tabHeight / 2);
    }
    
    // Display items based on selected category.
    if (this.selectedCategory === "Backgrounds") {
      this.displayBackgroundItems(xPos, yPos, panelWidth, panelHeight);
    } else if (this.selectedCategory === "Food") {
      this.displayFoodItems(xPos, yPos, panelWidth, panelHeight);
    }
    
    // Detail window for selected item.
    if (this.detailWindowVisible && this.selectedItem) {
      this.displayDetailWindow(panelWidth, panelHeight);
    }
    pop();

    // Display purchase dialog if visible.
    if (this.purchaseDialogVisible) {
      this.displayPurchaseDialog();
    }
  }
  
  // Display background items as square icon buttons.
  displayBackgroundItems(xPos, yPos, panelWidth, panelHeight) {
    const iconSize = 80;
    const spacing = 30;
    const totalWidth = this.backgroundItems.length * iconSize + (this.backgroundItems.length - 1) * spacing;
    const startX = xPos + (panelWidth - totalWidth) / 2;
    const iconY = yPos + 60 + 40 + 30; // below header & tabs
    
    for (let i = 0; i < this.backgroundItems.length; i++) {
      let itemX = startX + i * (iconSize + spacing);
      fill(100);
      stroke(50);
      rect(itemX, iconY, iconSize, iconSize, 5);
      
      // Quick icon sketch based on id.
      noStroke();
      if (this.backgroundItems[i].id === 'night') {
        // Draw a cresent moon in the middle of the icon.
        fill(255, 255, 0);
        ellipse(itemX + iconSize / 2, iconY + iconSize / 2, iconSize * 0.8);
        fill(100);
        // Slight increase the inner ellipse size to create a crescent effect.
        ellipse(itemX + iconSize * 0.6, iconY + iconSize * 0.4, iconSize * 0.6);

      } else if (this.backgroundItems[i].id === 'space') {
        // Draw a few yellow and white stars
        fill(255, 255, 0);
        ellipse(itemX + iconSize * 0.3, iconY + iconSize * 0.3, 5);
        ellipse(itemX + iconSize * 0.6, iconY + iconSize * 0.6, 5);
        fill(255);
        ellipse(itemX + iconSize * 0.8, iconY + iconSize * 0.2, 5);
        ellipse(itemX + iconSize * 0.4, iconY + iconSize * 0.7, 5);
      } else if (this.backgroundItems[i].id === 'underwater') {
        // Draw a few light blue circles to look like bubbles.
        fill(200, 200, 255);
        ellipse(itemX + iconSize * 0.2, iconY + iconSize * 0.6, 10);
        ellipse(itemX + iconSize * 0.6, iconY + iconSize * 0.6, 10);
        fill(150, 150, 255);
        ellipse(itemX + iconSize * 0.5, iconY + iconSize * 0.2, 10);
        ellipse(itemX + iconSize * 0.4, iconY + iconSize * 0.7, 10);

      }
      // Draw the background name below the icon.
      fill(0);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(16);
      text(this.backgroundItems[i].name, itemX + iconSize / 2, iconY + iconSize + 12);
    }
  }
  
  // Display food items with custom P5.js drawings arranged in a grid (max 3 per row).
  displayFoodItems(xPos, yPos, panelWidth, panelHeight) {
    const maxColumns = 3;
    const iconSize = 80;
    const spacing = 30;
    // Calculate grid width based on max columns.
    const gridWidth = maxColumns * iconSize + (maxColumns - 1) * spacing;
    // Center the grid horizontally.
    const startX = xPos + (panelWidth - gridWidth) / 2;
    // Position the grid below header/tabs.
    const startY = yPos + 60 + 40 + spacing;
    
    for (let i = 0; i < this.foodItems.length; i++) {
      let row = floor(i / maxColumns);
      let col = i % maxColumns;
      let itemX = startX + col * (iconSize + spacing);
      let itemY = startY + row * (iconSize + spacing);
      let item = this.foodItems[i];
      
      // Draw a dark background box for the item.
      push();
      noStroke();
      fill(100);  // Dark background.
      stroke(50)
      rect(itemX, itemY, iconSize, iconSize, 5);
      pop();
      
      // Draw a simple icon based on the food item id.
      push();
      translate(itemX, itemY);
      noStroke();
      switch (item.id) {
        case 'burger':
          // Draw burger: two ellipses for buns and a rectangle for the patty.
          fill(200, 150, 100);
          ellipse(iconSize / 2, iconSize * 0.3, iconSize * 0.8, iconSize * 0.4);
          fill(150, 75, 0);
          rect(iconSize * 0.15, iconSize * 0.35, iconSize * 0.7, iconSize * 0.3);
          fill(200, 150, 100);
          ellipse(iconSize / 2, iconSize * 0.75, iconSize * 0.8, iconSize * 0.4);
          break;
        case 'pizza':
          // Draw pizza with reduced size: circle with a triangle slice removed.
          fill(255, 200, 0);
          ellipse(iconSize / 2, iconSize / 2, iconSize * 0.8, iconSize * 0.8);
          fill(220, 100, 0);
          triangle(
            iconSize / 2, iconSize / 2, 
            iconSize * 0.75, iconSize * 0.15, 
            iconSize * 0.75, iconSize * 0.75
          );
          break;
        case 'fries':
          // Draw fries: several thin rectangles.
          fill(255, 230, 150);
          // Draw 4 fries instead of 10 for clarity.
          for (let j = 0; j < 9; j++) {
            rect(iconSize * 0.25 + j * 5, iconSize * 0.2, 3, iconSize * 0.6);
          }
          break;
        case 'soda':
          // Draw soda: a rectangle for the can and a circle on top.
          fill(180, 180, 255);
          rect(iconSize * 0.3, iconSize * 0.25, iconSize * 0.4, iconSize * 0.5, 5);
          fill(255);
          ellipse(iconSize / 2, iconSize * 0.25, iconSize * 0.3, iconSize * 0.2);
          break;
        case 'medicine':
          // Draw a pill bottle: a slightly rounded rectangle with a small red plus.
          // Bottle.
          fill(220);
          rect(0, 0, iconSize, iconSize * 0.8, 5);
          // Inner highlight.
          fill(255);
          rect(iconSize * 0.1, iconSize * 0.1, iconSize * 0.8, iconSize * 0.6, 5);
          // Red plus symbol.
          fill(255, 0, 0);
          let plusSize = iconSize * 0.2;
          rect(iconSize/2 - plusSize/8, iconSize/2 - plusSize/2, plusSize/4, plusSize, 2);
          rect(iconSize/2 - plusSize/2, iconSize/2 - plusSize/8, plusSize, plusSize/4, 2);
          break;
        default:
          fill(150);
          rect(0, 0, iconSize, iconSize, 5);
      }
      pop();
      
      // Draw the food name below the icon.
      fill(0);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(16);
      text(item.name, itemX + iconSize / 2, itemY + iconSize + 12);
    }
  }
  
  // Display a detail window for the selected item.
  displayDetailWindow(panelWidth, panelHeight) {
    const dw = panelWidth * 0.5;
    const dh = panelHeight * 0.4;
    const dx = width / 2 - dw / 2;
    const dy = height / 2 - dh / 2;
    push();
    fill(50);
    stroke(0);
    strokeWeight(2);
    rect(dx, dy, dw, dh, 10);
    
    fill(255);
    textAlign(CENTER, TOP);
    textSize(22);
    text(this.selectedItem.name, dx + dw / 2, dy + 20);
    
    textSize(16);
    textWrap(WORD);
    textAlign(CENTER, TOP);
    text(this.selectedItem.description, dx + dw * 0.1, dy + 60, dw * 0.8, dh - 150);
    
    // Show price.
    textSize(16);
    fill(255, 230, 0);
    text(`Price: ${this.selectedItem.price}`, dx + dw / 2, dy + dh - 100);
    
    // Close button for the detail window.
    const detailBtnSize = 25;
    fill(220, 50, 50);
    noStroke();
    rect(dx + dw - detailBtnSize - 10, dy + 10, detailBtnSize, detailBtnSize, 5);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("X", dx + dw - detailBtnSize / 2 - 10, dy + 10 + detailBtnSize / 2);
    
    // Buy button.
    const buyBtnWidth = dw * 0.4;
    const buyBtnHeight = 35;
    const buyBtnX = dx + dw / 2 - buyBtnWidth / 2;
    const buyBtnY = dy + dh - buyBtnHeight - 20;
    fill(0, 150, 0);
    stroke(0);
    rect(buyBtnX, buyBtnY, buyBtnWidth, buyBtnHeight, 5);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("Buy", buyBtnX + buyBtnWidth / 2, buyBtnY + buyBtnHeight / 2);
    pop();
  }
  
  // Display a purchase dialog overlay.
  displayPurchaseDialog() {
    push();
    // Semi-transparent full-screen overlay.
    fill(0, 150);
    noStroke();
    rect(0, 0, width, height);
    
    // Dialog box in center.
    const dialogWidth = width * 0.6;
    const dialogHeight = height * 0.2;
    const dx = width / 2 - dialogWidth / 2;
    const dy = height / 2 - dialogHeight / 2;
    fill(240);
    stroke(0);
    strokeWeight(2);
    rect(dx, dy, dialogWidth, dialogHeight, 10);
    
    // Set up text wrapping and margins.
    const margin = 20;
    fill(0);
    noStroke();
    textWrap(WORD);
    textAlign(CENTER, CENTER);
    textSize(24);
    // Draw the purchase dialog message inside the dialog box with margins.
    text(this.purchaseDialogMessage, dx + margin, dy + margin, dialogWidth - margin * 2, dialogHeight - margin * 2);
    pop();
  }
  
  // Handle mouse/touch presses in the shop.
  handleMousePressed(x, y) {
    // If a purchase dialog is visible, hide it on any click.
    if (this.purchaseDialogVisible) {
      this.purchaseDialogVisible = false;
      return true;
    }
    
    if (!this.visible) return false;
    
    const xPos = width * 0.05;
    const yPos = height * 0.05;
    const panelWidth = width * 0.9;
    const panelHeight = height * 0.9;
    const btnSize = 30;
    
    // Check for close button.
    const closeX = xPos + panelWidth - btnSize - 10;
    const closeY = yPos + 10;
    if (x > closeX && x < closeX + btnSize && y > closeY && y < closeY + btnSize) {
      this.visible = false;
      this.detailWindowVisible = false;
      return true;
    }
    
    // Category tab selection.
    const tabHeight = 40;
    const tabWidth = panelWidth / this.categories.length;
    const tabY = yPos + 60;
    for (let i = 0; i < this.categories.length; i++) {
      let tabX = xPos + i * tabWidth;
      if (x > tabX && x < tabX + tabWidth && y > tabY && y < tabY + tabHeight) {
        this.selectedCategory = this.categories[i];
        this.detailWindowVisible = false;
        return true;
      }
    }
    
    // Process item selection based on category.
    if (this.selectedCategory === "Backgrounds") {
      if (this.detailWindowVisible && this.selectedItem) {
        // Check detail window buttons.
        const dw = panelWidth * 0.5;
        const dh = panelHeight * 0.4;
        const dx = width / 2 - dw / 2;
        const dy = height / 2 - dh / 2;
        const detailBtnSize = 25;
        const closeDetailX = dx + dw - detailBtnSize - 10;
        const closeDetailY = dy + 10;
        if (x > closeDetailX && x < closeDetailX + detailBtnSize &&
            y > closeDetailY && y < closeDetailY + detailBtnSize) {
          this.detailWindowVisible = false;
          return true;
        }
        // Check the Buy button.
        const buyBtnWidth = dw * 0.4;
        const buyBtnHeight = 35;
        const buyBtnX = dx + dw / 2 - buyBtnWidth / 2;
        const buyBtnY = dy + dh - buyBtnHeight - 20;
        if (x > buyBtnX && x < buyBtnX + buyBtnWidth &&
            y > buyBtnY && y < buyBtnY + buyBtnHeight) {

          // Check if the background has already been purchased.
          if (this.selectedItem.stock !== undefined && this.selectedItem.stock <= 0) {
            this.detailWindowVisible = false;
            this.purchaseDialogMessage = "Item already purchased!";
            this.purchaseDialogVisible = true;
            return true;
          }
          
          // Purchase logic for backgrounds.
          if (this.currency.canAfford(this.selectedItem.price)) {
            this.currency.spendCoins(this.selectedItem.price, `Purchased ${this.selectedItem.name}`);
            this.inventory.addItem("backgrounds", this.selectedItem);
            // Decrement stock as backgrounds can be only purchased once.
            this.selectedItem.stock = 0;
            console.log("Purchased:", this.selectedItem.name);
            this.purchaseDialogMessage = `${this.selectedItem.name} purchased`;
          } else {
            console.log("Not enough coins to purchase", this.selectedItem.name);
            this.purchaseDialogMessage = "You do not have enough money!";
          }
          this.detailWindowVisible = false;
          this.purchaseDialogVisible = true;
          return true;
        }
      }
      // Otherwise, check for tapping an item icon.
      const iconSize = 80;
      const spacing = 20;
      const items = this.backgroundItems;
      const totalWidth = items.length * iconSize + (items.length - 1) * spacing;
      const startX = xPos + (panelWidth - totalWidth) / 2;
      const iconY = yPos + 60 + 40 + 30;
      for (let i = 0; i < items.length; i++) {
        let itemX = startX + i * (iconSize + spacing);
        if (x > itemX && x < itemX + iconSize &&
            y > iconY && y < iconY + iconSize) {
          this.selectedItem = items[i];
          this.detailWindowVisible = true;
          return true;
        }
      }
    } else if (this.selectedCategory === "Food") {
      if (this.detailWindowVisible && this.selectedItem) {
        // Detail window for food items.
        const dw = panelWidth * 0.5;
        const dh = panelHeight * 0.4;
        const dx = width / 2 - dw / 2;
        const dy = height / 2 - dh / 2;
        const detailBtnSize = 25;
        const closeDetailX = dx + dw - detailBtnSize - 10;
        const closeDetailY = dy + 10;
        if (x > closeDetailX && x < closeDetailX + detailBtnSize &&
            y > closeDetailY && y < closeDetailY + detailBtnSize) {
          this.detailWindowVisible = false;
          return true;
        }
        const buyBtnWidth = dw * 0.4;
        const buyBtnHeight = 35;
        const buyBtnX = dx + dw / 2 - buyBtnWidth / 2;
        const buyBtnY = dy + dh - buyBtnHeight - 20;
        if (x > buyBtnX && x < buyBtnX + buyBtnWidth &&
            y > buyBtnY && y < buyBtnY + buyBtnHeight) {
          // Purchase logic for food items (unlimited stock)
          if (this.currency.canAfford(this.selectedItem.price)) {
            this.currency.spendCoins(this.selectedItem.price, `Purchased ${this.selectedItem.name}`);
            this.inventory.addItem("food", this.selectedItem);
            console.log("Purchased:", this.selectedItem.name);
            this.purchaseDialogMessage = `${this.selectedItem.name} purchased`;
          } else {
            console.log("Not enough coins to purchase", this.selectedItem.name);
            this.purchaseDialogMessage = "You do not have enough money!";
          }
          this.detailWindowVisible = false;
          this.purchaseDialogVisible = true;
          return true;
        }
      }
      // Use the same grid layout as displayFoodItems for selection.
      const maxColumns = 3;
      const iconSize = 80;
      const spacing = 30;
      const items = this.foodItems;
      // Calculate grid width using maxColumns.
      const gridWidth = maxColumns * iconSize + (maxColumns - 1) * spacing;
      const startX = xPos + (panelWidth - gridWidth) / 2;
      const startY = yPos + 60 + 40 + spacing; // same vertical offset as in displayFoodItems
      
      for (let i = 0; i < items.length; i++) {
        let row = floor(i / maxColumns);
        let col = i % maxColumns;
        let itemX = startX + col * (iconSize + spacing);
        let itemY = startY + row * (iconSize + spacing);
        if (x > itemX && x < itemX + iconSize &&
            y > itemY && y < itemY + iconSize) {
          this.selectedItem = items[i];
          this.detailWindowVisible = true;
          return true;
        }
      }
    }
    return false;
  }
}