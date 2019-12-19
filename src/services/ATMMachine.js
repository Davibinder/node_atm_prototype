const prompt = require('prompt')
const colors = require('colors')
const Account = require('./Account')
const promptSchemas = require('./../model/ATMSchema')

const availableDenominations = [2000, 500, 200, 100, 50, 20, 10];
var ACCPRESET = 101010;

class ATMMachine {
    
    constructor(){
    this.bankID = Math.floor(Math.random() * 1000000000000000).toString(10);
    prompt.start();
    prompt.message = "";
    prompt.delimiter = " ";
    this.atmStatus = "ON";
    this.accounts = [];
    console.log("ATMMachine");
    }

    clearScreen() {
        process.stdout.write('\u001B[2J\u001B[0;0f');
      }  
  
    defaultScreenCallback  (err, choice) {
        this.clearScreen();
        if (err) { return; }
        //IF RESULT IS 1 START LOGIN PROCCESS IF 2 START NEW USER REGISTRATION//
        if (choice["default screen"] === "1") {
          prompt.get( promptSchemas.loginSchema, this.startSession.bind(this) );
        }
        else{
          //START NEW USER REGISTRATION PROCCESS//
          prompt.get( promptSchemas.userRegistration, this.userRegistrationCallback.bind(this) );
        }
    }
  
    userRegistrationCallback(err, credentials) {
        this.clearScreen();
        if (err) { return; }
        if ( credentials["secure pin"] !== credentials["verify pin"] ) {
          console.error("pin verification did not match".red);
          return prompt.get( promptSchemas.userRegistration, userRegistrationCallback.bind(this) );
        }
        var initDeposit = parseFloat( credentials["initial deposit"] );
        var initPin = credentials["secure pin"];
        var accountNumber = this.newAccount(initDeposit, initPin);
        var accountNumberString = accountNumber.toString(10).red;
        //FORMAT AND PROVIDE ACCOUNT NUMBER 1 TIME, DON'T LOOSE IT//
        console.log( "\n\n","WRITE THIS DOWN: your account number is ".blue + accountNumberString );
        this.startSession( err, {"account number": accountNumber, "pin": initPin}, true );
      };
  
      promptAnotherTransaction(){
        console.log("\n\n");  
        prompt.get( promptSchemas.anotherTransaction, this.anotherTransactionCallback.bind(this) );
      };
  
      anotherTransactionCallback(err, choice) {
        if (err) { return; }
        var answer = choice["another transaction?"].toLowerCase();
        if ( answer === "yes" || answer === "y" ) {
          this.transactionMenu();
        }
        else {
          //ENDS SESSION AND RESETS FOR NEXT USER//
          this.endSession();
        }
    }
  
    transactionMenu() {
        this.clearScreen();
        console.log(promptSchemas["transactionMenu"]["properties"]["transaction menu"]["menu"]);
        prompt.get( promptSchemas.transactionMenu, this.transactionMenuCallback.bind(this) );
    }
  
    newPinCallback(err, choice) {
        if (err) { return; }
        var error;
        var newPin = choice["new pin"];
        var verifyPin = choice["verify pin"];
        if(newPin === verifyPin){
          error =  this.session.setNewPin( this.sessionPin,  this.bankID, newPin);
          console.log("\n");
          //IF SOMEHOW VALIDATION FAILES ON THIS METHOD, THE SESSION IS IMMEDIATELY TERMINATED//
          if (error) {
            console.log("error: pin not set, ending  session..".red);
            return this.endSession();
          }
           this.sessionPin = newPin;
          console.log("pin successfully changed!".blue);
          this.promptAnotherTransaction.call(this);
        }else {
            console.log("error: Verify PIN failed".red);
            this.promptAnotherTransaction.call(this);
        }
    }
  
    withdrawFundsCallback(err, amount) {
        if (err) { return; }
        console.log("\n");
        var withdrawalAmount = parseInt(amount["withdraw funds"], 10);
        var billType = parseInt(amount["Preferred Denomination"], 10);
        //do further action
        var balance = this.withdrawFunds(withdrawalAmount);
        var balanceString = balance.toString(10) + " INR".blue;
        //LOG ERROR TO CONSOLE IF BALANCE ISN'T ENOUGH TO COVER REQUEST//
        //AND GIVE USER OPTION TO END SESSION//
        if (balance === "insufficient funds") {
          console.error("insufficient funds for requested transaction".red);
          return this.promptAnotherTransaction.call(this);
        }
        this.printDenomination(withdrawalAmount, billType)
        console.log("success! your new balance is: ".blue, balanceString);
        this.promptAnotherTransaction.call(this);
        /*
        if(this.isDenominationIsValid(billType)){
        }else {
          console.error("please Select from available denomination only".red);
          this.promptAnotherTransaction.call(this);
        }*/
    }
  
