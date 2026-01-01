import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc
} from "firebase/firestore";

export async function POST(req: Request) {
    try {
        const { code, checkOnly } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        const codesQuery = query(
            collection(db, "access-codes"),
            where("code", "==", code.trim().toUpperCase())
        );
        const querySnapshot = await getDocs(codesQuery);

        if (querySnapshot.empty) {
            return NextResponse.json({ error: "Invalid Access Code" }, { status: 404 });
        }

        const codeDoc = querySnapshot.docs[0];
        const codeData = codeDoc.data();

        // 1. Check if Active
        if (!codeData.isActive) {
            return NextResponse.json({ error: "This code is disabled" }, { status: 403 });
        }

        // 2. Check Expiry
        if (codeData.expiryDate && codeData.expiryDate < Date.now()) {
            return NextResponse.json({ error: "This code has expired" }, { status: 403 });
        }

        // 3. Mark as used if NOT just checking
        if (!checkOnly) {
            if (codeData.isUsed) {
                return NextResponse.json({ error: "This code has already been used" }, { status: 403 });
            }

            await updateDoc(doc(db, "access-codes", codeDoc.id), {
                isUsed: true,
                usedAt: Date.now()
            });
        }

        return NextResponse.json({
            success: true,
            message: checkOnly ? "Code is valid" : "Pro Status Unlocked! 🎉"
        });

    } catch (error: any) {
        console.error("Validation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

