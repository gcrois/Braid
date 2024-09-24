// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    /**
     * @param {string|null=} returnType
     * @param {Array=} argTypes
     * @param {Arguments|Array=} args
     * @param {Object=} opts
     */
    function ccall(ident: any, returnType?: (string | null) | undefined, argTypes?: any[] | undefined, args?: (Arguments | any[]) | undefined, opts?: any | undefined): any;
    /**
     * @param {string=} returnType
     * @param {Array=} argTypes
     * @param {Object=} opts
     */
    function cwrap(ident: any, returnType?: string | undefined, argTypes?: any[] | undefined, opts?: any | undefined): any;
    let HEAPF32: any;
    let HEAPF64: any;
    let HEAP_DATA_VIEW: any;
    let HEAP8: any;
    let HEAPU8: any;
    let HEAP16: any;
    let HEAPU16: any;
    let HEAP32: any;
    let HEAPU32: any;
    let HEAP64: any;
    let HEAPU64: any;
}
interface WasmModule {
}

export interface VectorId {
  push_back(_0: number): void;
  resize(_0: number, _1: number): void;
  size(): number;
  get(_0: number): number | undefined;
  set(_0: number, _1: number): boolean;
  delete(): void;
}

export interface Box {
  id: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  delete(): void;
}

export interface SpatialHash {
  queryBox(_0: Box): VectorId;
  getAllItems(): VectorId;
  insertBox(_0: Box): void;
  updateBox(_0: Box): void;
  getBox(_0: number): Box;
  removeBox(_0: number): void;
  delete(): void;
}

interface EmbindModule {
  VectorId: {new(): VectorId; new(_0: VectorId): VectorId};
  Box: {new(): Box; new(_0: number, _1: number, _2: number, _3: number, _4: number): Box};
  SpatialHash: {new(_0: number): SpatialHash};
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
