import {SVGLoader} from '../../external/SVGLoader.js';

export default (svgName) => {
  return new Promise((resolve, reject) => {
    const loader = new SVGLoader();
    loader.load(
      `assets/${svgName}.svg`,
      data => {
        const material = new THREE.MeshBasicMaterial({
          vertexColors: true,
          side: THREE.DoubleSide
        });
        const subGeometries = [];
        const paths = data.paths;
        paths.forEach(path => {
          const shapes = path.toShapes(true);
          shapes.forEach(shape => {
            const subGeometry = new THREE.ShapeBufferGeometry(shape);
            subGeometry.scale(0.001, -0.001, 0.001);
            subGeometry.translate(-0.5, 0, 0);

            const count = subGeometry.attributes.position.count;
            subGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
            for (let i = 0; i < count; i++) {
              subGeometry.attributes.color.setXYZ(i, path.color.r, path.color.g, path.color.b);
            }
            subGeometries.push(subGeometry);
          });
        });
        const geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(subGeometries, true);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = svgName;
        resolve(mesh);
      },
      () => {
      },
      error => {
        console.error(`Could not load svg ${svgName}`, error);
        reject(error);
      }
    );
  });
};