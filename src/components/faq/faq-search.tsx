"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FaqSearchProps {
  faqs: Faq[];
}

export function FaqSearch({ faqs }: FaqSearchProps) {
  const [query, setQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(query.toLowerCase()) ||
      faq.answer.toLowerCase().includes(query.toLowerCase()) ||
      faq.category.toLowerCase().includes(query.toLowerCase())
  );

  // Group by category
  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, Faq[]>);

  return (
    <div className="space-y-6">
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm câu hỏi, từ khóa, danh mục..."
          className="pl-9 h-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {Object.keys(groupedFaqs).length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Không tìm thấy kết quả nào phù hợp.
          </div>
        ) : (
          Object.keys(groupedFaqs).sort().map((category) => (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">{category}</h2>
              <Accordion className="w-full">
                {groupedFaqs[category].map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
