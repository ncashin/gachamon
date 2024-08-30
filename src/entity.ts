import { pathfind } from "./util";

export type GameState = {
  entities: Entity[];
  grid: Tile[][];
};

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

export type Entity = {
  name: string;
  ownerName: string;
  tile: Tile | undefined;
  maxHealth: number;
  health: number;
  speed: number;
  properties: any;
};

export const createEntity: Record<string, Entity> = {
  steve: {
    name: "steve",
    ownerName: "",
    tile: undefined,
    maxHealth: 5,
    health: 5,
    speed: 100,
  },
};

export const updateEntity: Record<
  string,
  (updatingEntity: Entity, gameState: GameState) => void
> = {
  steve: (updatingEntity, gameState) => {
    if (updatingEntity.tile === undefined) return;
    if (updatingEntity.health <= 0) {
    }
    const { closestEntity } = findClosestEntity(
      updatingEntity.tile,
      gameState.entities.filter(
        (entity) => entity.ownerName !== updatingEntity.ownerName
      )
    );
    if (closestEntity === undefined || closestEntity.tile === undefined) return;
    const path = pathfind(gameState, updatingEntity.tile, closestEntity.tile);

    if (path[0].entity === undefined) {
      updatingEntity.tile.entity = undefined;
      updatingEntity.tile = path[0];
      path[0].entity = updatingEntity;
    }

    if (path.length === 1) {
      path[0].entity.health--;
      if (path[0].entity.health <= 0) {
        const index = gameState.entities.indexOf(path[0].entity);
        gameState.entities.splice(index, 1);
        path[0].entity = undefined;
      }
    }
  },
};

export const createPublicImageElement = (x: number, y: number, src: string) => {
  let imageElement = new Image(x, y);
  imageElement.src = src;
  return imageElement;
};

export const entitySprites: Record<string, HTMLImageElement> = {
  steve: createPublicImageElement(32, 32, "/gumpcore.png"),
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
