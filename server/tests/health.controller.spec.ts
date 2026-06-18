import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { HealthController } from '../src/health/health.controller';

describe('HealthController', () => {
  async function build(readyState: number) {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: getConnectionToken(), useValue: { readyState } }],
    }).compile();
    return module.get<HealthController>(HealthController);
  }

  it('reports ok when the DB connection is up (readyState=1)', async () => {
    const controller = await build(1);
    const res = controller.check();
    expect(res.status).toBe('ok');
    expect(res.db).toBe('connected');
  });

  it('reports degraded when the DB is not connected', async () => {
    const controller = await build(0);
    const res = controller.check();
    expect(res.status).toBe('degraded');
    expect(res.db).toBe('disconnected');
  });
});
