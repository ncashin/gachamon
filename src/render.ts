import {
  battlegroundSprite,
  createPublicImageElement,
  entityDefinitions,
  GameState,
} from "./entity";
import { clientName } from "./main";

export const renderMoney = (gameState: GameState) => {
  const moneyDisplay = document.getElementById("money")!;
  moneyDisplay.textContent = "Money: $" + gameState.money;
};

export const renderLeftBar = (gameState: GameState) => {
  const leftbar = document.getElementById("sidebar")!;
  leftbar.innerHTML = "";
  for (let i = 0; i < gameState.ownedEntities.length; i++) {
    const ownedEntity = gameState.ownedEntities[i];
    const button = document.createElement("button");
    button.className = "gachamon";

    let gachamonSprite = entityDefinitions[ownedEntity.name].sprite.cloneNode();

    button.appendChild(gachamonSprite);
    let nameText = document.createElement("p");
    nameText.className = "gachamon-text";
    nameText.textContent = ownedEntity.name;
    button.appendChild(nameText);

    leftbar.appendChild(button);

    button.addEventListener("click", () => {
      gameState.placingEntity = ownedEntity;
    });
  }
};

const modal = document.getElementById("gacha-modal")!;
window.addEventListener("onclick", (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
});

export const calculateGridRenderPosition = (
  gameState: GameState,
  x: number,
  y: number
) => ({
  x: x * gameState.tileSize + x * gameState.tileGap + gameState.outerTileMargin,
  y: y * gameState.tileSize + y * gameState.tileGap + gameState.outerTileMargin,
});
export const calculateRenderGridPosition = (
  gameState: GameState,
  x: number,
  y: number
) => ({
  x: Math.round(
    (x / 2 - gameState.outerTileMargin) /
      (gameState.tileSize + gameState.tileGap)
  ),
  y: Math.round(
    (y / 2 - gameState.outerTileMargin) /
      (gameState.tileSize + gameState.tileGap)
  ),
});

export const render = (
  gameState: GameState,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
) => {
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < gameState.grid.length; x++) {
    for (let y = 0; y < gameState.grid[0].length; y++) {
      const tilePosition = calculateGridRenderPosition(gameState, x, y);
      context.fillStyle = "green";

      context.drawImage(
        battlegroundSprite,
        tilePosition.x,
        tilePosition.y,
        battlegroundSprite.width,
        battlegroundSprite.height
      );
      if (
        gameState.hoveredPosition !== undefined &&
        gameState.hoveredPosition.x === x &&
        gameState.hoveredPosition.y === y
      ) {
        context.globalCompositeOperation = "source-atop";
        const tilePosition = calculateGridRenderPosition(
          gameState,
          gameState.hoveredPosition.x,
          gameState.hoveredPosition.y
        );
        context.globalAlpha = 0.2;
        context.fillStyle = "yellow";
        context.fillRect(
          tilePosition.x,
          tilePosition.y,
          gameState.tileSize,
          gameState.tileSize
        );
        context.globalCompositeOperation = "source-over";
        context.drawImage(
          battlegroundSprite,
          tilePosition.x,
          tilePosition.y,
          battlegroundSprite.width,
          battlegroundSprite.height
        );

        if (gameState.placingEntity !== undefined) {
          context.globalAlpha = 0.7;
          context.drawImage(
            entityDefinitions[gameState.placingEntity.name].sprite,
            tilePosition.x,
            tilePosition.y,
            entityDefinitions[gameState.placingEntity.name].sprite.width,
            entityDefinitions[gameState.placingEntity.name].sprite.height
          );
        }
        context.globalAlpha = 1;
      }
    }
  }

  const tilePosition = calculateGridRenderPosition(
    gameState,
    gameState.grid.length / 2 - 1,
    0
  );
  context.fillStyle = "red";
  context.fillRect(
    tilePosition.x + gameState.tileSize + gameState.tileGap / 2,
    tilePosition.y - gameState.tileGap / 2,
    2,
    gameState.grid[0].length * (gameState.tileSize + gameState.tileGap)
  );

  if (gameState.simulationActive) {
    for (var entity of gameState.entities) {
      if (entity.tile === undefined) continue;

      const dir = entity.clientName === clientName ? 1 : -1;
      context.scale(dir, 1);

      const entityDrawPosition = calculateGridRenderPosition(
        gameState,
        entity.tile.x,
        entity.tile.y
      );
      if (entity.damageEffectTime > 0) {
        context.drawImage(
          entityDefinitions[entity.name].sprite,
          entityDrawPosition.x * dir,
          entityDrawPosition.y,
          entityDefinitions[entity.name].sprite.width * dir,
          entityDefinitions[entity.name].sprite.height
        );
        context.globalCompositeOperation = "source-atop";
        context.globalAlpha =
          entity.damageEffectTime / 1000 > 1
            ? 1
            : entity.damageEffectTime / 1000;
        context.fillStyle = "red";
        context.fillRect(
          entityDrawPosition.x * dir,
          entityDrawPosition.y,
          gameState.tileSize * dir,
          gameState.tileSize
        );
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 1;
      }
      context.drawImage(
        entityDefinitions[entity.name].sprite,
        entityDrawPosition.x * dir,
        entityDrawPosition.y,
        entityDefinitions[entity.name].sprite.width * dir,
        entityDefinitions[entity.name].sprite.height
      );
      context.setTransform(1, 0, 0, 1, 0, 0);

      context.fillStyle = "black";
      context.fillRect(
        entityDrawPosition.x + 2,
        entityDrawPosition.y - 1,
        gameState.tileSize - 3,
        4
      );
      if (entity.health / entity.maxHealth !== 0) {
        context.fillStyle = "orange";
        context.fillRect(
          entityDrawPosition.x + 3,
          entityDrawPosition.y - 2,
          Math.floor(
            (gameState.tileSize - 4) * (entity.health / entity.maxHealth)
          ) - 1,
          2
        );
      }
      if (entity.charge / entity.maxCharge !== 0) {
        context.fillStyle = "cyan";
        context.fillRect(
          entityDrawPosition.x + 3,
          entityDrawPosition.y + 1,
          Math.floor(
            (gameState.tileSize - 4) * (entity.charge / entity.maxCharge)
          ) - 1,
          1
        );
      }
    }
  }
  if (gameState.simulationActive === false) {
    for (var entity of gameState.ownedEntities) {
      if (entity.position === undefined) continue;

      const entityDrawPosition = calculateGridRenderPosition(
        gameState,
        entity.position.x,
        entity.position.y
      );
      context.drawImage(
        entityDefinitions[entity.name].sprite,
        entityDrawPosition.x,
        entityDrawPosition.y,
        entityDefinitions[entity.name].sprite.width,
        entityDefinitions[entity.name].sprite.height
      );
    }
  }

  if (gameState.winnerDisplayTime < 0 || gameState.winnerName === undefined)
    return;
  context.fillText(
    "WINNER: " + gameState.entities[0].clientName,
    canvas.width / 2,
    canvas.height / 2
  );
};
