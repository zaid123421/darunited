"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";
import type { ServiceOption } from "@/modules/projects/types";
import { buildProjectsListQuery } from "@/modules/projects/lib/build-projects-list-path";
import { Button } from "@/shared/components/ui/button";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/cn";

export interface ProjectSearchFilters {
  title?: string;
  description?: string;
  clientName?: string;
  serviceId?: string;
  actualProjectDate?: string;
  fromDate?: string;
  toDate?: string;
}

interface ProjectsSearchFormProps {
  initialFilters: ProjectSearchFilters;
  services: ServiceOption[];
}

export function ProjectsSearchForm({
  initialFilters,
  services,
}: ProjectsSearchFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params: Record<string, string | undefined> = {};

    [
      "title",
      "description",
      "clientName",
      "serviceId",
      "actualProjectDate",
      "fromDate",
      "toDate",
    ].forEach((key) => {
      const value = String(formData.get(key) ?? "").trim();
      if (value) {
        params[key] = value;
      }
    });

    router.push(`/dashboard/projects${buildProjectsListQuery(params, 1)}`);
  };

  const handleClear = () => {
    router.push("/dashboard/projects");
  };

  const serviceOptions = services.map((service) => ({
    label: service.title,
    value: String(service.id),
  }));

  return (
    <Card className="p-4 sm:p-6">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
        aria-expanded={isOpen}
      >
        <CardTitle className="text-sm font-semibold sm:text-base">
          Search Projects
        </CardTitle>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4 sm:pt-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                name="title"
                label="Title"
                placeholder="Search by title"
                defaultValue={initialFilters.title ?? ""}
              />
              <Input
                name="clientName"
                label="Client Name"
                placeholder="Search by client"
                defaultValue={initialFilters.clientName ?? ""}
              />
              <Select
                name="serviceId"
                label="Service"
                placeholder="All services"
                options={serviceOptions}
                defaultValue={initialFilters.serviceId ?? ""}
              />
              <Input
                name="description"
                label="Description"
                placeholder="Search by description"
                defaultValue={initialFilters.description ?? ""}
              />
              <Input
                name="actualProjectDate"
                type="date"
                label="Project Date"
                defaultValue={initialFilters.actualProjectDate ?? ""}
              />
              <Input
                name="fromDate"
                type="date"
                label="From Date"
                defaultValue={initialFilters.fromDate ?? ""}
              />
              <Input
                name="toDate"
                type="date"
                label="To Date"
                defaultValue={initialFilters.toDate ?? ""}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button type="submit" className="h-10 gap-2 px-4">
                <Search className="h-4 w-4" />
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 px-4"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
}
