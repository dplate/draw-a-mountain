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
  scene.add(meshGroup);
  return meshGroup;
};

const cloneBodyMesh = (scene, bodyMesh, skinColor, shirtColor, trouserColor) => {
  const meshGroup = cloneMesh(scene, bodyMesh);
  meshGroup.children[0].material.color.copy(shirtColor);
  meshGroup.children[1].material.color.copy(skinColor);
  meshGroup.children[2].material.color.copy(trouserColor);
  return meshGroup;
};

const cloneHeadMesh = (scene, headMesh, skinColor, hairColor) => {
  const meshGroup = cloneMesh(scene, headMesh);
  meshGroup.children[0].material.color.copy(skinColor);
  meshGroup.children[5].material.color.copy(hairColor);
  return meshGroup;
};

const cloneLegMesh = (scene, legMesh, trouserColor, shoeColor, light) => {
  const meshGroup = cloneMesh(scene, legMesh);
  meshGroup.children[0].material.color.copy(shoeColor);
  meshGroup.children[0].material.color.offsetHSL(0, 0, light);
  meshGroup.children[1].material.color.copy(trouserColor);
  meshGroup.children[1].material.color.offsetHSL(0, 0, light);
  return meshGroup;
};

const cloneArmMesh = (scene, armMesh, skinColor, shirtColor, light) => {
  const meshGroup = cloneMesh(scene, armMesh);
  meshGroup.children[0].material.color.copy(shirtColor);
  meshGroup.children[0].material.color.offsetHSL(0, 0, light);
  meshGroup.children[1].material.color.copy(skinColor);
  meshGroup.children[1].material.color.offsetHSL(0, 0, light);
  return meshGroup;
};

export default (scene, parts) => {
  const body = getRandomFromList(parts.bodies);
  const head = getRandomFromList(parts.heads);
  const leg = getRandomFromList(parts.legs.filter(leg => leg.color === body.legColor));
  const arm = getRandomFromList(parts.arms.filter(arm => arm.color === body.armColor));
  const shirtColor = getRandomColor();
  const trouserColor = getRandomColor();
  const shoeColor = getRandomFromList(shoeColors);
  const skinColor = getRandomFromList(skinColors);
  const hairColor = getRandomFromList(hairColors);

  const person = {
    body: {
      meshes: {
        left: cloneBodyMesh(scene, body.left, skinColor, shirtColor, trouserColor),
        right: cloneBodyMesh(scene, body.right, skinColor, shirtColor, trouserColor)
      }
    },
    head: {
      meshes: {
        left: cloneHeadMesh(scene, head.left, skinColor, hairColor),
        right: cloneHeadMesh(scene, head.right, skinColor, hairColor)
      }
    },
    leftLeg: {
      meshes: {
        left: cloneLegMesh(scene, leg.left, trouserColor, shoeColor, 0),
        right: cloneLegMesh(scene, leg.right, trouserColor, shoeColor, -LIGHT)
      },
      angle: 0
    },
    rightLeg: {
      meshes: {
        left: cloneLegMesh(scene, leg.left, trouserColor, shoeColor, -LIGHT),
        right: cloneLegMesh(scene, leg.right, trouserColor, shoeColor, 0)
      },
      angle: 0
    },
    leftArm: {
      meshes: {
        left: cloneArmMesh(scene, arm.left, skinColor, shirtColor, LIGHT),
        right: cloneArmMesh(scene, arm.right, skinColor, shirtColor, -LIGHT)
      },
      angle: 0
    },
    rightArm: {
      meshes: {
        left: cloneArmMesh(scene, arm.left, skinColor, shirtColor, -LIGHT),
        right: cloneArmMesh(scene, arm.right, skinColor, shirtColor, LIGHT)
      },
      angle: 0
    },
    position: new THREE.Vector3(),
    scale: 1,
    animation: 'standing',
    direction: 'left',
    cycle: 0
  };

  scene.add(person.body.meshes.left);
  scene.add(person.head.meshes.left);

  return person;
};