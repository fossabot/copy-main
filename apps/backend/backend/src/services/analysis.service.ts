import { PipelineInput, PipelineRunResult, Station1Output, StationOutput } from '@/types';
import { GeminiService } from './gemini.service';
import { logger } from '@/utils/logger';
import { multiAgentOrchestrator, TaskType } from './agents';

/**
 * خدمة تحليل السيناريوهات الدرامية (Analysis Service)
 */
export class AnalysisService {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  /**
   * تشغيل خط الإنتاج الكامل باستخدام نظام الوكلاء المتعددين
   */
  async runFullPipeline(input: PipelineInput): Promise<PipelineRunResult> {
    const startTime = Date.now();
    logger.info('Starting multi-agent analysis pipeline', { projectName: input.projectName });

    try {
      const agentTasks: TaskType[] = [
        TaskType.CHARACTER_DEEP_ANALYZER,
        TaskType.DIALOGUE_ADVANCED_ANALYZER,
        TaskType.VISUAL_CINEMATIC_ANALYZER,
        TaskType.THEMES_MESSAGES_ANALYZER,
        TaskType.CULTURAL_HISTORICAL_ANALYZER,
        TaskType.PRODUCIBILITY_ANALYZER,
        TaskType.TARGET_AUDIENCE_ANALYZER,
      ];

      const orchestrationResult = await multiAgentOrchestrator.executeAgents({
        fullText: input.fullText,
        projectName: input.projectName,
        taskTypes: agentTasks,
        context: {
          projectName: input.projectName,
          language: input.language,
          ...input.context,
        },
        options: {
          parallel: true,
          includeMetadata: true,
        },
      });

      const stationOutputs = this.convertAgentResultsToStations(orchestrationResult);

      const endTime = Date.now();

      return {
        stationOutputs,
        pipelineMetadata: {
          stationsCompleted: 7,
          totalExecutionTime: orchestrationResult.summary.totalExecutionTime,
          startedAt: orchestrationResult.metadata?.startedAt || new Date(startTime).toISOString(),
          finishedAt: orchestrationResult.metadata?.finishedAt || new Date(endTime).toISOString(),
          agentsUsed: agentTasks.length,
          averageConfidence: orchestrationResult.summary.averageConfidence,
          successfulAgents: orchestrationResult.summary.successfulTasks,
        },
      };
    } catch (error) {
      logger.error('Multi-agent pipeline execution failed:', error);
      throw error;
    }
  }

