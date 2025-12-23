'use client'

import { useSession } from 'next-auth/react'
import { useUsage } from '@/hooks/useUsage'
import { FolderOpen, Box, HardDrive, AlertTriangle } from 'lucide-react'

export default function UsageWidget() {
    const { data: session } = useSession()
    const user = session?.user as any
    const { usage, loading, getPercentage, isNearLimit, isOverLimit } = useUsage(user?.id)

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        )
    }

    if (!usage) {
        return null
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const usageItems = [
        {
            icon: FolderOpen,
            label: 'Proyectos',
            used: usage.projects_count,
            max: usage.plan_limits.max_projects,
            color: 'blue'
        },
        {
            icon: Box,
            label: 'Modelos 3D',
            used: usage.models_3d_count,
            max: usage.plan_limits.max_models,
            color: 'purple'
        },
        {
            icon: HardDrive,
            label: 'Almacenamiento',
            used: usage.storage_used,
            max: usage.plan_limits.max_storage,
            color: 'green',
            formatValue: formatBytes
        }
    ]

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Uso actual
            </h3>

            <div className="space-y-4">
                {usageItems.map((item) => {
                    const Icon = item.icon
                    const percentage = getPercentage(item.used, item.max)
                    const nearLimit = isNearLimit(item.used, item.max)
                    const overLimit = isOverLimit(item.used, item.max)
                    const isUnlimited = item.max === -1

                    const colorClasses = {
                        blue: 'text-blue-500',
                        purple: 'text-purple-500',
                        green: 'text-green-500'
                    }

                    const bgColorClasses = {
                        blue: 'bg-blue-500',
                        purple: 'bg-purple-500',
                        green: 'bg-green-500'
                    }

                    return (
                        <div key={item.label}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Icon className={`h-4 w-4 ${colorClasses[item.color as keyof typeof colorClasses]}`} />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {item.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {(nearLimit || overLimit) && !isUnlimited && (
                                        <AlertTriangle className={`h-4 w-4 ${overLimit ? 'text-red-500' : 'text-yellow-500'}`} />
                                    )}
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {item.formatValue ? item.formatValue(item.used) : item.used}
                                        {!isUnlimited && (
                                            <span className="text-gray-500 dark:text-gray-400">
                                                {' / '}
                                                {item.formatValue ? item.formatValue(item.max) : item.max}
                                            </span>
                                        )}
                                        {isUnlimited && (
                                            <span className="text-gray-500 dark:text-gray-400"> / ∞</span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {!isUnlimited && (
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${overLimit
                                                ? 'bg-red-500'
                                                : nearLimit
                                                    ? 'bg-yellow-500'
                                                    : bgColorClasses[item.color as keyof typeof bgColorClasses]
                                            }`}
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                </div>
                            )}

                            {isUnlimited && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Ilimitado en tu plan
                                </div>
                            )}

                            {overLimit && !isUnlimited && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    Has alcanzado el límite. Actualiza tu plan para continuar.
                                </p>
                            )}

                            {nearLimit && !overLimit && !isUnlimited && (
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                    Cerca del límite. Considera actualizar tu plan.
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <a
                    href="/dashboard/billing"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                    Ver planes y actualizar →
                </a>
            </div>
        </div>
    )
}
