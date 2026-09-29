/**
 * TF-IDF Similarity for Related Hadiths
 * Finds semantically similar hadiths using keyword overlap without AI
 */

import { getAllHadithsForIndexing } from '../db/database.js';

// Simple TF-IDF implementation
class TFIDFSimilarity {
  constructor() {
    this.documents = [];
    this.idf = new Map();
    this.initialized = false;
  }

  /**
   * Initialize with all hadiths
   */
  async initialize() {
    if (this.initialized) return;
    
    const hadiths = getAllHadithsForIndexing();
    this.documents = hadiths;
    
    // Calculate IDF for each term
    const docCount = this.documents.length;
    const termDocCount = new Map();
    
    for (const doc of this.documents) {
      const terms = this.tokenize(doc.text_normalized);
      const uniqueTerms = new Set(terms);
      
      for (const term of uniqueTerms) {
        termDocCount.set(term, (termDocCount.get(term) || 0) + 1);
      }
    }
    
    // Calculate IDF
    for (const [term, count] of termDocCount) {
      this.idf.set(term, Math.log(docCount / count));
    }
    
    this.initialized = true;
    console.log('[Similarity] Initialized with', this.documents.length, 'hadiths');
  }

  /**
   * Tokenize Arabic text
   */
  tokenize(text) {
    if (!text) return [];
    return text
      .split(/\s+/)
      .filter(word => word.length > 2)
      .map(word => word.trim());
  }

  /**
   * Calculate TF for a document
   */
  calculateTF(terms) {
    const tf = new Map();
    const total = terms.length;
    
    for (const term of terms) {
      tf.set(term, (tf.get(term) || 0) + 1);
    }
    
    // Normalize
    for (const [term, count] of tf) {
      tf.set(term, count / total);
    }
    
    return tf;
  }

  /**
   * Calculate cosine similarity between two documents
   */
  cosineSimilarity(doc1Terms, doc2Terms) {
    const tf1 = this.calculateTF(doc1Terms);
    const tf2 = this.calculateTF(doc2Terms);
    
    const allTerms = new Set([...tf1.keys(), ...tf2.keys()]);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (const term of allTerms) {
      const tfidf1 = (tf1.get(term) || 0) * (this.idf.get(term) || 0);
      const tfidf2 = (tf2.get(term) || 0) * (this.idf.get(term) || 0);
      
      dotProduct += tfidf1 * tfidf2;
      norm1 += tfidf1 * tfidf1;
      norm2 += tfidf2 * tfidf2;
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Find similar hadiths
   */
  findSimilar(hadithId, limit = 5) {
    if (!this.initialized) {
      console.warn('[Similarity] Not initialized, call initialize() first');
      return [];
    }
    
    const targetDoc = this.documents.find(d => d.id === hadithId);
    if (!targetDoc) return [];
    
    const targetTerms = this.tokenize(targetDoc.text_normalized);
    
    const similarities = this.documents
      .filter(doc => doc.id !== hadithId) // Exclude self
      .map(doc => {
        const docTerms = this.tokenize(doc.text_normalized);
        const similarity = this.cosineSimilarity(targetTerms, docTerms);
        return { ...doc, similarity };
      })
      .filter(item => item.similarity > 0.1) // Minimum similarity threshold
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    return similarities;
  }
}

// Export singleton
export const similarityEngine = new TFIDFSimilarity();
