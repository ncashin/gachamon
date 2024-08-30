import { Entity, GameState, Position, Tile } from "./entity";

export const resetPathingGrid = (gameState: GameState) => {
  for (var row of gameState.grid) {
    for (var tile of row) {
      tile.pathingScore = Number.MAX_SAFE_INTEGER;
      tile.pathingHeuristic = Number.MAX_SAFE_INTEGER;
    }
  }
};
export const getSurroundingTiles = (gameState: GameState, tile: Tile) => {
  let tiles: Tile[] = [];
  const grid = gameState.grid;
  const x = tile.x;
  const y = tile.y;
  const tileAbove = y + 1 < grid[0].length;
  const canGoDown = y - 1 >= 0;
  if (x + 1 < grid.length) {
    tiles.push(grid[x + 1][y]);
    if (tileAbove) {
      tiles.push(grid[x + 1][y + 1]);
    }
    if (canGoDown) {
      tiles.push(grid[x + 1][y - 1]);
    }
  }
  if (x - 1 >= 0) {
    tiles.push(grid[x - 1][y]);
    if (tileAbove) {
      tiles.push(grid[x - 1][y + 1]);
    }
    if (canGoDown) {
      tiles.push(grid[x - 1][y - 1]);
    }
  }
  if (tileAbove) {
    tiles.push(grid[x][y + 1]);
  }
  if (canGoDown) {
    tiles.push(grid[x][y - 1]);
  }
  return tiles;
};

export const heuristic = (initial: Tile, target: Tile) => {
  var d1 = Math.abs(target.x - initial.x);
  var d2 = Math.abs(target.y - initial.y);
  return 5.65685424949 * (d1 + d2);
};
export const pathfind = (gameState: GameState, initial: Tile, target: Tile) => {
  resetPathingGrid(gameState);
  let grid = gameState.grid;
  let uncheckedTiles: Tile[] = [];
  let checkedTiles: Tile[] = [];
  grid[initial.x][initial.y].pathingScore = 0;
  uncheckedTiles.push(grid[initial.x][initial.y]);
  while (uncheckedTiles.length > 0) {
    let tile = uncheckedTiles.shift()!;
    if (tile.x === target.x && tile.y === target.y) {
      break;
    }
    checkedTiles.push(tile);
    for (var surroundingTile of getSurroundingTiles(gameState, tile)) {
      if (
        surroundingTile.entity === undefined ||
        (surroundingTile.x === target.x && surroundingTile.y === target.y)
      ) {
        if (
          Math.abs(surroundingTile.x - tile.x) +
            Math.abs(surroundingTile.y - tile.y) >
          1
        ) {
          const score = tile.pathingScore + 1.41421356237;
          if (surroundingTile.pathingScore > score) {
            surroundingTile.pathingScore = score;
          }
          continue;
        }
        if (surroundingTile.pathingScore > tile.pathingScore + 1) {
          surroundingTile.pathingScore = tile.pathingScore + 1;
          surroundingTile.pathingHeuristic = heuristic(surroundingTile, target);
        }
        if (!checkedTiles.includes(surroundingTile)) {
          uncheckedTiles.push(surroundingTile);
        }
      }
    }
    uncheckedTiles.sort(
      (firstTile, secondTile) =>
        firstTile.pathingHeuristic +
        firstTile.pathingScore -
        (secondTile.pathingHeuristic + secondTile.pathingScore)
    );
  }

  let currentTile: Tile = target;
  let path: Tile[] = [currentTile];
  while (true) {
    let score = Number.MAX_SAFE_INTEGER;
    for (var surroundingTile of getSurroundingTiles(gameState, currentTile)) {
      if (surroundingTile.pathingScore < score) {
        score = surroundingTile.pathingScore;
        currentTile = surroundingTile;
      }
    }
    if (currentTile.x === initial.x && currentTile.y == initial.y)
      return path.reverse();

    path.push(currentTile);
  }
};
