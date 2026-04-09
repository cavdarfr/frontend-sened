import { useState, useCallback, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { imageService } from '@/services/api';
import { cn, formatFileSize, isValidImageType } from '@/lib/utils';
import type { ImageUploadResponse } from '@/types';

interface ImageUploadProps {
    onUploadComplete?: (response: ImageUploadResponse) => void;
    maxSize?: number;
    acceptedMimeTypes?: string[];
    recommendedMinWidth?: number;
    recommendedMinHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    helperText?: string;
    className?: string;
}

const DEFAULT_ACCEPTED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/svg+xml',
];

const RASTER_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/avif',
];

const normalizeMimeType = (mimeType: string) =>
    mimeType === 'image/jpg' ? 'image/jpeg' : mimeType;

const formatAcceptedTypes = (acceptedMimeTypes: string[]) =>
    acceptedMimeTypes
        .map((mimeType) => {
            switch (mimeType) {
                case 'image/jpeg':
                    return 'JPG';
                case 'image/png':
                    return 'PNG';
                case 'image/webp':
                    return 'WebP';
                case 'image/avif':
                    return 'AVIF';
                case 'image/svg+xml':
                    return 'SVG';
                default:
                    return mimeType.replace('image/', '').toUpperCase();
            }
        })
        .join(', ');

/**
 * Composant d'upload d'image avec drag & drop et preview
 */
