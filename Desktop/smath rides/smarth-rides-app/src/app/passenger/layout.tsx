export default function PassengerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-950">
            {/* Center content but allow full-bleed map background */}
            <div className="w-full min-h-screen relative overflow-hidden backdrop-blur-3xl">
                {children}
            </div>
        </div>
    )
}
