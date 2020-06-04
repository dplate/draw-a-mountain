import {ARM_SCALE, BODY_SCALE, HEAD_SCALE, LEG_SCALE} from "./personScales.js";

const LIGHT = 0.05;

const cloneMesh = (scene, scale, mesh) => {
  const meshGroup = mesh.clone();
  meshGroup.children.forEach((mesh) => {
    mesh.material = mesh.material.clone();
  });
  meshGroup.visible = false;
  meshGroup.scale.x = scale;
  meshGroup.scale.y = scale;
  meshGroup.userData.scale = scale;
  scene.add(meshGroup);
  return meshGroup;
};

const cloneBodyMesh = (scene, scale, bodyMesh, colors) => {
  const meshGroup = cloneMesh(scene, scale, bodyMesh);
  meshGroup.children[bodyMesh.userData.shirtIndex].material.color.copy(colors.shirt);
  meshGroup.children[bodyMesh.userData.skinIndex].material.color.copy(colors.skin);
  meshGroup.children[bodyMesh.userData.trouserIndex].material.color.copy(colors.trouser);
  return meshGroup;
};

const cloneHeadMesh = (scene, scale, headMesh, colors) => {
  const meshGroup = cloneMesh(scene, scale, headMesh);
  meshGroup.children[headMesh.userData.skinIndex].material.color.copy(colors.skin);
  meshGroup.children[headMesh.userData.hairIndex].material.color.copy(colors.hair);
  return meshGroup;
};

const cloneCenterMeshes = (scene, scale, meshes, colors, cloneMesh) => ({
  left: cloneMesh(scene, scale, meshes.left, colors),
  right: cloneMesh(scene, scale, meshes.right, colors),
  front: cloneMesh(scene, scale, meshes.front, colors),
  back: cloneMesh(scene, scale, meshes.back, colors)
});

const cloneLegMesh = (scene, scale, legMesh, colors, light) => {
  const meshGroup = cloneMesh(scene, scale, legMesh);
  meshGroup.children[legMesh.userData.shoeIndex].material.color.copy(colors.shoe);
  meshGroup.children[legMesh.userData.shoeIndex].material.color.offsetHSL(0, 0, light);
  meshGroup.children[legMesh.userData.trouserIndex].material.color.copy(colors.trouser);
  meshGroup.children[legMesh.userData.trouserIndex].material.color.offsetHSL(0, 0, light);
  return meshGroup;
};

const cloneLeftLegMeshes = (scene, scale, leg, colors) => ({
  left: cloneLegMesh(scene, scale, leg.left, colors, 0),
  right: cloneLegMesh(scene, scale, leg.right, colors, -LIGHT),
  front: cloneLegMesh(scene, scale, leg.frontRight, colors, 0),
  back: cloneLegMesh(scene, scale, leg.frontLeft, colors, -LIGHT / 2)
});

const cloneRightLegMeshes = (scene, scale, leg, colors) => ({
  left: cloneLegMesh(scene, scale, leg.left, colors, -LIGHT),
  right: cloneLegMesh(scene, scale, leg.right, colors, 0),
  front: cloneLegMesh(scene, scale, leg.frontLeft, colors, 0),
  back: cloneLegMesh(scene, scale, leg.frontRight, colors, -LIGHT / 2)
});

const cloneArmMesh = (scene, scale, armMesh, colors, light) => {
  const meshGroup = cloneMesh(scene, scale, armMesh);
  meshGroup.children[armMesh.userData.shirtIndex].material.color.copy(colors.shirt);
  meshGroup.children[armMesh.userData.shirtIndex].material.color.offsetHSL(0, 0, light);
  meshGroup.children[armMesh.userData.skinIndex].material.color.copy(colors.skin);
  meshGroup.children[armMesh.userData.skinIndex].material.color.offsetHSL(0, 0, light);
  return meshGroup;
};

const cloneLeftArmMeshes = (scene, scale, arm, colors) => ({
  left: cloneArmMesh(scene, scale, arm.left, colors, LIGHT),
  right: cloneArmMesh(scene, scale, arm.right, colors, -LIGHT),
  front: cloneArmMesh(scene, scale, arm.frontRight, colors, 0),
  back: cloneArmMesh(scene, scale, arm.frontLeft, colors, 0)
});

const cloneRightArmMeshes = (scene, scale, arm, colors) => ({
  left: cloneArmMesh(scene, scale, arm.left, colors, -LIGHT),
  right: cloneArmMesh(scene, scale, arm.right, colors, LIGHT),
  front: cloneArmMesh(scene, scale, arm.frontLeft, colors, 0),
  back: cloneArmMesh(scene, scale, arm.frontRight, colors, 0)
});

export default (scene, scale, body, head, leg, arm, colors) => ({
  body: cloneCenterMeshes(scene, scale * BODY_SCALE, body, colors, cloneBodyMesh),
  head: cloneCenterMeshes(scene, scale * HEAD_SCALE, head, colors, cloneHeadMesh),
  leftLeg: cloneLeftLegMeshes(scene, scale * LEG_SCALE, leg, colors),
  rightLeg: cloneRightLegMeshes(scene, scale * LEG_SCALE, leg, colors),
  leftArm: cloneLeftArmMeshes(scene, scale * ARM_SCALE, arm, colors),
  rightArm: cloneRightArmMeshes(scene, scale * ARM_SCALE, arm, colors)
});