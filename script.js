'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-09-27T17:01:17.194Z',
    '2023-09-25T23:36:17.929Z',
    '2023-09-29T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Functions
const formatMovementDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) => {
    return Math.round(Math.abs(date2 - date1) / (24 * 60 * 60 * 1000));
  };

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yestderday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCurrency = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, currency).format(value);
};

const displayMovement = (account, sort) => {
  containerMovements.innerHTML = '';
  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(account.movementsDates[i]);
    const displayDate = formatMovementDate(date, account.locale);
    const formattedMov = formatCurrency(mov, account.locale, {
      style: 'currency',
      currency: account.currency,
    });

    const html = `
      <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date"></div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMov}</div>
      </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayCalcBalance = account => {
  account.balance = account.movements.reduce((acc, curr) => {
    return acc + curr;
  }, 0);
  const formattedBal = formatCurrency(account.balance, account.locale, {
    style: 'currency',
    currency: account.currency,
  });
  labelBalance.textContent = `${formattedBal}`;
};

const calcDisplaySummary = account => {
  const income = account.movements
    .filter(mov => mov >= 0)
    .reduce((acc, curr) => {
      return acc + curr;
    }, 0);
  const formattedIncome = formatCurrency(income, account.locale, {
    style: 'currency',
    currency: account.currency,
  });
  labelSumIn.textContent = `${formattedIncome}`;

  const out = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);
  const formattedOut = formatCurrency(out, account.locale, {
    style: 'currency',
    currency: account.currency,
  });
  labelSumOut.textContent = `${formattedOut}`;

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposite => (deposite * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, curr) => acc + curr, 0);
  const formattedInterest = formatCurrency(interest, account.locale, {
    style: 'currency',
    currency: account.currency,
  });
  labelSumInterest.textContent = `${formattedInterest}`;
};

const movementsDescription = account =>
  account.movements.map((mov, i) => {
    return mov < 0
      ? `Movement ${i + 1}: You withdrew ${Math.abs(mov)}`
      : `Movement ${i + 1}: You deposited ${mov}`;
  });

const createUserName = accts => {
  accts.forEach(acct => {
    acct.username = acct.owner
      .toLowerCase()
      .split(' ')
      .map(name => name.at(0))
      .join('');
  });
};
createUserName(accounts);

const updateUI = account => {
  // Display Movement
  displayMovement(currentAccount, sortStatus);

  // Display balance
  displayCalcBalance(currentAccount);

  // Display summary
  calcDisplaySummary(currentAccount);
};

// Variables
let currentAccount;

//// Event handler
// Login Event
btnLogin.addEventListener('click', e => {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner}`;
    containerApp.style.opacity = 1;

    // Display date
    const now = new Date();
    const locale = navigator.language;
    const dateOptions = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      dateOptions
    ).format(now);

    // Clear input fields
    inputLoginPin.value = inputLoginUsername.value = '';
    inputLoginPin.blur();

    updateUI(currentAccount);
  }
});

// Transfer Event
btnTransfer.addEventListener('click', e => {
  e.preventDefault();

  const transferAmount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    transferAmount > 0 &&
    receiverAccount &&
    currentAccount.balance > transferAmount &&
    receiverAccount !== currentAccount.username
  ) {
    // Update sender transactions
    currentAccount.movements.push(-transferAmount);
    currentAccount.movementsDates.push(new Date().toISOString());

    // Update receiver transactions
    receiverAccount.movements.push(transferAmount);
    receiverAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);

    inputTransferTo.value = inputTransferAmount.value = '';
    inputTransferAmount.blur();
  }
});

// Loan Event
btnLoan.addEventListener('click', e => {
  e.preventDefault();

  const loanAmount = Math.floor(inputLoanAmount.value);

  if (
    loanAmount > 0 &&
    currentAccount.movements.some(mov => mov > (loanAmount * 10) / 100)
  ) {
    // Add loan loanAmount
    currentAccount.movements.push(loanAmount);
    currentAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);

    inputLoanAmount.value = '';
    inputLoanAmount.blur();
  }
});

// Close Account Event
btnClose.addEventListener('click', e => {
  e.preventDefault();

  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    // get index
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // delete account at index
    accounts.splice(index, 1);

    console.log(accounts);

    // Hide UI
    labelWelcome.textContent = 'Log in to get started';
    containerApp.style.opacity = 0;

    // Clear inputs
    inputCloseUsername.value = inputClosePin.value = '';
    inputClosePin.blur();
  }
});

// Sort Event
let sortStatus = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();

  displayMovement(currentAccount.movements, !sortStatus);
  sortStatus = !sortStatus;
});
