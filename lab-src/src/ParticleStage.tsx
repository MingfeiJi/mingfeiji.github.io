import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const colorSets = [
  { primary: '#9afff1', secondary: '#2e77ff' },
  { primary: '#b58cff', secondary: '#ff55bc' },
  { primary: '#61ff9e', secondary: '#00d6a3' },
  { primary: '#8dffd9', secondary: '#596cff' },
  { primary: '#f7f2a6', secondary: '#59ffe1' },
  { primary: '#ff6d5c', secondary: '#b85dff' }
];

const sceneTargets = [
  { x: 1.2, y: 0.18, z: 0, scale: 1.2, camX: 0, camY: 0.2, camZ: 10.2, lookX: 0.2, lookY: 0.05 },
  { x: 0.04, y: -0.02, z: -0.5, scale: 1.4, camX: -0.22, camY: 0.1, camZ: 10.5, lookX: 0, lookY: 0.02 },
  { x: -0.68, y: 0.28, z: -1.1, scale: 1.08, camX: 0.48, camY: 0.46, camZ: 10.9, lookX: -0.2, lookY: 0.24 },
  { x: 0.12, y: 0.06, z: -0.55, scale: 1.48, camX: 0.06, camY: 0.12, camZ: 8.65, lookX: 0, lookY: 0 },
  { x: 0.46, y: 0.72, z: -0.9, scale: 1.26, camX: -0.46, camY: 0.68, camZ: 10.3, lookX: 0.18, lookY: 0.32 },
  { x: 0.02, y: -0.18, z: -1.4, scale: 1.14, camX: 0.18, camY: -0.06, camZ: 10.7, lookX: 0, lookY: -0.08 }
];

