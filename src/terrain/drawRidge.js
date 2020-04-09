const recreateRidgeMesh = (scene, ridgeMesh, heights) => {
  if (ridgeMesh) {
    ridgeMesh.geometry.dispose();
    ridgeMesh.material.dispose();
    scene.remove(ridgeMesh);
  }

  const geometry = new THREE.Geometry();
  heights.forEach((height, i) => {
    if (height !== null) {
      geometry.vertices.push(new THREE.Vector3(i / (heights.length - 1), height, 1));
    }
  });
  const line = new MeshLine();
  line.setGeometry(geometry);
  const material = new MeshLineMaterial({lineWidth: 0.01});
  const mesh = new THREE.Mesh(line.geometry, material);
  mesh.name = 'ridge';
  scene.add(mesh);
  return mesh;
};

export default (scene, heights, point, endIt = false) => {
  const ridgeMesh = scene.getObjectByName('ridge');
  const lastIndex = heights.length - 1;
  const currentIndex = Math.max(0, Math.min(lastIndex, Math.round(point.x * (heights.length - 1))));

  let heightAdded = false;
  if (heights[0] !== null) {
    const upTo = endIt ? lastIndex : currentIndex;
    for (let i = 1; i <= upTo; i++) {
      if (heights[i] === null) {
        heights[i] = heights[i - 1] + (point.y - heights[i - 1]) / (upTo - (i - 1));
        heightAdded = true;
      }
    }
  } else if (heights[lastIndex] !== null) {
    const upTo = endIt ? 0 : currentIndex;
    for (let i = lastIndex - 1; i >= upTo; i--) {
      if (heights[i] === null) {
        heights[i] = heights[i + 1] + (point.y - heights[i + 1]) / ((i + 1) - upTo);
        heightAdded = true;
      }
    }
  } else {
    if (currentIndex < heights.length / 2) {
      heights.fill(point.y, 0, endIt ? heights.length : currentIndex + 1);
    } else {
      heights.fill(point.y, endIt ? 0 : currentIndex);
    }
    heightAdded = true;
  }

  return heightAdded ? recreateRidgeMesh(scene, ridgeMesh, heights) : ridgeMesh;
};
