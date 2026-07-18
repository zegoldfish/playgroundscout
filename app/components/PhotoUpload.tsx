"use client";

import { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  Typography,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { getPhotoUploadUrl, addPhotoToPlayground, removePhotoFromPlayground, getPresignedPhotoUrl } from "@/app/actions/photo";

interface PhotoUploadProps {
  parkId: string;
  photoKeys: string[];
  onPhotoKeysChanged: (updatedKeys: string[]) => void;
}

interface PendingFile {
  file: File;
  previewUrl: string;
}

interface RejectedFile {
  name: string;
  reason: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 10MB)`;
  }
  return null;
}

export default function PhotoUpload({ parkId, photoKeys, onPhotoKeysChanged }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<RejectedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<Map<string, string>>(new Map());
  const [loadingExisting, setLoadingExisting] = useState(true);

  // Fetch presigned URLs for existing photos
  useEffect(() => {
    const fetchExistingUrls = async () => {
      setLoadingExisting(true);
      const urls = new Map<string, string>();

      for (const key of photoKeys) {
        const result = await getPresignedPhotoUrl(key);
        if ("url" in result) {
          urls.set(key, result.url);
        }
      }

      setExistingPhotoUrls(urls);
      setLoadingExisting(false);
    };

    if (photoKeys.length > 0) {
      fetchExistingUrls();
    } else {
      setExistingPhotoUrls(new Map());
      setLoadingExisting(false);
    }
  }, [photoKeys]);

  const processFiles = (fileList: FileList) => {
    const validFiles: PendingFile[] = [];
    const invalid: RejectedFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validationError = validateFile(file);

      if (validationError) {
        invalid.push({ name: file.name, reason: validationError });
      } else {
        const previewUrl = URL.createObjectURL(file);
        validFiles.push({ file, previewUrl });
      }
    }

    setPendingFiles((prev) => [...prev, ...validFiles]);
    if (invalid.length > 0) {
      setRejectedFiles((prev) => [...prev, ...invalid]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removePendingFile = (previewUrl: string) => {
    const file = pendingFiles.find((f) => f.previewUrl === previewUrl);
    if (file) {
      URL.revokeObjectURL(previewUrl);
      setPendingFiles((prev) => prev.filter((f) => f.previewUrl !== previewUrl));
    }
  };

  const clearAll = () => {
    pendingFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setPendingFiles([]);
  };

  const handleUpload = async () => {
    setUploading(true);
    setError(null);
    const newKeys = [...photoKeys];

    for (let i = 0; i < pendingFiles.length; i++) {
      const { file } = pendingFiles[i];
      setUploadProgress(`Uploading ${i + 1} of ${pendingFiles.length}: ${file.name}`);

      const result = await getPhotoUploadUrl(parkId, file.name, file.type);
      if ("error" in result) {
        setError(result.error);
        break;
      }

      const { uploadUrl, photoKey } = result;

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        setError(`Failed to upload ${file.name}`);
        break;
      }

      const addResult = await addPhotoToPlayground(parkId, photoKey);
      if (!addResult.success) {
        setError(addResult.error ?? "Failed to save photo");
        break;
      }

      newKeys.push(photoKey);
    }

    // Cleanup preview URLs
    pendingFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));

    setUploading(false);
    setUploadProgress(null);
    setPendingFiles([]);
    onPhotoKeysChanged(newKeys);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteExisting = async (photoKey: string) => {
    setError(null);
    const result = await removePhotoFromPlayground(parkId, photoKey);
    if (!result.success) {
      setError(result.error ?? "Failed to remove photo");
      return;
    }
    onPhotoKeysChanged(photoKeys.filter((k) => k !== photoKey));
  };

  return (
    <Box>
      {/* Rejected Files Alert */}
      {rejectedFiles.length > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          onClose={() => setRejectedFiles([])}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setRejectedFiles([])}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              {rejectedFiles.length} file(s) rejected:
            </Typography>
            {rejectedFiles.map((rejected, idx) => (
              <Typography key={idx} variant="caption" sx={{ display: "block" }}>
                • {rejected.name}: {rejected.reason}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Existing Photos */}
      {photoKeys.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Current Photos
          </Typography>
          {loadingExisting ? (
            <CircularProgress size={24} sx={{ mb: 2 }} />
          ) : (
            <>
              <ImageList cols={3} gap={8} sx={{ width: "100%", mt: 0, mb: 2 }}>
                {photoKeys.map((key) => (
                  <ImageListItem key={key}>
                    <Box
                      component="img"
                      src={existingPhotoUrls.get(key)}
                      alt="Playground photo"
                      loading="lazy"
                      sx={{ width: "100%", borderRadius: 1, display: "block" }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.2s",
                        borderRadius: 1,
                        "&:hover": {
                          opacity: 1,
                        },
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{ color: "white" }}
                        onClick={() => handleDeleteExisting(key)}
                        aria-label="Delete photo"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ImageListItem>
                ))}
              </ImageList>
              <Divider sx={{ my: 2 }} />
            </>
          )}
        </>
      )}

      {/* Drop Zone */}
      {!uploading && (
        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            border: "2px dashed",
            borderColor: isDragging ? "primary.main" : "divider",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            bgcolor: isDragging ? "action.hover" : "background.paper",
            transition: "all 0.2s",
            cursor: "pointer",
            mb: 2,
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUploadIcon
            sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
          />
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Drag photos here or click to browse
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supported: JPEG, PNG, WebP, GIF (max 10MB each)
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            multiple
            style={{ display: "none" }}
            onChange={handleFileInput}
          />
        </Box>
      )}

      {/* Pending Files Preview */}
      {pendingFiles.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Ready to upload ({pendingFiles.length})
          </Typography>
          <ImageList cols={3} gap={8} sx={{ width: "100%", mt: 0, mb: 2 }}>
            {pendingFiles.map((pending) => (
              <ImageListItem key={pending.previewUrl}>
                <Box
                  component="img"
                  src={pending.previewUrl}
                  alt="Preview"
                  sx={{
                    width: "100%",
                    borderRadius: 1,
                    display: "block",
                    border: "2px solid",
                    borderColor: "primary.main",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    bgcolor: "rgba(0, 0, 0, 0.6)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{ color: "white" }}
                    onClick={() => removePendingFile(pending.previewUrl)}
                    aria-label="Remove file"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ImageListItem>
            ))}
          </ImageList>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading}
              sx={{ flex: 1 }}
            >
              {uploading ? "Uploading..." : `Upload ${pendingFiles.length} Photo(s)`}
            </Button>
            <Button
              variant="outlined"
              onClick={clearAll}
              disabled={uploading}
            >
              Clear All
            </Button>
          </Stack>

          {uploadProgress && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                {uploadProgress}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
