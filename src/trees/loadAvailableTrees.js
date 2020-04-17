import loadSvg from "../lib/loadSvg.js";

export default async () => [
  {
    mesh: await loadSvg('trees/pine-curve'),
    offsetY: -0.6,
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
    mesh: await loadSvg('trees/pine-straight'),
    offsetY: -0.6,
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
    mesh: await loadSvg('trees/fir'),
    offsetY: 0.3,
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
    mesh: await loadSvg('trees/leaf'),
    offsetY: 0.1,
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