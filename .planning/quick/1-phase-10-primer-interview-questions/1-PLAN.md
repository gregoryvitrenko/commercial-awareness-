---
phase: 10-primer-interview-questions
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/primers-data.ts
autonomous: true
requirements:
  - PRIMER-01
  - PRIMER-02

must_haves:
  truths:
    - "All 8 primer pages show 5 interview questions each"
    - "Each new question's skeleton uses the four-part Commercial Reasoning format: Context → Commercial implication → Legal angle → Current hook/your view"
    - "Questions are sector-specific — not generic TC questions that could apply to any primer"
  artifacts:
    - path: "lib/primers-data.ts"
      provides: "2 additional interviewQs entries per primer (8 primers × 2 = 16 new questions)"
      contains: "interviewQs arrays with 5 entries each"
  key_links:
    - from: "lib/primers-data.ts"
      to: "components/PrimerView.tsx"
      via: "primer.interviewQs array rendered in existing Interview Questions block"
      pattern: "interviewQs.*length"
---

<objective>
Add 2 new interview questions to each of the 8 sector primers, bringing each primer from 3 to 5 questions. The 2 new questions per primer must use the Commercial Reasoning skeleton format explicitly: Context → Commercial implication → Legal angle → Current hook/your view.

Purpose: Each primer page currently has 3 questions — the PRIMER-01/02 requirements call for 3-5 sector-specific questions with the Commercial Reasoning format. Adding 2 per primer reaches the upper bound and gives students a richer interview prep resource without runtime cost.

Output: `lib/primers-data.ts` updated with 16 new interviewQs entries (2 per primer). No UI changes — the existing PrimerView.tsx renders any number of interviewQs correctly.
</objective>

<execution_context>
@/Users/gregoryvitrenko/.claude/get-shit-done/workflows/execute-plan.md
@/Users/gregoryvitrenko/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@lib/primers-data.ts
@components/PrimerView.tsx
@lib/types.ts

<interfaces>
<!-- PrimerInterviewQ type from lib/types.ts — executor adds entries conforming to this. -->
```typescript
export interface PrimerInterviewQ {
  question: string;
  /** What the interviewer is assessing with this question */
  whatTheyWant: string;
  /** How to structure a strong answer — 3-4 sentences */
  skeleton: string;
}

export interface Primer {
  // ...
  /** 3 interview questions with answer guidance */
  interviewQs?: PrimerInterviewQ[];
}
```

Current state: every primer already has exactly 3 entries in interviewQs.
Target state: every primer has exactly 5 entries in interviewQs.
No type changes needed. No UI changes needed. Data only.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Author 16 new interview questions (2 per primer) using the Commercial Reasoning skeleton format</name>
  <files>lib/primers-data.ts</files>
  <action>
Append 2 new objects to the `interviewQs` array of each of the 8 primers. All 16 new questions must follow the Commercial Reasoning skeleton structure explicitly: the `skeleton` field must walk through (1) Context — what is happening commercially right now in this sector, (2) Commercial implication — what it means for businesses or deals, (3) Legal angle — what specific legal issues arise, (4) Current hook/your view — a named recent example or your own reasoned opinion.

Questions must be genuinely sector-specific: they should not work if transplanted to a different primer. Avoid generic openers like "What do you know about X?" — questions should be situational or analytical.

Write content for each primer as follows. Do NOT alter the existing 3 questions — only append 2 new ones per primer.

---

PRIMER 1 — M&A (slug: mergers-and-acquisitions)
Add after the existing 3 questions:

Question 4:
  question: "How does the National Security and Investment Act 2021 change the way UK M&A lawyers approach deal planning?"
  whatTheyWant: "Awareness of how regulatory risk has grown beyond competition law — can the candidate connect a specific statute to deal structuring and advise on practical consequences?"
  skeleton: "Context: The NSI Act 2021 introduced mandatory notification for acquisitions in 17 sensitive sectors (including AI, defence, energy, and telecoms) and gave the government power to block or condition deals on national security grounds. Commercial implication: buyers must now factor government approval into deal timelines and MAC clause negotiations, since a blocked deal is a real — not theoretical — risk. Legal angle: lawyers must assess whether a target's activities trigger a notifiable acquisition, advise on the notification process, and draft conditions precedent to cover NSI clearance alongside CMA approval. Current hook/your view: the government's 2023 block of a Chinese-backed acquisition of the Newport Wafer Fab demonstrates the Act is actively used — I think lawyers should treat NSI screening as a standard deal checklist item alongside competition analysis."