export function ParticleStage({
  activeIndex,
  activeScene = 0
}: {
  activeIndex: number;
  activeScene?: number;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(activeIndex);
  const sceneRef = useRef(activeScene);

  useEffect(() => {
    activeRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    sceneRef.current = activeScene;
  }, [activeScene]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 760px)').matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.022);

    const ambientLight = new THREE.AmbientLight(0xbad9ff, 1.1);
    const keyLight = new THREE.PointLight(0xffe08a, 22, 26, 2);
    const rimLight = new THREE.PointLight(0xff4fa3, 16, 22, 2);
    keyLight.position.set(2.8, 3.2, 4.5);
    rimLight.position.set(-3.4, -1.6, 2.8);
    scene.add(ambientLight, keyLight, rimLight);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 160);
    camera.position.set(0, 0.2, 10.2);

    const root = new THREE.Group();
    root.position.set(isMobile ? 0 : 1.2, 0.25, 0);
    scene.add(root);

    const particleCount = isMobile ? 6800 : 15000;
    const sphereGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i += 1) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const radius = 2.45 + (Math.random() - 0.5) * 0.56;
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      sizes[i] = Math.random() * 0.9 + 0.35;
    }

    sphereGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    sphereGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const particleUniforms = {
      uTime: { value: 0 },
      uScene: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPulse: { value: 2 },
      uPulsePoint: { value: new THREE.Vector2(0, 0) },
      uPrimary: { value: new THREE.Color(colorSets[0].primary) },
      uSecondary: { value: new THREE.Color(colorSets[0].secondary) }
    };

    const particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: particleUniforms,
      vertexShader: `
        attribute float aSize;
        uniform float uTime;
        uniform float uScene;
        uniform vec2 uPointer;
        uniform float uPulse;
        uniform vec2 uPulsePoint;
        varying float vPulse;
        varying vec3 vPos;
        varying float vPlayMode;

        vec3 sceneShape(float sceneIndex, vec3 source) {
          float radius = max(length(source), 0.001);
          float azimuth = atan(source.z, source.x);
          float elevation = asin(clamp(source.y / radius, -1.0, 1.0));

          if (sceneIndex < 0.5) {
            return source;
          }

          if (sceneIndex < 1.5) {
            float side = source.z > 0.0 ? 1.0 : -1.0;
            return vec3(
              source.x * 1.42 + side * 0.68,
              source.y * 1.24,
              side * 0.24 + sin(source.x * 2.3) * 0.1
            );
          }

          if (sceneIndex < 2.5) {
            float cageRadius = 2.34 + sin(elevation * 5.0) * 0.16;
            return vec3(
              cos(azimuth) * cageRadius,
              source.y * 1.72,
              sin(azimuth) * cageRadius
            );
          }

          if (sceneIndex < 3.5) {
            float spiral = azimuth * 2.4 + elevation * 2.0;
            float spiralRadius = 3.15 + abs(elevation) * 2.1;
            return vec3(
              cos(spiral) * spiralRadius,
              source.y * 0.52 + sin(azimuth * 4.0) * 0.42,
              sin(spiral) * spiralRadius
            );
          }

          if (sceneIndex < 4.5) {
            float cellAngle = floor(azimuth / 0.5235988) * 0.5235988 + 0.2617994;
            float discRadius = 2.4 + sin(elevation * 7.0) * 0.26;
            return vec3(
              cos(cellAngle) * discRadius,
              source.y * 0.34,
              sin(cellAngle) * discRadius
            );
          }

          float tube = 0.74 + sin(elevation * 4.0) * 0.16;
          float ring = 2.14 + tube * cos(elevation * 2.0);
          return vec3(
            ring * cos(azimuth),
            tube * sin(elevation * 2.0) * 1.5,
            ring * sin(azimuth)
          );
        }

        void main() {
          float lowerScene = floor(uScene);
          float upperScene = ceil(uScene);
          float sceneBlend = smoothstep(0.0, 1.0, fract(uScene));
          vec3 p = mix(sceneShape(lowerScene, position), sceneShape(upperScene, position), sceneBlend);
          float wave = sin((p.x * 2.2) + (p.y * 1.8) + uTime * 1.45) * 0.09;
          float cut = smoothstep(-0.2, 1.9, p.y + sin(uTime + p.x) * 0.45);
          vec2 pointer = vec2(uPointer.x * 2.5, -uPointer.y * 1.55);
          float pointerDistance = distance(p.xy, pointer);
          float pointerField = smoothstep(2.2, 0.0, pointerDistance);
          float playMode = smoothstep(2.6, 3.0, uScene) * (1.0 - smoothstep(3.0, 3.4, uScene));
          float pulseDistance = distance(p.xy, uPulsePoint);
          float pulseRing = exp(-28.0 * abs(pulseDistance - uPulse * 4.6));
          float pulseFade = 1.0 - smoothstep(0.72, 1.28, uPulse);
          p += normalize(p) * wave * cut;
          p.xy += normalize(p.xy - pointer + 0.0001) * pointerField * mix(0.46, 1.1, playMode);
          p.z += pointerField * mix(0.34, 0.7, playMode);
          p.xy += normalize(p.xy - uPulsePoint + 0.0001) * pulseRing * pulseFade * 0.72;
          p.z += pulseRing * pulseFade * 0.62;
          vPos = p;
          vPlayMode = playMode;
          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          vPulse = max(max(cut, pointerField), pulseRing * pulseFade);
          gl_PointSize = (aSize + cut * 0.75 + pointerField * 1.4 + pulseRing * pulseFade * 2.4) * (58.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uPrimary;
        uniform vec3 uSecondary;
        varying float vPulse;
        varying vec3 vPos;
        varying float vPlayMode;

        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          float alpha = smoothstep(0.5, 0.05, dist) * (0.12 + vPulse * 0.36) * mix(1.0, 0.48, vPlayMode);
          vec3 color = mix(uSecondary, uPrimary, smoothstep(-1.2, 1.2, vPos.x + vPos.y));
          gl_FragColor = vec4(color, alpha);
        }
      `
    });

    const sphere = new THREE.Points(sphereGeometry, particleMaterial);
    sphere.rotation.set(-0.18, -0.45, 0.1);
    root.add(sphere);

    const outerStars = createStars(isMobile ? 2600 : 5600);
    scene.add(outerStars);

    const flowField = createFlowField(isMobile ? 5200 : 15000);
    flowField.position.set(0.6, -0.2, -1.6);
    scene.add(flowField);

    const dataBands = createDataBands(isMobile ? 7 : 13);
    dataBands.position.set(0.5, -0.4, -0.4);
    scene.add(dataBands);

    const cube = createWireCube(5.6, 0x2b9dff);
    cube.rotation.set(0.2, 0.68, 0.05);
    root.add(cube);

    const rings = createRings();
    root.add(rings);

    const orbitCloud = createOrbitCloud(isMobile ? 900 : 2200);
    root.add(orbitCloud);

    const coreWires = createCoreWires(isMobile ? 26 : 58);
    root.add(coreWires);

    const nucleus = createNucleus();
    root.add(nucleus);

    const playSwarms = createPlaySwarms(isMobile);
    root.add(playSwarms);

    const playDepthField = createPlayDepthField(isMobile);
    root.add(playDepthField);

    const playArtifacts = createPlayArtifacts();
    root.add(playArtifacts);

    const terrain = createTerrain(isMobile);
    terrain.position.set(0, -2.65, -1.1);
    scene.add(terrain);

    const pointer = new THREE.Vector2(0, 0);
    const targetPointer = new THREE.Vector2(0, 0);

    function handlePointerMove(event: PointerEvent) {
      targetPointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      targetPointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    }

    function triggerPulse(x: number, y: number) {
      particleUniforms.uPulsePoint.value.set(x, y);
      particleUniforms.uPulse.value = 0;
    }

    function handlePointerDown(event: PointerEvent) {
      if (sceneRef.current !== 3) return;
      triggerPulse(
        (event.clientX / window.innerWidth - 0.5) * 5.2,
        -(event.clientY / window.innerHeight - 0.5) * 3.5
      );
    }

    function handlePulseEvent(event: Event) {
      if (sceneRef.current !== 3) return;
      const detail = (event as CustomEvent<{ x?: number; y?: number }>).detail;
      triggerPulse(detail?.x ?? 0, detail?.y ?? 0);
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1.25 : 1.8));
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('particle-pulse', handlePulseEvent);
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let frameId = 0;
    let smoothedPulse = 0;

    function animate() {
      const time = clock.getElapsedTime();
      const sceneIndex = sceneRef.current;
      const target = sceneTargets[sceneIndex] ?? sceneTargets[0];
      const active = colorSets[sceneIndex] ?? colorSets[0];
      const projectShift = activeRef.current * 0.08;
      particleUniforms.uTime.value = reducedMotion ? 0.8 : time;
      particleUniforms.uScene.value += (sceneIndex - particleUniforms.uScene.value) * 0.022;
      particleUniforms.uPulse.value = Math.min(2, particleUniforms.uPulse.value + (reducedMotion ? 0.04 : 0.018));
      particleUniforms.uPointer.value.lerp(pointer, 0.08);
      particleUniforms.uPrimary.value.lerp(new THREE.Color(active.primary), 0.035);
      particleUniforms.uSecondary.value.lerp(new THREE.Color(active.secondary), 0.035);

      pointer.lerp(targetPointer, 0.045);
      const motionScale = reducedMotion ? 0.12 : 1;
      root.position.x += ((isMobile ? 0 : target.x) + pointer.x * 0.18 - root.position.x) * 0.035;
      root.position.y += (target.y - pointer.y * 0.08 - root.position.y) * 0.035;
      root.position.z += (target.z - root.position.z) * 0.035;
      root.scale.lerp(new THREE.Vector3(target.scale, target.scale, target.scale), 0.035);
      root.rotation.y = time * (0.04 + sceneIndex * 0.006) * motionScale + pointer.x * 0.12 + projectShift;
      root.rotation.x = pointer.y * 0.05;
      sphere.rotation.y += 0.0015 * motionScale;
      flowField.rotation.y = time * (0.018 + sceneIndex * 0.004) * motionScale + pointer.x * 0.08;
      flowField.rotation.x = -0.08 + pointer.y * 0.035;
      flowField.position.y = -0.2 + Math.sin(time * 0.18 + sceneIndex) * 0.2;
      dataBands.rotation.y = Math.sin(time * 0.22 + sceneIndex) * 0.12 + pointer.x * 0.04;
      dataBands.position.x = 0.5 + pointer.x * 0.32 - sceneIndex * 0.15;
      orbitCloud.rotation.x = time * 0.024 * motionScale + pointer.y * 0.05;
      orbitCloud.rotation.y = -time * 0.032 * motionScale + pointer.x * 0.11;
      coreWires.rotation.y = time * 0.062 * motionScale;
      coreWires.rotation.z = Math.sin(time * 0.42) * 0.12 + pointer.x * 0.08;
      nucleus.rotation.x = time * 0.13 * motionScale;
      nucleus.rotation.y = -time * 0.17 * motionScale;
      nucleus.scale.setScalar(1 + Math.sin(time * 1.8) * 0.035 + sceneIndex * 0.025 + activeRef.current * 0.01);
      const usePlayModel = sceneIndex === 3;
      cube.visible = !usePlayModel;
      rings.visible = !usePlayModel;
      orbitCloud.visible = !usePlayModel;
      coreWires.visible = !usePlayModel;
      nucleus.visible = !usePlayModel;
      const playTarget = sceneIndex === 3 ? 1 : 0;
      const playIntensity = (playSwarms.userData.intensity as number) ?? 0;
      const nextPlayIntensity = playIntensity + (playTarget - playIntensity) * 0.035;
      const playMode = sceneIndex === 3 ? 1 : 0;
      const rawPulseKick = Math.max(0, 1 - particleUniforms.uPulse.value / 1.16) * playMode;
      smoothedPulse += (rawPulseKick - smoothedPulse) * 0.032;
      const pulseKick = smoothedPulse;
      playSwarms.userData.intensity = nextPlayIntensity;
      playSwarms.visible = nextPlayIntensity > 0.015;
      playSwarms.rotation.y = -time * 0.22 * motionScale + pointer.x * 0.26;
      playSwarms.rotation.z = Math.sin(time * 0.38) * 0.16 + pointer.y * 0.1;
      playSwarms.position.z = Math.sin(time * 0.45) * 0.32 - nextPlayIntensity * 0.25;
      playSwarms.scale.setScalar(0.72 + nextPlayIntensity * 0.42 + Math.sin(time * 0.9) * 0.025);
      for (const material of playSwarms.userData.materials as THREE.PointsMaterial[]) {
        material.opacity = (material.userData.baseOpacity as number) * nextPlayIntensity;
      }
      playDepthField.visible = nextPlayIntensity > 0.015;
      playDepthField.rotation.y = time * 0.075 * motionScale - pointer.x * 0.18;
      playDepthField.rotation.x = pointer.y * 0.1;
      for (const layer of playDepthField.children) {
        const depth = layer.userData.depth as number;
        layer.position.x = pointer.x * depth * 0.34;
        layer.position.y = pointer.y * depth * 0.18 + Math.sin(time * 0.42 + depth) * 0.12;
        layer.position.z = depth + Math.cos(time * 0.32 + depth) * 0.22;
        layer.rotation.z = time * (0.05 + Math.abs(depth) * 0.016) * motionScale;
      }
      for (const material of playDepthField.userData.materials as THREE.PointsMaterial[]) {
        material.opacity = (material.userData.baseOpacity as number) * nextPlayIntensity;
      }
      playArtifacts.visible = nextPlayIntensity > 0.015;
      playArtifacts.userData.intensity = nextPlayIntensity;
      playArtifacts.rotation.y = time * 0.24 * motionScale - pointer.x * 0.32;
      playArtifacts.rotation.x = Math.sin(time * 0.46) * 0.16 + pointer.y * 0.12;
      playArtifacts.position.z += (-0.5 - pulseKick * 0.12 - playArtifacts.position.z) * 0.045;
      const artifactScale = 0.72 + nextPlayIntensity * 0.58 + pulseKick * 0.035;
      playArtifacts.scale.lerp(new THREE.Vector3(artifactScale, artifactScale, artifactScale), 0.045);
      const core = playArtifacts.userData.core as THREE.Mesh;
      core.rotation.x = 0.15 + Math.sin(time * 0.42) * 0.08;
      core.rotation.y = -time * 0.16 * motionScale;
      const crystal = playArtifacts.userData.crystal as THREE.Mesh;
      crystal.rotation.y = -time * 0.1 * motionScale;
      crystal.rotation.z = Math.sin(time * 0.55) * 0.08;
      const crystalScale = 0.96 + Math.sin(time * 1.16) * 0.045 + pulseKick * 0.045;
      crystal.scale.lerp(new THREE.Vector3(crystalScale, crystalScale, crystalScale), 0.045);
      const cage = playArtifacts.userData.cage as THREE.Group;
      cage.rotation.y = Math.sin(time * 0.18) * 0.08 + pointer.x * 0.05;
      cage.rotation.z = Math.sin(time * 0.27) * 0.025;
      for (const shard of playArtifacts.userData.shards as THREE.Mesh[]) {
        const offset = shard.userData.offset as number;
        const baseRotation = shard.userData.baseRotation as THREE.Euler;
        shard.rotation.x = baseRotation.x + Math.sin(time * (0.24 + offset * 0.016)) * 0.16;
        shard.rotation.y = baseRotation.y - time * (0.1 + offset * 0.012);
        shard.rotation.z = baseRotation.z + Math.cos(time * (0.2 + offset * 0.014)) * 0.12;
      }
      for (const material of playArtifacts.userData.materials as THREE.MeshStandardMaterial[]) {
        material.opacity = (material.userData.baseOpacity as number) * nextPlayIntensity;
      }
      for (const material of playArtifacts.userData.pointMaterials as THREE.PointsMaterial[]) {
        material.opacity = (material.userData.baseOpacity as number) * nextPlayIntensity;
      }
      keyLight.intensity += (8 + nextPlayIntensity * 18 + pulseKick * 3.4 - keyLight.intensity) * 0.05;
      rimLight.intensity += (5 + nextPlayIntensity * 14 + pulseKick * 2.6 - rimLight.intensity) * 0.05;
      rings.rotation.y -= 0.0025 * motionScale;
      rings.rotation.z = Math.sin(time * 0.35 + sceneIndex) * 0.1;
      cube.rotation.y += 0.0009 * motionScale;
      cube.rotation.x = 0.2 + Math.sin(time * 0.3) * 0.04;
      terrain.position.z = -1.1 + Math.sin(time * 0.24 + sceneIndex) * 0.16;
      terrain.position.y = -2.65 + sceneIndex * 0.04;
      terrain.rotation.z = pointer.x * 0.018;
      outerStars.rotation.y = time * (0.006 + sceneIndex * 0.002) * motionScale;

      const pointerMagnitude = Math.min(1, pointer.length() * 0.55);
      const cameraX = target.camX + pointer.x * (playMode ? 0.86 : 0.42) + Math.sin(time * 0.22) * playMode * 0.16;
      const cameraY = target.camY - pointer.y * (playMode ? 0.42 : 0.22) + Math.cos(time * 0.19) * playMode * 0.11;
      const cameraZ = target.camZ - pointerMagnitude * playMode * 0.22 - pulseKick * 0.06;
      camera.position.x += (cameraX - camera.position.x) * 0.028;
      camera.position.y += (cameraY - camera.position.y) * 0.028;
      camera.position.z += (cameraZ - camera.position.z) * 0.022;
      const targetFov = 45 - playMode * 2.2 - pulseKick * 0.18;
      if (Math.abs(camera.fov - targetFov) > 0.02) {
        camera.fov += (targetFov - camera.fov) * 0.025;
        camera.updateProjectionMatrix();
      }
      camera.lookAt(target.lookX + pointer.x * playMode * 0.22, target.lookY - pointer.y * playMode * 0.16, 0);
      camera.rotation.z += ((pointer.x * 0.055 + Math.sin(time * 0.28) * 0.018) * playMode - camera.rotation.z) * 0.04;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('particle-pulse', handlePulseEvent);
      window.removeEventListener('resize', handleResize);
      sphereGeometry.dispose();
      particleMaterial.dispose();
      disposeObject(outerStars);
      disposeObject(flowField);
      disposeObject(dataBands);
      disposeObject(cube);
      disposeObject(rings);
      disposeObject(orbitCloud);
      disposeObject(coreWires);
      disposeObject(nucleus);
      disposeObject(playSwarms);
      disposeObject(playDepthField);
      disposeObject(playArtifacts);
      disposeObject(terrain);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="particle-stage" ref={mountRef} aria-hidden="true" />;
}

