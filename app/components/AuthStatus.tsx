"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import styles from "./authStatus.module.css";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className={styles.status}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      {session?.user ? (
        <div className={styles.userMenu}>
          <span className={styles.userName}>{session.user.name || session.user.email}</span>
          <button
            onClick={() => signOut({ redirect: true })}
            className={styles.signOutButton}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <Link href="/auth/signin" className={styles.signInLink}>
          Sign In
        </Link>
      )}
    </div>
  );
}
