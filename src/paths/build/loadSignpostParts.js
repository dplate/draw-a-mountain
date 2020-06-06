import {POST_HEIGHT, POST_WIDTH, SIGN_HEIGHT} from "./signpostSizes.js";

const createSignGeometry = () => {
  const signGeometryTmp = new THREE.PlaneGeometry(0.005, SIGN_HEIGHT, 1, 2);
  signGeometryTmp.vertices[3].x += 0.002;
  const signGeometry = new THREE.BufferGeometry().fromGeometry(signGeometryTmp);
  signGeometryTmp.dispose();
  return signGeometry;
};

export default () => {
  return {
    post: {
      name: 'post',
      material: new THREE.MeshBasicMaterial({color: 0x777777}),
      geometry: new THREE.PlaneBufferGeometry(POST_WIDTH, POST_HEIGHT),
      matrixes: []
    },
    sign_0: {
      name: 'sign-easy',
      material: new THREE.MeshBasicMaterial({color: 0xbe7b10, side: THREE.DoubleSide}),
      geometry: createSignGeometry(),
      matrixes: []
    },
    sign_1: {
      name: 'sign-intermediate',
      material: new THREE.MeshBasicMaterial({color: 0xb8221e, side: THREE.DoubleSide}),
      geometry: createSignGeometry(),
      matrixes: []
    },
    sign_2: {
      name: 'sign-difficult',
      material: new THREE.MeshBasicMaterial({color: 0x01174d, side: THREE.DoubleSide}),
      geometry: createSignGeometry(),
      matrixes: []
    },
    poi: {
      name: 'poi',
      material: new THREE.MeshBasicMaterial({color: 0xcccccc}),
      geometry: new THREE.PlaneBufferGeometry(0.002, 0.002),
      matrixes: []
    }
  };
}