    printDenomination(withdrawalAmount, prefredBill) {
        var resultArray = [];
        if(!prefredBill) prefredBill = 2000;
        var choiceBillNo = Math.floor(withdrawalAmount / prefredBill);
        withdrawalAmount = withdrawalAmount % prefredBill;
        for (let i = 0; i < availableDenominations.length; i++) {
            resultArray.push(Math.floor(withdrawalAmount / availableDenominations[i]));
            if(availableDenominations[i] === prefredBill){
              resultArray[i] = resultArray[i] + choiceBillNo;
            }
            // Get the new total
            withdrawalAmount = withdrawalAmount % availableDenominations[i];
            }
        var denominationString = 'Your Denominations are :'+ 
        '\n2000 : ' +resultArray[0]+ " "+ 
        '\n500  : ' + resultArray[1]+ " "+
        '\n200  : ' + resultArray[2]+ " "+ 
        '\n100  : ' + resultArray[3]+ " "+ 
        '\n50   : ' + resultArray[4]+ " "+ 
        '\n20   : ' + resultArray[5]+ " "+ 
        '\n10   : ' + resultArray[6]+ " ";     
        console.log(denominationString.green);
        console.log("\n");
    }
  
    depositFundsCallback(err, amount) {
        if (err) { return; }
        console.log("\n\n");
        var depositAmount =  parseFloat( amount["deposit funds"] );
        var balance = this.depositFunds(depositAmount);
        var balanceString = balance.toString(10) + " INR".blue;
        console.log("success! your new balance is: ".blue, balanceString);
        this.promptAnotherTransaction.call(this);
    }
  
  
    transactionMenuCallback(err, choice) {
        if (err) { return; }
        //SLIGHT DELAY AFTER TRANSACTION BEFORE PROMPTING FOR ANOTHER TRANSACTION//
        var promptTimeOut = setTimeout(this.promptAnotherTransaction.bind(this), 1000);
        console.log("\n\n");
        switch (choice["transaction menu"]) {
        case "1":
          //CHECK BALANCE//
          var balance = "your balance is: " + this.checkBalance() + " INR";
          console.log(balance.blue);
          break;
        case "2":
          //DEPOSIT FUNDS//
          clearTimeout(promptTimeOut);
          console.log(promptSchemas["depositFunds"]["properties"]["deposit funds"]["menu"]);
          prompt.get( promptSchemas.depositFunds, this.depositFundsCallback.bind(this) );
          // //PRINT ACCOUNT LEDGER//
          // this.printLedger();
          break;
        case "3":
          //CHANGE PIN NUMBER//
          prompt.get( promptSchemas.newPin, this.newPinCallback.bind(this) );
          clearTimeout(promptTimeOut);
          break;
        case "4":
          //WITHDRAW FUNDS//
          clearTimeout(promptTimeOut);
          console.log(promptSchemas["withdrawFunds"]["properties"]["withdraw funds"]["menu"]);
          prompt.get( promptSchemas.withdrawFunds, this.withdrawFundsCallback.bind(this) );
          break;
        case "5":
          //EXIT//
          clearTimeout(promptTimeOut);
          this.clearScreen();
          prompt.get( promptSchemas.defaultSchema, this.defaultScreenCallback.bind(this) );
          break;
        }
    }
  
    selectDenominationCallBack(err, denomination) {
        if (err) { return; }
        console.log("\n\n");
        var withdrawalAmount = parseInt(denomination["Preferred Denomination"], 10);
        if(this.isDenominationIsValid(withdrawalAmount)){
          console.error("please select only from available denomination".red);
        }
        
      };
  
      isDenominationIsValid(value) {
        var result = false;
        for(var index = 0; index < availableDenominations.length; index++){
          if(value === availableDenominations[index]){
            result = true;
            break;
          }
        }
        return result;
    }
    
