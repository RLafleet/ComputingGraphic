class Game {
    constructor() {
        this.gridPos = [];
        this.gridColors = [];
        this.gridPosArray = [];
        this.gridColorsArray = [];
        this.fpcount = 0;
        this.restart = 0;
        this.newBlock = [];
        this.newBlockDir = [];
        this.blockType = null;
        this.blockOffset = null;
        this.blockColor = null;
        this.block_positions = [];
        this.state = "PRODUCENEW";
        this.colorMap = [
            [0.0, 0.0, 0.0, 0.5],
            [1.0, 0.2, 0.2, 1.0],
            [0.2, 1.0, 0.2, 1.0],
            [0.2, 0.2, 1.0, 1.0],
            [1.0, 1.0, 0.5, 1.0],
            [1.0, 0.5, 1.0, 1.0],
            [0.5, 1.0, 1.0, 1.0],
            [0.7, 0.7, 0.7, 1.0],
        ];

        this.initGridPos();
        this.initGridColors();
        this.updateGridPosArray();
        this.updateColorsArray();
        this.keyEventListener();
    }

    initGridPos() {
        for (let i = 0; i < 20; i++) {
            let row = [];
            for (let j = 0; j < 10; j++) {
                row.push([-1.2 + 0.24 * j, 2.4 - 0.24 * i]);
            }
            this.gridPos.push(row);
        }
    }

    initGridColors() {
        this.gridColors = [];
        for (let i = 0; i < 20; i++) {
            let row = [];
            for (let j = 0; j < 10; j++) {
                row.push(0);
            }
            this.gridColors.push(row);
        }
    }

    updateGridPosArray() {
        this.gridPosArray = [];
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 10; j++) {
                let tempPos = this.gridPos[i][j];
                this.gridPosArray.push(tempPos[0]);
                this.gridPosArray.push(tempPos[1]);
                this.gridPosArray.push(tempPos[0] + 0.24);
                this.gridPosArray.push(tempPos[1]);
                this.gridPosArray.push(tempPos[0]);
                this.gridPosArray.push(tempPos[1] - 0.24);
                this.gridPosArray.push(tempPos[0] + 0.24);
                this.gridPosArray.push(tempPos[1] - 0.24);
            }
        }
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 10; j++) {
                let tempPos = this.gridPos[i][j];
                this.gridPosArray.push(tempPos[0]);
                this.gridPosArray.push(tempPos[1]);
                this.gridPosArray.push(tempPos[0] + 0.24);
                this.gridPosArray.push(tempPos[1]);
                this.gridPosArray.push(tempPos[0] + 0.24);
                this.gridPosArray.push(tempPos[1] - 0.24);
                this.gridPosArray.push(tempPos[0]);
                this.gridPosArray.push(tempPos[1] - 0.24);
            }
        }
    }

    updateColorsArray() {
        this.gridColorsArray = [];
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 10; j++) {
                let temp_color = this.gridColors[i][j];
                for (let k = 0; k < 4; k++) {
                    for (let p = 0; p < 4; p++) {
                        this.gridColorsArray.push(this.colorMap[temp_color][p]);
                    }
                }
            }
        }
        for (let i = 0; i < 3200; i++) {
            this.gridColorsArray.push(0.41);
        }
    }

    updateColor() {
        for (let i = 0; i < this.newBlock.length; i++) {
            this.gridColors[this.newBlock[i][0]][this.newBlock[i][1]] = this.blockColor;
        }
    }

    eraseColor() {
        for (let i = 0; i < this.newBlock.length; i++) {
            this.gridColors[this.newBlock[i][0]][this.newBlock[i][1]] = 0;
        }
    }

    collisionCheck() {
        for (let i = 0; i < this.newBlock.length; i++) {
            let downpos = [this.newBlock[i][0] + 1, this.newBlock[i][1]];
            if (downpos[0] >= 20)
                return true;
            if (this.newBlock.indexOf(downpos) == -1 && this.gridColors[downpos[0]][downpos[1]] != 0)
                return true;
        }
        return false;
    }

    endCollisionCheck() {
        for (let i = 0; i < this.newBlock.length; i++) {
            if (this.gridColors[this.newBlock[i][0]][this.newBlock[i][1]] != 0)
                return true;
        }
        return false;
    }

    fullRowCheck() {
        let tempGridColors = [];
        for (let i = 0; i < 20; i++) {
            let flag = false;
            let row = [];
            for (let j = 0; j < 10; j++) {
                row.push(this.gridColors[i][j]);
                if (this.gridColors[i][j] == 0) {
                    flag = true;
                }
            }
            if (flag)
                tempGridColors.push(row);
        }
        let fl = 20 - tempGridColors.length;
        if (fl > 0) {
            let tempFlColors = [];
            for (let i = 0; i < fl; i++) {
                let row = [];
                for (let j = 0; j < 10; j++)
                    row.push(0);
                tempFlColors.push(row);
            }
            tempGridColors = tempFlColors.concat(tempGridColors);
        }
        this.gridColors = tempGridColors;
    }

    moveDown() {
        if (this.fpcount != 8 || this.collisionCheck())
            return;
        for (let i = 0; i < this.newBlock.length; i++) {
            this.newBlock[i][0]++;
        }
    }

    moveDownF() {
        if (this.collisionCheck())
            return;
        for (let i = 0; i < this.newBlock.length; i++) {
            this.newBlock[i][0]++;
        }
    }

    moveLeft() {
        let canMove = true;

        for (let i = 0; i < this.newBlock.length; i++) {
            let newX = this.newBlock[i][0];
            let newY = this.newBlock[i][1] - 1;

            if (newY < 0) {
                canMove = false;
                break;
            }

            if (this.gridColors[newX][newY] !== 0) {
                canMove = false;
                break;
            }
        }

        if (canMove) {
            for (let i = 0; i < this.newBlock.length; i++) {
                this.newBlock[i][1] -= 1;
            }
        }
    }

    moveRight() {
        let canMove = true;

        for (let i = 0; i < this.newBlock.length; i++) {
            let newX = this.newBlock[i][0];
            let newY = this.newBlock[i][1] + 1;

            if (newY >= 10) {
                canMove = false;
                break;
            }

            if (this.gridColors[newX][newY] !== 0) {
                canMove = false;
                break;
            }
        }

        if (canMove) {
            for (let i = 0; i < this.newBlock.length; i++) {
                this.newBlock[i][1] += 1;
            }
        }
    }

    rotation() {
        console.log('rot')
        this.newBlockDir = blockTypes(this.newBlock[0][0], this.newBlock[0][1]);

        let nextRotationIndex = (this.blockOffset + 1) % 4;
        let rotationBlock = this.newBlockDir[this.blockType][nextRotationIndex];

        let canRotate = true;

        for (let i = 0; i < rotationBlock.length; i++) {
            let pos = rotationBlock[i];

            if (pos[0] < 0 || pos[0] >= 20 || pos[1] < 0 || pos[1] >= 10) {
                canRotate = false;
                break;
            }

            if (this.gridColors[pos[0]][pos[1]] !== 0) {
                canRotate = false;
                break;
            }
        }

        if (canRotate) {
            this.newBlock = rotationBlock;
            this.blockOffset = nextRotationIndex;
        }
    }

    randomGenerateBlock() {
        this.blockType = parseInt(Math.random() * 7, 10);
        this.blockOffset = parseInt(Math.random() * 2, 10);
        this.blockColor = this.blockType + 1;
        let rx = 1;
        let ry = parseInt(Math.random() * 6, 10) + 2;
        this.newBlockDir = blockTypes(rx, ry);
        this.newBlock = this.newBlockDir[this.blockType][this.blockOffset];
    }

    coreLoop() {
        this.fpcount = (++this.fpcount) % 9;
        if (this.state === "PRODUCENEW") {
            if (this.restart === 1) {
                this.initGridColors();
                this.updateColorsArray();
                main(this.gridPosArray, this.gridColorsArray);
                this.restart = 0;
            }
            this.fullRowCheck();
            this.randomGenerateBlock();
            if (!this.endCollisionCheck()) {
                this.updateColor();
                this.updateColorsArray();
                main(this.gridPosArray, this.gridColorsArray);
                this.eraseColor();
                this.state = "FALLDOWN";
            } else {
                this.updateColor();
                this.updateColorsArray();
                main(this.gridPosArray, this.gridColorsArray);
                this.state = "OVER";
            }
        } else if (this.state === "FALLDOWN") {
            if (this.endCollisionCheck())
                this.state = "OVER";
            else if (!this.collisionCheck()) {
                this.moveDown();
                this.updateColor();
                this.updateColorsArray();
                main(this.gridPosArray, this.gridColorsArray);
                this.eraseColor();
                this.state = "FALLDOWN";
            } else {
                this.updateColor();
                this.updateColorsArray();
                this.state = "COLLISION";
            }
        } else if (this.state === "COLLISION") {
            main(this.gridPosArray, this.gridColorsArray);
            this.state = "PRODUCENEW";
        } else if (this.state === "OVER") {
            if (this.restart === 1)
                this.state = "PRODUCENEW";
        }
    }

    keyEventListener() {
        document.addEventListener('keydown', (event) => {
            const keyname = event.key;
            if (this.state === "OVER") {
                if (keyname === "r") {
                    this.restart = 1;
                } else if (keyname === "q") {
                    closeBrowserTab();
                }
            } else {
                if (keyname === "ArrowLeft") {
                    this.moveLeft();
                } else if (keyname === "ArrowRight") {
                    this.moveRight();
                } else if (keyname === "ArrowDown") {
                    this.moveDownF();
                } else if (keyname === 'ArrowUp') {
                    this.rotation();
                }
            }
        });

        function closeBrowserTab() {
            window.opener = null;
            window.close();
        }
    }
}

const game = new Game();
setInterval(() => game.coreLoop(), 100);