function createStars(count: number) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 34;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 2] = -Math.random() * 38;
    colors[i * 3] = Math.random() * 0.35;
    colors[i * 3 + 1] = 0.55 + Math.random() * 0.45;
    colors[i * 3 + 2] = 0.85 + Math.random() * 0.15;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 0.022,
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  return new THREE.Points(geometry, material);
}

function createFlowField(count: number) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const t = Math.random();
    const lane = Math.floor(Math.random() * 7) - 3;
    const angle = t * Math.PI * 2.8 + lane * 0.42;
    const spread = 4.5 + Math.random() * 8.5;
    const ribbon = Math.sin(t * Math.PI * 6 + lane) * 0.9;

    positions[i * 3] = Math.cos(angle) * spread + (Math.random() - 0.5) * 4.6;
    positions[i * 3 + 1] = ribbon + lane * 0.34 + (Math.random() - 0.5) * 1.4;
    positions[i * 3 + 2] = Math.sin(angle) * spread * 0.52 - Math.random() * 12;

    const cyan = 0.52 + Math.random() * 0.45;
    colors[i * 3] = Math.random() * 0.18;
    colors[i * 3 + 1] = cyan;
    colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
    sizes[i] = 0.35 + Math.random() * 1.65;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.026,
    vertexColors: true,
    transparent: true,
    opacity: 0.58,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  return new THREE.Points(geometry, material);
}

