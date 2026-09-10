import {
  Bot,
  Boxes,
  Headset,
  Monitor,
  QrCode,
  BarChart3,
  Send,
  Star,
  TicketCheck,
  type LucideIcon,
} from "lucide-react";

/* ---------- Ảnh phong cảnh (Đà Lạt & ĐH Đà Lạt - giữ nguyên bản sắc) ---------- */
export const IMAGES = {
  heroCampus:
    "https://images.pexels.com/photos/34278316/pexels-photo-34278316.jpeg?auto=compress&cs=tinysrgb&w=1100&h=1400&fit=crop",
  panorama:
    "https://images.pexels.com/photos/30317697/pexels-photo-30317697.jpeg?auto=compress&cs=tinysrgb&w=1600&h=1000&fit=crop",
  lab: "https://images.pexels.com/photos/5530515/pexels-photo-5530515.jpeg?auto=compress&cs=tinysrgb&w=900&h=720&fit=crop",
  pineMacro:
    "https://images.pexels.com/photos/19797898/pexels-photo-19797898.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop",

  /* Screenshots thực tế từ hệ thống DLU OneDesk đang chạy */
  realDashboard: "/screenshots/real-dashboard.png",
  realTickets: "/screenshots/real-tickets.png",
  realDevices: "/screenshots/real-devices.png",
  realFaq: "/screenshots/real-faq.png",
  realKpi: "/screenshots/real-kpi.png",
  realNotifications: "/screenshots/real-notifications.png",
} as const;

/* ---------- Điều hướng ---------- */
export const NAV = [
  { label: "Giới thiệu", href: "#gioi-thieu" },
  { label: "Tính năng", href: "#tinh-nang" },
  { label: "Quy trình", href: "#quy-trinh" },
  { label: "FAQ", href: "#faq" },
] as const;

/* ---------- Dải chữ chạy ---------- */
export const TICKER = [
  "Báo sự cố bằng QR",
  "Theo dõi trạng thái xử lý",
  "Phân công kỹ thuật viên",
  "Thiết bị và bảo trì định kỳ",
  "Trợ lý AI trả lờ" + "i FAQ",
  "Báo cáo KPI vận hành",
];

/* ---------- Khối giá trị ---------- */
export type ValueItem = {
  no: string;
  icon: LucideIcon;
  title: string;
  desc: string;
};

export const VALUES: ValueItem[] = [
  {
    no: "01",
    icon: QrCode,
    title: "Báo sự cố thuận tiện",
    desc: "Quét mã QR dán trên thiết bị, chọn đúng máy đang gặp lỗi và gửi mô tả kèm ảnh — ngay tại phòng máy, không cần gọi điện hay gửi email.",
  },
  {
    no: "02",
    icon: Headset,
    title: "Xử lý minh bạch",
    desc: "Mỗi sự cố là một ticket có trạng thái rõ ràng. Ngườ" + "i báo theo dõi tiến độ và trao đổi trực tiếp với kỹ thuật viên trong suốt quá trình hỗ trợ.",
  },
  {
    no: "03",
    icon: Boxes,
    title: "Quản lý tập trung",
    desc: "Hồ sơ thiết bị theo từng phòng máy, lịch bảo trì định kỳ và báo cáo vận hành nằm trên một hệ thống duy nhất, không còn rờ" + "i rạc giữa nhiều kênh.",
  },
];

/* ---------- Quy trình ---------- */
export type Step = {
  no: string;
  icon: LucideIcon;
  title: string;
  desc: string;
};

export const STEPS: Step[] = [
  {
    no: "01",
    icon: QrCode,
    title: "Quét QR / chọn thiết bị",
    desc: "Mã QR dán trên từng thiết bị mở sẵn biểu mẫu báo lỗi với đúng mã máy và vị trí phòng máy.",
  },
  {
    no: "02",
    icon: Send,
    title: "Gửi sự cố",
    desc: "Mô tả ngắn gọn tình trạng, đính kèm ảnh nếu cần và chọn mức độ ảnh hưởng.",
  },
  {
    no: "03",
    icon: Headset,
    title: "Kỹ thuật viên tiếp nhận",
    desc: "Ticket được phân loại, gán cho kỹ thuật viên phụ trách kèm cam kết thờ" + "i gian phản hồi.",
  },
  {
    no: "04",
    icon: Star,
    title: "Theo dõi kết quả và đánh giá",
    desc: "Nhận thông báo khi xử lý xong, xác nhận kết quả và chấm mức hài lòng cho lần hỗ trợ.",
  },
];

/* ---------- Tính năng ---------- */
export type Feature = {
  index: string;
  kicker: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  bullets: string[];
  mockup: "ticket" | "devices" | "chat" | "kpi";
  caption: string;
};

