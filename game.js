class CellGrid {
  // #cell
  constructor() {
    this.cells = Array(100)
      .fill(null)
      .map((a) => new Array(200).fill(null));
    this.initialiseGrid();
    this.canvas = document.getElementById("gameContainer");
    this.ctx = this.canvas.getContext("2d");
    this.addEventListeners();
    this.running = false;
  }
  initialiseGrid() {
    this.cells = this.cells.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        return {
          // ~10% chance of alive
          alive: Math.random() <= 0.05 ? true : false,
          position: { rowIndex, colIndex },
          color: [0, 0, 0],
        };
      });
    });
  }
  addEventListeners() {
    this.canvas.addEventListener("click", (event) => {
      const canvasRect = this.canvas.getBoundingClientRect();
      const mouseX = event.clientX - canvasRect.left;
      const mouseY = event.clientY - canvasRect.top;
      const cellWidth = this.canvas.width / this.cells[0].length;
      const cellHeight = this.canvas.height / this.cells.length;
      const clickedCellRow = Math.floor(mouseY / cellHeight);
      const clickedCellCol = Math.floor(mouseX / cellWidth);
      const clickedCell = this.cells[clickedCellRow][clickedCellCol];
      clickedCell.alive = !clickedCell.alive; // Toggle the cell state
      this.drawCell(clickedCell); // Redraw the clicked cell
    });
  }

  drawCell(cell) {
    const cellWidth = this.canvas.width / this.cells[0].length;
    const cellHeight = this.canvas.height / this.cells.length;
    const cellX = cell.position.colIndex * cellWidth;
    const cellY = cell.position.rowIndex * cellHeight;
    this.ctx.fillStyle = cell.alive ? "#FFF" : "#000";
    this.ctx.fillRect(cellX, cellY, cellWidth, cellHeight);
  }
  draw() {
    const canvasHeight = this.canvas.clientHeight;
    const canvasWidth = this.canvas.clientWidth;

    const cellHeight = Math.floor(canvasHeight / this.cells.length);
    const cellWidth = Math.floor(canvasWidth / this.cells[0].length);
    console.log(cellHeight, cellWidth);

    // Set up the gradient fill
    const gradient = this.ctx.createLinearGradient(
      0,
      0,
      canvasWidth,
      canvasHeight
    );
    gradient.addColorStop(0, "#F00");
    gradient.addColorStop(1, "#0F0");
    this.cells.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellX = colIndex * cellWidth;
        const cellY = rowIndex * cellHeight;

        // Fade the color from the previous state to the new state
        const color = cell.alive ? [255, 255, 255] : [0, 0, 0];
        for (let i = 0; i < 3; i++) {
          //   cell.color[i] += (color[i] - cell.color[i]) * 0.2;
          cell.color[i] = color[i];
        }

        // Use the gradient fill with the cell's color
        this.ctx.fillStyle = `rgb(${cell.color[0]}, ${cell.color[1]}, ${cell.color[2]})`;
        this.ctx.fillRect(cellX, cellY, cellWidth, cellHeight);
      });
    });
  }
  updateCells() {
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        let liveNeighbours = 0;
        // get number of live neighbours
        for (let y = -1; y < 2; y++) {
          for (let x = -1; x < 2; x++) {
            if (x === 0 && y === 0) continue;
            const neighbourRow = cell.position.rowIndex + y;
            const neighbourCol = cell.position.colIndex + x;
            if (
              neighbourCol === -1 ||
              neighbourCol > row.length - 1 ||
              neighbourRow === -1 ||
              neighbourRow > this.cells.length - 1
            )
              continue;

            const neighbourCell = this.cells[neighbourRow][neighbourCol];
            if (neighbourCell.alive) liveNeighbours++;
          }
        }
        if (cell.alive) {
          if (liveNeighbours > 3 || liveNeighbours < 2) {
            cell.alive = false;
          }
        } else if (!cell.alive && liveNeighbours === 3) {
          cell.alive = true;
        }
      });
    });
  }
  runGrid() {
    this.running = true;
    this.gridInterval = setInterval(() => {
      this.updateCells();
      this.draw();
    }, 50);
  }
  stopGrid() {
    clearInterval(this.gridInterval);
    this.running = false;
  }
}

const game = new CellGrid();
game.draw();
console.time("UpdateCells");
game.updateCells();
console.timeEnd("UpdateCells");
console.time("draw");
game.draw();
console.timeEnd("draw");

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
start.addEventListener("click", toggleStart);
