/**
 * 模拟数据生成
 * 使用异步方式模拟真实API调用
 */

import BitSet from './bitset';

/**
 * 异步加载场馆信息 - 模拟API调用延迟500ms
 */
export function loadHallInfoAsync() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'hall-001',
        name: '天佑会堂',
        description: '大型演艺中心',
        totalRows: 100,
        totalCols: 30,
        totalSeats: 3000,
        sections: [
          { id: 'A', name: 'A区', rows: [0, 10], cols: [0, 30], grade: 'VIP', basePrice: 380 },
          { id: 'B', name: 'B区', rows: [11, 30], cols: [0, 30], grade: 'standard', basePrice: 280 },
          { id: 'C', name: 'C区', rows: [31, 60], cols: [0, 30], grade: 'standard', basePrice: 280 },
          { id: 'D', name: 'D区', rows: [61, 99], cols: [0, 30], grade: 'economy', basePrice: 180 }
        ]
      });
    }, 500);
  });
}

/**
 * 异步加载座位列表 - 模拟API调用延迟1000ms
 * 使用BitSet压缩存储
 */
export function loadSeatsAsync(hallId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const totalSeats = 3000;
      const seats = [];

      for (let i = 0; i < totalSeats; i++) {
        const row = Math.floor(i / 30);
        const col = i % 30;
        let grade = 'standard';
        let price = 280;

        if (row < 10) {
          grade = 'VIP';
          price = 380;
        } else if (row < 30) {
          grade = 'standard';
          price = 280;
        } else {
          grade = 'economy';
          price = 180;
        }

        seats.push({
          id: `${String.fromCharCode(65 + row)}${col + 1}`,
          index: i,
          row,
          col,
          section: row < 10 ? 'A' : row < 30 ? 'B' : row < 60 ? 'C' : 'D',
          status: 'available',
          price,
          grade
        });
      }

      const bookedBitSet = new BitSet(totalSeats);
      const bookedCount = Math.floor(totalSeats * 0.2);
      for (let i = 0; i < bookedCount; i++) {
        const randomIndex = Math.floor(Math.random() * totalSeats);
        bookedBitSet.set(randomIndex);
        seats[randomIndex].status = 'booked';
      }

      console.log(`[Mock] Loaded ${totalSeats} seats, ${bookedCount} booked`);

      resolve({
        seats,
        bookedBitSet,
        bookedCount,
        availableCount: totalSeats - bookedCount
      });
    }, 1000);
  });
}

/**
 * 异步加载选中座位 - 从缓存中恢复
 */
export function loadSelectedSeatsAsync() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 100);
  });
}

/**
 * 生成价格统计
 */
export function generatePriceStats(selectedSeats, seatMap) {
  const stats = {
    count: selectedSeats.length,
    total: 0,
    byGrade: {}
  };

  selectedSeats.forEach(seatIndex => {
    const seat = seatMap[seatIndex];
    if (seat) {
      stats.total += seat.price;
      if (!stats.byGrade[seat.grade]) {
        stats.byGrade[seat.grade] = {
          count: 0,
          total: 0
        };
      }
      stats.byGrade[seat.grade].count++;
      stats.byGrade[seat.grade].total += seat.price;
    }
  });

  return stats;
}
