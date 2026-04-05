'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Database, FileText, LoaderCircle, MessageSquare, Play, Search, Sparkles } from 'lucide-react';

type DocumentKey = 'sales' | 'radiology' | 'policy';
type StageKey = 'idle' | 'parsing' | 'retrieving' | 'answering' | 'complete';

interface RetrievedChunk {
  title: string;
  source: string;
  text: string;
}

interface SampleDocument {
  key: DocumentKey;
  title: string;
  format: string;
  description: string;
  suggestedQuestions: string[];
  chunks: RetrievedChunk[];
  answerSegments: string[];
}

const sampleDocuments: SampleDocument[] = [
  {
    key: 'sales',
    title: 'Q4 Sales Operations Review',
    format: 'PDF + charts',
    description: 'Pipeline, regional performance, and conversion analysis for sales leadership.',
    suggestedQuestions: [
      'Which region underperformed versus plan, and what explanation does the report give?',
      'Summarize the biggest conversion bottleneck and cite the relevant pages.',
      'What follow-up actions would a revenue-ops manager investigate first?',
    ],
    chunks: [
      {
        title: 'Revenue summary',
        source: 'Page 4',
        text: 'North America exceeded plan by 8%, while APAC closed at 82% of target after two enterprise renewals shifted into the next quarter.',
      },
      {
        title: 'Regional variance analysis',
        source: 'Page 7',
        text: 'The report attributes the APAC gap to delayed procurement approvals and a steeper drop in late-stage conversion for enterprise accounts.',
      },
      {
        title: 'Recommended actions',
        source: 'Page 11',
        text: 'Suggested actions include reviewing enterprise deal aging, tightening renewal forecasting, and auditing the approval path for regional legal review.',
      },
    ],
    answerSegments: [
      'APAC is the clearest underperformer in this document. ',
      'The report shows the region closing at 82% of target and links the miss to delayed enterprise renewals plus weaker late-stage conversion. ',
      'A grounded next step would be to inspect enterprise deal aging and the procurement-approval path before changing top-of-funnel spend. ',
      '[Sources: Page 4, Page 7, Page 11]',
    ],
  },
  {
    key: 'radiology',
    title: 'Chest CT Follow-Up Packet',
    format: 'Scanned PDF + narrative text',
    description: 'Radiology notes with mixed layout, findings tables, and physician recommendations.',
    suggestedQuestions: [
      'What are the main findings and which follow-up recommendation is explicitly documented?',
      'Extract the timeline of imaging changes and cite the supporting sections.',
      'Which retrieved chunk best supports the recommendation for another scan?',
    ],
    chunks: [
      {
        title: 'Imaging findings',
        source: 'Page 2',
        text: 'The dominant right-upper-lobe nodule measures 1.8 cm, stable in diameter, with mild interval change in surrounding ground-glass opacity.',
      },
      {
        title: 'Impression and recommendation',
        source: 'Page 3',
        text: 'Recommend repeat low-dose CT in three months to confirm stability of the surrounding opacity and monitor for interval progression.',
      },
      {
        title: 'Clinical comparison note',
        source: 'Page 5',
        text: 'Compared with the prior scan from December, the lesion size is unchanged while the adjacent opacity is slightly more conspicuous.',
      },
    ],
    answerSegments: [
      'The report describes a stable dominant nodule with a slight increase in surrounding ground-glass opacity. ',
      'The explicit follow-up recommendation is a repeat low-dose CT in three months, which is directly supported by the impression section. ',
      'The chronology is grounded in the comparison note that contrasts the current scan with the December study. ',
      '[Sources: Page 2, Page 3, Page 5]',
    ],
  },
  {
    key: 'policy',
    title: 'Insurance Policy Update Brief',
    format: 'PDF + tabular appendix',
    description: 'Policy memo with eligibility changes, effective dates, and exception handling rules.',
    suggestedQuestions: [
      'What changed for eligibility and when does it become effective?',
      'Which exception path still requires manual review?',
      'Summarize the policy update in plain language for an operations analyst.',
    ],
    chunks: [
      {
        title: 'Eligibility change summary',
        source: 'Page 1',
        text: 'The update narrows automatic eligibility to customers with 12 months of payment history and no lapse greater than 30 days.',
      },
      {
        title: 'Effective date',
        source: 'Page 2',
        text: 'All automated checks switch to the revised rules on July 1, while legacy enrollments continue under the old policy until renewal.',
      },
      {
        title: 'Exception workflow',
        source: 'Appendix A',
        text: 'Accounts with reinstated coverage after lapse still require manual review by underwriting before automated approval can proceed.',
      },
    ],
    answerSegments: [
      'The key change is tighter automatic-eligibility logic: customers now need a full year of payment history and no lapse longer than 30 days. ',
      'The new automated rule goes live on July 1, but legacy customers stay on the previous policy until renewal. ',
      'Manual underwriting review still applies to reinstated-coverage cases, so the workflow is not fully automated for every account. ',
      '[Sources: Page 1, Page 2, Appendix A]',
    ],
  },
];

