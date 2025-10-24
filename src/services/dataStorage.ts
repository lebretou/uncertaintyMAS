import { nanoid } from 'nanoid';

/**
 * Data storage utilities for managing CSV files and temporary data
 */

export interface StoredDataFile {
  filePath: string;
  fileName: string;
  timestamp: string;
  sizeBytes: number;
}

// In-memory storage for CSV data (in production, this would use a real file system or database)
const dataStore = new Map<string, { content: string; metadata: StoredDataFile }>();

/**
 * Save CSV data to storage and return a file reference
 */
export function saveCSVData(csvContent: string, originalFileName?: string): StoredDataFile {
  const fileId = nanoid();
  const timestamp = new Date().toISOString();

  // Create a virtual file path (in browser context)
  const filePath = `/tmp/data_${fileId}.csv`;

  const metadata: StoredDataFile = {
    filePath,
    fileName: originalFileName || `dataset_${fileId}.csv`,
    timestamp,
    sizeBytes: new Blob([csvContent]).size,
  };

  // Store the data
  dataStore.set(filePath, {
    content: csvContent,
    metadata,
  });

  console.log(`Saved CSV data to ${filePath} (${metadata.sizeBytes} bytes)`);

  return metadata;
}

/**
 * Retrieve CSV data by file path
 */
export function getCSVData(filePath: string): string | null {
  const stored = dataStore.get(filePath);
  return stored?.content || null;
}

/**
 * Get file metadata
 */
export function getFileMetadata(filePath: string): StoredDataFile | null {
  const stored = dataStore.get(filePath);
  return stored?.metadata || null;
}

/**
 * Delete stored data
 */
export function deleteCSVData(filePath: string): boolean {
  return dataStore.delete(filePath);
}

/**
 * Clear all stored data
 */
export function clearAllData(): void {
  dataStore.clear();
}

/**
 * Get all stored file paths
 */
export function getAllFilePaths(): string[] {
  return Array.from(dataStore.keys());
}

/**
 * Save cleaned/processed data to storage
 */
export function saveProcessedData(data: string, baseFileName: string, suffix: string = 'cleaned'): StoredDataFile {
  const fileId = nanoid();
  const timestamp = new Date().toISOString();

  // Create a virtual file path
  const filePath = `/tmp/${baseFileName}_${suffix}_${fileId}.parquet`;

  const metadata: StoredDataFile = {
    filePath,
    fileName: `${baseFileName}_${suffix}.parquet`,
    timestamp,
    sizeBytes: new Blob([data]).size,
  };

  dataStore.set(filePath, {
    content: data,
    metadata,
  });

  console.log(`Saved processed data to ${filePath} (${metadata.sizeBytes} bytes)`);

  return metadata;
}
