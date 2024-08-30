import "./style.css";
import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.ts";
import {
  Entity,
  createEntity,
  updateEntity,
  GameState,
  entitySprites,
  initializeGrid,
} from "./entity.ts";
import { heuristic, pathfind } from "./util.ts";

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
const context = canvas.getContext("2d")!;

const TILE_SIZE = 32; // TILE_SIZE in pixels
const GRID_WIDTH = canvas.width / TILE_SIZE;
const GRID_HEIGHT = canvas.height / TILE_SIZE;

let gameState: GameState = {
  entities: [],
  grid: initializeGrid(GRID_WIDTH, GRID_HEIGHT),
};

gameState.entities.push({
  ...structuredClone(createEntity.steve),
  tile: gameState.grid[0][0],
  ownerName: "gay",
});
gameState.entities.push({
  ...structuredClone(createEntity.steve),
  tile: gameState.grid[5][8],
  ownerName: "otherGay",
});

const render = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (var entity of gameState.entities) {
    if (entity.tile === undefined) continue;
    if (
      gameState.entities.filter((entity) => entity.ownerName === "gay")
        .length === 0
    ) {
      context.font = "50px serif";
      context.fillText("TEAM WINS", 50, 50);
    }

    context.drawImage(
      entitySprites[entity.name],
      entity.tile.x * TILE_SIZE,
      entity.tile.y * TILE_SIZE
    );

    /*context.globalCompositeOperation = "source-in";
    context.globalAlpha = 0.4;
    context.fillStyle = "red";
    context.fillRect(
      entity.tile.x * TILE_SIZE,
      entity.tile.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";*/

    context.fillStyle = "black";
    context.fillRect(
      entity.tile.x * TILE_SIZE + 2,
      entity.tile.y * TILE_SIZE - 1,
      TILE_SIZE - 4,
      4
    );

    context.fillStyle = "orange";
    context.fillRect(
      entity.tile.x * TILE_SIZE + 3,
      entity.tile.y * TILE_SIZE - 2,
      Math.floor((TILE_SIZE - 4) * (entity.health / entity.maxHealth)) - 1,
      2
    );
    context.fillStyle = "cyan";
    context.fillRect(
      entity.tile.x * TILE_SIZE + 3,
      entity.tile.y * TILE_SIZE + 1,
      Math.floor((TILE_SIZE - 4) * (4 / 5)) - 1,
      1
    );
  }
};

const update = () => {
  for (var entity of gameState.entities) {
    updateEntity[entity.name](entity, gameState);
  }
  render();
};
render();
setInterval(update, 1000);
