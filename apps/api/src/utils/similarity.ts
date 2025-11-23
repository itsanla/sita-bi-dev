'use client';

import type { Pipeline } from '@xenova/transformers';
import { pipeline } from '@xenova/transformers';

// Helper function to compute cosine similarity
function cosineSimilarity(v1: number[], v2: number[]): number {
  const dotProduct = v1.reduce((sum, a, i) => sum + a * (v2[i] ?? 0), 0);
  const magnitude1 = Math.sqrt(v1.reduce((sum, a) => sum + a * a, 0));
  const magnitude2 = Math.sqrt(v2.reduce((sum, a) => sum + a * a, 0));
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  return dotProduct / (magnitude1 * magnitude2);
}

const SimilarityPipeline = {
  task: 'feature-extraction' as const,
  model: 'Xenova/all-MiniLM-L6-v2',
  instance: null as Pipeline | null,

  async getInstance(progress_callback?: () => void): Promise<Pipeline> {
    if (!this.instance) {
      const options = progress_callback ? { progress_callback } : {};
      this.instance = (await pipeline(
        this.task,
        this.model,
        options,
      )) as Pipeline;
    }
    return this.instance;
  },
};

// Batched and improved version
export async function calculateSimilarities(
  newTitle: string,
  existingTitles: { id: number; judul: string }[],
): Promise<{ id: number; judul: string; similarity: number }[]> {
  const extractor = await SimilarityPipeline.getInstance();

  if (existingTitles.length === 0) {
    return [];
  }

  // Create a single batch of all texts to be processed
  const texts = [newTitle, ...existingTitles.map((t) => t.judul)];

  // Generate embeddings for all texts in one go
  const embeddings = await extractor(texts, {
    pooling: 'mean',
    normalize: true,
  });

  // Extract the embedding for the new title (it's the first one)
  const newTitleEmbedding = Array.from(embeddings[0]?.data ?? []).map(
    (val: unknown) => Number(val),
  );

  const results = [];

  // Compare the new title with all existing titles
  for (let i = 0; i < existingTitles.length; i++) {
    const embeddingData = embeddings[i + 1]?.data ?? [];
    const existingTitleEmbedding = embeddingData.map((val: unknown) =>
      Number(val),
    ) as number[];
    const similarity = cosineSimilarity(
      newTitleEmbedding,
      existingTitleEmbedding,
    );

    const title = existingTitles[i];
    if (title) {
      results.push({
        id: title.id,
        judul: title.judul,
        similarity: Math.round(similarity * 100),
      });
    }
  }

  // Sort by similarity and return
  return results.sort((a, b) => b.similarity - a.similarity);
}
