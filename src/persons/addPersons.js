import loadParts from "./loadParts.js";
import createPerson from "./createPerson.js";
import updatePerson from "./updatePerson.js";
import animatePerson from "./animatePerson.js";

export default async (scene, dispatcher) => {
  const parts = await loadParts();
  const persons = [];

  dispatcher.listen('persons', 'animate', ({elapsedTime}) => {
    persons.forEach(person => {
      animatePerson(person, elapsedTime);
      updatePerson(person);
    });
  });

  return {
    add: () => {
      const person = createPerson(scene, parts);
      persons.push(person);
      return person;
    }
  }
};