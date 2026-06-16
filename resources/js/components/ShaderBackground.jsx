import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const ShaderPlane = () => {
    const materialRef = useRef();
    const { size, viewport } = useThree();

    // Generate random values once per mount
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uAspect: { value: 1.0 },
        uColorBg: { value: new THREE.Color('#1d1d1d') }, // Very dark, almost black
        uColorWave: { value: new THREE.Color('#676767') }, // Cool blue wave
        uOffset1: { value: new THREE.Vector2(Math.random() * 100, Math.random() * 100) },
        uOffset2: { value: new THREE.Vector2(Math.random() * 100, Math.random() * 100) },
        uFreq1: { value: new THREE.Vector2(1.0 + Math.random() * 3.0, 1.0 + Math.random() * 3.0) },
        uFreq2: { value: new THREE.Vector2(1.0 + Math.random() * 3.0, 0.5 + Math.random() * 2.0) },
        uSpeed: { value: new THREE.Vector2(0.2 + Math.random() * 0.4, 0.2 + Math.random() * 0.4) }
    }), []);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
            materialRef.current.uniforms.uAspect.value = size.width / size.height;
        }
    });

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float uTime;
        uniform float uAspect;
        uniform vec3 uColorBg;
        uniform vec3 uColorWave;
        uniform vec2 uOffset1;
        uniform vec2 uOffset2;
        uniform vec2 uFreq1;
        uniform vec2 uFreq2;
        uniform vec2 uSpeed;
        
        varying vec2 vUv;

        // 4x4 Bayer Matrix for dithering
        const float bayerMatrix[16] = float[](
            0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
            12.0/16.0, 4.0/16.0, 14.0/16.0,  6.0/16.0,
            3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
            15.0/16.0, 7.0/16.0, 13.0/16.0,  5.0/16.0
        );

        void main() {
            // Adjust UV for aspect ratio to ensure square pixels
            vec2 uv = vec2(vUv.x * uAspect, vUv.y);
            
            // Pixelation scale (how many blocks vertically)
            float ditherScale = 200.0;
            
            // Quantize coordinates to create sharp retro pixels
            vec2 fragCoord = floor(uv * ditherScale);
            vec2 pixelUv = fragCoord / ditherScale;

            // Create a very smooth, slow, wide wave with completely randomized parameters
            float wave = sin(pixelUv.x * uFreq1.x + pixelUv.y * uFreq1.y + uTime * uSpeed.x + uOffset1.x);
            wave += cos(pixelUv.x * uFreq2.x - pixelUv.y * uFreq2.y - uTime * uSpeed.y + uOffset2.y);
            
            // Normalize wave roughly to [0, 1]
            wave = wave * 0.25 + 0.5;
            
            // Stretch the contrast to ensure we get solid areas of pure black and pure color
            wave = smoothstep(0.2, 0.8, wave);

            // Bayer matrix index
            int x = int(mod(fragCoord.x, 4.0));
            int y = int(mod(fragCoord.y, 4.0));
            int index = x + y * 4;
            
            float threshold = bayerMatrix[index];

            // Faded Dither: step the continuous wave against the Bayer matrix.
            // We add a tiny offset (0.01) to the threshold so that when the wave is exactly 0.0,
            // it doesn't trigger the 0.0 threshold in the matrix (which causes the unwanted dots).
            float ditheredValue = step(threshold + 0.01, wave);

            vec3 finalColor = mix(uColorBg, uColorWave, ditheredValue);

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    return (
        <mesh scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                depthWrite={false}
                depthTest={false}
            />
        </mesh>
    );
};

export default function ShaderBackground() {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}>
            <Canvas
                gl={{ antialias: false, alpha: false }}
                camera={{ position: [0, 0, 1] }}
            >
                <ShaderPlane />
            </Canvas>
        </div>
    );
}
