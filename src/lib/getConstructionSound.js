let constructionInstancedSound = null;

export default async (audio) => {
  if (!constructionInstancedSound) {
    constructionInstancedSound = await audio.loadInstanced('common/construction');
  }
  return constructionInstancedSound.addInstance();
}