class Account {
    constructor(initialDeposit, intialPin,bank){
        this.userPin = intialPin;
        this.userBalance = initialDeposit;
        this.bankID = bank;
        this.accountLedger = [];
    }

    setPin(newPin) {
        this.userPin = newPin;
      };

    updateLedger(newBalance){
        var newEntry, transactionType, difference;
        if (this.userBalance > newBalance) {
          transactionType = "Debit";
          difference = "-" + (this.userBalance - newBalance);
        }
        else if (this.userBalance < newBalance) {
          transactionType = "Credit";
          difference = "+" + (newBalance - this.userBalance).toFixed(2);
        }
        else{
          return;
        }
        newEntry = [new Date(), transactionType, difference, newBalance];
        this.accountLedger.unshift(newEntry);
    }

    changeBalance (newBalance) {
        this.updateLedger(newBalance);
        this.userBalance = newBalance;
      }

    validate(pin, bank) {
        if (pin === this.userPin && bank === this.bankID) {
          return true;
        }
        return false;
      }
    
    setNewPin(pin, bank, newPin) {
        if ( this.validate(pin, bank) ) {
          this.setPin(newPin);
        }
        else {
          return "invalid credentials";
        }
     }

    retrieveBalance(pin, bank) {
        if ( this.validate(pin, bank) ) {
          return this.userBalance;
        }
        return "invalid credentials";
     }

    retrieveLedger(pin, bank) {
        if ( this.validate(pin, bank) ) {
          return this.accountLedger;
        }
        return "invalid credentials";
     }

    editBalance(pin, bank, newBalance) {
        if ( this.validate(pin, bank) ) {
          this.changeBalance(newBalance);
          return this.userBalance;
        }
        return "invalid credentials";
    }
}

module.exports = Account;