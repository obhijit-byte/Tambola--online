// ==========================================
// HOUSIE ONLINE - VERSION 2
// ==========================================

let called = [];
let currentTicket = [];
let generatedTickets = [];

let game = {
  code: null,
  name: "",
  tickets: 500,
  started: false
};


// ==========================================
// PAGE NAVIGATION
// ==========================================

function hidePages() {
  document.querySelectorAll(".page")
    .forEach(page => page.classList.remove("active"));
}

function goHome() {
  hidePages();

  document
    .getElementById("home")
    .classList.add("active");
}

function showHost() {
  hidePages();

  document
    .getElementById("host")
    .classList.add("active");
}

function showPlayer() {
  hidePages();

  document
    .getElementById("player")
    .classList.add("active");
}


// ==========================================
// SHUFFLE
// ==========================================

function shuffle(array) {

  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {

    const j =
      Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] =
      [arr[j], arr[i]];
  }

  return arr;
}


// ==========================================
// COLUMN NUMBERS
// ==========================================

function columnNumbers(column) {

  if (column === 0) {

    return Array.from(
      { length: 9 },
      (_, i) => i + 1
    );
  }

  if (column === 8) {

    return Array.from(
      { length: 11 },
      (_, i) => i + 80
    );
  }

  return Array.from(
    { length: 10 },
    (_, i) => column * 10 + i
  );
}


// ==========================================
// CREATE PROPER TAMBOLA TICKET
// ==========================================

function generateTicket() {

  const ticket =
    Array(27).fill(null);

  let rows = [];

  // Five numbers in every row
  for (let row = 0; row < 3; row++) {

    rows[row] =
      shuffle(
        Array.from(
          { length: 9 },
          (_, i) => i
        )
      )
      .slice(0, 5)
      .sort((a, b) => a - b);
  }


  // Make sure every column
  // has at least one number

  for (let column = 0; column < 9; column++) {

    const present =
      rows.some(
        r => r.includes(column)
      );

    if (!present) {

      const possibleRows =
        [0, 1, 2]
          .filter(
            r => rows[r].length > 1
          );

      const row =
        possibleRows[
          Math.floor(
            Math.random() *
            possibleRows.length
          )
        ];

      const remove =
        Math.floor(
          Math.random() *
          rows[row].length
        );

      rows[row].splice(remove, 1);

      rows[row].push(column);

      rows[row].sort(
        (a, b) => a - b
      );
    }
  }


  // Fill numbers column-wise

  for (let column = 0; column < 9; column++) {

    const activeRows = [];

    for (let row = 0; row < 3; row++) {

      if (
        rows[row].includes(column)
      ) {
        activeRows.push(row);
      }
    }

    const numbers =
      shuffle(
        columnNumbers(column)
      )
      .slice(0, activeRows.length)
      .sort((a, b) => a - b);


    activeRows.forEach(
      (row, index) => {

        ticket[
          row * 9 + column
        ] = numbers[index];

      }
    );
  }

  return ticket;
}


// ==========================================
// GENERATE MANY TICKETS
// ==========================================

function generateTickets(count) {

  generatedTickets = [];

  const used = new Set();

  let attempts = 0;

  while (
    generatedTickets.length < count &&
    attempts < count * 20
  ) {

    attempts++;

    const ticket =
      generateTicket();

    const key =
      ticket.join(",");

    if (!used.has(key)) {

      used.add(key);

      generatedTickets.push({

        id:
          "T-" +
          String(
            generatedTickets.length + 1
          ).padStart(5, "0"),

        numbers: ticket

      });
    }
  }

  console.log(
    "Generated tickets:",
    generatedTickets.length
  );
}


// ==========================================
// GAME CODE
// ==========================================

function createGameCode() {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "HOU-";

  for (let i = 0; i < 4; i++) {

    code +=
      chars[
        Math.floor(
          Math.random() *
          chars.length
        )
      ];
  }

  return code;
}


// ==========================================
// CREATE GAME
// ==========================================

function createGame() {

  const name =
    document
      .getElementById("gameName")
      .value.trim()
      || "Housie Game";

  const count =
    parseInt(
      document
        .getElementById("ticketCount")
        .value
    );


  game.name = name;

  game.tickets = count;

  game.code =
    createGameCode();

  game.started = false;

  called = [];


  // Generate tickets

  generateTickets(count);


  document
    .getElementById("gameCode")
    .textContent =
      game.code;


  document
    .getElementById("hostGame")
    .classList.remove("hidden");


  localStorage.setItem(
    "housieGame",
    JSON.stringify(game)
  );

  localStorage.setItem(
    "housieTickets",
    JSON.stringify(
      generatedTickets
    )
  );

  localStorage.setItem(
    "housieCalled",
    JSON.stringify([])
  );


  renderBoard();

  alert(
    `${count} tickets generated successfully!`
  );
}


// ==========================================
// START GAME
// ==========================================

function startGame() {

  if (!game.code) {

    alert(
      "Please create a game first."
    );

    return;
  }

  game.started = true;

  localStorage.setItem(
    "housieGame",
    JSON.stringify(game)
  );

  alert(
    "Game started!"
  );
}


