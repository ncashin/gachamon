import { entityDefinitions, GameState } from "./entity";
import { clientName } from "./main";

const modal = document.getElementById("gacha-modal")!;
const modalContent = document.getElementById("gacha-modal-content")!;

const gachavideo = document.getElementById("gachavideo")! as HTMLVideoElement;

export const gamble = (gameState: GameState) => {
  gameState.money -= 500;
  const entityDefinitionValues = Object.values(entityDefinitions);
  const newEntity = {
    ...entityDefinitionValues[
      Math.floor(entityDefinitionValues.length * Math.random())
    ].entity,
    clientName,
  };

  let gachamonSprite = entityDefinitions[
    newEntity.name
  ].sprite.cloneNode() as HTMLElement;
  gachamonSprite.className = "gacha-modal-sprite";
  gachamonSprite.style.width = "128px";
  gachamonSprite.style.height = "128px";

  modalContent.innerHTML = "";
  modalContent.appendChild(gachamonSprite);
  let nameText = document.createElement("p");
  nameText.className = "gacha-modal-header-text";
  nameText.textContent = newEntity.name;
  modalContent.appendChild(nameText);
  gameState.ownedEntities.push(newEntity);
  modal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  let params = new URLSearchParams(document.location.search);
  if (params.get("noads") === "true") return;

  gachavideo.style.display = "block";
  gachavideo.play();
  gachavideo.addEventListener("ended", () => {
    gachavideo.style.display = "none";

    modal.style.display = "block";
  });
};
