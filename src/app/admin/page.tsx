"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Shield, Clock, UserCheck, Calendar } from "lucide-react";

export default function AdminPage() {
    const [secret, setSecret] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [codes, setCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newCodeField, setNewCodeField] = useState("");
    const [expiryDays, setExpiryDays] = useState("30");
    const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

    useEffect(() => {
        const savedSecret = localStorage.getItem("admin_secret");
        if (savedSecret) {
            setSecret(savedSecret);
            fetchCodes(savedSecret);
        }
    }, []);

    async function fetchCodes(providedSecret?: string) {
        const secretToUse = providedSecret || secret;
        if (!secretToUse) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/access-codes?secret=${secretToUse}`);
            if (res.ok) {
                const data = await res.json();
                setCodes(data);
                setIsAuthorized(true);
                localStorage.setItem("admin_secret", secretToUse);
            } else {
                if (!providedSecret) {
                    const data = await res.json();
                    alert(data.error || "Authorization failed");
                }
                localStorage.removeItem("admin_secret");
            }
        } catch (err) {
            console.error(err);
            if (!providedSecret) alert("Failed to fetch codes");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateCode(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const codeToCreate = newCodeField || `OM-PRO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        try {
            const res = await fetch("/api/admin/access-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: codeToCreate,
                    expiryDays: parseInt(expiryDays),
                    secret
                })
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                console.error("Non-JSON response:", text);
                throw new Error("Server error (check console)");
            }

            const data = await res.json();

            if (res.ok) {
                setNewCodeField("");
                alert("✅ Code created: " + data.code);
                await fetchCodes();
            } else {
                alert("❌ Error: " + (data.error || "Failed to create code"));
            }
        } catch (err: any) {
            console.error("Fetch Exception:", err);
            alert("❌ Connection Error: Check your terminal.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this code?")) return;

        try {
            const res = await fetch(`/api/admin/access-codes?id=${id}&secret=${secret}`, {
                method: "DELETE"
            });

            if (res.ok) {
                alert("✅ Deleted!");
                await fetchCodes();
            } else {
                const data = await res.json();
                alert("❌ Error: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Failed to delete");
        }
    }

    async function handleBulkDelete() {
        if (selectedCodes.length === 0) return;
        if (!confirm(`Delete ${selectedCodes.length} code(s)?`)) return;

        try {
            for (const id of selectedCodes) {
                await fetch(`/api/admin/access-codes?id=${id}&secret=${secret}`, {
                    method: "DELETE"
                });
            }
            alert(`✅ Deleted ${selectedCodes.length} code(s)`);
            setSelectedCodes([]);
            await fetchCodes();
        } catch (err) {
            console.error(err);
            alert("❌ Failed to delete some codes");
        }
    }

    function toggleSelectAll() {
        if (selectedCodes.length === codes.length) {
            setSelectedCodes([]);
        } else {
            setSelectedCodes(codes.map(c => c.id));
        }
    }

    function toggleSelect(id: string) {
        if (selectedCodes.includes(id)) {
            setSelectedCodes(selectedCodes.filter(cid => cid !== id));
        } else {
            setSelectedCodes([...selectedCodes, id]);
        }
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
                    <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                        <Shield className="text-blue-600 w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
                    <p className="text-gray-700 mb-8">Enter admin secret to continue</p>
                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="Admin Secret"
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-gray-900 focus:border-blue-500 outline-none"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchCodes()}
                        />
                        <button
                            onClick={() => fetchCodes()}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Authorize"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Access Code Manager</h1>
                        <p className="text-gray-900 font-medium">Manage Pro membership for OfferMitra</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsAuthorized(false);
                            setSecret("");
                            localStorage.removeItem("admin_secret");
                        }}
                        className="bg-white border-2 border-gray-300 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-600" /> Create New Code
                        </h2>
                        <form onSubmit={handleCreateCode} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Custom Code (Optional)"
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-gray-900 font-mono focus:border-blue-500 outline-none"
                                value={newCodeField}
                                onChange={(e) => setNewCodeField(e.target.value)}
                            />
                            <div className="flex gap-4">
                                <select
                                    className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-gray-900 focus:border-blue-500 outline-none"
                                    value={expiryDays}
                                    onChange={(e) => setExpiryDays(e.target.value)}
                                >
                                    <option value="1">1 Day</option>
                                    <option value="7">7 Days</option>
                                    <option value="30">30 Days</option>
                                    <option value="90">90 Days</option>
                                    <option value="365">1 Year</option>
                                </select>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Generate
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-red-600" /> Administrative Settings
                        </h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const newSec = (e.target as any).newSecret.value;
                            if (newSec.length < 5) return alert("Secret too short");

                            try {
                                const res = await fetch("/api/admin/config", {
                                    method: "POST",
                                    body: JSON.stringify({ currentSecret: secret, newSecret: newSec })
                                });

                                if (res.ok) {
                                    alert("✅ Secret updated! Re-authorizing...");
                                    localStorage.setItem("admin_secret", newSec);
                                    setSecret(newSec);
                                    (e.target as any).reset();
                                } else {
                                    alert("❌ Error: " + (await res.json()).error);
                                }
                            } catch (err) {
                                alert("❌ Error updating secret");
                            }
                        }} className="space-y-4">
                            <input
                                name="newSecret"
                                type="password"
                                placeholder="Enter New Admin Secret"
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-gray-900 focus:border-red-500 outline-none"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all"
                            >
                                Update Admin Secret
                            </button>
                        </form>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Active Codes ({codes.length})</h2>
                        <div className="flex gap-3">
                            {selectedCodes.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete Selected ({selectedCodes.length})
                                </button>
                            )}
                            <button onClick={() => fetchCodes()} className="text-blue-600 font-bold text-sm hover:text-blue-800">
                                Refresh List
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-4 py-4 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedCodes.length === codes.length && codes.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase">Code</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase">Created</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase">Expires</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {codes.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedCodes.includes(item.id)}
                                                onChange={() => toggleSelect(item.id)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-gray-900">{item.code}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold w-fit ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {item.isActive ? 'ACTIVE' : 'DISABLED'}
                                                </span>
                                                {item.isUsed && (
                                                    <span className="flex items-center gap-1 text-xs text-orange-700 font-bold">
                                                        <UserCheck className="w-3 h-3" /> USED {item.usedAt && new Date(item.usedAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'Never'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {codes.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-600 font-medium">
                                            No codes generated yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
