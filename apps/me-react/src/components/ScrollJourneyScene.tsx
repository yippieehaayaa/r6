import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type ScrollJourneySceneProps = {
	progress: number;
};

type Checkpoint = {
	mesh: THREE.Mesh;
	material: THREE.MeshBasicMaterial;
	progress: number;
	index: number;
};

const FORWARD = new THREE.Vector3(0, 0, -1);
const WORLD_UP = new THREE.Vector3(0, 1, 0);

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
		scene.fog = new THREE.FogExp2(0x060b17, 0.046);

		const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 80);
		camera.position.set(0, 1.4, 4);

		const renderer = new THREE.WebGLRenderer({
			antialias: !lowPowerDevice,
			alpha: true,
			powerPreference: lowPowerDevice ? "default" : "high-performance",
		});
		renderer.setPixelRatio(
			Math.min(window.devicePixelRatio || 1, lowPowerDevice ? 1.2 : 1.8),
		);
		renderer.setSize(width, height);
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		host.appendChild(renderer.domElement);

		const ambient = new THREE.AmbientLight(0x7fa5ff, 0.44);
		const keyLight = new THREE.DirectionalLight(0x79dbff, 1.05);
		keyLight.position.set(4, 5, 3);
		const rimLight = new THREE.PointLight(0x5f7dff, 1.15, 22, 2);
		rimLight.position.set(-3, 1.8, -4);
		const underGlowLight = new THREE.PointLight(0x40e6ff, 0.6, 9, 2);
		scene.add(ambient, keyLight, rimLight, underGlowLight);

		const routePath = new THREE.CatmullRomCurve3(
			[
				new THREE.Vector3(0, 0, 2),
				new THREE.Vector3(1.2, 0.2, -2.5),
				new THREE.Vector3(-1.35, 0.28, -7),
				new THREE.Vector3(1.45, 0.35, -11.3),
				new THREE.Vector3(-1.2, 0.23, -15.7),
				new THREE.Vector3(0.8, 0.38, -20),
				new THREE.Vector3(0, 0.26, -24.2),
			],
			false,
			"catmullrom",
			0.4,
		);

		const roadGeometry = new THREE.TubeGeometry(
			routePath,
			lowPowerDevice ? 110 : 180,
			0.34,
			lowPowerDevice ? 10 : 18,
			false,
		);
		const roadMaterial = new THREE.MeshStandardMaterial({
			color: 0x0d1e30,
			emissive: 0x0c3657,
			emissiveIntensity: 0.45,
			roughness: 0.7,
			metalness: 0.24,
		});
		const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
		scene.add(roadMesh);

		const laneGeometry = new THREE.TubeGeometry(
			routePath,
			lowPowerDevice ? 110 : 180,
			0.035,
			lowPowerDevice ? 8 : 12,
			false,
		);
		const laneMaterial = new THREE.MeshStandardMaterial({
			color: 0xa0f2ff,
			emissive: 0x2ad2ff,
			emissiveIntensity: 1.2,
			roughness: 0.35,
			metalness: 0.65,
		});
		const laneMesh = new THREE.Mesh(laneGeometry, laneMaterial);
		scene.add(laneMesh);

		const grid = new THREE.GridHelper(80, 56, 0x2b4d78, 0x10233c);
		grid.position.y = -0.95;
		const gridMaterial = Array.isArray(grid.material)
			? grid.material
			: [grid.material];
		for (const material of gridMaterial) {
			material.transparent = true;
			material.opacity = 0.28;
		}
		scene.add(grid);

		const particlesCount = lowPowerDevice ? 220 : 460;
		const particlePositions = new Float32Array(particlesCount * 3);
		for (let index = 0; index < particlesCount; index++) {
			const spread = 24;
			particlePositions[index * 3] = (Math.random() - 0.5) * spread;
			particlePositions[index * 3 + 1] = Math.random() * 8 - 2.1;
			particlePositions[index * 3 + 2] = (Math.random() - 0.5) * spread - 11;
		}
		const particlesGeometry = new THREE.BufferGeometry();
		particlesGeometry.setAttribute(
			"position",
			new THREE.BufferAttribute(particlePositions, 3),
		);
		const particlesMaterial = new THREE.PointsMaterial({
			color: 0x8be9ff,
			size: lowPowerDevice ? 0.034 : 0.026,
			transparent: true,
			opacity: 0.5,
			sizeAttenuation: true,
		});
		const particles = new THREE.Points(particlesGeometry, particlesMaterial);
		scene.add(particles);

		const tunnelRingGeometry = new THREE.TorusGeometry(1.6, 0.015, 10, 64);
		const tunnelRingMaterial = new THREE.MeshBasicMaterial({
			color: 0x72dfff,
			transparent: true,
			opacity: 0.25,
		});
		const tunnelRings: THREE.Mesh[] = [];
		const tunnelCount = lowPowerDevice ? 20 : 28;
		for (let index = 0; index < tunnelCount; index++) {
			const progressPoint = index / (tunnelCount - 1);
			const position = routePath.getPointAt(progressPoint);
			const tangent = routePath.getTangentAt(progressPoint).normalize();

			const ring = new THREE.Mesh(tunnelRingGeometry, tunnelRingMaterial);
			ring.position.copy(position);
			ring.quaternion.setFromUnitVectors(FORWARD, tangent);
			ring.scale.setScalar(1 + index * 0.02);
			scene.add(ring);
			tunnelRings.push(ring);
		}

		const checkpoints: Checkpoint[] = [];
		const checkpointProgress = [0.04, 0.26, 0.5, 0.74, 0.93];
		for (const [index, progressValue] of checkpointProgress.entries()) {
			const position = routePath.getPointAt(progressValue);
			const tangent = routePath.getTangentAt(progressValue).normalize();
			const material = new THREE.MeshBasicMaterial({
				color: 0x73f4ff,
				transparent: true,
				opacity: 0.25,
			});
			const mesh = new THREE.Mesh(
				new THREE.TorusGeometry(0.55, 0.028, 12, 48),
				material,
			);
			mesh.position.copy(position);
			mesh.quaternion.setFromUnitVectors(FORWARD, tangent);
			scene.add(mesh);
			checkpoints.push({ mesh, material, progress: progressValue, index });
		}

		const car = new THREE.Group();
		scene.add(car);

		const carBody = new THREE.Mesh(
			new THREE.BoxGeometry(0.82, 0.2, 1.7),
			new THREE.MeshStandardMaterial({
				color: 0x74d7ff,
				emissive: 0x0a3855,
				emissiveIntensity: 0.8,
				roughness: 0.35,
				metalness: 0.76,
			}),
		);
		carBody.position.y = 0.12;
		car.add(carBody);

		const carCabin = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 0.22, 0.84),
			new THREE.MeshStandardMaterial({
				color: 0xd7f6ff,
				emissive: 0x2f8dbd,
				emissiveIntensity: 0.2,
				roughness: 0.2,
				metalness: 0.3,
				opacity: 0.92,
				transparent: true,
			}),
		);
		carCabin.position.set(0, 0.31, 0.08);
		car.add(carCabin);

		const wheelGeometry = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 20);
		const wheelMaterial = new THREE.MeshStandardMaterial({
			color: 0x0f1b2b,
			roughness: 0.68,
			metalness: 0.2,
		});
		const wheelOffsets = [
			[-0.34, -0.01, -0.56],
			[0.34, -0.01, -0.56],
			[-0.34, -0.01, 0.56],
			[0.34, -0.01, 0.56],
		] as const;
		const wheels: THREE.Mesh[] = [];
		for (const [x, y, z] of wheelOffsets) {
			const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
			wheel.rotation.z = Math.PI / 2;
			wheel.position.set(x, y, z);
			car.add(wheel);
			wheels.push(wheel);
		}

		const frontLightMaterial = new THREE.MeshBasicMaterial({
			color: 0xa4ecff,
			transparent: true,
			opacity: 0.9,
		});
		const frontLights = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 0.05, 0.03),
			frontLightMaterial,
		);
		frontLights.position.set(0, 0.14, -0.86);
		car.add(frontLights);

		const rearLightMaterial = new THREE.MeshBasicMaterial({
			color: 0x50a8ff,
			transparent: true,
			opacity: 0.5,
		});
		const rearLights = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 0.04, 0.03),
			rearLightMaterial,
		);
		rearLights.position.set(0, 0.14, 0.86);
		car.add(rearLights);

		const cameraOffset = new THREE.Vector3(0, 1.2, 3.4);
		const targetQuat = new THREE.Quaternion();
		const lookAhead = new THREE.Vector3();
		const cameraTarget = new THREE.Vector3();
		const point = new THREE.Vector3();
		const tangent = new THREE.Vector3();
		const rimTarget = new THREE.Vector3();
		const carBaseY = 0.2;
		const clock = new THREE.Clock();

		const renderScene = (elapsed: number) => {
			const t = smoothstep(progressRef.current);
			routePath.getPointAt(t, point);
			routePath.getTangentAt(t, tangent).normalize();

			targetQuat.setFromUnitVectors(FORWARD, tangent);
			car.quaternion.slerp(targetQuat, allowMotion ? 0.2 : 1);

			const bodyLift = allowMotion
				? Math.sin(elapsed * 3.8 + t * 7) * 0.025
				: 0;
			car.position.set(point.x, point.y + carBaseY + bodyLift, point.z);
			underGlowLight.position.set(point.x, point.y + 0.05, point.z + 0.1);

			const wheelSpeed = allowMotion ? 0.14 : 0.08;
			for (const wheel of wheels) {
				wheel.rotation.x = elapsed * -30 * wheelSpeed - t * 60;
			}

			cameraTarget
				.copy(cameraOffset)
				.applyQuaternion(car.quaternion)
				.add(car.position);
			camera.position.lerp(cameraTarget, allowMotion ? 0.08 : 1);

			const lookAheadProgress = clamp(t + 0.02);
			routePath.getPointAt(lookAheadProgress, lookAhead);
			lookAhead.y += 0.2;
			camera.up.lerp(WORLD_UP, 0.1);
			camera.lookAt(lookAhead);

			roadMaterial.emissiveIntensity =
				0.42 + (allowMotion ? 0.2 * Math.sin(elapsed * 1.9 + t * 8) : 0.1);
			laneMaterial.emissiveIntensity =
				1.1 + (allowMotion ? 0.55 * Math.sin(elapsed * 4.1 + t * 11) : 0.2);

			particles.rotation.y = elapsed * 0.04;
			particles.rotation.x = Math.sin(elapsed * 0.07) * 0.04;

			for (const ring of tunnelRings) {
				const depthDistance = Math.abs(ring.position.z - point.z);
				const glow = clamp(1 - depthDistance / 9, 0.12, 0.9);
				ring.scale.setScalar(1 + glow * 0.08);
			}

			for (const checkpoint of checkpoints) {
				const distance = Math.abs(t - checkpoint.progress);
				const influence = clamp(1 - distance / 0.16);
				const pulse = allowMotion
					? 1 + Math.sin(elapsed * 3 + checkpoint.index) * 0.04
					: 1;
				checkpoint.mesh.scale.setScalar(0.95 + influence * 0.3 * pulse);
				checkpoint.material.opacity = 0.15 + influence * 0.78;
			}

			rimTarget.set(point.x - 2.4, point.y + 1.6, point.z - 2.8);
			rimLight.position.lerp(rimTarget, 0.05);

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
				Math.min(window.devicePixelRatio || 1, lowPowerDevice ? 1.2 : 1.8),
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
