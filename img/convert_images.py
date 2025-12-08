#!/usr/bin/env python3
# convert_images.py
# Convierte todas las imágenes de esta carpeta a PNG optimizado para web

from pathlib import Path
from PIL import Image
import sys
import subprocess
import shutil

# Carpeta de imágenes = carpeta donde está este script
IMG_DIR = Path(__file__).resolve().parent

# Extensiones soportadas por Pillow directamente
PILLOW_EXTS = {
    ".jpg", ".jpeg", ".png", ".bmp", ".gif",
    ".tif", ".tiff", ".webp", ".jfif"
}

# Extensiones que intentaremos convertir vía ImageMagick (magick)
IM_EXTS = {".wdp", ".emf"}

SUPPORTED_EXTS = PILLOW_EXTS | IM_EXTS | {".png"}


def has_imagemagick() -> bool:
    """Verifica si el comando 'magick' está disponible en el sistema."""
    return shutil.which("magick") is not None


IMAGEMAGICK_AVAILABLE = has_imagemagick()


def convert_with_imagemagick(src: Path, tmp_out: Path) -> None:
    """
    Usa ImageMagick para convertir src -> tmp_out en PNG.
    Lanza excepción si falla.
    """
    cmd = [
        "magick",
        str(src),
        "-strip",                     # quitar metadatos
        "-define", "png:compression-level=9",
        str(tmp_out),
    ]
    subprocess.run(cmd, check=True)


def convert_with_pillow(src: Path, tmp_out: Path) -> None:
    """
    Usa Pillow para convertir/optimizar a PNG.
    Lanza excepción si falla.
    """
    with Image.open(src) as im:
        # Normalizamos el modo de color a algo válido para PNG
        if im.mode in ("P", "RGBA", "LA"):
            im = im.convert("RGBA")
        else:
            im = im.convert("RGB")

        im.save(
            tmp_out,
            format="PNG",
            optimize=True,
            compress_level=9,  # 0 (rápido) - 9 (máxima compresión)
        )


def convert_to_png(img_path: Path) -> bool:
    """
    Convierte una imagen a PNG optimizado.
    - Si el archivo original no es PNG, crea name.png y elimina el original.
    - Si ya es PNG, lo optimiza en sitio.
    Devuelve True si todo salió bien.
    """
    ext = img_path.suffix.lower()

    # Definimos rutas de salida
    if ext == ".png":
        # Optimizar PNG existente (sobrescribir de forma segura)
        out_path = img_path
        tmp_out = img_path.with_name(img_path.stem + ".tmp.png")
    else:
        out_path = img_path.with_suffix(".png")
        tmp_out = out_path.with_name(out_path.name + ".tmp")

    # 1) Intentar convertir
    try:
        if ext in PILLOW_EXTS or ext == ".png":
            convert_with_pillow(img_path, tmp_out)
        elif ext in IM_EXTS:
            if not IMAGEMAGICK_AVAILABLE:
                print(
                    f"[SKIP] {img_path.name} (requiere ImageMagick: comando 'magick' no encontrado)",
                    file=sys.stderr,
                )
                return False
            convert_with_imagemagick(img_path, tmp_out)
        else:
            print(f"[SKIP] {img_path.name} (extensión no soportada)")
            return False

    except Exception as e:
        # Falló la conversión (por ejemplo, tus .wdp con JXRDecApp)
        print(f"[ERROR] No se pudo convertir {img_path.name}: {e}", file=sys.stderr)
        try:
            if tmp_out.exists():
                tmp_out.unlink()
        except Exception:
            pass
        return False

    # 2) Reemplazar de forma segura
    try:
        tmp_out.replace(out_path)
    except Exception as e:
        print(
            f"[ERROR] No se pudo reemplazar el archivo de salida para {img_path.name}: {e}",
            file=sys.stderr,
        )
        try:
            if tmp_out.exists():
                tmp_out.unlink()
        except Exception:
            pass
        return False

    # 3) Borrar original si era otro formato
    if ext != ".png":
        try:
            img_path.unlink(missing_ok=True)
        except Exception as e:
            print(
                f"[WARN] No se pudo eliminar el original {img_path.name}: {e}",
                file=sys.stderr,
            )

    print(f"[OK] {img_path.name} -> {out_path.name}")
    return True


def main() -> None:
    if not IMG_DIR.is_dir():
        print(f"La carpeta de imágenes no existe: {IMG_DIR}")
        sys.exit(1)

    if not IMAGEMAGICK_AVAILABLE:
        print(
            "Aviso: ImageMagick no está disponible (comando 'magick'). "
            "Los archivos .wdp y .emf se intentarán convertir solo con Pillow (normalmente fallará)."
        )

    total = 0
    convertidos = 0

    for img_path in sorted(IMG_DIR.iterdir()):
        if not img_path.is_file():
            continue

        ext = img_path.suffix.lower()
        if ext not in SUPPORTED_EXTS:
            print(f"[SKIP] {img_path.name} (extensión no soportada)")
            continue

        total += 1
        if convert_to_png(img_path):
            convertidos += 1

    print("\nResumen:")
    print(f"  Imágenes detectadas                 : {total}")
    print(f"  Convertidas/optimizadas correctamente: {convertidos}")


if __name__ == "__main__":
    main()
