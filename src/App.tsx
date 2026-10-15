'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { DeployGuide } from '@/components/app/DeployGuide'
import { CollapsedPanel, PanelResizer } from '@/components/app/PanelResizer'
import { MobileFileActions, Toolbar, type ToolbarActions } from '@/components/app/Toolbar'
import { Editor } from '@/components/editor/Editor'
import { ResumePreview } from '@/components/preview/ResumePreview'
import { Segmented } from '@/components/ui/Segmented'
import { IconButton } from '@/components/ui/Button'
import { Monitor, Pencil, Phone, Sidebar } from '@/components/ui/icons'
import { DispatchContext } from '@/hooks/EditorContext'
import { useEditingPath } from '@/hooks/useEditingPath'
import { useEditorPanel } from '@/hooks/useEditorPanel'
import { useResumeStore } from '@/hooks/useResumeStore'
import { sampleResume } from '@/resume/sample'
import type { Resume } from '@/types/resume'
import { downloadBlob } from '@/utils/download'
import { exportWebsite } from '@/utils/exportWebsite'
import { parseResumeJson } from '@/utils/validation'

type Notice = { tone: 'ok' | 'error'; text: string }

const fileSlug = (resume: Resume) =>
  resume.profile.name
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-') || 'resume'

/** Resite: editor on the left, live preview on the right (tabs on small screens). */
export default function App() {
  const { resume, dispatch, save } = useResumeStore()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [pane, setPane] = useState<'edit' | 'preview'>('edit')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const panel = useEditorPanel()
  const editing = useEditingPath()
  const shell = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), notice.tone === 'error' ? 8000 : 4000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const importJson = useCallback(
    async (file: File) => {
      const result = parseResumeJson(await file.text())
      if (!result.ok) return setNotice({ tone: 'error', text: `Couldn't import ${file.name}: ${result.error}` })
      dispatch({ type: 'replace', resume: result.resume })
      setNotice({ tone: 'ok', text: `Imported ${file.name}.` })
    },
    [dispatch],
  )

  if (!resume) return <LoadingShell />

  const actions: ToolbarActions = {
    importJson: (file) => void importJson(file),
    exportJson: () =>
      downloadBlob(new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' }), `${fileSlug(resume)}.resume.json`),
    exportWebsite: async () => {
      try {
        downloadBlob(await exportWebsite(resume), 'resume-website.zip')
        setNotice({ tone: 'ok', text: 'Website downloaded. Open "How to publish" to put it online.' })
      } catch {
        setNotice({ tone: 'error', text: 'Packaging the website failed. Try again, or remove recently uploaded images.' })
      }
    },
    reset: () => {
      dispatch({ type: 'replace', resume: sampleResume })
      setNotice({ tone: 'ok', text: 'Reset to the sample resume.' })
    },
    openGuide: () => setGuideOpen(true),
  }

  return (
    <DispatchContext value={dispatch}>
      <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-paper text-zinc-900">
        <Toolbar save={save} actions={actions} />

        <div className="flex items-center justify-center border-b border-zinc-900/8 px-4 py-2 lg:hidden">
          <Segmented
            label="View"
            value={pane}
            onChange={setPane}
            className="w-full max-w-xs"
            options={[
              { value: 'edit', label: 'Edit', icon: <Pencil /> },
              { value: 'preview', label: 'Preview', icon: <Monitor /> },
            ]}
          />
        </div>

        {notice && (
          <div
            role={notice.tone === 'error' ? 'alert' : 'status'}
            className={`border-b px-5 py-2.5 text-[13px] ${
              notice.tone === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-900'
            }`}
          >
            {notice.text}
          </div>
        )}

        <div
          ref={shell}
          className="flex min-h-0 flex-1"
          style={{ '--editor-w-saved': `${panel.width}px` } as CSSProperties}
        >
          {panel.collapsed && <CollapsedPanel icon={<Sidebar />} onExpand={() => panel.setCollapsed(false)} />}

          <main
            aria-label="Editor"
            {...editing.trackProps}
            className={`relative min-h-0 w-full overflow-y-auto overscroll-contain transition-opacity lg:w-[var(--editor-w,var(--editor-w-saved))] lg:shrink-0 ${
              pane === 'edit' ? 'block' : 'hidden'
            } ${panel.collapsed ? 'lg:hidden' : 'lg:block'}`}
          >
            <div className="sticky top-0 z-10 hidden h-11 items-center justify-between border-b border-zinc-900/6 bg-paper/90 pr-3 pl-5 backdrop-blur-sm sm:pl-8 lg:flex">
              <span className="text-xs font-medium text-zinc-500">Editor</span>
              <IconButton label="Collapse editor" tone="accent" onClick={() => panel.setCollapsed(true)}>
                <Sidebar />
              </IconButton>
            </div>
            <Editor resume={resume} />
            <MobileFileActions actions={actions} />
          </main>

          {!panel.collapsed && (
            <PanelResizer shell={shell} width={panel.width} onResize={panel.setWidth} onCollapse={() => panel.setCollapsed(true)} />
          )}

          <aside
            aria-label="Live preview"
            className={`min-h-0 min-w-0 flex-1 flex-col bg-zinc-100 lg:flex ${pane === 'preview' ? 'flex' : 'hidden'}`}
          >
            <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
              <p className="text-xs text-zinc-500">
                Live Preview <span className="text-zinc-400">· Same as Download</span>
              </p>
              <Segmented
                label="Preview width"
                value={device}
                onChange={setDevice}
                options={[
                  { value: 'desktop', label: 'Desktop', icon: <Monitor /> },
                  { value: 'mobile', label: 'Mobile', icon: <Phone /> },
                ]}
              />
            </div>
            <div className="min-h-0 flex-1 px-3 pb-3 sm:px-5 sm:pb-5">
              <ResumePreview resume={resume} width={device} editing={editing.path} />
            </div>
          </aside>
        </div>

        <DeployGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
      </div>
    </DispatchContext>
  )
}

/** Skeleton matching the two-pane layout, shown for the instant before the saved resume is read. */
function LoadingShell() {
  const bar = 'rounded-md bg-zinc-900/6 motion-safe:animate-pulse'
  return (
    <div className="flex h-[100dvh] flex-col bg-paper" aria-busy="true" aria-label="Loading your resume">
      <div className="h-14 border-b border-zinc-900/8" />
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(26rem,34rem)_1fr]">
        <div className="flex flex-col gap-4 px-8 pt-8 lg:border-r lg:border-zinc-900/8">
          <div className={`${bar} h-4 w-24`} />
          <div className="grid grid-cols-2 gap-3">
            <div className={`${bar} h-9`} />
            <div className={`${bar} h-9`} />
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`${bar} mt-4 h-11`} />
          ))}
        </div>
        <div className="hidden bg-zinc-100 p-5 lg:block">
          <div className="h-full rounded-xl bg-white/70" />
        </div>
      </div>
    </div>
  )
}
