import { ALRawLoop } from "./ALRawLoop";

export class ALRAWWaveInfo {
  private __type: string = "ALRAWWaveInfo";

  public loop!: ALRawLoop;

  constructor(B1view: DataView, offset: number) {
    this._extract(B1view, offset);
  }

  _extract(B1view: DataView, offset: number) {
    const loopOffset = B1view.getUint32(offset);
    this.loop = new ALRawLoop(B1view, loopOffset);
  }
}