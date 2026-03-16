import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type ScrollJourneySceneProps = {
	progress: number;
};

type NeonGate = {
	group: THREE.Group;
	material: THREE.MeshStandardMaterial;
	progress: number;
	index: number;
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

		const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 70);
		camera.position.set(0, 1.4, 4.2);

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
				new THREE.Vector3(1.25, 0.1, -2.4),
				new THREE.Vector3(-1.35, 0.2, -6.8),
				new THREE.Vector3(1.5, 0.22, -11),
				new THREE.Vector3(-1.4, 0.2, -14.8),
				new THREE.Vector3(1.3, 0.15, -18.9),
				new THREE.Vector3(-0.2, 0.2, -23),
			],
			false,
			"catmullrom",
			0.1,
		);

		const ground = new THREE.Mesh(
			new THREE.PlaneGeometry(120, 120),
			new THREE.MeshStandardMaterial({
				color: 0x050507,
				roughness: 1,
				metalness: 0,
			}),
		);
		ground.rotation.x = -Math.PI / 2;
		ground.position.y = -0.95;
		scene.add(ground);

		const roadTilesCount = lowPowerDevice ? 96 : 150;
		const roadTileGeometry = new THREE.BoxGeometry(1.16, 0.08, 0.7);
		const laneTileGeometry = new THREE.BoxGeometry(0.14, 0.04, 0.25);
		const roadMaterialA = new THREE.MeshStandardMaterial({
			color: 0x120d17,
			emissive: 0x2f1037,
			emissiveIntensity: 0.25,
			roughness: 0.8,
			metalness: 0.2,
		});
		const roadMaterialB = new THREE.MeshStandardMaterial({
			color: 0x0b0911,
			emissive: 0x1b0f2f,
			emissiveIntensity: 0.2,
			roughness: 0.85,
			metalness: 0.14,
		});
		const laneMaterial = new THREE.MeshBasicMaterial({
			color: 0xffe499,
			transparent: true,
			opacity: 0.58,
		});

		const tempPoint = new THREE.Vector3();
		const tempTangent = new THREE.Vector3();
		const tempSide = new THREE.Vector3();

		for (let index = 0; index < roadTilesCount; index++) {
			const t = index / (roadTilesCount - 1);
			routePath.getPointAt(t, tempPoint);
			routePath.getTangentAt(t, tempTangent).normalize();

			const tile = new THREE.Mesh(
				roadTileGeometry,
				index % 2 === 0 ? roadMaterialA : roadMaterialB,
			);
			tile.position.copy(tempPoint);
			tile.position.y -= 0.1;
			tile.quaternion.setFromUnitVectors(FORWARD, tempTangent);
			scene.add(tile);

			if (index % 2 === 0) {
				const laneTile = new THREE.Mesh(laneTileGeometry, laneMaterial);
				laneTile.position.copy(tempPoint);
				laneTile.position.y += 0.015;
				laneTile.quaternion.setFromUnitVectors(FORWARD, tempTangent);
				scene.add(laneTile);
			}
		}

		const railSegments = lowPowerDevice ? 78 : 120;
		const leftRailPoints: THREE.Vector3[] = [];
		const rightRailPoints: THREE.Vector3[] = [];
		for (let index = 0; index <= railSegments; index++) {
			const t = index / railSegments;
			routePath.getPointAt(t, tempPoint);
			routePath.getTangentAt(t, tempTangent).normalize();
			tempSide.crossVectors(UP, tempTangent).normalize().multiplyScalar(0.84);
			leftRailPoints.push(tempPoint.clone().add(tempSide));
			rightRailPoints.push(tempPoint.clone().sub(tempSide));
		}
		const leftRailMaterial = new THREE.LineBasicMaterial({
			color: 0xff43a9,
			transparent: true,
			opacity: 0.72,
		});
		const rightRailMaterial = new THREE.LineBasicMaterial({
			color: 0x2ee2ff,
			transparent: true,
			opacity: 0.64,
		});
		const leftRail = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints(leftRailPoints),
			leftRailMaterial,
		);
		const rightRail = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints(rightRailPoints),
			rightRailMaterial,
		);
		scene.add(leftRail, rightRail);

		const cityBlockGeometry = new THREE.BoxGeometry(1, 1, 1);
		const cityBlockMaterial = new THREE.MeshStandardMaterial({
			color: 0x120f16,
			emissive: 0x2a1230,
			emissiveIntensity: 0.55,
			roughness: 0.8,
			metalness: 0.25,
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
			const sideOffset = 2 + Math.random() * 4.5;

			const block = new THREE.Mesh(cityBlockGeometry, cityBlockMaterial);
			block.scale.set(widthScale, heightScale, depthScale);
			block.position.copy(tempPoint);
			block.position.addScaledVector(tempSide, sideOffset * sideDirection);
			block.position.y = heightScale * 0.5 - 0.45;
			block.position.z += (Math.random() - 0.5) * 1.4;
			scene.add(block);
		}

		const neonGates: NeonGate[] = [];
		const gateProgress = [0.04, 0.26, 0.5, 0.74, 0.93];
		const gatePostGeometry = new THREE.BoxGeometry(0.07, 0.72, 0.07);
		const gateTopGeometry = new THREE.BoxGeometry(1.04, 0.08, 0.07);
		for (const [index, value] of gateProgress.entries()) {
			routePath.getPointAt(value, tempPoint);
			routePath.getTangentAt(value, tempTangent).normalize();
			const gateMaterial = new THREE.MeshStandardMaterial({
				color: 0xfdf5da,
				emissive: 0xff4faf,
				emissiveIntensity: 0.7,
				roughness: 0.25,
				metalness: 0.55,
			});
			const gate = new THREE.Group();
			const leftPost = new THREE.Mesh(gatePostGeometry, gateMaterial);
			leftPost.position.set(-0.48, 0, 0);
			const rightPost = new THREE.Mesh(gatePostGeometry, gateMaterial);
			rightPost.position.set(0.48, 0, 0);
			const topBar = new THREE.Mesh(gateTopGeometry, gateMaterial);
			topBar.position.set(0, 0.36, 0);
			gate.add(leftPost, rightPost, topBar);
			gate.position.copy(tempPoint);
			gate.position.y += 0.28;
			gate.quaternion.setFromUnitVectors(FORWARD, tempTangent);
			scene.add(gate);
			neonGates.push({ group: gate, material: gateMaterial, progress: value, index });
		}

		const car = new THREE.Group();
		car.scale.setScalar(0.72);
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

		const starsCount = lowPowerDevice ? 180 : 280;
		const starPositions = new Float32Array(starsCount * 3);
		for (let index = 0; index < starsCount; index++) {
			const spread = 30;
			starPositions[index * 3] = (Math.random() - 0.5) * spread;
			starPositions[index * 3 + 1] = Math.random() * 8 - 1.8;
			starPositions[index * 3 + 2] = (Math.random() - 0.5) * spread - 10;
		}
		const stars = new THREE.Points(
			new THREE.BufferGeometry().setAttribute(
				"position",
				new THREE.BufferAttribute(starPositions, 3),
			),
			new THREE.PointsMaterial({
				color: 0xf7f5ef,
				size: lowPowerDevice ? 0.05 : 0.04,
				transparent: true,
				opacity: 0.72,
				sizeAttenuation: true,
			}),
		);
		scene.add(stars);

		const cameraOffset = new THREE.Vector3(0, 1.42, 3.8);
		const targetQuat = new THREE.Quaternion();
		const lookAhead = new THREE.Vector3();
		const cameraTarget = new THREE.Vector3();
		const point = new THREE.Vector3();
		const tangent = new THREE.Vector3();
		const neonTarget = new THREE.Vector3();
		const clock = new THREE.Clock();

		const renderScene = (elapsed: number) => {
			const progressValue = smoothstep(progressRef.current);
			const steppedProgress = allowMotion
				? Math.round(progressValue * 260) / 260
				: progressValue;

			routePath.getPointAt(steppedProgress, point);
			routePath.getTangentAt(steppedProgress, tangent).normalize();

			targetQuat.setFromUnitVectors(FORWARD, tangent);
			car.quaternion.slerp(targetQuat, allowMotion ? 0.28 : 1);

			const bodyLift = allowMotion
				? Math.sin(elapsed * 6.2 + steppedProgress * 9) * 0.013
				: 0;
			car.position.set(point.x, point.y + 0.08 + bodyLift, point.z);

			const wheelSpin = allowMotion ? elapsed * 8 : 0;
			for (const wheel of wheels) {
				wheel.rotation.x = wheelSpin - steppedProgress * 44;
			}

			cameraTarget
				.copy(cameraOffset)
				.applyQuaternion(car.quaternion)
				.add(car.position);
			camera.position.lerp(cameraTarget, allowMotion ? 0.09 : 1);

			const lookAheadProgress = clamp(steppedProgress + 0.03);
			routePath.getPointAt(lookAheadProgress, lookAhead);
			lookAhead.y += 0.15;
			camera.lookAt(lookAhead);

			laneMaterial.opacity =
				0.48 + (allowMotion ? 0.28 * Math.sin(elapsed * 10 - steppedProgress * 15) : 0);
			leftRailMaterial.opacity =
				0.45 + (allowMotion ? 0.22 * Math.sin(elapsed * 3.8) : 0.08);
			rightRailMaterial.opacity =
				0.45 + (allowMotion ? 0.22 * Math.cos(elapsed * 3.2) : 0.08);

			for (const gate of neonGates) {
				const distance = Math.abs(steppedProgress - gate.progress);
				const influence = clamp(1 - distance / 0.16);
				const pulse = allowMotion
					? 0.5 + 0.5 * Math.sin(elapsed * 4 + gate.index)
					: 0.5;
				gate.material.emissiveIntensity = 0.45 + influence * (0.5 + pulse * 0.9);
				gate.group.scale.setScalar(0.92 + influence * 0.2);
			}

			stars.rotation.y = elapsed * 0.03;

			neonTarget.set(point.x + 1.6, point.y + 1.5, point.z - 1.4);
			neonPink.position.lerp(neonTarget, 0.06);
			neonBlue.position.lerp(
				new THREE.Vector3(point.x - 1.2, point.y + 0.8, point.z + 2.4),
				0.06,
			);

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
						WebGL is unavailable. Scroll to continue through the story.
					</p>
				</div>
			) : null}
		</div>
	);
}
