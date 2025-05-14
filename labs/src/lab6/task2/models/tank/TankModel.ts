import * as THREE from 'three';
import { TankType } from './TankTypes';
import { TankVisuals } from './TankVisuals';

export class TankModel {
    public mesh: THREE.Object3D;
    public bodyMesh!: THREE.Mesh;
    public turretPivot!: THREE.Object3D;
    public wheelMeshes: THREE.Mesh[] = [];

    constructor(type: TankType, position: THREE.Vector3) {
        this.mesh = new THREE.Object3D();
        this.mesh.position.copy(position);
        this.buildTankModel(type);
    }

    public updateTransform(position: THREE.Vector3, bodyRotationY: number): void {
        this.mesh.position.copy(position);
        this.mesh.rotation.y = bodyRotationY;
    }

    public updateTurretRotation(turretRotationY: number): void {
        if (this.turretPivot) {
            this.turretPivot.rotation.y = turretRotationY;
        }
    }

    private buildTankModel(type: TankType): void {
        const carWidth = 2;      
        const carHeight = 0.8;   
        const carLength = 3;     
        const bodyGeometry = new THREE.BoxGeometry(carWidth, carHeight, carLength);
        const tankColor = TankVisuals.getTankColor(type);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: tankColor,
            flatShading: true,
            shininess: 10
        });
        this.bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.bodyMesh.position.y = 0.6; 
        this.bodyMesh.castShadow = true;
        this.bodyMesh.receiveShadow = true;
        this.mesh.add(this.bodyMesh);
        this.createWheels(carWidth, carHeight, carLength);
        this.createTurret(type);
        this.addTypeSpecificFeatures(type);
        this.createTracks(carWidth, carHeight, carLength);
    }

    private createWheels(carWidth: number, carHeight: number, carLength: number): void {
        const wheelRadius = 0.4;
        const wheelThickness = 0.4;
        const wheelSegments = 16;
        const wheelGeometry = new THREE.CylinderGeometry(
            wheelRadius,        
            wheelRadius,        
            wheelThickness,     
            wheelSegments       
        );
        const wheelMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            flatShading: true
        });
        const wheelPositions: [number, number, number][] = [
            [-carWidth / 2 - wheelThickness / 4, -carHeight / 2 + 0.4, carLength / 3],
            [-carWidth / 2 - wheelThickness / 4, -carHeight / 2 + 0.4, 0],
            [-carWidth / 2 - wheelThickness / 4, -carHeight / 2 + 0.4, -carLength / 3],
            [carWidth / 2 + wheelThickness / 4, -carHeight / 2 + 0.4, carLength / 3],
            [carWidth / 2 + wheelThickness / 4, -carHeight / 2 + 0.4, 0],
            [carWidth / 2 + wheelThickness / 4, -carHeight / 2 + 0.4, -carLength / 3]
        ];
        this.wheelMeshes = wheelPositions.map((position) => {
            const mesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
            mesh.position.set(position[0], position[1], position[2]);
            mesh.rotation.z = Math.PI * 0.5; 
            mesh.castShadow = true;
            this.bodyMesh.add(mesh);
            return mesh;
        });
    }

    private createTurret(type: TankType): void {
        const domeRadius = 0.8;
        const domeWidthSubdivisions = 12;
        const domeHeightSubdivisions = 12;
        const domePhiStart = 0;
        const domePhiEnd = Math.PI * 2;
        const domeThetaStart = 0;
        const domeThetaEnd = Math.PI * 0.5;
        const domeGeometry = new THREE.SphereGeometry(
            domeRadius,
            domeWidthSubdivisions,
            domeHeightSubdivisions,
            domePhiStart,
            domePhiEnd,
            domeThetaStart,
            domeThetaEnd
        );
        const turretColor = TankVisuals.getTurretColor(type);
        const domeMaterial = new THREE.MeshPhongMaterial({ 
            color: turretColor,
            flatShading: true 
        });
        const domeMesh = new THREE.Mesh(domeGeometry, domeMaterial);
        domeMesh.castShadow = true;
        domeMesh.position.y = 0.5;
        this.bodyMesh.add(domeMesh);
        this.turretPivot = new THREE.Object3D();
        this.turretPivot.position.y = 0.5;
        this.bodyMesh.add(this.turretPivot);
        let turretWidth = 0.2;
        let turretHeight = 0.2;
        let turretLength = 2;
        if (type === TankType.ENEMY_HEAVY) {
            turretWidth = 0.3;
            turretHeight = 0.3;
            turretLength = 2.5;
        }
        else if (type === TankType.ENEMY_LIGHT) {
            turretWidth = 0.15;
            turretHeight = 0.15;
            turretLength = 1.8;
        }
        const turretGeometry = new THREE.BoxGeometry(turretWidth, turretHeight, turretLength);
        const turretMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            flatShading: true 
        });
        const turretMesh = new THREE.Mesh(turretGeometry, turretMaterial);
        turretMesh.position.z = turretLength * 0.5;
        turretMesh.castShadow = true;
        this.turretPivot.add(turretMesh);
        const muzzleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 8);
        const muzzleMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const muzzle = new THREE.Mesh(muzzleGeometry, muzzleMaterial);
        muzzle.position.set(0, 0, turretLength - 0.1);
        muzzle.rotation.x = Math.PI * 0.5;
        muzzle.castShadow = true;
        this.turretPivot.add(muzzle);
    }

    private addTypeSpecificFeatures(type: TankType): void {
        if (type === TankType.PLAYER) {
        } else {
            let markColor: number;
            let markSize: number = 0.2;
            let markGeometry: THREE.BufferGeometry;
            switch(type) {
                case TankType.ENEMY_LIGHT:
                    markColor = 0xff0000;
                    markGeometry = new THREE.CircleGeometry(markSize, 16);
                    break;
                case TankType.ENEMY_MEDIUM:
                    markColor = 0xffff00;
                    markGeometry = new THREE.BufferGeometry();
                    const triangleVertices = [
                        0, markSize * 1.5, 0,
                        -markSize, -markSize, 0,
                        markSize, -markSize, 0
                    ];
                    markGeometry.setAttribute('position', new THREE.Float32BufferAttribute(triangleVertices, 3));
                    break;
                case TankType.ENEMY_HEAVY:
                    markColor = 0x0000ff;
                    markGeometry = new THREE.PlaneGeometry(markSize * 1.5, markSize * 1.5);
                    break;
                default:
                    markColor = 0xff0000;
                    markGeometry = new THREE.CircleGeometry(markSize, 16);
            }
            const markMaterial = new THREE.MeshPhongMaterial({ 
                color: markColor,
                emissive: markColor,
                emissiveIntensity: 0.5,
                side: THREE.DoubleSide
            });
            const mark = new THREE.Mesh(markGeometry, markMaterial);
            mark.position.set(0, 0.7, 0);
            mark.rotation.x = -Math.PI / 2;
            this.bodyMesh.add(mark);
        }
    }

    private createTracks(width: number, height: number, length: number): void {
        const trackWidth = 0.4;
        const trackThickness = 0.1;
        const leftTrackGeometry = new THREE.BoxGeometry(trackWidth, trackThickness, length + 0.6);
        const trackMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x222222,
            flatShading: true
        });
        const leftTrack = new THREE.Mesh(leftTrackGeometry, trackMaterial);
        leftTrack.position.set(-width / 2 - trackWidth / 4, -height / 2 + 0.2, 0);
        leftTrack.castShadow = true;
        leftTrack.receiveShadow = true;
        this.bodyMesh.add(leftTrack);
        const rightTrack = new THREE.Mesh(leftTrackGeometry, trackMaterial);
        rightTrack.position.set(width / 2 + trackWidth / 4, -height / 2 + 0.2, 0);
        rightTrack.castShadow = true;
        rightTrack.receiveShadow = true;
        this.bodyMesh.add(rightTrack);
    }
} 