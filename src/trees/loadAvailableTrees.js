import createInstancedObjectFromSvg from "../lib/createInstancedObjectFromSvg.js";

export default async (scene) => [
  {
    mesh: await createInstancedObjectFromSvg(scene, 'trees/pine-curve'),
    offsetY: -0.6,
    stumpOffsetY: null,
    turnOnSlope: true,
    distribution: {
      height: {
        minimum: 0.4,
        optimum: 0.6,
        maximum: 0.9
      },
      slope: {
        minimum: 0.3,
        optimum: 0.35,
        maximum: 1.0
      }
    }
  },
  {
    mesh: await createInstancedObjectFromSvg(scene, 'trees/pine-straight'),
    offsetY: -0.6,
    stumpOffsetY: null,
    turnOnSlope: true,
    distribution: {
      height: {
        minimum: 0.4,
        optimum: 0.6,
        maximum: 0.9
      },
      slope: {
        minimum: 0.0,
        optimum: 0.0,
        maximum: 0.35
      }
    }
  },
  {
    mesh: await createInstancedObjectFromSvg(scene, 'trees/fir'),
    offsetY: 0.3,
    stumpOffsetY: 1.75,
    turnOnSlope: false,
    distribution: {
      height: {
        minimum: 0,
        optimum: 0.4,
        maximum: 0.7
      },
      slope: {
        minimum: 0,
        optimum: 0.0,
        maximum: 0.5
      }
    }
  },
  {
    mesh: await createInstancedObjectFromSvg(scene, 'trees/leaf'),
    offsetY: 0.1,
    stumpOffsetY: 1.29,
    turnOnSlope: false,
    distribution: {
      height: {
        minimum: 0,
        optimum: 0,
        maximum: 0.4
      },
      slope: {
        minimum: 0,
        optimum: 0,
        maximum: 0.3
      }
    }
  }
];