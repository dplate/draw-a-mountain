import {ARM_SCALE, BODY_SCALE, HEAD_SCALE, LEG_SCALE} from './personScales.js';

const LIGHT = 0.05;

const color = new THREE.Color();

const cloneMesh = (scene, scale, mesh) => {
  const newMesh = mesh.clone();
  newMesh.geometry = mesh.geometry.clone();
  newMesh.visible = false;
  newMesh.scale.x = scale;
  newMesh.scale.y = scale;
  newMesh.userData.scale = scale;
  scene.add(newMesh);
  return newMesh;
};

const changeColor = (mesh, groupIndex, color) => {
  const {groups, index: {array: indexArray}, attributes: {color: {array: colorArray}}} = mesh.geometry;
  if (groups[groupIndex]) {
    for (let index = groups[groupIndex].start; index <= groups[groupIndex].start + groups[groupIndex].count; index++) {
      const colorIndex = indexArray[index] * 3;
      colorArray[colorIndex] = color.r;
      colorArray[colorIndex + 1] = color.g;
      colorArray[colorIndex + 2] = color.b;
    }
  }
};

const cloneBodyMesh = (scene, scale, bodyMesh, colors) => {
  const mesh = cloneMesh(scene, scale, bodyMesh);
  changeColor(mesh, bodyMesh.userData.shirtIndex, colors.shirt);
  changeColor(mesh, bodyMesh.userData.skinIndex, colors.skin);
  changeColor(mesh, bodyMesh.userData.trouserIndex, colors.trouser);
  return mesh;
};

const cloneHeadMesh = (scene, scale, headMesh, colors) => {
  const mesh = cloneMesh(scene, scale, headMesh);
  changeColor(mesh, headMesh.userData.skinIndex, colors.skin);
  changeColor(mesh, headMesh.userData.hairIndex, colors.hair);
  return mesh;
};

const cloneCenterMeshes = (scene, scale, meshes, colors, cloneMesh) => ({
  left: cloneMesh(scene, scale, meshes.left, colors),
  right: cloneMesh(scene, scale, meshes.right, colors),
  front: cloneMesh(scene, scale, meshes.front, colors),
  back: cloneMesh(scene, scale, meshes.back, colors)
});

const cloneLegMesh = (scene, scale, legMesh, colors, light) => {
  const mesh = cloneMesh(scene, scale, legMesh);
  color.copy(colors.shoe);
  color.offsetHSL(0, 0, light)
  changeColor(mesh, legMesh.userData.shoeIndex, color);
  color.copy(colors.trouser);
  color.offsetHSL(0, 0, light)
  changeColor(mesh, legMesh.userData.trouserIndex, color);
  changeColor(mesh, legMesh.userData.skinIndex, colors.skin);
  return mesh;
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
  const mesh = cloneMesh(scene, scale, armMesh);
  color.copy(colors.shirt);
  color.offsetHSL(0, 0, light)
  changeColor(mesh, armMesh.userData.shirtIndex, color);
  color.copy(colors.skin);
  color.offsetHSL(0, 0, light)
  changeColor(mesh, armMesh.userData.skinIndex, color);
  return mesh;
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