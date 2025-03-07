class Feed {
  constructor() {
    this.tableColor = color(160, 82, 45);
    this.legColor = color(120, 66, 18);
    this.outlineColor = color(80);
    
    // This single variable controls the table scale relative to the playable area's width.
    this.tableScale = 0.20;
    
    // Keep track of number of servings on table
    this.foodServings = 0;
  }
  
  // Place a food item on the table.
  placeFood(food) {
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
    
    let gap = 10;
    let currentX = tableX + gap;
    let posY = tableY;
      
    const pelletDiameter = 20;
    const pelletSpacing = 25;

    // Draw a pellet for each serving.
    for (let s = 0; s < this.foodServings; s++) {
      push();
      fill(255, 0, 0);
      noStroke();
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
    const tableX = playableArea.x + playableArea.width * 0.1;
    const tableY = playableArea.y + playableArea.height * 0.8;
    
    // The table's width is now controlled by the tableScale variable.
    const tableWidth = playableArea.width * this.tableScale;
    
    // The table top thickness, leg dimensions, etc. are proportional to the tableWidth.
    const tableTopThickness = tableWidth * 0.15;  
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
    
    this.displayPlacedFood(playableArea);
  }
}