function createDataBands(count: number) {
  const group = new THREE.Group();

  for (let i = 0; i < count; i += 1) {
    const points: THREE.Vector3[] = [];
    const y = (i - count / 2) * 0.42;
    const z = -2 - Math.random() * 7;
    const width = 14 + Math.random() * 10;
    const segments = 72;

    for (let j = 0; j <= segments; j += 1) {
      const t = j / segments;
      const x = (t - 0.5) * width;
      const wave = Math.sin(t * Math.PI * 5 + i * 0.8) * (0.16 + Math.random() * 0.025);
      points.push(new THREE.Vector3(x, y + wave, z - Math.sin(t * Math.PI) * 1.8));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: i % 3 === 0 ? 0x6f55ff : 0x00d7ff,
      transparent: true,
      opacity: i % 3 === 0 ? 0.2 : 0.16,
      blending: THREE.AdditiveBlending
    });
    const line = new THREE.Line(geometry, material);
    line.rotation.x = -0.18 + Math.random() * 0.18;
    group.add(line);
  }

  return group;
}

function createOrbitCloud(count: number) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const orbit = 2.95 + Math.random() * 1.8;
    const belt = (Math.random() - 0.5) * 0.8;
    const tilt = Math.sin(angle * 3 + Math.random() * 2) * 0.32;

    positions[i * 3] = Math.cos(angle) * orbit;
    positions[i * 3 + 1] = belt + tilt;
    positions[i * 3 + 2] = Math.sin(angle) * orbit * (0.38 + Math.random() * 0.14);

    colors[i * 3] = 0.2 + Math.random() * 0.12;
    colors[i * 3 + 1] = 0.82 + Math.random() * 0.18;
    colors[i * 3 + 2] = 1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.022,
    vertexColors: true,
    transparent: true,
    opacity: 0.82,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const cloud = new THREE.Points(geometry, material);
  cloud.rotation.set(0.82, 0.1, -0.24);
  return cloud;
}

