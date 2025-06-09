import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { Job } from '../cronjob.ts';
import { spawn } from 'child_process';
import logger from '../../core/logger.ts';

vi.mock('child_process', () => ({
    spawn: vi.fn()
}));

vi.mock('../../core/logger', () => ({
    default: {
        error: vi.fn(),
        info: vi.fn()
    }
}));

describe('Job', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a job with name only', () => {
        const job = new Job({ name: 'test-job' });
        expect(job.name).toBe('test-job');
        expect(job.task).toBeUndefined();
        expect(job.jobFile).toBeUndefined();
    });

    it('should create a job with task', async () => {
        const mockTask = vi.fn().mockResolvedValue(undefined);
        const job = new Job({ name: 'test-job', task: mockTask });
        
        await job.run();
        
        expect(mockTask).toHaveBeenCalledTimes(1);
    });

    it('should run job from file', async () => {
        const mockSpawn = spawn as Mock;
        const mockEventEmitter = {
            on: vi.fn((event, callback) => {
                if (event === 'close') setTimeout(() => callback(0), 0);
                return mockEventEmitter;
            }),
            pid: 123
        };
        mockSpawn.mockReturnValue(mockEventEmitter);

        const job = new Job({ name: 'test-job', jobFile: 'test.js' });
        
        const runPromise = job.run();
        await runPromise;

        expect(mockSpawn).toHaveBeenCalledWith(
            'node',
            ['--experimental-strip-types', 'test.js'],
            expect.any(Object)
        );
        expect(logger.info).toHaveBeenCalledWith(
            'Running job test-job from file: test.js in new process'
        );
    });

    it('should reject when no task or job file is specified', async () => {
        const job = new Job({ name: 'test-job' });
        
        await expect(job.run()).rejects.toThrow(
            'No task or job file specified for job test-job'
        );
        expect(logger.error).toHaveBeenCalledWith(
            'No task or job file specified for job test-job'
        );
    });

    it('should reject when job process fails', async () => {
        const mockSpawn = spawn as Mock;
        const mockError = new Error('Process failed');
        const mockEventEmitter = {
            on: vi.fn((event, callback) => {
                if (event === 'error') setTimeout(() => callback(mockError), 0);
                return mockEventEmitter;
            }),
            pid: 123
        };
        mockSpawn.mockReturnValue(mockEventEmitter);

        const job = new Job({ name: 'test-job', jobFile: 'test.js' });
        
        await expect(job.run()).rejects.toThrow('Process failed');
        expect(logger.error).toHaveBeenCalledWith(
            mockError,
            'Error running job test-job:'
        );
    });
});