export default (train) => {
  train.data.cargos.forEach((cargo, cargoIndex) => {
    cargo.position.x = train.positionX + cargo.scale.x * 0.495 - cargo.scale.x * 0.65 * (cargoIndex + 1);
  });
};