function createCoreWires(count: number) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: 0x8feeff,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending
  });

  for (let i = 0; i < count; i += 1) {
    const a = randomSpherePoint(0.35 + Math.random() * 0.75);
    const b = randomSpherePoint(1.45 + Math.random() * 1.35);
    const c = randomSpherePoint(0.75 + Math.random() * 1.8);
    const geometry = new THREE.BufferGeometry().setFromPoints([a, b, c]);
    const line = new THREE.Line(geometry, material.clone());
    group.add(line);
  }

  return group;
}

function createNucleus() {
  const group = new THREE.Group();
  const geometry = new THREE.IcosahedronGeometry(0.58, 2);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: 0x00d7ff,
      wireframe: true,
      transparent: true,
      opacity: 0.26
    })
  );
  group.add(mesh);

  const smallGeometry = new THREE.IcosahedronGeometry(0.22, 1);
  const small = new THREE.Mesh(
    smallGeometry,
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.34
    })
  );
  group.add(small);
  return group;
}

function createPlaySwarms(isMobile: boolean) {
  const group = new THREE.Group();
  const materials: THREE.PointsMaterial[] = [];
  const armCount = 4;
  const pointCount = isMobile ? 340 : 820;
  const palette = [0x62ffd2, 0x5369ff, 0x9cf7d2, 0x5f8cff];

  for (let arm = 0; arm < armCount; arm += 1) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pointCount * 3);

    for (let i = 0; i < pointCount; i += 1) {
      const progress = Math.pow(Math.random(), 0.72);
      const angle = progress * Math.PI * 3.25 + arm * (Math.PI * 2 / armCount) + 0.4;
      const radius = 1.34 + progress * 2.75 + (Math.random() - 0.5) * 0.26;
      const rise = Math.sin(progress * Math.PI * 2.7 + arm) * (0.12 + progress * 0.38);

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = rise + (Math.random() - 0.5) * 0.34;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: palette[arm],
      size: arm % 2 === 0 ? 0.022 : 0.017,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    material.userData.baseOpacity = arm % 2 === 0 ? 0.45 : 0.32;
    materials.push(material);
    group.add(new THREE.Points(geometry, material));
  }

  group.userData.materials = materials;
  group.userData.intensity = 0;
  group.visible = false;
  return group;
}