// ==========================================
// CALL NEXT NUMBER
// ==========================================

function nextNumber() {

  if (!game.started) {

    alert(
      "Please click Start Game first."
    );

    return;
  }


  if (called.length >= 90) {

    document
      .getElementById("called")
      .textContent =
        "DONE";

    return;
  }


  const remaining =
    Array.from(
      { length: 90 },
      (_, i) => i + 1
    )
    .filter(
      number =>
        !called.includes(number)
    );


  const number =
    remaining[
      Math.floor(
        Math.random() *
        remaining.length
      )
    ];


  called.push(number);


  document
    .getElementById("called")
    .textContent =
      number;


  localStorage.setItem(
    "housieCalled",
    JSON.stringify(called)
  );


  renderBoard();

  renderPlayerBoard();

  renderTicket();
}


// ==========================================
// RENDER BOARD
// ==========================================

function renderBoard() {

  const board =
    document.getElementById("board");

  if (!board) return;

  board.innerHTML = "";


  for (
    let number = 1;
    number <= 90;
    number++
  ) {

    const ball =
      document.createElement("div");

    ball.className = "ball";

    ball.textContent =
      number;


    if (
      called.includes(number)
    ) {

      ball.classList.add(
        "called"
      );
    }


    board.appendChild(ball);
  }
}


// ==========================================
// RENDER PLAYER BOARD
// ==========================================

function renderPlayerBoard() {

  const board =
    document.getElementById(
      "playerBoard"
    );

  if (!board) return;

  board.innerHTML = "";


  for (
    let number = 1;
    number <= 90;
    number++
  ) {

    const ball =
      document.createElement("div");

    ball.className =
      "ball";

    ball.textContent =
      number;


    if (
      called.includes(number)
    ) {

      ball.classList.add(
        "called"
      );
    }


    board.appendChild(ball);
  }
}


// ==========================================
// RENDER TICKET
// ==========================================

function renderTicket() {

  const ticketEl =
    document.getElementById(
      "ticket"
    );

  if (!ticketEl) return;

  ticketEl.innerHTML = "";


  currentTicket.forEach(
    number => {

      const cell =
        document.createElement("div");


      if (number === null) {

        cell.className =
          "cell blank";

        cell.textContent = "";

      } else {

        cell.className =
          "cell";

        cell.textContent =
          number;


        if (
          called.includes(number)
        ) {

          cell.classList.add(
            "marked"
          );
        }


        cell.onclick =
          () => {

            if (
              called.includes(number)
            ) {

              cell.classList.toggle(
                "marked"
              );
            }

          };
      }


      ticketEl.appendChild(cell);
    }
  );
}


// ==========================================
// JOIN GAME
// ==========================================

function joinGame() {

  const code =
    document
      .getElementById("joinCode")
      .value
      .trim()
      .toUpperCase();


  const name =
    document
      .getElementById("playerName")
      .value
      .trim()
      || "Player";


  const savedGame =
    JSON.parse(
      localStorage.getItem(
        "housieGame"
      )
    );


  const savedTickets =
    JSON.parse(
      localStorage.getItem(
        "housieTickets"
      )
    );


  if (
    !savedGame ||
    savedGame.code !== code
  ) {

    alert(
      "Game not found."
    );

    return;
  }


  if (
    !savedTickets ||
    savedTickets.length === 0
  ) {

    alert(
      "Tickets not available."
    );

    return;
  }


  const randomIndex =
    Math.floor(
      Math.random() *
      savedTickets.length
    );


  const selected =
    savedTickets[
      randomIndex
    ];


  currentTicket =
    selected.numbers;


  document
    .getElementById(
      "playerWelcome"
    )
    .textContent =
      "Welcome, " + name;


  document
    .getElementById(
      "ticketId"
    )
    .textContent =
      selected.id;


  document
    .getElementById(
      "playerGame"
    )
    .classList.remove(
      "hidden"
    );


  renderTicket();

  renderPlayerBoard();
}


// ==========================================
// RESET GAME
// ==========================================

function resetGame() {

  called = [];

  game.started = false;


  document
    .getElementById("called")
    .textContent = "-";


  localStorage.setItem(
    "housieCalled",
    JSON.stringify([])
  );


  localStorage.setItem(
    "housieGame",
    JSON.stringify(game)
  );


  renderBoard();

  renderPlayerBoard();

  renderTicket();
}


// ==========================================
// LOAD SAVED GAME
// ==========================================

function loadGame() {

  const savedGame =
    localStorage.getItem(
      "housieGame"
    );


  const savedCalled =
    localStorage.getItem(
      "housieCalled"
    );


  if (savedGame) {

    game =
      JSON.parse(
        savedGame
      );
  }


  if (savedCalled) {

    called =
      JSON.parse(
        savedCalled
      );
  }
}


// ==========================================
// INITIALIZE
// ==========================================

loadGame();

renderBoard();

renderPlayerBoard();
