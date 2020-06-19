let constructionInstancedAudio = null;

export default async (sound) => {
  if (!constructionInstancedAudio) {
    constructionInstancedAudio = await sound.loadInstancedAudio('common/construction');
  }
  return constructionInstancedAudio.addInstance();
}