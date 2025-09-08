import { CreatureAnimation } from "./CreatureAnimation";
import { Background } from "./Background";

export class Scenario {
  status: string;
  creatureAnimations: Array<CreatureAnimation>;
  focusingIndex?: number | null;
  hoveringIndex?: number | null;
  background: Background;
  context: CanvasRenderingContext2D;
  ratio: number;

  constructor(width: number, height: number) {
    this.status = "play";
    this.creatureAnimations = [];
    const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d")!;
    this.context = context;
    this.ratio = width / 1920;
    this.background = new Background(
      width,
      height,
      context,
      this.creatureAnimations
    );
  }

  updateBackground(index: number) {
    this.background.updateBackground(index);
  }

  updateCreatureAnimations(creatureTypes: number[], isCreating: boolean) {
    const creatureTypesWithCreating = [...creatureTypes];
    if (isCreating) {
      creatureTypesWithCreating.push(creatureTypesWithCreating.length);
    }

    let popCount =
      this.creatureAnimations.length - creatureTypesWithCreating.length;
    while (popCount-- > 0) {
      this.creatureAnimations.pop();
    }

    for (let i = 0; i < this.creatureAnimations.length; i++) {
      if (
        this.creatureAnimations[i].creatureType != creatureTypesWithCreating[i]
      ) {
        this.creatureAnimations[i].updateCreatureType(
          creatureTypesWithCreating[i],
          isCreating && i == creatureTypesWithCreating.length - 1
        );
      }
    }

    for (
      let i = this.creatureAnimations.length;
      i < creatureTypesWithCreating.length;
      i++
    ) {
      const creatureAnimation = new CreatureAnimation(
        i,
        creatureTypesWithCreating[i],
        isCreating && i == creatureTypesWithCreating.length - 1,
        this.ratio
      );
      this.creatureAnimations.push(creatureAnimation);
    }
  }

  setFocus(index: number | null) {
    if (index != null && this.creatureAnimations.length <= index) return;

    if (
      this.focusingIndex != null &&
      this.focusingIndex < this.creatureAnimations.length
    ) {
      this.creatureAnimations[this.focusingIndex].updateFocus(false);
    }
    if (index != null && index < this.creatureAnimations.length) {
      this.creatureAnimations[index].updateFocus(true);
    }
    this.focusingIndex = index;
  }

  getFirstCreatureInRect(cursorLeft: number, cursorTop: number): number | null {
    for (let i = 0; i < this.creatureAnimations.length; i++) {
      const creatureAnimation = this.creatureAnimations[i];
      if (creatureAnimation.inRect(cursorLeft, cursorTop)) {
        return i;
      }
    }
    return null;
  }

  draw() {
    if (this.context) {
      this.background.draw();
    }
  }

  step() {
    for (let i = 0; i < this.creatureAnimations.length; i++) {
      const obj = this.creatureAnimations[i];
      obj.incFrame();
    }
  }
}
