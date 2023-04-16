/**
 * sources:
 * http://pi.math.cornell.edu/~lipa/mec/lesson6.html
 * http://conwaylife.com/
 * http://www.ibiblio.org/lifepatterns/
 */

class CellGrid {
  // #cell
  constructor() {
    this.cells = null;
    this.population = 0;
    this.generations = 1;

    this.initialiseGrid();
    this.canvas = document.getElementById("gameContainer");
    this.ctx = this.canvas.getContext("2d");
    this.cellWidth = this.canvas.clientWidth / this.cells[0].length;
    this.cellHeight = this.canvas.clientHeight / this.cells.length;
    this.addEventListeners();
    this.running = false;
    this.popDisplay = document.querySelector("#population > span");
    this.popDisplay.textContent = this.population;
    this.genDisplay = document.querySelector("#generations > span");
    this.genDisplay.textContent = this.generations;
  }
  initialiseGrid(allDead = false) {
    this.population = 0;
    this.cells = Array(70)
      .fill(null)
      .map((a, row) =>
        new Array(70).fill(null).map((a, col) => {
          // ~10% chance of alive
          let alive = Math.random() < 0.1 ? true : false;
          if (allDead) {
            alive = false;
          }
          if (alive) this.population++;
          return {
            alive,
            position: { row, col },
          };
        })
      );
    // console.log(this.cells);
  }
  addEventListeners() {
    this.canvas.addEventListener("click", (event) => {
      const canvasRect = this.canvas.getBoundingClientRect();
      const mouseX = event.clientX - canvasRect.left;
      const mouseY = event.clientY - canvasRect.top;
      const clickedCellRow = Math.floor(mouseY / this.cellHeight);
      const clickedCellCol = Math.floor(mouseX / this.cellWidth);
      const clickedCell = this.cells[clickedCellRow][clickedCellCol];
      clickedCell.alive = !clickedCell.alive; // Toggle the cell state
      clickedCell.alive ? this.population++ : this.population--;
      this.popDisplay.textContent = this.population;

      this.drawCell(clickedCell); // Redraw the clicked cell
    });
  }

  drawCell(cell) {
    const cellX = cell.position.col * this.cellWidth;
    const cellY = cell.position.row * this.cellHeight;
    this.ctx.fillStyle = cell.alive ? "#222" : "#fff";
    this.ctx.fillRect(cellX, cellY, this.cellWidth, this.cellHeight);
    this.ctx.strokeStyle = "#eee"; // set border color
    this.ctx.strokeRect(cellX, cellY, this.cellWidth, this.cellHeight); // add border
  }
  draw() {
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        this.drawCell(cell);
      });
    });
  }
  updateCells() {
    const nextGen = [];
    for (let row = 0; row < this.cells.length; row++) {
      nextGen.push([]);
      for (let col = 0; col < this.cells[row].length; col++) {
        const cell = this.cells[row][col];
        let liveNeighbours = 0;
        // get num of live neighbours
        for (let y = -1; y < 2; y++) {
          for (let x = -1; x < 2; x++) {
            // ignore current cell
            if (x === 0 && y === 0) continue;
            const neighbourRow = cell.position.row + y;
            const neighbourCol = cell.position.col + x;
            if (
              neighbourCol === -1 ||
              neighbourCol > this.cells[row].length - 1 ||
              neighbourRow === -1 ||
              neighbourRow > this.cells.length - 1
            ) {
              continue;
            }
            const neighbourCell = this.cells[neighbourRow][neighbourCol];
            if (neighbourCell.alive) liveNeighbours++;
          }
        }
        if (cell.alive && !(liveNeighbours === 2 || liveNeighbours === 3)) {
          const newCell = {
            alive: false,
            position: { row, col },
          };
          nextGen[row].push(newCell);
          this.population--;
          this.drawCell(newCell);
        } else if (!cell.alive && liveNeighbours === 3) {
          const newCell = {
            alive: true,
            position: { row, col },
          };
          nextGen[row].push(newCell);
          this.population++;
          this.drawCell(newCell);
        } else {
          nextGen[row].push(cell);
        }
      }
    }
    this.cells = nextGen;
  }
  runGrid() {
    this.running = true;
    this.gridInterval = setInterval(() => {
      this.generations++;

      this.updateCells();
      this.popDisplay.textContent = this.population;
      this.genDisplay.textContent = this.generations;
    }, 100);
  }
  stopGrid() {
    clearInterval(this.gridInterval);
    this.running = false;
  }
  clearGrid() {
    this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    this.initialiseGrid(true);
    this.popDisplay.textContent = this.population;
    this.generations = 1;
    this.genDisplay.textContent = this.generations;
    this.draw();
  }
  resetGrid() {
    this.initialiseGrid();
    this.popDisplay.textContent = this.population;
    this.generations = 1;
    this.genDisplay.textContent = this.generations;
    this.draw();
  }
}

let game = new CellGrid();
game.draw();

const start = document.getElementById("button");
function toggleStart() {
  if (game.running) {
    start.textContent = "start";
    game.stopGrid();
  } else {
    start.textContent = "stop";
    game.runGrid();
  }
}
const reset = document.getElementById("reset");
reset.addEventListener("click", () => {
  if (game.running) toggleStart();
  game.resetGrid();
});

document.getElementById("clear").addEventListener("click", () => {
  game.clearGrid();
});
start.addEventListener("click", toggleStart);
