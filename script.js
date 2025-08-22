let divElemento = document.querySelector("div"),
    tabelaElemento = document.querySelector("table"),
    btnRestart = document.getElementById("btnRestart"),
    modal = document.getElementById("winnerModal"),
    modalMsg = document.getElementById("winnerMessage"),
    modalRestartBtn = document.getElementById("modalRestartBtn");

let gameMode = 'player'; // modo padrão Jogador vs Jogador

// Atualiza o modo ao selecionar (Bot ou Player)
document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        gameMode = e.target.value;
        Game.start(); // reinicia ao mudar de modo
    });
});

let Game = {
    start() {
        this.field = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];
        this.currentPlayer = 'X';
        this.isFinished = false;
        this.round = 0;
        this.winningCells = [];
        modal.classList.add("hidden");
        tabelaElemento.classList.remove("finished");
        this.render();
        this.updateModeText();
    },

    nextPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    },

    selfField(linha, coluna, tdElement) {
        if (!this.isFinished && this.field[linha][coluna] === '') {
            this.field[linha][coluna] = this.currentPlayer;
            this.round++;

            tdElement.classList.add("clicked");
            setTimeout(() => tdElement.classList.remove("clicked"), 200);

            let ganhador = this.isGameOver();
            if (ganhador) {
                this.isFinished = true;
                tabelaElemento.classList.add("finished");

                if (ganhador === "Deu velha, malandro!") {
                    this.showModal(ganhador);
                } else {
                    this.highlightWinningCells();
                    this.showModal(`Ganhador: ${ganhador}`);
                }
            } else {
                this.nextPlayer();

                // Se for vez do Bot e modo bot, joga automaticamente
                if (this.currentPlayer === 'O' && !this.isFinished && gameMode === 'bot') {
                    setTimeout(() => this.botHardcore(), 300);
                }
            }

            this.render();
        }
    },

    botHardcore() {
        let bestScore = -Infinity;
        let move;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.field[i][j] === '') {
                    this.field[i][j] = 'O';
                    let score = this.minimax(this.field, 0, false);
                    this.field[i][j] = '';
                    if (score > bestScore) {
                        bestScore = score;
                        move = { i, j };
                    }
                }
            }
        }
        if (move) {
            let td = tabelaElemento.rows[move.i].cells[move.j];
            this.selfField(move.i, move.j, td);
        }
    },

    minimax(board, depth, isMaximizing) {
        let winner = this.evaluateBoard(board);
        if (winner !== null) {
            if (winner === 'O') return 10 - depth;
            if (winner === 'X') return depth - 10;
            if (winner === 'tie') return 0;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[i][j] === '') {
                        board[i][j] = 'O';
                        let score = this.minimax(board, depth + 1, false);
                        board[i][j] = '';
                        bestScore = Math.max(score, bestScore);
                    }
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[i][j] === '') {
                        board[i][j] = 'X';
                        let score = this.minimax(board, depth + 1, true);
                        board[i][j] = '';
                        bestScore = Math.min(score, bestScore);
                    }
                }
            }
            return bestScore;
        }
    },

    evaluateBoard(board) {
        for (let i = 0; i < 3; i++) {
            if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) return board[i][0];
            if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) return board[0][i];
        }
        if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) return board[0][0];
        if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) return board[0][2];

        let openSpots = board.flat().filter(c => c === '');
        if (openSpots.length === 0) return 'tie';

        return null;
    },

    isGameOver() {
        const f = this.field;

        for (let i = 0; i < 3; i++) {
            if (f[i][0] && f[i][0] === f[i][1] && f[i][1] === f[i][2]) {
                this.winningCells = [[i,0], [i,1], [i,2]];
                return f[i][0];
            }
            if (f[0][i] && f[0][i] === f[1][i] && f[1][i] === f[2][i]) {
                this.winningCells = [[0,i], [1,i], [2,i]];
                return f[0][i];
            }
        }

        if (f[0][0] && f[0][0] === f[1][1] && f[1][1] === f[2][2]) {
            this.winningCells = [[0,0], [1,1], [2,2]];
            return f[0][0];
        }

        if (f[0][2] && f[0][2] === f[1][1] && f[1][1] === f[2][0]) {
            this.winningCells = [[0,2], [1,1], [2,0]];
            return f[0][2];
        }

        if (this.round === 9) {
            return "Deu velha, malandro!";
        }

        return null;
    },

    highlightWinningCells() {
        this.winningCells.forEach(([linha, coluna]) => {
            let td = tabelaElemento.rows[linha].cells[coluna];
            td.classList.add("highlight");
        });
    },

    showModal(message) {
        modalMsg.textContent = message;
        modal.classList.remove("hidden");
    },

    updateModeText() {
        // Cria ou atualiza uma div mostrando se está contra bot ou player
        let modeDiv = document.getElementById("modeText");
        if (!modeDiv) {
            modeDiv = document.createElement("div");
            modeDiv.id = "modeText";
            modeDiv.style.marginTop = "10px";
            modeDiv.style.fontSize = "16px";
            modeDiv.style.fontWeight = "bold";
            modeDiv.style.color = "#ffea00";
            document.body.insertBefore(modeDiv, tabelaElemento);
        }
        modeDiv.textContent = gameMode === "bot" ? "Modo: Jogando contra BOT" : "Modo: Jogador vs Jogador";
    },

    render() {
        if (!this.isFinished) {
            divElemento.textContent = `Jogador Atual: ${this.currentPlayer}`;
            divElemento.classList.remove("winnerText");
        } else {
            divElemento.classList.add("winnerText");
        }

        let template = '';
        this.field.forEach((linha, linhaIndex) => {
            template += "<tr>";
            linha.forEach((coluna, colunaIndex) => {
                let marcado = coluna ? "marked" : "";
                let disabled = this.isFinished ? "" : `onclick="Game.selfField(${linhaIndex}, ${colunaIndex}, this)"`;
                template += `<td class="${marcado}" ${disabled}>${coluna}</td>`;
            });
            template += "</tr>";
        });
        tabelaElemento.innerHTML = template;

        if (this.isFinished && this.winningCells.length > 0) {
            this.highlightWinningCells();
        }
    }
};

btnRestart.addEventListener("click", () => Game.start());
modalRestartBtn.addEventListener("click", () => Game.start());

Game.start();
