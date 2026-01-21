export default function DriverLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            {/* Mobile-first constraints */}
            <div className="max-w-md mx-auto min-h-screen bg-card shadow-2xl relative overflow-hidden">
                {children}
            </div>
        </div>
    )
}
