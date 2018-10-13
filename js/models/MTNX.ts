namespace PP64.utils {
  /** Animation file handling */
  export class MTNX {
    static isMtnx(viewOrBuffer: ArrayBuffer | DataView): boolean {
      if (!viewOrBuffer)
        return false;

      if (!(viewOrBuffer instanceof DataView))
        viewOrBuffer = new DataView(viewOrBuffer);

      return viewOrBuffer.getUint32(0) === 0x4D544E58; // "MTNX"
    }

    static unpack(mtnxView: ArrayBuffer | DataView) {
      if (!(mtnxView instanceof DataView))
        mtnxView = new DataView(mtnxView);

      if (!PP64.utils.MTNX.isMtnx(mtnxView))
        return null;

      const mtnxObj: MTNX.IMTNXObj = Object.create(null);

      mtnxObj.totalFrames = mtnxView.getUint16(0xA);
      mtnxObj.tracks = [];

      const totalTracks = mtnxView.getUint16(0x8);
      const dsOffset = mtnxView.getUint32(0xC);
      const keyframesOffset = mtnxView.getUint32(0x10);
      const dataOffset = mtnxView.getUint32(0x14);

      const dsView = new DataView(mtnxView.buffer, mtnxView.byteOffset + dsOffset);
      const keyframesView = new DataView(mtnxView.buffer, mtnxView.byteOffset + keyframesOffset);
      const dataView = new DataView(mtnxView.buffer, mtnxView.byteOffset + dataOffset);

      for (let i = 0; i < totalTracks; i++) {
        const trackOffset = mtnxView.getUint32(0x18 + (i * 4));
        const trackView = new DataView(mtnxView.buffer, mtnxView.byteOffset + trackOffset);

        mtnxObj.tracks.push(PP64.utils.MTNX.parseTrack(trackView, i, dsView, keyframesView, dataView));
      }

      return mtnxObj;
    }

    static parseTrack(trackView: DataView, trackIndex: number, dsView: DataView, keyframesView: DataView, dataView: DataView) {
      const trackObj: MTNX.ITrack = Object.create(null);

      trackObj.type = trackView.getUint8(0);
      trackObj.dimension = trackView.getUint8(1);
      trackObj.mystery1 = trackView.getUint8(2);
      trackObj.mystery2 = trackView.getUint8(3);
      trackObj.mystery3 = trackView.getUint16(4);
      trackObj.totalFrames = trackView.getUint16(6);
      trackObj.mystery4 = trackView.getUint8(8);
      trackObj.objIndex = trackView.getUint8(9); // Not global!
      trackObj.keyframeCount = trackView.getUint16(0xE);

      trackObj.d = dsView.getUint8(trackIndex); // TODO ?

      const keyframesIndex = trackView.getUint16(0xA);
      const dataIndex = trackView.getUint16(0xC);

      trackObj.keyframes = Object.create(null);

      for (let k = 0; k < trackObj.keyframeCount; k++) {
        const keyframe = keyframesView.getUint16((keyframesIndex * 2) + (k * 2));
        trackObj.keyframes[keyframe] = PP64.utils.MTNX.parseData(dataView, dataIndex, k);
      }

      return trackObj;
    }

    static parseData(dataView: DataView, dataIndex: number, keyframeIndex: number) {
      const SIZEOF_FRAME_DATA = 3 * 4;

      const data: MTNX.IKeyframe = Object.create(null);
      data.value1 = dataView.getFloat32((dataIndex * 4) + (keyframeIndex * SIZEOF_FRAME_DATA));
      data.value2 = dataView.getFloat32((dataIndex * 4) + (keyframeIndex * SIZEOF_FRAME_DATA) + 4);
      data.value3 = dataView.getFloat32((dataIndex * 4) + (keyframeIndex * SIZEOF_FRAME_DATA) + 8);

      return data;
    }
  }

  export namespace MTNX {
    export enum Dimension {
      X = 0x45,
      Y = 0x46,
      Z = 0x47,
    }

    export enum TrackType {
      Transform = 0x17,
      Rotation = 0x4C,
      Scale = 0x1B,
    }

    export interface IMTNXObj {
      totalFrames: number;
      tracks: ITrack[];
    }

    export interface ITrack {
      type: number;
      dimension: number;
      mystery1: any;
      mystery2: any;
      mystery3: any;
      totalFrames: number;
      mystery4: any;
      objIndex: number;
      keyframeCount: number;
      d: any;
      keyframes: { [frame: number]: IKeyframe };
    }

    export interface IKeyframe {
      value1: number;
      value2: number;
      value3: number;
    }
  }
}