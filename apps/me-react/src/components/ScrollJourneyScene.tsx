import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type ScrollJourneySceneProps = {
	progress: number;
};

type StreetLight = {
	lampMaterial: THREE.MeshStandardMaterial;
	beamLight: THREE.SpotLight;
	progress: number;
};

const FORWARD = new THREE.Vector3(0, 0, -1);
const UP = new THREE.Vector3(0, 1, 0);

function clamp(value: number, min = 0, max = 1) {
	return Math.min(Math.max(value, min), max);
}

function smoothstep(value: number) {
	const clamped = clamp(value);
	return clamped * clamped * (3 - 2 * clamped);
}

function canUseWebGL() {
	try {
		const canvas = document.createElement("canvas");
		return Boolean(
			window.WebGLRenderingContext &&
				(canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
		);
	} catch {
		return false;
	}
}

function createBuildingTexture() {
	const canvas = document.createElement("canvas");
	canvas.width = 128;
	canvas.height = 256;
	const context = canvas.getContext("2d");
	if (!context) {
		const fallback = new THREE.Texture();
		fallback.needsUpdate = true;
		return fallback;
	}

	const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
	gradient.addColorStop(0, "#111723");
	gradient.addColorStop(0.52, "#0d111a");
	gradient.addColorStop(1, "#090c14");
	context.fillStyle = gradient;
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.strokeStyle = "rgba(150, 170, 198, 0.14)";
	context.lineWidth = 1;
	for (let x = 0; x <= canvas.width; x += 16) {
		context.beginPath();
		context.moveTo(x + 0.5, 0);
		context.lineTo(x + 0.5, canvas.height);
		context.stroke();
	}
	for (let y = 0; y <= canvas.height; y += 22) {
		context.beginPath();
		context.moveTo(0, y + 0.5);
		context.lineTo(canvas.width, y + 0.5);
		context.stroke();
	}

	for (let y = 9; y < canvas.height - 12; y += 14) {
		for (let x = 8; x < canvas.width - 10; x += 12) {
			const lit = Math.random() > 0.3;
			context.fillStyle = lit ? "#f5d77a" : "#1f2a3d";
			context.fillRect(x, y, 6, 8);
		}
	}

	for (let i = 0; i < 14; i++) {
		const signWidth = 10 + Math.random() * 24;
		const signHeight = 2 + Math.random() * 4;
		const signX = Math.random() * (canvas.width - signWidth - 4) + 2;
		const signY = Math.random() * (canvas.height - 26) + 12;
		context.fillStyle = Math.random() > 0.5 ? "#2fdcff" : "#ff4aa2";
		context.globalAlpha = 0.45 + Math.random() * 0.35;
		context.fillRect(signX, signY, signWidth, signHeight);
	}
	context.globalAlpha = 1;

	for (let i = 0; i < 1400; i++) {
		const noiseX = Math.floor(Math.random() * canvas.width);
		const noiseY = Math.floor(Math.random() * canvas.height);
		const alpha = Math.random() * 0.06;
		context.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
		context.fillRect(noiseX, noiseY, 1, 1);
	}

	context.strokeStyle = "#1b1f2c";
	context.lineWidth = 2;
	context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(1.2, 2.4);
	texture.magFilter = THREE.NearestFilter;
	texture.minFilter = THREE.NearestMipMapNearestFilter;
	return texture;
}

function createAsphaltTexture() {
	const canvas = document.createElement("canvas");
	canvas.width = 128;
	canvas.height = 128;
	const context = canvas.getContext("2d");
	if (!context) {
		const fallback = new THREE.Texture();
		fallback.needsUpdate = true;
		return fallback;
	}

	context.fillStyle = "#262a31";
	context.fillRect(0, 0, canvas.width, canvas.height);

	for (let i = 0; i < 5000; i++) {
		const tone = 34 + Math.floor(Math.random() * 36);
		const alpha = 0.08 + Math.random() * 0.2;
		context.fillStyle = `rgba(${tone}, ${tone}, ${tone}, ${alpha.toFixed(3)})`;
		context.fillRect(
			Math.floor(Math.random() * canvas.width),
			Math.floor(Math.random() * canvas.height),
			1,
			1,
		);
	}

	context.strokeStyle = "rgba(16, 18, 22, 0.45)";
	context.lineWidth = 1;
	for (let i = 0; i < 16; i++) {
		context.beginPath();
		context.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
		context.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
		context.stroke();
	}

	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(2.2, 12);
	texture.magFilter = THREE.NearestFilter;
	texture.minFilter = THREE.NearestMipMapNearestFilter;
	return texture;
}

function disposeObject3D(root: THREE.Object3D) {
	const disposedGeometries = new Set<THREE.BufferGeometry>();
	const disposedMaterials = new Set<THREE.Material>();

	root.traverse((node) => {
		const maybeGeometry = node as { geometry?: THREE.BufferGeometry };
		if (
			maybeGeometry.geometry &&
			!disposedGeometries.has(maybeGeometry.geometry)
		) {
			maybeGeometry.geometry.dispose();
			disposedGeometries.add(maybeGeometry.geometry);
		}

		const maybeMaterial = node as {
			material?: THREE.Material | THREE.Material[];
		};
		if (!maybeMaterial.material) {
			return;
		}

		const materials = Array.isArray(maybeMaterial.material)
			? maybeMaterial.material
			: [maybeMaterial.material];
		for (const material of materials) {
			if (!disposedMaterials.has(material)) {
				material.dispose();
				disposedMaterials.add(material);
			}
		}
	});
}

export default function ScrollJourneyScene({
	progress,
}: ScrollJourneySceneProps) {
	const hostRef = useRef<HTMLDivElement | null>(null);
	const progressRef = useRef(progress);
	const renderOnceRef = useRef<(() => void) | null>(null);
	const [showFallback, setShowFallback] = useState(false);

	useEffect(() => {
		progressRef.current = clamp(progress);
		renderOnceRef.current?.();
	}, [progress]);

	useEffect(() => {
		const host = hostRef.current;
		if (!host) {
			return;
		}

		if (!canUseWebGL()) {
			setShowFallback(true);
			return;
		}

		let width = Math.max(host.clientWidth, 1);
		let height = Math.max(host.clientHeight, 1);
		const reducedMotionMedia = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		);
		const deviceMemory = (navigator as Navigator & { deviceMemory?: number })
			.deviceMemory;
		const lowPowerDevice =
			(window.navigator.hardwareConcurrency ?? 8) <= 4 ||
			(deviceMemory ?? 8) <= 4 ||
			window.innerWidth < 840;
		let allowMotion = !reducedMotionMedia.matches;
		let active = document.visibilityState === "visible";
		let frame = 0;

		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0x07040b, 0.06);

		const camera = new THREE.PerspectiveCamera(72, width / height, 0.1, 90);
		camera.position.set(0, 2.6, 9.6);

		const renderer = new THREE.WebGLRenderer({
			antialias: false,
			alpha: true,
			powerPreference: lowPowerDevice ? "default" : "high-performance",
		});
		renderer.setPixelRatio(
			Math.min(window.devicePixelRatio || 1, lowPowerDevice ? 0.9 : 1),
		);
		renderer.setSize(width, height);
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.domElement.style.imageRendering = "pixelated";
		host.appendChild(renderer.domElement);

		const ambient = new THREE.AmbientLight(0x3f3136, 0.75);
		const warmLight = new THREE.DirectionalLight(0xffd162, 1.15);
		warmLight.position.set(2.8, 4.2, 2.6);
		const neonPink = new THREE.PointLight(0xff3da5, 1.2, 15, 2);
		neonPink.position.set(0, 1.8, -1);
		const neonBlue = new THREE.PointLight(0x28d7ff, 0.9, 12, 2);
		neonBlue.position.set(0, 0.9, 2);
		scene.add(ambient, warmLight, neonPink, neonBlue);

		const routePath = new THREE.CatmullRomCurve3(
			[
				new THREE.Vector3(0, 0, 2),
				new THREE.Vector3(0, 0, -1),
				new THREE.Vector3(0, 0, -4),
				new THREE.Vector3(0, 0, -7),
				new THREE.Vector3(0, 0, -10),
				new THREE.Vector3(0, 0, -13),
				new THREE.Vector3(0, 0, -16),
				new THREE.Vector3(0, 0, -19.5),
				new THREE.Vector3(0, 0, -23.2),
			],
			false,
			"catmullrom",
			0.5,
		);

		const asphaltTexture = createAsphaltTexture();
		const roadTilesCount = lowPowerDevice ? 120 : 200;
		const roadTileGeometry = new THREE.BoxGeometry(1.2, 0.08, 0.6);
		const sidewalkTileGeometry = new THREE.BoxGeometry(0.52, 0.09, 0.6);
		const curbGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.6);
		const laneTileGeometry = new THREE.BoxGeometry(0.12, 0.03, 0.2);
		const roadMaterial = new THREE.MeshStandardMaterial({
			color: 0x2a2e35,
			map: asphaltTexture,
			roughness: 0.96,
			metalness: 0.04,
		});
		const sidewalkMaterial = new THREE.MeshStandardMaterial({
			color: 0x595f68,
			roughness: 0.86,
			metalness: 0.06,
		});
		const curbMaterial = new THREE.MeshStandardMaterial({
			color: 0x747b86,
			roughness: 0.82,
			metalness: 0.08,
		});
		const laneMaterial = new THREE.MeshBasicMaterial({
			color: 0xe6e8eb,
			transparent: true,
			opacity: 0.64,
		});

		const tempPoint = new THREE.Vector3();
		const tempTangent = new THREE.Vector3();
		const tempSide = new THREE.Vector3();

		for (let index = 0; index < roadTilesCount; index++) {
			const t = index / (roadTilesCount - 1);
			routePath.getPointAt(t, tempPoint);
			routePath.getTangentAt(t, tempTangent).normalize();
			tempSide.crossVectors(UP, tempTangent).normalize();

			const tile = new THREE.Mesh(roadTileGeometry, roadMaterial);
			tile.position.copy(tempPoint);
			tile.position.y -= 0.12;
			tile.quaternion.setFromUnitVectors(FORWARD, tempTangent);
			scene.add(tile);

			const leftSidewalk = new THREE.Mesh(
				sidewalkTileGeometry,
				sidewalkMaterial,
			);
			leftSidewalk.position.copy(tempPoint);
			leftSidewalk.position.addScaledVector(tempSide, 0.9);
			leftSidewalk.position.y -= 0.08;
			leftSidewalk.quaternion.setFromUnitVectors(FORWARD, tempTangent);
			scene.add(leftSidewalk);

			const rightSidewalk = new THREE.Mesh(
				sidewalkTileGeometry,
				sidewalkMaterial,
			);
			rightSidewalk.position.copy(tempPoint);
			rightSidewalk.position.addScaledVector(tempSide, -0.9);
			rightSidewalk.position.y -= 0.08;
			rightSidewalk.quaternion.setFromUnitVectors(FORWARD, tempTangent);
			scene.add(rightSidewalk);

			const leftCurb = new THREE.Mesh(curbGeometry, curbMaterial);
			leftCurb.position.copy(tempPoint);
			leftCurb.position.addScaledVector(tempSide, 0.63);
			leftCurb.position.y -= 0.08;
			leftCurb.quaternion.setFromUnitVectors(FORWARD, tempTangent);
			scene.add(leftCurb);

			const rightCurb = new THREE.Mesh(curbGeometry, curbMaterial);
			rightCurb.position.copy(tempPoint);
			rightCurb.position.addScaledVector(tempSide, -0.63);
			rightCurb.position.y -= 0.08;
			rightCurb.quaternion.setFromUnitVectors(FORWARD, tempTangent);
			scene.add(rightCurb);

			if (index % 2 === 0) {
				const laneTile = new THREE.Mesh(laneTileGeometry, laneMaterial);
				laneTile.position.copy(tempPoint);
				laneTile.position.y -= 0.055;
				laneTile.quaternion.setFromUnitVectors(FORWARD, tempTangent);
				scene.add(laneTile);
			}
		}

		const buildingTexture = createBuildingTexture();
		const cityBlockGeometry = new THREE.BoxGeometry(1, 1, 1);
		const cityBlockMaterial = new THREE.MeshStandardMaterial({
			color: 0x120f16,
			map: buildingTexture,
			emissiveMap: buildingTexture,
			emissive: 0x5a3b22,
			emissiveIntensity: 0.7,
			roughness: 0.72,
			metalness: 0.2,
		});
		const cityBlocksCount = lowPowerDevice ? 34 : 58;
		for (let index = 0; index < cityBlocksCount; index++) {
			const t = Math.random();
			routePath.getPointAt(t, tempPoint);
			routePath.getTangentAt(t, tempTangent).normalize();
			tempSide.crossVectors(UP, tempTangent).normalize();

			const heightScale = 0.8 + Math.random() * 3.9;
			const widthScale = 0.42 + Math.random() * 1.15;
			const depthScale = 0.45 + Math.random() * 1.25;
			const sideDirection = Math.random() > 0.5 ? 1 : -1;
			const sideOffset = 2 + Math.random() * 4.8;

			const block = new THREE.Mesh(cityBlockGeometry, cityBlockMaterial);
			block.scale.set(widthScale, heightScale, depthScale);
			block.position.copy(tempPoint);
			block.position.addScaledVector(tempSide, sideOffset * sideDirection);
			block.position.y = heightScale * 0.5 - 0.45;
			block.position.z += (Math.random() - 0.5) * 1.6;
			scene.add(block);
		}

		const streetLights: StreetLight[] = [];
		const streetLightCount = lowPowerDevice ? 14 : 24;
		const poleGeometry = new THREE.CylinderGeometry(0.025, 0.03, 1.3, 6);
		const armGeometry = new THREE.BoxGeometry(0.26, 0.03, 0.03);
		const lampGeometry = new THREE.BoxGeometry(0.13, 0.07, 0.09);
		const poleMaterial = new THREE.MeshStandardMaterial({
			color: 0x0f1319,
			roughness: 0.6,
			metalness: 0.5,
		});

		for (let index = 0; index < streetLightCount; index++) {
			const t = 0.04 + (index / (streetLightCount - 1)) * 0.92;
			routePath.getPointAt(t, tempPoint);
			routePath.getTangentAt(t, tempTangent).normalize();
			tempSide.crossVectors(UP, tempTangent).normalize();
			const side = index % 2 === 0 ? 1 : -1;

			const basePoint = tempPoint.clone().addScaledVector(tempSide, side * 0.9);
			basePoint.y = -0.05;

			const lampMaterial = new THREE.MeshStandardMaterial({
				color: 0xfef2cf,
				emissive: side > 0 ? 0xff3b9e : 0x2ed6ff,
				emissiveIntensity: 1.2,
				roughness: 0.2,
				metalness: 0.7,
			});

			const poleGroup = new THREE.Group();
			const pole = new THREE.Mesh(poleGeometry, poleMaterial);
			pole.position.y = 0.65;
			const arm = new THREE.Mesh(armGeometry, poleMaterial);
			arm.position.set(side * 0.12, 1.23, 0);
			const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
			lamp.position.set(side * 0.24, 1.18, 0);

			const beamLight = new THREE.SpotLight(
				0xffefc8,
				1.15,
				4.4,
				Math.PI / 7,
				0.6,
				1.7,
			);
			beamLight.position.set(side * 0.22, 1.15, 0);

			const beamTarget = new THREE.Object3D();
			beamTarget.position.set(side * 0.62, -0.08, -0.32);
			beamLight.target = beamTarget;

			poleGroup.add(pole, arm, lamp, beamLight, beamTarget);
			poleGroup.position.copy(basePoint);
			poleGroup.quaternion.setFromUnitVectors(FORWARD, tempTangent);
			scene.add(poleGroup);

			streetLights.push({ lampMaterial, beamLight, progress: t });
		}

		const car = new THREE.Group();
		car.scale.setScalar(0.38);
		scene.add(car);

		const bodyMaterial = new THREE.MeshStandardMaterial({
			color: 0xcbd1d7,
			emissive: 0x1d2127,
			emissiveIntensity: 0.2,
			roughness: 0.22,
			metalness: 0.88,
		});
		const glassMaterial = new THREE.MeshStandardMaterial({
			color: 0x0f1319,
			emissive: 0x2a3443,
			emissiveIntensity: 0.28,
			roughness: 0.12,
			metalness: 0.54,
		});
		const trimMaterial = new THREE.MeshStandardMaterial({
			color: 0x101318,
			roughness: 0.5,
			metalness: 0.5,
		});

		const carBody = new THREE.Mesh(
			new THREE.BoxGeometry(1.02, 0.17, 1.62),
			bodyMaterial,
		);
		carBody.position.y = 0.08;
		car.add(carBody);

		const hoodWedge = new THREE.Mesh(
			new THREE.BoxGeometry(0.94, 0.16, 0.82),
			bodyMaterial,
		);
		hoodWedge.position.set(0, 0.21, -0.32);
		hoodWedge.rotation.x = -0.28;
		car.add(hoodWedge);

		const bedWedge = new THREE.Mesh(
			new THREE.BoxGeometry(0.94, 0.13, 0.74),
			bodyMaterial,
		);
		bedWedge.position.set(0, 0.24, 0.47);
		bedWedge.rotation.x = 0.24;
		car.add(bedWedge);

		const carCabin = new THREE.Mesh(
			new THREE.BoxGeometry(0.64, 0.12, 0.72),
			glassMaterial,
		);
		carCabin.position.set(0, 0.34, 0.03);
		carCabin.rotation.x = -0.2;
		car.add(carCabin);

		const carRoof = new THREE.Mesh(
			new THREE.BoxGeometry(0.48, 0.05, 0.46),
			bodyMaterial,
		);
		carRoof.position.set(0, 0.42, 0.09);
		carRoof.rotation.x = -0.18;
		car.add(carRoof);

		const sideSkirtLeft = new THREE.Mesh(
			new THREE.BoxGeometry(0.06, 0.1, 1.36),
			trimMaterial,
		);
		sideSkirtLeft.position.set(-0.53, 0.06, 0);
		car.add(sideSkirtLeft);

		const sideSkirtRight = sideSkirtLeft.clone();
		sideSkirtRight.position.x = 0.53;
		car.add(sideSkirtRight);

		const rearTopTrim = new THREE.Mesh(
			new THREE.BoxGeometry(0.86, 0.04, 0.2),
			trimMaterial,
		);
		rearTopTrim.position.set(0, 0.35, 0.78);
		car.add(rearTopTrim);

		const wheelGeometry = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 14);
		const wheelMaterial = new THREE.MeshStandardMaterial({
			color: 0x08090b,
			roughness: 0.8,
			metalness: 0.12,
		});
		const wheelOffsets = [
			[-0.44, -0.01, -0.5],
			[0.44, -0.01, -0.5],
			[-0.44, -0.01, 0.5],
			[0.44, -0.01, 0.5],
		] as const;
		const wheels: THREE.Mesh[] = [];
		for (const [x, y, z] of wheelOffsets) {
			const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
			wheel.rotation.z = Math.PI / 2;
			wheel.position.set(x, y, z);
			car.add(wheel);
			wheels.push(wheel);
		}

		const frontPixels = new THREE.Mesh(
			new THREE.BoxGeometry(0.76, 0.04, 0.03),
			new THREE.MeshBasicMaterial({
				color: 0xf8f7f2,
			}),
		);
		frontPixels.position.set(0, 0.2, -0.98);
		car.add(frontPixels);

		const rearPixels = new THREE.Mesh(
			new THREE.BoxGeometry(0.7, 0.036, 0.03),
			new THREE.MeshBasicMaterial({
				color: 0xff3f87,
			}),
		);
		rearPixels.position.set(0, 0.23, 0.95);
		car.add(rearPixels);

		const starsCount = lowPowerDevice ? 260 : 420;
		const starPositions = new Float32Array(starsCount * 3);
		for (let index = 0; index < starsCount; index++) {
			const spread = 42;
			starPositions[index * 3] = (Math.random() - 0.5) * spread;
			starPositions[index * 3 + 1] = Math.random() * 11 - 2.6;
			starPositions[index * 3 + 2] = (Math.random() - 0.5) * spread - 10;
		}
		const stars = new THREE.Points(
			new THREE.BufferGeometry().setAttribute(
				"position",
				new THREE.BufferAttribute(starPositions, 3),
			),
			new THREE.PointsMaterial({
				color: 0xf7f5ef,
				size: lowPowerDevice ? 0.055 : 0.045,
				transparent: true,
				opacity: 0.86,
				sizeAttenuation: true,
			}),
		);
		scene.add(stars);

		const cameraOffset = new THREE.Vector3(0, 2.4, 8.1);
		const targetQuat = new THREE.Quaternion();
		const lookAhead = new THREE.Vector3();
		const cameraTarget = new THREE.Vector3();
		const point = new THREE.Vector3();
		const tangent = new THREE.Vector3();
		const neonPinkTarget = new THREE.Vector3();
		const neonBlueTarget = new THREE.Vector3();
		const clock = new THREE.Clock();
		let previousTravel = smoothstep(progressRef.current);
		let wheelRoll = 0;

		const renderScene = (elapsed: number) => {
			const travel = smoothstep(progressRef.current);
			routePath.getPointAt(travel, point);
			routePath.getTangentAt(travel, tangent).normalize();

			const deltaTravel = travel - previousTravel;
			previousTravel = travel;
			wheelRoll += deltaTravel * 520;

			targetQuat.setFromUnitVectors(FORWARD, tangent);
			car.quaternion.slerp(targetQuat, allowMotion ? 0.16 : 1);

			const bodyLift = allowMotion
				? Math.sin(elapsed * 3.8 + travel * 10) * 0.009
				: 0;
			car.position.set(point.x, point.y + 0.08 + bodyLift, point.z);

			for (const wheel of wheels) {
				wheel.rotation.x = wheelRoll;
			}

			cameraTarget
				.copy(cameraOffset)
				.applyQuaternion(car.quaternion)
				.add(car.position);
			camera.position.lerp(cameraTarget, allowMotion ? 0.08 : 1);

			const lookAheadProgress = clamp(travel + 0.025);
			routePath.getPointAt(lookAheadProgress, lookAhead);
			lookAhead.y += 0.15;
			camera.lookAt(lookAhead);

			laneMaterial.opacity =
				0.56 + (allowMotion ? 0.09 * Math.sin(elapsed * 5 - travel * 12) : 0);

			for (const streetLight of streetLights) {
				const distance = Math.abs(travel - streetLight.progress);
				const influence = clamp(1 - distance / 0.22);
				const flicker = allowMotion
					? 0.65 + 0.35 * Math.sin(elapsed * 3 + streetLight.progress * 17)
					: 0.7;
				streetLight.lampMaterial.emissiveIntensity =
					0.9 + flicker * 0.9 + influence * 0.35;
				streetLight.beamLight.intensity =
					0.78 + influence * 0.66 + (allowMotion ? flicker * 0.26 : 0.2);
			}

			stars.rotation.y = elapsed * 0.03;

			neonPinkTarget.set(point.x + 1.55, point.y + 1.5, point.z - 1.3);
			neonBlueTarget.set(point.x - 1.2, point.y + 0.8, point.z + 2.25);
			neonPink.position.lerp(neonPinkTarget, 0.06);
			neonBlue.position.lerp(neonBlueTarget, 0.06);

			renderer.render(scene, camera);
		};

		const renderOnce = () => {
			renderScene(allowMotion ? clock.getElapsedTime() : 0);
		};
		renderOnceRef.current = renderOnce;

		const animate = () => {
			if (!active || !allowMotion) {
				frame = 0;
				return;
			}

			renderScene(clock.getElapsedTime());
			frame = window.requestAnimationFrame(animate);
		};

		const ensureAnimation = () => {
			if (active && allowMotion && frame === 0) {
				frame = window.requestAnimationFrame(animate);
			}
		};

		const syncSize = () => {
			width = Math.max(host.clientWidth, 1);
			height = Math.max(host.clientHeight, 1);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
			renderer.setPixelRatio(
				Math.min(window.devicePixelRatio || 1, lowPowerDevice ? 0.9 : 1),
			);
			renderOnce();
		};

		const onMotionChange = (event: MediaQueryListEvent) => {
			allowMotion = !event.matches;
			if (!allowMotion && frame !== 0) {
				window.cancelAnimationFrame(frame);
				frame = 0;
			}
			if (allowMotion) {
				ensureAnimation();
			}
			renderOnce();
		};

		const onVisibilityChange = () => {
			active = document.visibilityState === "visible";
			if (active) {
				ensureAnimation();
			} else if (frame !== 0) {
				window.cancelAnimationFrame(frame);
				frame = 0;
			}
		};

		const resizeObserver = new ResizeObserver(syncSize);
		resizeObserver.observe(host);
		reducedMotionMedia.addEventListener("change", onMotionChange);
		document.addEventListener("visibilitychange", onVisibilityChange);

		syncSize();
		ensureAnimation();
		if (!allowMotion) {
			renderOnce();
		}

		return () => {
			renderOnceRef.current = null;
			resizeObserver.disconnect();
			reducedMotionMedia.removeEventListener("change", onMotionChange);
			document.removeEventListener("visibilitychange", onVisibilityChange);
			window.cancelAnimationFrame(frame);
			disposeObject3D(scene);
			renderer.dispose();
			if (host.contains(renderer.domElement)) {
				host.removeChild(renderer.domElement);
			}
		};
	}, []);

	return (
		<div className="journey-scene-shell" aria-hidden="true">
			<div ref={hostRef} className="journey-scene-canvas" />
			{showFallback ? (
				<div className="journey-scene-fallback">
					<p className="journey-scene-fallback-text">
						WebGL is unavailable. Scroll to continue exploring the portfolio.
					</p>
				</div>
			) : null}
		</div>
	);
}
