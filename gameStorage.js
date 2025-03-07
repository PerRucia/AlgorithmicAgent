class GameStorage {
  constructor() {
    this.storageKey = "algoAgentGameData";
    this.lastSaveTime = 0;
  }

  // Save all game data to localStorage
  saveGame(data) {
    try {
      // Get current game state
      const gameData = {
        version: 1,
        timestamp: Date.now(),
        pet: {
          health: data.pet.health,
          energy: data.pet.energy,
          happiness: data.pet.happiness,
          lastFed: data.pet.lastFed,
        },
        currency: {
          balance: data.currency.balance,
        },
        inventory: {
          items: data.inventory.items
        },
        backgrounds: {
          currentTheme: data.backgrounds.currentTheme
        },
        shop: {
          backgroundItems: data.shop.backgroundItems
        }
      };

      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(gameData));
      this.lastSaveTime = Date.now();
      
      console.log("Game saved successfully!");
      return true;
    } catch (error) {
      console.error("Failed to save game:", error);
      return false;
    }
  }

  // Load game data from localStorage
  loadGame() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      
      if (!savedData) {
        console.log("No saved game found.");
        return null;
      }
      
      const gameData = JSON.parse(savedData);
      console.log("Game data loaded successfully!");
      return gameData;
    } catch (error) {
      console.error("Failed to load game:", error);
      return null;
    }
  }

  // Check if a saved game exists
  hasSavedGame() {
    return localStorage.getItem(this.storageKey) !== null;
  }

  // Delete saved game data
  clearSavedGame() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log("Saved game cleared successfully!");
      return true;
    } catch (error) {
      console.error("Failed to clear saved game:", error);
      return false;
    }
  }

  // Get last save timestamp
  getLastSaveTime() {
    return this.lastSaveTime;
  }
}
