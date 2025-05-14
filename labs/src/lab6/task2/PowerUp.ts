import * as THREE from 'three';
export enum PowerUpType {
    STAR = 'star',
    HELMET = 'helmet',
    BOMB = 'bomb',
    MACHINE_GUN = 'machine_gun',
    CLOCK = 'clock',
    BASE_PROTECTION = 'base_protection'
}
export class PowerUp {
    private type: PowerUpType;
    private mesh: THREE.Mesh;
    private creationTime: number;
    private duration: number; 
    constructor(type: PowerUpType, position: THREE.Vector3, duration: number) {
        this.type = type;
        this.creationTime = Date.now();
        this.duration = duration;
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        let materialColor = 0xffffff; 
        switch (type) {
            case PowerUpType.STAR:
                materialColor = 0xffff00; 
                break;
            case PowerUpType.HELMET:
                materialColor = 0x0000ff; 
                break;
            case PowerUpType.BOMB:
                materialColor = 0xff0000; 
                break;
            case PowerUpType.MACHINE_GUN:
                materialColor = 0x00ff00; 
                break;
            case PowerUpType.CLOCK:
                materialColor = 0xffa500; 
                break;
            case PowerUpType.BASE_PROTECTION:
                materialColor = 0x808080; 
                break;
        }
        const material = new THREE.MeshStandardMaterial({ color: materialColor, emissive: materialColor, emissiveIntensity: 0.5 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.userData = { powerUp: this }; 
    }
    public getType(): PowerUpType {
        return this.type;
    }
    public getMesh(): THREE.Mesh {
        return this.mesh;
    }
    public isExpired(): boolean {
        return Date.now() > this.creationTime + this.duration;
    }
} 