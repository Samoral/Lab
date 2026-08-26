import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SimState, SimOutput, ViewLevel } from '../../types';
import { SPECTRUM_EFFICIENCY, wavelengthToHex } from '../../utils/photosynthesisMath';
import { HOTSPOTS } from '../../data/labData';

interface CanvasProps {
  state: SimState;
  output: SimOutput;
  onSelectHotspot: (hotspotId: string) => void;
  onChangeView: (view: ViewLevel) => void;
}

export const PhotosynthesisCanvas: React.FC<CanvasProps> = ({
  state,
  output,
  onSelectHotspot,
  onChangeView
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Groups for different scenes
  const plantGroupRef = useRef<THREE.Group>(new THREE.Group());
  const leafGroupRef = useRef<THREE.Group>(new THREE.Group());
  const chloroplastGroupRef = useRef<THREE.Group>(new THREE.Group());

  // Dynamic mesh references
  const sunLightRef = useRef<THREE.SpotLight | null>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const guardCellLeftRef = useRef<THREE.Mesh | null>(null);
  const guardCellRightRef = useRef<THREE.Mesh | null>(null);
  const stomataPoreRef = useRef<THREE.Mesh | null>(null);
  const calvinCycleRingRef = useRef<THREE.Group | null>(null);

  // Particle systems
  const photonParticlesRef = useRef<THREE.Points | null>(null);
  const waterParticlesRef = useRef<THREE.Points | null>(null);
  const oxygenParticlesRef = useRef<THREE.Points | null>(null);
  const co2ParticlesRef = useRef<THREE.Points | null>(null);
  const glucoseParticlesRef = useRef<THREE.Points | null>(null);

  // Camera animation target
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 2.2, 5.5));
  const targetCamLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.8, 0));
  const currentCamLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.8, 0));

  // Mouse interaction for OrbitControls emulation
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const orbitAngles = useRef({ theta: 0, phi: Math.PI / 8, radius: 5.5 });

  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#061d16'); // Deep vibrant emerald atmosphere
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 5.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Clear previous canvases if any
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xdde8f8, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Dynamic Sun/Grow-lamp spotlight
    const sunSpot = new THREE.SpotLight(0xfffae0, 2.5, 20, Math.PI / 4, 0.35, 1.2);
    sunSpot.position.set(2.4, 4.2, 1.8);
    sunSpot.castShadow = true;
    scene.add(sunSpot);
    sunLightRef.current = sunSpot;

    // Sun glowing fixture mesh
    const sunGeo = new THREE.SphereGeometry(0.35, 24, 24);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xffe277,
      emissive: 0xffb703,
      emissiveIntensity: 1.5,
      roughness: 0.1
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.copy(sunSpot.position);
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;

    // Build the 3 sub-scenes
    buildPlantScene(plantGroupRef.current);
    buildLeafCrossSectionScene(leafGroupRef.current);
    buildChloroplastScene(chloroplastGroupRef.current);

    scene.add(plantGroupRef.current);
    scene.add(leafGroupRef.current);
    scene.add(chloroplastGroupRef.current);

    // Build Particle Systems
    buildParticles(scene);

    // Set initial view visibility
    updateSceneVisibility(state.viewLevel);

    // Animation Loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Smooth camera interpolation
      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.06);
        currentCamLook.current.lerp(targetCamLook.current, 0.06);
        cameraRef.current.lookAt(currentCamLook.current);
      }

      // Animate particles & dynamic structures
      animateParticles(delta, state, output);

      // Rotate Calvin Cycle ring in chloroplast
      if (calvinCycleRingRef.current && state.isPlaying) {
        calvinCycleRingRef.current.rotation.z -= delta * (output.rate / 100) * 1.5 * state.simSpeed;
      }

      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      reqIdRef.current = requestAnimationFrame(animate);
    };

    reqIdRef.current = requestAnimationFrame(animate);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && rendererRef.current && cameraRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update Scene elements whenever state or output changes
  useEffect(() => {
    updateSceneVisibility(state.viewLevel);

    // Update Sun Light and color
    const activeColorHex =
      state.lightSpectrum === 'custom'
        ? wavelengthToHex(state.wavelengthNm || 450)
        : SPECTRUM_EFFICIENCY[state.lightSpectrum]?.colorHex || '#FBBF24';

    if (sunLightRef.current && sunMeshRef.current) {
      const color = new THREE.Color(activeColorHex);
      const intensity = (state.lightIntensity / 100) * 3.5;
      sunLightRef.current.color = color;
      sunLightRef.current.intensity = intensity;

      const mat = sunMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.color = color;
      mat.emissive = color;
      mat.emissiveIntensity = intensity > 0.1 ? Math.min(2.5, intensity * 0.8) : 0.05;
    }

    // Update Stomata Guard Cells (open/close animation)
    const openRatio = output.stomataOpen / 100;
    if (guardCellLeftRef.current && guardCellRightRef.current && stomataPoreRef.current) {
      guardCellLeftRef.current.position.x = -0.3 - openRatio * 0.18;
      guardCellRightRef.current.position.x = 0.3 + openRatio * 0.18;
      guardCellLeftRef.current.scale.set(1 + openRatio * 0.25, 1 - openRatio * 0.1, 1);
      guardCellRightRef.current.scale.set(1 + openRatio * 0.25, 1 - openRatio * 0.1, 1);
      stomataPoreRef.current.scale.set(0.1 + openRatio * 1.2, 0.1 + openRatio * 1.4, 1);
    }
  }, [state, output]);

  // Set camera target & visibility according to viewLevel
  const updateSceneVisibility = (view: ViewLevel) => {
    plantGroupRef.current.visible = view === 'whole_plant';
    leafGroupRef.current.visible = view === 'leaf_cross_section';
    chloroplastGroupRef.current.visible = view === 'chloroplast_zoom';

    if (view === 'whole_plant') {
      targetCamPos.current.set(0, 1.8, 5.2);
      targetCamLook.current.set(0, 0.7, 0);
      orbitAngles.current = { theta: 0, phi: 0.2, radius: 5.2 };
    } else if (view === 'leaf_cross_section') {
      targetCamPos.current.set(0, 0.3, 4.4);
      targetCamLook.current.set(0, 0, 0);
      orbitAngles.current = { theta: 0, phi: 0.1, radius: 4.4 };
    } else if (view === 'chloroplast_zoom') {
      targetCamPos.current.set(0, 0.2, 4.2);
      targetCamLook.current.set(0, 0, 0);
      orbitAngles.current = { theta: 0, phi: 0.1, radius: 4.2 };
    }
  };

  // --- SCENE BUILDERS ---

  function buildPlantScene(group: THREE.Group) {
    // 1. Lab Table Surface
    const tableGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.15, 48);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.2,
      roughness: 0.7
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = -1.6;
    tableMesh.receiveShadow = true;
    group.add(tableMesh);

    // 2. Clear Glass Pot (revealing soil and roots)
    const potGeo = new THREE.CylinderGeometry(1.2, 0.9, 1.6, 32, 1, true);
    const potMat = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
      thickness: 0.3
    });
    const potMesh = new THREE.Mesh(potGeo, potMat);
    potMesh.position.y = -0.8;
    group.add(potMesh);

    // Pot base
    const baseGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.05, 32);
    const baseMesh = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
    baseMesh.position.y = -1.58;
    group.add(baseMesh);

    // Soil
    const soilGeo = new THREE.CylinderGeometry(1.15, 0.85, 1.5, 32);
    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x3b2512,
      roughness: 0.9,
      metalness: 0.05
    });
    const soilMesh = new THREE.Mesh(soilGeo, soilMat);
    soilMesh.position.y = -0.82;
    group.add(soilMesh);

    // Roots inside soil
    const rootMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
      const depth = -0.3 - Math.random() * 1.0;
      const radius = 0.2 + Math.random() * 0.6;
      const rootGeo = new THREE.CylinderGeometry(0.02, 0.04, 0.8, 8);
      const root = new THREE.Mesh(rootGeo, rootMat);
      root.position.set(Math.cos(angle) * radius * 0.6, depth, Math.sin(angle) * radius * 0.6);
      root.rotation.z = (Math.random() - 0.5) * 0.8;
      root.rotation.x = (Math.random() - 0.5) * 0.8;
      group.add(root);
    }

    // 3. Plant Stem
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.1, 0),
      new THREE.Vector3(0.04, 0.6, 0.02),
      new THREE.Vector3(-0.03, 1.3, -0.02),
      new THREE.Vector3(0, 2.0, 0)
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 32, 0.075, 16, false);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.castShadow = true;
    group.add(stemMesh);

    // 4. Foliage Leaves
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.bezierCurveTo(0.4, 0.2, 0.7, 0.6, 0.9, 1.2);
    leafShape.bezierCurveTo(0.6, 1.8, 0.2, 2.1, 0, 2.4);
    leafShape.bezierCurveTo(-0.2, 2.1, -0.6, 1.8, -0.9, 1.2);
    leafShape.bezierCurveTo(-0.7, 0.6, -0.4, 0.2, 0, 0);

    const leafGeo = new THREE.ShapeGeometry(leafShape, 16);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.35,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    const leafConfigs = [
      { pos: [0, 0.5, 0], rot: [0.35, 0.4, -0.9], scale: 0.55 },
      { pos: [0, 0.8, 0], rot: [-0.4, -1.8, 0.8], scale: 0.65 },
      { pos: [0, 1.2, 0], rot: [0.2, 2.2, -0.85], scale: 0.7 },
      { pos: [0, 1.5, 0], rot: [-0.3, -0.6, 0.85], scale: 0.65 },
      { pos: [0, 1.8, 0], rot: [0.1, 0.9, -0.7], scale: 0.55 },
      { pos: [0, 2.0, 0], rot: [0, 0, 0.3], scale: 0.45 }
    ];

    leafConfigs.forEach((cfg) => {
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      leafMesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      leafMesh.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
      leafMesh.scale.set(cfg.scale, cfg.scale, cfg.scale);
      leafMesh.castShadow = true;
      group.add(leafMesh);
    });

    // 5. Sun Lamp fixture stand
    const standMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 16), standMat);
    standBase.position.set(2.4, -1.55, 1.8);
    group.add(standBase);

    const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 5.7, 16), standMat);
    standPole.position.set(2.4, 1.3, 1.8);
    group.add(standPole);

    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.7, 24, 1, true), standMat);
    lampShade.position.set(2.4, 4.3, 1.8);
    lampShade.rotation.x = Math.PI / 6;
    lampShade.rotation.z = -Math.PI / 6;
    group.add(lampShade);
  }

  function buildLeafCrossSectionScene(group: THREE.Group) {
    // 3D Cutaway block of leaf tissue
    const blockWidth = 3.6;
    const blockDepth = 2.2;

    // Layer 1: Upper Cuticle & Epidermis (Top)
    const upperCuticleGeo = new THREE.BoxGeometry(blockWidth, 0.12, blockDepth);
    const upperCuticleMat = new THREE.MeshPhysicalMaterial({
      color: 0x86efac,
      transmission: 0.6,
      transparent: true,
      roughness: 0.1
    });
    const upperMesh = new THREE.Mesh(upperCuticleGeo, upperCuticleMat);
    upperMesh.position.y = 1.1;
    group.add(upperMesh);

    // Layer 2: Palisade Mesophyll (Tall vertically stacked cells)
    const palisadeGroup = new THREE.Group();
    const cellGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.85, 12);
    const cellMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.3 });
    const chloGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const chloMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x22c55e, emissiveIntensity: 0.4 });

    for (let x = -1.5; x <= 1.5; x += 0.32) {
      for (let z = -0.8; z <= 0.8; z += 0.32) {
        const cell = new THREE.Mesh(cellGeo, cellMat);
        cell.position.set(x + (Math.random() - 0.5) * 0.05, 0.55, z + (Math.random() - 0.5) * 0.05);
        palisadeGroup.add(cell);

        // Chloroplasts embedded in palisade cell wall
        for (let c = 0; c < 4; c++) {
          const chlo = new THREE.Mesh(chloGeo, chloMat);
          const angle = (c / 4) * Math.PI * 2;
          chlo.position.set(
            cell.position.x + Math.cos(angle) * 0.11,
            cell.position.y + (c - 1.5) * 0.18,
            cell.position.z + Math.sin(angle) * 0.11
          );
          palisadeGroup.add(chlo);
        }
      }
    }
    group.add(palisadeGroup);

    // Layer 3: Spongy Mesophyll (Loosely packed irregular cells with air pockets)
    const spongyGroup = new THREE.Group();
    const spongyCellGeo = new THREE.DodecahedronGeometry(0.18, 1);
    const spongyMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
    for (let x = -1.4; x <= 1.4; x += 0.48) {
      for (let z = -0.8; z <= 0.8; z += 0.48) {
        // Leave gaps for air diffusion
        if (Math.random() > 0.3) {
          const sCell = new THREE.Mesh(spongyCellGeo, spongyMat);
          sCell.position.set(x + (Math.random() - 0.5) * 0.12, -0.15 + (Math.random() - 0.5) * 0.15, z + (Math.random() - 0.5) * 0.12);
          spongyGroup.add(sCell);
        }
      }
    }
    group.add(spongyGroup);

    // Layer 4: Leaf Vein (Xylem & Phloem bundle)
    const veinGeo = new THREE.CylinderGeometry(0.24, 0.24, blockWidth * 0.85, 16);
    const xylemMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 }); // Blue water conduit
    const phloemMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 }); // Gold sugar conduit

    const xylem = new THREE.Mesh(veinGeo, xylemMat);
    xylem.rotation.z = Math.PI / 2;
    xylem.position.set(0, 0.05, -0.5);
    group.add(xylem);

    const phloem = new THREE.Mesh(veinGeo, phloemMat);
    phloem.rotation.z = Math.PI / 2;
    phloem.position.set(0, -0.2, -0.5);
    group.add(phloem);

    // Layer 5: Lower Epidermis & Guard Cells (Stoma)
    const lowerCuticleGeo = new THREE.BoxGeometry(blockWidth, 0.12, blockDepth);
    const lowerMesh = new THREE.Mesh(lowerCuticleGeo, upperCuticleMat);
    lowerMesh.position.y = -0.75;
    group.add(lowerMesh);

    // Active 3D Guard Cells & Stomatal Pore
    const guardGeo = new THREE.CapsuleGeometry(0.14, 0.45, 12, 16);
    const guardMat = new THREE.MeshStandardMaterial({
      color: 0x84cc16,
      roughness: 0.3,
      emissive: 0x4d7c0f,
      emissiveIntensity: 0.3
    });

    const guardLeft = new THREE.Mesh(guardGeo, guardMat);
    guardLeft.position.set(-0.35, -0.78, 0.3);
    guardLeft.rotation.z = 0.1;
    group.add(guardLeft);
    guardCellLeftRef.current = guardLeft;

    const guardRight = new THREE.Mesh(guardGeo, guardMat);
    guardRight.position.set(0.35, -0.78, 0.3);
    guardRight.rotation.z = -0.1;
    group.add(guardRight);
    guardCellRightRef.current = guardRight;

    // Stoma Pore hole indicator
    const poreGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16);
    const poreMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
    const poreMesh = new THREE.Mesh(poreGeo, poreMat);
    poreMesh.position.set(0, -0.78, 0.3);
    group.add(poreMesh);
    stomataPoreRef.current = poreMesh;
  }

  function buildChloroplastScene(group: THREE.Group) {
    // 3D Cutaway Chloroplast Organelle
    // Outer double membrane
    const chloroOuterGeo = new THREE.SphereGeometry(2.1, 32, 24, 0, Math.PI * 1.5, 0, Math.PI);
    const chloroOuterMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.4,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const chloroMesh = new THREE.Mesh(chloroOuterGeo, chloroOuterMat);
    chloroMesh.rotation.y = Math.PI / 4;
    group.add(chloroMesh);

    // Inner Stroma Fluid
    const stromaGeo = new THREE.SphereGeometry(1.95, 32, 24, 0, Math.PI * 1.5, 0, Math.PI);
    const stromaMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.6,
      opacity: 0.4,
      transparent: true,
      side: THREE.DoubleSide
    });
    const stromaMesh = new THREE.Mesh(stromaGeo, stromaMat);
    stromaMesh.rotation.y = Math.PI / 4;
    group.add(stromaMesh);

    // Thylakoid Stacks (Grana)
    const granumGroup = new THREE.Group();
    const thylakoidGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.06, 24);
    const thylakoidMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      emissive: 0x16a34a,
      emissiveIntensity: 0.5,
      roughness: 0.2
    });

    const granaPositions = [
      [-0.7, 0.2, 0.4],
      [0.6, 0.3, 0.2],
      [-0.2, -0.4, 0.6],
      [0.4, -0.5, -0.3],
      [-0.8, -0.3, -0.4]
    ];

    granaPositions.forEach((pos) => {
      const stackHeight = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < stackHeight; i++) {
        const disk = new THREE.Mesh(thylakoidGeo, thylakoidMat);
        disk.position.set(pos[0], pos[1] + i * 0.075, pos[2]);
        granumGroup.add(disk);
      }
    });

    // Connecting Stroma Lamellae bridges
    const bridgeGeo = new THREE.BoxGeometry(0.8, 0.02, 0.1);
    const bridge1 = new THREE.Mesh(bridgeGeo, thylakoidMat);
    bridge1.position.set(-0.05, 0.35, 0.3);
    bridge1.rotation.y = 0.3;
    granumGroup.add(bridge1);

    group.add(granumGroup);

    // Calvin Cycle Rotating Ring Representation
    const calvinGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(0.85, 0.035, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 0.7,
      roughness: 0.2
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    calvinGroup.add(ringMesh);

    // Molecules on the ring (CO2, ATP, NADPH, RuBP, Sugar)
    const molGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const colors = [0x38bdf8, 0xf97316, 0xa855f7, 0x22c55e];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const molMat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        emissive: colors[i % colors.length],
        emissiveIntensity: 0.6
      });
      const mol = new THREE.Mesh(molGeo, molMat);
      mol.position.set(Math.cos(angle) * 0.85, Math.sin(angle) * 0.85, 0);
      calvinGroup.add(mol);
    }

    calvinGroup.position.set(-0.6, -0.4, 0.1);
    calvinGroup.rotation.x = Math.PI / 4;
    group.add(calvinGroup);
    calvinCycleRingRef.current = calvinGroup;
  }

  // --- PARTICLE SYSTEMS ---

  function buildParticles(scene: THREE.Scene) {
    // 1. Photons (Light Stream)
    const photonCount = 180;
    const photonGeo = new THREE.BufferGeometry();
    const photonPositions = new Float32Array(photonCount * 3);
    for (let i = 0; i < photonCount; i++) {
      photonPositions[i * 3] = 2.4 + (Math.random() - 0.5) * 1.5;
      photonPositions[i * 3 + 1] = 4.2 - Math.random() * 3.5;
      photonPositions[i * 3 + 2] = 1.8 + (Math.random() - 0.5) * 1.5;
    }
    photonGeo.setAttribute('position', new THREE.BufferAttribute(photonPositions, 3));
    const photonMat = new THREE.PointsMaterial({
      color: 0xffe277,
      size: 0.08,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const photons = new THREE.Points(photonGeo, photonMat);
    scene.add(photons);
    photonParticlesRef.current = photons;

    // 2. Water (H2O) flowing up stem & into leaves
    const waterCount = 120;
    const waterGeo = new THREE.BufferGeometry();
    const waterPositions = new Float32Array(waterCount * 3);
    for (let i = 0; i < waterCount; i++) {
      waterPositions[i * 3] = (Math.random() - 0.5) * 0.3;
      waterPositions[i * 3 + 1] = -1.2 + Math.random() * 3.0;
      waterPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    waterGeo.setAttribute('position', new THREE.BufferAttribute(waterPositions, 3));
    const waterMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.07,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const waters = new THREE.Points(waterGeo, waterMat);
    scene.add(waters);
    waterParticlesRef.current = waters;

    // 3. Oxygen (O2) bubbles rising from leaves
    const oxygenCount = 140;
    const oxygenGeo = new THREE.BufferGeometry();
    const oxygenPositions = new Float32Array(oxygenCount * 3);
    for (let i = 0; i < oxygenCount; i++) {
      oxygenPositions[i * 3] = (Math.random() - 0.5) * 1.8;
      oxygenPositions[i * 3 + 1] = 0.5 + Math.random() * 2.5;
      oxygenPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
    }
    oxygenGeo.setAttribute('position', new THREE.BufferAttribute(oxygenPositions, 3));
    const oxygenMat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.09,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const oxygens = new THREE.Points(oxygenGeo, oxygenMat);
    scene.add(oxygens);
    oxygenParticlesRef.current = oxygens;

    // 4. Carbon Dioxide (CO2) particles in air
    const co2Count = 100;
    const co2Geo = new THREE.BufferGeometry();
    const co2Positions = new Float32Array(co2Count * 3);
    for (let i = 0; i < co2Count; i++) {
      co2Positions[i * 3] = (Math.random() - 0.5) * 3.2;
      co2Positions[i * 3 + 1] = 0.2 + Math.random() * 2.8;
      co2Positions[i * 3 + 2] = (Math.random() - 0.5) * 3.2;
    }
    co2Geo.setAttribute('position', new THREE.BufferAttribute(co2Positions, 3));
    const co2Mat = new THREE.PointsMaterial({
      color: 0xc084fc,
      size: 0.07,
      transparent: true,
      opacity: 0.75
    });
    const co2s = new THREE.Points(co2Geo, co2Mat);
    scene.add(co2s);
    co2ParticlesRef.current = co2s;

    // 5. Glucose ($C6H12O6$) energy particles synthesized
    const glucCount = 70;
    const glucGeo = new THREE.BufferGeometry();
    const glucPositions = new Float32Array(glucCount * 3);
    for (let i = 0; i < glucCount; i++) {
      glucPositions[i * 3] = (Math.random() - 0.5) * 0.8;
      glucPositions[i * 3 + 1] = 0.8 - Math.random() * 1.6;
      glucPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    glucGeo.setAttribute('position', new THREE.BufferAttribute(glucPositions, 3));
    const glucMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.1,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const glucs = new THREE.Points(glucGeo, glucMat);
    scene.add(glucs);
    glucoseParticlesRef.current = glucs;
  }

  function animateParticles(delta: number, sim: SimState, simOut: SimOutput) {
    if (!sim.showParticles) {
      if (photonParticlesRef.current) photonParticlesRef.current.visible = false;
      if (waterParticlesRef.current) waterParticlesRef.current.visible = false;
      if (oxygenParticlesRef.current) oxygenParticlesRef.current.visible = false;
      if (co2ParticlesRef.current) co2ParticlesRef.current.visible = false;
      if (glucoseParticlesRef.current) glucoseParticlesRef.current.visible = false;
      return;
    }

    const isRunning = sim.isPlaying;
    const speedMult = sim.simSpeed * (isRunning ? 1 : 0.05);

    // 1. Photons streaming down towards leaf canopy
    if (photonParticlesRef.current) {
      photonParticlesRef.current.visible = sim.lightIntensity > 0 && sim.lightSpectrum !== 'dark';
      const photonHex =
        sim.lightSpectrum === 'custom'
          ? wavelengthToHex(sim.wavelengthNm || 450)
          : SPECTRUM_EFFICIENCY[sim.lightSpectrum]?.colorHex || '#FBBF24';
      (photonParticlesRef.current.material as THREE.PointsMaterial).color.set(photonHex);

      const positions = photonParticlesRef.current.geometry.attributes.position.array as Float32Array;
      const rateFactor = (sim.lightIntensity / 100) * speedMult * 2.2;
      for (let i = 0; i < positions.length / 3; i++) {
        // Move towards plant center [0, 1.2, 0]
        positions[i * 3] -= (positions[i * 3] - 0) * delta * rateFactor;
        positions[i * 3 + 1] -= (positions[i * 3 + 1] - 1.2) * delta * rateFactor;
        positions[i * 3 + 2] -= (positions[i * 3 + 2] - 0) * delta * rateFactor;

        // Reset if near canopy
        if (Math.abs(positions[i * 3 + 1] - 1.2) < 0.15) {
          positions[i * 3] = 2.4 + (Math.random() - 0.5) * 1.2;
          positions[i * 3 + 1] = 4.2;
          positions[i * 3 + 2] = 1.8 + (Math.random() - 0.5) * 1.2;
        }
      }
      photonParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Water particles climbing up roots and xylem
    if (waterParticlesRef.current) {
      waterParticlesRef.current.visible = sim.waterLevel > 5;
      const positions = waterParticlesRef.current.geometry.attributes.position.array as Float32Array;
      const waterSpeed = (sim.waterLevel / 100) * speedMult * 0.9;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += delta * waterSpeed;
        if (positions[i * 3 + 1] > 2.1) {
          positions[i * 3 + 1] = -1.4;
          positions[i * 3] = (Math.random() - 0.5) * 0.4;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
        }
      }
      waterParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Oxygen bubbles radiating outward
    if (oxygenParticlesRef.current) {
      const hasO2 = simOut.rate > 2;
      oxygenParticlesRef.current.visible = hasO2;
      const positions = oxygenParticlesRef.current.geometry.attributes.position.array as Float32Array;
      const o2Speed = (simOut.rate / 100) * speedMult * 1.2;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += delta * o2Speed;
        positions[i * 3] += (Math.random() - 0.5) * delta * 0.4;
        positions[i * 3 + 2] += (Math.random() - 0.5) * delta * 0.4;
        if (positions[i * 3 + 1] > 3.4) {
          positions[i * 3 + 1] = 0.6 + Math.random() * 0.8;
          positions[i * 3] = (Math.random() - 0.5) * 1.2;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
        }
      }
      oxygenParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 4. CO2 gas particles diffusing in
    if (co2ParticlesRef.current) {
      co2ParticlesRef.current.visible = sim.co2Level > 50;
      const positions = co2ParticlesRef.current.geometry.attributes.position.array as Float32Array;
      const co2Speed = (sim.co2Level / 1200) * speedMult * 0.6;
      for (let i = 0; i < positions.length / 3; i++) {
        // Drift gently towards the leaf canopy center
        positions[i * 3] -= positions[i * 3] * delta * co2Speed * 0.4;
        positions[i * 3 + 2] -= positions[i * 3 + 2] * delta * co2Speed * 0.4;
        if (Math.abs(positions[i * 3]) < 0.2 && Math.abs(positions[i * 3 + 2]) < 0.2) {
          positions[i * 3] = (Math.random() - 0.5) * 3.0;
          positions[i * 3 + 1] = 0.4 + Math.random() * 2.2;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 3.0;
        }
      }
      co2ParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Glucose energy particles
    if (glucoseParticlesRef.current) {
      glucoseParticlesRef.current.visible = simOut.rate > 10;
      const positions = glucoseParticlesRef.current.geometry.attributes.position.array as Float32Array;
      const glucSpeed = (simOut.rate / 100) * speedMult * 0.7;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] -= delta * glucSpeed; // Sugar travels down phloem to roots/fruits
        if (positions[i * 3 + 1] < -1.2) {
          positions[i * 3 + 1] = 1.6;
          positions[i * 3] = (Math.random() - 0.5) * 0.6;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
        }
      }
      glucoseParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  }

  // --- MOUSE & TOUCH ORBIT CONTROLS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !cameraRef.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };

    orbitAngles.current.theta -= deltaX * 0.008;
    orbitAngles.current.phi = Math.max(-Math.PI / 4, Math.min(Math.PI / 2.2, orbitAngles.current.phi + deltaY * 0.008));

    updateCameraOrbit();
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    orbitAngles.current.radius = Math.max(2.0, Math.min(8.5, orbitAngles.current.radius + e.deltaY * 0.004));
    updateCameraOrbit();
  };

  const updateCameraOrbit = () => {
    const { theta, phi, radius } = orbitAngles.current;
    const x = radius * Math.cos(phi) * Math.sin(theta);
    const y = targetCamLook.current.y + radius * Math.sin(phi);
    const z = radius * Math.cos(phi) * Math.cos(theta);
    targetCamPos.current.set(x, y, z);
  };

  // Get active view hotspots
  const activeHotspots = Object.values(HOTSPOTS).filter((h) => h.view === state.viewLevel);

  return (
    <div
      id="photosynthesis_3d_viewport"
      ref={containerRef}
      className="relative w-full h-full min-h-[460px] bg-slate-950 select-none overflow-hidden cursor-grab active:cursor-grabbing rounded-2xl border border-slate-800 shadow-2xl"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Viewport Overlay Controls & Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-sm flex items-center gap-2 text-xs font-bold text-emerald-950">
          <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-emerald-500" />
          <span>3D Lab Interactive Canvas</span>
        </div>

        {/* View Switcher Pills */}
        <div className="bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-emerald-200 shadow-sm flex items-center gap-1">
          <button
            id="view_whole_plant_btn"
            onClick={(e) => {
              e.stopPropagation();
              onChangeView('whole_plant');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
              state.viewLevel === 'whole_plant'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950'
            }`}
          >
            🌱 Plant Macro
          </button>
          <button
            id="view_leaf_cross_btn"
            onClick={(e) => {
              e.stopPropagation();
              onChangeView('leaf_cross_section');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
              state.viewLevel === 'leaf_cross_section'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950'
            }`}
          >
            🍃 Leaf Micro
          </button>
          <button
            id="view_chloroplast_btn"
            onClick={(e) => {
              e.stopPropagation();
              onChangeView('chloroplast_zoom');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
              state.viewLevel === 'chloroplast_zoom'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950'
            }`}
          >
            🔬 Chloroplast
          </button>
        </div>
      </div>

      {/* Floating Hotspots Overlay on 3D View */}
      {state.showLabels && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-center gap-2 pointer-events-auto">
            <span className="text-[11px] font-bold tracking-wider text-emerald-800 bg-white/90 px-3 py-1 rounded-full border border-emerald-200 shadow-xs">
              CLICK STRUCTURE TO INSPECT:
            </span>
            {activeHotspots.map((h) => (
              <button
                key={h.id}
                id={`hotspot_chip_${h.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHotspot(h.id);
                }}
                onMouseEnter={() => setHoveredHotspot(h.id)}
                onMouseLeave={() => setHoveredHotspot(null)}
                className="group px-3.5 py-1 rounded-full text-xs font-bold bg-white/95 hover:bg-emerald-500 border border-emerald-200 hover:border-emerald-500 text-emerald-950 hover:text-white backdrop-blur-md shadow-xs transition-all flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:bg-white animate-ping" />
                <span>{h.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Legend & Particle Flow Indicators */}
      <div className="absolute top-4 right-4 z-10 pointer-events-auto bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-emerald-100 shadow-md max-w-[210px] text-xs text-emerald-950 space-y-1.5">
        <div className="font-bold text-emerald-950 flex items-center justify-between border-b border-emerald-100 pb-1.5">
          <span>Active Particle Flows</span>
          <span className="text-[10px] text-emerald-700 font-mono font-bold">
            {output.rate}% SPEED
          </span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
          <span>Photons (Light)</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm" />
          <span>H₂O Water Flow</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm" />
          <span>CO₂ Diffusion</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm animate-pulse" />
          <span>O₂ Bubbles Release</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm" />
          <span>Glucose (C₆H₁₂O₆)</span>
        </div>
      </div>

      {/* Interactive Helper Hint */}
      <div className="absolute bottom-4 left-4 z-0 text-[11px] text-emerald-300/80 font-mono select-none pointer-events-none hidden sm:block">
        🖱️ Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};
