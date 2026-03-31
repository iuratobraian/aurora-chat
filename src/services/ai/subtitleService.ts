import type { TranscriptSegment } from './youtubeService';

export type SubtitleFormat = 'srt' | 'vtt';

export interface SubtitleOptions {
  format: SubtitleFormat;
  language?: string;
  label?: string;
}

function formatTimeSRT(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

function formatTimeVTT(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

export function generateSRT(transcripts: TranscriptSegment[]): string {
  let srt = '';
  
  transcripts.forEach((segment, index) => {
    const startTime = formatTimeSRT(segment.start);
    const endTime = formatTimeSRT(segment.start + segment.duration);
    
    srt += `${index + 1}\n`;
    srt += `${startTime} --> ${endTime}\n`;
    srt += `${segment.text}\n\n`;
  });
  
  return srt;
}

export function generateVTT(transcripts: TranscriptSegment[], options: Partial<SubtitleOptions> = {}): string {
  let vtt = 'WEBVTT\n\n';
  
  if (options.language || options.label) {
    vtt += `NOTE ${options.language || 'unknown'}${options.label ? ` - ${options.label}` : ''}\n\n`;
  }
  
  transcripts.forEach((segment, index) => {
    const startTime = formatTimeVTT(segment.start);
    const endTime = formatTimeVTT(segment.start + segment.duration);
    
    vtt += `${index + 1}\n`;
    vtt += `${startTime} --> ${endTime}\n`;
    vtt += `${segment.text}\n\n`;
  });
  
  return vtt;
}

export function generateSubtitles(
  transcripts: TranscriptSegment[],
  format: SubtitleFormat,
  options: Partial<SubtitleOptions> = {}
): string {
  switch (format) {
    case 'srt':
      return generateSRT(transcripts);
    case 'vtt':
      return generateVTT(transcripts, options);
    default:
      return generateSRT(transcripts);
  }
}

export function downloadSubtitles(
  transcripts: TranscriptSegment[],
  format: SubtitleFormat,
  videoTitle: string
): void {
  const content = generateSubtitles(transcripts, format, { label: videoTitle });
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(videoTitle)}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 100);
}

export function mergeShortSegments(transcripts: TranscriptSegment[], minDuration: number = 2): TranscriptSegment[] {
  if (transcripts.length === 0) return [];
  
  const merged: TranscriptSegment[] = [];
  let currentSegment: TranscriptSegment = { ...transcripts[0] };
  
  for (let i = 1; i < transcripts.length; i++) {
    const segment = transcripts[i];
    
    if (segment.text.trim() === '' || currentSegment.text.trim() === '') {
      merged.push(currentSegment);
      currentSegment = { ...segment };
      continue;
    }
    
    if (currentSegment.duration < minDuration) {
      currentSegment = {
        ...currentSegment,
        text: currentSegment.text + ' ' + segment.text,
        duration: currentSegment.duration + segment.duration,
      };
    } else {
      merged.push(currentSegment);
      currentSegment = { ...segment };
    }
  }
  
  merged.push(currentSegment);
  return merged;
}
