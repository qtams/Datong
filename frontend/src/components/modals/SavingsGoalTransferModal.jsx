import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Plus, WalletCards, X } from "lucide-react";
import ModalShell from "./ModalShell";
import MoneyInput from "../forms/MoneyInput";
import { formatGoalMoney, moneyToCents, moneyValue, normalizeMoneyInput } from "../../utils/moneyInput";

export default function SavingsGoalTransferModal({ goal, walletBalance, direction, saving, onClose, onTransfer }) {
  const incoming = direction === "in";
  const title = incoming ? "Transfer in" : "Transfer out";
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const walletCents = moneyToCents(walletBalance);
  const goalCents = moneyToCents(goal.currentAmount);
  const amountCents = moneyToCents(moneyValue(amount));
  const available = incoming ? walletCents : goalCents;
  const exceedsBalance = amountCents !== null && available !== null && amountCents > available;
  const canSubmit = amountCents > 0 && !exceedsBalance && available !== null;
  const source = incoming ? "Datong Wallet" : goal.name;
  const destination = incoming ? goal.name : "Datong Wallet";
  const validPreview = canSubmit && walletCents !== null && goalCents !== null;
  const walletAfter = validPreview ? walletCents + (incoming ? -amountCents : amountCents) : walletCents;
  const goalAfter = validPreview ? goalCents + (incoming ? amountCents : -amountCents) : goalCents;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || submitting.current) return;
    if (!canSubmit) {
      setError(exceedsBalance ? `This exceeds the available balance in ${source}.` : "Enter an amount greater than zero.");
      return;
    }
    submitting.current = true;
    setError("");
    try {
      await onTransfer({ direction, amount: moneyValue(amount), version: goal.version });
    } catch (failure) {
      setError(failure?.message || "Unable to transfer money. Try again.");
    } finally {
      submitting.current = false;
    }
  };

  return (
    <ModalShell mobileFullscreen size="max-w-[520px]" labelledBy="goal-transfer-title" onClose={saving ? undefined : onClose}>
      <form onSubmit={handleSubmit} className="flex min-h-[100dvh] flex-col sm:min-h-0">
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <button type="button" disabled={saving} onClick={onClose} aria-label="Back to savings goal" className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2">
            <ArrowLeft size={18} />
          </button>
          <h2 id="goal-transfer-title" className="text-[13px] font-semibold text-gray-950">{title}</h2>
          <button type="button" disabled={saving} onClick={onClose} aria-label="Close transfer" className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2">
            <X size={18} />
          </button>
        </header>

        <div className="flex flex-1 flex-col px-5 pb-6 pt-8 sm:px-8">
          <div className="text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#111111] text-white">
              {incoming ? <Plus size={27} strokeWidth={1.5} /> : <ArrowUpRight size={27} strokeWidth={1.5} />}
            </span>
            <p className="mt-5 text-[21px] font-semibold tracking-[-0.03em] text-gray-950">{incoming ? "Add to your goal" : "Return money to your wallet"}</p>
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-500">
              <span className="max-w-[42%] truncate">{source}</span>
              <ArrowRight size={13} className="shrink-0" aria-hidden="true" />
              <span className="max-w-[42%] truncate">{destination}</span>
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-4 text-[10px] text-gray-500">
              <span className="flex items-center gap-2"><WalletCards size={14} /> Available in {incoming ? "wallet" : "goal"}</span>
              <span className="font-semibold tabular-nums text-gray-900">{formatGoalMoney(incoming ? walletBalance : goal.currentAmount)}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-200/70 pt-3">
              <div><p className="text-[9px] text-gray-400">Wallet after transfer</p><p className="mt-1 text-[12px] font-semibold tabular-nums text-gray-900">{walletAfter === null ? "—" : formatGoalMoney(walletAfter / 100)}</p></div>
              <div className="text-right"><p className="text-[9px] text-gray-400">Goal after transfer</p><p className="mt-1 text-[12px] font-semibold tabular-nums text-gray-900">{goalAfter === null ? "—" : formatGoalMoney(goalAfter / 100)}</p></div>
            </div>
          </div>

          <div className="mt-9">
            <label htmlFor="goal-transfer-amount" className="mb-3 block text-center text-[11px] font-medium text-gray-600">Amount to transfer</label>
            <MoneyInput id="goal-transfer-amount" value={amount} autoFocus disabled={saving} placeholder="0.00" invalid={Boolean(error) || exceedsBalance} describedBy="goal-transfer-feedback" onChange={(value) => { setAmount(normalizeMoneyInput(value)); setError(""); }} />
            <div id="goal-transfer-feedback" className="mt-3 min-h-8 text-center text-[10px]" aria-live="polite">
              {error || exceedsBalance ? <p className="text-red-600">{error || `This exceeds the available balance in ${source}.`}</p> : <p className="text-gray-400">{available === 0 ? `There is no money available in ${source}.` : "Choose an amount within your available balance."}</p>}
            </div>
            <button type="button" disabled={saving || available === 0 || available === null} onClick={() => { setAmount(String(incoming ? walletBalance : goal.currentAmount)); setError(""); }} className="mx-auto block rounded-lg px-3 py-2 text-[10px] font-medium text-gray-700 underline decoration-gray-300 underline-offset-4 hover:text-black disabled:opacity-40">Use full balance</button>
          </div>

          <footer className="mt-auto pt-8 sm:mt-6">
            <button type="submit" disabled={saving || !canSubmit} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-5 text-[12px] font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40">
              {saving ? "Transferring..." : incoming ? "Transfer into goal" : "Transfer to wallet"}
              {!saving && <ArrowRight size={15} />}
            </button>
          </footer>
        </div>
      </form>
    </ModalShell>
  );
}
