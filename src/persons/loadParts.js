import loadSvg from '../lib/loadSvg.js';

const loadMesh = async (name, mirror, x = 0, y = 0) => {
  const mesh = await loadSvg(name);
  mesh.geometry.translate(x, y, 0);
  if (mirror) {
    mesh.geometry.scale(-1, 1, 1);
  }
  return mesh;
};

const loadBodyLeftMesh = async (mirror) => {
  const mesh = await loadMesh('persons/bodies/left', mirror);
  mesh.userData = {
    shirtIndex: 0,
    skinIndex: 1,
    trouserIndex: 2
  }
  return mesh;
};

const loadBodyFrontMesh = async () => {
  const mesh = await loadMesh('persons/bodies/front', false);
  mesh.userData = {
    shirtIndex: 0,
    skinIndex: 1,
    trouserIndex: 2
  }
  return mesh;
};

const loadBodyBackMesh = async () => {
  const mesh = await loadMesh('persons/bodies/back', false);
  mesh.userData = {
    shirtIndex: 0,
    skinIndex: 1,
    trouserIndex: 2
  }
  return mesh;
};

const loadHeadLeftMesh = async (mirror) => {
  const mesh = await loadMesh('persons/heads/left', mirror);
  mesh.userData = {
    skinIndex: 0,
    hairIndex: 5
  }
  return mesh;
};

const loadHeadFrontMesh = async () => {
  const mesh = await loadMesh('persons/heads/front', false);
  mesh.userData = {
    skinIndex: 3,
    hairIndex: 2
  }
  return mesh;
};

const loadHeadBackMesh = async () => {
  const mesh = await loadMesh('persons/heads/back', false);
  mesh.userData = {
    skinIndex: 1,
    hairIndex: 0
  }
  return mesh;
};

const loadArmLeftMesh = async (mirror) => {
  const mesh = await loadMesh('persons/arms/left', mirror, -0.2, 0.15);
  mesh.userData = {
    shirtIndex: 0,
    skinIndex: 1
  }
  return mesh;
};

const loadArmFrontMesh = async (mirror) => {
  const mesh = await loadMesh('persons/arms/front', mirror, 0.2, 0.1);
  mesh.userData = {
    shirtIndex: 0,
    skinIndex: 1
  }
  return mesh;
};

const loadLegLeftMesh = async (mirror) => {
  const mesh = await loadMesh('persons/legs/left', mirror, -0.1, 0.3);
  mesh.userData = {
    shoeIndex: 0,
    trouserIndex: 1
  }
  return mesh;
};

const loadLegFrontMesh = async (mirror) => {
  const mesh = await loadMesh('persons/legs/front', mirror, 0, 0);
  mesh.userData = {
    shoeIndex: 0,
    trouserIndex: 1
  }
  return mesh;
};

export default async () => ({
  bodies: [
    {
      left: await loadBodyLeftMesh(false),
      right: await loadBodyLeftMesh(true),
      front: await loadBodyFrontMesh(),
      back: await loadBodyBackMesh()
    }
  ],
  heads: [
    {
      left: await loadHeadLeftMesh(false),
      right: await loadHeadLeftMesh(true),
      front: await loadHeadFrontMesh(),
      back: await loadHeadBackMesh()
    }
  ],
  arms: [
    {
      left: await loadArmLeftMesh(false),
      right: await loadArmLeftMesh(true),
      frontLeft: await loadArmFrontMesh(true),
      frontRight: await loadArmFrontMesh(false)
    }
  ],
  legs: [
    {
      left: await loadLegLeftMesh(false),
      right: await loadLegLeftMesh(true),
      frontLeft: await loadLegFrontMesh(true),
      frontRight: await loadLegFrontMesh(false)
    }
  ]
});