import { entityDefinitions, GameState } from "./entity";
import { clientName } from "./main";

export const gamble = (gameState: GameState) => {
  const entityDefinitionValues = Object.values(entityDefinitions);
  gameState.ownedEntities.push({
    ...entityDefinitionValues[
      Math.floor(entityDefinitionValues.length * Math.random())
    ].entity,
    clientName,
  });
};
