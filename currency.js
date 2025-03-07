class Currency {
    constructor(initialBalance = 0) {
      this.balance = initialBalance;
      this.transactionHistory = [];
      this.onBalanceChange = null; // Callback for balance changes
    }
    
    // Set callback for when balance changes
    setOnBalanceChangeCallback(callback) {
      this.onBalanceChange = callback;
    }
    
    // Add coins to balance
    addCoins(amount, reason = "unspecified") {
      if (amount <= 0) return false;
      
      this.balance += amount;
      
      // Record transaction
      this.transactionHistory.push({
        type: 'credit',
        amount: amount,
        reason: reason,
        timestamp: new Date(),
        balance: this.balance
      });
      
      // Trigger callback if defined
      if (this.onBalanceChange) {
        this.onBalanceChange(this.balance, amount, 'credit', reason);
      }
      
      console.log(`Added ${amount} coins (${reason}). New balance: ${this.balance}`);
      return true;
    }
    
    // Attempt to spend coins (returns true if successful)
    spendCoins(amount, reason = "unspecified") {
      if (amount <= 0 || this.balance < amount) return false;
      
      this.balance -= amount;
      
      // Record transaction
      this.transactionHistory.push({
        type: 'debit',
        amount: amount,
        reason: reason,
        timestamp: new Date(),
        balance: this.balance
      });
      
      // Trigger callback if defined
      if (this.onBalanceChange) {
        this.onBalanceChange(this.balance, amount, 'debit', reason);
      }
      
      console.log(`Spent ${amount} coins (${reason}). New balance: ${this.balance}`);
      return true;
    }

    // Add this method to the Currency class
    resetBalance(amount) {
      this.balance = amount;
      if (this.onBalanceChangeCallback) {
        this.onBalanceChangeCallback(this.balance, amount, "reset", "Game reset");
      }
      console.log(`Currency reset to ${amount}`);
    }
    
    // Get current balance
    getBalance() {
      return this.balance;
    }
    
    // Get nicely formatted balance with commas for thousands
    getFormattedBalance() {
      return this.balance.toLocaleString();
    }
    
    // Check if can afford an amount
    canAfford(amount) {
      return this.balance >= amount;
    }
    
    // Get last N transactions (default 5)
    getRecentTransactions(count = 5) {
      return this.transactionHistory
        .slice(-count)
        .reverse(); // Most recent first
    }
    
    // Award pet interaction bonus
    awardInteractionBonus(amount = 5) {
      return this.addCoins(amount, "pet interaction");
    }
  }