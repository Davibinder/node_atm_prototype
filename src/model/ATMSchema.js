const colors = require('colors');

const ATMSchema = {

  defaultSchema: {
    properties: {
      "default screen": {
        description: "Welcome to \"Grazitti Interactive\" ATM dispenser.\n1 : Transactions OR Having Account\n2 : New Account\nEnter your choice : ".green,
        pattern: /^[12]$/,
        message: "please choose 1 for transaction or 2 for new account",
        required: true
      }
    }
  },

  loginSchema: {
    properties: {
      "account number": {
        description: "Account No : ".green,
        pattern: /^[0-9]+$/,
        message: "account number must contain only numbers..".red,
        required: true
      },
      "pin": {
        description: "PIN : ".green,
        pattern: /^[0-9][0-9][0-9][0-9]$/,
        message: "pin must be 4 digit number..".red,
        required: true,
        hidden: true
      }
    }
  },

  userRegistration: {
    properties: {
      "initial deposit": {
        description: "Initial deposit: format: 00.00 : ".green,
        pattern: /^[0-9]+\.[0-9][0-9]$/,
        message: "format two decimals: 500.00".red,
        required: true
      },
      "secure pin": {
        description: "PIN: 4 digit number : ".green,
        pattern: /^[0-9][0-9][0-9][0-9]$/,
        message: "must be a 4 digit number..".red,
        required: true,
        hidden: true
      },
      "verify pin": {
        description: "Verify PIN : ".green,
        pattern: /^[0-9][0-9][0-9][0-9]$/,
        message: "must be a 4 digit number..".red,
        required: true,
        hidden: true
      }
    }
  },

  anotherTransaction: {
    properties: {
      "another transaction?": {
        description: "Continue(y/n)? : ".green,
        pattern: /y(es)?|n[o]?/i,
        message: "must answer yes/y or no/n only".red,
        required: true
      }
    }
  },

  transactionMenu: {
    properties: {
      "transaction menu": {
        menu: "Menu:\n".blue +
              "1 : Balance\n".blue +
              "2 : Deposit\n".blue +
              "3 : Change PIN\n".blue +
              "4 : Withdraw\n".blue +
              "5 : Exit\n".blue,
        description: "Please Enter choice 1-5 : ".green,
        pattern: /^[1-5]$/,
        required: true
      }
    }
  },

  newPin: {
    properties: {
      "new pin": {
        description: "New PIN : ".green,
        pattern: /^[0-9][0-9][0-9][0-9]$/,
        message: "must be a 4 digit number..".red,
        required: true,
        hidden: true
      },
      "verify pin": {
        description: "Verify PIN : ".green,
        pattern: /^[0-9][0-9][0-9][0-9]$/,
        message: "must be a 4 digit number..".red,
        required: true,
        hidden: true
      }
    }
  },

  withdrawFunds: {
    properties: {
      "withdraw funds": {
        menu: "Enter Withdraw amount?\n".blue,
        description: "Withdraw : ".green,
        pattern: /^[0-9]*[02468]0(\.00)?$/,
        message: "must be divisible by 20..".red,
        required: true
      },
      "Preferred Denomination" : {
        menu : "Available Denomination are 10, 20, 50, 100, 200, 500, 2000",
        description : "Denomination i.e 10, 20, 50, 100, 200, 500, 2000 only : ".green,
        message : "select only available denomination",
        required : false
      }
    }
  },

  depositFunds: {
    properties: {
      "deposit funds": {
        menu: "Please Enter deposit amount\n".blue,
        description: "Deposit format 00.00 : ".green,
        pattern: /^[0-9]+\.[0-9][0-9]$/,
        message: "include to two decimal places".red,
        required: true
      }
    }
  }
};

module.exports = ATMSchema;