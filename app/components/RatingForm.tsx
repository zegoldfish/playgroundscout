"use client";

import { useState } from "react";
import { saveUserRating } from "@/app/actions/rating";
import styles from "./ratingForm.module.css";

interface RatingFormProps {
  playgroundId: string;
  userId: string;
  initialRating?: number;
  initialNotes?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function RatingForm({
  playgroundId,
  userId,
  initialRating,
  initialNotes,
  onSuccess,
  onCancel,
}: RatingFormProps) {
  const [rating, setRating] = useState(initialRating || 0);
  const [notes, setNotes] = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    if (rating === 0) {
      setError("Please select a rating");
      setSaving(false);
      return;
    }

    try {
      const result = await saveUserRating(playgroundId, userId, {
        rating,
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSuccess?.();
        }, 1200);
      } else {
        setError(result.error || "Failed to save rating");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const notesLength = notes.length;
  const maxNotes = 500;
  const notesPercentage = (notesLength / maxNotes) * 100;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Star Rating Section */}
      <div className={styles.ratingSection}>
        <label className={styles.label}>How would you rate this playground?</label>
        <div className={styles.starContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(rating === star ? 0 : star)}
              className={`${styles.starButton} ${star <= rating ? styles.starActive : styles.starInactive}`}
              title={`${star} star${star > 1 ? "s" : ""}`}
              aria-label={`Rate ${star} stars`}
            >
              {star <= rating ? "⭐" : "☆"}
            </button>
          ))}
          {rating > 0 && <span className={styles.ratingText}>{rating}/5</span>}
        </div>
      </div>

      {/* Notes Section */}
      <div className={styles.notesSection}>
        <div className={styles.notesHeader}>
          <label htmlFor="notes" className={styles.label}>
            Share your experience
          </label>
          <span className={`${styles.charCount} ${notesPercentage > 80 ? styles.charCountWarning : ""}`}>
            {notesLength}/{maxNotes}
          </span>
        </div>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => {
            if (e.target.value.length <= maxNotes) {
              setNotes(e.target.value);
            }
          }}
          placeholder="What did you think? Is it good for your kids? Any tips for other parents? ✨"
          className={styles.textarea}
          rows={5}
          maxLength={maxNotes}
        />
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${notesPercentage}%` }} />
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className={styles.errorBox}>
          <span className={styles.errorIcon}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className={styles.successBox}>
          <span className={styles.successIcon}>✓</span>
          <span>Rating and notes saved!</span>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className={styles.cancelButton}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className={styles.saveButton}
        >
          {saving ? (
            <>
              <span className={styles.spinner}>⏳</span> Saving...
            </>
          ) : (
            <>
              <span className={styles.saveIcon}>💾</span> Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
