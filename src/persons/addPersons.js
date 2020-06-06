import loadParts from './loadParts.js';
import updatePerson from './updatePerson.js';
import animatePerson from './animatePerson.js';
import createPersonGroup from './createPersonGroup.js';
import removePerson from './removePerson.js';

export default async (scene, dispatcher) => {
  const parts = await loadParts();
  const persons = [];

  dispatcher.listen('persons', 'animate', async ({elapsedTime}) => {
    persons.forEach(person => {
      animatePerson(person, elapsedTime);
      updatePerson(person);
    });
  });

  return {
    createGroup: () => {
      const group = createPersonGroup(scene, parts);
      group.forEach(person => persons.push(person));
      return group;
    },
    removeGroup: (group) => {
      group.forEach(person => {
        removePerson(scene, person);
        persons.splice(persons.indexOf(person), 1);
      });
    }
  }
};