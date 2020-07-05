import createInstancedObjectFromSvg from '../lib/createInstancedObjectFromSvg.js';

const loadTree = async (scene, svgName, offsetY) => {
  const instancedObject = await createInstancedObjectFromSvg(scene, svgName);
  instancedObject.mesh.geometry.translate(0, offsetY, 0);
  return instancedObject;
}

export default async (scene) => [
  {
    instancedObject: await loadTree(scene, 'trees/pine-curve', 0.4),
    stumpOffsetY: null,
    turnOnSlope: true,
    distribution: {
      height: {
        minimum: 0.4,
        optimum: 0.6,
        maximum: 0.8
      },
      slope: {
        minimum: 0.01,
        optimum: 0.03,
        maximum: 1.0
      }
    }
  },
  {
    instancedObject: await loadTree(scene, 'trees/pine-straight', 0.4),
    stumpOffsetY: null,
    turnOnSlope: true,
    distribution: {
      height: {
        minimum: 0.4,
        optimum: 0.6,
        maximum: 0.8
      },
      slope: {
        minimum: 0.0,
        optimum: 0.005,
        maximum: 0.02
      }
    }
  },
  {
    instancedObject: await loadTree(scene, 'trees/fir', 1.2),
    stumpOffsetY: 0.55,
    turnOnSlope: false,
    distribution: {
      height: {
        minimum: 0,
        optimum: 0.4,
        maximum: 0.7
      },
      slope: {
        minimum: 0,
        optimum: 0.02,
        maximum: 0.04
      }
    }
  },
  {
    instancedObject: await loadTree(scene, 'trees/leaf', 1.1),
    stumpOffsetY: 0.19,
    turnOnSlope: false,
    distribution: {
      height: {
        minimum: 0,
        optimum: 0.1,
        maximum: 0.4
      },
      slope: {
        minimum: 0,
        optimum: 0.005,
        maximum: 0.04
      }
    }
  }
];