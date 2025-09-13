import { app } from "./firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, getDocs, query, where } from "firebase/firestore";

const auth = getAuth(app);
const db = getFirestore(app);

export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
}

// Mark a level as completed and unlock levels from unlocks array
import puzzle_order from './data/reverse_minesweeper_puzzle_order.json';
export async function markLevelCompleted(userId: string, levelId: string) {
    await setDoc(doc(db, "users", userId, "levels", levelId), {
        completed: true,
        unlocked: true,
        timestamp: Date.now(),
    });
    // Find unlocks for this level
    const puzzle = puzzle_order.puzzles.find((p: { id: string }) => p.id === levelId);
    if (puzzle && puzzle.unlocks) {
        for (const unlockId of puzzle.unlocks) {
            await setDoc(doc(db, "users", userId, "levels", unlockId), {
                completed: false,
                unlocked: true,
                timestamp: Date.now(),
            }, { merge: true });
        }
    }
}

// Unlock the first level for a new user if none unlocked
export async function ensureFirstLevelUnlocked(userId: string) {
    const unlocked = await getUnlockedLevels(userId);
    if (unlocked.length === 0) {
        console.log("Unlocking first level for new user");
        const firstLevelId = puzzle_order.puzzles[0].id;
        await setDoc(doc(db, "users", userId, "levels", firstLevelId), {
            completed: false,
            unlocked: true,
            timestamp: Date.now(),
        }, { merge: true });
    }
}

// Get unlocked levels for a user
export async function getUnlockedLevels(userId: string): Promise<string[]> {
    const levelsRef = collection(db, "users", userId, "levels");
    const q = query(levelsRef, where("unlocked", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.id);
}
