import "./style.css";
import { initializeGameState, placeEntity, startBattle } from "./entity.ts";
import {
  calculateRenderGridPosition,
  render,
  renderLeftBar,
} from "./render.ts";
import { update } from "./update.ts";
import { gamble } from "./gamble.ts";

export const clientName = "clientTeam";

let gameState = initializeGameState(10, 5);

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
const context = canvas.getContext("2d")!;

document.getElementById("start")!.addEventListener("click", () => {
  startBattle(gameState);
});
document.getElementById("gamble")!.addEventListener("click", () => {
  gamble(gameState);
  renderLeftBar(gameState);
});

renderLeftBar(gameState);

canvas.addEventListener("mouseleave", () => {
  gameState.hoveredPosition = undefined;
});
canvas.addEventListener("mousemove", (event: MouseEvent) => {
  const mouseGridPosition = calculateRenderGridPosition(
    gameState,
    event.offsetX,
    event.offsetY
  );

  if (
    mouseGridPosition.x >= 0 &&
    mouseGridPosition.x < gameState.grid.length &&
    mouseGridPosition.y >= 0 &&
    mouseGridPosition.y < gameState.grid[0].length
  ) {
    gameState.hoveredPosition = mouseGridPosition;
    return;
  }
  gameState.hoveredPosition = undefined;
});
canvas.addEventListener("mousedown", (event: MouseEvent) => {
  const mouseGridPosition = calculateRenderGridPosition(
    gameState,
    event.offsetX,
    event.offsetY
  );

  if (
    mouseGridPosition.x < 0 ||
    mouseGridPosition.x >= gameState.grid.length ||
    mouseGridPosition.y < 0 ||
    mouseGridPosition.y >= gameState.grid[0].length ||
    gameState.placingEntity === undefined
  )
    return;

  placeEntity(gameState, mouseGridPosition.x, mouseGridPosition.y);

  gameState.placingEntity = undefined;
});

let oldTimestamp = 0;
const gameloop = (timestamp: number) => {
  const deltaTime = timestamp - oldTimestamp;
  oldTimestamp = timestamp;

  update(gameState, deltaTime);
  render(gameState, canvas, context);

  window.requestAnimationFrame(gameloop);
};
window.requestAnimationFrame(gameloop);
