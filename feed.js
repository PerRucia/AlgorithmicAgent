class Feed {
  constructor() {
    // Set up default dimensions/colors if needed.
    // Using a wood-like color for the table.
    this.tableColor = color(160, 82, 45);
    this.legColor = color(120, 66, 18);
    this.outlineColor = color(80);
    
    // This single variable controls the table scale relative to the playable area's width.
    this.tableScale = 0.20;
    
    // Keep track of number of servings on table
    this.foodServings = 0;
  }
  
  // Place a food item on the table.
  // 'food' is expected to be an object with at least a 'name' property.
  placeFood(food) {
    // Use a switch case to determine number of servings based on food name.
    let servings = 0;
    switch (food.name) {
      case 'Burger':
        servings = 8;
        break;
      case 'Pizza':
        servings = 10;
        break;
      case 'Soda':
        servings = 3;
        break;
      case 'Apple':
        servings = 1;
        break;
      case 'Fries':
        servings = 5;
        break;
    }
    this.foodServings += servings;
  }
  
  // Optionally, clear all placed food.
  clearFood() {
    this.servings = 0;
  }
  
  // Display the food items that have been placed on the table.
  displayPlacedFood(playableArea) {
    // Calculate table position and dimensions.
    const tableX = playableArea.x + playableArea.width * 0.1;
    const tableY = playableArea.y + playableArea.height * 0.8;
    const tableWidth = playableArea.width * this.tableScale;
    const tableTopThickness = tableWidth * 0.15;
    
    // Set starting x position on the table top with a small gap.
    let gap = 10;
    let currentX = tableX + gap;
    // Vertically center food items on the table top.
    let posY = tableY;
      
    // Define drawing parameters for pellets.
    const pelletDiameter = 20;
    const pelletSpacing = 25;

    // Draw a pellet for each serving.
    for (let s = 0; s < this.foodServings; s++) {
      push();
      fill(255, 0, 0);
      noStroke();
      // ensure each added pellet does not exceed the table width, add to a new row if it does
      if (currentX + pelletDiameter > tableX + tableWidth - gap) {
        currentX = tableX + gap;
        posY -= pelletSpacing;
      }
      ellipse(currentX, posY, pelletDiameter);
      pop();
      currentX += pelletSpacing;
    }
  }

  eat() {
    if (this.foodServings > 0) {
      this.foodServings--;
      console.log("Yum! Servings left: " + this.foodServings);
    } else {
      console.log("No food left to eat!");
    }
  }
    
  // Display the food table in the bottom left of the playable area.
  display(playableArea) {
    // Define table top position within the playable area.
    const tableX = playableArea.x + playableArea.width * 0.1;
    const tableY = playableArea.y + playableArea.height * 0.8;
    
    // The table's width is now controlled by the tableScale variable.
    const tableWidth = playableArea.width * this.tableScale;
    
    // The table top thickness, leg dimensions, etc. are proportional to the tableWidth.
    const tableTopThickness = tableWidth * 0.15;  // Thickness of the table top.
    const legWidth = tableWidth * 0.15;
    const legHeight = tableWidth * 0.2;
    
    push();
    rectMode(CORNER);
    noStroke();
    
    // Draw the table top.
    fill(this.tableColor);
    rect(tableX, tableY, tableWidth, tableTopThickness, tableWidth * 0.05);
    
    // Draw the table legs.
    fill(this.legColor);
    // Left leg: positioned under the left side of the table top.
    rect(tableX + tableWidth * 0.1, tableY + tableTopThickness, legWidth, legHeight);
    // Right leg: positioned under the right side of the table top.
    rect(tableX + tableWidth - tableWidth * 0.1 - legWidth, tableY + tableTopThickness, legWidth, legHeight);
    
    // Optionally, draw an outline for the table top.
    noFill();
    stroke(this.outlineColor);
    strokeWeight(2);
    rect(tableX, tableY, tableWidth, tableTopThickness, tableWidth * 0.05);
    
    pop();
    
    // Draw any food items placed on the table.
    this.displayPlacedFood(playableArea);
  }
}