Question 5:
  question: "What is warranty and indemnity insurance and how has it changed the negotiating dynamics of M&A transactions?"
  whatTheyWant: "Technical depth beyond textbook knowledge — understanding of a market-standard product that has materially changed how deals are done in practice."
  skeleton: "Context: Warranty and indemnity (W&I) insurance allows an insurer to stand behind a seller's warranties, so a buyer's claim is made against the policy rather than the seller directly. Commercial implication: sellers can achieve a clean exit (receiving full proceeds without retaining holdback or escrow) while buyers still have warranty protection — aligning commercial interests that were previously in tension. Legal angle: lawyers must draft warranties with the insurer's requirements in mind, navigate the disclosure process carefully (known issues are typically excluded from cover), and structure the SPA to interact correctly with the policy. Current hook/your view: W&I is now standard in mid-market European deals — I think it has genuinely improved deal-making by removing the tension between seller cleanness and buyer protection, though underwriting quality varies and buyers should not treat the policy as a substitute for rigorous due diligence."

---

PRIMER 2 — Capital Markets (slug: capital-markets)
Add after the existing 3 questions:

Question 4:
  question: "London has lost ground to New York and Amsterdam as an IPO venue since Brexit — what are the legal and commercial reasons, and do you think the 2024 UKLR reforms will help?"
  whatTheyWant: "Analytical thinking about a live debate in capital markets — the ability to identify multiple causes (legal, commercial, structural) and form a reasoned view rather than reciting facts."
  skeleton: "Context: post-Brexit London saw a string of high-profile companies choose New York (ARM, Arm Holdings) or other venues, citing the depth of the US investor base, dual-class share structures, and legacy premium listing restrictions. Commercial implication: a less liquid IPO market affects valuations, so companies weigh listing venue not just on legal requirements but on where they will get the best price and investor coverage. Legal angle: the 2024 UK Listing Rules (UKLR) removed the premium/standard distinction, permitted dual-class shares for a longer period, and relaxed sponsor requirements — directly responding to founder concerns. Current hook/your view: the reforms are directionally right, but I think legal structure is only one factor — the depth of US technology-sector investor pools is a harder problem to solve, and London's recovery will depend as much on macroeconomic conditions as on listing rule reform."

Question 5:
  question: "What is a green bond and what legal obligations does an issuer take on that differ from a conventional bond?"
  whatTheyWant: "Understanding of a product that now represents a significant share of bond issuance and raises specific legal issues around disclosure and greenwashing liability."
  skeleton: "Context: a green bond is a fixed-income instrument where the issuer commits to allocating proceeds to eligible green projects (renewable energy, energy efficiency, sustainable transport) — issuance has grown sharply as ESG investor mandates expanded. Commercial implication: issuers access a wider investor base and may achieve a 'greenium' (lower yield), but take on ongoing reporting obligations that a conventional bond does not require. Legal angle: lawyers must draft use-of-proceeds covenants, reporting undertakings, and consider alignment with voluntary frameworks (ICMA Green Bond Principles) and, increasingly, mandatory disclosure requirements under UK and EU regulation — greenwashing claims by investors create potential liability under FSMA. Current hook/your view: I think the lack of a single legally binding standard still creates greenwashing risk — the recent FCA scrutiny of ESG fund labelling signals a direction of travel towards stricter legal accountability for green claims in capital markets."

---

PRIMER 3 — Banking & Finance (slug: banking-and-finance)
Add after the existing 3 questions:

