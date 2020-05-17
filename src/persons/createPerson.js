const LIGHT = 0.05;

const getRandomFromList = (list) => list[Math.floor(Math.random() * list.length)];

const getRandomColor = () => new THREE.Color(Math.random(), Math.random(), Math.random());

const shoeColors = [
  new THREE.Color(0xa05a2c),
  new THREE.Color(0x333333),
  new THREE.Color(0xcccccc)
];

const skinColors = [
  new THREE.Color(0xfbecd8),
  new THREE.Color(0xe5ccac),
  new THREE.Color(0xcca776),
  new THREE.Color(0xe5c395),
  new THREE.Color(0xdaa256)
];

const hairColors = [
  new THREE.Color(0x552200),
  new THREE.Color(0xf4d34d),
  new THREE.Color(0xe4e3e0),
  new THREE.Color(0x846418),
  new THREE.Color(0x4a3708),
  new THREE.Color(0xb3871c),
  new THREE.Color(0xe0d239),
  new THREE.Color(0xecb131)
];

const cloneMesh = (scene, mesh) => {
  const meshGroup = mesh.clone();
  meshGroup.children.forEach((mesh) => {
    mesh.material = mesh.material.clone();
  });
  meshGroup.visible = false;
  scene.add(meshGroup);
  return meshGroup;
};

const cloneBodyMesh = (scene, bodyMesh, skinColor, shirtColor, trouserColor) => {
  const meshGroup = cloneMesh(scene, bodyMesh);
  meshGroup.children[bodyMesh.userData.shirtIndex].material.color.copy(shirtColor);
  meshGroup.children[bodyMesh.userData.skinIndex].material.color.copy(skinColor);
  meshGroup.children[bodyMesh.userData.trouserIndex].material.color.copy(trouserColor);
  return meshGroup;
};

const cloneHeadMesh = (scene, headMesh, skinColor, hairColor) => {
  const meshGroup = cloneMesh(scene, headMesh);
  meshGroup.children[headMesh.userData.skinIndex].material.color.copy(skinColor);
  meshGroup.children[headMesh.userData.hairIndex].material.color.copy(hairColor);
  return meshGroup;
};

const cloneLegMesh = (scene, legMesh, trouserColor, shoeColor, light) => {
  const meshGroup = cloneMesh(scene, legMesh);
  meshGroup.children[legMesh.userData.shoeIndex].material.color.copy(shoeColor);
  meshGroup.children[legMesh.userData.shoeIndex].material.color.offsetHSL(0, 0, light);
  meshGroup.children[legMesh.userData.trouserIndex].material.color.copy(trouserColor);
  meshGroup.children[legMesh.userData.trouserIndex].material.color.offsetHSL(0, 0, light);
  return meshGroup;
};

const cloneArmMesh = (scene, armMesh, skinColor, shirtColor, light) => {
  const meshGroup = cloneMesh(scene, armMesh);
  meshGroup.children[armMesh.userData.shirtIndex].material.color.copy(shirtColor);
  meshGroup.children[armMesh.userData.shirtIndex].material.color.offsetHSL(0, 0, light);
  meshGroup.children[armMesh.userData.skinIndex].material.color.copy(skinColor);
  meshGroup.children[armMesh.userData.skinIndex].material.color.offsetHSL(0, 0, light);
  return meshGroup;
};

export default (scene, parts, navigator, baseSpeed, scale) => {
  const body = getRandomFromList(parts.bodies);
  const head = getRandomFromList(parts.heads);
  const leg = getRandomFromList(parts.legs.filter(leg => leg.color === body.legColor));
  const arm = getRandomFromList(parts.arms.filter(arm => arm.color === body.armColor));
  const shirtColor = getRandomColor();
  const trouserColor = getRandomColor();
  const shoeColor = getRandomFromList(shoeColors);
  const skinColor = getRandomFromList(skinColors);
  const hairColor = getRandomFromList(hairColors);

  return {
    body: {
      meshes: {
        left: cloneBodyMesh(scene, body.left, skinColor, shirtColor, trouserColor),
        right: cloneBodyMesh(scene, body.right, skinColor, shirtColor, trouserColor),
        front: cloneBodyMesh(scene, body.front, skinColor, shirtColor, trouserColor),
        back: cloneBodyMesh(scene, body.back, skinColor, shirtColor, trouserColor)
      }
    },
    head: {
      meshes: {
        left: cloneHeadMesh(scene, head.left, skinColor, hairColor),
        right: cloneHeadMesh(scene, head.right, skinColor, hairColor),
        front: cloneHeadMesh(scene, head.front, skinColor, hairColor),
        back: cloneHeadMesh(scene, head.back, skinColor, hairColor)
      }
    },
    leftLeg: {
      meshes: {
        left: cloneLegMesh(scene, leg.left, trouserColor, shoeColor, 0),
        right: cloneLegMesh(scene, leg.right, trouserColor, shoeColor, -LIGHT),
        front: cloneLegMesh(scene, leg.frontRight, trouserColor, shoeColor, 0),
        back: cloneLegMesh(scene, leg.frontLeft, trouserColor, shoeColor, -LIGHT / 2)
      },
      angle: 0
    },
    rightLeg: {
      meshes: {
        left: cloneLegMesh(scene, leg.left, trouserColor, shoeColor, -LIGHT),
        right: cloneLegMesh(scene, leg.right, trouserColor, shoeColor, 0),
        front: cloneLegMesh(scene, leg.frontLeft, trouserColor, shoeColor, 0),
        back: cloneLegMesh(scene, leg.frontRight, trouserColor, shoeColor, -LIGHT / 2)
      },
      angle: 0
    },
    leftArm: {
      meshes: {
        left: cloneArmMesh(scene, arm.left, skinColor, shirtColor, LIGHT),
        right: cloneArmMesh(scene, arm.right, skinColor, shirtColor, -LIGHT),
        front: cloneArmMesh(scene, arm.frontRight, skinColor, shirtColor, 0),
        back: cloneArmMesh(scene, arm.frontLeft, skinColor, shirtColor, 0)
      },
      angle: 0
    },
    rightArm: {
      meshes: {
        left: cloneArmMesh(scene, arm.left, skinColor, shirtColor, -LIGHT),
        right: cloneArmMesh(scene, arm.right, skinColor, shirtColor, LIGHT),
        front: cloneArmMesh(scene, arm.frontLeft, skinColor, shirtColor, 0),
        back: cloneArmMesh(scene, arm.frontRight, skinColor, shirtColor, 0)
      },
      angle: 0
    },
    position: new THREE.Vector3(),
    scale,
    animation: 'standing',
    direction: 'left',
    cycle: 0,
    navigator,
    baseSpeed
  };
};