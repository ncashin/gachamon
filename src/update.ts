import { entityDefinitions, GameState } from "./entity";

export const update = (gameState: GameState, deltaTime: number) => {
  if (gameState.winnerDisplayTime >= 0) {
    gameState.winnerDisplayTime -= deltaTime;
  }

  if (gameState.simulationActive === false) return;
  for (var entity of gameState.entities) {
    if (entity.speedCounter < entity.speed) {
      entity.speedCounter += deltaTime;
      continue;
    }
    entity.speedCounter = 0;
    entityDefinitions[entity.name].update(gameState, entity, deltaTime);
  }
};
