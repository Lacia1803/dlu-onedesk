# Feature Spec: Lịch bảo trì (Calendar View)

## Goal
Dashboard dành riêng cho Technician hiển thị công việc dưới dạng lịch (Lịch bảo trì và Lịch hẹn xử lý ticket).

## Scope
### In Scope
- Hiển thị Lịch theo tháng / tuần.
- Lấy danh sách các `Ticket` đang `IN_PROGRESS` (dựa trên createdAt hoặc lịch hẹn nếu sau này bổ sung).
- Lấy danh sách `MaintenanceLog` (lịch sử bảo trì).
- Kéo thả sự kiện (Drag & Drop) để chuyển ngày (Nếu có).

## Dependencies
- Thư viện như `react-big-calendar` hoặc tự custom giao diện grid CSS.
