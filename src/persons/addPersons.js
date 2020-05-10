import loadParts from "./loadParts.js";
import createPerson from "./createPerson.js";
import updatePerson from "./updatePerson.js";

export default async (scene, dispatcher) => {
  const parts = await loadParts();
  const persons = [];

  dispatcher.listen('persons', 'animate', ({elapsedTime}) => {
    persons.forEach(person => {
      updatePerson(person, elapsedTime);
    });
  });

  return {
    add: () => {
      persons.push(createPerson(scene, parts));
    }
  }
};