function createPlayDepthField(isMobile: boolean) {
  const group = new THREE.Group();
  const materials: THREE.PointsMaterial[] = [];
  const layers = [
    { depth: 2.1, count: isMobile ? 180 : 420, color: 0x8effdd, size: 0.014, opacity: 0.22 },
    { depth: 0.35, count: isMobile ? 260 : 620, color: 0x5a69ff, size: 0.018, opacity: 0.25 },
    { depth: -2.2, count: isMobile ? 220 : 520, color: 0x72d7ff, size: 0.013, opacity: 0.16 }
  ];

  for (const layerConfig of layers) {
    const layer = new THREE.Group();
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(layerConfig.count * 3);

    for (let i = 0; i < layerConfig.count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.1 + Math.pow(Math.random(), 0.54) * 5.4;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle * 2.6) * (0.25 + Math.random() * 0.9) + (Math.random() - 0.5) * 1.15;
      positions[i * 3 + 2] = Math.sin(angle) * radius * 0.24;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: layerConfig.color,
      size: layerConfig.size,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    material.userData.baseOpacity = layerConfig.opacity;
    materials.push(material);
    layer.userData.depth = layerConfig.depth;
    layer.add(new THREE.Points(geometry, material));
    group.add(layer);
  }

  group.userData.materials = materials;
  group.visible = false;
  return group;
}

function createOrganicCoreGeometry() {
  const geometry = new THREE.SphereGeometry(1, 96, 72);
  const position = geometry.getAttribute('position') as THREE.BufferAttribute;
  const vertex = new THREE.Vector3();

  for (let index = 0; index < position.count; index += 1) {
    vertex.fromBufferAttribute(position, index);
    const direction = vertex.clone().normalize();
    const ripple =
      Math.sin(direction.x * 4.2 + direction.y * 2.1) * 0.12 +
      Math.cos(direction.z * 5.7 - direction.y * 2.8) * 0.085 +
      Math.sin((direction.x - direction.z) * 7.5) * 0.06 +
      Math.cos(direction.x * 10.0 + direction.z * 7.0) * 0.026;
    vertex.multiplyScalar(1 + ripple);
    position.setXYZ(index, vertex.x, vertex.y, vertex.z);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createCoreSurface(count: number) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const direction = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );
    const ripple =
      Math.sin(direction.x * 4.2 + direction.y * 2.1) * 0.12 +
      Math.cos(direction.z * 5.7 - direction.y * 2.8) * 0.085 +
      Math.sin((direction.x - direction.z) * 7.5) * 0.06;
    const fill = 0.14 + Math.pow(Math.random(), 0.56) * 0.9;
    const radius = fill * (1 + ripple) + (Math.random() - 0.5) * 0.025;
    positions[index * 3] = direction.x * radius * 0.9;
    positions[index * 3 + 1] = direction.y * radius * 1.28;
    positions[index * 3 + 2] = direction.z * radius * 0.82;
    const sparkle = 0.35 + Math.random() * 0.65;
    colors[index * 3] = 0.08 + 0.24 * sparkle;
    colors[index * 3 + 1] = 0.76 + 0.24 * sparkle;
    colors[index * 3 + 2] = 0.32 + 0.46 * sparkle;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 0.034,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  material.userData.baseOpacity = 0.92;
  return new THREE.Points(geometry, material);
}

function createCoreGranules(count: number) {
  const geometry = new THREE.IcosahedronGeometry(0.028, 0);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x52e79a,
    metalness: 0.46,
    roughness: 0.32,
    clearcoat: 0.65,
    emissive: 0x0d6b43,
    emissiveIntensity: 0.72,
    transparent: true,
    opacity: 0,
    depthTest: false,
    depthWrite: false
  });
  material.userData.baseOpacity = 0.78;

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const rotation = new THREE.Euler();
  const scale = new THREE.Vector3();

  for (let index = 0; index < count; index += 1) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const direction = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );
    const ripple =
      Math.sin(direction.x * 4.2 + direction.y * 2.1) * 0.13 +
      Math.cos(direction.z * 5.7 - direction.y * 2.8) * 0.09;
    const fill = 0.12 + Math.pow(Math.random(), 0.46) * 0.92;
    const radius = fill * (1 + ripple);
    position.set(direction.x * radius * 0.9, direction.y * radius * 1.28, direction.z * radius * 0.82);
    rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    const size = 0.22 + Math.random() * 0.72;
    scale.setScalar(size);
    matrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
    mesh.setMatrixAt(index, matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
  mesh.renderOrder = 3;
  return mesh;
}

