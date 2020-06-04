const LIGHT = 0.05;

const cloneMesh = (scene, mesh) => {
  const meshGroup = mesh.clone();
  meshGroup.children.forEach((mesh) => {
    mesh.material = mesh.material.clone();
  });
  meshGroup.visible = false;
  scene.add(meshGroup);
  return meshGroup;
};

const cloneBodyMesh = (scene, bodyMesh, colors) => {
  const meshGroup = cloneMesh(scene, bodyMesh);
  meshGroup.children[bodyMesh.userData.shirtIndex].material.color.copy(colors.shirt);
  meshGroup.children[bodyMesh.userData.skinIndex].material.color.copy(colors.skin);
  meshGroup.children[bodyMesh.userData.trouserIndex].material.color.copy(colors.trouser);
  return meshGroup;
};

const cloneHeadMesh = (scene, headMesh, colors) => {
  const meshGroup = cloneMesh(scene, headMesh);
  meshGroup.children[headMesh.userData.skinIndex].material.color.copy(colors.skin);
  meshGroup.children[headMesh.userData.hairIndex].material.color.copy(colors.hair);
  return meshGroup;
};

const cloneCenterMeshes = (scene, meshes, colors, cloneMesh) => ({
  left: cloneMesh(scene, meshes.left, colors),
  right: cloneMesh(scene, meshes.right, colors),
  front: cloneMesh(scene, meshes.front, colors),
  back: cloneMesh(scene, meshes.back, colors)
});

const cloneLegMesh = (scene, legMesh, colors, light) => {
  const meshGroup = cloneMesh(scene, legMesh);
  meshGroup.children[legMesh.userData.shoeIndex].material.color.copy(colors.shoe);
  meshGroup.children[legMesh.userData.shoeIndex].material.color.offsetHSL(0, 0, light);
  meshGroup.children[legMesh.userData.trouserIndex].material.color.copy(colors.trouser);
  meshGroup.children[legMesh.userData.trouserIndex].material.color.offsetHSL(0, 0, light);
  return meshGroup;
};

const cloneLeftLegMeshes = (scene, leg, colors) => ({
  left: cloneLegMesh(scene, leg.left, colors, 0),
  right: cloneLegMesh(scene, leg.right, colors, -LIGHT),
  front: cloneLegMesh(scene, leg.frontRight, colors, 0),
  back: cloneLegMesh(scene, leg.frontLeft, colors, -LIGHT / 2)
});

const cloneRightLegMeshes = (scene, leg, colors) => ({
  left: cloneLegMesh(scene, leg.left, colors, -LIGHT),
  right: cloneLegMesh(scene, leg.right, colors, 0),
  front: cloneLegMesh(scene, leg.frontLeft, colors, 0),
  back: cloneLegMesh(scene, leg.frontRight, colors, -LIGHT / 2)
});

const cloneArmMesh = (scene, armMesh, colors, light) => {
  const meshGroup = cloneMesh(scene, armMesh);
  meshGroup.children[armMesh.userData.shirtIndex].material.color.copy(colors.shirt);
  meshGroup.children[armMesh.userData.shirtIndex].material.color.offsetHSL(0, 0, light);
  meshGroup.children[armMesh.userData.skinIndex].material.color.copy(colors.skin);
  meshGroup.children[armMesh.userData.skinIndex].material.color.offsetHSL(0, 0, light);
  return meshGroup;
};

const cloneLeftArmMeshes = (scene, arm, colors) => ({
  left: cloneArmMesh(scene, arm.left, colors, LIGHT),
  right: cloneArmMesh(scene, arm.right, colors, -LIGHT),
  front: cloneArmMesh(scene, arm.frontRight, colors, 0),
  back: cloneArmMesh(scene, arm.frontLeft, colors, 0)
});

const cloneRightArmMeshes = (scene, arm, colors) => ({
  left: cloneArmMesh(scene, arm.left, colors, -LIGHT),
  right: cloneArmMesh(scene, arm.right, colors, LIGHT),
  front: cloneArmMesh(scene, arm.frontLeft, colors, 0),
  back: cloneArmMesh(scene, arm.frontRight, colors, 0)
});

export default (scene, body, head, leg, arm, colors) => ({
  body: cloneCenterMeshes(scene, body, colors, cloneBodyMesh),
  head: cloneCenterMeshes(scene, head, colors, cloneHeadMesh),
  leftLeg: cloneLeftLegMeshes(scene, leg, colors),
  rightLeg: cloneRightLegMeshes(scene, leg, colors),
  leftArm: cloneLeftArmMeshes(scene, arm, colors),
  rightArm: cloneRightArmMeshes(scene, arm, colors)
});