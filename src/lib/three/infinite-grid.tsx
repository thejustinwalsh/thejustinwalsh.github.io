import * as THREE from "three";

export class InfiniteGridHelper extends THREE.Mesh {
  constructor(
    size1 = 10,
    size2 = 100,
    color = new THREE.Color("white"),
    distance = 8000,
    axes = "xzy",
  ) {
    const planeAxes = axes.slice(0, 2);

    const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,

      uniforms: {
        uSize1: {
          value: size1,
        },
        uSize2: {
          value: size2,
        },
        uColor: {
          value: color,
        },
        uDistance: {
          value: distance,
        },
      },
      transparent: true,
      vertexShader: /*glsl*/ `
         varying vec3 worldPosition;
         uniform float uDistance;
         
         void main() {
              vec3 pos = position.${axes} * uDistance;
              pos.${planeAxes} += cameraPosition.${planeAxes};
              worldPosition = pos;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
         }
      `,

      fragmentShader: /*glsl*/ `
         varying vec3 worldPosition;
         uniform float uSize1;
         uniform float uSize2;
         uniform vec3 uColor;
         uniform float uDistance;

        float getGrid(float size) {
            vec2 r = worldPosition.${planeAxes} / size;
            vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
            float line = min(grid.x, grid.y);
            return 1.0 - min(line, 1.0);
        }
          
        void main() {
          float d = 1.0 - min(distance(cameraPosition.${planeAxes}, worldPosition.${planeAxes}) / uDistance, 1.0);
          float g1 = getGrid(uSize1);
          float g2 = getGrid(uSize2);
          gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1) * pow(d, 3.0));
          gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);
          if ( gl_FragColor.a <= 0.0 ) discard;
        }
      `,
    });

    super(geometry, material);

    this.frustumCulled = false;
  }

  get size1() {
    return (this.material as THREE.ShaderMaterial).uniforms.uSize1.value;
  }

  set size1(value) {
    (this.material as THREE.ShaderMaterial).uniforms.uSize1.value = value;
  }

  get size2() {
    return (this.material as THREE.ShaderMaterial).uniforms.uSize2.value;
  }

  set size2(value) {
    (this.material as THREE.ShaderMaterial).uniforms.uSize2.value = value;
  }

  get color() {
    return (this.material as THREE.ShaderMaterial).uniforms.uColor.value;
  }

  set color(value) {
    (this.material as THREE.ShaderMaterial).uniforms.uColor.value = value;
  }

  get distance() {
    return (this.material as THREE.ShaderMaterial).uniforms.uDistance.value;
  }

  set distance(value) {
    (this.material as THREE.ShaderMaterial).uniforms.uDistance.value = value;
  }
}
