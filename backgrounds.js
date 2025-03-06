class Backgrounds {
  constructor() {
    // Available background themes
    this.themes = {
      'night': {
        name: 'Night Sky',
        mainColor: color(20, 24, 82),
        floorColor: color(30, 34, 102),
        particleColor: color(255, 255, 255),
        particleCount: 100,
        description: 'A peaceful starry night'
      },
      'day': {
        name: 'Sunny Day',
        mainColor: color(135, 206, 235),
        floorColor: color(34, 139, 34),
        particleColor: color(255, 255, 255),
        particleCount: 10,
        description: 'Bright blue skies and green grass'
      },
      'space': {
        name: 'Outer Space',
        mainColor: color(5, 5, 20),
        floorColor: color(20, 20, 40),
        particleColor: color(255, 255, 255),
        particleCount: 200,
        description: 'Deep space exploration'
      },
      'underwater': {   
        name: 'Underwater',
        mainColor: color(0, 105, 148),
        floorColor: color(0, 70, 105),
        particleColor: color(255, 255, 255, 150),
        particleCount: 40,
        description: 'Beneath the waves'
      }
    };
    
    // Default theme
    this.currentTheme = 'night';
    
    // Particles for dynamic backgrounds
    this.particles = [];
    this.initParticles();
  }
  
  // Initialize particles based on current theme
  initParticles() {
    this.particles = [];
    const theme = this.themes[this.currentTheme];
    
    for (let i = 0; i < theme.particleCount; i++) {
      this.particles.push({
        x: random(width),
        y: random(height),
        size: random(1, 4),
        speed: random(0.1, 0.5),
        brightness: random(100, 255),
        twinkleSpeed: random(0.02, 0.05)
      });
    }
  }
  
  // Change to a different theme
  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
      // Do not reinitialize particles here to avoid resetting animations
      return true;
    }
    return false;
  }
  
  // Get next theme in rotation
  getNextTheme() {
    const themeKeys = Object.keys(this.themes);
    const currentIndex = themeKeys.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    return themeKeys[nextIndex];
  }
  
  // Get list of all available themes
  getThemesList() {
    const themeInfo = [];
    for (const [key, theme] of Object.entries(this.themes)) {
      themeInfo.push({
        id: key,
        name: theme.name,
        description: theme.description,
        isActive: key === this.currentTheme
      });
    }
    return themeInfo;
  }
  
  // Draw the background for the play area
  draw(playableArea) {
    const theme = this.themes[this.currentTheme];
    
    // Draw background
    background(theme.mainColor);
    
    // Update and draw particles based on current theme
    this.updateParticles(playableArea);
    
    // Draw floor/ground
    this.drawFloor(playableArea, theme);
    
    // Draw theme-specific elements
    switch(this.currentTheme) {
      case 'night':
        this.drawNightSky(playableArea);
        break;
      case 'day':
        this.drawDaySky(playableArea);
        break;
      case 'space':
        this.drawSpace(playableArea);
        break;
      case 'underwater':
        this.drawUnderwater(playableArea);
        break;
    }
  }
  
  // Update particle positions and appearance
  updateParticles(playableArea) {
    const theme = this.themes[this.currentTheme];
    
    for (let particle of this.particles) {
      // Only draw particles in the playable area
      if (particle.y < playableArea.height) {
        
        // Update particle based on theme
        if (this.currentTheme === 'night' || this.currentTheme === 'space') {
          // Stars twinkle but don't move much
          fill(theme.particleColor, 
               particle.brightness + sin(frameCount * particle.twinkleSpeed) * 50);
          noStroke();
          ellipse(particle.x, particle.y, particle.size);
        } 
        else if (this.currentTheme === 'underwater') {
          // Bubbles float up
          particle.y -= particle.speed;
          if (particle.y < 0) particle.y = playableArea.height;
          
          // Draw bubble
          fill(theme.particleColor, 100);
          stroke(theme.particleColor, 150);
          strokeWeight(0.5);
          ellipse(particle.x, particle.y, particle.size * 2);
        }
        else if (this.currentTheme === 'day') {
          // Clouds drift slowly
          particle.x += particle.speed * 0.2;
          if (particle.x > width) particle.x = -50;
          
          // Draw cloud puff
          fill(theme.particleColor, 150);
          noStroke();
          ellipse(particle.x, particle.y, particle.size * 10);
          ellipse(particle.x + 10, particle.y + 5, particle.size * 8);
          ellipse(particle.x - 10, particle.y + 5, particle.size * 8);
        }
      }
    }
  }
  
  // Draw the floor/ground area
  drawFloor(playableArea, theme) {
    fill(theme.floorColor);
    noStroke();
    rect(0, playableArea.height * 0.8, width, playableArea.height * 0.2);
    
    // Add some texture to the floor based on theme
    if (this.currentTheme === 'day') {
      // Grass texture
      fill(44, 160, 44, 100);
      for (let i = 0; i < width; i += 15) {
        rect(i, playableArea.height * 0.8, 5, -random(2, 8));
      }
    }
    else if (this.currentTheme === 'underwater') {
      // Underwater sand ripples
      stroke(255, 255, 255, 30);
      strokeWeight(1);
      for (let i = 0; i < 5; i++) {
        let y = playableArea.height * (0.8 + i * 0.04);
        beginShape();
        for (let x = 0; x < width; x += 20) {
          vertex(x, y + sin(x * 0.05 + i) * 3);
        }
        endShape();
      }
    }
  }
  
  // Theme-specific drawing functions
  drawNightSky(playableArea) {
    // Draw moon
    fill(255, 255, 230, 200);
    noStroke();
    ellipse(width * 0.8, height * 0.2, 60);
    
    // Moon crater details
    fill(200, 200, 180, 50);
    ellipse(width * 0.82, height * 0.18, 15);
    ellipse(width * 0.78, height * 0.23, 10);
    ellipse(width * 0.76, height * 0.17, 12);
  }
  
  drawDaySky(playableArea) {
    // Draw sun
    let sunGlow = drawingContext.createRadialGradient(
      width * 0.2, height * 0.2, 0, 
      width * 0.2, height * 0.2, 100
    );
    sunGlow.addColorStop(0, color(255, 255, 200, 255));
    sunGlow.addColorStop(1, color(255, 255, 0, 0));
    
    drawingContext.fillStyle = sunGlow;
    ellipse(width * 0.2, height * 0.2, 200);
    
    // Sun center
    fill(255, 255, 200);
    ellipse(width * 0.2, height * 0.2, 50);
  }
  
  drawSpace(playableArea) {
    // Draw distant galaxy
    noStroke();
    
    // Nebula effect
    for (let i = 0; i < 5; i++) {
      let x = width * random(0.1, 0.9);
      let y = playableArea.height * random(0.1, 0.7);
      let r = random(50, 150);
      
      let nebulaColor = color(
        random(100, 200),
        random(50, 150),
        random(150, 255),
        30
      );
      
      fill(nebulaColor);
      ellipse(x, y, r);
    }
    
    // Draw planet
    fill(100, 150, 200);
    ellipse(width * 0.3, playableArea.height * 0.3, 40);
    
    // Planet ring
    push();
    translate(width * 0.3, playableArea.height * 0.3);
    rotate(PI/4);
    noFill();
    stroke(150, 150, 200, 200);
    strokeWeight(3);
    ellipse(0, 0, 60, 15);
    pop();
  }
  
  drawUnderwater(playableArea) {
    // Light rays from surface
    for (let i = 0; i < 10; i++) {
      let x = width * (i / 10);
      let rayWidth = random(30, 80);
      
      noStroke();
      fill(200, 255, 255, 20);
      beginShape();
      vertex(x, 0);
      vertex(x + rayWidth, 0);
      vertex(x + rayWidth/2, playableArea.height * 0.8);
      endShape(CLOSE);
    }
    
    // Underwater plants
    for (let i = 0; i < 8; i++) {
      let x = width * (i / 8);
      let plantHeight = random(30, 80);
      
      push();
      translate(x, playableArea.height * 0.8);
      
      // Draw seaweed
      stroke(0, 150, 80);
      noFill();
      strokeWeight(3);
      beginShape();
      for (let y = 0; y < plantHeight; y += 5) {
        let xOffset = sin((frameCount * 0.02) + (i * 0.5) + (y * 0.1)) * 5;
        curveVertex(xOffset, -y);
      }
      endShape();
      pop();
    }
  }
  
  // Resize event handler
  resize() {
    // Reinitialize particles to match new dimensions
    this.initParticles();
  }
}