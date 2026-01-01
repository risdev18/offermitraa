import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const DEFAULT_SECRET = process.env.ADMIN_SECRET || "om-admin-123";

async function getAdminSecret() {
    try {
        const configDoc = await getDoc(doc(db, "admin", "config"));
        if (configDoc.exists()) {
            return configDoc.data().secret;
        }
        return DEFAULT_SECRET;
    } catch (error) {
        console.error("Firestore getAdminSecret error:", error);
        return DEFAULT_SECRET;
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    const adminSecret = await getAdminSecret();
    if (secret !== adminSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: "Authorized" });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { currentSecret, newSecret } = body;

        const adminSecret = await getAdminSecret();
        if (currentSecret !== adminSecret) {
            return NextResponse.json({ error: "Invalid current secret" }, { status: 401 });
        }

        if (!newSecret || newSecret.length < 5) {
            return NextResponse.json({ error: "New secret must be at least 5 characters" }, { status: 400 });
        }

        await setDoc(doc(db, "admin", "config"), {
            secret: newSecret,
            updatedAt: Date.now()
        }, { merge: true });

        return NextResponse.json({ success: true, message: "Secret updated successfully" });
    } catch (error: any) {
        console.error("Firestore POST error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