const stageLabels: { key: Exclude<StageKey, 'idle' | 'complete'>; label: string; description: string }[] = [
  {
    key: 'parsing',
    label: 'Parse + chunk',
    description: 'Normalize mixed-layout PDF content into searchable text blocks.',
  },
  {
    key: 'retrieving',
    label: 'Retrieve context',
    description: 'Expose the exact chunks that will ground the final answer.',
  },
  {
    key: 'answering',
    label: 'Generate answer',
    description: 'Compose a cited response from retrieved evidence instead of hallucinated recall.',
  },
];

const stageOrder: StageKey[] = ['idle', 'parsing', 'retrieving', 'answering', 'complete'];

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function MultimodalDocumentRagPreview() {
  const [activeDocument, setActiveDocument] = useState<DocumentKey>('sales');
  const [question, setQuestion] = useState(sampleDocuments[0].suggestedQuestions[0]);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageKey>('idle');
  const [visibleChunkCount, setVisibleChunkCount] = useState(0);
  const [answer, setAnswer] = useState('');
  const [timeline, setTimeline] = useState<string[]>([]);

  const currentDocument =
    sampleDocuments.find((item) => item.key === activeDocument) ?? sampleDocuments[0];

  const handleDocumentSelect = (documentKey: DocumentKey) => {
    const nextDocument =
      sampleDocuments.find((item) => item.key === documentKey) ?? sampleDocuments[0];

    setActiveDocument(documentKey);
    setQuestion(nextDocument.suggestedQuestions[0]);
    setStage('idle');
    setVisibleChunkCount(0);
    setAnswer('');
    setTimeline([]);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;

    let cancelled = false;

    const run = async () => {
      setStage('parsing');
      setVisibleChunkCount(0);
      setAnswer('');
      setTimeline([
        `Loaded ${currentDocument.title} into the sandbox workspace.`,
        'Prepared the document for parsing and chunking.',
      ]);

      await wait(550);
      if (cancelled) return;

      setTimeline((prev) => [...prev, 'Chunked the document and created retrieval-ready context blocks.']);
      setStage('retrieving');

      for (let index = 0; index < currentDocument.chunks.length; index += 1) {
        await wait(420);
        if (cancelled) return;
        setVisibleChunkCount(index + 1);
        setTimeline((prev) => [
          ...prev,
          `Retrieved ${currentDocument.chunks[index].title} from ${currentDocument.chunks[index].source}.`,
        ]);
      }

      setStage('answering');
      setTimeline((prev) => [...prev, 'Composing a grounded answer with explicit source citations.']);

      for (const segment of currentDocument.answerSegments) {
        await wait(340);
        if (cancelled) return;
        setAnswer((prev) => prev + segment);
      }

      if (cancelled) return;

      setTimeline((prev) => [...prev, 'Preview completed. The answer stayed anchored to retrieved evidence.']);
      setStage('complete');
      setRunning(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [currentDocument, running]);

  return (
    <div className="not-prose my-8 overflow-hidden rounded-[28px] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[0_12px_50px_var(--color-glow-green)]">
      <div className="border-b border-[var(--color-border-default)] bg-[linear-gradient(135deg,rgba(212,165,116,0.12),rgba(127,188,140,0.08))] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-amber-300)]/20 bg-[var(--color-amber-300)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-amber-300)]">
              <Sparkles className="h-3.5 w-3.5" />
              Interactive Preview
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
              Explore the retrieval workflow
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              This sandbox walks through the product flow that matters most in a document RAG system:
              choosing a document, inspecting retrieved chunks, and watching the grounded answer stay tied
              to explicit evidence.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRunning(true)}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-green-300)]/30 bg-[var(--color-green-300)]/14 px-4 py-2.5 text-sm font-medium text-[var(--color-green-300)] transition-colors hover:border-[var(--color-green-300)]/55 hover:bg-[var(--color-green-300)]/18 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? 'Running retrieval flow' : 'Run retrieval demo'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Sample document library
            </p>
            <div className="grid gap-3">
              {sampleDocuments.map((document) => (
                <button
                  key={document.key}
                  type="button"
                  onClick={() => handleDocumentSelect(document.key)}
                  className={`rounded-[24px] border p-4 text-left transition-colors ${
                    activeDocument === document.key
                      ? 'border-[var(--color-amber-300)]/35 bg-[var(--color-amber-300)]/12'
                      : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/45 hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {document.title}
                      </h4>
                      <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                        {document.description}
                      </p>
                    </div>
                    <span className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                      {document.format}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Grounded question
              </p>
              <span className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {currentDocument.format}
              </span>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {currentDocument.suggestedQuestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuestion(item)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    question === item
                      ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/14 text-[var(--color-green-300)]'
                      : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="min-h-[140px] w-full resize-none rounded-2xl border border-[var(--color-border-default)] bg-transparent px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)] outline-none transition-colors focus:border-[var(--color-green-300)]/35"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {stageLabels.map((item) => {
              const currentIndex = stageOrder.indexOf(stage);
              const itemIndex = stageOrder.indexOf(item.key);
              const isActive = stage === item.key;
              const isComplete = currentIndex > itemIndex;

              return (
                <div
                  key={item.key}
                  className={`rounded-[22px] border p-4 transition-colors ${
                    isActive
                      ? 'border-[var(--color-green-300)]/35 bg-[var(--color-green-300)]/10'
                      : isComplete
                        ? 'border-[var(--color-amber-300)]/30 bg-[var(--color-amber-300)]/10'
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-card)]/40'
                  }`}
                >
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Retrieval inspector
                </p>
                <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                  Retrieved chunks
                </h4>
              </div>
              <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {visibleChunkCount}/{currentDocument.chunks.length}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {currentDocument.chunks.slice(0, visibleChunkCount).map((chunk) => (
                <div
                  key={`${chunk.source}-${chunk.title}`}
                  className="rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-[var(--color-green-300)]" />
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {chunk.title}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">{chunk.source}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {chunk.text}
                  </p>
                </div>
              ))}

              {visibleChunkCount === 0 && (
                <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] px-4 py-6 text-sm leading-6 text-[var(--color-text-muted)]">
                  Run the preview to reveal the exact chunks used to answer the question.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Grounded answer
                </p>
                <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                  Response with citations
                </h4>
              </div>
              <div className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                {stage === 'complete' ? 'Ready' : stage === 'idle' ? 'Waiting' : 'Running'}
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-[var(--color-border-default)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4">
              <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-green-300)]" />
                retrieval grounded
              </div>
              <p className="rounded-2xl border border-[var(--color-border-default)] bg-black/10 p-4 text-sm leading-7 text-[var(--color-text-secondary)] min-h-[180px]">
                {answer || 'Choose a sample document, keep the question visible, and run the preview to watch retrieval and answer generation unfold step by step.'}
                {running && stage === 'answering' && (
                  <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-[var(--color-green-300)]/70 align-middle" />
                )}
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)]/45 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Sandbox telemetry
                </p>
                <h4 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                  Product flow checkpoints
                </h4>
              </div>
              <Sparkles className="h-4 w-4 text-[var(--color-amber-300)]" />
            </div>

            <div className="mt-5 grid gap-3">
              <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border-default)] px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <FileText className="h-4 w-4 text-[var(--color-amber-300)]" />
                  Mixed-layout document intake
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)]" />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border-default)] px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Database className="h-4 w-4 text-[var(--color-green-300)]" />
                  Retrieval chunk visibility
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)]" />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border-default)] px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <MessageSquare className="h-4 w-4 text-[var(--color-green-300)]" />
                  Answer grounded by cited context
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)]" />
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-[var(--color-border-default)] bg-black/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Activity log
              </p>
              <div className="mt-4 space-y-3">
                {timeline.length > 0 ? (
                  timeline.map((item) => (
                    <p key={item} className="text-sm leading-6 text-[var(--color-text-secondary)]">
                      {item}
                    </p>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                    The sandbox log will show how the document moves from upload to retrieval-backed answer generation.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
