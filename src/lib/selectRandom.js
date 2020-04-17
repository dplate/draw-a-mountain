const calcSmoothWeight = (value, {minimum, optimum, maximum}) => {
  if (value === optimum) {
    return 1;
  }
  const normalizedOptimumDistance = value < optimum ?
    1 - (optimum - value) / (optimum - minimum) :
    1 + (value - optimum) / (maximum - optimum);

  return 1 + (-1 - Math.cos(normalizedOptimumDistance * Math.PI)) / 2;
}

export default (items, height, slope) => {
  const possibleItems = items.filter(item =>
    height >= item.distribution.height.minimum && height <= item.distribution.height.maximum &&
    slope >= item.distribution.slope.minimum && slope <= item.distribution.slope.maximum
  );
  const weights = possibleItems.map(item =>
    calcSmoothWeight(height, item.distribution.height) * calcSmoothWeight(slope, item.distribution.slope)
  );

  const sumOfWeights = weights.reduce((sum, weight) => sum + weight, 0);
  const maxOfWeights = weights.reduce((max, weight) => Math.max(max, weight), 0);
  const randomValue = Math.random() * sumOfWeights;

  let sumOfCheckedWeights = 0;
  for (let i = 0; i < weights.length; i++) {
    sumOfCheckedWeights += weights[i];
    if (randomValue <= sumOfCheckedWeights) {
      return {item: possibleItems[i], propability: maxOfWeights};
    }
  }
  return {item: null, weight: 0};
};