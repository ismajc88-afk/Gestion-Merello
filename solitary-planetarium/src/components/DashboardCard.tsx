"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardCardProps {
    title: string;
    value: string;
    description?: string;
    icon: LucideIcon;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    className?: string;
    index?: number;
}

export function DashboardCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    trendValue,
    className,
    index = 0,
}: DashboardCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={cn("rounded-2xl border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow duration-300", className)}
        >
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
                <div className="p-2 bg-primary/10 rounded-full">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </div>
            <div className="pt-4">
                <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
                {(description || trendValue) && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center font-medium">
                        {trendValue && (
                            <span
                                className={cn(
                                    "mr-2 px-1.5 py-0.5 rounded text-xs",
                                    trend === "up" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                        trend === "down" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                )}
                            >
                                {trendValue}
                            </span>
                        )}
                        {description}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
