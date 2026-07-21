import { MessagesListPage } from "@/modules/messages/components/messages-list-page";
import { messagesApi } from "@/modules/messages/api/messages.api";
import { Card } from "@/shared/components/ui/card";

interface DashboardMessagesPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function DashboardMessagesPage({
  searchParams,
}: DashboardMessagesPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  try {
    const response = await messagesApi.list({ page });
    return <MessagesListPage data={response.data} />;
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Contact form submissions from the public website.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load messages. Please try again later.
          </p>
        </Card>
      </div>
    );
  }
}
