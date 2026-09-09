# Feature Spec: Tích hợp AI Chatbot (Gemini)

## Goal
AI Chatbot giúp người dùng chẩn đoán lỗi nhanh và hướng dẫn khắc phục tự động, trước khi phải chờ kỹ thuật viên.

## Scope
### In Scope
- Giao diện khung Chat nhỏ góc dưới màn hình.
- Dùng Google Gemini API (Free tier) để xử lý ngôn ngữ tự nhiên.
- Mớm cho AI context về các lỗi phổ biến (bằng cách lấy dữ liệu từ bảng `Faq` làm context window).
- Nếu AI không giải quyết được -> Đề xuất nút "Tạo Ticket ngay" với tiêu đề và mô tả tự sinh từ cuộc hội thoại.

## Dependencies
- `@google/genai` sdk.
- Biến môi trường `GEMINI_API_KEY`.
