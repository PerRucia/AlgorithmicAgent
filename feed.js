class Feed {
    constructor() {
      // Set up default dimensions/colors if needed.
      // Using a wood-like color for the table.
      this.tableColor = color(160, 82, 45);
      this.legColor = color(120, 66, 18);
      this.outlineColor = color(80);
      
      // This single variable controls the table scale relative to the playable area's width.
      this.tableScale = 0.20;
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
    }
}