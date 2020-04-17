const snowColor = new THREE.Color(0xf7f7f9);
const dryColor = new THREE.Color(0xd3d9b3);
const grassColor = new THREE.Color(0xcad978);
const rockColor = new THREE.Color(0xb8b8b8);

export default [
  {
    color: rockColor,
    distribution: {
      height: {
        minimum: 0.0,
        optimum: 0.5,
        maximum: 1.0
      },
      slope: {
        minimum: 0.01,
        optimum: 0.02,
        maximum: 0.02
      }
    },
  },
  {
    color: dryColor,
    distribution: {
      height: {
        minimum: 0.1,
        optimum: 0.6,
        maximum: 0.9
      },
      slope: {
        minimum: 0,
        optimum: 0.013,
        maximum: 0.013
      }
    },
  },
  {
    color: grassColor,
    distribution: {
      height: {
        minimum: 0,
        optimum: 0,
        maximum: 0.7
      },
      slope: {
        minimum: 0,
        optimum: 0,
        maximum: 0.013
      }
    },
  },
  {
    color: snowColor,
    distribution: {
      height: {
        minimum: 0.7,
        optimum: 1.0,
        maximum: 1.0
      },
      slope: {
        minimum: 0,
        optimum: 0,
        maximum: 0.015
      }
    },
  }
];