function createPlayArtifacts() {
  const group = new THREE.Group();
  const materials: THREE.MeshStandardMaterial[] = [];
  const pointMaterials: THREE.PointsMaterial[] = [];
  const orbitParts: THREE.Mesh[] = [];

  const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x041b18,
    metalness: 0.54,
    roughness: 0.4,
    clearcoat: 0.62,
    clearcoatRoughness: 0.22,
    transmission: 0,
    emissive: 0x063223,
    emissiveIntensity: 0.16,
    transparent: true,
    opacity: 0
  });
  coreMaterial.userData.baseOpacity = 0.14;
  materials.push(coreMaterial);

  const core = new THREE.Mesh(createOrganicCoreGeometry(), coreMaterial);
  core.scale.set(0.9, 1.28, 0.82);
  core.rotation.set(0.18, -0.42, 0.08);
  group.add(core);

  const crystalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0d3e30,
    metalness: 0.58,
    roughness: 0.36,
    clearcoat: 0.58,
    transmission: 0,
    transparent: true,
    opacity: 0,
    emissive: 0x0a5335,
    emissiveIntensity: 0.12
  });
  crystalMaterial.userData.baseOpacity = 0.08;
  materials.push(crystalMaterial);

  const crystal = new THREE.Mesh(createOrganicCoreGeometry(), crystalMaterial);
  crystal.scale.set(0.55, 0.84, 0.48);
  group.add(crystal);

  const coreSurface = createCoreSurface(7200);
  coreSurface.scale.set(0.9, 1, 0.82);
  pointMaterials.push(coreSurface.material as THREE.PointsMaterial);
  group.add(coreSurface);

  const granules = createCoreGranules(5200);
  materials.push(granules.material as THREE.MeshPhysicalMaterial);
  group.add(granules);

  const orbitPalette = [0x9cffe1, 0x5774ff, 0x4cf2b4, 0x7a9dff];
  const orbitRotations = [
    new THREE.Euler(1.12, 0.22, -0.48),
    new THREE.Euler(0.34, 1.02, 0.64)
  ];

  for (let index = 0; index < orbitRotations.length; index += 1) {
    const orbitMaterial = new THREE.MeshPhysicalMaterial({
      color: orbitPalette[index],
      metalness: 0.92,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.09,
      transparent: true,
      opacity: 0,
      emissive: index === 0 ? 0x0b4c3e : 0x101c6b,
      emissiveIntensity: 0.26
    });
    orbitMaterial.userData.baseOpacity = 0.3 - index * 0.035;
    materials.push(orbitMaterial);

    const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.24 + index * 0.34, 0.018 + index * 0.004, 10, 160), orbitMaterial);
    orbit.rotation.copy(orbitRotations[index]);
    orbit.scale.set(1.18, 0.76 + index * 0.1, 1);
    orbit.userData.offset = index * 0.8;
    orbit.userData.baseRotation = orbit.rotation.clone();
    orbitParts.push(orbit);
    group.add(orbit);
  }

  for (let index = 0; index < 3; index += 1) {
    const curvePoints: THREE.Vector3[] = [];
    const phase = (index / 3) * Math.PI * 2;
    for (let step = 0; step <= 72; step += 1) {
      const t = (step / 72) * Math.PI * 2;
      const radius = 1.16 + Math.sin(t * 2.0 + phase) * 0.2;
      curvePoints.push(
        new THREE.Vector3(
          Math.cos(t + phase) * radius,
          Math.sin(t * 2.0 + phase) * 0.52,
          Math.sin(t + phase) * radius * 0.64
        )
      );
    }
    const ribbonMaterial = new THREE.MeshPhysicalMaterial({
      color: orbitPalette[(index + 1) % orbitPalette.length],
      metalness: 0.85,
      roughness: 0.23,
      clearcoat: 0.92,
      transparent: true,
      opacity: 0,
      emissive: index % 2 === 0 ? 0x0b4f48 : 0x131b5c,
      emissiveIntensity: 0.22
    });
    ribbonMaterial.userData.baseOpacity = 0.17;
    materials.push(ribbonMaterial);
    const ribbonCurve = new THREE.CatmullRomCurve3(curvePoints, true, 'catmullrom', 0.5);
    const ribbon = new THREE.Mesh(new THREE.TubeGeometry(ribbonCurve, 180, 0.018, 8, true), ribbonMaterial);
    ribbon.rotation.set(index * 0.5, index * 0.78, -index * 0.26);
    ribbon.userData.offset = 2.8 + index * 0.6;
    ribbon.userData.baseRotation = ribbon.rotation.clone();
    orbitParts.push(ribbon);
    group.add(ribbon);
  }

  const cage = new THREE.Group();
  const cageMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x7accc5,
    metalness: 0.94,
    roughness: 0.28,
    clearcoat: 0.68,
    transparent: true,
    opacity: 0,
    emissive: 0x062d32,
    emissiveIntensity: 0.2
  });
  cageMaterial.userData.baseOpacity = 0.48;
  materials.push(cageMaterial);

  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * Math.PI * 2;
    const railPoints = [
      new THREE.Vector3(Math.cos(angle) * 1.58, -1.82, Math.sin(angle) * 1.06),
      new THREE.Vector3(Math.cos(angle + 0.14) * 1.88, -0.64, Math.sin(angle + 0.14) * 1.22),
      new THREE.Vector3(Math.cos(angle - 0.1) * 1.78, 0.62, Math.sin(angle - 0.1) * 1.16),
      new THREE.Vector3(Math.cos(angle) * 1.48, 1.82, Math.sin(angle) * 1.0)
    ];
    const railCurve = new THREE.CatmullRomCurve3(railPoints);
    const rail = new THREE.Mesh(new THREE.TubeGeometry(railCurve, 64, index % 2 === 0 ? 0.026 : 0.017, 8, false), cageMaterial);
    cage.add(rail);
  }

  const containmentMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x8cd7d1,
    metalness: 0.92,
    roughness: 0.22,
    clearcoat: 0.9,
    transparent: true,
    opacity: 0,
    emissive: 0x0a4245,
    emissiveIntensity: 0.2
  });
  containmentMaterial.userData.baseOpacity = 0.65;
  materials.push(containmentMaterial);

  for (const y of [-1.86, 1.86]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.058, 12, 160), containmentMaterial);
    ring.position.y = y;
    ring.rotation.x = Math.PI / 2;
    ring.scale.set(1, 0.8, 1);
    cage.add(ring);
  }

  const collarMaterial = containmentMaterial.clone();
  collarMaterial.userData.baseOpacity = 0.35;
  materials.push(collarMaterial);
  for (const y of [-1.56, 1.56]) {
    const collar = new THREE.Mesh(new THREE.TorusGeometry(1.74, 0.018, 8, 144), collarMaterial);
    collar.position.y = y;
    collar.rotation.x = Math.PI / 2;
    collar.scale.set(1, 0.8, 1);
    cage.add(collar);
  }

  const capMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x17383a,
    metalness: 0.92,
    roughness: 0.3,
    clearcoat: 0.55,
    transparent: true,
    opacity: 0,
    emissive: 0x072c2b,
    emissiveIntensity: 0.16
  });
  capMaterial.userData.baseOpacity = 0.58;
  materials.push(capMaterial);
  for (const y of [-2.04, 2.04]) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.5, 0.12, 48, 1, true), capMaterial);
    cap.position.y = y;
    cap.scale.z = 0.76;
    cage.add(cap);
  }
  group.add(cage);

  group.userData.materials = materials;
  group.userData.pointMaterials = pointMaterials;
  group.userData.shards = orbitParts;
  group.userData.core = core;
  group.userData.crystal = crystal;
  group.userData.cage = cage;
  group.visible = false;
  return group;
}

