const createDirtMesh = () => {
  const geometry = new THREE.CircleGeometry(0.002, 5);
  const material = new THREE.MeshBasicMaterial({color: 0xb78346, transparent: true, opacity: 0.1});
  return new THREE.Mesh(geometry, material);
};

const createGravelMesh = () => {
  const geometry = new THREE.CircleGeometry(0.002, 5);
  const material = new THREE.MeshBasicMaterial({color: 0xc2c1bf});
  return new THREE.Mesh(geometry, material);
};

const createSnowMesh = () => {
  const geometry = new THREE.CircleGeometry(0.002, 5);
  const material = new THREE.MeshBasicMaterial({color: 0xa7a7a7, transparent: true, opacity: 0.7});
  return new THREE.Mesh(geometry, material);
};

export default () => {
  return [
    {
      mesh: createGravelMesh(),
      density: 0.1,
      distribution: {
        height: {
          minimum: 0.0,
          optimum: 0.6,
          maximum: 0.9
        },
        slope: {
          minimum: 0,
          optimum: 0.5,
          maximum: 1.0
        }
      },
    },
    {
      mesh: createDirtMesh(),
      density: 1.0,
      distribution: {
        height: {
          minimum: 0,
          optimum: 0.3,
          maximum: 0.8
        },
        slope: {
          minimum: 0,
          optimum: 0,
          maximum: 0.3
        }
      },
    },
    {
      mesh: createSnowMesh(),
      density: 0.2,
      distribution: {
        height: {
          minimum: 0.7,
          optimum: 1.0,
          maximum: 1.0
        },
        slope: {
          minimum: 0,
          optimum: 0,
          maximum: 0.5
        }
      }
    }
  ];
}