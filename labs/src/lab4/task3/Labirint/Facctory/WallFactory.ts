import { IWall } from "./IWall";
import { Wall } from "./Wall";

export class WallFactory {
    static createWall(gl: WebGLRenderingContext, program: WebGLProgram, walls: number[][], cellSize: number): IWall {
        return new Wall(gl, program, walls, cellSize);
    }
}