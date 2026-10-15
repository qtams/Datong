import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Building2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import toast from "react-hot-toast";

import PageHeader from "../../components/PageHeader";

import CardFormModal from "../../components/modals/CardFormModal";

import {
  createCard,
  deleteCard,
  getCardCatalog,
  updateCard,
} from "../../services/cardCatalogApi";

import { confirmAction } from "../../utils/sweetAlert";

/* =========================================================
   SECTIONS
========================================================= */

const CARD_SECTIONS = [
  {
    id: "e_wallet",
    title: "E-Wallet",
    icon: WalletCards,
  },

  {
    id: "bank",
    title: "Banks",
    icon: Building2,
  },
];

/* =========================================================
   TILT
========================================================= */

const MAX_TILT = 8;

/* =========================================================
   SORT
========================================================= */

function sortByName(first, second) {
  return String(first?.name || "").localeCompare(String(second?.name || ""));
}

/* =========================================================
   MOBILE FLOATING ADD
========================================================= */

function MobileFloatingAddButton({
  onClick,
  label = "Add card",
  disabled = false,
}) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
      initial={{
        opacity: 0,
        scale: 0.75,
        y: 14,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.8,
        y: 10,
      }}
      whileTap={
        disabled
          ? undefined
          : {
              scale: 0.88,
            }
      }
      transition={{
        type: "spring",
        stiffness: 460,
        damping: 28,
      }}
      className="
        fixed
        right-5
        z-[90]

        flex
        h-[58px]
        w-[58px]
        items-center
        justify-center

        rounded-full

        border-[4px]
        border-[#f7f7f8]

        bg-black
        text-white

        shadow-[0_10px_24px_rgba(0,0,0,0.22)]

        outline-none

        active:bg-gray-800

        disabled:opacity-50

        sm:hidden
      "
      style={{
        bottom: "calc(112px + env(safe-area-inset-bottom))",
      }}
    >
      <Plus size={23} strokeWidth={2} />
    </motion.button>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function CardCatalogSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1800px]">
      <div className="mb-8">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />

        <div className="mt-3 h-3 w-72 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="space-y-12">
        {[1, 2].map((section) => (
          <section key={section}>
            <div className="mb-5 h-4 w-24 animate-pulse rounded bg-gray-200" />

            <div
              className="
                  flex
                  gap-4
                  overflow-hidden

                  sm:grid
                  sm:grid-cols-2
                  sm:gap-5

                  xl:grid-cols-3

                  2xl:grid-cols-4
                "
            >
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="
                        w-[86vw]
                        max-w-[430px]
                        shrink-0

                        sm:w-auto
                        sm:max-w-none
                      "
                >
                  <div
                    className="
                          grid
                          grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]
                          items-end
                          gap-2
                        "
                  >
                    <div className="aspect-[1.586/1] animate-pulse rounded-[18px] bg-gray-200" />

                    <div className="aspect-[0.64/1] animate-pulse rounded-[18px] bg-gray-200" />
                  </div>

                  <div className="mt-2 ml-auto h-8 w-16 animate-pulse rounded-full bg-gray-100" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   REFLECTIVE IMAGE
========================================================= */

function ReflectiveImage({ src, alt, orientation = "landscape" }) {
  const frameRef = useRef(null);

  const tiltRef = useRef(null);

  const rafRef = useRef(0);

  const portrait = orientation === "portrait";

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* =======================================================
     APPLY VARIABLES
  ======================================================= */

  const apply = useCallback((values) => {
    const element = tiltRef.current;

    if (!element) {
      return;
    }

    Object.entries(values).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });
  }, []);

  /* =======================================================
     POINTER MOVE
  ======================================================= */

  const handlePointerMove = (event) => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const rect = frame.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    const x = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / rect.width),
    );

    const y = Math.min(
      1,
      Math.max(0, (event.clientY - rect.top) / rect.height),
    );

    cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      apply({
        "--mx": `${(x * 100).toFixed(2)}%`,

        "--my": `${(y * 100).toFixed(2)}%`,

        "--rx": `${((0.5 - y) * MAX_TILT * 2).toFixed(2)}deg`,

        "--ry": `${((x - 0.5) * MAX_TILT * 2).toFixed(2)}deg`,

        "--scale": "1.015",

        "--glare": "1",
      });
    });
  };

  /* =======================================================
     POINTER LEAVE
  ======================================================= */

  const handlePointerLeave = () => {
    cancelAnimationFrame(rafRef.current);

    apply({
      "--rx": "0deg",
      "--ry": "0deg",
      "--scale": "1",
      "--glare": "0",
    });
  };

  /* =======================================================
     MASK
  ======================================================= */

  const maskStyle = {
    WebkitMaskImage: `url("${src}")`,

    maskImage: `url("${src}")`,

    WebkitMaskSize: "cover",

    maskSize: "cover",

    WebkitMaskRepeat: "no-repeat",

    maskRepeat: "no-repeat",

    WebkitMaskPosition: "center",

    maskPosition: "center",
  };

  return (
    <div
      ref={frameRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      className="w-full select-none bg-transparent"
      style={{
        aspectRatio: portrait ? "0.64 / 1" : "1.586 / 1",

        perspective: "1000px",
      }}
    >
      <div
        ref={tiltRef}
        className="
          relative
          h-full
          w-full

          overflow-hidden

          rounded-[18px]

          bg-transparent

          will-change-transform
        "
        style={{
          "--mx": "50%",
          "--my": "50%",
          "--rx": "0deg",
          "--ry": "0deg",
          "--scale": "1",
          "--glare": "0",

          transform:
            "rotateX(var(--rx)) rotateY(var(--ry)) scale(var(--scale))",

          transformStyle: "preserve-3d",

          transition: "transform 180ms ease-out",

          filter: "none",
          boxShadow: "none",
        }}
      >
        {/* IMAGE */}

        <img
          src={src}
          alt={alt}
          title={alt}
          loading="lazy"
          draggable={false}
          crossOrigin="anonymous"
          className="
            absolute
            inset-0

            h-full
            w-full

            select-none

            rounded-[18px]

            object-cover
          "
        />

        {/* SOFT REFLECTION */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            rounded-[18px]
          "
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.14), transparent 38%, rgba(0,0,0,0.02))",

            mixBlendMode: "soft-light",
          }}
        />

        {/* GLARE */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
          "
          style={{
            ...maskStyle,

            opacity: "var(--glare)",

            transition: "opacity 200ms ease-out",

            background:
              "radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.14) 26%, transparent 58%)",

            mixBlendMode: "soft-light",
          }}
        />

        {/* SHEEN */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
          "
          style={{
            ...maskStyle,

            opacity: "calc(var(--glare) * 0.75)",

            transition: "opacity 200ms ease-out",

            background:
              "linear-gradient(115deg, transparent calc(var(--mx) - 24%), rgba(255,255,255,0.30) var(--mx), transparent calc(var(--mx) + 24%))",

            mixBlendMode: "overlay",
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   CATALOG CARD
========================================================= */

function CatalogCard({ card, deleting = false, onEdit, onDelete }) {
  const hasLandscape = Boolean(card.landscape_image_url);

  const hasPortrait = Boolean(card.portrait_image_url);

  const hasBoth = hasLandscape && hasPortrait;

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
      className="
        group

        w-[86vw]
        max-w-[430px]

        shrink-0
        snap-start

        bg-transparent

        sm:w-auto
        sm:max-w-none
        sm:shrink
        sm:snap-none
      "
    >
      {/* =================================================
          IMAGES
      ================================================= */}

      <div className="w-full bg-transparent">
        {hasBoth ? (
          <div
            className="
              grid
              w-full

              grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]

              items-end

              gap-2
            "
          >
            <ReflectiveImage
              src={card.landscape_image_url}
              alt={`${card.name} landscape`}
              orientation="landscape"
            />

            <ReflectiveImage
              src={card.portrait_image_url}
              alt={`${card.name} portrait`}
              orientation="portrait"
            />
          </div>
        ) : (
          <>
            {hasLandscape && (
              <div className="w-full">
                <ReflectiveImage
                  src={card.landscape_image_url}
                  alt={`${card.name} landscape`}
                  orientation="landscape"
                />
              </div>
            )}

            {!hasLandscape && hasPortrait && (
              <div className="mx-auto w-[48%]">
                <ReflectiveImage
                  src={card.portrait_image_url}
                  alt={`${card.name} portrait`}
                  orientation="portrait"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* =================================================
          ACTIONS

          IMPORTANT:
          Actions are BELOW the images.

          Nothing covers the portrait artwork anymore.
      ================================================= */}

      <div
        className="
          mt-2

          flex
          items-center
          justify-end
          gap-1.5

          sm:opacity-0
          sm:transition-opacity
          sm:group-hover:opacity-100
          sm:group-focus-within:opacity-100
        "
      >
        {/* EDIT */}

        <button
          type="button"
          disabled={deleting}
          onClick={() => onEdit?.(card)}
          aria-label={`Edit ${card.name}`}
          title={`Edit ${card.name}`}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center

            rounded-full

            border
            border-gray-200

            bg-white

            text-gray-500

            transition-colors

            hover:border-gray-300
            hover:bg-gray-100
            hover:text-gray-950

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Pencil size={12} strokeWidth={1.7} />
        </button>

        {/* DELETE */}

        <button
          type="button"
          disabled={deleting}
          onClick={() => onDelete?.(card)}
          aria-label={`Delete ${card.name}`}
          title={`Delete ${card.name}`}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center

            rounded-full

            border
            border-gray-200

            bg-white

            text-gray-500

            transition-colors

            hover:border-red-200
            hover:bg-red-50
            hover:text-red-500

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {deleting ? (
            <span className="h-3 w-3 animate-spin rounded-full border border-current/30 border-t-current" />
          ) : (
            <Trash2 size={12} strokeWidth={1.7} />
          )}
        </button>
      </div>
    </motion.article>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyCard({ label, onAdd }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="
        flex

        min-h-[220px]

        w-[86vw]
        max-w-[430px]

        shrink-0
        snap-start

        flex-col
        items-center
        justify-center

        rounded-[18px]

        border
        border-dashed
        border-gray-300

        bg-transparent

        text-gray-400

        transition-colors

        hover:border-gray-400
        hover:text-gray-800

        sm:w-auto
        sm:max-w-none
        sm:shrink
        sm:snap-none
      "
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-current">
        <Plus size={16} strokeWidth={1.6} />
      </div>

      <span className="mt-3 text-[10px] font-medium">Add {label}</span>
    </button>
  );
}

/* =========================================================
   SECTION
========================================================= */

function CardSection({
  section,
  cards,
  deletingId,
  onEdit,
  onDelete,
  onAdd,
  searching = false,
}) {
  const Icon = section.icon;

  if (searching && cards.length === 0) {
    return null;
  }

  return (
    <section className="min-w-0 bg-transparent">
      {/* =================================================
          TITLE
      ================================================= */}

      <div className="mb-4 flex items-center gap-2">
        <Icon size={14} strokeWidth={1.6} className="text-gray-500" />

        <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-gray-950">
          {section.title}
        </h2>

        <span className="text-[9px] font-semibold text-gray-400">
          {cards.length}
        </span>
      </div>

      {/* =================================================
          MOBILE SWIPE / DESKTOP GRID
      ================================================= */}

      <div
        className="
          flex
          w-full

          gap-4

          overflow-x-auto
          overflow-y-visible

          overscroll-x-contain

          bg-transparent

          pb-1
          pr-5

          snap-x
          snap-mandatory

          [-webkit-overflow-scrolling:touch]

          [scrollbar-width:none]

          [&::-webkit-scrollbar]:hidden

          sm:grid
          sm:grid-cols-2
          sm:gap-x-5
          sm:gap-y-10

          sm:overflow-visible

          sm:pb-0
          sm:pr-0

          sm:snap-none

          xl:grid-cols-3

          2xl:grid-cols-4
        "
      >
        <AnimatePresence mode="popLayout">
          {cards.map((card) => (
            <CatalogCard
              key={card.id}
              card={card}
              deleting={deletingId === card.id}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>

        {cards.length === 0 && (
          <EmptyCard label={section.title} onAdd={onAdd} />
        )}
      </div>

      {cards.length > 1 && (
        <p className="mt-2 text-[8px] text-gray-400 sm:hidden">
          Swipe to view more
        </p>
      )}
    </section>
  );
}

/* =========================================================
   PAGE
========================================================= */

function CardCatalogPage({ loading = false }) {
  const [cards, setCards] = useState([]);

  const [dataLoading, setDataLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedCard, setSelectedCard] = useState(null);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");

  /* =======================================================
     LOAD
  ======================================================= */

  const loadCards = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setDataLoading(true);
      }

      setError("");

      const response = await getCardCatalog();

      const data = Array.isArray(response) ? response : [];

      data.sort(sortByName);

      setCards(data);
    } catch (loadError) {
      console.error("Unable to load card catalog:", loadError);

      const message = loadError?.message || "Unable to load card catalog.";

      setError(message);

      toast.error(message);
    } finally {
      setDataLoading(false);

      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  /* =======================================================
     OPEN CREATE
  ======================================================= */

  const handleOpenCreate = () => {
    setSelectedCard(null);

    setModalOpen(true);
  };

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const handleOpenEdit = (card) => {
    setSelectedCard(card);

    setModalOpen(true);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);

    setSelectedCard(null);
  };

  /* =======================================================
     CREATE / UPDATE
  ======================================================= */

  const handleSaveCard = async (values) => {
    if (saving) {
      return;
    }

    try {
      setSaving(true);

      /* ===============================================
           EDIT
        =============================================== */

      if (selectedCard) {
        const updated = await updateCard(selectedCard.id, values);

        if (updated) {
          setCards((current) =>
            current
              .map((card) => (card.id === updated.id ? updated : card))
              .sort(sortByName),
          );
        } else {
          await loadCards({
            silent: true,
          });
        }

        setModalOpen(false);

        setSelectedCard(null);

        toast.success("Card updated successfully.");

        return;
      }

      /* ===============================================
           CREATE
        =============================================== */

      const created = await createCard(values);

      if (created) {
        setCards((current) => [...current, created].sort(sortByName));
      } else {
        await loadCards({
          silent: true,
        });
      }

      setModalOpen(false);

      setSelectedCard(null);

      toast.success("Card added successfully.");
    } catch (saveError) {
      console.error("Unable to save card:", saveError);

      toast.error(saveError?.message || "Unable to save card.");
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (card) => {
    if (!card || deletingId !== null) {
      return;
    }

    const confirmed = await confirmAction({
      title: "Delete card?",

      text: `Delete ${card.name}? Both uploaded images will also be removed from Cloudinary.`,

      confirmText: "Delete card",

      cancelText: "Cancel",
    });

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(card.id);

      await deleteCard(card.id);

      setCards((current) => current.filter((item) => item.id !== card.id));

      toast.success("Card deleted successfully.");
    } catch (deleteError) {
      console.error("Unable to delete card:", deleteError);

      toast.error(deleteError?.message || "Unable to delete card.");
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const keyword = search.trim().toLowerCase();

  const searchedCards = useMemo(
    () =>
      cards.filter((card) =>
        keyword
          ? String(card.name || "")
              .toLowerCase()
              .includes(keyword)
          : true,
      ),
    [cards, keyword],
  );

  /* =======================================================
     GROUP
  ======================================================= */

  const groupedCards = useMemo(
    () => ({
      e_wallet: searchedCards.filter((card) => card.type === "e_wallet"),

      bank: searchedCards.filter((card) => card.type === "bank"),
    }),
    [searchedCards],
  );

  /* =======================================================
     COUNTS
  ======================================================= */

  const totalCounts = useMemo(
    () => ({
      all: cards.length,

      e_wallet: cards.filter((card) => card.type === "e_wallet").length,

      bank: cards.filter((card) => card.type === "bank").length,
    }),
    [cards],
  );

  /* =======================================================
     SECTIONS
  ======================================================= */

  const visibleSections = CARD_SECTIONS.filter(
    (section) => typeFilter === "all" || typeFilter === section.id,
  );

  const noSearchResults =
    Boolean(keyword) &&
    visibleSections.every(
      (section) => (groupedCards[section.id] || []).length === 0,
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading || dataLoading) {
    return <CardCatalogSkeleton />;
  }

  /* =======================================================
     FILTERS
  ======================================================= */

  const filterOptions = [
    {
      id: "all",
      label: "All",
    },

    {
      id: "e_wallet",
      label: "E-Wallet",
    },

    {
      id: "bank",
      label: "Banks",
    },
  ];

  return (
    <>
      <div className="mx-auto w-full max-w-[1800px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <PageHeader
          title="Card Catalog"
          description="Manage the banks and e-wallet providers available for members."
          breadcrumbs={[
            {
              label: "Dashboard",
              href: "/",
            },

            {
              label: "Card Catalog",
            },
          ]}
          actions={
            <>
              <button
                type="button"
                disabled={refreshing}
                onClick={() =>
                  loadCards({
                    silent: true,
                  })
                }
                className="
                  flex
                  h-9
                  items-center
                  justify-center
                  gap-2

                  rounded-lg

                  border
                  border-gray-200

                  bg-white

                  px-3

                  text-[10px]
                  font-medium
                  text-gray-600

                  transition-colors

                  hover:bg-gray-50
                  hover:text-gray-900

                  disabled:opacity-50
                "
              >
                <RefreshCw
                  size={12}
                  strokeWidth={1.7}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="
                  hidden
                  h-9
                  items-center
                  justify-center
                  gap-2

                  rounded-lg

                  bg-black

                  px-4

                  text-[10px]
                  font-medium
                  text-white

                  transition-colors

                  hover:bg-gray-800

                  sm:flex
                "
              >
                <Plus size={13} strokeWidth={1.8} />
                Add card
              </button>
            </>
          }
        />

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[10px] text-red-600">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                loadCards({
                  silent: true,
                })
              }
              className="shrink-0 rounded-md border border-red-200 bg-white px-2.5 py-1 font-medium text-red-600 hover:bg-red-50"
            >
              Try again
            </button>
          </div>
        )}

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* SEARCH */}

          <div className="relative w-full sm:max-w-[340px]">
            <Search
              size={14}
              strokeWidth={1.6}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search cards..."
              className="
                h-9
                w-full

                rounded-lg

                border
                border-gray-200

                bg-white

                pl-9
                pr-9

                text-[11px]
                text-gray-800

                outline-none

                transition-all

                placeholder:text-gray-400

                focus:border-gray-300
                focus:ring-2
                focus:ring-gray-100
              "
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={12} strokeWidth={1.6} />
              </button>
            )}
          </div>

          {/* FILTER */}

          <div
            role="tablist"
            aria-label="Filter cards by type"
            className="inline-flex w-full rounded-lg border border-gray-200 bg-white p-1 sm:w-auto"
          >
            {filterOptions.map((option) => {
              const active = typeFilter === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTypeFilter(option.id)}
                  className={`
                      flex
                      h-7
                      flex-1
                      items-center
                      justify-center
                      gap-1.5

                      rounded-md

                      px-3

                      text-[10px]
                      font-medium

                      transition-all

                      sm:flex-none

                      ${
                        active
                          ? "bg-black text-white"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                >
                  {option.label}

                  <span
                    className={`
                        text-[9px]

                        ${active ? "text-white/60" : "text-gray-400"}
                      `}
                  >
                    {totalCounts[option.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        {noSearchResults ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="max-w-[280px] text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                <Search size={18} strokeWidth={1.5} />
              </div>

              <p className="mt-4 text-[12px] font-semibold text-gray-900">
                No cards found
              </p>

              <p className="mt-1.5 text-[10px] leading-5 text-gray-400">
                Nothing matches "{search.trim()}
                ". Try another name.
              </p>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 h-8 rounded-lg border border-gray-200 bg-white px-3 text-[10px] font-medium text-gray-600 hover:bg-gray-50 hover:text-black"
              >
                Clear search
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {visibleSections.map((section) => (
              <CardSection
                key={section.id}
                section={section}
                cards={groupedCards[section.id] || []}
                deletingId={deletingId}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                onAdd={handleOpenCreate}
                searching={Boolean(keyword)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===================================================
          MOBILE ADD
      =================================================== */}

      <AnimatePresence>
        {!modalOpen && (
          <MobileFloatingAddButton
            label="Add card"
            onClick={handleOpenCreate}
          />
        )}
      </AnimatePresence>

      {/* ===================================================
          ADD / EDIT CARD MODAL
      =================================================== */}

      <AnimatePresence>
        {modalOpen && (
          <CardFormModal
            open={modalOpen}
            card={selectedCard}
            submitting={saving}
            onClose={handleCloseModal}
            onSubmit={handleSaveCard}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default CardCatalogPage;
