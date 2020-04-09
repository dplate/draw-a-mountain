const recreateRidgeMesh = (scene, heights) => {
  const ridge = scene.getObjectByName('ridge');
  ridge && scene.remove(ridge);

  var geometry = new THREE.Geometry();
  heights.forEach((height, i) => {
    if (height !== null) {
      geometry.vertices.push(new THREE.Vector3(i / (heights.length - 1), height, 1));
    }
  });
  var line = new MeshLine();
  line.setGeometry( geometry );
  var material = new MeshLineMaterial({ lineWidth: 0.01 });
  var mesh = new THREE.Mesh(line.geometry, material);
  mesh.name = 'ridge';
  scene.add(mesh);
};

export default (scene, heights, point, endIt = false) => {
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

  if (heightAdded) {
    recreateRidgeMesh(scene, heights);
  }
};
