"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { ServiceCard } from "@/modules/services/components/service-card";
import { useDeleteService } from "@/modules/services/hooks/use-delete-service";
import type { Service, ServiceListData } from "@/modules/services/types";
import { Card } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";
import { Pagination } from "@/shared/components/ui/pagination";

interface ServicesListClientProps {
  initialData: ServiceListData;
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

export function ServicesListClient({ initialData }: ServicesListClientProps) {
  const { services, pagination } = initialData;
  const { canWrite } = usePermissions();
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const deleteService = useDeleteService({
    onSuccess: (response) => {
      setServiceToDelete(null);
      setFeedback({
        type: "success",
        message: response.message || "Service deleted successfully.",
      });
    },
    onError: (error) => {
      setServiceToDelete(null);
      setFeedback({
        type: "error",
        message: error.message || "Failed to delete service. Please try again.",
      });
    },
  });

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setFeedback(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const handleDeleteConfirm = () => {
    if (!serviceToDelete) {
      return;
    }

    deleteService.mutate(serviceToDelete.id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Services</h1>
          <p className="page-subtitle mt-1">
            Manage service offerings and related media.
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/dashboard/services/add"
            className="btn-brand inline-flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm sm:w-auto"
          >
            Add Service
          </Link>
        ) : null}
      </div>

      {feedback ? (
        <FeedbackBanner
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      {services.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-base font-medium text-foreground">No services yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create your first service to start building your offerings catalog.
          </p>
          {canWrite ? (
            <Link
              href="/dashboard/services/add"
              className="btn-brand mt-2 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm"
            >
              Add Service
            </Link>
          ) : null}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onDelete={() => setServiceToDelete(service)}
              />
            ))}
          </div>

          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            from={pagination.from}
            to={pagination.to}
            hasMore={pagination.has_more}
            basePath="/dashboard/services"
            itemLabel="services"
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(serviceToDelete)}
        title="Delete service?"
        description={
          serviceToDelete
            ? `Are you sure you want to delete "${serviceToDelete.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteService.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!deleteService.isPending) {
            setServiceToDelete(null);
          }
        }}
      />
    </div>
  );
}
