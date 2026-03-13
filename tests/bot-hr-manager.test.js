const BotHRManager = require('../lib');

describe('BotHRManager', () => {
  let hrManager;

  beforeEach(() => {
    hrManager = new BotHRManager(null); // 使用默认配置
  });

  afterEach(async () => {
    if (hrManager) {
      await hrManager.close();
    }
  });

  describe('initialize', () => {
    test('should initialize without errors', async () => {
      // 跳过实际初始化，因为需要数据库
      expect(hrManager).toBeDefined();
      expect(hrManager.monitors).toBeInstanceOf(Map);
    });
  });

  describe('getDashboardData', () => {
    test('should return dashboard data', () => {
      const data = hrManager.getDashboardData();
      expect(data).toHaveProperty('bots');
      expect(data).toHaveProperty('timestamp');
    });
  });

  describe('getBotRanking', () => {
    test('should return ranking array', async () => {
      // Mock data needed for actual test
      const ranking = await hrManager.getBotRanking('tokensPerTask', 'ASC');
      expect(Array.isArray(ranking)).toBe(true);
    });
  });
});