Question 4:
  question: "What is a syndicated loan and why would a borrower prefer one over a bilateral loan from a single bank?"
  whatTheyWant: "Commercial understanding of how large debt facilities are structured and the lawyer's role in coordinating a multi-party transaction."
  skeleton: "Context: a syndicated loan is a facility provided by a group of lenders — typically led by an arranger bank — under a single loan agreement, allowing large amounts to be raised that exceed any single bank's appetite or lending limits. Commercial implication: borrowers access a larger quantum of debt and spread their banking relationships; lenders share credit risk and can trade their participations in the secondary market. Legal angle: lawyers must draft the intercreditor mechanics (how lenders vote, what the agent's role is, how conflicts are resolved), the transfer and assignment provisions, and ensure the facility agreement — usually LMA-form — is tailored to the borrower's covenants and representations. Current hook/your view: the LMA's standardised documentation has made syndicated lending more efficient, but I think the agent's role in managing lender disagreements — particularly in restructurings — is underappreciated and is where legal skill is most tested."

Question 5:
  question: "A company in your client's loan agreement is in financial difficulty and has breached a financial covenant — walk me through the options available to the parties."
  whatTheyWant: "The ability to reason through a stressed credit situation — understanding both the legal mechanics and the commercial dynamics between borrower and lender."
  skeleton: "Context: a financial covenant breach (e.g., leverage exceeding an agreed multiple) triggers an event of default, giving lenders the right to accelerate the loan and enforce security — though in practice enforcement is rarely the first response. Commercial implication: lenders must weigh the cost and uncertainty of enforcement against the potential recovery from a consensual restructuring; borrowers need lender support to survive and so have incentive to negotiate. Legal angle: the first step is usually a waiver or amendment (lenders agree not to enforce in exchange for improved economics or tighter terms), potentially followed by a full restructuring under the Part 26A restructuring plan or a scheme of arrangement if the capital structure needs to change. Current hook/your view: I think the UK's restructuring plan — introduced in 2020 and used in cases like Virgin Active — is a powerful tool because cross-class cramdown allows a majority of creditors to bind out-of-the-money dissenting classes, which shifts negotiating leverage significantly."

---

PRIMER 4 — Energy & Tech (slug: energy-and-tech)
Add after the existing 3 questions:

Question 4:
  question: "What legal challenges arise when a technology company seeks to acquire a competitor, and how do regulators in the UK and EU approach these deals differently from traditional M&A?"
  whatTheyWant: "Awareness of how competition law has evolved to address digital markets — and the specific concerns around data, market power, and killer acquisitions."
  skeleton: "Context: regulators are increasingly scrutinising acquisitions by large tech platforms, concerned that incumbents are buying nascent competitors to neutralise threats rather than to achieve genuine synergies — the so-called 'killer acquisition' problem. Commercial implication: even small deals below traditional merger control thresholds can attract review, making deal certainty harder to achieve and requiring earlier regulatory engagement in transaction planning. Legal angle: the CMA's Digital Markets, Competition and Consumers Act 2024 designates Strategic Market Status (SMS) for the largest platforms, giving the CMA new powers; the EU Digital Markets Act creates additional gatekeeper obligations and mandatory notification for certain acquisitions regardless of size. Current hook/your view: I think the UK and EU are right to rethink thresholds based on revenue alone — acquisition value or user base are better proxies for competitive impact in digital markets, and I expect enforcement to intensify as these new regimes bed in."

Question 5:
  question: "How does the UK's planning and consenting process create legal risk for large renewable energy infrastructure projects?"
  whatTheyWant: "Practical understanding of how project development timelines — not just financing or construction — are shaped by legal process, specifically relevant to energy transition deals."
  skeleton: "Context: onshore wind and large-scale solar projects require development consent under the Planning Act 2008 (nationally significant infrastructure projects) or planning permission under the TCPA, with additional environmental impact assessment and habitat regulation requirements. Commercial implication: a project that cannot obtain consent on time, or faces judicial review of a consent decision, creates material cost overruns and potentially kills the investment case — particularly for projects with government contracts (CFD) tied to commissioning deadlines. Legal angle: lawyers advise on the DCO (Development Consent Order) application process, environmental law compliance, landowner negotiations, and any judicial review risk — a challenge by a local authority or environmental group can delay a project by years. Current hook/your view: I think the government's 2024 planning reforms — restoring onshore wind to the NSIP regime and streamlining consenting — are commercially significant because consenting delay, not technology or financing cost, is the main bottleneck to the UK meeting its renewable capacity targets."

