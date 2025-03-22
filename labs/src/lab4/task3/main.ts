import './index.css'
import {Labirint} from './Labirint/Labirint'
import {createShaderProgram} from './WebGLUtils'

class App {
    private readonly canvas: HTMLCanvasElement;
    private readonly gl: WebGLRenderingContext;
    private readonly program: WebGLProgram;
    private labirint: Labirint;

    constructor() {
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        const gl = this.canvas.getContext('webgl', { alpha: false })!;
        if (!gl) {
            throw new Error('WebGL не поддерживается');
        }

        this.gl = gl;
        this.program = createShaderProgram(gl);
        this.labirint = new Labirint(gl, this.program);

        window.addEventListener('resize', this.resizeCanvas);
    }

    render = () => {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // Добавлено
        this.labirint.render();
        requestAnimationFrame(this.render);
    }

    private resizeCanvas = () => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    }
}

const app = new App();
requestAnimationFrame(app.render);