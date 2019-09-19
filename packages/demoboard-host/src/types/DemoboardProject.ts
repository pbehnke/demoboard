/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { Doc, Text } from 'automerge'
import {
  EditorChange as CodeMirrorChange,
  Doc as CodeMirrorDoc,
} from 'codemirror'
import { DemoboardGeneratedFile } from './DemoboardGeneratedFile'
import { DemoboardHistory } from './DemoboardHistory'
import { DemoboardPanelType } from './DemoboardPanelType'

export interface DemoboardProject<
  PanelType extends DemoboardPanelType = DemoboardPanelType
> {
  config: DemoboardProjectConfig<PanelType>

  dispatch: (action: DemoboardProjectAction<PanelType>) => void

  /**
   * If this project's persisted data has changed substantially and some time
   * in the past, and our local copy has also changed without reflecting those
   * changes, then the persisted version will be placed here. The user will
   * then need to decide which version to use.
   */
  divergedPersistedData: null | DemoboardProjectData

  id: string | null

  state: DemoboardProjectState<PanelType>
}

export interface DemoboardProjectConfig<
  PanelType extends DemoboardPanelType = DemoboardPanelType
> {
  /**
   * Specifies which template's files are currently being preferred over the
   * active files by the build system -- if any.
   */
  initialActiveTemplate?: string

  /**
   * Allows you to remove individual static source templates from the default
   * open tabs.
   */
  initialClosedTabs?: string[]

  /**
   * Allows you to specify hard version numbers for dependencies in your app.
   */
  initialDependencies?: {
    [packageName: string]: string
  }

  /**
   * Specifies how to transform the project into a zip file for export.
   *
   * The exporter should be specified as an object, whose `type` names a package
   * with a function as its default export, and `props` is passed to that function
   * as its first argument.
   */
  initialExporter?: {
    type: string
    props?: any
  }

  /**
   * If true, when viewing missing URLs, the build system render an index
   * at the project root if one exists. This is useful for building demos
   * using the browser History API.
   */
  initialFallbackToRootIndex?: boolean

  /**
   * Allows you to add individual automatically generated sources to the default
   * open tabs.
   */
  initialGeneratedTabs?: string[]

  /**
   * An immutable object containing the history of the preview window. The
   * latest value of the history is used to compute the entry point.
   */
  initialHistory?: DemoboardHistory

  /**
   * A list of pathnames which the build system will look for when viewing
   * a directory index.
   */
  initialIndexPathnames: string[]

  /**
   * Includes things like name, description, author.
   */
  initialMetadata?: any

  /**
   * Specify packages/modules that should be mocked with other packages/modules.
   */
  initialMocks?: { [pathname: string]: string }

  /**
   * A list of panel types that should be visible, ordered from least to most
   * important. It's up to the layout to decide what to actually display based
   * on this list.
   */
  initialPanelPriorityOrder?: PanelType[]

  /**
   * The currently active editor tab.
   */
  initialSelectedTab?: string

  /**
   * The initial sources, including both automatically generated sources, and
   * constant strings.
   */
  initialSources: { [pathname: string]: string | DemoboardGeneratedFile }

  /**
   * Allows you to specify the complete list of initially opened tabs. By
   * default, this will include all constant sources.
   */
  initialTabs?: string[]

  /**
   * Specifies templates which can be copied into the source, or built as a
   * preview. By default, the initial sources will be added under the key
   * `initial`.
   */
  initialTemplates?: {
    [templateName: string]: {
      [pathname: string]: string | DemoboardGeneratedFile
    }
  }

  /**
   * Allows you to set the history by providing just the initial URL.
   */
  initialURL?: string
}

export interface DemoboardProjectState<
  PanelType extends DemoboardPanelType = DemoboardPanelType
> {
  /**
   * Holds state for editors for individual sources.
   */
  unpersistedCodeMirrorDocs: { [pathname: string]: any }
  data: DemoboardProjectData
  view: DemoboardProjectView<PanelType>
}

export interface DemoboardProjectDataSnapshot {
  dependencies: {
    [packageName: string]: string
  }
  exporter: null | {
    type: string
    props?: any
  }
  fallbackToRootIndex: boolean
  generatedSources: {
    [pathname: string]: DemoboardGeneratedFile
  }
  indexPathnames: string[]
  metadata: {
    [key: string]: Text
  }
  mocks: {
    [pathname: string]: string
  }
  sources: {
    [pathname: string]: Text
  }
  templates: {
    [templateName: string]: {
      [pathname: string]: string | DemoboardGeneratedFile
    }
  }
}

export interface DemoboardProjectViewSnapshot<
  PanelType extends DemoboardPanelType = DemoboardPanelType
> {
  activeTemplate: null | string
  history: DemoboardHistory
  locationBar: string
  panelPriorityOrder: PanelType[]
  selectedTab: null | string
  tabs: string[]
}

export type DemoboardProjectData = Doc<DemoboardProjectDataSnapshot>