---

PRIMER 5 — Regulation (slug: regulation)
Add after the existing 3 questions:

Question 4:
  question: "A financial services firm is launching a new AI-driven credit scoring product in the UK — what regulatory approvals and legal issues should it address before going to market?"
  whatTheyWant: "The ability to apply regulatory thinking to a novel product — identifying the applicable regimes without being prompted, and flagging the interaction between financial regulation and data/AI law."
  skeleton: "Context: an AI credit scoring tool is regulated under both financial services law (as it affects credit decisions under the Consumer Credit Act and FCA Consumer Duty) and data protection law (automated decision-making under the UK GDPR Article 22 where decisions are taken solely by automated means). Commercial implication: the firm must build explainability and human review into the product not just for good practice but as a legal requirement, which affects the product architecture and increases compliance cost. Legal angle: FCA authorisation for credit broking or lending may be required depending on the product's structure; Consumer Duty requires fair outcomes for retail customers; and any automated credit decision must allow the customer to request human review and explanation. Current hook/your view: I think this is a live example of regulatory law struggling to keep pace with AI — the ICO's draft guidance on AI and automated decision-making is helpful but not yet settled, and firms that engage early with the FCA's regulatory sandbox are better positioned to navigate the uncertainty."

Question 5:
  question: "What is the Senior Managers and Certification Regime (SMCR) and why does it matter to lawyers advising regulated financial institutions?"
  whatTheyWant: "Understanding of a significant piece of post-financial crisis regulatory architecture that directly affects how clients structure their governance and how lawyers advise on it."
  skeleton: "Context: SMCR replaced the Approved Persons Regime following the 2008 financial crisis, placing personal accountability on named senior managers for failures in their areas of responsibility — including a duty to take reasonable steps to prevent regulatory breaches. Commercial implication: firms must map responsibilities to named individuals, maintain detailed statements of responsibilities, and ensure their governance structure is documented and defensible — non-compliance carries personal enforcement risk. Legal angle: lawyers advise regulated clients on SMCR implementation (drafting statements of responsibilities, reviewing governance documents), and on enforcement matters where the FCA investigates a senior manager personally — the standard of 'reasonable steps' is fact-specific and case-by-case. Current hook/your view: I think SMCR has genuinely changed the culture of accountability in financial services — cases like the FCA's action against senior managers at Barclays show that personal liability is not just theoretical — and it has created a sustained demand for regulatory lawyers who understand governance as well as rules."

---

PRIMER 6 — Disputes (slug: disputes)
Add after the existing 3 questions:

Question 4:
  question: "What is third-party litigation funding and how has it changed access to justice and the economics of commercial litigation in England?"
  whatTheyWant: "Awareness of a commercially significant development that affects how disputes are financed and how law firms approach case selection — directly relevant to candidates interested in disputes work."
  skeleton: "Context: third-party litigation funding (TPLF) is where a commercial funder — not a party to the case — finances litigation costs in exchange for a share of any recovery, allowing claimants without the resources to fund expensive litigation to bring meritorious claims. Commercial implication: it has enabled large group actions (shareholder claims, competition follow-on damages) that would otherwise be economically unviable, and has created a new asset class of litigation portfolios with institutional investors. Legal angle: solicitors must manage conflicts carefully (the funder's interest in settlement timing may not align with the client's), and the UK Supreme Court's PACCAR judgment (2023) struck down many existing funding agreements as damages-based agreements, creating regulatory uncertainty that is still being resolved. Current hook/your view: I think TPLF is genuinely beneficial for access to justice but the PACCAR ruling has exposed the fragility of an unregulated market — I expect Parliament to legislate to reverse it, as the government consulted on in 2024, which would stabilise the funding market."

