"use client";

import {
  memo,
  useEffect,
  useRef,
} from "react";

import {
  BadgeCheck,
  Fingerprint,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

function clamp(
  value,
  min,
  max,
) {
  return Math.min(
    max,
    Math.max(min, value),
  );
}

function toCssSize(value) {
  if (
    typeof value === "number"
  ) {
    return `${value}px`;
  }

  return value;
}

/* =========================================================
   THEMES
========================================================= */

const THEMES = {
  dark: {
    base: "#1d1c22",
    ink: "#f4f4f5",
    muted:
      "rgba(244,244,245,0.60)",
    rim:
      "rgba(255,255,255,0.10)",
    tile:
      "rgba(255,255,255,0.07)",
  },

  light: {
    base: "#ffffff",
    ink: "#18181b",
    muted:
      "rgba(24,24,27,0.55)",
    rim:
      "rgba(24,24,27,0.08)",
    tile:
      "rgba(24,24,27,0.05)",
  },
};

/* =========================================================
   REFLECTIVE CARD

   DROP-IN REPLACEMENT

   NO:
   @hugeicons/react
   @hugeicons/core-free-icons

   KEEPS:
   - tilt
   - reflection
   - glare
   - shine
   - rounded card
   - custom children
========================================================= */

const ReflectiveCard = ({
  name = "Alexander Doe",

  role = "Senior Developer",

  badge = "Verified",

  status = "Active",

  statusColor = "#22c55e",

  idLabel = "ID number",

  idValue = "8901 2345 6789",

  children,

  theme = "dark",

  /*
   * Kept for compatibility
   * with your existing usage.
   */
  videoSrc,

  webcam = false,

  onWebcamError,

  tint = "#ffffff",

  metalness = 1,

  roughness = 0.3,

  blurStrength = 6,

  grayscale = 0,

  warp = 0.6,

  warpScale = 1,

  shine = 1,

  bevel = 3,

  glare = 0.5,

  enableTilt = true,

  tiltStrength = 12,

  intro = true,

  width = 320,

  height = 500,

  radius = 24,

  className = "",

  style = {},
}) => {
  const rootRef =
    useRef(null);

  const cardRef =
    useRef(null);

  const rafRef =
    useRef(0);

  const activeRef =
    useRef(false);

  const hasChildren =
    children !== undefined &&
    children !== null;

  const palette =
    theme === "light"
      ? THEMES.light
      : THEMES.dark;

  /* =======================================================
     APPLY VARIABLES
  ======================================================= */

  const applyVariables = (
    variables,
  ) => {
    const card =
      cardRef.current;

    if (!card) {
      return;
    }

    Object.entries(
      variables,
    ).forEach(
      ([
        key,
        value,
      ]) => {
        card.style.setProperty(
          key,
          value,
        );
      },
    );
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetCard = () => {
    activeRef.current =
      false;

    cancelAnimationFrame(
      rafRef.current,
    );

    rafRef.current =
      requestAnimationFrame(
        () => {
          applyVariables({
            "--reflect-x":
              "50%",

            "--reflect-y":
              "50%",

            "--rotate-x":
              "0deg",

            "--rotate-y":
              "0deg",

            "--card-scale":
              "1",

            "--glare-opacity":
              "0",

            "--shine-opacity":
              "0.08",
          });
        },
      );
  };

  /* =======================================================
     GLOBAL POINTER

     Global listener is intentional.

     Your bank card has a transparent
     click button above ReflectiveCard.

     Listening from window allows the
     reflection to keep moving even when
     that button is receiving the pointer.
  ======================================================= */

  useEffect(() => {
    const handlePointerMove = (
      event,
    ) => {
      const root =
        rootRef.current;

      if (!root) {
        return;
      }

      const rect =
        root.getBoundingClientRect();

      if (
        rect.width <= 0 ||
        rect.height <= 0
      ) {
        return;
      }

      const inside =
        event.clientX >=
          rect.left &&
        event.clientX <=
          rect.right &&
        event.clientY >=
          rect.top &&
        event.clientY <=
          rect.bottom;

      if (!inside) {
        if (
          activeRef.current
        ) {
          resetCard();
        }

        return;
      }

      activeRef.current =
        true;

      const x =
        clamp(
          (event.clientX -
            rect.left) /
            rect.width,
          0,
          1,
        );

      const y =
        clamp(
          (event.clientY -
            rect.top) /
            rect.height,
          0,
          1,
        );

      const normalizedX =
        x * 2 - 1;

      const normalizedY =
        y * 2 - 1;

      const tilt =
        enableTilt
          ? clamp(
              Number(
                tiltStrength,
              ) || 0,
              0,
              30,
            )
          : 0;

      const rotateY =
        normalizedX *
        tilt;

      const rotateX =
        normalizedY *
        -tilt;

      const glareAmount =
        clamp(
          Number(glare) ||
            0,
          0,
          1,
        );

      const shineAmount =
        clamp(
          Number(shine) ||
            0,
          0,
          3,
        );

      cancelAnimationFrame(
        rafRef.current,
      );

      rafRef.current =
        requestAnimationFrame(
          () => {
            applyVariables({
              "--reflect-x": `${(
                x * 100
              ).toFixed(
                2,
              )}%`,

              "--reflect-y": `${(
                y * 100
              ).toFixed(
                2,
              )}%`,

              "--rotate-x": `${rotateX.toFixed(
                2,
              )}deg`,

              "--rotate-y": `${rotateY.toFixed(
                2,
              )}deg`,

              "--card-scale":
                "1.012",

              "--glare-opacity":
                String(
                  glareAmount,
                ),

              "--shine-opacity":
                String(
                  clamp(
                    0.15 +
                      shineAmount *
                        0.12,
                    0,
                    0.55,
                  ),
                ),
            });
          },
        );
    };

    const handlePointerEnd =
      () => {
        resetCard();
      };

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "pointercancel",
      handlePointerEnd,
      {
        passive: true,
      },
    );

    return () => {
      cancelAnimationFrame(
        rafRef.current,
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      window.removeEventListener(
        "pointercancel",
        handlePointerEnd,
      );
    };
  }, [
    enableTilt,
    glare,
    shine,
    tiltStrength,
  ]);

  /* =======================================================
     INTRO
  ======================================================= */

  useEffect(() => {
    if (!intro) {
      return;
    }

    if (
      typeof window !==
        "undefined" &&
      window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches
    ) {
      return;
    }

    applyVariables({
      "--rotate-x":
        "-4deg",

      "--rotate-y":
        "5deg",

      "--card-scale":
        "0.985",

      "--glare-opacity":
        "0.35",

      "--shine-opacity":
        "0.28",
    });

    const timer =
      window.setTimeout(
        () => {
          resetCard();
        },
        500,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [intro]);

  /* =======================================================
     WEBCAM COMPATIBILITY

     We do not request webcam access
     in this lightweight card version.
  ======================================================= */

  useEffect(() => {
    if (
      webcam &&
      typeof navigator !==
        "undefined" &&
      !navigator.mediaDevices
        ?.getUserMedia
    ) {
      onWebcamError?.(
        new Error(
          "Camera access is not available in this browser.",
        ),
      );
    }
  }, [
    webcam,
    onWebcamError,
  ]);

  /* =======================================================
     VALUES
  ======================================================= */

  const safeRadius =
    Math.max(
      0,
      Number(radius) || 0,
    );

  const safeBlur =
    clamp(
      Number(
        blurStrength,
      ) || 0,
      0,
      40,
    );

  const safeRoughness =
    clamp(
      Number(
        roughness,
      ) || 0,
      0,
      1,
    );

  const safeMetalness =
    clamp(
      Number(
        metalness,
      ) || 0,
      0,
      1,
    );

  const safeGrayscale =
    clamp(
      Number(
        grayscale,
      ) || 0,
      0,
      1,
    );

  const safeWarp =
    clamp(
      Number(warp) || 0,
      0,
      2,
    );

  const safeWarpScale =
    clamp(
      Number(
        warpScale,
      ) || 1,
      0.2,
      4,
    );

  const safeBevel =
    clamp(
      Number(bevel) || 0,
      0,
      16,
    );

  /* =======================================================
     STYLE
  ======================================================= */

  const rootStyle = {
    width:
      toCssSize(width),

    height:
      toCssSize(height),

    perspective:
      "1000px",

    ...style,
  };

  const bodyStyle = {
    "--reflect-x": "50%",

    "--reflect-y": "50%",

    "--rotate-x": "0deg",

    "--rotate-y": "0deg",

    "--card-scale": "1",

    "--glare-opacity":
      "0",

    "--shine-opacity":
      "0.08",

    borderRadius: `${safeRadius}px`,

    background:
      hasChildren
        ? "transparent"
        : palette.base,

    color:
      palette.ink,

    boxShadow:
      style?.[
        "--rc-shadow"
      ] ||
      (hasChildren
        ? "none"
        : theme ===
            "light"
          ? "0 18px 45px -20px rgba(15,23,42,0.28)"
          : "0 20px 46px -20px rgba(0,0,0,0.72)"),

    transform:
      "rotateX(var(--rotate-x)) rotateY(var(--rotate-y)) scale(var(--card-scale))",

    transformStyle:
      "preserve-3d",

    transition:
      "transform 180ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 180ms ease",

    willChange:
      "transform",

    /*
     * Keep props active so CardsPage
     * can tune the appearance.
     */
    filter: `grayscale(${safeGrayscale})`,

    "--reflection-blur": `${Math.max(
      0,
      safeBlur * 0.25,
    )}px`,

    "--reflection-metal":
      safeMetalness,

    "--reflection-rough":
      safeRoughness,

    "--reflection-warp":
      safeWarp,

    "--reflection-warp-scale":
      safeWarpScale,

    "--reflection-bevel":
      `${safeBevel}px`,
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      ref={rootRef}
      className={[
        "relative box-border max-w-full select-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={rootStyle}
    >
      <div
        ref={cardRef}
        className="
          relative
          box-border
          h-full
          w-full
          overflow-hidden
        "
        style={bodyStyle}
      >
        {/* ===============================================
            OPTIONAL VIDEO
        =============================================== */}

        {videoSrc &&
          !hasChildren && (
            <video
              src={videoSrc}
              muted
              loop
              autoPlay
              playsInline
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
              "
            />
          )}

        {/* ===============================================
            CONTENT

            When CardsPage passes an image,
            it fills this area directly.
        =============================================== */}

        <div
          className={`
            relative
            z-[1]
            box-border
            h-full
            w-full

            ${
              hasChildren
                ? "p-0"
                : "flex flex-col p-5"
            }
          `}
        >
          {hasChildren ? (
            children
          ) : (
            <>
              {/* BADGE */}

              {(badge ||
                status) && (
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-[13px]
                    leading-5
                  "
                >
                  {badge && (
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        font-medium
                      "
                    >
                      <BadgeCheck
                        size={
                          16
                        }
                        strokeWidth={
                          1.8
                        }
                      />

                      {badge}
                    </span>
                  )}

                  {status && (
                    <span
                      className="
                        ml-auto
                        inline-flex
                        items-center
                        gap-2
                      "
                      style={{
                        color:
                          palette.muted,
                      }}
                    >
                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                        "
                        style={{
                          background:
                            statusColor,
                        }}
                      />

                      {status}
                    </span>
                  )}
                </div>
              )}

              {/* NAME */}

              <div
                className="
                  mt-auto
                "
              >
                {name && (
                  <h3
                    className="
                      m-0
                      text-[24px]
                      font-medium
                      leading-[1.15]
                      tracking-[-0.02em]
                    "
                  >
                    {name}
                  </h3>
                )}

                {role && (
                  <p
                    className="
                      mb-0
                      mt-1
                      text-[14px]
                      leading-[1.4]
                    "
                    style={{
                      color:
                        palette.muted,
                    }}
                  >
                    {role}
                  </p>
                )}
              </div>

              {/* ID */}

              {(idLabel ||
                idValue) && (
                <div
                  className="
                    mt-6
                    flex
                    items-end
                    justify-between
                    gap-4
                  "
                >
                  <div
                    className="
                      flex
                      min-w-0
                      flex-col
                      gap-1
                    "
                  >
                    {idLabel && (
                      <span
                        className="
                          text-[12px]
                          leading-4
                        "
                        style={{
                          color:
                            palette.muted,
                        }}
                      >
                        {
                          idLabel
                        }
                      </span>
                    )}

                    {idValue && (
                      <span
                        className="
                          overflow-hidden
                          text-ellipsis
                          whitespace-nowrap
                          font-mono
                          text-[15px]
                          leading-5
                          tracking-[0.02em]
                          tabular-nums
                        "
                      >
                        {
                          idValue
                        }
                      </span>
                    )}
                  </div>

                  <span
                    className="
                      relative
                      flex
                      h-11
                      w-11
                      flex-none
                      items-center
                      justify-center
                      rounded-xl
                    "
                    style={{
                      background:
                        palette.tile,

                      border: `1px solid ${palette.rim}`,
                    }}
                  >
                    <Fingerprint
                      size={
                        22
                      }
                      strokeWidth={
                        1.6
                      }
                    />
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* ===============================================
            TINT

            Very subtle.
            Does not hide card artwork.
        =============================================== */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            z-[2]
          "
          style={{
            borderRadius:
              `${safeRadius}px`,

            background:
              `linear-gradient(
                135deg,
                ${tint}08 0%,
                transparent 38%,
                ${tint}03 100%
              )`,
          }}
        />

        {/* ===============================================
            MOVING GLARE
        =============================================== */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            z-[3]
          "
          style={{
            borderRadius:
              `${safeRadius}px`,

            opacity:
              "var(--glare-opacity)",

            transition:
              "opacity 200ms ease",

            background: `
              radial-gradient(
                circle at var(--reflect-x) var(--reflect-y),
                rgba(255,255,255,0.48) 0%,
                rgba(255,255,255,0.18) 13%,
                rgba(255,255,255,0.05) 27%,
                transparent 48%
              )
            `,

            mixBlendMode:
              "screen",

            filter:
              "blur(var(--reflection-blur))",
          }}
        />

        {/* ===============================================
            REFLECTIVE LIGHT STREAK
        =============================================== */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            z-[4]
          "
          style={{
            borderRadius:
              `${safeRadius}px`,

            opacity:
              "var(--shine-opacity)",

            transition:
              "opacity 200ms ease",

            background: `
              linear-gradient(
                115deg,
                transparent 20%,
                rgba(255,255,255,0.04) 35%,
                rgba(255,255,255,0.30) 48%,
                rgba(255,255,255,0.06) 60%,
                transparent 78%
              )
            `,

            transform: `
              translateX(
                calc(
                  (
                    var(--reflect-x) - 50%
                  ) * 0.35
                )
              )
            `,

            mixBlendMode:
              "screen",
          }}
        />

        {/* ===============================================
            RIM
        =============================================== */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            z-[5]
          "
          style={{
            borderRadius:
              `${safeRadius}px`,

            boxShadow: `
              inset 0 0 0 1px ${palette.rim},
              inset 0 1px 0 rgba(255,255,255,0.12)
            `,
          }}
        />
      </div>
    </div>
  );
};

export default memo(
  ReflectiveCard,
);