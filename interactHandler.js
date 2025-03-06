class InteractHandler {
  constructor() {
    this.enabled = true;
    this.doubleTapThreshold = 300; // ms between taps to count as double-tap
    this.lastTapTime = 0;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.callbacks = {
      onPetInteract: null,
      onBorderInteract: null,
      onHouseInteract: null,
      onDoubleTap: null,
      onDrag: null
    };
    
    // Reference to objects that can be interacted with
    this.pet = null;
    this.border = null;
    this.playArea = null;
    this.house = null;
  }
  
  // Set up references to interactive elements
  setReferences(pet, border, playArea, house) {
    this.pet = pet;
    this.border = border;
    this.playArea = playArea;
    this.house = house;
  }
  
  // Set callbacks for different interaction types
  setCallbacks(callbacks) {
    Object.assign(this.callbacks, callbacks);
  }
  
  // Enable or disable interaction temporarily
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  
  // Main handler for mouse clicks
  handleMousePressed(mouseX, mouseY) {
    if (!this.enabled) return;
    
    // First check: if the click is inside the house area, let the house handle it.
    if (this.house && typeof this.house.contains === "function" && this.house.contains(mouseX, mouseY)) {
      // This will toggle the pet’s resting state (entering or leaving) per your house.interact implementation.  
      const interacted = this.house.interact(mouseX, mouseY);
      return;
    }
    
    // Then check if we clicked in the border area.
    if (this.border && this.border.isInBorder(mouseX, mouseY)) {
      // Check if a button was clicked
      const buttonClicked = this.border.handleClick(mouseX, mouseY);
      
      // If no button was clicked, trigger generic border interaction
      if (!buttonClicked && this.callbacks.onBorderInteract) {
        this.callbacks.onBorderInteract(mouseX, mouseY);
      }
    } 
    // Otherwise check if we clicked on the pet
    else if (this.pet) {
      const interacted = this.pet.interact(mouseX, mouseY);
      if (interacted && this.callbacks.onPetInteract) {
        this.callbacks.onPetInteract(mouseX, mouseY);
      }
    }
  }
  
  // Handler for mouse moves (for button hover effects)
  handleMouseMoved(mouseX, mouseY) {
    if (!this.enabled) return;
    
    if (this.border) {
      this.border.checkButtonHover(mouseX, mouseY);
    }
  }
  
  // Handler for touch start events (mobile)
  handleTouchStart(touchX, touchY) {
    if (!this.enabled) return;
    
    this.touchStartX = touchX;
    this.touchStartY = touchY;
    
    // Check for double-tap
    const currentTime = millis();
    if (currentTime - this.lastTapTime < this.doubleTapThreshold) {
      if (this.callbacks.onDoubleTap) {
        this.callbacks.onDoubleTap(touchX, touchY);
      }
    }
    this.lastTapTime = currentTime;
    
    // Handle as regular tap/click too
    this.handleMousePressed(touchX, touchY);
  }
  
  // Handler for touch end events (mobile)
  // Remove swipe detection from touchEnd
  handleTouchEnd(touchX, touchY) {
    if (!this.enabled) return;
    
    // No swipe detection needed
  }
  
  // Handler for touch move events (mobile)
  handleTouchMove(touchX, touchY) {
    if (!this.enabled || !this.callbacks.onDrag) return;
    
    // Check if we're dragging significant distance
    const dx = touchX - this.touchStartX;
    const dy = touchY - this.touchStartY;
    const distance = sqrt(dx*dx + dy*dy);
    
    if (distance > 10) { // Small threshold to avoid accidental drags
      this.callbacks.onDrag(touchX, touchY, dx, dy);
    }
  }
}