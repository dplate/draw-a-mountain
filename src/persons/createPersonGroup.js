import createPerson from "./createPerson.js";

export default (scene, parts) => {
  const group = [];
  for (let i = 0; i < 1 + Math.floor(Math.random() * 3); i++) {
    const person = createPerson(scene, parts);
    group.push(person);
  }
  return group;
};