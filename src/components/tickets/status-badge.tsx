import { Badge } from "@/components/ui/badge";

const mono = "font-mono text-[10px] uppercase tracking-wider rounded-sm";

export function TicketStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "OPEN": return <Badge variant="outline" className={`${mono} border-blue-500 text-blue-400`}>OPEN</Badge>;
    case "IN_PROGRESS": return <Badge className={`${mono} bg-orange-500 hover:bg-orange-600 text-black`}>IN_PROGRESS</Badge>;
    case "WAITING_PARTS": return <Badge className={`${mono} bg-yellow-500 hover:bg-yellow-600 text-black`}>WAITING_PARTS</Badge>;
    case "RESOLVED": return <Badge className={`${mono} bg-primary hover:bg-primary/90`}>RESOLVED</Badge>;
    case "CANCELLED": return <Badge variant="destructive" className={`${mono}`}>CANCELLED</Badge>;
    case "CLOSED": return <Badge variant="outline" className={`${mono} border-muted-foreground text-muted-foreground`}>CLOSED</Badge>;
    default: return <Badge className={mono}>{status}</Badge>;
  }
}

export function TicketPriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "LOW": return <Badge variant="outline" className={`${mono} border-muted-foreground text-muted-foreground`}>LOW</Badge>;
    case "MEDIUM": return <Badge variant="outline" className={`${mono} border-blue-500 text-blue-400`}>MEDIUM</Badge>;
    case "HIGH": return <Badge className={`${mono} bg-orange-500 hover:bg-orange-600 text-black`}>HIGH</Badge>;
    case "URGENT": return <Badge variant="destructive" className={mono}>URGENT</Badge>;
    default: return <Badge className={mono}>{priority}</Badge>;
  }
}
