// HorizonHeroSection.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

export const HorizonHeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });
  const cameraVelocity = useRef({ x: 0, y: 0, z: 0 });
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const totalSections = 2;
  
  const threeRefs = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    composer: EffectComposer | null;
    stars: THREE.Points[];
    nebula: THREE.Mesh | null;
    mountains: THREE.Mesh[];
    animationId: number | null;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    stars: [],
    nebula: null,
    mountains: [],
    animationId: null
  });

  // Get user location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
          // Use default location (e.g., New York)
          setUserLocation({ lat: 40.7128, lon: -74.0060 });
        }
      );
    } else {
      // Use default location
      setUserLocation({ lat: 40.7128, lon: -74.0060 });
    }
  };

  // Initialize Three.js
  useEffect(() => {
    const initThree = () => {
      const { current: refs } = threeRefs;
      
      // Scene setup
      refs.scene = new THREE.Scene();
      refs.scene.fog = new THREE.FogExp2(0x000000, 0.00025);

      // Camera
      refs.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
      );
      refs.camera.position.z = 100;
      refs.camera.position.y = 20;

      // Renderer
      if (canvasRef.current) {
        refs.renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: true
        });
        refs.renderer.setSize(window.innerWidth, window.innerHeight);
        refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        refs.renderer.toneMappingExposure = 0.5;

        // Post-processing
        refs.composer = new EffectComposer(refs.renderer);
        const renderPass = new RenderPass(refs.scene, refs.camera);
        refs.composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          0.8,
          0.4,
          0.85
        );
        refs.composer.addPass(bloomPass);

        // Create scene elements
        createStarField();
        createNebula();
        createMountains();
        createAtmosphere();
        getLocation();

        // Start animation
        animate();
        
        // Mark as ready after Three.js is initialized
        setIsReady(true);
      }
    };

    const createStarField = () => {
      const { current: refs } = threeRefs;
      if (!refs.scene) return;
      
      const starCount = 5000;
      
      for (let i = 0; i < 3; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let j = 0; j < starCount; j++) {
          const radius = 200 + Math.random() * 800;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);

          positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[j * 3 + 2] = radius * Math.cos(phi);

          // Color variation
          const color = new THREE.Color();
          const colorChoice = Math.random();
          if (colorChoice < 0.7) {
            color.setHSL(0, 0, 0.8 + Math.random() * 0.2);
          } else if (colorChoice < 0.9) {
            color.setHSL(0.08, 0.5, 0.8);
          } else {
            color.setHSL(0.6, 0.5, 0.8);
          }
          
          colors[j * 3] = color.r;
          colors[j * 3 + 1] = color.g;
          colors[j * 3 + 2] = color.b;

          sizes[j] = Math.random() * 2 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            depth: { value: i }
          },
          vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            uniform float depth;
            
            void main() {
              vColor = color;
              vec3 pos = position;
              
              // Slow rotation based on depth
              float angle = time * 0.05 * (1.0 - depth * 0.3);
              mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
              pos.xy = rot * pos.xy;
              
              vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = size * (300.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            varying vec3 vColor;
            
            void main() {
              float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
              float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
              
              gl_FragColor = vec4(vColor, alpha);
            }
          `,
          blending: THREE.AdditiveBlending,
          depthTest: false,
          transparent: true,
          vertexColors: true
        });

        const stars = new THREE.Points(geometry, material);
        refs.scene.add(stars);
        refs.stars.push(stars);
      }
    };

    const createNebula = () => {
      const { current: refs } = threeRefs;
      if (!refs.scene) return;
      
      const geometry = new THREE.PlaneGeometry(400, 400, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        },
        vertexShader: `
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec2 resolution;
          varying vec2 vUv;
          
          float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          }
          
          void main() {
            vec2 uv = vUv;
            float n = noise(uv * 10.0 + time * 0.1);
            
            vec3 color1 = vec3(0.1, 0.0, 0.3);
            vec3 color2 = vec3(0.3, 0.0, 0.6);
            vec3 color3 = vec3(0.0, 0.1, 0.4);
            
            vec3 finalColor = mix(color1, color2, n);
            finalColor = mix(finalColor, color3, noise(uv * 5.0 + time * 0.05));
            
            float alpha = 0.3 * n;
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
      });

      refs.nebula = new THREE.Mesh(geometry, material);
      refs.nebula.position.z = -200;
      refs.scene.add(refs.nebula);
    };

    const createMountains = () => {
      const { current: refs } = threeRefs;
      if (!refs.scene) return;
      
      for (let i = 0; i < 5; i++) {
        const geometry = new THREE.PlaneGeometry(200, 100, 32, 16);
        const positions = geometry.attributes.position;
        
        // Create mountain silhouette
        for (let j = 0; j < positions.count; j++) {
          const x = positions.getX(j);
          const y = positions.getY(j);
          const height = Math.sin(x * 0.02) * 20 + Math.sin(x * 0.05) * 10;
          positions.setY(j, y + height * (y + 50) / 100);
        }
        
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.6, 0.2, 0.1 - i * 0.02),
          transparent: true,
          opacity: 0.8 - i * 0.1
        });
        
        const mountain = new THREE.Mesh(geometry, material);
        mountain.position.z = -50 - i * 30;
        mountain.position.y = -30;
        refs.scene.add(mountain);
        refs.mountains.push(mountain);
      }
    };

    const createAtmosphere = () => {
      const { current: refs } = threeRefs;
      if (!refs.scene) return;
      
      const geometry = new THREE.SphereGeometry(500, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: `
          varying vec3 vPosition;
          
          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          varying vec3 vPosition;
          
          void main() {
            float intensity = pow(0.7 - dot(normalize(vPosition), vec3(0.0, 0.0, 1.0)), 2.0);
            vec3 atmosphere = vec3(0.3, 0.6, 1.0) * intensity;
            gl_FragColor = vec4(atmosphere, intensity * 0.3);
          }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
      });
      
      const atmosphere = new THREE.Mesh(geometry, material);
      refs.scene.add(atmosphere);
    };

    const animate = () => {
      const { current: refs } = threeRefs;
      if (!refs.scene || !refs.camera || !refs.composer) return;
      
      const time = Date.now() * 0.001;
      
      // Update star materials
      refs.stars.forEach((starField, index) => {
        const material = starField.material as THREE.ShaderMaterial;
        material.uniforms.time.value = time;
      });
      
      // Update nebula
      if (refs.nebula) {
        const material = refs.nebula.material as THREE.ShaderMaterial;
        material.uniforms.time.value = time;
      }
      
      // Smooth camera movement
      const dampingFactor = 0.05;
      smoothCameraPos.current.x += (cameraVelocity.current.x - smoothCameraPos.current.x) * dampingFactor;
      smoothCameraPos.current.y += (cameraVelocity.current.y - smoothCameraPos.current.y) * dampingFactor;
      smoothCameraPos.current.z += (cameraVelocity.current.z - smoothCameraPos.current.z) * dampingFactor;
      
      refs.camera.position.x = smoothCameraPos.current.x;
      refs.camera.position.y = smoothCameraPos.current.y;
      refs.camera.position.z = smoothCameraPos.current.z;
      
      refs.composer.render();
      refs.animationId = requestAnimationFrame(animate);
    };

    initThree();

    // Cleanup
    return () => {
      const { current: refs } = threeRefs;
      if (refs.animationId) {
        cancelAnimationFrame(refs.animationId);
      }
      if (refs.renderer) {
        refs.renderer.dispose();
      }
    };
  }, []);

  // Handle scroll animations
  useEffect(() => {
    if (!isReady) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTop / docHeight;
      setScrollProgress(progress);
      
      // Update camera based on scroll
      cameraVelocity.current.z = 100 - progress * 50;
      cameraVelocity.current.y = 20 + progress * 30;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isReady]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      cameraVelocity.current.x = x * 10;
      cameraVelocity.current.y += y * 5;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const { current: refs } = threeRefs;
      if (!refs.camera || !refs.renderer || !refs.composer) return;
      
      refs.camera.aspect = window.innerWidth / window.innerHeight;
      refs.camera.updateProjectionMatrix();
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      refs.composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
        <h1 
          ref={titleRef}
          className="text-6xl md:text-8xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
        >
          Horizon
        </h1>
        <p 
          ref={subtitleRef}
          className="text-xl md:text-2xl text-center max-w-2xl px-4 opacity-80"
        >
          Explore the infinite possibilities of the digital frontier
        </p>
        
        {userLocation && (
          <div className="mt-8 text-sm opacity-60">
            Viewing from: {userLocation.lat.toFixed(2)}, {userLocation.lon.toFixed(2)}
          </div>
        )}
      </div>
      
      {/* Navigation Menu */}
      <nav ref={menuRef} className="absolute top-8 left-8 right-8 flex justify-between items-center z-20">
        <div className="text-white font-bold text-xl tracking-wider">HORIZON</div>
        <div className="glass-effect rounded-full px-6 py-3 backdrop-blur-md border border-white/10">
          <div className="flex space-x-4">
            <Button variant="ghost" size="sm" className="text-white hover:text-accent-primary">
              Explore
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-accent-primary">
              About
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-accent-primary">
              Contact
            </Button>
          </div>
        </div>
      </nav>
      
      {/* Scroll Progress */}
      <div ref={scrollProgressRef} className="absolute bottom-8 right-8 z-20">
        <div className="glass-effect rounded-full p-3 backdrop-blur-md border border-white/10">
          <div className="w-1 h-20 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="w-full bg-gradient-primary transition-all duration-300 ease-out"
              style={{ height: `${scrollProgress * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Section Indicator */}
      <div className="absolute bottom-8 left-8 z-20">
        <div className="glass-effect rounded-full px-4 py-2 backdrop-blur-md border border-white/10">
          <div className="text-sm text-white/80 font-medium">
            Section {currentSection} of {totalSections}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizonHeroSection;