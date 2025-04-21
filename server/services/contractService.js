// services/contractService.js

const { Contract } = require("../models");
const { Op } = require("sequelize");

/**
 * Hàm kiểm tra và cập nhật các hợp đồng đã hết hạn (Expire Contracts)
 */
async function checkAndExpireContracts() {
  console.log(
    `⏰ [${new Date().toISOString()}] Running contract expiry check...`
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Tìm các hợp đồng hiện đang "Có hiệu lực" và đã qua ngày kết thúc
    const expiredContracts = await Contract.findAll({
      where: {
        TrangThai: "Có hiệu lực",
        NgayKetThuc: { [Op.lt]: today },
      },
    });

    if (expiredContracts.length > 0) {
      console.log(`⏰ Found ${expiredContracts.length} contracts to expire.`);
      const ids = expiredContracts.map((c) => c.MaHopDong);
      const [updatedCount] = await Contract.update(
        { TrangThai: "Hết hiệu lực" },
        { where: { MaHopDong: ids } }
      );
      console.log(`✅ Marked ${updatedCount} contracts as expired.`);
    } else {
      console.log(`✅ No contracts need expiration.`);
    }
  } catch (error) {
    console.error("❌ Error expiring contracts:", error);
  }
}

module.exports = { checkAndExpireContracts };