  /**
   * تحويل نتائج الوكلاء لصيغة المحطات السبع
   */
  private convertAgentResultsToStations(orchestrationResult: any): {
    station1: Station1Output;
    station2: StationOutput;
    station3: StationOutput;
    station4: StationOutput;
    station5: StationOutput;
    station6: StationOutput;
    station7: StationOutput;
  } {
    const results = orchestrationResult.results;

    const characterAnalysis = results.get(TaskType.CHARACTER_DEEP_ANALYZER);
    const dialogueAnalysis = results.get(TaskType.DIALOGUE_ADVANCED_ANALYZER);
    const visualAnalysis = results.get(TaskType.VISUAL_CINEMATIC_ANALYZER);
    const themesAnalysis = results.get(TaskType.THEMES_MESSAGES_ANALYZER);
    const culturalAnalysis = results.get(TaskType.CULTURAL_HISTORICAL_ANALYZER);
    const producibilityAnalysis = results.get(TaskType.PRODUCIBILITY_ANALYZER);
    const audienceAnalysis = results.get(TaskType.TARGET_AUDIENCE_ANALYZER);

    const station1: Station1Output = {
      stationId: 1,
      stationName: 'التحليل العميق للشخصيات',
      executionTime: characterAnalysis?.metadata?.processingTime || 0,
      status: 'completed',
      timestamp: new Date().toISOString(),
      majorCharacters: this.extractCharactersFromAnalysis(characterAnalysis?.text || ''),
      relationships: [],
      narrativeStyleAnalysis: {
        overallTone: 'درامي',
        pacing: 'متوسط',
        complexity: 8,
      },
      details: {
        fullAnalysis: characterAnalysis?.text || '',
        confidence: characterAnalysis?.confidence || 0,
        notes: characterAnalysis?.notes || [],
      },
    };

    const station2: StationOutput = {
      stationId: 2,
      stationName: 'التحليل المتقدم للحوار',
      executionTime: dialogueAnalysis?.metadata?.processingTime || 0,
      status: 'completed',
      timestamp: new Date().toISOString(),
      details: {
        fullAnalysis: dialogueAnalysis?.text || '',
        confidence: dialogueAnalysis?.confidence || 0,
        notes: dialogueAnalysis?.notes || [],
      },
    };

    const station3: StationOutput = {
      stationId: 3,
      stationName: 'التحليل البصري والسينمائي',
      executionTime: visualAnalysis?.metadata?.processingTime || 0,
      status: 'completed',
      timestamp: new Date().toISOString(),
      details: {
        fullAnalysis: visualAnalysis?.text || '',
        confidence: visualAnalysis?.confidence || 0,
        notes: visualAnalysis?.notes || [],
      },
    };

    const station4: StationOutput = {
      stationId: 4,
      stationName: 'تحليل الموضوعات والرسائل',
      executionTime: themesAnalysis?.metadata?.processingTime || 0,
      status: 'completed',
      timestamp: new Date().toISOString(),
      details: {
        fullAnalysis: themesAnalysis?.text || '',
        confidence: themesAnalysis?.confidence || 0,
        notes: themesAnalysis?.notes || [],
      },
    };

    const station5: StationOutput = {
      stationId: 5,
      stationName: 'التحليل الثقافي والتاريخي',
      executionTime: culturalAnalysis?.metadata?.processingTime || 0,
      status: 'completed',
      timestamp: new Date().toISOString(),
      details: {
        fullAnalysis: culturalAnalysis?.text || '',
        confidence: culturalAnalysis?.confidence || 0,
        notes: culturalAnalysis?.notes || [],
      },
    };

    const station6: StationOutput = {
      stationId: 6,
      stationName: 'تحليل قابلية الإنتاج',
      executionTime: producibilityAnalysis?.metadata?.processingTime || 0,
      status: 'completed',
      timestamp: new Date().toISOString(),
      details: {
        fullAnalysis: producibilityAnalysis?.text || '',
        confidence: producibilityAnalysis?.confidence || 0,
        notes: producibilityAnalysis?.notes || [],
      },
    };

    const station7: StationOutput = {
      stationId: 7,
      stationName: 'تحليل الجمهور المستهدف والتقرير النهائي',
      executionTime: audienceAnalysis?.metadata?.processingTime || 0,
      status: 'completed',
      timestamp: new Date().toISOString(),
      details: {
        fullAnalysis: audienceAnalysis?.text || '',
        confidence: audienceAnalysis?.confidence || 0,
        notes: audienceAnalysis?.notes || [],
        finalReport: this.generateFinalReport(results),
      },
    };

    return {
      station1,
      station2,
      station3,
      station4,
      station5,
      station6,
      station7,
    };
  }

  private extractCharactersFromAnalysis(analysisText: string): string[] {
    const characters: string[] = [];
    const lines = analysisText.split('\n');

    for (const line of lines) {
      if (line.includes('شخصية') || line.includes('الشخصيات') || line.includes('البطل')) {
        const matches = line.match(/[\u0600-\u06FF\s]+/g);
        if (matches) {
          characters.push(...matches.filter((m) => m.trim().length > 2));
        }
      }
    }

    return [...new Set(characters)].slice(0, 10);
  }

  private generateFinalReport(results: Map<TaskType, any>): string {
    let report = '# التقرير التحليلي الشامل\n\n';

    const agentNames = [
      { type: TaskType.CHARACTER_DEEP_ANALYZER, title: '## تحليل الشخصيات' },
      { type: TaskType.DIALOGUE_ADVANCED_ANALYZER, title: '## تحليل الحوار' },
      { type: TaskType.VISUAL_CINEMATIC_ANALYZER, title: '## التحليل البصري' },
      { type: TaskType.THEMES_MESSAGES_ANALYZER, title: '## الموضوعات والرسائل' },
      { type: TaskType.CULTURAL_HISTORICAL_ANALYZER, title: '## السياق الثقافي' },
      { type: TaskType.PRODUCIBILITY_ANALYZER, title: '## قابلية الإنتاج' },
      { type: TaskType.TARGET_AUDIENCE_ANALYZER, title: '## الجمهور المستهدف' },
    ];

    for (const agent of agentNames) {
      const result = results.get(agent.type);
      if (result?.text) {
        report += `${agent.title}\n${result.text.substring(0, 500)}...\n\n`;
      }
    }

    report += '## الخلاصة\n';
    report += 'تم إجراء تحليل شامل باستخدام نظام الوكلاء المتعددين المتقدم.\n';

    return report;
  }
}