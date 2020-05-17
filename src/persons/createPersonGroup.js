import createPerson from "./createPerson.js";

export default (scene, parts) => {
  const group = [];
  for (let i = 0; i < 1 + Math.floor(Math.random() * 3); i++) {
    const navigator = i === 0;
    let baseSpeed, scale;
    if (i > 0 && Math.random() < 0.5) {
      scale = 0.6 + Math.random() * 0.2;
      baseSpeed = Math.random() < 0.25 ? 0.0005 : 0.0015;
    } else {
      baseSpeed = 0.0005 + Math.random() * 0.001;
      scale = 0.8 + Math.random() * 0.2;
    }
    const person = createPerson(scene, parts, navigator, baseSpeed, scale);
    group.push(person);
  }
  return group;
};