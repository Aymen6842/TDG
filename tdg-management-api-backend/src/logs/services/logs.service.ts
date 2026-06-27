import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { NotFoundCustomException } from 'src/common/exceptions/custom-exceptions/not-found.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { LogFileEntry, LogFileInfo, StructuredLog } from '../types/logs.type';
import { TimeService } from 'src/common/time/service/time.service';
import { Response } from 'express';
import { FilterLogsParameters } from '../types/request.type';

@Injectable()
export class LogsService {
  private readonly logsPath = 'logs';

  constructor() {}

  downloadLogFile(folder: string, fileName: string, res: Response) {
    const filePath = path.resolve(this.logsPath, folder, fileName);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundCustomException(
        'Log file does not exist',
        ErrorCode.LOGS_NOT_FOUND,
      );
    }

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/json');

    res.sendFile(filePath);
  }

  parseLogFile(folder: string, fileName: string, query: FilterLogsParameters) {
    // 1️⃣ Pagination setup
    const page = query.page ? parseInt(query.page) : 1;
    let limit = query.limit ? parseInt(query.limit) : 100;
    limit = Math.min(limit, 100); // Enforce hard limit

    const filePath = path.join(this.logsPath, folder, fileName);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundCustomException(
        'Log file does not exist',
        ErrorCode.LOGS_NOT_FOUND,
      );
    }

    // 2️⃣ Read & preprocess lines
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const allLines = fileContent
      .split('\n')
      .filter((line) => line.trim().startsWith('{'))
      .reverse(); // Most recent logs first

    // 4️⃣ Parse, filter, and paginate efficiently
    const logs: StructuredLog[] = [];
    let totalRecords = 0;

    for (const line of allLines) {
      try {
        const parsed = JSON.parse(line) as LogFileEntry;

        if (!this.filterLogs(parsed, query)) continue; // skip non-matching logs
        totalRecords++;

        // Apply pagination manually (avoids building giant arrays)
        const start = (page - 1) * limit;
        const end = start + limit;
        if (totalRecords <= start) continue;
        if (totalRecords > end) break;

        logs.push({
          ip: parsed.ip,
          responseTime: parsed.responseTime
            ? `${parsed.responseTime} ms`
            : 'N/A',
          time: TimeService.getTimeByZoneFromUtcTime(
            parsed.timestamp,
            'Africa/Tunis',
          ),
          level: parsed.level,
          method: parsed.method,
          url: parsed.endpoint,
          statusCode: parsed.statusCode,
          message: parsed.stack
            ? this.extractMessage(parsed.stack)
            : parsed.message || 'Unknown error',
          userId: parsed.stack ? this.extractUserId(parsed.stack) : 'Guest',
          request: {
            body: Object.keys(parsed?.request?.body || {}).length
              ? parsed?.request?.body
              : null,
          },
          response: {
            body: Object.keys(parsed?.response?.body || {}).length
              ? parsed?.response?.body
              : null,
          },
        });
      } catch {
        continue;
      }
    }

    const totalPages = Math.ceil(totalRecords / limit);

    // 5️⃣ Return structured output
    return {
      pagination: {
        records: totalRecords,
        currentPage: page,
        totalPages,
      },
      data: logs,
    };
  }

  listLogsFolders() {
    const result: Record<string, LogFileInfo[]> = {};

    if (!fs.existsSync(this.logsPath)) return result;

    const folders = fs
      .readdirSync(this.logsPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const folder of folders) {
      const folderPath = path.join(this.logsPath, folder);
      const files = fs
        .readdirSync(folderPath)
        .filter(
          (file) =>
            fs.statSync(path.join(folderPath, file)).isFile() &&
            file.startsWith('audit') === false &&
            file.endsWith('.json'),
        )
        .map((fileName) => {
          const filePath = path.join(folderPath, fileName);
          const stats = fs.statSync(filePath);
          const sizeMB = stats.size / (1024 * 1024);
          return {
            name: fileName,
            size: sizeMB.toFixed(2) + ' MB',
            date: TimeService.getTimeByZoneFromUtcTime(
              stats.mtime.toISOString(),
              'Africa/Tunis',
            ),
          };
        });

      result[folder] = files;
    }

    return result;
  }

  private extractMessage(stack: string): string {
    if (!stack) return 'Unknown error';
    const msgMatch = stack.match(/Message:\s*(.*)/);
    return msgMatch ? msgMatch[1].split('\n')[0] : stack.split('\n')[0];
  }

  private extractUserId(stack: string): string | undefined {
    const match = stack.match(/userId[:=]\s?(\w+)/i);
    return match ? match[1] : undefined;
  }

  // 3️⃣ Filter function (centralized)
  filterLogs = (parsed: LogFileEntry, query: FilterLogsParameters): boolean => {
    if (
      query.method &&
      parsed.method?.toLowerCase() !== query.method.toLowerCase()
    )
      return false;

    if (query.statusCode && String(parsed.statusCode) !== query.statusCode)
      return false;

    if (
      query.level &&
      parsed.level?.toLowerCase() !== query.level.toLowerCase()
    )
      return false;

    if (query.userId && parsed.userId !== query.userId) return false;

    if (query.ip && parsed.ip !== query.ip) return false;

    if (query.endpoint) {
      const term = query.endpoint.toLowerCase();
      const endpointMatch = parsed.endpoint?.toLowerCase().includes(term);
      const messageMatch = parsed.message?.toLowerCase().includes(term);
      if (!endpointMatch && !messageMatch) return false;
    }

    return true;
  };
}
