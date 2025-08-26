import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 lg:p-6">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Skeleton className="h-[108px]" />
        <Skeleton className="h-[108px]" />
        <Skeleton className="h-[108px]" />
        <Skeleton className="h-[108px]" />
      </div>
      <div className="mt-4 grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                <Skeleton className="h-[320px] sm:col-span-2" />
                <Skeleton className="h-[320px] sm:col-span-2" />
            </div>
            <Skeleton className="h-[400px]" />
        </div>
      </div>
    </div>
  )
}
