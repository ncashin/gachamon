import { clientName } from "./main";
import { pathfind } from "./util";

const baseURL = import.meta.env.BASE_URL;

export type GameState = {
  tileSize: number;
  tileGap: number;
  outerTileMargin: number;

  ownedEntities: Entity[];

  hoveredPosition: { x: number; y: number } | undefined;
  placingEntity: Entity | undefined;

  winnerDisplayTime: number;
  winnerName: string | undefined;

  simulationActive: boolean;
  entities: Entity[];
  grid: Tile[][];
};
export const initializeGameState = (
  width: number,
  height: number
): GameState => ({
  tileSize: 32,
  tileGap: 16,
  outerTileMargin: 16,

  ownedEntities: [],

  hoveredPosition: undefined,
  placingEntity: undefined,

  winnerDisplayTime: 0,
  winnerName: undefined,

  simulationActive: false,
  entities: [],
  grid: initializeGrid(width, height),
});

export const initializeGrid = (width: number, height: number) => {
  let grid: Tile[][] = [];
  for (let x = 0; x < width; x++) {
    grid.push([]);
    for (let y = 0; y < height; y++) {
      grid[x].push({
        x,
        y,
        entity: undefined,
        pathingScore: 0,
        pathingHeuristic: 0,
      });
    }
  }
  return grid;
};

export type Tile = {
  x: number;
  y: number;
  entity: Entity | undefined;
  pathingScore: number;
  pathingHeuristic: number;
};
export type Position = {
  x: number;
  y: number;
};

export const createPublicImageElement = (x: number, y: number, src: string) => {
  let imageElement = new Image(x, y);
  imageElement.src = src;
  return imageElement;
};

export type Entity = {
  position: Position | undefined;
  name: EntityName;
  clientName: string;
  tile: Tile | undefined;
  maxHealth: number;
  health: number;
  charge: number;
  maxCharge: number;
  speed: number;
  speedCounter: number;
};
export type EntityDefinition = {
  entity: Entity;
  sprite: HTMLImageElement;
  update: (gameState: GameState, entity: Entity, deltaTime: number) => void;
  damage: (gameState: GameState, entity: Entity, damage: number) => void;
};

import gumpcoreURL from "/gumpcore.png";
export const entityDefinitions: Record<string, EntityDefinition> = {
  gumpcore: {
    entity: {
      position: undefined,

      name: "gumpcore",
      clientName: "",
      maxCharge: 3,
      maxHealth: 1,
      speed: 1000,
      tile: undefined,
      speedCounter: 0,
      charge: 0,
      health: 1,
    },
    sprite: createPublicImageElement(32, 32, gumpcoreURL),
    update(gameState, entity) {
      console.log(entity);
      if (entity.tile === undefined) return;

      const { closestEntity } = findClosestEntity(
        entity.tile,
        gameState.entities.filter(
          (filterEntity) => filterEntity.clientName !== entity.clientName
        )
      );

      if (closestEntity === undefined || closestEntity.tile === undefined)
        return;
      const path = pathfind(gameState, entity.tile, closestEntity.tile);

      if (path.length === 1) {
        if (path[0].entity === undefined) return;

        if (entity.charge >= entity.maxCharge) {
          entity.charge = 0;
          moveEntity(
            gameState,
            path[0].entity,
            path[0].entity.clientName === clientName ? -2 : 2,
            0
          );
          return;
        }

        entityDefinitions[path[0].entity.name].damage(
          gameState,
          path[0].entity,
          1
        );
        entity.charge++;
        return;
      }

      if (path[0].entity === undefined) {
        moveEntityToTile(entity, path[0]);
      }
    },
    damage(gameState, entity, damage) {
      entity.health -= damage;
      if (entity.health <= 0) {
        destroyEntity(gameState, entity);
      }
    },
  },
};

type EntityName = keyof typeof entityDefinitions;

export const placeEntity = (gameState: GameState, x: number, y: number) => {
  if (gameState.placingEntity === undefined) return;
  gameState.placingEntity.position = {
    x,
    y,
  };
};

export const startBattle = (gameState: GameState) => {
  if (gameState.simulationActive === true) return;

  gameState.entities = structuredClone(
    gameState.ownedEntities.filter((entity) => entity.position)
  );
  for (var entity of gameState.entities) {
    let tile = gameState.grid[entity.position!.x][entity.position!.y];
    tile.entity = entity;
    entity.tile = tile;
  }
  createEntity(gameState, "gumpcore", 9, 0, "otherTeam");

  gameState.simulationActive = true;
};

export const endBattle = (gameState: GameState) => {
  gameState.simulationActive = false;
  gameState.winnerDisplayTime = 1000;
  gameState.winnerName = gameState.entities[0].name;
};

export const createEntity = (
  gameState: GameState,
  entityName: EntityName,
  x: number,
  y: number,
  teamName: string
) => {
  let entity = {
    ...entityDefinitions[entityName].entity,
    tile: gameState.grid[x][y],
    teamName: teamName,
  };
  gameState.entities.push(entity);
  gameState.grid[x][y].entity = entity;
};
export const destroyEntity = (gameState: GameState, entity: Entity) => {
  const index = gameState.entities.indexOf(entity);
  gameState.entities.splice(index, 1);
  entity.tile!.entity = undefined;

  if (
    gameState.entities.filter(
      (filterEntity) => filterEntity.clientName === entity.clientName
    ).length === 0
  ) {
    endBattle(gameState);
  }
};

export const moveEntity = (
  gameState: GameState,
  entity: Entity,
  dx: number,
  dy: number
) => {
  entity.tile!.entity = undefined;
  entity.tile = gameState.grid[entity.tile!.x + dx][entity.tile!.y + dy];
  entity.tile.entity = entity;
};
export const moveEntityToTile = (entity: Entity, tile: Tile) => {
  entity.tile!.entity = undefined;
  entity.tile = tile;
  tile.entity = entity;
};

const findClosestEntity = (tile: Tile, entities: Entity[]) => {
  let closestDistance: number = Number.MAX_VALUE;

  let closestEntity: Entity | undefined = undefined;
  for (var entity of entities) {
    if (entity.tile === undefined) continue;
    const directionVector = {
      x: entity.tile.x - tile.x,
      y: entity.tile.y - tile.y,
    };
    const distance = Math.sqrt(
      directionVector.x * directionVector.x +
        directionVector.y * directionVector.y
    );
    if (distance < closestDistance) {
      closestDistance = distance;
      closestEntity = entity;
    }
  }
  return { closestDistance, closestEntity };
};
