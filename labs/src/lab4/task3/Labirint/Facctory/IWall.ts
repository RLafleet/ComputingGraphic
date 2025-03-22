import { mat4 } from 'gl-matrix';

interface IWall {
    render(projectionMatrix: mat4, modelViewMatrix: mat4): void;
}

export {
    type IWall,
}