export const FEATURES: Feature[] = [
  {
    index: "01",
    kicker: "Ticket",
    icon: TicketCheck,
    title: "Tiếp nhận và xử lý ticket",
    desc: "Mọi sự cố trở thành một ticket có vòng đờ" + "i rõ ràng: tiếp nhận, phân công, xử lý, chờ ngườ" + "i dùng xác nhận rồ" + "i mới đóng.",
    bullets: [
      "Phân công theo kỹ thuật viên và phòng máy",
      "Trao đổi ngay trong ticket, giữ nguyên lịch sử",
      "Mức độ ưu tiên và hạn xử lý (SLA) rõ ràng",
    ],
    mockup: "ticket",
    caption: "Giao diện ticket chi tiết — dữ liệu minh họa",
  },
  {
    index: "02",
    kicker: "Thiết bị",
    icon: Monitor,
    title: "Thiết bị và lịch bảo trì",
    desc: "Mỗi thiết bị có một hồ sơ: vị trí, tình trạng, lịch sử sửa chữa và lịch bảo trì định kỳ sắp tới.",
    bullets: [
      "Danh mục thiết bị theo từng phòng máy",
      "Lịch bảo trì định kỳ, nhắc trước ngày thực hiện",
      "Mã QR riêng cho từng thiết bị để báo lỗi nhanh",
    ],
    mockup: "devices",
    caption: "Danh mục thiết bị phòng A2 — dữ liệu minh họa",
  },
  {
    index: "03",
    kicker: "Trợ lý AI",
    icon: Bot,
    title: "FAQ và trợ lý AI",
    desc: "Trước khi tạo ticket, ngườ" + "i dùng có thể hỏi trợ lý AI. Câu trả lờ" + "i được gợi ý từ kho FAQ nộ" + "i bộ của đội kỹ thuật, kèm nguồn tham chiếu.",
    bullets: [
      "Gợi ý câu trả lờ" + "i từ tài liệu FAQ có sẵn",
      "Giảm ticket lặp lại với các lỗi thường gặp",
      "Luôn có lối tắt tạo ticket khi cần ngườ" + "i thật",
    ],
    mockup: "chat",
    caption: "Trợ lý OneDesk AI — dữ liệu minh họa",
  },
  {
    index: "04",
    kicker: "Báo cáo",
    icon: BarChart3,
    title: "KPI và báo cáo vận hành",
    desc: "Số liệu tổng hợp giúp đội kỹ thuật nhìn lại chất lượng hỗ trợ và chủ động bảo trì thay vì chạy theo sự cố.",
    bullets: [
      "Thờ" + "i gian phản hồi và hoàn thành trung bình",
      "Tỷ lệ ticket đúng hạn theo từng tuần",
      "Phân bổ sự cố theo loại thiết bị, phòng máy",
    ],
    mockup: "kpi",
    caption: "Bảng KPI tuần — dữ liệu minh họa",
  },
];

/* ---------- FAQ ---------- */
export const FAQS = [
  {
    q: "Ai có thể sử dụng hệ thống?",
    a: "Hệ thống hướng tới ba nhóm ngườ" + "i dùng tại Trường Đại học Đà Lạt: giảng viên và sinh viên sử dụng phòng máy, đội ngũ kỹ thuật viên, và quản trị viên phụ trách thiết bị. Khi triển khai thử nghiệm, tài khoản sẽ được cấp theo danh sách tham gia.",
  },
  {
    q: "Làm thế nào để có tài khoản?",
    a: "DLU OneDesk không mở đăng ký công khai. Tài khoản do quản trị viên tạo và cấp cho ngườ" + "i tham gia thử nghiệm. Nếu bạn muốn trả" + "i nghiệm bản demo, hãy liên hệ nhóm phát triển qua thông tin ở cuối trang.",
  },
  {
    q: "Có thể báo lỗi bằng điện thoại không?",
    a: "Có. Giao diện được thiết kế responsive cho màn hình nhỏ. Bạn chỉ cần mở camera điện thoại, quét mã QR dán trên thiết bị — biểu mẫu báo sự cố sẽ tự điền sẵn mã máy và phòng máy, bạn chỉ mô tả lỗi và gửi.",
  },
  {
    q: "Tôi theo dõi tiến độ xử lý ở đâu?",
    a: "Ở mục “Ticket của tôi” sau khi đăng nhập. Mỗi ticket hiển thị trạng thái theo thờ" + "i gian thực, kỹ thuật viên phụ trách, toàn bộ lịch sử trao đổi và thờ" + "i điểm dự kiến hoàn thành.",
  },
  {
    q: "Dữ liệu và hình ảnh trên trang này có phải dữ liệu thật không?",
    a: "Không. Toàn bộ số liệu, tên ngườ" + "i dùng và nộ" + "i dung trong ảnh chụp giao diện chỉ mang tính minh họa cho đồ án. DLU OneDesk là sản phẩm đồ án học phần, không phải hệ thống chính thức của Trường Đại học Đà Lạt.",
  },
] as const;

/* ---------- Chân trang ---------- */
export const FOOTER_PRODUCT = [
  { label: "Giới thiệu", href: "#gioi-thieu" },
  { label: "Tính năng", href: "#tinh-nang" },
  { label: "Quy trình", href: "#quy-trinh" },
  { label: "Câu hỏ" + "i thường gặp", href: "#faq" },
];

export const FOOTER_PROJECT = [
  "Tổng quan đồ án",
  "Hướng dẫn sử dụng",
  "Tài liệu kỹ thuật",
  "Báo cáo và slide bảo vệ",
];