Question 5:
  question: "When would a client choose to resolve a dispute through mediation rather than litigation or arbitration, and what is a lawyer's role in that process?"
  whatTheyWant: "Understanding of ADR beyond the textbook definition — specifically the strategic and legal considerations that inform the choice, and when mediation is and is not appropriate."
  skeleton: "Context: mediation is a voluntary, confidential process where an independent mediator facilitates negotiation between the parties — it has no binding outcome unless the parties reach a settlement agreement. Commercial implication: it is significantly cheaper and faster than litigation or arbitration and preserves commercial relationships — for parties who need to continue doing business together (e.g., a joint venture dispute), an imposed judgment can be more damaging than a compromise. Legal angle: courts increasingly require parties to consider ADR before proceeding to trial (following Churchill v Merthyr Tydfil CBC [2023], the Court of Appeal confirmed courts can order a stay for mediation), and a party that refuses mediation unreasonably risks adverse costs consequences even if it wins at trial. Current hook/your view: I think the Churchill judgment is a significant practical shift — it makes ADR engagement a legal risk management issue for litigators, not just a commercial preference — and I expect mediation to become an earlier and more integral part of dispute strategy in England and Wales."

---

PRIMER 7 — International (slug: international)
Add after the existing 3 questions:

Question 4:
  question: "How does a law firm advising on a multi-jurisdictional transaction manage the risk that different governing laws and court systems produce conflicting outcomes?"
  whatTheyWant: "Practical understanding of the complexity of cross-border legal work — the candidate should show they have thought about how international deals are actually managed, not just that different countries have different laws."
  skeleton: "Context: in a deal spanning multiple jurisdictions — say an acquisition of a target with subsidiaries in the UK, Germany, and the US — each jurisdiction's law governs different elements: the share transfer may be governed by English law, the German subsidiary's employment contracts by German law, and any antitrust filing by both CMA and DOJ requirements. Commercial implication: inconsistencies in legal outcomes (e.g., a warranty that is enforceable in England but not in a target jurisdiction) can leave a party without a remedy they thought they had — getting the governing law and jurisdiction clause right is a commercial necessity. Legal angle: lawyers must coordinate local counsel networks, agree a lead jurisdiction for the main transaction documents, and map which elements of the deal each local law governs — the Rome I and Rome II regulations govern choice of law for contracts and torts in the UK (retained post-Brexit). Current hook/your view: I think the coordination challenge is underappreciated — the skill of managing a network of local counsel while keeping the deal on track is something trainees encounter early in international seats, and it requires strong project management as much as legal knowledge."

Question 5:
  question: "What are the legal implications for a UK company that wants to enter a new market in a country with significant political or legal risk — for example, a Gulf state or South-East Asian jurisdiction?"
  whatTheyWant: "Commercial awareness of how UK companies structure international expansion and how lawyers help manage jurisdictional risk — connecting legal advice to business strategy."
  skeleton: "Context: a UK company entering a high-risk jurisdiction must assess political risk (expropriation, currency controls, regulatory change), legal system risk (enforceability of contracts and judgments, rule of law), and regulatory risk (local ownership requirements, sector-specific licensing). Commercial implication: the structure of market entry — whether through a wholly-owned subsidiary, a joint venture with a local partner, or a licensing arrangement — is driven partly by what local law permits and partly by how much control the UK company needs to protect its intellectual property and commercial interests. Legal angle: lawyers advise on: applicable bilateral investment treaties (which give the company recourse to international arbitration if the host state breaches treaty protections), local licensing requirements, data localisation laws, and anti-bribery compliance under the UK Bribery Act 2010 (which has extraterritorial reach). Current hook/your view: I think the Bribery Act is often underestimated as a practical constraint on market entry — the strict liability offence for failure to prevent bribery means that the adequacy of compliance procedures in the new jurisdiction is a legal question, not just a management one."

---

PRIMER 8 — AI & Law (slug: ai-and-law)
Add after the existing 3 questions:

