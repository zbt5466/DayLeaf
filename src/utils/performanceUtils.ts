/**
 * Performance utilities for monitoring and optimizing app startup time
 */

export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  phase: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private readonly MAX_STARTUP_TIME = 3000; // 3 seconds as per requirements

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public startPhase(phase: string): void {
    this.metrics.set(phase, {
      startTime: Date.now(),
      phase,
    });
  }

  public endPhase(phase: string): number {
    const metric = this.metrics.get(phase);
    if (!metric) {
      console.warn(`Performance phase '${phase}' was not started`);
      return 0;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    this.metrics.set(phase, {
      ...metric,
      endTime,
      duration,
    });

    return duration;
  }

  public getPhaseMetrics(phase: string): PerformanceMetrics | undefined {
    return this.metrics.get(phase);
  }

  public getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  public getTotalStartupTime(): number {
    const appStartMetric = this.metrics.get('app-startup');
    return appStartMetric?.duration || 0;
  }

  public isStartupTimeWithinRequirement(): boolean {
    const totalTime = this.getTotalStartupTime();
    return totalTime <= this.MAX_STARTUP_TIME;
  }

  public logPerformanceReport(): void {
    console.log('=== Performance Report ===');
    
    for (const [phase, metric] of this.metrics) {
      if (metric.duration) {
        const status = metric.duration > 1000 ? '⚠️' : '✅';
        console.log(`${status} ${phase}: ${metric.duration}ms`);
      }
    }

    const totalTime = this.getTotalStartupTime();
    if (totalTime > 0) {
      const withinRequirement = this.isStartupTimeWithinRequirement();
      const status = withinRequirement ? '✅' : '❌';
      console.log(`${status} Total startup time: ${totalTime}ms (requirement: ${this.MAX_STARTUP_TIME}ms)`);
    }

    console.log('========================');
  }

  public reset(): void {
    this.metrics.clear();
  }
}

/**
 * Utility function to measure async operation performance
 */
export async function measureAsync<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    console.log(`⏱️ ${operationName}: ${duration}ms`);
    
    return { result, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${operationName} failed after ${duration}ms:`, error);
    throw error;
  }
}

/**
 * Utility function to add artificial delay for minimum display time
 */
export async function ensureMinimumDisplayTime(
  startTime: number,
  minimumTime: number
): Promise<void> {
  const elapsed = Date.now() - startTime;
  const remaining = minimumTime - elapsed;
  
  if (remaining > 0) {
    await new Promise(resolve => setTimeout(resolve, remaining));
  }
}

/**
 * Utility function to check if operation exceeds maximum allowed time
 */
export function checkTimeLimit(
  startTime: number,
  maxTime: number,
  operationName: string
): boolean {
  const elapsed = Date.now() - startTime;
  const exceeded = elapsed > maxTime;
  
  if (exceeded) {
    console.warn(`⚠️ ${operationName} exceeded time limit: ${elapsed}ms > ${maxTime}ms`);
  }
  
  return !exceeded;
}