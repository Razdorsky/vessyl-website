'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { asset } from '../../lib/paths';
import { containedChapter, type Chapter } from '../../lib/journeys';
import { journeyPosition } from '../../lib/journey-position';

// One continuous world and camera rail. Scrolling changes the camera's actual 3D position.
export default function ScrollWorld({
  chapters,
  paused,
  onReady,
  onFailure,
}: {
  chapters: Chapter[];
  paused: boolean;
  onReady: () => void;
  onFailure: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(paused);
  useEffect(() => {
    pauseRef.current = paused;
    host.current?.dispatchEvent(new Event('world-wake'));
  }, [paused]);
  useEffect(() => {
    if (!host.current) return;
    const el: HTMLDivElement = host.current;
    let dead = false,
      frame = 0,
      last = 0,
      time = 0,
      target = 0,
      progress = 0,
      px = 0,
      py = 0,
      visible = true,
      renderedFrames = 0;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      onFailure();
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0x111111, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x111111, 0.009);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 190);
    const light = new THREE.HemisphereLight(0xf5ebe7, 0x1a3013, 1.8);
    scene.add(light);
    const sun = new THREE.DirectionalLight(0xf5ebe7, 4);
    sun.position.set(-5, 12, 8);
    scene.add(sun);
    const copper = new THREE.MeshStandardMaterial({
      color: 0xd3a079,
      metalness: 0.72,
      roughness: 0.3,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x364830,
      metalness: 0.35,
      roughness: 0.38,
    });
    const glow = new THREE.MeshBasicMaterial({
      color: 0xd3a079,
      transparent: true,
      opacity: 0.5,
    });
    const loader = new THREE.TextureLoader();
    const textures: THREE.Texture[] = [];
    const groups: THREE.Group[] = [];
    const architecture: {
      material: THREE.Material;
      opacity: number;
      chapter: number;
    }[] = [];
    const photographs: {
      mesh: THREE.Mesh;
      material: THREE.MeshBasicMaterial;
      ratio: number;
      portrait: boolean;
      chapter: number;
    }[] = [];
    const waterMaterials: THREE.ShaderMaterial[] = [];
    const loading: Promise<void>[] = [];
    function tube(
      points: THREE.Vector3[],
      radius = 0.03,
      material: THREE.Material = copper,
    ) {
      return new THREE.Mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(points),
          64,
          radius,
          6,
          false,
        ),
        material,
      );
    }
    function texturePlane(
      image: string,
      w: number,
      h: number,
      x: number,
      y: number,
      z: number,
      parent: THREE.Group,
      portrait = false,
      chapter = 0,
      curved = false,
    ) {
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false,
        fog: false,
      });
      if (portrait) {
        material.onBeforeCompile = (shader) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <clipping_planes_fragment>',
            `#include <clipping_planes_fragment>
          #ifdef USE_MAP
          vec2 corner = max(abs(vMapUv - 0.5) - vec2(0.485), 0.0);
          if (length(corner) > 0.015) discard;
          #endif`,
          );
        };
      } else {
        // Blend the edge of a projected landscape into the surrounding world.
        material.onBeforeCompile = (shader) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            `#include <map_fragment>
          #ifdef USE_MAP
          float lowerEdge = smoothstep(0.0, 0.075, vMapUv.y);
          float sideEdge = smoothstep(0.0, 0.045, vMapUv.x)
            * (1.0 - smoothstep(0.955, 1.0, vMapUv.x));
          diffuseColor.a *= lowerEdge * sideEdge;
          #endif`,
          );
        };
      }
      const geometry = curved
        ? new THREE.CylinderGeometry(
            22,
            22,
            30,
            80,
            1,
            true,
            Math.PI / 2,
            Math.PI,
          )
        : new THREE.PlaneGeometry(w, h);
      if (curved) geometry.scale(-1, 1, 1);
      const mesh = new THREE.Mesh(geometry, material);
      if (portrait) {
        // Keep the photographic subject clear of foreground ribs and trunks.
        material.depthTest = false;
        mesh.renderOrder = 10;
      }
      mesh.position.set(x, curved ? 7 : y, curved ? -6 : z);
      parent.add(mesh);
      const item = { mesh, material, ratio: w / h, portrait, chapter };
      photographs.push(item);
      loading.push(
        new Promise((resolve) => {
          loader.load(
            asset('/images/' + image + '.webp'),
            (t) => {
              if (dead) {
                t.dispose();
                resolve();
                return;
              }
              t.colorSpace = THREE.SRGBColorSpace;
              t.anisotropy = Math.min(
                renderer.capabilities.getMaxAnisotropy(),
                4,
              );
              material.map = t;
              material.needsUpdate = true;
              item.ratio = t.image.width / t.image.height;
              // Preserve source proportions even on curved projection surfaces.
              if (!portrait)
                mesh.scale.y = curved
                  ? (Math.PI * 22) / item.ratio / 30
                  : w / item.ratio / h;
              textures.push(t);
              resolve();
            },
            undefined,
            () => {
              if (!dead) onFailure();
              resolve();
            },
          );
        }),
      );
    }
    chapters.forEach((ch, i) => {
      const world = new THREE.Group();
      world.position.z = -i * 34;
      groups.push(world);
      scene.add(world);
      const contained = containedChapter(ch);
      if (contained) {
        texturePlane(ch.image, 10, 8, 6, 3, -9, world, true, i);
      } else {
        texturePlane(
          ch.image,
          60,
          36,
          0,
          8,
          -24,
          world,
          false,
          i,
          ch.world === 'dome' || ch.world === 'hearth',
        );
      }
      // Monumental architectural ribs surround the visitor, rather than a floating object in a card.
      if (['arrival', 'dome'].includes(ch.world)) {
        const count = 3;
        for (let j = 0; j < count; j++) {
          const points = [];
          const radius = ch.world === 'dome' ? 11 : 13;
          for (let n = 0; n <= 48; n++) {
            const a = (Math.PI * n) / 48;
            points.push(
              new THREE.Vector3(
                Math.cos(a) * radius,
                Math.sin(a) * radius - 2,
                -j * 8 + 4,
              ),
            );
          }
          world.add(
            tube(
              points,
              ch.world === 'dome' ? 0.14 : 0.09,
              j % 3 === 0 ? glow : copper,
            ),
          );
        }
      }
      if (ch.world === 'forest') {
        // Tall trunks and sculpted canopy planes create a passage around the real landscape.
        for (let j = 0; j < 18; j++) {
          const side = j % 2 === 0 ? 1 : -1;
          const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.18, 17, 6),
            dark,
          );
          trunk.position.set(side * (6.5 + (j % 4) * 1.2), 5, -(j / 2) * 3);
          trunk.rotation.z = side * 0.06;
          world.add(trunk);
          const branch = tube(
            [
              new THREE.Vector3(side * 8, 8, -j * 1.5),
              new THREE.Vector3(side * 5, 11, -j * 1.5 - 2),
              new THREE.Vector3(side * 1, 13, -j * 1.5 - 3),
            ],
            0.06,
            dark,
          );
          world.add(branch);
        }
      }
      const water = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uWarm: { value: ch.world === 'hearth' ? 1 : 0 },
          uOpacity: { value: 0.42 },
        },
        vertexShader: `varying vec2 vUv; uniform float uTime; void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*.55+uTime*.3)*.08+sin(p.y*.7+uTime*.23)*.1;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
        fragmentShader: `varying vec2 vUv;uniform float uTime;uniform float uWarm;uniform float uOpacity;void main(){float r=length((vUv-.5)*vec2(1.,1.5));float wave=pow(.5+.5*sin(r*95.-uTime*.65),14.);float gleam=pow(max(0.,1.-abs(vUv.x-.5)*3.),4.);vec3 c=mix(vec3(.1,.17,.1),vec3(.48,.2,.055),uWarm);c+=vec3(.83,.62,.47)*wave*.24*gleam;float edge=smoothstep(0.,.15,vUv.y)*(1.-smoothstep(.7,1.,vUv.y));gl_FragColor=vec4(c,uOpacity*edge);}`,
      });
      waterMaterials.push(water);
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(44, 55, 50, 60),
        water,
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(0, -2, -9);
      world.add(floor);
      if (ch.world === 'hearth') {
        // Recessed light traces belong to the floor, leaving the real hearth unobstructed.
        const floorLight = new THREE.MeshBasicMaterial({
          color: 0xd3a079,
          transparent: true,
          opacity: 0.3,
          depthWrite: false,
        });
        for (let j = 0; j < 3; j++) {
          const trace = new THREE.Mesh(
            new THREE.TorusGeometry(8 + j * 1.4, 0.018, 4, 100),
            floorLight,
          );
          trace.rotation.x = Math.PI / 2;
          trace.position.set(0, -1.95, -10);
          world.add(trace);
        }
        const hearth = new THREE.PointLight(0xd57e3d, 50, 28, 2);
        hearth.position.set(0, 0, -10);
        world.add(hearth);
      }
      // Keep distant architecture from appearing through a preceding portrait chapter.
      const structuralMaterials = new Map<THREE.Material, THREE.Material>();
      world.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const original = object.material;
        if (
          Array.isArray(original) ||
          original instanceof THREE.ShaderMaterial ||
          photographs.some((p) => p.mesh === object)
        )
          return;
        const material: THREE.Material =
          structuralMaterials.get(original) ?? original.clone();
        if (!structuralMaterials.has(original)) {
          material.transparent = true;
          structuralMaterials.set(original, material);
          architecture.push({
            material,
            opacity: original.opacity,
            chapter: i,
          });
        }
        object.material = material;
      });
    });
    const currentPosition = new THREE.Vector3();
    const look = new THREE.Vector3();
    const chapterCopies = Array.from(
      document.querySelectorAll<HTMLElement>('.journey-copy'),
    );
    function measure() {
      const track = document.querySelector<HTMLElement>('.journey-track');
      if (!track) return;
      const { bounds: r, progress: position } = journeyPosition(track);
      target = THREE.MathUtils.clamp(position, 0, chapters.length - 1);
      visible = r.bottom > 0 && r.top < innerHeight;
    }
    function resize() {
      const w = el.clientWidth,
        h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      measure();
      wake();
    }
    function draw(now: number) {
      frame = 0;
      if (dead || !visible) return;
      const dt = Math.min((now - last) / 1000, 0.05) || 0.016;
      last = now;
      const moving = !pauseRef.current;
      progress = moving
        ? THREE.MathUtils.damp(progress, target, 8.5, dt)
        : Math.round(target);
      if (moving) time += dt;
      const mobile = camera.aspect < 0.9;
      const rail = moving ? progress : Math.round(progress);
      currentPosition.set(
        moving ? Math.sin(progress * 0.8) * 0.9 + px * 0.28 : 0,
        2.3 + (moving ? Math.sin(progress * 1.4) * 0.45 + py * 0.12 : 0),
        12 - rail * 34,
      );
      camera.position.copy(currentPosition);
      look.set(currentPosition.x * 0.35, 1.7, -12 - rail * 34);
      camera.lookAt(look);
      for (let i = 0; i < groups.length; i++)
        groups[i].visible = Math.abs(i - progress) < 1.55;
      architecture.forEach((item) => {
        const local = progress - item.chapter;
        const fade =
          local >= 0
            ? 1 - THREE.MathUtils.smoothstep(local, 0.45, 0.9)
            : THREE.MathUtils.smoothstep(local, -0.75, -0.25);
        item.material.opacity = item.opacity * fade;
        item.material.visible = fade > 0.005;
        item.material.depthWrite = fade > 0.98;
      });
      photographs.forEach((item) => {
        const local = progress - item.chapter;
        const opacity =
          local >= 0
            ? 1 - THREE.MathUtils.smoothstep(local, 0.48, 0.84)
            : THREE.MathUtils.smoothstep(local, -0.52, -0.16);
        item.material.opacity = item.material.map ? opacity : 0;
        if (item.portrait) {
          const depth = 22;
          const viewH =
            2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * depth;
          const maxW = mobile
            ? viewH * camera.aspect * 0.83
            : viewH * camera.aspect * 0.43;
          // Fit mobile photographs below the actual copy, including long biographies.
          const copyBottom = mobile
            ? (chapterCopies[item.chapter]?.getBoundingClientRect().bottom ?? 0)
            : 0;
          const available = mobile
            ? Math.max(
                0,
                innerHeight -
                  Math.max(copyBottom + 30, innerHeight * 0.42) -
                  98,
              )
            : innerHeight;
          const maxH = mobile
            ? viewH * Math.min(0.42, available / innerHeight)
            : viewH * 0.69;
          const w = Math.min(maxW, maxH * item.ratio),
            h = w / item.ratio;
          item.mesh.scale.set(w / 10, h / 8, 1);
          const retreat =
            local >= 0
              ? THREE.MathUtils.smoothstep(local, 0.35, 1) * 12
              : Math.abs(local) * 9;
          item.mesh.position.set(
            mobile ? 0 : viewH * camera.aspect * 0.255,
            mobile
              ? currentPosition.y +
                  ((look.y - currentPosition.y) * depth) / 24 +
                  (0.5 -
                    (innerHeight - 98 - ((h / viewH) * innerHeight) / 2) /
                      innerHeight) *
                    viewH
              : 2.9,
            12 - depth - local * 34 - retreat,
          );
          item.mesh.rotation.y = moving ? -0.045 + local * 0.13 : 0;
          if (mobile)
            item.material.opacity *= THREE.MathUtils.smoothstep(
              available,
              80,
              150,
            );
        }
      });
      waterMaterials.forEach((m, i) => {
        m.uniforms.uTime.value = time;
        m.uniforms.uOpacity.value =
          chapters[i].world === 'gallery' || chapters[i].world === 'portrait'
            ? 0.12
            : 0.48;
      });
      const active = Math.min(
        chapters.length - 1,
        Math.max(0, Math.round(progress)),
      );
      el.dataset.chapter = String(active);
      el.dataset.cameraZ = camera.position.z.toFixed(2);
      el.dataset.scrollProgress = progress.toFixed(3);
      renderer.render(scene, camera);
      el.dataset.renderedFrames = String(++renderedFrames);
      if (visible && !document.hidden && moving)
        frame = requestAnimationFrame(draw);
    }
    function wake() {
      if (!dead && !frame && !document.hidden && visible)
        frame = requestAnimationFrame(draw);
    }
    const scroll = () => {
      measure();
      wake();
    };
    const pointer = (e: PointerEvent) => {
      if (!visible) return;
      px = e.clientX / innerWidth - 0.5;
      py = e.clientY / innerHeight - 0.5;
      wake();
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else wake();
    };
    const contextLost = (e: Event) => {
      e.preventDefault();
      onFailure();
    };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('pointermove', pointer, { passive: true });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibility);
    el.addEventListener('world-wake', wake);
    const sizeObs = new ResizeObserver(resize);
    sizeObs.observe(el);
    resize();
    void loading[0]?.then(() => {
      if (!dead) {
        onReady();
        wake();
      }
    });
    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      sizeObs.disconnect();
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('pointermove', pointer);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility);
      el.removeEventListener('world-wake', wake);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      textures.forEach((t) => t.dispose());
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          geometries.add(o.geometry);
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            materials.add(m),
          );
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      copper.dispose();
      dark.dispose();
      glow.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [chapters, onReady, onFailure]);
  return <div className="scroll-world" ref={host} aria-hidden="true" />;
}