    newAccount(initDeposit, initPin) {
        var newAccount = new Account(initDeposit, initPin,  this.bankID);
        this.accounts.push(newAccount);
        //USER ACCOUNTS START AT ARBITARY 6 DIGIT NUMBER//
        newAccount.accountNumber = this.accounts.length + (ACCPRESET - 1);
        return newAccount.accountNumber;
    }

    on() {
        this.clearScreen();
         this.session = null;
         this.sessionPin = null;
        prompt.get( promptSchemas.defaultSchema, this.defaultScreenCallback.bind(this) );
        this.atmStatus = "LISTENING";
    }

    startSession(err, credentials, newUser) {
        if (err) { return; }
        const accountNumber = credentials["account number"];
        //MAKE SURE ACCOUNT IS ON FILE//
        if ( this.accounts[accountNumber - ACCPRESET] instanceof Account) {
          var verified,
          pin = credentials["pin"];
          //RUN VALIDATION TO START SECURE SESSION//
          verified = this.accounts[accountNumber - ACCPRESET].validate(pin,  this.bankID);
          if (verified) {
             this.session = this.accounts[accountNumber - ACCPRESET];
             this.sessionPin = pin;
            this.atmStatus = "IN SESSION";
            //NEWLY REGISTERED USERS ARE GIVEN THE OPTION TO LOG OUT//
            //PREVENTS AUTO LOADING TRANSACTION MENU//
            if (!newUser) {
              this.transactionMenu();
            }
            else{
                this.promptAnotherTransaction.call(this);
            }
            return "session started";
          }
          //CREDENTIALS FAILED WRONG ACCOUNT NUMBER OR PIN//
          setTimeout(this.on.bind(this), 2000);
          console.error("bad credentials".red);
          return "invalid credentials";
        }
        //ACCOUNT DOESN'T EXIST FOR THIS BANK//
        setTimeout(this.on.bind(this), 2000);
        console.error("invalid account number".red);
        return "invalid account";
    }
  
    checkBalance() {
        if ( this.session) {
          //USES SESSION VARIABLES FOR SECURITY PURPOSES//
          var balance =  this.session.retrieveBalance( this.sessionPin,  this.bankID);
          return balance;
        }
        return "invalid session";
    }
  
    printLedger() {
        if ( this.session) {
          var unformattedLedger, formattedLedger,_i, _length, entryArray, date, string;
          unformattedLedger =  this.session.retrieveLedger( this.sessionPin,  this.bankID);
          formattedLedger = [];
          _length = unformattedLedger.length;
          if (_length > 0) {
            //LOOP THROUGH FORMAT AND PRINT EACH ENTRY//
            for ( _i = 0; _i < _length; _i++ ) {
              entryArray = unformattedLedger[_i];
              date = entryArray[0];
              string = date.toLocaleDateString() + " "  +
                date.toLocaleTimeString() + "    " +
                entryArray[1] + "    " + entryArray[2] +
                "  $" + entryArray[3].toFixed(2);
              formattedLedger.push(string);
              //PRINT EACH ENTRY TO THE SCREEN//
              console.log(string.blue);
            }
          }
          else {
            //PRINT A MESSAGE IF LEDGER IS EMPTY//
            console.log("no transactions yet!".blue);
          }
          return formattedLedger;
        }
        return "invalid session";
    }
  
    changePin(newPin) {
        if ( this.session) {
           this.session.setNewPin( this.sessionPin,  this.bankID, newPin);
           this.sessionPin = newPin;
          return  this.session.validate( this.sessionPin,  this.bankID);
        }
        return "invalid session";
    }
  
    withdrawFunds(amount) {
        if ( this.session) {
          var newBalance;
          var balance = this.checkBalance();
          if (balance >= amount) {
            newBalance = balance - amount;
            balance =  this.session.editBalance( this.sessionPin,  this.bankID, newBalance);
            return balance;
          }
          return "insufficient funds";
        }
        return "invalid session";
    }
  
    depositFunds(amount) {
        if ( this.session) {
          var newBalance;
          var balance = this.checkBalance();
          newBalance = balance + amount;
          balance =  this.session.editBalance( this.sessionPin,  this.bankID, newBalance);
          return balance;
        }
        return "invalid session";
    }
  
    endSession() {
        if ( this.session) {
           this.session = null;
           this.sessionPin = null;
          this.on();
        }
    }

}
    
module.exports = ATMMachine;
