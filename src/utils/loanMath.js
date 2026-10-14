import { shiftMonths, todayLocal, daysBetween } from './dates';

const monthlyRate = annualPct => (Number(annualPct)||0) / 1200;

// Standard reducing-balance EMI.
export function calcEmi(principal, annualPct, months) {
  const P = Number(principal)||0, n = Number(months)||0, r = monthlyRate(annualPct);
  if (!P || !n) return 0;
  if (!r) return P / n;
  const f = Math.pow(1+r, n);
  return P * r * f / (f - 1);
}

// Months needed to clear `balance` paying `emi` each month (Infinity if the EMI doesn't cover interest).
export function monthsToClear(balance, annualPct, emi) {
  const r = monthlyRate(annualPct);
  if (balance <= 0) return 0;
  if (!r) return Math.ceil(balance / emi);
  if (emi <= balance * r) return Infinity;
  // Small tolerance so a rounded-down EMI doesn't add a whole month for a few paisa.
  return Math.ceil(-Math.log(1 - r*balance/emi) / Math.log(1+r) - 0.01);
}

// Projected schedule from `balance` onward; extra = additional amount paid every month.
export function schedule(balance, annualPct, emi, fromDate, extra = 0) {
  const r = monthlyRate(annualPct);
  const rows = [];
  let bal = balance, date = fromDate;
  for (let i = 0; bal > 2 && i < 600; i++) {
    const interest = bal * r;
    const pay = Math.min(emi + extra, bal + interest);
    const principal = pay - interest;
    if (principal <= 0) break;
    bal -= principal;
    rows.push({ n:i+1, date, payment:pay, interest, principal, balance:Math.max(0,bal) });
    date = shiftMonths(date, 1);
  }
  return rows;
}

/**
 * Replays the payments actually made against the loan: each payment first covers interest
 * accrued since the previous one, the rest reduces principal.
 */
export function loanStatus(loan) {
  const emi = Number(loan.emi) || calcEmi(loan.principal, loan.rate, loan.tenure);
  const r = monthlyRate(loan.rate);
  const payments = [...(loan.payments||[])].sort((a,b)=>a.date.localeCompare(b.date));
  let balance = Number(loan.principal)||0, interestPaid = 0, principalPaid = 0;
  for (const p of payments) {
    const interest = balance * r;
    const amt = Number(p.amount)||0;
    const toInterest = Math.min(amt, interest);
    interestPaid += toInterest;
    const toPrincipal = Math.min(balance, amt - toInterest);
    principalPaid += toPrincipal;
    balance -= toPrincipal;
  }
  const emiCount = payments.filter(p=>p.kind!=="prepayment").length;
  const nextDue = shiftMonths(loan.startDate, emiCount);
  const today = todayLocal();
  const remainingMonths = monthsToClear(balance, loan.rate, emi);
  const plan = schedule(Number(loan.principal)||0, loan.rate, emi, loan.startDate);
  const totalInterest = plan.reduce((s,x)=>s+x.interest,0);
  const remainingInterest = schedule(balance, loan.rate, emi, nextDue).reduce((s,x)=>s+x.interest,0);
  return {
    emi, balance: Math.max(0,balance), interestPaid, principalPaid,
    paidPct: loan.principal ? principalPaid / loan.principal * 100 : 0,
    emiCount, nextDue, daysToDue: daysBetween(today, nextDue),
    remainingMonths, payoffDate: isFinite(remainingMonths) && remainingMonths>0 ? shiftMonths(nextDue, remainingMonths-1) : null,
    totalInterest, remainingInterest,
    closed: balance <= 2,  // ignore leftover paisa from rounded EMIs
  };
}

// What paying `extra` more each month would save.
export function prepaymentImpact(balance, annualPct, emi, fromDate, extra) {
  const base = schedule(balance, annualPct, emi, fromDate);
  const faster = schedule(balance, annualPct, emi, fromDate, extra);
  const sum = rows => rows.reduce((s,x)=>s+x.interest,0);
  return { monthsSaved: base.length - faster.length, interestSaved: sum(base) - sum(faster), newPayoff: faster.at(-1)?.date };
}

export const npr = n => "NPR " + Math.round(Number(n)||0).toLocaleString("en-IN");
