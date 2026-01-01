import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
    updateDoc,
    query,
    orderBy
} from "firebase/firestore";

async function getAdminSecret() {
    console.log("Checking Admin Secret...");
    try {
        const configDoc = await getDoc(doc(db, "admin", "config"));
        if (configDoc.exists()) {
            return configDoc.data().secret;
        }
        return process.env.ADMIN_SECRET || "om-admin-123";
    } catch (err) {
        console.error("Secret Check Error:", err);
        return process.env.ADMIN_SECRET || "om-admin-123";
    }
}


export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get("secret");
        const ADMIN_SECRET = await getAdminSecret();

        if (secret !== ADMIN_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const codesQuery = query(collection(db, "access-codes"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(codesQuery);

        const codes = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));

        return NextResponse.json(codes);
    } catch (error: any) {
        console.error("Firestore GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, expiryDays, secret } = body;

        console.log("Attempting to create code:", code);

        const ADMIN_SECRET = await getAdminSecret();
        if (secret !== ADMIN_SECRET) {
            console.error("Unauthorized: Secret mismatch");
            return NextResponse.json({ error: "Unauthorized: Incorrect Secret" }, { status: 401 });
        }

        // Generate a valid ID using a simple random string
        const id = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);


        const newCode = {
            id,
            code: (code || "").trim().toUpperCase(),
            expiryDate: expiryDays ? Date.now() + (parseInt(expiryDays) * 24 * 60 * 60 * 1000) : null,
            isActive: true,
            isUsed: false,
            createdAt: Date.now()
        };

        if (!newCode.code) {
            newCode.code = "PRO-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        }

        console.log("Saving to Firestore...", newCode);

        await setDoc(doc(db, "access-codes", id), newCode);

        console.log("Success!");
        return NextResponse.json(newCode);
    } catch (error: any) {
        console.error("DETAILED Firestore POST error:", error);
        // Bubble up the actual Firebase error message
        return NextResponse.json({
            error: error.message || "Unknown server error",
            details: error.code || "No code"
        }, { status: 500 });
    }
}


export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, isActive, secret } = body;
        const ADMIN_SECRET = await getAdminSecret();

        if (secret !== ADMIN_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        const codeRef = doc(db, "access-codes", id);
        await updateDoc(codeRef, { isActive });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Firestore PATCH error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const secret = searchParams.get("secret");
        const ADMIN_SECRET = await getAdminSecret();

        if (secret !== ADMIN_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await deleteDoc(doc(db, "access-codes", id));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Firestore DELETE error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

