/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, Role, DeviceType, DeviceStatus, TicketStatus, TicketPriority, TicketCategory, MaintenanceCycle } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING REALISTIC SAMPLE DATA FOR DLU ONEDESK ---");

  // 1. Users
  const adminHash = await bcrypt.hash("admin", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@dlu.edu.vn" },
    update: { password: adminHash, role: Role.ADMIN },
    create: {
      name: "Quản trị viên CNTT",
      email: "admin@dlu.edu.vn",
      password: adminHash,
      role: Role.ADMIN,
      phone: "02633822246",
    },
  });

  const techHash = await bcrypt.hash("tech", 10);
  const tech = await prisma.user.upsert({
    where: { email: "tech@dlu.edu.vn" },
    update: { password: techHash, role: Role.TECHNICIAN },
    create: {
      name: "Kỹ thuật viên Nguyễn Văn Bình",
      email: "tech@dlu.edu.vn",
      password: techHash,
      role: Role.TECHNICIAN,
      phone: "0912345678",
    },
  });

  const userHash = await bcrypt.hash("user", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@dlu.edu.vn" },
    update: { password: userHash, role: Role.USER },
    create: {
      name: "Sinh viên Trần Thị Mai (MSSV: 2212364)",
      email: "user@dlu.edu.vn",
      password: userHash,
      role: Role.USER,
      phone: "0987654321",
    },
  });

  console.log("✓ Users seeded");

  // 2. Rooms
  const roomsData = [
    { name: "Phòng máy Lab 01", location: "Tòa nhà A2 - Tầng 2", capacity: 40, description: "Phòng thực hành Lập trình & Mạng máy tính" },
    { name: "Phòng máy Lab 02", location: "Tòa nhà A2 - Tầng 3", capacity: 40, description: "Phòng thực hành Đồ họa & AI" },
    { name: "Phòng máy Lab 03", location: "Tòa nhà A1 - Tầng 1", capacity: 35, description: "Phòng máy tính đại cương dành cho sinh viên" },
    { name: "Văn phòng Trung tâm CNTT", location: "Tòa nhà Điều hành - Tầng 1", capacity: 15, description: "Nơi tiếp nhận và xử lý sự cố thiết bị trường" },
  ];

  const rooms = [];
  for (const rd of roomsData) {
    let r = await prisma.room.findFirst({ where: { name: rd.name } });
    if (!r) {
      r = await prisma.room.create({ data: rd });
    }
    rooms.push(r);
  }
  console.log(`✓ Seeded ${rooms.length} rooms`);

  // 3. Software
  const softwareData = [
    { name: "Visual Studio Code", version: "1.93.0", license: "MIT (Open Source)" },
    { name: "PostgreSQL Database Server", version: "15.4", license: "PostgreSQL Open License" },
    { name: "Node.js LTS Runtime", version: "20.17.0", license: "MIT" },
    { name: "Microsoft Office 2021 LTSC", version: "2108", license: "DLU Campus Agreement" },
    { name: "Cisco Packet Tracer", version: "8.2.1", license: "Cisco Networking Academy" },
  ];

  const softwareList = [];
  for (const sw of softwareData) {
    let s = await prisma.software.findFirst({ where: { name: sw.name } });
    if (!s) {
      s = await prisma.software.create({ data: sw });
    }
    softwareList.push(s);
  }
  console.log(`✓ Seeded ${softwareList.length} software packages`);

  // 4. Devices
  const devicesData = [
    {
      name: "Máy trạm Dell Optiplex 7090 - PC01",
      type: DeviceType.COMPUTER,
      status: DeviceStatus.ACTIVE,
      qrCode: "DEV-LAB01-PC01",
      manufacturer: "Dell",
      model: "Optiplex 7090 MT",
      serialNumber: "DELL-7090-001",
      purchaseDate: new Date("2024-01-15"),
      warrantyEnd: new Date("2027-01-15"),
      specifications: { cpu: "Intel Core i7-11700", ram: "16GB DDR4", storage: "512GB NVMe SSD", os: "Windows 11 Pro 64-bit" },
      notes: "Máy trưởng dãy 1",
      roomId: rooms[0].id,
    },
    {
      name: "Máy trạm Dell Optiplex 7090 - PC02",
      type: DeviceType.COMPUTER,
      status: DeviceStatus.ACTIVE,
      qrCode: "DEV-LAB01-PC02",
      manufacturer: "Dell",
      model: "Optiplex 7090 MT",
      serialNumber: "DELL-7090-002",
      purchaseDate: new Date("2024-01-15"),
      warrantyEnd: new Date("2027-01-15"),
      specifications: { cpu: "Intel Core i7-11700", ram: "16GB DDR4", storage: "512GB NVMe SSD", os: "Windows 11 Pro 64-bit" },
      roomId: rooms[0].id,
    },
    {
      name: "Switch Cisco Catalyst 2960X",
      type: DeviceType.NETWORK,
      status: DeviceStatus.ACTIVE,
      qrCode: "DEV-NET-SW01",
      manufacturer: "Cisco Systems",
      model: "WS-C2960X-48TD-L",
      serialNumber: "FCW2145A0Z2",
      purchaseDate: new Date("2023-05-10"),
      warrantyEnd: new Date("2026-05-10"),
      specifications: { ports: "48 x 10/100/1000 Gigabit", uplink: "2 x 10G SFP+", stackable: true },
      roomId: rooms[0].id,
    },
    {
      name: "Máy trạm HP Z2 G9 Workstation - AI01",
      type: DeviceType.COMPUTER,
      status: DeviceStatus.ACTIVE,
      qrCode: "DEV-LAB02-AI01",
      manufacturer: "HP",
      model: "Z2 Tower G9",
      serialNumber: "HP-Z2G9-001",
      purchaseDate: new Date("2024-06-20"),
      warrantyEnd: new Date("2027-06-20"),
      specifications: { cpu: "Intel Core i9-13900K", ram: "32GB DDR5", gpu: "NVIDIA RTX 4070 12GB", storage: "1TB Gen4 SSD" },
      roomId: rooms[1].id,
    },
    {
      name: "Máy in Laser đa năng HP LaserJet M428fdw",
      type: DeviceType.PERIPHERAL,
      status: DeviceStatus.MAINTENANCE,
      qrCode: "DEV-PER-PRN01",
      manufacturer: "HP",
      model: "LaserJet Pro MFP M428fdw",
      serialNumber: "VNB3K12345",
      purchaseDate: new Date("2023-08-01"),
      warrantyEnd: new Date("2025-08-01"),
      specifications: { functions: "Print, Scan, Copy, Fax", speed: "38 ppm", connectivity: "Ethernet, Wi-Fi, USB" },
      notes: "Đang chờ thay cụm sấy mực",
      roomId: rooms[3].id,
    },
  ];

  const devices = [];
  for (const dd of devicesData) {
    let d = await prisma.device.findUnique({ where: { qrCode: dd.qrCode } });
    if (!d) {
      d = await prisma.device.create({ data: dd });
    }
    devices.push(d);
  }
  console.log(`✓ Seeded ${devices.length} devices`);

  // Gắn software vào máy PC01 & AI01
  if (devices.length > 0 && softwareList.length > 0) {
    for (const s of softwareList) {
      await prisma.deviceSoftware.upsert({
        where: { deviceId_softwareId: { deviceId: devices[0].id, softwareId: s.id } },
        update: {},
        create: { deviceId: devices[0].id, softwareId: s.id },
      });
    }
  }

  // 5. FAQs
  const faqsData = [
    {
      question: "Máy tính phòng Lab không nhận mạng Internet hoặc báo No Internet Access?",
      answer: "1. Kiểm tra lại jack cắm cáp mạng RJ45 phía sau thùng máy xem đèn tín hiệu màu xanh/cam có sáng không.\n2. Bấm phím Windows + R, gõ `cmd`, gõ lệnh `ipconfig /renew` để cấp lại địa chỉ IP từ DHCP Trung tâm.\n3. Nếu vẫn không được, vui lòng quét mã QR trên vỏ thùng máy để gửi ticket báo hỏng cho Kỹ thuật viên.",
      category: "Mạng",
      isActive: true,
      authorId: admin.id,
    },
    {
      question: "Máy in phòng Điều hành bị kẹt giấy hoặc báo Paper Jam?",
      answer: "1. Mở nắp khay lấy giấy phía trước máy in.\n2. Nhẹ nhàng rút tờ giấy bị kẹt theo chiều thuận của trục quay (tránh làm rách giấy lưu lại trong trục cuốn).\n3. Đóng nắp khay và nhấn nút OK hoặc Resume trên màn hình cảm ứng của máy in.",
      category: "Ngoại vi",
      isActive: true,
      authorId: admin.id,
    },
    {
      question: "Màn hình máy trạm không lên tín hiệu (No Signal Input)?",
      answer: "1. Kiểm tra phích cắm nguồn và nút nguồn của màn hình (đèn led sáng).\n2. Kiểm tra cáp kết nối DisplayPort / HDMI giữa màn hình và card đồ họa của thùng máy tính.\n3. Nhấn nút chọn nguồn tín hiệu (Input Source) trên màn hình để chọn đúng cổng HDMI hoặc DP.",
      category: "Phần cứng",
      isActive: true,
      authorId: admin.id,
    },
    {
      question: "Cần cài đặt bổ sung phần mềm phục vụ môn học mới?",
      answer: "Giảng viên bộ môn vui lòng gửi phiếu yêu cầu cài đặt phần mềm trước kỳ học 01 tuần hoặc tạo Ticket loại 'Phần mềm' trên hệ thống DLU OneDesk để Kỹ thuật viên triển khai đồng loạt qua mạng nội bộ.",
      category: "Phần mềm",
      isActive: true,
      authorId: admin.id,
    },
  ];

  for (const fd of faqsData) {
    const existing = await prisma.faq.findFirst({ where: { question: fd.question } });
    if (!existing) {
      await prisma.faq.create({ data: fd });
    }
  }
  console.log(`✓ Seeded ${faqsData.length} FAQs`);

  // 6. Maintenance Plan
  const plan = await prisma.maintenancePlan.findFirst({ where: { roomId: rooms[0].id } });
  if (!plan) {
    await prisma.maintenancePlan.create({
      data: {
        name: "Bảo trì định kỳ Phòng máy Lab 01 - Kỳ 1 2026",
        cycle: MaintenanceCycle.MONTHLY,
        checklist: "- [ ] Vệ sinh bụi quạt tản nhiệt CPU và nguồn\n- [ ] Kiểm tra cáp mạng RJ45 và switch trung tâm\n- [ ] Quét virus và dọn dẹp ổ đĩa tạm\n- [ ] Kiểm tra bàn phím, chuột và màn hình từng máy",
        isActive: true,
        roomId: rooms[0].id,
        creatorId: admin.id,
      },
    });
    console.log("✓ Seeded maintenance plan");
  }

  // 7. Sample Tickets
  const ticket1 = await prisma.ticket.findFirst({ where: { title: "Máy PC01 không khởi động được sau giờ thực hành" } });
  if (!ticket1) {
    await prisma.ticket.create({
      data: {
        title: "Máy PC01 không khởi động được sau giờ thực hành",
        description: "Bấm nút nguồn đèn máy nhấp nháy màu cam và phát tiếng bíp liên tục, không lên màn hình.",
        category: TicketCategory.HARDWARE,
        priority: TicketPriority.HIGH,
        status: TicketStatus.IN_PROGRESS,
        creatorId: user.id,
        assigneeId: tech.id,
        deviceId: devices[0].id,
        slaDeadline: new Date(Date.now() + 8 * 3600 * 1000),
        firstResponseAt: new Date(),
        comments: {
          create: [
            {
              content: "Đã tiếp nhận sự cố. Kỹ thuật viên sẽ kiểm tra thanh RAM và nguồn máy vào lúc 14:00 chiều nay.",
              authorId: tech.id,
            },
          ],
        },
      },
    });
  }

  const ticket2 = await prisma.ticket.findFirst({ where: { title: "Cần cập nhật Visual Studio Code lên bản mới nhất" } });
  if (!ticket2) {
    await prisma.ticket.create({
      data: {
        title: "Cần cập nhật Visual Studio Code lên bản mới nhất",
        description: "Phục vụ môn Lập trình Web nâng cao kỳ 1 tại phòng Lab 02.",
        category: TicketCategory.SOFTWARE,
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
        creatorId: user.id,
        slaDeadline: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });
  }

  console.log("✓ Sample tickets seeded successfully");
  console.log("=== SEEDING COMPLETED ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
