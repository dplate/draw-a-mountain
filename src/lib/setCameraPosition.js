const BOTTOM_MARGIN = 0.015;

const newCenter = new THREE.Vector2();

export default (camera, width = null, aspectRatio = null, center = null) => {
  width = Math.max(0, Math.min(width, 1));
  const halfWidth = width / 2;

  if (aspectRatio === null) {
    aspectRatio = (camera.right - camera.left) / (camera.top - camera.bottom);
  }
  const halfHeight = halfWidth / aspectRatio;

  if (center === null) {
    newCenter.x = halfWidth;
    newCenter.y = halfHeight - BOTTOM_MARGIN;
  } else {
    newCenter.x = center.x;
    newCenter.y = center.y;
  }
  newCenter.x = Math.max(halfWidth, Math.min(newCenter.x, 1 - halfWidth));
  newCenter.y = Math.max(halfHeight - BOTTOM_MARGIN, newCenter.y);

  camera.left = newCenter.x - halfWidth;
  camera.right = newCenter.x + halfWidth;
  camera.top = newCenter.y + halfHeight;
  camera.bottom = newCenter.y - halfHeight;
  camera.updateProjectionMatrix();

  return newCenter;
}