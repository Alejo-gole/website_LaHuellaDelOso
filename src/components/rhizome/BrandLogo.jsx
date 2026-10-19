import { useState } from "react";

/* ============================================================
   BrandLogo · Logo de un aliado sobre un disco claro
   Si no hay logoUrl o la imagen no carga, muestra las iniciales
   de la marca con sus colores (theme.textColor / accentColor).
   · alt vacío por defecto: el nombre de la marca suele ir al lado.
   ============================================================ */

const initialsOf = (name = "") =>
  name
    .split(/\s+/)
    .filter((word) => word.length > 2 || /^[A-ZÁÉÍÓÚÑ]/.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

// Luminancia relativa de un HEX (#rgb o #rrggbb); otros formatos cuentan como claros
function luminance(color = "") {
  const hex = color.replace("#", "");
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return 1;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Las iniciales van sobre el disco claro: se usa el color más oscuro del tema
const darkestOf = (theme = {}) =>
  [theme.textColor, theme.bgColor, theme.accentColor]
    .filter(Boolean)
    .reduce((dark, color) => (luminance(color) < luminance(dark) ? color : dark), "#ffffff");

export default function BrandLogo({ logoUrl, brandName, theme, alt = "", className = "size-14" }) {
  const [failed, setFailed] = useState(false);
  const showImage = logoUrl && !failed;

  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-crema-superficie ${className}`}
      style={{ boxShadow: `0 0 0 2px ${theme?.accentColor ?? "var(--color-accent)"}` }}
    >
      {showImage ? (
        <img
          src={logoUrl}
          alt={alt}
          loading="lazy"
          draggable={false}
          onError={() => setFailed(true)}
          className="size-[68%] object-contain"
        />
      ) : (
        <span
          role={alt ? "img" : undefined}
          aria-label={alt || undefined}
          aria-hidden={alt ? undefined : true}
          className="font-display text-[1.05em] leading-none"
          style={{ color: darkestOf(theme) }}
        >
          {initialsOf(brandName)}
        </span>
      )}
    </span>
  );
}
