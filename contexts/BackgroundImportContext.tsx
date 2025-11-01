'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { DocumentType, ImportSession } from '@/features/import/types/import.types';
import { importService } from '@/features/import/_api/import.service';
import { propertiesSupabaseService } from '@/features/library/_api/properties-supabase.service';

interface BatchFile {
  file: File;
  documentType: DocumentType;
}

interface BackgroundImportState {
  isProcessing: boolean;
  totalFiles: number;
  processedFiles: number;
  currentFileIndex: number | null;
  currentFileName: string | null;
  completedFiles: string[];
  error: string | null;
  targetPropertyId: string | null;
  duplicateDetected: boolean;
  duplicateAddress: string | null;
}

interface BackgroundImportContextType {
  state: BackgroundImportState;
  startBatchImport: (
    files: BatchFile[],
    mergeMode: 'new' | 'existing',
    selectedPropertyId: string | null,
    apiKey: string,
    provider: string,
    model: string | undefined,
    locale: string
  ) => Promise<void>;
  cancelImport: () => void;
  clearState: () => void;
}

const BackgroundImportContext = createContext<BackgroundImportContextType | undefined>(undefined);

const initialState: BackgroundImportState = {
  isProcessing: false,
  totalFiles: 0,
  processedFiles: 0,
  currentFileIndex: null,
  currentFileName: null,
  completedFiles: [],
  error: null,
  targetPropertyId: null,
  duplicateDetected: false,
  duplicateAddress: null,
};

export function BackgroundImportProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BackgroundImportState>(initialState);
  const cancelRef = useRef<boolean>(false);

  const startBatchImport = useCallback(
    async (
      files: BatchFile[],
      mergeMode: 'new' | 'existing',
      selectedPropertyId: string | null,
      apiKey: string,
      provider: string,
      model: string | undefined,
      locale: string
    ) => {
      // Prevent starting a new import if one is already running
      if (state.isProcessing) {
        console.warn('Cannot start new import: another import is already in progress');
        throw new Error(locale === 'fr'
          ? 'Un import est déjà en cours. Veuillez attendre qu\'il se termine ou l\'annuler.'
          : 'An import is already in progress. Please wait for it to finish or cancel it.'
        );
      }

      cancelRef.current = false;

      setState({
        isProcessing: true,
        totalFiles: files.length,
        processedFiles: 0,
        currentFileIndex: null,
        currentFileName: null,
        completedFiles: [],
        error: null,
        targetPropertyId: selectedPropertyId,
      });

      let targetPropertyId = selectedPropertyId;

      try {
        // Convert File objects to ArrayBuffers BEFORE processing
        // This ensures files persist even if user navigates away
        const serializedFiles = await Promise.all(
          files.map(async ({ file, documentType }) => {
            const arrayBuffer = await file.arrayBuffer();
            return {
              name: file.name,
              type: file.type,
              arrayBuffer,
              documentType,
            };
          })
        );

        // Process files sequentially
        for (let i = 0; i < serializedFiles.length; i++) {
          // Check if cancelled
          if (cancelRef.current) {
            setState(prev => ({
              ...prev,
              isProcessing: false,
              error: locale === 'fr' ? 'Import annulé' : 'Import cancelled',
            }));
            return;
          }

          const { name, type, arrayBuffer, documentType } = serializedFiles[i];

          setState(prev => ({
            ...prev,
            currentFileIndex: i,
            currentFileName: name,
          }));

          // Reconstruct File object from ArrayBuffer
          const file = new File([arrayBuffer], name, { type });

          // Extract data from PDF
          const session: ImportSession = await importService.processPDF(
            file,
            documentType,
            apiKey,
            provider,
            model
          );

          // If first file and creating new property, check for duplicates first
          if (i === 0 && mergeMode === 'new') {
            // Check if property already exists by address
            let existingProperty = null;
            if (session.extractedData?.address) {
              existingProperty = await propertiesSupabaseService.findByAddress(
                session.extractedData.address
              );
            }

            if (existingProperty) {
              // Duplicate found - merge into existing property instead of creating new
              console.log('Duplicate property found, merging instead of creating:', existingProperty.adresse);
              targetPropertyId = existingProperty.id;
              await importService.mergePropertyData(targetPropertyId, session);
              setState(prev => ({
                ...prev,
                targetPropertyId,
                duplicateDetected: true,
                duplicateAddress: existingProperty.adresse || null,
              }));
            } else {
              // No duplicate - create new property
              const propertyId = await importService.createPropertyFromImport(session);
              if (propertyId) {
                targetPropertyId = propertyId;
                setState(prev => ({
                  ...prev,
                  targetPropertyId: propertyId,
                }));
              }
            }
          } else if (targetPropertyId) {
            // Merge subsequent files into the target property
            await importService.mergePropertyData(targetPropertyId, session);
          }

          // Update progress
          setState(prev => ({
            ...prev,
            processedFiles: i + 1,
            completedFiles: [...prev.completedFiles, name],
          }));
        }

        // Success - all files processed
        setState(prev => ({
          ...prev,
          isProcessing: false,
          currentFileIndex: null,
          currentFileName: null,
        }));

        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Import Completed', {
            body: locale === 'fr'
              ? `${files.length} document(s) importé(s) avec succès!`
              : `${files.length} document(s) imported successfully!`,
            icon: '/logo.png',
          });
        }
      } catch (err) {
        console.error('Background import error:', err);
        setState(prev => ({
          ...prev,
          isProcessing: false,
          currentFileIndex: null,
          currentFileName: null,
          error: locale === 'fr' ? 'Échec du traitement par lots' : 'Batch processing failed',
        }));
      }
    },
    [state.isProcessing] // Include state.isProcessing in dependencies
  );

  const cancelImport = useCallback(() => {
    cancelRef.current = true;
  }, []);

  const clearState = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <BackgroundImportContext.Provider
      value={{
        state,
        startBatchImport,
        cancelImport,
        clearState,
      }}
    >
      {children}
    </BackgroundImportContext.Provider>
  );
}

export function useBackgroundImport() {
  const context = useContext(BackgroundImportContext);
  if (context === undefined) {
    throw new Error('useBackgroundImport must be used within a BackgroundImportProvider');
  }
  return context;
}
