import { Badge } from "@/components/ui/badge";

export function TicketStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "OPEN": return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Mở</Badge>;
    case "IN_PROGRESS": return <Badge className="bg-orange-500 hover:bg-orange-600">Đang xử lý</Badge>;
    case "WAITING_PARTS": return <Badge className="bg-yellow-500 hover:bg-yellow-600">Chờ linh kiện</Badge>;
    case "RESOLVED": return <Badge className="bg-green-500 hover:bg-green-600">Đã xử lý</Badge>;
    case "CLOSED": return <Badge variant="outline" className="text-gray-500">Đóng</Badge>;
    default: return <Badge>{status}</Badge>;
  }
}

export function TicketPriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "LOW": return <Badge variant="outline" className="text-gray-500 border-gray-300">Thấp</Badge>;
    case "MEDIUM": return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Trung bình</Badge>;
    case "HIGH": return <Badge className="bg-orange-500 hover:bg-orange-600">Cao</Badge>;
    case "URGENT": return <Badge variant="destructive">Khẩn cấp</Badge>;
    default: return <Badge>{priority}</Badge>;
  }
}