function randomSpherePoint(radius: number) {
  const phi = Math.acos(2 * Math.random() - 1);
  const theta = Math.random() * Math.PI * 2;
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createWireCube(size: number, color: number) {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const edges = new THREE.EdgesGeometry(geometry);
  geometry.dispose();
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.22
  });
  return new THREE.LineSegments(edges, material);
}

function createRings() {
  const group = new THREE.Group();
  const ringMaterial = new THREE.LineBasicMaterial({
    color: 0x75e8ff,
    transparent: true,
    opacity: 0.36,
    blending: THREE.AdditiveBlending
  });

  for (let i = 0; i < 5; i += 1) {
    const curve = new THREE.EllipseCurve(0, 0, 2.25 + i * 0.18, 0.55 + i * 0.08, 0, Math.PI * 2);
    const points = curve.getPoints(180);
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(p.x, p.y, 0)));
    const line = new THREE.Line(geometry, ringMaterial.clone());
    line.rotation.x = Math.PI / 2 + i * 0.16;
    line.rotation.y = i * 0.38;
    line.rotation.z = i * 0.52;
    group.add(line);
  }

  return group;
}

function createTerrain(isMobile: boolean) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: 0x1ebcff,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending
  });

  const rows = isMobile ? 24 : 38;
  const cols = isMobile ? 34 : 56;
  const width = 22;
  const depth = 8;

  for (let z = 0; z < rows; z += 1) {
    const points: THREE.Vector3[] = [];
    for (let x = 0; x < cols; x += 1) {
      const px = (x / (cols - 1) - 0.5) * width;
      const pz = (z / (rows - 1)) * depth;
      const py = Math.sin(x * 0.45) * 0.08 + Math.cos(z * 0.48) * 0.12 + Math.sin((x + z) * 0.18) * 0.16;
      points.push(new THREE.Vector3(px, py, -pz));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
  }

  for (let x = 0; x < cols; x += 2) {
    const points: THREE.Vector3[] = [];
    for (let z = 0; z < rows; z += 1) {
      const px = (x / (cols - 1) - 0.5) * width;
      const pz = (z / (rows - 1)) * depth;
      const py = Math.sin(x * 0.45) * 0.08 + Math.cos(z * 0.48) * 0.12 + Math.sin((x + z) * 0.18) * 0.16;
      points.push(new THREE.Vector3(px, py, -pz));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material.clone()));
  }

  group.rotation.x = -0.88;
  return group;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else {
      material?.dispose();
    }
  });
}
