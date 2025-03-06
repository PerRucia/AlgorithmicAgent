class Border {
  constructor() {
    this.thickness = 0; // Will be set during setup
    this.mainColor = color(110, 180, 235, 220); // Soft blue border color
    this.accentColor = color(80, 150, 210); // Darker blue for accents
    this.patternOffset = 0; // For animated pattern
    this.buttons = []; // Will hold interaction buttons later
    this.borderPattern = 'stars'; // Border pattern style: 'clouds', 'gradient', 'stars', 'simple'
    
    // Button properties
    this.buttonSize = 0; // Will be set based on border thickness
    this.buttonPadding = 10;
    this.buttonColor = color(255, 255, 255, 220);
    this.buttonHoverColor = color(255, 255, 255, 255);
    this.buttonTextColor = color(60, 100, 150);
    
    // Panel specific properties
    this.panelHeight = 0; // Will be set during setup (total height of both sections)
    this.buttonSectionWidth = 0; // Width of left section with buttons (2/3 of panel width)
    this.statusSectionWidth = 0; // Width of right section with status (1/3 of panel width)
  }
  
  setThickness(thickness) {
    this.thickness = thickness;
    this.panelHeight = height * 0.4; // Bottom panel takes 40% of screen height
    
    // Swap sections - Now 1/3 for status (left) and 2/3 for buttons (right)
    this.statusSectionWidth = width * (1/3);
    this.buttonSectionWidth = width * (2/3);
    
    // Size buttons based on width rather than height
    const buttonSpacing = 4; // Number of spaces (3 buttons + margins on both sides)
    this.buttonSize = this.buttonSectionWidth / buttonSpacing;
    
    // Cap the button size to not exceed 90% of panel height
    this.buttonSize = min(this.buttonSize, this.panelHeight * 0.9);
    
    // Create buttons
    this.createButtons();
  }
  
  createButtons() {
    // Clear existing buttons
    this.buttons = [];
    
    // Calculate available width for buttons in the RIGHT section now
    const availableWidth = this.buttonSectionWidth;
    
    // Position the three buttons evenly in the button section
    // but offset by the status section width since buttons are now on the right
    const buttonSpacing = availableWidth / 4; // Divide section into 4 parts for 3 buttons
    const shopX = this.statusSectionWidth + buttonSpacing;           
    const inventoryX = this.statusSectionWidth + buttonSpacing * 2;  
    const backgroundsX = this.statusSectionWidth + buttonSpacing * 3;
    
    // Center buttons vertically in panel
    const buttonY = height - this.panelHeight/2;
    
    // Create shop button
    this.buttons.push({
      x: shopX,
      y: buttonY,
      width: this.buttonSize,
      height: this.buttonSize,
      label: "Shop",
      type: "shop",
      isHovered: false,
      action: () => {
        console.log("Shop button clicked");
        // Add shop functionality here
      }
    });
    
    // Create inventory button
    this.buttons.push({
      x: inventoryX,
      y: buttonY,
      width: this.buttonSize,
      height: this.buttonSize,
      label: "Items",
      type: "inventory",
      isHovered: false,
      action: () => {
        console.log("Inventory button clicked");
        // Add inventory functionality here
      }
    });
  
    // Create backgrounds button
    this.buttons.push({
      x: backgroundsX,
      y: buttonY,
      width: this.buttonSize,
      height: this.buttonSize,
      label: "Themes",
      type: "backgrounds",
      isHovered: false,
      action: () => {
        console.log("Themes button clicked - changing background");
        
        // Make sure the backgrounds reference exists
        if (typeof backgrounds !== 'undefined') {
          // Get the next theme in rotation and set it
          const nextTheme = backgrounds.getNextTheme();
          backgrounds.setTheme(nextTheme);
          
          // Show theme change message
          const themeName = backgrounds.themes[nextTheme].name;
          console.log(`Theme changed to: ${themeName}`);
        } else {
          console.error("Backgrounds reference not found!");
        }
      }
    });
  }
  
  setColor(r, g, b, a = 255) {
    this.mainColor = color(r, g, b, a);
    this.accentColor = color(
      constrain(r - 30, 0, 255), 
      constrain(g - 30, 0, 255), 
      constrain(b - 30, 0, 255)
    );
  }
  
  display() {
    // Update pattern animation
    this.patternOffset += 0.005;
    
    // Draw border background (bottom panel only)
    noStroke();
    
    // Draw starry bottom panel
    this._drawStarryBottomPanel();
    
    // Draw divider line between sections
    this._drawSectionDivider();
    
    // Add subtle inner shadow for depth
    this._drawInnerShadow();
    
    // Display buttons
    this._drawButtons();
    
    // Draw placeholder for status section
    this._drawStatusSection();
  }
  
  _drawButtons() {
    // Display all buttons
    for (let button of this.buttons) {
      push();
      
      // Button background
      rectMode(CENTER);
      
      // Button hover effect
      if (button.isHovered) {
        fill(this.buttonHoverColor);
        // Add slight glow effect
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = color(255, 255, 255, 150);
      } else {
        fill(this.buttonColor);
      }
      
      stroke(this.accentColor);
      strokeWeight(2);
      
      // Scale corner radius with button size (8% of button width)
      const cornerRadius = button.width * 0.08;
      rect(button.x, button.y, button.width, button.height, cornerRadius);
      
      // Button icon - position higher up in the button
      push();
      noStroke();
      translate(button.x, button.y - button.height * 0.1); // Move icon higher within button
      
      if (button.type === "shop") {
        this._drawShopIcon(0, 0, button.width * 0.6);
      } else if (button.type === "inventory") {
        this._drawInventoryIcon(0, 0, button.width * 0.6);
      } else if (button.type === "backgrounds") {
        this._drawBackgroundsIcon(0, 0, button.width * 0.6);
      }
      pop();
      
      // Button label - move label down
      fill(this.buttonTextColor);
      noStroke();
      textSize(this.buttonSize * 0.25);
      textAlign(CENTER, CENTER);
      text(button.label, button.x, button.y + button.height * 0.32); // Label positioned more toward bottom
      
      pop();
    }
  }
  
  _drawShopIcon(x, y, size) {
    // Shop icon - simple storefront
    fill(this.buttonTextColor);
    
    // Store roof
    triangle(
      x, y - size * 0.3,
      x - size * 0.4, y - size * 0.1,
      x + size * 0.4, y - size * 0.1
    );
    
    // Store base
    rect(x, y + size * 0.1, size * 0.7, size * 0.4, 2);
    
    // Door
    fill(this.buttonColor);
    rect(x, y + size * 0.15, size * 0.25, size * 0.3);
    
    // Windows
    rect(x - size * 0.25, y, size * 0.15, size * 0.15);
    rect(x + size * 0.25, y, size * 0.15, size * 0.15);
  }
  
  _drawInventoryIcon(x, y, size) {
    // Inventory bag icon
    fill(this.buttonTextColor);
    
    // Bag body
    beginShape();
    vertex(x - size * 0.3, y - size * 0.1);
    vertex(x + size * 0.3, y - size * 0.1);
    vertex(x + size * 0.4, y + size * 0.3);
    vertex(x - size * 0.4, y + size * 0.3);
    endShape(CLOSE);
    
    // Bag handles
    noFill();
    stroke(this.buttonTextColor);
    strokeWeight(size * 0.08);
    arc(x - size * 0.15, y - size * 0.1, size * 0.3, size * 0.3, PI, TWO_PI);
    arc(x + size * 0.15, y - size * 0.1, size * 0.3, size * 0.3, PI, TWO_PI);
  }

  _drawBackgroundsIcon(x, y, size) {
    // Backgrounds/Themes icon - landscape with sun
    fill(this.buttonTextColor);
  
    // Sky (upper rectangle)
    rect(x, y - size * 0.05, size * 0.7, size * 0.3, 2);
  
    // Sun
    fill(this.buttonColor);
    ellipse(x + size * 0.15, y - size * 0.15, size * 0.2, size * 0.2);
  
    // Ground (lower rectangle)
    fill(this.buttonTextColor);
    rect(x, y + size * 0.2, size * 0.7, size * 0.2, 2);
  
    // Small mountain/hill
    triangle(
    x - size * 0.2, y + size * 0.1,
    x - size * 0.05, y - size * 0.05,
    x + size * 0.1, y + size * 0.1
    );
  
    // Taller mountain/hill
    triangle(
    x + size * 0.05, y + size * 0.1,
    x + size * 0.25, y - size * 0.1,
    x + size * 0.35, y + size * 0.1
    );
  }
  
  // Draw a starry bottom panel
  _drawStarryBottomPanel() {
    // Draw base panel
    fill(this.mainColor);
    rect(0, height - this.panelHeight, width, this.panelHeight);
    
    // Add starry pattern
    fill(255, 255, 255, 200);
    noStroke();
    
    // Use deterministic positions but random sizes for stars
    randomSeed(42); // Consistent star pattern
    
    // Bottom panel stars
    for (let i = 0; i < width; i += 20) {
      let starX = i + random(-10, 10);
      let starY = height - this.panelHeight + random(this.panelHeight);
      let starSize = random(1, 4);
      ellipse(starX, starY, starSize, starSize);
    }
    
    // Add some twinkling stars
    for (let i = 0; i < 20; i++) {
      let twinkleX = random(width);
      let twinkleY = height - this.panelHeight + random(this.panelHeight);
      
      // Make it twinkle based on time
      let twinkleSize = 2 + sin(frameCount * 0.1 + i) * 2;
      fill(255, 255, 255, 150 + sin(frameCount * 0.1 + i * 0.5) * 100);
      ellipse(twinkleX, twinkleY, twinkleSize, twinkleSize);
    }
  }
  
  // Draw vertical divider between button section and status section
  _drawSectionDivider() {
    stroke(0, 0, 0, 40); // Semi-transparent black
    strokeWeight(2);
    const dividerX = this.statusSectionWidth; // Now the divider is after the status section
    line(dividerX, height - this.panelHeight, dividerX, height);
  }
  
  // Draw placeholder status section
  _drawStatusSection() {
    // Status section is on the LEFT side.
    const statusX = 10; // left margin
    const statusY = height - this.panelHeight + 10; // top inside the status panel
    
    // Draw a subtle background for the status section
    noStroke();
    fill(0, 0, 0, 15);
    rectMode(CORNER);
    rect(0, height - this.panelHeight, this.statusSectionWidth, this.panelHeight);
    
    // If currency exists, display it at a top position inside status panel
    if (typeof currency !== 'undefined') {
      // Adjust vertical position as needed
      this._drawCurrencyStatus(this.statusSectionWidth / 2, height - this.panelHeight * 0.6);
    }
    
    // Draw the pet status meters below the currency display
    this._drawPetStatus(statusX, height - this.panelHeight * 0.3);
  }
  
  _drawInnerShadow() {
    // Draw subtle inner shadow for depth
    noFill();
    strokeWeight(2);
    
    // Top edge of bottom panel - subtle shadow
    stroke(0, 0, 0, 20);
    line(0, height - this.panelHeight, width, height - this.panelHeight);
  }
  
  isInBorder(x, y) {
    // Check if point is in bottom panel
    return y > height - this.panelHeight;
  }
  
  // Check if a point is over any button
  checkButtonHover(x, y) {
    let hoveredButton = null;
    
    for (let button of this.buttons) {
      // Check if point is inside button using CENTER rectMode calculation
      if (abs(x - button.x) <= button.width/2 && 
          abs(y - button.y) <= button.height/2) {
        button.isHovered = true;
        hoveredButton = button;
      } else {
        button.isHovered = false;
      }
    }
    
    return hoveredButton;
  }
  
  // Handle button clicks
  handleClick(x, y) {
    const clickedButton = this.checkButtonHover(x, y);
    if (clickedButton) {
      console.log("Button clicked:", clickedButton.label);
      clickedButton.action();
      return true;
    }
    console.log("Border clicked but no button found");
    return false;
  }
  
  // Get the playable area dimensions (for the pet to move in)
  getPlayableArea() {
    return {
      x: 0,
      y: 0,
      width: width,
      height: height - this.panelHeight
    };
  }
  
  // Handle window resize
  resize() {
    this.panelHeight = height * 0.4;
    
    // Swap sections here too
    this.statusSectionWidth = width * (1/3);
    this.buttonSectionWidth = width * (2/3);
    
    // Update button size based on width
    const buttonSpacing = 4;
    this.buttonSize = this.buttonSectionWidth / buttonSpacing;
    
    // Cap the button size to not exceed 90% of panel height
    this.buttonSize = min(this.buttonSize, this.panelHeight * 0.9);
    
    // Recreate buttons with updated positions
    this.createButtons();
  }

  _drawUserStatus() {
    // Use the full width of the status section
    const availableWidth = this.statusSectionWidth;
    // We'll draw everything centered horizontally; set barWidth to 80% of available width
    const barWidth = availableWidth * 0.8;
    const x0 = (availableWidth - barWidth) / 2;
    
    // Let’s define vertical parameters based on panel height.
    // For example, leave a top and bottom margin of 10% each.
    const marginY = this.panelHeight * 0.1;
    const availableHeight = this.panelHeight - 2 * marginY;
    
    // We have 5 rows (4 status bars + 1 coin counter)
    const numRows = 5;
    // Use a small gap between rows
    const gap = this.panelHeight * 0.02;
    // The bar (or coin row) height is computed accordingly
    const barHeight = (availableHeight - (numRows - 1) * gap) / numRows;
    
    // The starting y position (top of status section)
    let currentY = height - this.panelHeight + marginY;
    
    // Set text properties
    textSize(this.panelHeight * 0.04);
    textAlign(LEFT, CENTER);
    
    // --- Draw Health Bar ---
    fill(255);
    text("Health", x0, currentY + barHeight/2);
    fill(200, 50, 50);
    rect(x0, currentY + gap, barWidth * (myPet.health / 100), barHeight);
    currentY += barHeight + gap;
    
    // --- Draw Energy Bar ---
    fill(255);
    text("Energy", x0, currentY + barHeight/2);
    fill(50, 50, 200);
    rect(x0, currentY + gap, barWidth * (myPet.energy / 100), barHeight);
    currentY += barHeight + gap;
    
    // --- Draw Hunger Bar ---
    fill(255);
    text("Hunger", x0, currentY + barHeight/2);
    fill(50, 200, 50);
    // We assume 0 means full and 100 starving; so use (100 - hunger)
    rect(x0, currentY + gap, barWidth * ((100 - myPet.hunger) / 100), barHeight);
    currentY += barHeight + gap;
    
    // --- Draw Mood Bar ---
    fill(255);
    text("Mood", x0, currentY + barHeight/2);
    fill(200, 200, 50);
    rect(x0, currentY + gap, barWidth * (myPet.mood / 100), barHeight);
    currentY += barHeight + gap;
    
    // --- Draw Coin Counter ---
    // We'll draw a coin icon and the formatted coin amount side by side.
    const coinIconSize = barHeight * 0.75; // Use bar height as reference for coin size
    
    // Draw coin icon
    push();
    translate(x0 + coinIconSize/2, currentY + barHeight/2); // position at the beginning of the row
    fill(255, 215, 0); // gold
    stroke(200, 150, 0);
    strokeWeight(1);
    ellipse(0, 0, coinIconSize, coinIconSize);
    
    // Draw "$" symbol over the coin
    fill(200, 150, 0);
    noStroke();
    textSize(coinIconSize * 0.6);
    textAlign(CENTER, CENTER);
    text("$", 0, -1);
    pop();
    
    // Draw coin amount next to the icon
    fill(255);
    textAlign(RIGHT, CENTER);
    textSize(this.panelHeight * 0.1);
    text(currency.getFormattedBalance(), x0 + barWidth, currentY + barHeight/2);
  }
  
  _drawStatusSection() {
    // Draw background for status panel
    noStroke();
    fill(0, 0, 0, 15);
    rectMode(CORNER);
    rect(0, height - this.panelHeight, this.statusSectionWidth, this.panelHeight);
    
    // Call our combined status drawing function
    this._drawUserStatus();
  }
}