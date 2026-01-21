"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Map, Save } from "lucide-react"

export default function AreaManagement() {
    const [radius, setRadius] = useState(5) // Default 5km

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Area & System Controls</h2>
                <p className="text-muted-foreground">Manage service areas and dispatch settings.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Driver Matching Config */}
                <Card>
                    <CardHeader>
                        <CardTitle>Driver Matching Radius</CardTitle>
                        <CardDescription>Set the maximum distance for initial ride requests.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Input
                                type="number"
                                value={radius}
                                onChange={(e) => setRadius(parseInt(e.target.value) || 1)}
                                className="text-2xl font-bold h-16 w-32 text-center"
                            />
                            <span className="text-xl font-medium">Kilometers</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Current setting: Drivers within <strong>{radius} km</strong> of pickup will receive notifications first.
                        </p>
                        <Button className="w-full">
                            <Save className="mr-2 h-5 w-5" /> Save Changes
                        </Button>
                    </CardContent>
                </Card>

                {/* Areas List (Mock) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Service Areas</CardTitle>
                        <CardDescription>Cities and villages where service is enabled.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad'].map(city => (
                                <div key={city} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Map className="h-5 w-5 text-primary" />
                                        <span className="font-medium">{city}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
                                        <span className="text-xs text-muted-foreground">Active</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4">
                            Add New Area
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
