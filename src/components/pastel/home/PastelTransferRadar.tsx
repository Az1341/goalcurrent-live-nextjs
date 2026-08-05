"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { PlTransfersApiResponse } from "@/lib/pl/types";
import styles from "../pastel.module.css";

type ViewState = "loading" | "error" | "empty" | "ready";

export default function PastelTransferRadar() {
  const [view, setView] = useState<ViewState>("loading");
  const [data, setData] = useState<PlTransfersApiResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/pl/transfers", { cache: "no-store" });
        if (!res.ok) throw new Error(`transfers ${res.status}`);
        const body = (await res.json()) as PlTransfersApiResponse;
        if (cancelled) return;
        setData(body);
        setView(body.transfers.length ? "ready" : "empty");
      } catch {
        if (!cancelled) setView("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const transfers = data?.transfers.slice(0, 5) ?? [];

  return (
    <section
      className={styles.widgetCard}
      aria-labelledby="pastel-transfer-heading"
    >
      <div className={styles.widgetHeader}>
        <h2 id="pastel-transfer-heading" className={styles.widgetTitle}>
          Transfer Radar
        </h2>
        <Link href="/premier-league/transfers" className={styles.widgetLink}>
          All moves
        </Link>
      </div>

      {view === "loading" ? (
        <p className={styles.muted}>Scanning transfer feed…</p>
      ) : null}
      {view === "error" ? (
        <p className={styles.muted} role="alert">
          Transfer feed unavailable right now.
        </p>
      ) : null}
      {view === "empty" ? (
        <p className={styles.muted}>
          {data?.error ??
            "No confirmed transfers in the live Premier League feed yet."}
        </p>
      ) : null}

      {view === "ready" ? (
        <ul className={styles.transferList}>
          {transfers.map((transfer, index) => (
            <li
              key={`${transfer.playerId}-${transfer.date ?? index}`}
              className={styles.transferRow}
            >
              <p className={styles.transferPlayer}>{transfer.playerName}</p>
              <p className={styles.transferMeta}>
                {[transfer.fromTeam, transfer.toTeam].filter(Boolean).join(" 뿯↽ ") ||
                  "Club move"}
                {transfer.type ? ` 뿯½ ${transfer.type}` : ""}
              </p>
              {transfer.date ? (
                <p className={styles.transferDate}>
                  {new Date(transfer.date).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
