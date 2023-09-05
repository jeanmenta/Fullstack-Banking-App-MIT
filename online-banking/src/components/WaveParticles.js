import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

const WaveParticles = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current === null) return;

        let container, stats;
        let camera, scene, renderer;
        let particles, count = 0;
        let mouseX = 103,
            mouseY = -400;
        let windowHalfX = window.innerWidth / 2;
        let windowHalfY = window.innerHeight / 2;

        function init() {
            const AMOUNTX = 50;
            const AMOUNTY = 50;

            container = containerRef.current;
            container.id = 'particle-container';
            document.getElementById('app-container').appendChild(container);

            camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                1,
                10000
            );
            camera.position.z = 1000;

            scene = new THREE.Scene();

            const SEPARATION = 100;

            const numParticles = AMOUNTX * AMOUNTY;

            const positions = new Float32Array(numParticles * 3);
            const scales = new Float32Array(numParticles);

            let i = 0,
                j = 0;

            for (let ix = 0; ix < AMOUNTX; ix++) {
                for (let iy = 0; iy < AMOUNTY; iy++) {
                    positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2; // x
                    positions[i + 1] = 0; // y
                    positions[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2; // z

                    scales[j] = 1;

                    i += 3;
                    j++;
                }
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

            const material = new THREE.ShaderMaterial({
                uniforms: {
                    color: { value: new THREE.Color(0xffffff) }, // change particles color to white
                },
                vertexShader: `
                    attribute float scale;

                    void main() {
                        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                        gl_PointSize = scale * ( 250.0 / - mvPosition.z );
                        gl_Position = projectionMatrix * mvPosition;
                        
                    }
                `,
                fragmentShader: `
                    uniform vec3 color;

                    void main() {
                        if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.135 ) discard;
                        gl_FragColor = vec4( color, 0 );
                    }
                `,
            });

            particles = new THREE.Points(geometry, material);
            scene.add(particles);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.useLegacyLights = false;
            container.appendChild(renderer.domElement);

            stats = new Stats();

            container.style.position = 'absolute';
            container.style.zIndex = '-1';
            container.style.touchAction = 'none';
            window.addEventListener('resize', onWindowResize);
            document.addEventListener('pointermove', onPointerMove);

        }

        function onWindowResize() {
            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function onPointerMove(event) {
            if (event.isPrimary === false) return;
            mouseX = event.clientX - windowHalfX;
            mouseY = event.clientY - windowHalfY;
        }

        function animate() {
            requestAnimationFrame(animate);
            render();
            stats.update();
        }

        function render() {
            const AMOUNTX = 50;
            const AMOUNTY = 50;
            renderer.setClearColor(0x000000, 1);

            camera.position.x += (mouseX - camera.position.x) * 0.05;
            camera.position.y += (-mouseY - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            const positions = particles.geometry.attributes.position.array;
            const scales = particles.geometry.attributes.scale.array;

            let i = 0,
                j = 0;

            for (let ix = 0; ix < AMOUNTX; ix++) {
                for (let iy = 0; iy < AMOUNTY; iy++) {
                    positions[i + 1] =
                        Math.sin((ix + count) * 0.3) * 50 +
                        Math.sin((iy + count) * 0.5) * 50;

                    scales[j] =
                        (Math.sin((ix + count) * 0.3) + 1) * 20 +
                        (Math.sin((iy + count) * 0.5) + 1) * 20;

                    i += 3;
                    j++;
                }
            }

            particles.geometry.attributes.position.needsUpdate = true;
            particles.geometry.attributes.scale.needsUpdate = true;

            renderer.render(scene, camera);

            count += 0.1;
        }

        // Removes extra canvas element
        setTimeout(() => {
            let canvasElements = document.querySelectorAll('#particle-container canvas');
            if (canvasElements.length > 1) {
                canvasElements[canvasElements.length - 1].remove();
            }
        }, 0);

        init();
        animate();

        return () => {
            particles.geometry.dispose();
            particles.material.dispose();
            renderer.dispose();

            window.removeEventListener('resize', onWindowResize);
            window.removeEventListener('pointermove', onPointerMove);

        };
    }, []);
    return <div ref={containerRef} style={{ width: '100%', height: "calc(100% - 56px)" }} />;
};

export default WaveParticles;
