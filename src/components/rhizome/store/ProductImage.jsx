import { useState } from "react";
import { Leaf } from "lucide-react";

/* ============================================================
   ProductImage · Imagen de prenda con respaldo
   Si la URL falla (sin conexión o enlace roto) muestra un
   degradado con los colores del tema y una hoja.
   ============================================================ */

export default function ProductImage({ src, alt, fallback, className = "", loading = "lazy" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = !src || failedSrc === src;

  return (
    <div className={`relative overflow-hidden bg-linear-to-br ${fallback} ${className}`}>
      {failed ? (
        <div role="img" aria-label={alt} className="grid size-full place-items-center">
          <Leaf className="size-1/4 text-teal-200/60" strokeWidth={1.25} aria-hidden="true" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setFailedSrc(src)}
          className="size-full object-cover"
        />
      )}
    </div>
  );
}
