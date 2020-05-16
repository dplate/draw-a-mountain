import loadParts from "./loadParts.js";
import createPerson from "./createPerson.js";
import updatePerson from "./updatePerson.js";
import animatePerson from "./animatePerson.js";
import createPersonGroup from "./createPersonGroup.js";
import removePerson from "./removePerson.js";

export default async (scene, paths, dispatcher) => {
  const parts = await loadParts();
  const persons = [];
  let waitTimeForNextGroup = 0;

  dispatcher.listen('persons', 'animate', async ({elapsedTime}) => {
    if (waitTimeForNextGroup <= 0) {
      waitTimeForNextGroup = 10000;
      const group = createPersonGroup(scene, parts);
      group.forEach(person => persons.push(person));
      await paths.handlePersonGroup(group);
      group.forEach(person => {
        removePerson(scene, person);
        persons.splice(persons.indexOf(person), 1);
      });
    }
    waitTimeForNextGroup -= elapsedTime;

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