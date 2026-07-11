'use client';

import { useState } from 'react';
import Link from 'next/link';
import PlaygroundEditForm from "@/app/components/PlaygroundEditForm";
import Playground from "@/app/components/Playground";
import { Playground as PlaygroundType } from "@/app/schemas/playground";
import styles from "./playground.module.css";

interface PlaygroundToggleProps {
  playground: PlaygroundType;
}

export default function PlaygroundToggle({ playground }: PlaygroundToggleProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.backNav}>
          ← Back
        </Link>

        {!isEditing && (
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{playground.name}</h1>
            <button
              onClick={() => setIsEditing(true)}
              className={styles.editButton}
            >
              Edit
            </button>
          </div>
        )}

        {isEditing ? (
          <PlaygroundEditForm 
            playground={playground} 
            onSuccess={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <Playground playground={playground} />
        )}
      </div>
    </div>
  );
}
