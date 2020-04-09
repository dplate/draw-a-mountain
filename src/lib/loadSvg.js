import {SVGLoader} from '../../external/SVGLoader.js';

export default (svgName) => {
  return new Promise((resolve, reject) => {
    const loader = new SVGLoader();
    loader.load(
      `assets/${svgName}.svg`,
      data => {
        const paths = data.paths;
        const group = new THREE.Group();
        paths.forEach(path => {
          var material = new THREE.MeshBasicMaterial({
            color: path.color,
            side: THREE.DoubleSide,
            depthWrite: false
          });
          const shapes = path.toShapes(true);
          shapes.forEach(shape => {
            const geometry = new THREE.ShapeBufferGeometry(shape);
            geometry.scale(0.001, -0.001, 0.001);
            const mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);
          });
        });
        resolve(group);
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