export function ImageUpload({
    onUploadComplete,
    maxSize = 2 * 1024 * 1024,
    acceptedMimeTypes = DEFAULT_ACCEPTED_MIME_TYPES,
    recommendedMinWidth,
    recommendedMinHeight,
    maxWidth,
    maxHeight,
    helperText,
    className,
}: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    /**
     * Valide un fichier avant upload
     */
    const validateFileDimensions = useCallback(
        async (file: File): Promise<boolean> => {
            if (!RASTER_MIME_TYPES.includes(normalizeMimeType(file.type))) {
                return true;
            }

            const objectUrl = URL.createObjectURL(file);

            try {
                const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
                    const image = new Image();
                    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
                    image.onerror = () => reject(new Error('invalid-image'));
                    image.src = objectUrl;
                });

                if (
                    (maxWidth && dimensions.width > maxWidth)
                    || (maxHeight && dimensions.height > maxHeight)
                ) {
                    toast({
                        title: 'Dimensions trop grandes',
                        description: `Le logo raster ne doit pas dépasser ${maxWidth || 0} x ${maxHeight || 0} px.`,
                        variant: 'destructive',
                    });
                    return false;
                }

                if (
                    (recommendedMinWidth && dimensions.width < recommendedMinWidth)
                    || (recommendedMinHeight && dimensions.height < recommendedMinHeight)
                ) {
                    toast({
                        title: 'Qualité conseillée',
                        description: `Logo accepté. Pour un meilleur rendu PDF, visez plutôt un format carré entre ${recommendedMinWidth || 0} x ${recommendedMinHeight || 0} px et 1024 x 1024 px.`,
                    });
                }

                return true;
            } catch {
                toast({
                    title: 'Image invalide',
                    description: 'Le fichier sélectionné n’a pas pu être lu.',
                    variant: 'destructive',
                });
                return false;
            } finally {
                URL.revokeObjectURL(objectUrl);
            }
        },
        [maxHeight, maxWidth, recommendedMinHeight, recommendedMinWidth, toast]
    );

    const validateFile = useCallback(
        async (file: File): Promise<boolean> => {
            // Vérifie le type de fichier
            if (
                !isValidImageType(file)
                || !acceptedMimeTypes.includes(normalizeMimeType(file.type))
            ) {
                toast({
                    title: 'Type de fichier invalide',
                    description: `Seuls les fichiers ${formatAcceptedTypes(acceptedMimeTypes)} sont acceptés.`,
                    variant: 'destructive',
                });
                return false;
            }

            // Vérifie la taille du fichier
            if (file.size > maxSize) {
                toast({
                    title: 'Fichier trop volumineux',
                    description: `La taille maximale est de ${formatFileSize(maxSize)}.`,
                    variant: 'destructive',
                });
                return false;
            }

            return validateFileDimensions(file);
        },
        [acceptedMimeTypes, maxSize, toast, validateFileDimensions]
    );

    /**
     * Traite un fichier sélectionné
     */
    const handleFile = useCallback(
        async (file: File) => {
            if (!(await validateFile(file))) {
                return;
            }

            // Crée une URL de prévisualisation
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);
            setSelectedFile(file);
        },
        [validateFile]
    );

    /**
     * Gère le drag over
     */
    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    /**
     * Gère le drag leave
     */
    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    /**
     * Gère le drop d'un fichier
     */
    const handleDrop = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                void handleFile(files[0]);
            }
        },
        [handleFile]
    );

    /**
     * Gère la sélection via input file
     */
    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                void handleFile(files[0]);
            }
        },
        [handleFile]
    );

    /**
     * Ouvre le sélecteur de fichiers
     */
    const openFileDialog = useCallback(() => {
        inputRef.current?.click();
    }, []);

    /**
     * Supprime le fichier sélectionné
     */
    const clearFile = useCallback(() => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setPreview(null);
        setSelectedFile(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [preview]);

    /**
     * Upload le fichier vers le backend
     */
    const uploadFile = useCallback(async () => {
        if (!selectedFile) return;

        setIsUploading(true);

        try {
            const response = await imageService.upload(selectedFile);

            toast({
                title: 'Upload réussi',
                description: `L'image ${response.fileName} a été uploadée avec succès.`,
            });

            // Callback après upload
            onUploadComplete?.(response);

            // Reset après upload réussi
            clearFile();
        } catch (error) {
            console.error('Erreur upload:', error);
            toast({
                title: 'Erreur lors de l\'upload',
                description: 'Une erreur est survenue. Veuillez réessayer.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    }, [selectedFile, clearFile, onUploadComplete, toast]);

    return (
        <Card className={cn('w-full', className)}>
            <CardContent className="p-6">
                {/* Zone de drop */}
                <div
                    className={cn(
                        'relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
                        isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-primary/50',
                        preview && 'border-solid'
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={preview ? undefined : openFileDialog}
                >
                    {/* Input file caché */}
                    <input
                        ref={inputRef}
                        type="file"
                        accept={acceptedMimeTypes.join(',')}
                        className="hidden"
                        onChange={handleInputChange}
                    />

                    {preview ? (
                        // Prévisualisation de l'image
                        <div className="relative w-full p-4">
                            <div className="mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center rounded-lg border bg-muted/20 p-4">
                                <img
                                    src={preview}
                                    alt="Prévisualisation"
                                    className="h-full w-full rounded-lg object-contain"
                                />
                            </div>

                            {/* Bouton supprimer */}
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>

                            {/* Infos du fichier */}
                            {selectedFile && (
                                <div className="mt-4 text-center">
                                    <p className="font-medium">{selectedFile.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatFileSize(selectedFile.size)}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Zone de drop vide
                        <div className="flex flex-col items-center gap-4 p-8 text-center">
                            <div className="rounded-full bg-muted p-4">
                                {isDragging ? (
                                    <Upload className="h-8 w-8 text-primary" />
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium">
                                    {isDragging ? 'Déposez l\'image ici' : 'Glissez-déposez une image'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    ou cliquez pour sélectionner
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {helperText || `${formatAcceptedTypes(acceptedMimeTypes)} • Max ${formatFileSize(maxSize)}`}
                            </p>
                        </div>
                    )}
                </div>

                {/* Bouton d'upload */}
                {selectedFile && (
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={clearFile} disabled={isUploading}>
                            Annuler
                        </Button>
                        <Button onClick={uploadFile} disabled={isUploading}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Upload en cours...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Uploader
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
