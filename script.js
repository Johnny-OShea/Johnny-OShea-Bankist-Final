"use strict";

const account1 = {
    owner: "Jonas Schmedtmann",
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        "2019-11-18T21:31:17.178Z",
        "2019-12-23T07:42:02.383Z",
        "2020-01-28T09:15:04.904Z",
        "2020-04-01T10:17:24.185Z",
        "2020-05-08T14:11:59.604Z",
        "2020-05-27T17:01:17.194Z",
        "2020-07-11T23:36:17.929Z",
        "2020-07-12T10:51:36.790Z",
    ],
    currency: "EUR",
    locale: "pt-PT", // de-DE
};

const account2 = {
    owner: "Jessica Davis",
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        "2019-11-01T13:15:33.035Z",
        "2019-11-30T09:48:16.867Z",
        "2019-12-25T06:04:23.907Z",
        "2020-01-25T14:18:46.235Z",
        "2020-02-05T16:33:06.386Z",
        "2023-07-07T14:43:26.374Z",
        "2023-07-09T18:49:59.371Z",
        "2023-07-11T12:01:20.894Z",
    ],
    currency: "USD",
    locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const formatMovementDate = function (date, locale) {
    // calculate the amount of days passed
    const calcDaysPassed = (day1, day2) =>
        Math.round(Math.abs(day2 - day1) / (1000 * 60 * 60 * 24));

    // Get the actual number of days passed
    const daysPassed = calcDaysPassed(new Date(), date);

    // Return the approriate string
    if (daysPassed === 0) return "Today";
    else if (daysPassed === 1) return "Yesterday";
    else if (daysPassed <= 7) return `${daysPassed} days ago`;
    else return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = function (value, locale, currency) {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
    }).format(value);
};

const displayMovements = function (acc, sort = false) {
    containerMovements.innerHTML = "";

    const sortedMovements = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

    sortedMovements.forEach(function (move, i) {
        // Determine if it is a deposit or withdrawal
        const typeOfMovement = move > 0 ? "deposit" : "withdrawal";

        // Get the date for the movement
        const date = new Date(acc.movementsDates[i]);
        const displayDate = formatMovementDate(date, acc.locale);

        const html = `
      <div class="movements__row">
        <div class="movements__type             
        movements__type--${typeOfMovement}">${i + 1} ${typeOfMovement}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatCurrency(move, acc.locale, acc.currency)}</div>
      </div>
      `;

        containerMovements.insertAdjacentHTML("afterbegin", html);
    });
};

const calcDisplayBalance = function (acc) {
    // Use the reduce function to get the total
    acc.balance = acc.movements.reduce((accumulator, sum) => accumulator + sum, 0);

    // Set the text content to the right display
    labelBalance.textContent = formatCurrency(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (currentAccount) {
    // Get the total of all the deposits
    const incomes = currentAccount.movements
        .filter(move => move > 0)
        .reduce((accumulator, curr) => accumulator + curr, 0);
    // Get the total of all the withdrawals
    const withdrawals = currentAccount.movements
        .filter(move => move < 0)
        .reduce((accumulator, curr) => accumulator + curr, 0);
    // Get the total interest : has to be more than one dollar
    const interest = currentAccount.movements
        .filter(move => move > 0)
        .map(deposit => (deposit * currentAccount.interestRate) / 100)
        .filter(interest => interest > 1)
        .reduce((accumulator, curr) => accumulator + curr, 0);

    // Set the labels to the correct content
    labelSumIn.textContent = formatCurrency(
        parseFloat(incomes).toFixed(2),
        currentAccount.locale,
        currentAccount.currency
    );
    labelSumOut.textContent = formatCurrency(
        parseFloat(withdrawals).toFixed(2),
        currentAccount.locale,
        currentAccount.currency
    );
    labelSumInterest.textContent = formatCurrency(
        parseFloat(interest).toFixed(2),
        currentAccount.locale,
        currentAccount.currency
    );
};

const createUsernames = function (accounts) {
    accounts.forEach(function (acc) {
        acc.username = acc.owner
            .toLowerCase()
            .split(" ")
            .map(name => name.charAt(0))
            .join("");
    });
    return accounts;
};
createUsernames(accounts);

// Function to update the UI
const updateUI = function (currentAccount) {
    // Display movements
    displayMovements(currentAccount);
    // Display balance
    calcDisplayBalance(currentAccount);
    // Display summary
    calcDisplaySummary(currentAccount);
};

const startLogoutTimer = function () {
    // Create a five minute timer
    let time = 300;

    // Create a function that handles ticking of a clock
    const tick = function () {
        const min = `${Math.trunc(time / 60)}`.padStart(2, 0);
        const seconds = `${Math.trunc(time % 60)}`.padStart(2, 0);

        // In each call, print the remaining time
        labelTimer.textContent = `${min}:${seconds}`;

        // When time = 0 logout
        if (time === 0) {
            clearInterval(timer);
            labelWelcome.textContent = "Log in to get started";
            containerApp.style.opacity = 0;
        }

        // decrease the timer
        time--;
    };

    // Call the function right away so that it immediately starts
    tick();

    // Call the timer every second
    const timer = setInterval(tick, 1000);
    return timer;
};

// Create a temporary variable for the current account
let currentAccount, timer;

// Event handler
btnLogin.addEventListener("click", function (e) {
    // Prevent form from submitting
    e.preventDefault();

    // Set the current account = to the object of that username
    currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);

    if (currentAccount?.pin === Number(inputLoginPin.value)) {
        // Display UI and a welcome message
        labelWelcome.textContent = `Welcome back ${currentAccount.owner.split(" ")[0]}`;
        containerApp.style.opacity = 100;

        // // Set the date to the correct time
        // labelDate.textContent = formatMovementDate(new Date(), false);

        // Clear the input fields
        inputLoginUsername.value = inputLoginPin.value = "";
        inputLoginPin.blur();

        // Start the timer if it doesnt exists
        if (timer) {
            clearInterval(timer);
        }
        timer = startLogoutTimer();

        updateUI(currentAccount);

        // Create a variable for the current time
        const now = new Date();

        // Create an object of options for the display
        const options = {
            hour: "numeric",
            minute: "numeric",
            day: "numeric",
            month: "numeric",
            year: "numeric",
        };

        // Get the local language and format per account
        const locale = currentAccount.locale;

        // Use an API to display the date in the correct format
        labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);
    }
});

