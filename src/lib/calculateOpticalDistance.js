export default (startPoint, endPoint) => Math.sqrt(
  (endPoint.x - startPoint.x) * (endPoint.x - startPoint.x) +
  (endPoint.y - startPoint.y) * (endPoint.y - startPoint.y)
);