Question 4:
  question: "A client wants to use a large language model to draft first-cut legal documents — what legal and professional responsibility issues should their law firm consider before agreeing?"
  whatTheyWant: "The ability to apply professional regulation and legal risk thinking to a highly topical scenario — demonstrating awareness that AI raises distinct issues for lawyers specifically, not just technology users generally."
  skeleton: "Context: law firms are deploying LLM tools to assist with document drafting, due diligence, and legal research — but the SRA's 2023 guidance makes clear that the use of AI does not reduce solicitors' professional obligations, including accuracy, confidentiality, and the duty not to mislead the court. Commercial implication: a firm that deploys AI tools must invest in quality control workflows to catch hallucinations and errors, and must assess the confidentiality implications of sending client data to external model providers — a commercial risk as well as a regulatory one. Legal angle: the professional responsibility issues include: supervision obligations (a trainee cannot rely on AI output without checking it), confidentiality (client data processed by a third-party AI provider may breach SRA duties without appropriate data processing agreements), and potential liability if incorrect AI-generated output causes client loss. Current hook/your view: I think the SRA's guidance correctly places the accountability on the supervising solicitor — AI is a tool, not a defence — and I expect the professional indemnity insurance market to develop AI-specific underwriting criteria that will create further incentives for firms to invest in oversight protocols."

Question 5:
  question: "How is intellectual property law adapting — or struggling to adapt — to AI-generated content, and what does this mean for commercial clients?"
  whatTheyWant: "Understanding of a live IP law debate with commercial stakes — the candidate should be able to identify the key legal uncertainty and its practical consequences for clients, not just state that 'the law is developing'."
  skeleton: "Context: AI systems generate text, images, code, and music that may be commercially valuable, but UK copyright law requires a human author — the CDPA 1988 s.9(3) provision for computer-generated works is narrow and contested, and there is no settled answer on whether AI training on copyrighted material constitutes infringement. Commercial implication: clients investing in AI-generated content face uncertainty about whether they own what the system produces and whether the training data they used creates infringement liability — this is a live M&A due diligence issue for any acquisition of an AI company. Legal angle: the IPO's 2023 consultation on AI and IP confirmed the government will not create a new sui generis right for AI-generated works; the US Copyright Office has declined to register AI-only works; and litigation in both jurisdictions (Getty Images v Stability AI in the UK; multiple US cases) will shape the law over the next few years. Current hook/your view: I think the lack of a clear ownership regime creates a genuine commercial gap — clients building AI-generated content businesses are operating in legal uncertainty, and I expect the first major court judgment to be a significant commercial event that will either validate or unsettle a large number of existing business models."
  </action>
  <verify>
    <automated>cd /Users/gregoryvitrenko/Documents/Folio && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>lib/primers-data.ts compiles without TypeScript errors and each of the 8 primers has 5 entries in its interviewQs array. TypeScript check passes clean.</done>
</task>

</tasks>

<verification>
After the task completes:
1. TypeScript check: `npx tsc --noEmit` passes with no errors
2. Question count check: each primer's interviewQs array has exactly 5 entries
3. Format check: each new question's skeleton field contains the four Commercial Reasoning parts (Context, Commercial implication, Legal angle, Current hook/your view)
4. Sector specificity: questions are meaningful only in their primer's context — they would not work as generic TC questions
</verification>

<success_criteria>
- All 8 primers have 5 interviewQs entries each (up from 3)
- The 16 new question skeletons explicitly follow the Commercial Reasoning format
- TypeScript compiles cleanly with no type errors
- Questions are demonstrably sector-specific (e.g., M&A questions reference SPAs, NSI Act, W&I insurance — not generic "commercial awareness" questions)
</success_criteria>

<output>
After completion, create `.planning/phases/10-primer-interview-questions/10-01-SUMMARY.md`

Include:
- Files modified: lib/primers-data.ts
- Questions added: 2 per primer, 16 total
- Format used: Commercial Reasoning skeleton (Context → Commercial implication → Legal angle → Current hook/your view)
- TypeScript: compiles clean
</output>
