"use client";

import { useId, useState, useSyncExternalStore } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { Minus, Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { FaqItem } from "@/content/faq";

/*
 * FAQ chat accordion, adapted from the 21st.dev "faq-chat-accordion"
 * component: each question is a bubble, its answer a reply bubble beneath it.
 * Changes from the original: AKSH tokens with no shadows, numbered H3
 * questions with a plus/minus at the right edge (the whole row toggles),
 * full-width answers indented under their question instead of max-w-xs, no
 * timestamps or emoji, Motion (motion/react) in place of framer-motion, and
 * closed answers hidden from assistive technology rather than only faded out.
 */

// Opening/closing time and curve (the --ease-standard token).
const DURATION = 0.3;
const EASE = [0.2, 0, 0, 1] as const;

const QUESTION_BUBBLE =
  "w-full min-h-(--target-min-size) px-20 py-16 tablet:px-24 rounded-quote-card rounded-bl-bubble-tail border border-warm-stone bg-warm-stone/40 text-left cursor-pointer transition-colors duration-standard ease-standard hover:border-control-outline";
const QUESTION_ROW = "flex items-center gap-16";

function QuestionRow({ item }: { item: FaqItem }) {
  return (
    <>
      <span data-faq-number className="shrink-0 font-ui text-label text-muted-text tabular-nums">
        {item.number}
      </span>
      <span className="flex-1 font-ui text-body font-weight-semibold text-soft-charcoal">{item.question}</span>
      <span
        aria-hidden="true"
        className="ml-auto grid size-32 shrink-0 place-items-center rounded-circle border border-control-outline text-soft-charcoal"
      >
        <Plus aria-hidden="true" strokeWidth={1.5} className="size-16 group-data-[state=open]/faq:hidden group-open/faq:hidden" />
        <Minus aria-hidden="true" strokeWidth={1.5} className="hidden size-16 group-data-[state=open]/faq:block group-open/faq:block" />
      </span>
    </>
  );
}

/** The reply bubble: charcoal, ivory text, set in from the question. */
function AnswerBubble({ item }: { item: FaqItem }) {
  return (
    <div className="pt-8 pl-(--faq-answer-indent)">
      <p
        data-faq-answer
        className="px-20 py-16 tablet:px-24 tablet:py-20 rounded-quote-card rounded-tl-bubble-tail bg-soft-charcoal font-body text-body text-brand-ivory"
      >
        {item.answer.map((run, index) =>
          run.bold ? (
            <strong key={index} className="font-bold">
              {run.text}
            </strong>
          ) : (
            <span key={index}>{run.text}</span>
          )
        )}
      </p>
    </div>
  );
}

/**
 * One answer region. It stays mounted so the question's aria-controls always
 * points at it, but is `hidden` (out of the accessibility tree and tab order)
 * once closed, and inert while it closes. Height animates in about 300ms;
 * reduced motion changes state immediately.
 */
function AnswerPanel({ item, open, id }: { item: FaqItem; open: boolean; id: string }) {
  const reduceMotion = useReducedMotion();
  const [settledClosed, setSettledClosed] = useState(!open);
  // Opening shows the region at once; closing hides it when the animation ends.
  if (open && settledClosed) setSettledClosed(false);
  const hidden = !open && (settledClosed || Boolean(reduceMotion));

  return (
    <Accordion.Content id={id} forceMount hidden={hidden} inert={!open || undefined} data-faq-panel>
      <motion.div
        initial={false}
        animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : DURATION, ease: EASE }}
        onAnimationComplete={() => {
          if (!open) setSettledClosed(true);
        }}
        className="overflow-hidden"
      >
        <AnswerBubble item={item} />
      </motion.div>
    </Accordion.Content>
  );
}

/** With JavaScript: Radix Accordion, one answer open at a time, all closable. */
function ChatAccordion({ items }: { items: readonly FaqItem[] }) {
  const [value, setValue] = useState("");

  return (
    <Accordion.Root
      type="single"
      collapsible
      value={value}
      onValueChange={setValue}
      data-faq
      data-faq-mode="accordion"
      className="flex flex-col gap-16"
    >
      {items.map((item) => (
        <ChatAccordionItem key={item.number} item={item} open={value === item.number} />
      ))}
    </Accordion.Root>
  );
}

/**
 * Radix names the answer in aria-controls only while it is open (its closed
 * content is normally unmounted). This answer is always mounted, so the
 * question names it in every state.
 */
function ChatAccordionItem({ item, open }: { item: FaqItem; open: boolean }) {
  const panelId = useId();

  return (
    <Accordion.Item value={item.number} data-faq-item>
      <Accordion.Header asChild>
        <h3>
          <Accordion.Trigger aria-controls={panelId} className={`group/faq ${QUESTION_BUBBLE} ${QUESTION_ROW}`}>
            <QuestionRow item={item} />
          </Accordion.Trigger>
        </h3>
      </Accordion.Header>
      <AnswerPanel id={panelId} item={item} open={open} />
    </Accordion.Item>
  );
}

/**
 * Without JavaScript (and in the server markup): native disclosures sharing
 * one name, so opening one closes the others. Replaced by the accordion once
 * the page is interactive; both start closed and look the same.
 */
function StaticDisclosures({ items }: { items: readonly FaqItem[] }) {
  return (
    <div data-faq data-faq-mode="static" className="flex flex-col gap-16">
      {items.map((item) => (
        <details key={item.number} name="aksh-faq" data-faq-item className="group/faq">
          <summary className={`block list-none [&::-webkit-details-marker]:hidden ${QUESTION_BUBBLE}`}>
            <h3 className={QUESTION_ROW}>
              <QuestionRow item={item} />
            </h3>
          </summary>
          <AnswerBubble item={item} />
        </details>
      ))}
    </div>
  );
}

const subscribe = () => () => {};

/** The six questions: native disclosures until hydrated, then the accordion. */
export function FaqChatAccordion({ items }: { items: readonly FaqItem[] }) {
  const interactive = useSyncExternalStore(subscribe, () => true, () => false);
  return interactive ? <ChatAccordion items={items} /> : <StaticDisclosures items={items} />;
}
