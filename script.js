let divElemento = document.querySelector("div"),
    tabelaElemento = document.querySelector("table"),
    btnRestart = document.getElementById("btnRestart"),
    modal = document.getElementById("winnerModal"),
    modalMsg = document.getElementById("winnerMessage"),
    modalRestartBtn = document.getElementById("modalRestartBtn");

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
            }

            this.render();
        }
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
