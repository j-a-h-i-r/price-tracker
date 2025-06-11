import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { Job } from '../job.ts';
import { spawn } from 'child_process';
import { SanboxedTask, type Task } from '../task.ts';

vi.mock('child_process', () => ({
    spawn: vi.fn()
}));

vi.mock('../../core/logger', () => ({
    default: {
        error: vi.fn(),
        info: vi.fn()
    }
}));

const mockTask: Task = {
    run: vi.fn().mockResolvedValue(undefined)
};

describe('Job', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a job with task', async () => {
        const job = new Job({ name: 'test-job', task: mockTask });
        await job.run();
        expect(mockTask.run).toHaveBeenCalledTimes(1);
    });

    it('should run job from file', async () => {
        const mockSpawn = spawn as Mock;
        // Create a proper mock for ChildProcess
        const mockChildProcess = {
            on: vi.fn((event, callback) => {
                if (event === 'close') setTimeout(() => callback(0), 0);
                return mockChildProcess;
            }),
            pid: 123,
            stderr: { on: vi.fn() },
            stdout: { on: vi.fn() }
        };
        mockSpawn.mockReturnValue(mockChildProcess);

        const mock = new SanboxedTask('some.file.ts');

        const job = new Job({ name: 'test-job', task: mock });
        await job.run();

        expect(mockSpawn).toHaveBeenCalledWith(
            'node',
            ['--experimental-strip-types', 'some.file.ts'],
            expect.any(Object)
        );
    });

    it('should reject when job process fails', async () => {
        const mockSpawn = spawn as Mock;
        const mockError = new Error('Process failed');
        const mockChildProcess = {
            on: vi.fn((event, callback) => {
                if (event === 'error') setTimeout(() => callback(mockError), 0);
                return mockChildProcess;
            }),
            pid: 123,
            stderr: { on: vi.fn() },
            stdout: { on: vi.fn() }
        };
        mockSpawn.mockReturnValue(mockChildProcess);
        
        const mock = vi.mockObject(new SanboxedTask('some.file.ts'));
        mock.run.mockRejectedValue(mockError);

        const job = new Job({ name: 'test-job', task: mock });
        
        await expect(job.run()).rejects.toThrow('Process failed');
    });
});