btnTransfer.addEventListener("click", function (e) {
    e.preventDefault();

    const amount = +inputTransferAmount.value;
    const targetAccount = accounts.find(acc => acc.username === inputTransferTo.value);

    // Clear the input fields
    inputTransferAmount.value = inputTransferTo.value = "";

    if (
        amount > 0 &&
        targetAccount &&
        amount <= currentAccount.balance &&
        targetAccount.username !== currentAccount.username
    ) {
        // Reset the timer
        clearInterval(timer);
        timer = startLogoutTimer();

        // Add a timer to simulate reality
        setTimeout(function () {
            // Add a negative movement to the current user
            currentAccount.movements.push(-1 * amount);
            // Add a positive movement to the recipient
            targetAccount.movements.push(amount);

            // Add a time stamp to both accounts
            currentAccount.movementsDates.push(new Date().toISOString());
            targetAccount.movementsDates.push(new Date().toISOString());

            // Update the UI
            updateUI(currentAccount);
        }, 3000);
    }
});

btnLoan.addEventListener("click", function (e) {
    e.preventDefault();

    // Create a variable for the loans amount
    const loan = Math.floor(inputLoanAmount.value);

    // Check that the user can make the loan
    if (loan > 0 && currentAccount.movements.some(deposit => deposit >= loan * 0.1)) {
        // Reset the timer
        clearInterval(timer);
        timer = startLogoutTimer();

        // Create a timer to simulate a processing loan
        setTimeout(function () {
            // Add a positive movement to the account
            currentAccount.movements.push(loan);
            // Add a time stamp
            currentAccount.movementsDates.push(new Date().toISOString());

            // Update the UI
            updateUI(currentAccount);
        }, 2500);
    }

    // Clear input field
    inputLoanAmount.value = "";
});

btnClose.addEventListener("click", function (e) {
    e.preventDefault();

    if (
        inputCloseUsername.value === currentAccount.username &&
        +inputClosePin.value === currentAccount.pin
    ) {
        const deletionIndex = accounts.findIndex(
            account => account.username === currentAccount.username
        );

        // Remove the account
        accounts.splice(deletionIndex, 1);

        // Reset the UI
        containerApp.style.opacity = 0;
        labelWelcome.textContent = "Log in to get started";
    }

    inputCloseUsername.value = inputClosePin.value = "";
});

let sorted = false;
btnSort.addEventListener("click", function (e) {
    e.preventDefault();

    displayMovements(currentAccount, !sorted);
    sorted = !sorted;
});
