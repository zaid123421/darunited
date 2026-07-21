import { MessageNotFound } from "@/modules/messages/components/message-not-found";
import { ShowMessagePage } from "@/modules/messages/components/show-message-page";
import { messagesApi } from "@/modules/messages/api/messages.api";
import { ApiError } from "@/shared/types/global-response";
import { Card } from "@/shared/components/ui/card";

interface MessageDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function MessageDetailsPage({
  params,
}: MessageDetailsPageProps) {
  const { id } = await params;

  try {
    const response = await messagesApi.getById(id);
    return <ShowMessagePage message={response.data} />;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return <MessageNotFound />;
    }

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">
            Message Details
          </h1>
          <p className="text-sm text-muted-foreground">
            View full contact form submission.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load message. Please try again later.
          </p>
        </Card>
      </div>
    );
  }
}
