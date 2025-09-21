import { useState, useEffect } from 'react';
import { InitializationService, InitializationResult } from '../services';

export interface InitializationStep {
  name: string;
  completed: boolean;
  error?: string;
}

export interface UseAppInitializationResult {
  isInitializing: boolean;
  currentStep: number;
  steps: InitializationStep[];
  result: InitializationResult | null;
  error: string | null;
}

export const useAppInitialization = (): UseAppInitializationResult => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<InitializationStep[]>([
    { name: 'データベース初期化', completed: false },
    { name: '設定読み込み', completed: false },
    { name: 'テーマ設定', completed: false },
  ]);
  const [result, setResult] = useState<InitializationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const initService = InitializationService.getInstance();
        
        // ステップ1: データベース初期化
        setCurrentStep(0);
        await new Promise(resolve => setTimeout(resolve, 400));
        setSteps(prev => prev.map((step, index) => 
          index === 0 ? { ...step, completed: true } : step
        ));

        // ステップ2: 設定読み込み
        setCurrentStep(1);
        await new Promise(resolve => setTimeout(resolve, 400));
        setSteps(prev => prev.map((step, index) => 
          index === 1 ? { ...step, completed: true } : step
        ));

        // ステップ3: テーマ設定
        setCurrentStep(2);
        await new Promise(resolve => setTimeout(resolve, 300));
        setSteps(prev => prev.map((step, index) => 
          index === 2 ? { ...step, completed: true } : step
        ));

        // 実際の初期化処理
        const initResult = await initService.initialize();
        setResult(initResult);

        if (!initResult.success) {
          setError(initResult.error || 'Unknown initialization error');
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Initialization failed';
        setError(errorMessage);
        
        // エラーが発生してもアプリを使用可能にする
        setResult({
          success: false,
          error: errorMessage,
          requiresAuth: false,
          initializationTime: 0,
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  return {
    isInitializing,
    currentStep,
    steps,
    result,
    error,
  };
};