export type DemoboardProjectView<
  PanelType extends DemoboardPanelType = DemoboardPanelType
> = Doc<DemoboardProjectViewSnapshot<PanelType>>

export type DemoboardProjectSourcesAction =
  | {
      // Unlike upsert, this will also open and select a new tab for the new
      // file. If a generated file is supplied, a generated file will be created
      // (as opposed to running the generator and adding the source itself)
      type: 'sources.create'
      userId: null | string
      pathname: string
      source: string | DemoboardGeneratedFile
      codeMirrorDoc?: CodeMirrorDoc
    }
  | {
      // If changing a generated file, it'll be changed to a static file by
      // looking at the supplied code mirror doc. If you just want to make a
      // file static without actually changing anything, you can supply an empty
      // change array.
      type: 'sources.change'
      userId: null | string
      pathname: string
      codeMirrorChanges: CodeMirrorChange[]
      codeMirrorDoc: CodeMirrorDoc
    }
  | {
      // Deletes the specified source or generated soucre, and closes the tab
      // if it was open.
      type: 'sources.delete'
      userId: null | string
      pathname: string
    }
  | {
      // Can add or update files, but will not change the current tab.
      // If a generated file is supplied, a generated file will be created
      // (as opposed to running the generator and adding the source itself)
      type: 'sources.merge'
      userId: null | string
      files: {
        [pathname: string]: {
          source: string | DemoboardGeneratedFile
          codeMirrorDoc?: CodeMirrorDoc
        }
      }
    }
  | {
      // Replaces all of the existing sources with the specified sources.
      // Will attempt to keep current tab open, but if it no longer exists,
      // will change to another tab automatically.
      type: 'sources.replace'
      userId: null | string
      files: {
        [pathname: string]: {
          source: string | DemoboardGeneratedFile
          codeMirrorDoc?: CodeMirrorDoc
        }
      }
    }

export type DemoboardProjectHistoryAction =
  | {
      type: 'history.set'
      userId: null | string
      history: DemoboardHistory
    }
  | {
      type: 'history.setLocationBar'
      userId: null | string
      value: string
    }
  | {
      type: 'history.traverse'
      userId: null | string
      count: number
    }
  | {
      type: 'history.refresh'
      userId: null | string
      count: number
    }
  | {
      type: 'history.go'
      userId: null | string
      url?: string
    }

export type DemoboardProjectPanelsAction<
  PanelType extends DemoboardPanelType = DemoboardPanelType
> =
  | {
      type: 'panels.prioritize'
      userId: null | string
      panel: PanelType
    }
  | {
      type: 'panels.deprioritize'
      userId: null | string
      panel: PanelType
    }
  | {
      type: 'panels.remove'
      userId: null | string
      panel: PanelType
    }

export type DemoboardProjectTabsAction =
  | {
      type: 'tabs.close'
      userId: null | string
      pathname: string
    }
  | {
      type: 'tabs.open'
      userId: null | string
      pathname: string
    }
  | {
      type: 'tabs.select'
      userId: null | string
      pathname: string
    }
  | {
      type: 'tabs.set'
      userId: null | string
      pathnames: string[]
      selectedPathname?: string | null
    }

export type DemoboardProjectAction<
  PanelType extends DemoboardPanelType = DemoboardPanelType
> =
  | DemoboardProjectSourcesAction
  | DemoboardProjectHistoryAction
  | DemoboardProjectPanelsAction<PanelType>
  | DemoboardProjectTabsAction
  | {
      type: 'activeTemplate.set'
      userId: null | string
      activeTemplate: string | null
    }
  | {
      type: 'dependencies.set'
      userId: null | string
      dependencies: {
        [key: string]: string
      }
    }
  | {
      type: 'metadata.set'
      userId: null | string
      metadata: {
        [key: string]: Text
      }
    }
  | {
      type: 'reset'
      userId: null | string
      state: DemoboardProjectState<PanelType>
    }

export type DemoboardProjectActions<
  PanelType extends DemoboardPanelType = DemoboardPanelType
> = {
  addSource: (pathname: string, initialContent?: string) => void
  changeSource: (
    pathname: string,
    changes: CodeMirrorChange[],
    codeMirrorDoc: CodeMirrorDoc,
  ) => void
  deleteSource: (pathname: string) => void
  replaceSources: (changes: {
    [pathname: string]: {
      source: string
      editorModel?: any
    }
  }) => void

  closeTab: (pathname?: string) => void
  openTab: (pathname: string) => void
  selectTab: (pathname: string) => void
  setTabs: (pathnames: string[]) => void

  setMetadata: (metadata: { [key: string]: string }) => void

  setHistory: (history: DemoboardHistory) => void
  historyGo: (distance: number) => void
  historyPush: (url: string) => void

  prioritizePanel: (panel: PanelType) => void
  deprioritizePanel: (panel: PanelType) => void
  removePanelPriority: (panel: PanelType) => void
}
