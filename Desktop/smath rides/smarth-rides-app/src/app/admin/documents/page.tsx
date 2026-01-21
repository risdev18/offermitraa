"use client"

import { useState } from "react"
import { useAdminStore, DocumentType } from "@/lib/store/useAdminStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trash2, Plus, GripVertical } from "lucide-react"

export default function DocumentManagement() {
    const { documentTypes, addDocumentType, removeDocumentType, updateDocumentType } = useAdminStore()
    const [newDocName, setNewDocName] = useState("")

    const handleAdd = () => {
        if (!newDocName.trim()) return
        const id = newDocName.toLowerCase().replace(/\s+/g, "_")
        addDocumentType({
            id,
            name: newDocName,
            photoCount: 1,
            isMandatory: true
        })
        setNewDocName("")
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Document Configuration</h2>
                <p className="text-muted-foreground">Manage required documents for driver registration.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* List of Documents */}
                <div className="space-y-4">
                    {documentTypes.map((doc) => (
                        <Card key={doc.id} className="relative overflow-hidden">
                            <CardContent className="p-4 flex items-center gap-4">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg">{doc.name}</h3>
                                        {doc.isMandatory && <span className="bg-alert/10 text-alert text-xs px-2 py-0.5 rounded-full font-bold">Mandatory</span>}
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                        <label className="flex items-center gap-2">
                                            <span>Photos:</span>
                                            <input
                                                type="number"
                                                min={1}
                                                max={5}
                                                className="w-12 h-8 border rounded px-1 bg-background"
                                                value={doc.photoCount}
                                                onChange={(e) => updateDocumentType(doc.id, { photoCount: parseInt(e.target.value) || 1 })}
                                            />
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={doc.isMandatory}
                                                onChange={(e) => updateDocumentType(doc.id, { isMandatory: e.target.checked })}
                                                className="w-4 h-4 accent-primary"
                                            />
                                            <span>Mandatory</span>
                                        </label>
                                    </div>
                                </div>
                                <Button variant="destructive" size="icon" onClick={() => removeDocumentType(doc.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Add New Document */}
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Document Type</CardTitle>
                        <CardDescription>Create a new requirement for drivers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Document Name (e.g. Police Verification)"
                            value={newDocName}
                            onChange={(e) => setNewDocName(e.target.value)}
                        />
                        <Button onClick={handleAdd} className="w-full">
                            <Plus className="mr-2 h-5 w-5" /> Add Document
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
